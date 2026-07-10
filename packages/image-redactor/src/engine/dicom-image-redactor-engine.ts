import type { AnalyzeOptions } from "@defend-tech/presidio-analyzer";
import type { DataSet } from "dicom-parser";
import type { Bbox, ImageConfig } from "../entities.js";
import { BboxProcessor } from "../processing/bbox-processor.js";
import { ImageAnalyzerEngine } from "./image-analyzer-engine.js";

/** DICOM image redaction for uncompressed 8-bit pixel data parsed by dicom-parser. */
export class DicomImageRedactorEngine {
  constructor(readonly imageAnalyzerEngine = new ImageAnalyzerEngine()) {}

  async redactAndReturnBboxes(
    dicom: Uint8Array | DataSet,
    config: ImageConfig = {},
    options: AnalyzeOptions = {},
  ): Promise<{ dicom: Uint8Array; bboxes: Bbox[] }> {
    const dataSet = isDataSet(dicom) ? dicom : await parseDicom(dicom);
    const bytes = new Uint8Array(dataSet.byteArray);
    const pixelData = dataSet.elements.x7fe00010;
    const rows = dataSet.uint16("x00280010");
    const columns = dataSet.uint16("x00280011");
    const bitsAllocated = dataSet.uint16("x00280100");
    const samplesPerPixel = dataSet.uint16("x00280002") ?? 1;
    if (
      !pixelData ||
      !rows ||
      !columns ||
      bitsAllocated !== 8 ||
      pixelData.encapsulatedPixelData
    ) {
      throw new Error("DICOM redaction supports uncompressed 8-bit pixel data only");
    }

    const canvas = await imageFromDicom(
      bytes,
      pixelData.dataOffset,
      rows,
      columns,
      samplesPerPixel,
    );
    const results = await this.imageAnalyzerEngine.analyze(canvas, config, options);
    const bboxes = BboxProcessor.removePadding(results, config.paddingWidth ?? 0);
    const fill = selectFill(bytes, pixelData.dataOffset, pixelData.length, config.fill);
    for (const box of bboxes)
      redactPixels(
        bytes,
        pixelData.dataOffset,
        rows,
        columns,
        samplesPerPixel,
        box,
        fill,
      );
    return { dicom: bytes, bboxes };
  }

  async redact(
    dicom: Uint8Array | DataSet,
    config: ImageConfig = {},
    options: AnalyzeOptions = {},
  ): Promise<Uint8Array> {
    return (await this.redactAndReturnBboxes(dicom, config, options)).dicom;
  }
}

async function parseDicom(bytes: Uint8Array): Promise<DataSet> {
  // dicom-parser is CommonJS. A namespace import keeps both packed ESM and CJS
  // consumers interoperable without emitting a named ESM import for it.
  const module = await import("dicom-parser");
  return module.parseDicom(bytes);
}

async function imageFromDicom(
  bytes: Uint8Array,
  offset: number,
  rows: number,
  columns: number,
  samples: number,
): Promise<HTMLCanvasElement | OffscreenCanvas> {
  const { ImageProcessingEngine } = await import(
    "../processing/image-processing-engine.js"
  );
  const canvas = await ImageProcessingEngine.createCanvas(columns, rows);
  const context = ImageProcessingEngine.context(canvas);
  const image = context.createImageData(columns, rows);
  for (let pixel = 0; pixel < rows * columns; pixel += 1) {
    const source = offset + pixel * samples;
    const target = pixel * 4;
    image.data[target] = bytes[source];
    image.data[target + 1] = bytes[source + Math.min(1, samples - 1)];
    image.data[target + 2] = bytes[source + Math.min(2, samples - 1)];
    image.data[target + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  return canvas;
}

function redactPixels(
  bytes: Uint8Array,
  offset: number,
  rows: number,
  columns: number,
  samples: number,
  box: Bbox,
  fill: number[],
): void {
  const left = Math.max(0, Math.floor(box.left));
  const top = Math.max(0, Math.floor(box.top));
  const right = Math.min(columns, Math.ceil(box.left + box.width));
  const bottom = Math.min(rows, Math.ceil(box.top + box.height));
  for (let y = top; y < bottom; y += 1)
    for (let x = left; x < right; x += 1) {
      const start = offset + (y * columns + x) * samples;
      for (let channel = 0; channel < samples; channel += 1)
        bytes[start + channel] = fill[channel] ?? fill[0];
    }
}

function selectFill(
  bytes: Uint8Array,
  offset: number,
  length: number,
  fill: ImageConfig["fill"],
): number[] {
  if (typeof fill === "object" && fill) return [fill.r, fill.g, fill.b, fill.a ?? 255];
  if (typeof fill === "string" && fill !== "contrast" && fill !== "background")
    return [0];
  const sample = bytes.slice(offset, offset + length);
  const counts = new Map<number, number>();
  for (const value of sample) counts.set(value, (counts.get(value) ?? 0) + 1);
  const background = [...counts].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 0;
  return [fill === "background" ? background : 255 - background];
}

function isDataSet(value: Uint8Array | DataSet): value is DataSet {
  return "elements" in value;
}
