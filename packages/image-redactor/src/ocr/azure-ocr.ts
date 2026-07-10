import type { ImageSource, OcrEngine, OcrResult } from "../entities.js";

interface AzureReadResponse {
  analyzeResult?: {
    readResults?: Array<{ lines?: Array<{ words?: Array<{ text?: string; confidence?: number; boundingBox?: number[] }> }> }>;
  };
}

/** Azure Computer Vision Read API OCR client using the platform `fetch` API. */
export class AzureOcr implements OcrEngine {
  constructor(
    private readonly endpoint: string,
    private readonly apiKey: string,
    private readonly apiVersion = "v3.2",
  ) {}

  async processText(image: ImageSource): Promise<OcrResult> {
    const body = await toBlob(image);
    const response = await fetch(`${this.endpoint.replace(/\/$/, "")}/vision/${this.apiVersion}/read/analyze`, {
      method: "POST",
      headers: { "Ocp-Apim-Subscription-Key": this.apiKey, "Content-Type": body.type || "application/octet-stream" },
      body,
    });
    if (!response.ok) throw new Error(`Azure OCR request failed: ${response.status}`);
    const operationUrl = response.headers.get("operation-location");
    if (!operationUrl) throw new Error("Azure OCR response did not include operation-location");

    for (let attempt = 0; attempt < 30; attempt += 1) {
      const result = await fetch(operationUrl, { headers: { "Ocp-Apim-Subscription-Key": this.apiKey } });
      if (!result.ok) throw new Error(`Azure OCR status request failed: ${result.status}`);
      const payload = await result.json() as AzureReadResponse & { status?: string };
      if (payload.status === "succeeded") return normalizeAzureResult(payload);
      if (payload.status === "failed") throw new Error("Azure OCR operation failed");
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error("Azure OCR operation timed out");
  }
}

function normalizeAzureResult(result: AzureReadResponse): OcrResult {
  const words = result.analyzeResult?.readResults?.flatMap((page) =>
    page.lines?.flatMap((line) => line.words ?? []) ?? [],
  ) ?? [];
  const boxes = words.map((word) => word.boundingBox ?? []);
  return {
    left: boxes.map((box) => Math.min(...box.filter((_, index) => index % 2 === 0), 0)),
    top: boxes.map((box) => Math.min(...box.filter((_, index) => index % 2 === 1), 0)),
    width: boxes.map((box) => Math.max(...box.filter((_, index) => index % 2 === 0), 0) - Math.min(...box.filter((_, index) => index % 2 === 0), 0)),
    height: boxes.map((box) => Math.max(...box.filter((_, index) => index % 2 === 1), 0) - Math.min(...box.filter((_, index) => index % 2 === 1), 0)),
    conf: words.map((word) => word.confidence ?? 0),
    text: words.map((word) => word.text ?? ""),
  };
}

async function toBlob(image: ImageSource): Promise<Blob> {
  if (image instanceof Blob) return image;
  if (typeof image === "string") return new Blob([image], { type: "text/plain" });
  if (image instanceof ArrayBuffer) return new Blob([image.slice(0)]);
  if (image instanceof Uint8Array) return new Blob([image.slice().buffer as ArrayBuffer]);
  throw new TypeError("Azure OCR requires Blob, bytes, ArrayBuffer, or URL input");
}
