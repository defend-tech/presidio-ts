import type { ImageSource, OcrEngine, OcrResult } from "../entities.js";

/** Browser-compatible OCR implementation backed by Tesseract's WASM worker. */
export class TesseractOcr implements OcrEngine {
  constructor(private readonly language = "eng") {}

  async processText(
    image: ImageSource,
    _options: Record<string, unknown> = {},
  ): Promise<OcrResult> {
    try {
      // Dynamic loading lets consumers use the package without bundling OCR assets.
      const { createWorker } = await import("tesseract.js");
      const worker = await createWorker(this.language);
      try {
        const result = await worker.recognize(
          image as Parameters<typeof worker.recognize>[0],
        );
        const words =
          result.data.blocks?.flatMap((block) =>
            block.paragraphs.flatMap((paragraph) =>
              paragraph.lines.flatMap((line) => line.words),
            ),
          ) ?? [];
        return {
          left: words.map((word) => word.bbox.x0),
          top: words.map((word) => word.bbox.y0),
          width: words.map((word) => word.bbox.x1 - word.bbox.x0),
          height: words.map((word) => word.bbox.y1 - word.bbox.y0),
          conf: words.map((word) => word.confidence),
          text: words.map((word) => word.text),
        };
      } finally {
        await worker.terminate();
      }
    } catch (error) {
      // Returning an empty response can silently leak PII. Callers must decide
      // whether to retry, surface the failure, or stop the redaction workflow.
      throw new Error("Tesseract OCR failed; image redaction was not performed", {
        cause: error,
      });
    }
  }
}
