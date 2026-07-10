import { Pattern, PatternRecognizer } from "@presidio/core";

// ============================================================================
// Bech32 / Bech32m constants (from Pieter Wuille's reference implementation)
// @see https://github.com/sipa/bech32/blob/master/ref/python/segwit_addr.py
// ============================================================================

/** Bech32 encoding type. */
const BECH32 = 1;

/** Bech32m encoding type. */
const BECH32M = 2;

/** Bech32 character set (excludes 1, b, I, O to avoid ambiguity). */
const CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

/** Bech32m checksum constant. */
const BECH32M_CONST = 0x2bc830a3;

/**
 * Recognize common cryptocurrency (Bitcoin) addresses using regex + checksum.
 *
 * Supports three Bitcoin address formats:
 * - P2PKH (starts with "1"): Pay-to-Public-Key-Hash
 * - P2SH (starts with "3"): Pay-to-Script-Hash
 * - Bech32 / Bech32m (starts with "bc1"): SegWit addresses
 *
 * Validation uses base58 checksum for legacy addresses and the Bech32/Bech32m
 * polynomial checksum for SegWit addresses.
 *
 * @see http://rosettacode.org/wiki/Bitcoin/address_validation#Python
 */
export class CryptoRecognizer extends PatternRecognizer {
  /** Default cryptocurrency address pattern. */
  public static readonly PATTERNS: Pattern[] = [
    new Pattern(
      "Crypto (Medium)",
      "(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,59}",
      0.5,
    ),
  ];

  /** Context words that increase confidence in crypto address detection. */
  public static readonly CONTEXT: string[] = [
    "wallet",
    "btc",
    "bitcoin",
    "crypto",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supportedLanguage: string = "en",
    supportedEntity: string = "CRYPTO",
    name: string | null = null,
  ) {
    super(
      supportedEntity,
      name,
      supportedLanguage,
      patterns ?? CryptoRecognizer.PATTERNS,
      null,
      context ?? CryptoRecognizer.CONTEXT,
    );
  }

  /**
   * Validate the cryptocurrency address using checksum verification.
   *
   * For legacy addresses (starting with "1" or "3"), a base58 decode
   * followed by a double-SHA256 checksum is performed.
   * For SegWit addresses (starting with "bc1"), the Bech32/Bech32m
   * polynomial checksum is verified.
   *
   * @param patternText - The cryptocurrency address to validate
   * @returns `true` if the address is valid, `false` otherwise
   */
  validateResult(patternText: string): boolean {
    if (patternText.startsWith("1") || patternText.startsWith("3")) {
      // P2PKH or P2SH address validation
      try {
        const bcBytes = CryptoRecognizer.decodeBase58(patternText);
        const checksum = CryptoRecognizer.doubleSha256(bcBytes.slice(0, -4)).slice(0, 4);
        return bcBytes.slice(-4).every((b, i) => b === checksum[i]);
      } catch {
        return false;
      }
    } else if (patternText.startsWith("bc1")) {
      // Bech32 or Bech32m address validation
      const result = CryptoRecognizer.validateBech32Address(patternText);
      return result[0];
    }
    return false;
  }

  // ==========================================================================
  // Base58 decoding
  // ==========================================================================

  /**
   * Decode a base58-encoded string to its raw byte representation.
   *
   * @param input - Base58 string to decode
   * @returns Uint8Array of decoded bytes
   */
  private static decodeBase58(input: string): Uint8Array {
    const digits58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
    const origLen = input.length;
    const trimmed = input.replace(/^1+/g, "");
    const leadingZeros = origLen - trimmed.length;

    // Use BigInt for arbitrary precision arithmetic
    let n = BigInt(0);
    for (const char of trimmed) {
      const idx = digits58.indexOf(char);
      if (idx === -1) {
        throw new Error(`Invalid base58 character: ${char}`);
      }
      n = n * BigInt(58) + BigInt(idx);
      // Trim to prevent unreasonable growth
      n = n & BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF");
    }

    const byteLen = leadingZeros + Math.ceil(n.toString(2).length / 8);
    const hex = n.toString(16).padStart(byteLen * 2, "0");
    const bytes = new Uint8Array(byteLen);
    for (let i = 0; i < byteLen; i++) {
      bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    }
    return bytes;
  }

