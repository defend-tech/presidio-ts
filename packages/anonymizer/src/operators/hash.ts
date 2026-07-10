import { OperatorType } from "./operator-type.js";
import { Operator } from "./operator.js";

/**
 * Hash operator - replaces PII text with its SHA-256 hash.
 *
 * Uses the Web Crypto API available in supported Node.js and browser runtimes.
 */
export class Hash extends Operator {
  operatorType = OperatorType.Anonymize;

  async operate(text: string, _params: Record<string, unknown>): Promise<string> {
    const hashHex = await this.#sha256(text);
    return hashHex;
  }

  validate(_params: Record<string, unknown>): void {
    // No validation needed
  }

  async #sha256(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    // Try Web Crypto API (browser / service worker / Deno)
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      return this.#bufferToHex(hashBuffer);
    }

    throw new Error("Web Crypto SHA-256 is required for hash anonymization");
  }

  #bufferToHex(buffer: ArrayBuffer): string {
    const byteArray = new Uint8Array(buffer);
    return Array.from(byteArray)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
