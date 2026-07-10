/**
 * Advanced Encryption Standard (Rijndael) encryption/decryption in CBC mode.
 *
 * Presidio Python stores base64url(iv + ciphertext). This implementation keeps
 * the same envelope and manually applies PKCS7 padding for compatibility.
 */
export class AESCipher {
  static async encrypt(key: Uint8Array | string, text: string): Promise<string> {
    const keyBytes = AESCipher.#toBytes(key);
    AESCipher.#assertValidKeySize(keyBytes);

    const iv = crypto.getRandomValues(new Uint8Array(16));
    const encodedText = new TextEncoder().encode(text);
    const paddedText = AESCipher.#pkcs7Pad(encodedText, 16);
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
      AESCipher.#toArrayBuffer(paddedText),
    );

    const envelope = AESCipher.#concat(iv, new Uint8Array(encrypted));
    return AESCipher.#base64UrlEncode(envelope);
  }

  static async decrypt(key: Uint8Array | string, text: string): Promise<string> {
    const keyBytes = AESCipher.#toBytes(key);
    AESCipher.#assertValidKeySize(keyBytes);

    const decoded = AESCipher.#base64UrlDecode(text);
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

    const unpadded = AESCipher.#pkcs7Unpad(new Uint8Array(decrypted));
    return new TextDecoder().decode(unpadded);
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
    return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  }

  static #pkcs7Pad(data: Uint8Array, blockSize: number): Uint8Array {
    const paddingLength = blockSize - (data.length % blockSize || blockSize);
    const finalPaddingLength = paddingLength === 0 ? blockSize : paddingLength;
    const output = new Uint8Array(data.length + finalPaddingLength);
    output.set(data);
    output.fill(finalPaddingLength, data.length);
    return output;
  }

  static #pkcs7Unpad(data: Uint8Array): Uint8Array {
    if (data.length === 0) throw new Error("Invalid padded data");
    const paddingLength = data[data.length - 1];
    if (paddingLength < 1 || paddingLength > 16) {
      throw new Error("Invalid PKCS7 padding");
    }
    return data.slice(0, data.length - paddingLength);
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
    const base64 = typeof btoa === "function"
      ? btoa(binary)
      : Buffer.from(data).toString("base64");
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
  }

  static #base64UrlDecode(text: string): Uint8Array {
    const padded = text.replace(/-/g, "+").replace(/_/g, "/").padEnd(
      Math.ceil(text.length / 4) * 4,
      "=",
    );
    if (typeof atob === "function") {
      const binary = atob(padded);
      return Uint8Array.from(binary, (char) => char.charCodeAt(0));
    }
    return new Uint8Array(Buffer.from(padded, "base64"));
  }
}
