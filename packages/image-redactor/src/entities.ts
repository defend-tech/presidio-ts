import { RecognizerResult as TextRecognizerResult } from "@defend-tech/presidio-core";

/** A color used by Canvas image data and redaction fills. */
export interface ImagePixel {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/** A rectangular region in image pixel coordinates. */
export interface Bbox {
  left: number;
  top: number;
  width: number;
  height: number;
  label?: string;
  entityType?: string;
  score?: number;
  isPii?: boolean;
}

/** A text recognizer result associated with one OCR word's bounding box. */
export class RecognizerResult extends TextRecognizerResult implements Bbox {
  left: number;
  top: number;
  width: number;
  height: number;

  constructor(
    entityType: string,
    start: number,
    end: number,
    score: number,
    left: number,
    top: number,
    width: number,
    height: number,
  ) {
    super(entityType, start, end, score);
    this.left = left;
    this.top = top;
    this.width = width;
    this.height = height;
  }
}

/** Options shared by image analysis and redaction operations. */
export interface ImageConfig {
  language?: string;
  entities?: string[];
  allowList?: string[];
  ocrThreshold?: number;
  fill?: string | ImagePixel;
  paddingWidth?: number;
}

/** OCR's normalized word-level response. */
export interface OcrResult {
  left: number[];
  top: number[];
  width: number[];
  height: number[];
  conf: number[];
  text: string[];
}

export type ImageSource = CanvasImageSource | Blob | ArrayBuffer | Uint8Array | string;

export interface OcrEngine {
  processText(image: ImageSource, options?: Record<string, unknown>): Promise<OcrResult>;
}