  // ==========================================================================
  // SHA-256 helpers
  // ==========================================================================

  /**
   * Synchronous double SHA-256 using a pure-JS implementation.
   *
   * @param data - Input bytes
   * @returns Uint8Array of the double-SHA256 digest
   */
  private static doubleSha256(data: Uint8Array): Uint8Array {
    return CryptoRecognizer.sha256Sync(CryptoRecognizer.sha256Sync(data));
  }

  /**
   * Pure JavaScript SHA-256 implementation.
   *
   * @param data - Input bytes as Uint8Array
   * @returns Hash digest as Uint8Array
   */
  private static sha256Sync(data: Uint8Array): Uint8Array {
    // SHA-256 constants
    const K = new Uint32Array([
      0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
      0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
      0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
      0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
      0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
      0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
      0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
      0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
    ]);

    const H0 = new Uint32Array([
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
    ]);

    // Pre-processing: adding padding bits
    const msg = new Uint8Array(data);
    const msgLen = msg.length;
    const bitLen = msgLen * 8;

    // We need to pad to 56 mod 64 bytes, then append 8-byte big-endian length
    const padLen = (msgLen % 64 < 56) ? 56 - (msgLen % 64) : 120 - (msgLen % 64);
    const padded = new Uint8Array(msgLen + padLen + 8);
    padded.set(msg);
    padded[msgLen] = 0x80;
    // Append bit length as big-endian 64-bit
    const view = new DataView(padded.buffer);
    view.setBigUint64(padded.length - 8, BigInt(bitLen));

    // Process each 512-bit (64-byte) chunk
    let h0 = H0[0], h1 = H0[1], h2 = H0[2], h3 = H0[3];
    let h4 = H0[4], h5 = H0[5], h6 = H0[6], h7 = H0[7];

    const rotR = (n: number, x: number): number =>
      (x >>> n) | (x << (32 - n));
    const parity = (w: Uint32Array, i: number): number =>
        rotR(2, w[i + 14]) ^ rotR(12, w[i + 14]) ^ (w[i + 14] >>> 7) ^
        rotR(2, w[i + 9]) ^ rotR(6, w[i + 9]) ^ (w[i + 9] >>> 7);

    for (let offset = 0; offset < padded.length; offset += 64) {
      const chunkView = new DataView(padded.buffer, offset);
      const W = new Uint32Array(64);
      for (let i = 0; i < 16; i++) {
        W[i] = chunkView.getUint32(i * 4);
      }
      for (let i = 16; i < 64; i++) {
        W[i] = ((parity(W, i) + W[i]) >>> 0);
      }

      let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;

      for (let i = 0; i < 64; i++) {
        const T1 = (h +
          rotR(6, e) ^ rotR(11, e) ^ rotR(25, e) ^
          ((e & f) | ((~e) & g)) +
          K[i] + W[i]) >>> 0;
        const T2 = (rotR(2, a) ^ rotR(13, a) ^ rotR(22, a) ^
          ((a & b) | (a & c) | (b & c))) >>> 0;

        h = g; g = f; f = e;
        e = (d + T1) >>> 0;
        d = c; c = b; b = a;
        a = (T1 + T2) >>> 0;
      }

      h0 = (h0 + a) >>> 0;
      h1 = (h1 + b) >>> 0;
      h2 = (h2 + c) >>> 0;
      h3 = (h3 + d) >>> 0;
      h4 = (h4 + e) >>> 0;
      h5 = (h5 + f) >>> 0;
      h6 = (h6 + g) >>> 0;
      h7 = (h7 + h) >>> 0;
    }

    const result = new Uint8Array(32);
    const rv = new DataView(result.buffer);
    rv.setUint32(0, h0);
    rv.setUint32(4, h1);
    rv.setUint32(8, h2);
    rv.setUint32(12, h3);
    rv.setUint32(16, h4);
    rv.setUint32(20, h5);
    rv.setUint32(24, h6);
    rv.setUint32(28, h7);
    return result;
  }

