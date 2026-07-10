import { EntityRecognizer, NlpArtifacts, RecognizerResult } from "@presidio/core";

// Concrete subclass for testing the abstract EntityRecognizer
class TestRecognizer extends EntityRecognizer {
  load(): void {
    // No-op
  }

  analyze(_text: string, _entities: string[], _nlpArtifacts: NlpArtifacts | null): RecognizerResult[] {
    return [];
  }
}

describe("EntityRecognizer", () => {
  describe("static constants", () => {
    test("MIN_SCORE is 0", () => {
      expect(EntityRecognizer.MIN_SCORE).toBe(0);
    });

    test("MAX_SCORE is 1.0", () => {
      expect(EntityRecognizer.MAX_SCORE).toBe(1.0);
    });

    test("COUNTRY_CODE defaults to null", () => {
      expect(EntityRecognizer.COUNTRY_CODE).toBeNull();
    });
  });

  describe("constructor", () => {
    test("concrete subclass can be instantiated", () => {
      const rec = new TestRecognizer(["PERSON"]);
      expect(rec.supportedEntities).toEqual(["PERSON"]);
      expect(rec.name).toBe("TestRecognizer");
      expect(rec.supportedLanguage).toBe("en");
      expect(rec.version).toBe("0.0.1");
      expect(rec.isLoaded).toBe(true);
      expect(rec.context).toEqual([]);
    });

    test("custom name overrides constructor name", () => {
      const rec = new TestRecognizer(["PERSON"], "CustomName");
      expect(rec.name).toBe("CustomName");
    });

    test("sets custom language and version", () => {
      const rec = new TestRecognizer(["EMAIL"], "EmailRec", "es", "1.2.3");
      expect(rec.supportedLanguage).toBe("es");
      expect(rec.version).toBe("1.2.3");
    });

    test("sets context array", () => {
      const rec = new TestRecognizer(["SSN"], null, "en", "0.0.1", ["ssn", "social security"]);
      expect(rec.context).toEqual(["ssn", "social security"]);
    });

    test("generates unique id", () => {
      const a = new TestRecognizer(["A"]);
      const b = new TestRecognizer(["A"]);
      expect(a.id).not.toBe(b.id);
      expect(a.id).toMatch(/^TestRecognizer_/);
    });
  });

  describe("countryCode and isCountrySpecific", () => {
    test("no country code returns null and isCountrySpecific is false", () => {
      const rec = new TestRecognizer(["PERSON"]);
      expect(rec.countryCode()).toBeNull();
      expect(rec.isCountrySpecific()).toBe(false);
    });

    test("country code passed in constructor", () => {
      const rec = new TestRecognizer(["PERSON"], null, "en", "0.0.1", null, "US");
      expect(rec.countryCode()).toBe("us");
      expect(rec.isCountrySpecific()).toBe(true);
    });

    test("country code is normalized to lowercase", () => {
      const rec = new TestRecognizer(["PERSON"], null, "en", "0.0.1", null, "Us");
      expect(rec.countryCode()).toBe("us");
    });
  });

  describe("getSupportedEntities, getSupportedLanguage, getVersion", () => {
    test("returns correct values", () => {
      const rec = new TestRecognizer(["EMAIL", "PHONE"], "MultiRec", "fr", "2.0.0");
      expect(rec.getSupportedEntities()).toEqual(["EMAIL", "PHONE"]);
      expect(rec.getSupportedLanguage()).toBe("fr");
      expect(rec.getVersion()).toBe("2.0.0");
    });
  });

  describe("enhanceUsingContext", () => {
    test("returns results unchanged by default", () => {
      const rec = new TestRecognizer(["PERSON"]);
      const results = [new RecognizerResult("PERSON", 0, 5, 0.8)];
      const enhanced = rec.enhanceUsingContext(
        "test",
        results,
        [],
        null,
      );
      expect(enhanced).toBe(results);
    });
  });

  describe("toDict", () => {
    test("returns dictionary with expected keys", () => {
      const rec = new TestRecognizer(["PERSON"], "PersonRec", "en", "1.0.0");
      const dict = rec.toDict();
      expect(dict.supported_entities).toEqual(["PERSON"]);
      expect(dict.supported_language).toBe("en");
      expect(dict.name).toBe("PersonRec");
      expect(dict.version).toBe("1.0.0");
      expect(dict).not.toHaveProperty("country_code");
    });

    test("includes country_code when set", () => {
      const rec = new TestRecognizer(["PERSON"], null, "en", "0.0.1", null, "US");
      const dict = rec.toDict();
      expect(dict.country_code).toBe("us");
    });
  });

  describe("static removeDuplicates", () => {
    test("removes duplicate results with same hashCode", () => {
      const r1 = new RecognizerResult("PERSON", 0, 6, 0.85);
      const r2 = new RecognizerResult("PERSON", 0, 6, 0.85);
      const r3 = new RecognizerResult("EMAIL", 10, 20, 0.7);
      const results = [r1, r2, r3];
      const deduped = EntityRecognizer.removeDuplicates(results);
      expect(deduped).toHaveLength(2);
      expect(deduped.some((r) => r.entityType === "PERSON")).toBe(true);
      expect(deduped.some((r) => r.entityType === "EMAIL")).toBe(true);
    });

    test("filters out zero-score results", () => {
      const r1 = new RecognizerResult("PERSON", 0, 6, 0.0);
      const r2 = new RecognizerResult("EMAIL", 10, 20, 0.7);
      const results = [r1, r2];
      const deduped = EntityRecognizer.removeDuplicates(results);
      expect(deduped).toHaveLength(1);
      expect(deduped[0].entityType).toBe("EMAIL");
    });

    test("removes results contained in others with same entity type when outer is processed first", () => {
      // The sort in removeDuplicates is by score ascending, so the lower-score
      // (inner, 0.6) is processed before the higher-score (outer, 0.85).
      // When inner is added first, the outer is not containedIn(inner), so both survive.
      // To trigger containment removal, pass them in an order where the outer
      // is sorted before the inner (outer has lower score).
      const outer = new RecognizerResult("PERSON", 0, 20, 0.5);
      const inner = new RecognizerResult("PERSON", 5, 10, 0.85);
      const results = [outer, inner];
      const deduped = EntityRecognizer.removeDuplicates(results);
      // After ascending sort: outer (0.5) processed first, then inner (0.85).
      // inner.containedIn(outer) is true and same entity type -> inner removed
      expect(deduped).toHaveLength(1);
      expect(deduped[0].entityType).toBe("PERSON");
      expect(deduped[0].start).toBe(0);
      expect(deduped[0].end).toBe(20);
    });

    test("keeps contained result if entity types differ", () => {
      const outer = new RecognizerResult("PERSON", 0, 20, 0.85);
      const inner = new RecognizerResult("EMAIL", 5, 10, 0.6);
      const results = [outer, inner];
      const deduped = EntityRecognizer.removeDuplicates(results);
      // Different entity types, both should be kept
      expect(deduped).toHaveLength(2);
    });

    test("sorts results by ascending score after deduplication", () => {
      const r1 = new RecognizerResult("A", 0, 5, 0.3);
      const r2 = new RecognizerResult("B", 10, 15, 0.9);
      const r3 = new RecognizerResult("C", 20, 25, 0.6);
      const results = [r1, r2, r3];
      const deduped = EntityRecognizer.removeDuplicates(results);
      // The sort expression evaluates to ascending score order
      expect(deduped.map((r) => r.score)).toEqual([0.3, 0.6, 0.9]);
    });

    test("empty input returns empty output", () => {
      expect(EntityRecognizer.removeDuplicates([])).toEqual([]);
    });
  });

  describe("static sanitizeValue", () => {
    test("replaces all occurrences of search string", () => {
      const result = EntityRecognizer.sanitizeValue("John Doe", [
        ["John", "***"],
        ["Doe", "***"],
      ]);
      expect(result).toBe("*** ***");
    });

    test("applies replacements in order", () => {
      const result = EntityRecognizer.sanitizeValue("My SSN is 123-45-6789", [
        ["123-45-6789", "XXX-XX-XXXX"],
      ]);
      expect(result).toBe("My SSN is XXX-XX-XXXX");
    });

    test("empty replacement pairs returns original text", () => {
      const result = EntityRecognizer.sanitizeValue("no changes", []);
      expect(result).toBe("no changes");
    });

    test("multiple replacements", () => {
      const result = EntityRecognizer.sanitizeValue("foo bar baz foo", [
        ["foo", "X"],
        ["bar", "Y"],
      ]);
      expect(result).toBe("X Y baz X");
    });
  });

  describe("country code validation via constructor", () => {
    test("non-string country code throws TypeError", () => {
      // @ts-expect-error - intentionally passing invalid type
      expect(() => new TestRecognizer(["A"], null, "en", "0.0.1", null, 123)).toThrow(TypeError);
    });

    test("empty string country code throws Error", () => {
      expect(() => new TestRecognizer(["A"], null, "en", "0.0.1", null, "")).toThrow(
        /country_code must be a non-empty string/,
      );
    });

    test("whitespace-only country code throws Error", () => {
      expect(() => new TestRecognizer(["A"], null, "en", "0.0.1", null, "   ")).toThrow(
        /country_code must be a non-empty string/,
      );
    });

    test("class-level COUNTRY_CODE is respected", () => {
      class USRecognizer extends TestRecognizer {
        static COUNTRY_CODE = "US";
      }
      const rec = new USRecognizer(["PERSON"]);
      expect(rec.countryCode()).toBe("us");
    });

    test("conflicting class-level and passed country code throws", () => {
      class USRecognizer extends TestRecognizer {
        static COUNTRY_CODE = "US";
      }
      expect(() => new USRecognizer(["A"], null, "en", "0.0.1", null, "CA")).toThrow(
        /conflicts with class-level/,
      );
    });

    test("matching class-level and passed country code works", () => {
      class USRecognizer extends TestRecognizer {
        static COUNTRY_CODE = "US";
      }
      const rec = new USRecognizer(["A"], null, "en", "0.0.1", null, "us");
      expect(rec.countryCode()).toBe("us");
    });
  });
});