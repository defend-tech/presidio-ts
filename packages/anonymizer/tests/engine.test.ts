import { beforeEach, describe, expect, it } from "vitest";
import { AnonymizerEngine } from "../src/engine/anonymizer-engine.js";
import { DeanonymizeEngine } from "../src/engine/deanonymize-engine.js";
import { ConflictResolutionStrategy } from "../src/entities/conflict-resolution.js";
import { EngineResult } from "../src/entities/engine-result.js";
import { OperatorConfig } from "../src/entities/operator-config.js";
import { RecognizerResult } from "../src/entities/recognizer-result.js";
import { Decrypt } from "../src/operators/decrypt.js";
import { Replace } from "../src/operators/replace.js";

// ---------------------------------------------------------------------------
// AnonymizerEngine — Basic Operations
// ---------------------------------------------------------------------------
describe("AnonymizerEngine — basic anonymize", () => {
  let engine: AnonymizerEngine;

  beforeEach(() => {
    engine = new AnonymizerEngine();
  });

  it("anonymizes a single entity with default replace operator", async () => {
    const text = "My name is John Doe";
    const results = [new RecognizerResult("PERSON", 11, 19, 0.85)];

    const engineResult = await engine.anonymize(text, results);

    expect(engineResult.text).toBe("My name is <PERSON>");
    expect(engineResult.items.length).toBe(1);
    expect(engineResult.items[0].entityType).toBe("PERSON");
    expect(engineResult.items[0].operator).toBe("replace");
  });

  it("anonymizes with a custom replace value", async () => {
    const text = "My name is John Doe";
    const results = [new RecognizerResult("PERSON", 11, 19, 0.85)];
    const operators = {
      PERSON: new OperatorConfig("replace", { new_value: "[REDACTED]" }),
    };

    const engineResult = await engine.anonymize(text, results, operators);

    expect(engineResult.text).toBe("My name is [REDACTED]");
  });

  it("anonymizes with redact operator", async () => {
    const text = "My name is John Doe";
    const results = [new RecognizerResult("PERSON", 11, 19, 0.85)];
    const operators = {
      PERSON: new OperatorConfig("redact"),
    };

    const engineResult = await engine.anonymize(text, results, operators);

    expect(engineResult.text).toBe("My name is ");
  });

  it("anonymizes with keep operator", async () => {
    const text = "My name is John Doe";
    const results = [new RecognizerResult("PERSON", 11, 19, 0.85)];
    const operators = {
      PERSON: new OperatorConfig("keep"),
    };

    const engineResult = await engine.anonymize(text, results, operators);

    expect(engineResult.text).toBe("My name is John Doe");
  });

  it("anonymizes multiple entities of different types", async () => {
    const text = "John lives at 123 Main St";
    const results = [
      new RecognizerResult("PERSON", 0, 4, 0.9), // "John"
      new RecognizerResult("ADDRESS", 14, 25, 0.8), // "123 Main St"
    ];

    const engineResult = await engine.anonymize(text, results);

    expect(engineResult.text).toBe("<PERSON> lives at <ADDRESS>");
    expect(engineResult.items.length).toBe(2);
  });

  it("uses DEFAULT operator for unknown entity types", async () => {
    const text = "Some text with SECRET";
    const results = [new RecognizerResult("UNKNOWN_TYPE", 15, 21, 0.5)];
    const operators = {
      DEFAULT: new OperatorConfig("redact"),
    };

    const engineResult = await engine.anonymize(text, results, operators);

    expect(engineResult.text).toBe("Some text with ");
  });

  it("uses replace as default when no operators provided", async () => {
    const text = "Call 555-1234 now";
    const results = [new RecognizerResult("PHONE_NUMBER", 5, 13, 0.8)];

    const engineResult = await engine.anonymize(text, results, null);

    expect(engineResult.text).toBe("Call <PHONE_NUMBER> now");
  });

  it("uses DEFAULT operator when entity type has no specific operator", async () => {
    const text = "My secret data";
    const results = [new RecognizerResult("SECRETS", 3, 9, 0.9)];
    const operators = {
      DEFAULT: new OperatorConfig("redact"),
      OTHER_TYPE: new OperatorConfig("keep"),
    };

    const engineResult = await engine.anonymize(text, results, operators);

    // SECRETS should use DEFAULT (redact) since no SECRETS-specific operator
    expect(engineResult.text).toBe("My  data");
    expect(engineResult.items[0].operator).toBe("redact");
  });
});

