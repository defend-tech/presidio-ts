import { AnalyzerEngine } from "@defend-tech/presidio-analyzer";
import { RecognizerResult } from "@defend-tech/presidio-core";
import { describe, expect, it } from "vitest";
import {
  ImageAnalyzerEngine,
  ImageRedactorEngine,
  type OcrEngine,
  type OcrResult,
} from "../src/index.js";
import { normalizeAzureResult } from "../src/ocr/azure-ocr.js";

class OcrMock implements OcrEngine {
  async processText(): Promise<OcrResult> {
    return {
      left: [10],
      top: [20],
      width: [30],
      height: [12],
      conf: [95],
      text: ["alice@example.com"],
    };
  }
}

class AnalyzerMock extends AnalyzerEngine {
  override async analyze(): Promise<RecognizerResult[]> {
    return [new RecognizerResult("EMAIL_ADDRESS", 0, 17, 0.9)];
  }
}

describe("ImageRedactorEngine", () => {
  it("maps analyzer PII spans to OCR bounding boxes", async () => {
    const analyzer = new ImageAnalyzerEngine(new AnalyzerMock(), new OcrMock());
    await expect(analyzer.analyze({} as HTMLCanvasElement)).resolves.toMatchObject([
      { entityType: "EMAIL_ADDRESS", left: 10, top: 20, width: 30, height: 12 },
    ]);
  });

  it("draws a rectangle for each detected PII region", async () => {
    const calls: unknown[][] = [];
    const canvas = {
      width: 100,
      height: 100,
      getContext: () => ({
        drawImage() {},
        fillRect: (...args: unknown[]) => calls.push(args),
      }),
    } as unknown as HTMLCanvasElement;
    const redactor = new ImageRedactorEngine(
      new ImageAnalyzerEngine(new AnalyzerMock(), new OcrMock()),
    );
    await redactor.redactAndReturnBboxes(canvas);
    expect(calls).toContainEqual([10, 20, 30, 12]);
  });
});

describe("OCR failure handling", () => {
  it("propagates OCR errors so redaction cannot silently continue", async () => {
    const failingOcr: OcrEngine = {
      async processText(): Promise<OcrResult> {
        throw new Error("worker unavailable");
      },
    };
    const analyzer = new ImageAnalyzerEngine(new AnalyzerMock(), failingOcr);
    await expect(analyzer.analyze({} as HTMLCanvasElement)).rejects.toThrow(
      "worker unavailable",
    );
  });
});

describe("Azure OCR coordinates", () => {
  it("uses the actual minimum coordinates for an Azure quadrilateral", () => {
    expect(
      normalizeAzureResult({
        analyzeResult: {
          readResults: [
            {
              lines: [
                {
                  words: [
                    {
                      text: "PII",
                      confidence: 0.9,
                      boundingBox: [25, 40, 55, 35, 60, 75, 30, 80],
                    },
                  ],
                },
              ],
            },
          ],
        },
      }),
    ).toMatchObject({ left: [25], top: [35], width: [35], height: [45], text: ["PII"] });
  });
});
