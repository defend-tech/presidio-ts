import { AnalyzerEngine, type AnalyzeOptions } from "@presidio/analyzer";
import type { ImageConfig, ImageSource, OcrEngine, OcrResult } from "../entities.js";
import { RecognizerResult } from "../entities.js";
import { TesseractOcr } from "../ocr/tesseract-ocr.js";

/** Performs OCR and maps text PII spans back to their word-level image boxes. */
export class ImageAnalyzerEngine {
  constructor(
    readonly analyzerEngine = new AnalyzerEngine(),
    readonly ocr: OcrEngine = new TesseractOcr(),
  ) {}

  async analyze(image: ImageSource, config: ImageConfig = {}, options: AnalyzeOptions = {}): Promise<RecognizerResult[]> {
    let ocr = await this.ocr.processText(image);
    ocr = ImageAnalyzerEngine.removeSpaceBoxes(ocr);
    if (config.ocrThreshold !== undefined) ocr = ImageAnalyzerEngine.thresholdOcrResult(ocr, config.ocrThreshold);
    const text = ocr.text.join(" ");
    if (!text) return [];
    const results = await this.analyzerEngine.analyze(text, config.language ?? "en", {
      ...options, entities: config.entities ?? options.entities, allowList: config.allowList ?? options.allowList,
    });
    return ImageAnalyzerEngine.mapAnalyzerResultsToBoundingBoxes(results, ocr, text, config.allowList ?? []);
  }

  static thresholdOcrResult(result: OcrResult, threshold: number): OcrResult {
    if (threshold < -1 || threshold > 100) throw new RangeError("ocrThreshold must be between -1 and 100");
    return pick(result, result.conf.map((confidence) => confidence >= threshold));
  }

  static removeSpaceBoxes(result: OcrResult): OcrResult {
    return pick(result, result.text.map((word) => word.trim().length > 0));
  }

  static mapAnalyzerResultsToBoundingBoxes(
    results: Awaited<ReturnType<AnalyzerEngine["analyze"]>>,
    ocr: OcrResult,
    text: string,
    allowList: string[],
  ): RecognizerResult[] {
    const mapped: RecognizerResult[] = [];
    let position = 0;
    for (let index = 0; index < ocr.text.length; index += 1) {
      const word = ocr.text[index];
      const wordStart = position;
      const wordEnd = wordStart + word.length;
      for (const result of results) {
        if (wordStart < result.end && result.start < wordEnd && !allowList.includes(word)) {
          mapped.push(new RecognizerResult(result.entityType, result.start, result.end, result.score, ocr.left[index], ocr.top[index], ocr.width[index], ocr.height[index]));
        }
      }
      position = wordEnd + 1;
    }
    return mapped;
  }
}

function pick(result: OcrResult, selected: boolean[]): OcrResult {
  const indexes = selected.flatMap((keep, index) => keep ? [index] : []);
  return {
    left: indexes.map((index) => result.left[index]), top: indexes.map((index) => result.top[index]),
    width: indexes.map((index) => result.width[index]), height: indexes.map((index) => result.height[index]),
    conf: indexes.map((index) => result.conf[index]), text: indexes.map((index) => result.text[index]),
  };
}