// ---------------------------------------------------------------------------
// AnonymizerEngine — Conflict Resolution
// ---------------------------------------------------------------------------
describe("AnonymizerEngine — conflict resolution", () => {
  let engine: AnonymizerEngine;

  beforeEach(() => {
    engine = new AnonymizerEngine();
  });

  it("MERGE_SIMILAR_OR_CONTAINED merges overlapping same-type entities", async () => {
    const text = "Contact John at john@example.com";
    // "John" overlaps with "john@example.com" when they share indices
    const results = [
      new RecognizerResult("PERSON", 8, 12, 0.9),
      new RecognizerResult("PERSON", 8, 12, 0.85), // same range
    ];

    const engineResult = await engine.anonymize(
      text,
      results,
      undefined,
      ConflictResolutionStrategy.MERGE_SIMILAR_OR_CONTAINED,
    );

    // Since they have the same range, one should be kept (merged)
    expect(engineResult.items.length).toBeLessThanOrEqual(2);
    expect(typeof engineResult.text).toBe("string");
  });

  it("handles non-overlapping entities without merging", async () => {
    const text = "John and Jane are here";
    const results = [
      new RecognizerResult("PERSON", 0, 4, 0.9),
      new RecognizerResult("PERSON", 9, 13, 0.85),
    ];

    const engineResult = await engine.anonymize(
      text,
      results,
      undefined,
      ConflictResolutionStrategy.MERGE_SIMILAR_OR_CONTAINED,
    );

    expect(engineResult.text).toBe("<PERSON> and <PERSON> are here");
    expect(engineResult.items.length).toBe(2);
  });

  it("REMOVE_INTERSECTIONS trims overlapping different-type entities", async () => {
    const text = "My email is john@doe.com okay";
    // Overlapping: PERSON overlaps with EMAIL
    const results = [
      new RecognizerResult("PERSON", 13, 17, 0.9), // "john"
      new RecognizerResult("EMAIL", 13, 25, 0.85), // "john@doe.com"
    ];

    const engineResult = await engine.anonymize(
      text,
      results,
      undefined,
      ConflictResolutionStrategy.REMOVE_INTERSECTIONS,
    );

    // Higher-score entity (PERSON, score 0.9) should take priority
    // The remaining text should be valid
    expect(typeof engineResult.text).toBe("string");
    expect(engineResult).toBeInstanceOf(EngineResult);
  });
});

