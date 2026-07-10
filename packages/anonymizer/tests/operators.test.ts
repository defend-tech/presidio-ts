import { describe, expect, it } from "vitest";
import { Custom } from "../src/operators/custom.js";
import { Decrypt } from "../src/operators/decrypt.js";
import { Encrypt } from "../src/operators/encrypt.js";
import { Hash } from "../src/operators/hash.js";
import { Keep } from "../src/operators/keep.js";
import { Mask } from "../src/operators/mask.js";
import { OperatorType } from "../src/operators/operator-type.js";
import { OperatorsFactory } from "../src/operators/operators-factory.js";
import { Redact } from "../src/operators/redact.js";
import { Replace } from "../src/operators/replace.js";

// ---------------------------------------------------------------------------
// Replace
// ---------------------------------------------------------------------------
describe("Replace operator", () => {
  const operator = new Replace();

  it("has Anonymize operator type", () => {
    expect(operator.operatorType).toBe(OperatorType.Anonymize);
  });

  it("replaces text with a custom new_value", () => {
    const result = operator.operate("John Doe", { new_value: "REDACTED" });
    expect(result).toBe("REDACTED");
  });

  it("defaults to <{entity_type}> when no new_value provided", () => {
    const result = operator.operate("John Doe", { entity_type: "PERSON" });
    expect(result).toBe("<PERSON>");
  });

  it("ignores the original text — only new_value matters", () => {
    const result = operator.operate("completely different text", { new_value: "X" });
    expect(result).toBe("X");
  });

  it("throws when new_value is not a string (number)", () => {
    expect(() => operator.operate("text", { new_value: 42 })).toThrow(
      "new_value must be a string",
    );
  });

  it("throws when new_value is not a string (boolean)", () => {
    expect(() => operator.validate({ new_value: true })).toThrow(
      "new_value must be a string",
    );
  });

  it("passes validation when new_value is undefined (allowed)", () => {
    expect(() => operator.validate({})).not.toThrow();
  });

  it("passes validation when new_value is a valid string", () => {
    expect(() => operator.validate({ new_value: "abc" })).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Redact
// ---------------------------------------------------------------------------
describe("Redact operator", () => {
  const operator = new Redact();

  it("has Anonymize operator type", () => {
    expect(operator.operatorType).toBe(OperatorType.Anonymize);
  });

  it("always returns an empty string", () => {
    expect(operator.operate("secret data")).toBe("");
  });

  it("returns empty string regardless of input text length", () => {
    expect(
      operator.operate(
        "a very long piece of sensitive information that should be redacted entirely",
      ),
    ).toBe("");
  });

  it("validation never throws", () => {
    expect(() => operator.validate({})).not.toThrow();
    expect(() => operator.validate({ foo: "bar" })).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Mask
// ---------------------------------------------------------------------------
describe("Mask operator", () => {
  const operator = new Mask();

  it("has Anonymize operator type", () => {
    expect(operator.operatorType).toBe(OperatorType.Anonymize);
  });

  it("masks N chars from the start by default", () => {
    const result = operator.operate("1234567890", {
      masking_char: "*",
      chars_to_mask: 6,
      from_end: false,
    });
    expect(result).toBe("******7890");
  });

  it("masks N chars from the end when from_end is true", () => {
    const result = operator.operate("1234567890", {
      masking_char: "*",
      chars_to_mask: 6,
      from_end: true,
    });
    expect(result).toBe("1234******");
  });

  it("uses a custom masking character", () => {
    const result = operator.operate("abcdef", {
      masking_char: "#",
      chars_to_mask: 3,
      from_end: false,
    });
    expect(result).toBe("###def");
  });

  it("returns the full text masked with masking_char when chars_to_mask >= text length", () => {
    const result = operator.operate("hello", {
      masking_char: "*",
      chars_to_mask: 10,
      from_end: false,
    });
    expect(result).toBe("*****");
  });

  it("returns the original text when chars_to_mask is zero", () => {
    const result = operator.operate("hello", {
      masking_char: "*",
      chars_to_mask: 0,
      from_end: false,
    });
    expect(result).toBe("hello");
  });

  it("returns the original text when chars_to_mask is negative", () => {
    const result = operator.operate("hello", {
      masking_char: "*",
      chars_to_mask: -1,
      from_end: false,
    });
    expect(result).toBe("hello");
  });

  it("masks exact length — chars_to_mask === text.length", () => {
    const result = operator.operate("abc", {
      masking_char: "*",
      chars_to_mask: 3,
      from_end: false,
    });
    expect(result).toBe("***");
  });

  it("throws when masking_char is not a string", () => {
    expect(() =>
      operator.validate({ masking_char: 42, chars_to_mask: 1, from_end: false }),
    ).toThrow("masking_char must be a string");
  });

  it("throws when masking_char is longer than one character", () => {
    expect(() =>
      operator.validate({ masking_char: "ab", chars_to_mask: 1, from_end: false }),
    ).toThrow("masking_char must be a character");
  });

  it("throws when masking_char is empty string", () => {
    expect(() =>
      operator.validate({ masking_char: "", chars_to_mask: 1, from_end: false }),
    ).toThrow("masking_char must be a character");
  });

  it("throws when chars_to_mask is not a number", () => {
    expect(() =>
      operator.validate({ masking_char: "*", chars_to_mask: "5", from_end: false }),
    ).toThrow("chars_to_mask must be a number");
  });

  it("throws when from_end is not a boolean", () => {
    expect(() =>
      operator.validate({ masking_char: "*", chars_to_mask: 5, from_end: "yes" }),
    ).toThrow("from_end must be a boolean");
  });

  it("validates all parameters at once — throws on first failure", () => {
    expect(() =>
      operator.validate({ masking_char: 1, chars_to_mask: "x", from_end: 0 }),
    ).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Hash
// ---------------------------------------------------------------------------
describe("Hash operator", () => {
  const operator = new Hash();

  it("has Anonymize operator type", () => {
    expect(operator.operatorType).toBe(OperatorType.Anonymize);
  });

  it("returns a hex SHA-256 hash", async () => {
    const result = await operator.operate("hello", {});
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it("produces deterministic output for the same input", async () => {
    const hash1 = await operator.operate("deterministic test", {});
    const hash2 = await operator.operate("deterministic test", {});
    expect(hash1).toBe(hash2);
  });

  it("produces different hashes for different inputs", async () => {
    const hash1 = await operator.operate("input A", {});
    const hash2 = await operator.operate("input B", {});
    expect(hash1).not.toBe(hash2);
  });

  it("hashes empty string", async () => {
    const result = await operator.operate("", {});
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it("hashes long strings", async () => {
    const long = "x".repeat(10000);
    const result = await operator.operate(long, {});
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it("validation never throws", () => {
    expect(() => operator.validate({})).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Encrypt
// ---------------------------------------------------------------------------
describe("Encrypt operator", () => {
  const operator = new Encrypt();
  const validKey = "0123456789abcdef0123456789abcdef"; // 32 bytes = 256 bits

  it("has Anonymize operator type", () => {
    expect(operator.operatorType).toBe(OperatorType.Anonymize);
  });

  it(" Encrypt.KEY static property equals 'key'", () => {
    expect(Encrypt.KEY).toBe("key");
  });

  it("encrypts text and returns a non-empty string", async () => {
    const result = await operator.operate("secret", { key: validKey });
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("encrypted output differs from plaintext", async () => {
    const plaintext = "sensitive data";
    const result = await operator.operate(plaintext, { key: validKey });
    expect(result).not.toBe(plaintext);
  });

  it("throws when key is not a string or Uint8Array", () => {
    expect(() => operator.validate({ key: 42 })).toThrow(
      "key must be a string or Uint8Array",
    );
  });

  it("throws when key is too short (invalid key size)", () => {
    expect(() => operator.validate({ key: "short" })).toThrow(
      "Invalid input, key must be of length 128, 192 or 256 bits",
    );
  });

  it("accepts Uint8Array key of valid size", () => {
    const key = new Uint8Array(32);
    expect(() => operator.validate({ key })).not.toThrow();
  });

  it("throws when key is a Uint8Array of invalid size", () => {
    const key = new Uint8Array(5);
    expect(() => operator.validate({ key })).toThrow(
      "Invalid input, key must be of length 128, 192 or 256 bits",
    );
  });

  it("throws when key is missing", () => {
    expect(() => operator.validate({})).toThrow("key must be a string or Uint8Array");
  });
});

// ---------------------------------------------------------------------------
// Decrypt
// ---------------------------------------------------------------------------
describe("Decrypt operator", () => {
  const operator = new Decrypt();
  const validKey = "0123456789abcdef0123456789abcdef";

  it("has Deanonymize operator type", () => {
    expect(operator.operatorType).toBe(OperatorType.Deanonymize);
  });

  it("roundtrips: encrypt then decrypt returns original text", async () => {
    const encryptOp = new Encrypt();
    const ciphertext = await encryptOp.operate("original secret", { key: validKey });
    const decrypted = await operator.operate(ciphertext, { key: validKey });
    expect(decrypted).toBe("original secret");
  });

  it("throws when key is invalid", () => {
    expect(() => operator.validate({ key: "tooshort" })).toThrow();
  });

  it("throws when key is missing", () => {
    expect(() => operator.validate({})).toThrow();
  });
});

// ---------------------------------------------------------------------------
// Encrypt <-> Decrypt roundtrip
// ---------------------------------------------------------------------------
describe("Encrypt/Decrypt roundtrip", () => {
  const encryptOp = new Encrypt();
  const decryptOp = new Decrypt();
  const key = "0123456789abcdef0123456789abcdef";

  it("roundtrips empty string", async () => {
    const encrypted = await encryptOp.operate("", { key });
    const decrypted = await decryptOp.operate(encrypted, { key });
    expect(decrypted).toBe("");
  });

  it("roundtrips unicode text", async () => {
    const text = "Hello 世界 🌍";
    const encrypted = await encryptOp.operate(text, { key });
    const decrypted = await decryptOp.operate(encrypted, { key });
    expect(decrypted).toBe(text);
  });

  it("roundtrips long text", async () => {
    const text = "Lorem ipsum ".repeat(100);
    const encrypted = await encryptOp.operate(text, { key });
    const decrypted = await decryptOp.operate(encrypted, { key });
    expect(decrypted).toBe(text);
  });

  it("same plaintext produces different ciphertext each time (random IV)", async () => {
    const encrypted1 = await encryptOp.operate("same text", { key });
    const encrypted2 = await encryptOp.operate("same text", { key });
    expect(encrypted1).not.toBe(encrypted2);
  });

  it("decrypt with wrong key fails", async () => {
    const encrypted = await encryptOp.operate("secret", { key });
    const wrongKey = "abcdefabcdefabcdefabcdefabcdefab"; // different 32-byte key
    await expect(decryptOp.operate(encrypted, { key: wrongKey })).rejects.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Keep
// ---------------------------------------------------------------------------
describe("Keep operator", () => {
  const operator = new Keep();

  it("has Anonymize operator type", () => {
    expect(operator.operatorType).toBe(OperatorType.Anonymize);
  });

  it("returns original text unchanged", () => {
    expect(operator.operate("my text", {})).toBe("my text");
  });

  it("returns empty string for empty input", () => {
    expect(operator.operate("", {})).toBe("");
  });

  it("validation never throws", () => {
    expect(() => operator.validate({})).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Custom
// ---------------------------------------------------------------------------
describe("Custom operator", () => {
  const operator = new Custom();

  it("has Anonymize operator type", () => {
    expect(operator.operatorType).toBe(OperatorType.Anonymize);
  });

  it("Custom.LAMBDA static property equals 'lambda'", () => {
    expect(Custom.LAMBDA).toBe("lambda");
  });

  it("calls the lambda function with the text", () => {
    const result = operator.operate("hello", {
      lambda: (text: string) => `processed: ${text}`,
    });
    expect(result).toBe("processed: hello");
  });

  it("returns the lambda result", () => {
    const result = operator.operate("data", {
      lambda: () => "static replacement",
    });
    expect(result).toBe("static replacement");
  });

  it("throws when lambda is not a function", () => {
    expect(() => operator.validate({ lambda: "not a function" })).toThrow(
      "New value must be a callable function",
    );
  });

  it("throws when lambda returns non-string", () => {
    expect(() => operator.operate("text", { lambda: () => 42 })).toThrow(
      "Function return type must be a string",
    );
  });

  it("throws when lambda returns undefined", () => {
    expect(() => operator.operate("text", { lambda: () => {} })).toThrow(
      "Function return type must be a string",
    );
  });

  it("throws when lambda is missing", () => {
    expect(() => operator.validate({})).toThrow("New value must be a callable function");
  });
});

// ---------------------------------------------------------------------------
// OperatorsFactory
// ---------------------------------------------------------------------------
describe("OperatorsFactory", () => {
  let factory: OperatorsFactory;

  beforeEach(() => {
    factory = new OperatorsFactory();
  });

  it("registers default anonymize operators", () => {
    const anonymizers = factory.getAnonymizers();
    expect(anonymizers.has("replace")).toBe(true);
    expect(anonymizers.has("redact")).toBe(true);
    expect(anonymizers.has("mask")).toBe(true);
    expect(anonymizers.has("hash")).toBe(true);
    expect(anonymizers.has("encrypt")).toBe(true);
    expect(anonymizers.has("keep")).toBe(true);
    expect(anonymizers.has("custom")).toBe(true);
  });

  it("registers default deanonymize operators", () => {
    const deanonymizers = factory.getDeanonymizers();
    expect(deanonymizers.has("decrypt")).toBe(true);
  });

  it("creates an operator instance from name and type", () => {
    const op = factory.createOperatorClass("replace", OperatorType.Anonymize);
    expect(op).toBeInstanceOf(Replace);
  });

  it("creates a decrypt operator", () => {
    const op = factory.createOperatorClass("decrypt", OperatorType.Deanonymize);
    expect(op).toBeInstanceOf(Decrypt);
  });

  it("throws for unregistered operator name", () => {
    expect(() =>
      factory.createOperatorClass("nonexistent", OperatorType.Anonymize),
    ).toThrow("Operator nonexistent is not registered for type anonymize");
  });

  it("allows adding a new anonymize operator", () => {
    factory.addAnonymizeOperator("my_op", class extends Replace {});
    expect(factory.getAnonymizers().has("my_op")).toBe(true);
  });

  it("allows removing an anonymize operator", () => {
    factory.removeAnonymizeOperator("replace");
    expect(factory.getAnonymizers().has("replace")).toBe(false);
  });

  it("allows adding a new deanonymize operator", () => {
    factory.addDeanonymizeOperator("my_dec", class extends Decrypt {});
    expect(factory.getDeanonymizers().has("my_dec")).toBe(true);
  });

  it("allows removing a deanonymize operator", () => {
    factory.removeDeanonymizeOperator("decrypt");
    expect(factory.getDeanonymizers().has("decrypt")).toBe(false);
  });
});
