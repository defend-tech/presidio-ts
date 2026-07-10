import type { Bbox, OcrResult, RecognizerResult } from "../entities.js";

/** Pure bounding-box transformations used by image and DICOM engines. */
export class BboxProcessor {
  static fromOcrResults(result: OcrResult): Bbox[] {
    return result.text.flatMap((label, index) =>
      label.trim()
        ? [
            {
              left: result.left[index],
              top: result.top[index],
              width: result.width[index],
              height: result.height[index],
              score: result.conf[index],
              label,
            },
          ]
        : [],
    );
  }

  static fromRecognizerResults(results: RecognizerResult[]): Bbox[] {
    return results.map(({ entityType, score, left, top, width, height }) => ({
      entityType,
      score,
      left,
      top,
      width,
      height,
    }));
  }

  static removePadding<T extends Bbox>(boxes: T[], paddingWidth: number): T[] {
    if (paddingWidth < 0) throw new RangeError("paddingWidth must be non-negative");
    return boxes.map((box) => ({
      ...box,
      left: Math.max(0, box.left - paddingWidth),
      top: Math.max(0, box.top - paddingWidth),
    }));
  }

  static scale(boxes: Bbox[], factor: number): Bbox[] {
    if (factor <= 0) throw new RangeError("scale factor must be positive");
    return boxes.map((box) => ({
      ...box,
      left: Math.ceil(box.left / factor),
      top: Math.ceil(box.top / factor),
      width: Math.max(1, Math.ceil(box.width / factor)),
      height: Math.max(1, Math.ceil(box.height / factor)),
    }));
  }
}