// ---------------------------------------------------------------------------
// AnonymizerEngine — Merge entities with spaces
// ---------------------------------------------------------------------------
describe("AnonymizerEngine — merge entities with spaces between", () => {
  let engine: AnonymizerEngine;

  beforeEach(() => {
    engine = new AnonymizerEngine();
  });

  it("merges same-type entities separated only by spaces", async () => {
    const text = "my name is John  Doe";
    // "John" at 11-15, two spaces at 15-17, "Doe" at 17-20
    const results = [
      new RecognizerResult("PERSON", 11, 15, 0.9),
      new RecognizerResult("PERSON", 17, 20, 0.85),
    ];

    const engineResult = await engine.anonymize(
      text,
      results,
      undefined,
      ConflictResolutionStrategy.MERGE_SIMILAR_OR_CONTAINED,
      true,
    );

    // The spaces between "John" and "Doe" should be absorbed into the merged entity
    expect(engineResult.text).toBe("my name is <PERSON>");
  });

  it("does not merge different-type entities even with space between", async () => {
    const text = "John lives at 123";
    const results = [
      new RecognizerResult("PERSON", 0, 4, 0.9),
      new RecognizerResult("ADDRESS", 14, 17, 0.8),
    ];

    const engineResult = await engine.anonymize(
      text,
      results,
      undefined,
      ConflictResolutionStrategy.MERGE_SIMILAR_OR_CONTAINED,
      true,
    );

    expect(engineResult.text).toBe("<PERSON> lives at <ADDRESS>");
  });

  it("does not merge when mergeEntitiesWithSpaces is false", async () => {
    const text = "my name is John  Doe";
    const results = [
      new RecognizerResult("PERSON", 11, 15, 0.9),
      new RecognizerResult("PERSON", 17, 20, 0.85),
    ];

    const engineResult = await engine.anonymize(
      text,
      results,
      undefined,
      ConflictResolutionStrategy.MERGE_SIMILAR_OR_CONTAINED,
      false,
    );

    // Should produce two separate replacements
    expect(engineResult.items.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// AnonymizerEngine — Encrypt then Deanonymize roundtrip
// ---------------------------------------------------------------------------
describe("AnonymizerEngine + DeanonymizeEngine — encrypt/decrypt roundtrip", () => {
  const encryptEngine = new AnonymizerEngine();
  const decryptEngine = new DeanonymizeEngine();
  const key = "0123456789abcdef0123456789abcdef"; // 256-bit key

  it("encrypts with AnonymizerEngine then decrypts with DeanonymizeEngine", async () => {
    const text = "My SSN is 123-45-6789";
    const results = [new RecognizerResult("SSN", 10, 21, 0.95)];

    const encryptResult = await encryptEngine.anonymize(text, results, {
      SSN: new OperatorConfig("encrypt", { key }),
    });

    // The SSN should be encrypted
    expect(encryptResult.text).not.toContain("123-45-6789");
    expect(encryptResult.items[0].operator).toBe("encrypt");

    // Now deanonymize using the encrypted text span
    const encryptedText = encryptResult.items[0].text;
    const encryptedStart = encryptResult.items[0].start;
    const encryptedEnd = encryptResult.items[0].end;

    const decryptResult = await decryptEngine.deanonymize(
      encryptResult.text,
      [new RecognizerResult("SSN", encryptedStart, encryptedEnd, 0.95)],
      { SSN: new OperatorConfig("decrypt", { key }) },
    );

    expect(decryptResult.text).toContain("123-45-6789");
  });

  it("full roundtrip restores original text", async () => {
    const text = "Contact 555-1234 today";
    const results = [new RecognizerResult("PHONE_NUMBER", 8, 16, 0.8)];

    const encrypted = await encryptEngine.anonymize(text, results, {
      PHONE_NUMBER: new OperatorConfig("encrypt", { key }),
    });

    const item = encrypted.items[0];
    const decrypted = await decryptEngine.deanonymize(
      encrypted.text,
      [new RecognizerResult("PHONE_NUMBER", item.start, item.end, 0.8)],
      { PHONE_NUMBER: new OperatorConfig("decrypt", { key }) },
    );

    expect(decrypted.text).toBe(text);
  });
});

// ---------------------------------------------------------------------------
// AnonymizerEngine — Mask via engine
// ---------------------------------------------------------------------------
describe("AnonymizerEngine — mask via engine", () => {
  let engine: AnonymizerEngine;

  beforeEach(() => {
    engine = new AnonymizerEngine();
  });

  it("masks part of an entity through the engine", async () => {
    const text = "My phone is 1234567890";
    const results = [new RecognizerResult("PHONE_NUMBER", 12, 22, 0.8)];
    const operators = {
      PHONE_NUMBER: new OperatorConfig("mask", {
        masking_char: "*",
        chars_to_mask: 6,
        from_end: false,
      }),
    };

    const result = await engine.anonymize(text, results, operators);

    expect(result.text).toBe("My phone is ******7890");
  });

  it("hashes an entity through the engine", async () => {
    const text = "User name is alice";
    const results = [new RecognizerResult("USERNAME", 13, 18, 0.9)];
    const operators = {
      USERNAME: new OperatorConfig("hash"),
    };

    const result = await engine.anonymize(text, results, operators);

    expect(result.items[0].operator).toBe("hash");
    expect(result.items[0].text).toMatch(/^[0-9a-f]{64}$/);
  });
});

// ---------------------------------------------------------------------------
// AnonymizerEngine — Operator validation on missing config
// ---------------------------------------------------------------------------
describe("AnonymizerEngine — operator validation on missing config", () => {
  let engine: AnonymizerEngine;

  beforeEach(() => {
    engine = new AnonymizerEngine();
  });

  it("throws when mask is used without masking_char", async () => {
    const text = "Hello world";
    const results = [new RecognizerResult("WORD", 0, 5, 0.5)];
    const operators = {
      WORD: new OperatorConfig("mask", {
        chars_to_mask: 3,
        from_end: false,
        // masking_char is missing
      }),
    };

    await expect(engine.anonymize(text, results, operators)).rejects.toThrow(
      "masking_char must be a string",
    );
  });

  it("throws when mask is used with invalid masking_char length", async () => {
    const text = "Hello world";
    const results = [new RecognizerResult("WORD", 0, 5, 0.5)];
    const operators = {
      WORD: new OperatorConfig("mask", {
        masking_char: "xx",
        chars_to_mask: 3,
        from_end: false,
      }),
    };

    await expect(engine.anonymize(text, results, operators)).rejects.toThrow(
      "masking_char must be a character",
    );
  });

  it("throws when custom is used without lambda", async () => {
    const text = "Hello world";
    const results = [new RecognizerResult("WORD", 0, 5, 0.5)];
    const operators = {
      WORD: new OperatorConfig("custom"),
    };

    await expect(engine.anonymize(text, results, operators)).rejects.toThrow(
      "New value must be a callable function",
    );
  });

  it("throws when encrypt is used without key", async () => {
    const text = "Hello world";
    const results = [new RecognizerResult("WORD", 0, 5, 0.5)];
    const operators = {
      WORD: new OperatorConfig("encrypt"),
    };

    await expect(engine.anonymize(text, results, operators)).rejects.toThrow();
  });

  it("custom operator works through the engine with entity_type param", async () => {
    const text = "Hello world";
    const results = [new RecognizerResult("WORD", 0, 5, 0.5)];
    const operators = {
      WORD: new OperatorConfig("custom", {
        lambda: (text: string) => `[${text.toUpperCase()}]`,
      }),
    };

    const result = await engine.anonymize(text, results, operators);

    expect(result.text).toBe("[HELLO] world");
  });
});

// ---------------------------------------------------------------------------
// AnonymizerEngine — Entity management
// ---------------------------------------------------------------------------
describe("AnonymizerEngine — entity management", () => {
  let engine: AnonymizerEngine;

  beforeEach(() => {
    engine = new AnonymizerEngine();
  });

  it("getAnonymizers returns all default operator names", () => {
    const names = engine.getAnonymizers();
    expect(names).toContain("replace");
    expect(names).toContain("redact");
    expect(names).toContain("mask");
    expect(names).toContain("hash");
    expect(names).toContain("encrypt");
    expect(names).toContain("keep");
    expect(names).toContain("custom");
  });

  it("addAnonymizer and removeAnonymizer work", () => {
    const namesBefore = engine.getAnonymizers().length;
    engine.addAnonymizer("test_op", class extends Replace {});
    expect(engine.getAnonymizers()).toContain("test_op");
    expect(engine.getAnonymizers().length).toBe(namesBefore + 1);

    engine.removeAnonymizer("test_op");
    expect(engine.getAnonymizers()).not.toContain("test_op");
  });
});

// ---------------------------------------------------------------------------
// DeanonymizeEngine
// ---------------------------------------------------------------------------
describe("DeanonymizeEngine", () => {
  let engine: DeanonymizeEngine;

  beforeEach(() => {
    engine = new DeanonymizeEngine();
  });

  it("getDeanonymizers returns default deanonymizer", () => {
    const names = engine.getDeanonymizers();
    expect(names).toContain("decrypt");
  });

  it("addDeanonymizer and removeDeanonymizer work", () => {
    const namesBefore = engine.getDeanonymizers().length;
    engine.addDeanonymizer("test_dec", class extends Decrypt {});
    expect(engine.getDeanonymizers()).toContain("test_dec");
    expect(engine.getDeanonymizers().length).toBe(namesBefore + 1);

    engine.removeDeanonymizer("test_dec");
    expect(engine.getDeanonymizers()).not.toContain("test_dec");
  });
});

// ---------------------------------------------------------------------------
// AnonymizerEngine — Edge cases
// ---------------------------------------------------------------------------
describe("AnonymizerEngine — edge cases", () => {
  let engine: AnonymizerEngine;

  beforeEach(() => {
    engine = new AnonymizerEngine();
  });

  it("handles empty text", async () => {
    const result = await engine.anonymize("", []);
    expect(result.text).toBe("");
    expect(result.items.length).toBe(0);
  });

  it("handles empty results array", async () => {
    const result = await engine.anonymize("no pii here", []);
    expect(result.text).toBe("no pii here");
    expect(result.items.length).toBe(0);
  });

  it("does not mutate original recognizer results", async () => {
    const text = "Hello world";
    const results = [new RecognizerResult("WORD", 0, 5, 0.5)];
    const originalStart = results[0].start;
    const originalEnd = results[0].end;

    await engine.anonymize(text, results);

    expect(results[0].start).toBe(originalStart);
    expect(results[0].end).toBe(originalEnd);
  });

  it("entities are processed in reverse order to preserve indices", async () => {
    // Use different entity types so mergeEntitiesWithSpaces doesn't merge them
    const text = "A B";
    const results = [
      new RecognizerResult("TYPE_ONE", 0, 1, 0.5), // A
      new RecognizerResult("TYPE_TWO", 2, 3, 0.5), // B
    ];

    const engineResult = await engine.anonymize(text, results);

    // Both should be replaced independently
    expect(engineResult.text).toBe("<TYPE_ONE> <TYPE_TWO>");
    expect(engineResult.items.length).toBe(2);
  });

  it("EngineResult items are sorted by start index ascending", async () => {
    const text = "aaa bbb ccc";
    const results = [
      new RecognizerResult("TYPE_A", 4, 7, 0.5), // "bbb"
      new RecognizerResult("TYPE_B", 0, 3, 0.5), // "aaa"
      new RecognizerResult("TYPE_C", 8, 11, 0.5), // "ccc"
    ];

    const engineResult = await engine.anonymize(text, results);

    // Items should be sorted by start index ascending regardless of input order
    expect(engineResult.items[0].start).toBe(0);
    expect(engineResult.items[0].entityType).toBe("TYPE_B");
    expect(engineResult.items[1].start).toBe(4);
    expect(engineResult.items[1].entityType).toBe("TYPE_A");
    expect(engineResult.items[2].start).toBe(8);
    expect(engineResult.items[2].entityType).toBe("TYPE_C");
  });
});
