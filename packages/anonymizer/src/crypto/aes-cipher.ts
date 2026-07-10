/**
 * Advanced Encryption Standard (Rijndael) encryption/decryption in CBC mode.
 *
 * Presidio Python stores base64url(iv + ciphertext). This implementation keeps
 * the same envelope. Web Crypto AES-CBC already applies and removes PKCS7
 * padding, matching Python cryptography's AES-CBC PKCS7 behavior.
 */
export class AESCipher {
  static async encrypt(key: Uint8Array | string, text: string): Promise<string> {
    const keyBytes = AESCipher.#toBytes(key);
    AESCipher.#assertValidKeySize(keyBytes);

    const iv = crypto.getRandomValues(new Uint8Array(16));
    const encodedText = new TextEncoder().encode(text);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      AESCipher.#toArrayBuffer(keyBytes),
      { name: "AES-CBC" },
      false,
      ["encrypt"],
    );

    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv },
      cryptoKey,
      AESCipher.#toArrayBuffer(encodedText),
    );

    const envelope = AESCipher.#concat(iv, new Uint8Array(encrypted));
    return AESCipher.#base64UrlEncode(envelope);
  }

  static async decrypt(key: Uint8Array | string, text: string): Promise<string> {
    const keyBytes = AESCipher.#toBytes(key);
    AESCipher.#assertValidKeySize(keyBytes);

    const decoded = AESCipher.#base64UrlDecode(text);
    if (decoded.length < 32 || (decoded.length - 16) % 16 !== 0) {
      throw new Error("Invalid AES-CBC envelope");
    }
    const iv = decoded.slice(0, 16);
    const cipherText = decoded.slice(16);
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      AESCipher.#toArrayBuffer(keyBytes),
      { name: "AES-CBC" },
      false,
      ["decrypt"],
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv },
      cryptoKey,
      AESCipher.#toArrayBuffer(cipherText),
    );

    return new TextDecoder().decode(new Uint8Array(decrypted));
  }

  static isValidKeySize(key: Uint8Array | string): boolean {
    const keyBytes = AESCipher.#toBytes(key);
    return [16, 24, 32].includes(keyBytes.length);
  }

  static #assertValidKeySize(key: Uint8Array): void {
    if (!AESCipher.isValidKeySize(key)) {
      throw new Error("Invalid input, key must be of length 128, 192 or 256 bits");
    }
  }

  static #toBytes(value: Uint8Array | string): Uint8Array {
    if (value instanceof Uint8Array) return value;
    return new TextEncoder().encode(value);
  }

  static #toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
    return bytes.buffer.slice(
      bytes.byteOffset,
      bytes.byteOffset + bytes.byteLength,
    ) as ArrayBuffer;
  }

  static #concat(...chunks: Uint8Array[]): Uint8Array {
    const length = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const output = new Uint8Array(length);
    let offset = 0;
    for (const chunk of chunks) {
      output.set(chunk, offset);
      offset += chunk.length;
    }
    return output;
  }

  static #base64UrlEncode(data: Uint8Array): string {
    const binary = Array.from(data, (byte) => String.fromCharCode(byte)).join("");
    if (typeof btoa !== "function")
      throw new Error("Web Crypto base64 encoding is required");
    const base64 = btoa(binary);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  static #base64UrlDecode(text: string): Uint8Array {
    const padded = text
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(text.length / 4) * 4, "=");
    if (typeof atob === "function") {
      const binary = atob(padded);
      return Uint8Array.from(binary, (char) => char.charCodeAt(0));
    }
    throw new Error("Web Crypto base64 decoding is required");
  }
}
