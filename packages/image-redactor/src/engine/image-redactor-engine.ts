import type { AnalyzeOptions } from "@presidio/analyzer";
import type { ImageConfig, ImagePixel, ImageSource } from "../entities.js";
import { RecognizerResult } from "../entities.js";
import { ImageProcessingEngine } from "../processing/image-processing-engine.js";
import { ImageAnalyzerEngine } from "./image-analyzer-engine.js";

/** Performs OCR, PII detection, then paints each detected word's bounding box. */
export class ImageRedactorEngine {
  constructor(readonly imageAnalyzerEngine = new ImageAnalyzerEngine()) {}

  async redactAndReturnBboxes(
    image: ImageSource,
    config: ImageConfig = {},
    options: AnalyzeOptions = {},
  ): Promise<{ image: HTMLCanvasElement | OffscreenCanvas; bboxes: RecognizerResult[] }> {
    const canvas = await ImageProcessingEngine.toCanvas(image);
    const bboxes = await this.imageAnalyzerEngine.analyze(canvas, config, options);
    const context = ImageProcessingEngine.context(canvas);
    context.fillStyle = fill(config.fill ?? "#000000");
    for (const box of bboxes) context.fillRect(box.left, box.top, box.width, box.height);
    return { image: canvas, bboxes };
  }

  async redact(image: ImageSource, config: ImageConfig = {}, options: AnalyzeOptions = {}): Promise<HTMLCanvasElement | OffscreenCanvas> {
    return (await this.redactAndReturnBboxes(image, config, options)).image;
  }
}

function fill(value: string | ImagePixel): string {
  return typeof value === "string" ? value : `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a ?? 255})`;
}
