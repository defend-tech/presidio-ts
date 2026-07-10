import { describe, expect, it } from "vitest";
import { AESCipher } from "../src/crypto/aes-cipher.js";

// ---------------------------------------------------------------------------
// AESCipher — Key validation
// ---------------------------------------------------------------------------
describe("AESCipher — key validation", () => {
  it("accepts 16-byte key (128-bit)", () => {
    const key = new Uint8Array(16);
    expect(AESCipher.isValidKeySize(key)).toBe(true);
  });

  it("accepts 24-byte key (192-bit)", () => {
    const key = new Uint8Array(24);
    expect(AESCipher.isValidKeySize(key)).toBe(true);
  });

  it("accepts 32-byte key (256-bit)", () => {
    const key = new Uint8Array(32);
    expect(AESCipher.isValidKeySize(key)).toBe(true);
  });

  it("rejects 8-byte key", () => {
    const key = new Uint8Array(8);
    expect(AESCipher.isValidKeySize(key)).toBe(false);
  });

  it("rejects 31-byte key", () => {
    const key = new Uint8Array(31);
    expect(AESCipher.isValidKeySize(key)).toBe(false);
  });

  it("rejects 33-byte key", () => {
    const key = new Uint8Array(33);
    expect(AESCipher.isValidKeySize(key)).toBe(false);
  });

  it("rejects empty key", () => {
    const key = new Uint8Array(0);
    expect(AESCipher.isValidKeySize(key)).toBe(false);
  });

  it("accepts string key of 16 bytes", () => {
    expect(AESCipher.isValidKeySize("0123456789abcdef")).toBe(true);
  });

  it("accepts string key of 32 bytes", () => {
    expect(AESCipher.isValidKeySize("0123456789abcdef0123456789abcdef")).toBe(true);
  });

  it("rejects string key of invalid length", () => {
    expect(AESCipher.isValidKeySize("tooshort")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// AESCipher — Encrypt + Decrypt roundtrip
// ---------------------------------------------------------------------------
describe("AESCipher — encrypt/decrypt roundtrip", () => {
  it("decrypts fixed Python cryptography AES-256-CBC PKCS7 vectors", async () => {
    const key = new Uint8Array([...Array(32).keys()]);
    await expect(
      AESCipher.decrypt(key, "AAECAwQFBgcICQoLDA0OD3_RLa-36VmdC4Sa2MLjwh8"),
    ).resolves.toBe("hello");
    await expect(
      AESCipher.decrypt(
        key,
        "Dw4NDAsKCQgHBgUEAwIBAHhioHHaGfMobc1Mp8qcbj7vwQ0_o9ZG5ocrab2nNQoZ",
      ),
    ).resolves.toBe("0123456789abcdef");
  });
  it("roundtrips a simple string with 256-bit key", async () => {
    const key = "0123456789abcdef0123456789abcdef";
    const plaintext = "Hello, World!";
    const encrypted = await AESCipher.encrypt(key, plaintext);
    const decrypted = await AESCipher.decrypt(key, encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("roundtrip with 128-bit key (16 bytes)", async () => {
    const key = "0123456789abcdef";
    const plaintext = "128-bit test";
    const encrypted = await AESCipher.encrypt(key, plaintext);
    const decrypted = await AESCipher.decrypt(key, encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("roundtrip with 192-bit key (24 bytes)", async () => {
    const key = "0123456789abcdef01234567";
    const plaintext = "192-bit test data";
    const encrypted = await AESCipher.encrypt(key, plaintext);
    const decrypted = await AESCipher.decrypt(key, encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("roundtrip with Uint8Array key", async () => {
    const key = new Uint8Array(32);
    for (let i = 0; i < 32; i++) key[i] = i;
    const plaintext = "Uint8Array key test";
    const encrypted = await AESCipher.encrypt(key, plaintext);
    const decrypted = await AESCipher.decrypt(key, encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("roundtrips empty string", async () => {
    const key = "0123456789abcdef0123456789abcdef";
    const encrypted = await AESCipher.encrypt(key, "");
    const decrypted = await AESCipher.decrypt(key, encrypted);
    expect(decrypted).toBe("");
  });

  it("roundtrips unicode characters", async () => {
    const key = "0123456789abcdef0123456789abcdef";
    const plaintext = "Hello 世界 🌍 ñ á é í ó ú";
    const encrypted = await AESCipher.encrypt(key, plaintext);
    const decrypted = await AESCipher.decrypt(key, encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("roundtrips long text", async () => {
    const key = "0123456789abcdef0123456789abcdef";
    const plaintext = "Lorem ipsum dolor sit amet. ".repeat(50);
    const encrypted = await AESCipher.encrypt(key, plaintext);
    const decrypted = await AESCipher.decrypt(key, encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("roundtrips text exactly one block (16 bytes)", async () => {
    const key = "0123456789abcdef0123456789abcdef";
    const plaintext = "0123456789abcdef"; // exactly 16 bytes
    const encrypted = await AESCipher.encrypt(key, plaintext);
    const decrypted = await AESCipher.decrypt(key, encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("roundtrips text exactly two blocks (32 bytes)", async () => {
    const key = "0123456789abcdef0123456789abcdef";
    const plaintext = "0123456789abcdef0123456789abcdef"; // exactly 32 bytes
    const encrypted = await AESCipher.encrypt(key, plaintext);
    const decrypted = await AESCipher.decrypt(key, encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("roundtrips text just over one block (17 bytes)", async () => {
    const key = "0123456789abcdef0123456789abcdef";
    const plaintext = "0123456789abcdefg"; // 17 bytes
    const encrypted = await AESCipher.encrypt(key, plaintext);
    const decrypted = await AESCipher.decrypt(key, encrypted);
    expect(decrypted).toBe(plaintext);
  });
});

// ---------------------------------------------------------------------------
// AESCipher — Invalid key size detection
// ---------------------------------------------------------------------------
describe("AESCipher — invalid key size detection", () => {
  it("encrypt throws for invalid key size (short string)", async () => {
    await expect(AESCipher.encrypt("short", "data")).rejects.toThrow(
      "Invalid input, key must be of length 128, 192 or 256 bits",
    );
  });

  it("encrypt throws for invalid key size (wrong length Uint8Array)", async () => {
    await expect(AESCipher.encrypt(new Uint8Array(5), "data")).rejects.toThrow(
      "Invalid input, key must be of length 128, 192 or 256 bits",
    );
  });

  it("decrypt throws for invalid key size", async () => {
    await expect(AESCipher.decrypt("short", "dGVzdA==")).rejects.toThrow(
      "Invalid input, key must be of length 128, 192 or 256 bits",
    );
  });
});

// ---------------------------------------------------------------------------
// AESCipher — Key from string vs Uint8Array
// ---------------------------------------------------------------------------
describe("AESCipher — key from string vs Uint8Array", () => {
  const stringKey = "0123456789abcdef";
  const uint8Key = new TextEncoder().encode("0123456789abcdef");
  const plaintext = "The quick brown fox jumps over the lazy dog";

  it("string key and equivalent Uint8Array key produce encrypt-then-decrypt roundtrip", async () => {
    const encStr = await AESCipher.encrypt(stringKey, plaintext);
    const decStr = await AESCipher.decrypt(stringKey, encStr);
    expect(decStr).toBe(plaintext);

    const encBuf = await AESCipher.encrypt(uint8Key, plaintext);
    const decBuf = await AESCipher.decrypt(uint8Key, encBuf);
    expect(decBuf).toBe(plaintext);
  });

  it("encrypt with string key, decrypt with equivalent Uint8Array key", async () => {
    const encrypted = await AESCipher.encrypt(stringKey, plaintext);
    const decrypted = await AESCipher.decrypt(uint8Key, encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("encrypt with Uint8Array key, decrypt with equivalent string key", async () => {
    const encrypted = await AESCipher.encrypt(uint8Key, plaintext);
    const decrypted = await AESCipher.decrypt(stringKey, encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("same string key and same Uint8Array key are equivalent", async () => {
    // Encrypt with string, decrypt with Uint8Array of same bytes
    const encStr = await AESCipher.encrypt(stringKey, "test data");
    const decBuf = await AESCipher.decrypt(uint8Key, encStr);
    expect(decBuf).toBe("test data");
  });
});

// ---------------------------------------------------------------------------
// AESCipher — Output format and properties
// ---------------------------------------------------------------------------
describe("AESCipher — output format and properties", () => {
  const key = "0123456789abcdef0123456789abcdef";

  it("encrypted output is a base64url-encoded string", async () => {
    const encrypted = await AESCipher.encrypt(key, "test");
    // base64url: no +, /, or = characters
    expect(encrypted).not.toMatch(/[+\/=]/);
    expect(typeof encrypted).toBe("string");
  });

  it("encrypted output is longer than plaintext (IV + padding + ciphertext)", async () => {
    const plaintext = "short";
    const encrypted = await AESCipher.encrypt(key, plaintext);
    // base64url encoded: at least 16 (IV) + 16 (one block for padding) = 32 bytes
    // base64url of 32 bytes ~ 42+ chars
    expect(encrypted.length).toBeGreaterThan(plaintext.length);
  });

  it("same plaintext produces different ciphertext (random IV)", async () => {
    const enc1 = await AESCipher.encrypt(key, "same plaintext");
    const enc2 = await AESCipher.encrypt(key, "same plaintext");
    expect(enc1).not.toBe(enc2);
  });

  it("different plaintexts produce different ciphertext", async () => {
    const enc1 = await AESCipher.encrypt(key, "plaintext A");
    const enc2 = await AESCipher.encrypt(key, "plaintext B");
    expect(enc1).not.toBe(enc2);
  });

  it("decrypt with wrong key throws decoding/cryptographic error", async () => {
    const encrypted = await AESCipher.encrypt(key, "secret");
    const wrongKey = "abcdefabcdefabcdefabcdefabcdefab"; // different 32-byte string
    await expect(AESCipher.decrypt(wrongKey, encrypted)).rejects.toThrow();
  });

  it("decrypt with garbage ciphertext throws", async () => {
    await expect(AESCipher.decrypt(key, "not-valid-base64url!!!")).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// AESCipher — PKCS7 padding edge cases
// ---------------------------------------------------------------------------
describe("AESCipher — PKCS7 padding edge cases", () => {
  const key = "0123456789abcdef0123456789abcdef";

  it("handles single-character input", async () => {
    const plaintext = "A";
    const encrypted = await AESCipher.encrypt(key, plaintext);
    const decrypted = await AESCipher.decrypt(key, encrypted);
    expect(decrypted).toBe("A");
  });

  it("handles null byte-like content", async () => {
    // Text with special characters that could confuse padding
    const plaintext = "test\x00data"; // null byte in middle
    const encrypted = await AESCipher.encrypt(key, plaintext);
    const decrypted = await AESCipher.decrypt(key, encrypted);
    expect(decrypted).toBe("test\x00data");
  });

  it("handles all-16 padding scenario (data length = multiple of 16)", async () => {
    // 16 bytes of data should get a full extra block of padding
    const plaintext = "x".repeat(16);
    const encrypted = await AESCipher.encrypt(key, plaintext);
    const decrypted = await AESCipher.decrypt(key, encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("handles very small input (1 byte)", async () => {
    const plaintext = "X";
    const encrypted = await AESCipher.encrypt(key, plaintext);
    const decrypted = await AESCipher.decrypt(key, encrypted);
    expect(decrypted).toBe("X");
  });

  it("handles 15-byte input (1 byte of padding needed)", async () => {
    const plaintext = "x".repeat(15);
    const encrypted = await AESCipher.encrypt(key, plaintext);
    const decrypted = await AESCipher.decrypt(key, encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("handles 17-byte input (15 bytes of padding needed)", async () => {
    const plaintext = "x".repeat(17);
    const encrypted = await AESCipher.encrypt(key, plaintext);
    const decrypted = await AESCipher.decrypt(key, encrypted);
    expect(decrypted).toBe(plaintext);
  });
});
