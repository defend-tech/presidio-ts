import { Operator } from "./operator.js";
import { OperatorType } from "./operator-type.js";

/**
 * Hash operator - replaces PII text with its SHA-256 hash.
 *
 * For browser environments, uses the Web Crypto API (crypto.subtle).
 * For Node.js, falls back to the Node crypto module.
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

    // Fallback for Node.js < 15 (should not happen with Node 18+)
    const { createHash } = await import("node:crypto");
    return createHash("sha256").update(text).digest("hex");
  }

  #bufferToHex(buffer: ArrayBuffer): string {
    const byteArray = new Uint8Array(buffer);
    return Array.from(byteArray)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
}
