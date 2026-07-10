import { AnalysisExplanation, RecognizerResult } from "@defend-tech/presidio-core";

describe("RecognizerResult class", () => {
  describe("constructor", () => {
    test("sets all fields correctly", () => {
      const result = new RecognizerResult("PERSON", 0, 6, 0.85);
      expect(result.entityType).toBe("PERSON");
      expect(result.start).toBe(0);
      expect(result.end).toBe(6);
      expect(result.score).toBe(0.85);
      expect(result.analysisExplanation).toBeNull();
      expect(result.recognitionMetadata).toBeNull();
    });

    test("accepts analysisExplanation and recognitionMetadata", () => {
      const explanation = new AnalysisExplanation("test-rec", 0.8);
      const metadata = { key: "value" };
      const result = new RecognizerResult("EMAIL", 5, 15, 0.7, explanation, metadata);
      expect(result.analysisExplanation).toBe(explanation);
      expect(result.recognitionMetadata).toBe(metadata);
    });

    test("validation metadata keys are static constants", () => {
      expect(RecognizerResult.RECOGNIZER_NAME_KEY).toBe("recognizer_name");
      expect(RecognizerResult.RECOGNIZER_IDENTIFIER_KEY).toBe("recognizer_identifier");
      expect(RecognizerResult.IS_SCORE_ENHANCED_BY_CONTEXT_KEY).toBe(
        "is_score_enhanced_by_context",
      );
    });
  });

  describe("intersects", () => {
    test("returns 0 when results do not overlap", () => {
      const a = new RecognizerResult("A", 0, 5, 0.5);
      const b = new RecognizerResult("B", 10, 15, 0.5);
      expect(a.intersects(b)).toBe(0);
    });

    test("returns 0 when one ends exactly where the other starts", () => {
      const a = new RecognizerResult("A", 0, 5, 0.5);
      const b = new RecognizerResult("B", 5, 10, 0.5);
      expect(a.intersects(b)).toBe(0);
    });

    test("returns overlap count when results partially overlap", () => {
      const a = new RecognizerResult("A", 0, 10, 0.5);
      const b = new RecognizerResult("B", 5, 15, 0.5);
      // Overlap: 5 to 10 = 5 chars
      expect(a.intersects(b)).toBe(5);
    });

    test("returns overlap when one is fully inside the other", () => {
      const a = new RecognizerResult("A", 0, 20, 0.5);
      const b = new RecognizerResult("B", 5, 10, 0.5);
      // Overlap: 5 to 10 = 5 chars
      expect(a.intersects(b)).toBe(5);
    });

    test("returns overlap when results are identical", () => {
      const a = new RecognizerResult("A", 0, 10, 0.5);
      const b = new RecognizerResult("B", 0, 10, 0.5);
      expect(a.intersects(b)).toBe(10);
    });

    test("intersection is symmetric", () => {
      const a = new RecognizerResult("A", 5, 15, 0.5);
      const b = new RecognizerResult("B", 0, 10, 0.5);
      expect(a.intersects(b)).toBe(b.intersects(a));
    });
  });

  describe("containedIn", () => {
    test("returns true when self is fully inside other", () => {
      const inner = new RecognizerResult("A", 5, 10, 0.5);
      const outer = new RecognizerResult("B", 0, 15, 0.5);
      expect(inner.containedIn(outer)).toBe(true);
    });

    test("returns true when self equals other", () => {
      const a = new RecognizerResult("A", 0, 10, 0.5);
      const b = new RecognizerResult("B", 0, 10, 0.5);
      expect(a.containedIn(b)).toBe(true);
    });

    test("returns false when self extends beyond other", () => {
      const inner = new RecognizerResult("A", -5, 10, 0.5);
      const outer = new RecognizerResult("B", 0, 10, 0.5);
      expect(inner.containedIn(outer)).toBe(false);
    });

    test("returns false when self ends after other", () => {
      const inner = new RecognizerResult("A", 0, 20, 0.5);
      const outer = new RecognizerResult("B", 0, 10, 0.5);
      expect(inner.containedIn(outer)).toBe(false);
    });
  });

  describe("contains", () => {
    test("returns true when other is fully inside self", () => {
      const outer = new RecognizerResult("A", 0, 20, 0.5);
      const inner = new RecognizerResult("B", 5, 15, 0.5);
      expect(outer.contains(inner)).toBe(true);
    });

    test("returns true when self equals other", () => {
      const a = new RecognizerResult("A", 0, 10, 0.5);
      const b = new RecognizerResult("B", 0, 10, 0.5);
      expect(a.contains(b)).toBe(true);
    });

    test("returns false when other extends beyond self", () => {
      const outer = new RecognizerResult("A", 5, 10, 0.5);
      const inner = new RecognizerResult("B", 0, 15, 0.5);
      expect(outer.contains(inner)).toBe(false);
    });
  });

  describe("equalIndices", () => {
    test("returns true when start and end match", () => {
      const a = new RecognizerResult("A", 0, 10, 0.5);
      const b = new RecognizerResult("B", 0, 10, 0.9);
      expect(a.equalIndices(b)).toBe(true);
    });

    test("returns false when start differs", () => {
      const a = new RecognizerResult("A", 0, 10, 0.5);
      const b = new RecognizerResult("B", 5, 10, 0.5);
      expect(a.equalIndices(b)).toBe(false);
    });

    test("returns false when end differs", () => {
      const a = new RecognizerResult("A", 0, 10, 0.5);
      const b = new RecognizerResult("B", 0, 15, 0.5);
      expect(a.equalIndices(b)).toBe(false);
    });
  });

  describe("equals", () => {
    test("returns true when type, score, and indices all match", () => {
      const a = new RecognizerResult("PERSON", 0, 6, 0.85);
      const b = new RecognizerResult("PERSON", 0, 6, 0.85);
      expect(a.equals(b)).toBe(true);
    });

    test("returns false when types differ", () => {
      const a = new RecognizerResult("PERSON", 0, 6, 0.85);
      const b = new RecognizerResult("EMAIL", 0, 6, 0.85);
      expect(a.equals(b)).toBe(false);
    });

    test("returns false when scores differ", () => {
      const a = new RecognizerResult("PERSON", 0, 6, 0.85);
      const b = new RecognizerResult("PERSON", 0, 6, 0.7);
      expect(a.equals(b)).toBe(false);
    });

    test("returns false when indices differ", () => {
      const a = new RecognizerResult("PERSON", 0, 6, 0.85);
      const b = new RecognizerResult("PERSON", 2, 8, 0.85);
      expect(a.equals(b)).toBe(false);
    });
  });

  describe("hashCode", () => {
    test("produces consistent hash", () => {
      const result = new RecognizerResult("PERSON", 0, 6, 0.85);
      expect(result.hashCode()).toBe("0 6 0.85 PERSON");
    });

    test("different results produce different hashes", () => {
      const a = new RecognizerResult("PERSON", 0, 6, 0.85);
      const b = new RecognizerResult("EMAIL", 0, 10, 0.7);
      expect(a.hashCode()).not.toBe(b.hashCode());
    });

    test("same indices/type/score produce same hash", () => {
      const a = new RecognizerResult("PERSON", 0, 6, 0.85);
      const b = new RecognizerResult("PERSON", 0, 6, 0.85);
      expect(a.hashCode()).toBe(b.hashCode());
    });
  });

  describe("hasConflict", () => {
    test("same indices with lower score is a conflict", () => {
      const weak = new RecognizerResult("PERSON", 0, 6, 0.3);
      const strong = new RecognizerResult("PERSON", 0, 6, 0.85);
      expect(weak.hasConflict(strong)).toBe(true);
    });

    test("same indices with equal score is a conflict", () => {
      const a = new RecognizerResult("A", 0, 6, 0.5);
      const b = new RecognizerResult("B", 0, 6, 0.5);
      expect(a.hasConflict(b)).toBe(true);
    });

    test("same indices with higher score is not a conflict (self has higher)", () => {
      const strong = new RecognizerResult("PERSON", 0, 6, 0.85);
      const weak = new RecognizerResult("PERSON", 0, 6, 0.3);
      expect(strong.hasConflict(weak)).toBe(false);
    });

    test("contained in other is a conflict", () => {
      const inner = new RecognizerResult("EMAIL", 5, 10, 0.5);
      const outer = new RecognizerResult("PERSON", 0, 15, 0.8);
      expect(inner.hasConflict(outer)).toBe(true);
    });

    test("not contained and different indices is not a conflict", () => {
      const a = new RecognizerResult("A", 0, 5, 0.5);
      const b = new RecognizerResult("B", 10, 15, 0.5);
      expect(a.hasConflict(b)).toBe(false);
    });

    test("partially overlapping with higher score is not a conflict", () => {
      const a = new RecognizerResult("A", 0, 15, 0.8);
      const b = new RecognizerResult("B", 5, 20, 0.5);
      // Different indices and b is not contained in a
      expect(b.hasConflict(a)).toBe(false);
    });
  });

  describe("fromJson", () => {
    test("creates RecognizerResult from JSON data", () => {
      const data = { start: 0, end: 6, score: 0.85, entityType: "PERSON" };
      const result = RecognizerResult.fromJson(data);
      expect(result.entityType).toBe("PERSON");
      expect(result.start).toBe(0);
      expect(result.end).toBe(6);
      expect(result.score).toBe(0.85);
      expect(result.analysisExplanation).toBeNull();
    });
  });

  describe("toDict", () => {
    test("returns object with all own property names", () => {
      const result = new RecognizerResult("EMAIL", 5, 20, 0.7);
      const dict = result.toDict();
      expect(dict.entityType).toBe("EMAIL");
      expect(dict.start).toBe(5);
      expect(dict.end).toBe(20);
      expect(dict.score).toBe(0.7);
    });
  });

  describe("compareTo", () => {
    test("sorts by start position first", () => {
      const a = new RecognizerResult("A", 0, 10, 0.5);
      const b = new RecognizerResult("B", 5, 15, 0.5);
      expect(a.compareTo(b)).toBeLessThan(0);
    });

    test("when start is same, sorts by end position", () => {
      const a = new RecognizerResult("A", 0, 5, 0.5);
      const b = new RecognizerResult("B", 0, 10, 0.5);
      expect(a.compareTo(b)).toBeLessThan(0);
    });

    test("equal positions return 0", () => {
      const a = new RecognizerResult("A", 0, 10, 0.5);
      const b = new RecognizerResult("B", 0, 10, 0.5);
      expect(a.compareTo(b)).toBe(0);
    });
  });

  describe("toString", () => {
    test("returns formatted string", () => {
      const result = new RecognizerResult("PERSON", 0, 6, 0.85);
      expect(result.toString()).toBe("type: PERSON, start: 0, end: 6, score: 0.85");
    });
  });

  describe("appendAnalysisExplanationText", () => {
    test("appends text when analysisExplanation exists", () => {
      const explanation = new AnalysisExplanation("rec", 0.5);
      const result = new RecognizerResult("A", 0, 5, 0.5, explanation);
      result.appendAnalysisExplanationText("line1");
      expect(result.analysisExplanation!.textualExplanation).toBe("line1");
    });

    test("does not throw when analysisExplanation is null", () => {
      const result = new RecognizerResult("A", 0, 5, 0.5);
      expect(() => result.appendAnalysisExplanationText("text")).not.toThrow();
    });
  });
});
