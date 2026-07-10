import { parseDicom, type DataSet } from "dicom-parser";
import type { AnalyzeOptions } from "@presidio/analyzer";
import type { Bbox, ImageConfig } from "../entities.js";
import { DicomImageRedactorEngine } from "./dicom-image-redactor-engine.js";

/** Finds and returns DICOM image PII boxes without modifying its pixel data. */
export class DicomPiiVerifyEngine {
  constructor(private readonly redactor = new DicomImageRedactorEngine()) {}

  async verify(dicom: Uint8Array | DataSet, config: ImageConfig = {}, options: AnalyzeOptions = {}): Promise<{ bboxes: Bbox[]; hasPii: boolean }> {
    const dataSet = isDataSet(dicom) ? dicom : parseDicom(dicom);
    const copy = new Uint8Array(dataSet.byteArray);
    const result = await this.redactor.redactAndReturnBboxes(copy, config, options);
    return { bboxes: result.bboxes, hasPii: result.bboxes.length > 0 };
  }
}

function isDataSet(value: Uint8Array | DataSet): value is DataSet {
  return "elements" in value;
}