  // ==========================================================================
  // Bech32 / Bech32m helpers
  // ==========================================================================

  /**
   * Compute the Bech32 polymod checksum.
   *
   * @param values - Array of value bytes
   * @returns The checksum value
   */
  static bech32Polymod(values: number[]): number {
    const generator = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
    let chk = 1;
    for (const value of values) {
      const top = chk >> 25;
      chk = ((chk & 0x1ffffff) << 5) ^ value;
      for (let i = 0; i < 5; i++) {
        chk ^= (top >> i) & 1 ? generator[i] : 0;
      }
    }
    return chk;
  }

  /**
   * Expand the HRP (Human-Readable Part) into values for checksum computation.
   *
   * @param hrp - The human-readable part of a Bech32 string
   * @returns Array of expanded values
   */
  static bech32HrpExpand(hrp: string): number[] {
    return hrp.split("").map((x) => x.charCodeAt(0) >> 5).concat(0).concat(
      hrp.split("").map((x) => x.charCodeAt(0) & 31),
    );
  }

  /**
   * Verify a Bech32 or Bech32m checksum.
   *
   * @param hrp - Human-readable part
   * @param data - Data characters as integer values
   * @returns BECH32, BECH32M, or null if invalid
   */
  static bech32VerifyChecksum(hrp: string, data: number[]): number | null {
    const constValue = CryptoRecognizer.bech32Polymod(
      CryptoRecognizer.bech32HrpExpand(hrp).concat(data),
    );
    if (constValue === 1) {
      return BECH32;
    }
    if (constValue === BECH32M_CONST) {
      return BECH32M;
    }
    return null;
  }

  /**
   * Decode and validate a Bech32 or Bech32m string.
   *
   * @param bech - The Bech32/Bech32m string to decode
   * @returns Tuple of [HRP, data values, spec type] or [null, null, null] if invalid
   */
  static bech32Decode(bech: string): [string, number[], number] | [null, null, null] {
    // Check printable ASCII range and case consistency
    if (
      [...bech].some((x) => x.charCodeAt(0) < 33 || x.charCodeAt(0) > 126) ||
      (bech.toLowerCase() !== bech && bech.toUpperCase() !== bech)
    ) {
      return [null, null, null];
    }

    const lower = bech.toLowerCase();
    const pos = lower.lastIndexOf("1");
    if (pos < 1 || pos + 7 > lower.length || lower.length > 90) {
      return [null, null, null];
    }

    // Validate all characters after the separator are in CHARSET
    const payload = lower.slice(pos + 1);
    if (![...payload].every((x) => CHARSET.includes(x))) {
      return [null, null, null];
    }

    const hrp = lower.slice(0, pos);
    const data = [...payload].map((x) => CHARSET.indexOf(x));
    const spec = CryptoRecognizer.bech32VerifyChecksum(hrp, data);

    if (spec === null) {
      return [null, null, null];
    }

    return [hrp, data.slice(0, -6), spec];
  }

  /**
   * Validate a Bech32 or Bech32m Bitcoin address.
   *
   * @param address - The Bitcoin address to validate
   * @returns Tuple of [isValid, specType]
   */
  static validateBech32Address(
    address: string,
  ): [boolean, number | null] {
    const [hrp, data, spec] = CryptoRecognizer.bech32Decode(address);
    if (hrp !== null && data !== null) {
      return [true, spec];
    }
    return [false, null];
  }
}