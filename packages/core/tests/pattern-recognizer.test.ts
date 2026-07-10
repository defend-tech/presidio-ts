import { Pattern, PatternRecognizer, RecognizerResult } from "@defend-tech/presidio-core";

describe("PatternRecognizer", () => {
  describe("constructor validation", () => {
    test("throws when supportedEntity is empty", () => {
      const pattern = new Pattern("test", "\\d+", 0.5);
      // @ts-expect-error - intentionally passing empty entity
      expect(() => new PatternRecognizer("", null, "en", [pattern])).toThrow(
        /Pattern recognizer should be initialized with entity/,
      );
    });

    test("throws when no patterns or denyList provided", () => {
      expect(() => new PatternRecognizer("MY_ENTITY")).toThrow(
        /Pattern recognizer should be initialized with patterns or with deny list/,
      );
    });

    test("throws when patterns array is empty and no denyList", () => {
      expect(() => new PatternRecognizer("MY_ENTITY", null, "en", [])).toThrow(
        /Pattern recognizer should be initialized with patterns or with deny list/,
      );
    });

    test("creates with patterns", () => {
      const pattern = new Pattern("test", "\\d+", 0.5);
      const rec = new PatternRecognizer("NUMBER", "NumRec", "en", [pattern]);
      expect(rec.supportedEntities).toEqual(["NUMBER"]);
      expect(rec.name).toBe("NumRec");
      expect(rec.patterns).toEqual([pattern]);
      expect(rec.denyList).toEqual([]);
    });

    test("creates with denyList only", () => {
      const rec = new PatternRecognizer("TITLE", null, "en", null, ["Mr", "Mrs"]);
      expect(rec.denyList).toEqual(["Mr", "Mrs"]);
      // A deny_list pattern is auto-added
      expect(rec.patterns.length).toBeGreaterThan(0);
    });

    test("creates with both patterns and denyList", () => {
      const pattern = new Pattern("ssn", "\\d{3}-\\d{2}-\\d{4}", 0.85);
      const rec = new PatternRecognizer("PII", null, "en", [pattern], ["secret"]);
      expect(rec.denyList).toEqual(["secret"]);
      expect(rec.patterns.length).toBe(2); // original pattern + auto-generated deny_list
    });

    test("default denyListScore is 1.0", () => {
      const rec = new PatternRecognizer("TITLE", null, "en", null, ["Mr"]);
      expect(rec.denyListScore).toBe(1.0);
    });

    test("default globalRegexFlags is 'gmsi'", () => {
      const rec = new PatternRecognizer("TITLE", null, "en", null, ["Mr"]);
      expect(rec.globalRegexFlags).toBe("gmsi");
    });

    test("custom globalRegexFlags", () => {
      const rec = new PatternRecognizer(
        "TITLE",
        null,
        "en",
        null,
        ["Mr"],
        null,
        1.0,
        "gi",
      );
      expect(rec.globalRegexFlags).toBe("gi");
    });
  });

  describe("analyze with regex patterns", () => {
    test("finds matching patterns in text", () => {
      const pattern = new Pattern("digits", "\\d+", 0.5);
      const rec = new PatternRecognizer("NUMBER", null, "en", [pattern]);
      const results = rec.analyze("I have 123 apples", ["NUMBER"], null);
      expect(results.length).toBeGreaterThan(0);
      const match = results.find((r) => r.start === 7 && r.end === 10);
      expect(match).toBeDefined();
      expect(match?.entityType).toBe("NUMBER");
      expect(match?.score).toBe(0.5);
    });

    test("returns empty array when no matches", () => {
      const pattern = new Pattern("digits", "\\d+", 0.5);
      const rec = new PatternRecognizer("NUMBER", null, "en", [pattern]);
      const results = rec.analyze("No numbers here", ["NUMBER"], null);
      expect(results.length).toBe(0);
    });

    test("finds multiple matches", () => {
      const pattern = new Pattern("digits", "\\d+", 0.5);
      const rec = new PatternRecognizer("NUMBER", null, "en", [pattern]);
      const results = rec.analyze("I have 123 and 456", ["NUMBER"], null);
      expect(results.length).toBe(2);
    });

    test("result includes metadata with recognizer name and id", () => {
      const pattern = new Pattern("test", "\\d+", 0.5);
      const rec = new PatternRecognizer("NUM", "TestRec", "en", [pattern]);
      const results = rec.analyze("num: 42", ["NUM"], null);
      expect(results.length).toBeGreaterThan(0);
      const meta = results[0].recognitionMetadata;
      expect(meta?.[RecognizerResult.RECOGNIZER_NAME_KEY]).toBe("TestRec");
      expect(meta?.[RecognizerResult.RECOGNIZER_IDENTIFIER_KEY]).toBe(rec.id);
    });

    test("result includes AnalysisExplanation", () => {
      const pattern = new Pattern("test", "\\d+", 0.5);
      const rec = new PatternRecognizer("NUM", "TestRec", "en", [pattern]);
      const results = rec.analyze("num: 42", ["NUM"], null);
      expect(results[0].analysisExplanation).not.toBeNull();
      expect(results[0].analysisExplanation?.recognizer).toBe("TestRec");
    });
  });

  describe("denyList functionality", () => {
    test("detects deny list items in text (case insensitive)", () => {
      const rec = new PatternRecognizer("TITLE", null, "en", null, [
        "secret",
        "classified",
      ]);
      const results = rec.analyze("This is SECRET data", ["TITLE"], null);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].entityType).toBe("TITLE");
    });

    test("deny list respects word boundaries", () => {
      const rec = new PatternRecognizer("TITLE", null, "en", null, ["foo"]);
      // "foo" as a whole word should match
      const results = rec.analyze("hello foo world", ["TITLE"], null);
      expect(results.length).toBeGreaterThan(0);
    });

    test("custom denyListScore is used", () => {
      const rec = new PatternRecognizer("TITLE", null, "en", null, ["Mr"], null, 0.6);
      const results = rec.analyze("Mr Smith", ["TITLE"], null);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].score).toBe(0.6);
    });
  });

  describe("validateResult override", () => {
    test("validateResult returning true sets score to MAX_SCORE", () => {
      class ValidatingRecognizer extends PatternRecognizer {
        validateResult(_patternText: string): boolean | null {
          return true;
        }
      }
      const pattern = new Pattern("test", "\\d+", 0.3);
      const rec = new ValidatingRecognizer("NUM", null, "en", [pattern]);
      const results = rec.analyze("num: 42", ["NUM"], null);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].score).toBe(1.0); // MAX_SCORE
    });

    test("validateResult returning false sets score to MIN_SCORE (0) and filters result", () => {
      class InvalidatingRecognizer extends PatternRecognizer {
        validateResult(_patternText: string): boolean | null {
          return false;
        }
      }
      const pattern = new Pattern("test", "\\d+", 0.5);
      const rec = new InvalidatingRecognizer("NUM", null, "en", [pattern]);
      const results = rec.analyze("num: 42", ["NUM"], null);
      // Results with score 0 are filtered out
      expect(results.length).toBe(0);
    });
  });

  describe("invalidateResult override", () => {
    test("invalidateResult returning true sets score to MIN_SCORE and filters result", () => {
      class InvalidationRecognizer extends PatternRecognizer {
        invalidateResult(_patternText: string): boolean | null {
          return true;
        }
      }
      const pattern = new Pattern("test", "\\d+", 0.8);
      const rec = new InvalidationRecognizer("NUM", null, "en", [pattern]);
      const results = rec.analyze("num: 42", ["NUM"], null);
      expect(results.length).toBe(0);
    });

    test("invalidateResult returning false keeps the original score", () => {
      class KeepRecognizer extends PatternRecognizer {
        invalidateResult(_patternText: string): boolean | null {
          return false;
        }
      }
      const pattern = new Pattern("test", "\\d+", 0.8);
      const rec = new KeepRecognizer("NUM", null, "en", [pattern]);
      const results = rec.analyze("num: 42", ["NUM"], null);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].score).toBe(0.8);
    });

    test("invalidateResult returning null keeps original score", () => {
      class NeutralRecognizer extends PatternRecognizer {
        invalidateResult(_patternText: string): boolean | null {
          return null;
        }
      }
      const pattern = new Pattern("test", "\\d+", 0.75);
      const rec = new NeutralRecognizer("NUM", null, "en", [pattern]);
      const results = rec.analyze("num: 42", ["NUM"], null);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].score).toBe(0.75);
    });
  });

  describe("load method", () => {
    test("load is a no-op", () => {
      const pattern = new Pattern("test", "\\d+", 0.5);
      const rec = new PatternRecognizer("NUM", null, "en", [pattern]);
      expect(() => rec.load()).not.toThrow();
    });
  });

  describe("toDict", () => {
    test("includes patterns, deny_list, context, and supported_entity", () => {
      const pattern = new Pattern("digits", "\\d+", 0.5);
      const rec = new PatternRecognizer("NUM", "NumRec", "en", [pattern], null, [
        "number",
      ]);
      const dict = rec.toDict();
      expect(dict.supported_entity).toEqual(["NUM"]);
      expect(dict.supported_entities).toEqual(["NUM"]);
      expect(dict.patterns).toEqual([{ name: "digits", regex: "\\d+", score: 0.5 }]);
      expect(dict.deny_list).toEqual([]);
      expect(dict.context).toEqual(["number"]);
    });
  });

  describe("buildRegexExplanation (static)", () => {
    test("creates explanation with correct fields", () => {
      const explanation = PatternRecognizer.buildRegexExplanation(
        "PhoneRec",
        "phone_pattern",
        "\\+?\\d{10}",
        0.85,
        null,
        "gmsi",
      );
      expect(explanation.recognizer).toBe("PhoneRec");
      expect(explanation.patternName).toBe("phone_pattern");
      expect(explanation.pattern).toBe("\\+?\\d{10}");
      expect(explanation.originalScore).toBe(0.85);
      expect(explanation.validationResult).toBeNull();
      expect(explanation.regexFlags).toBe("gmsi");
      expect(explanation.textualExplanation).toContain("PhoneRec");
      expect(explanation.textualExplanation).toContain("phone_pattern");
    });
  });
});
