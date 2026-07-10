import { AnalysisExplanation } from "@defend-tech/presidio-core";

describe("AnalysisExplanation class", () => {
  describe("constructor", () => {
    test("sets all required fields correctly", () => {
      const explanation = new AnalysisExplanation("test-recognizer", 0.8);
      expect(explanation.recognizer).toBe("test-recognizer");
      expect(explanation.originalScore).toBe(0.8);
      expect(explanation.score).toBe(0.8);
      expect(explanation.patternName).toBeNull();
      expect(explanation.pattern).toBeNull();
      expect(explanation.validationResult).toBeNull();
      expect(explanation.textualExplanation).toBeNull();
      expect(explanation.scoreContextImprovement).toBe(0);
      expect(explanation.supportiveContextWord).toBe("");
      expect(explanation.regexFlags).toBeUndefined();
    });

    test("sets optional fields when provided", () => {
      const explanation = new AnalysisExplanation(
        "rec",
        0.5,
        "email-pattern",
        "\\w+@\\w+\\.\\w+",
        true,
        "Found email",
        "gms",
      );
      expect(explanation.recognizer).toBe("rec");
      expect(explanation.patternName).toBe("email-pattern");
      expect(explanation.pattern).toBe("\\w+@\\w+\\.\\w+");
      expect(explanation.validationResult).toBe(true);
      expect(explanation.textualExplanation).toBe("Found email");
      expect(explanation.regexFlags).toBe("gms");
    });

    test("score starts equal to originalScore", () => {
      const explanation = new AnalysisExplanation("rec", 0.6);
      expect(explanation.score).toBe(0.6);
      expect(explanation.originalScore).toBe(0.6);
    });

    test("validationResult can be false", () => {
      const explanation = new AnalysisExplanation("rec", 0.5, null, null, false);
      expect(explanation.validationResult).toBe(false);
    });
  });

  describe("setImprovedScore", () => {
    test("updates score and calculates context improvement", () => {
      const explanation = new AnalysisExplanation("rec", 0.5);
      explanation.setImprovedScore(0.8);
      expect(explanation.score).toBe(0.8);
      expect(explanation.scoreContextImprovement).toBeCloseTo(0.3);
    });

    test("handles score decrease (negative improvement)", () => {
      const explanation = new AnalysisExplanation("rec", 0.8);
      explanation.setImprovedScore(0.5);
      expect(explanation.score).toBe(0.5);
      expect(explanation.scoreContextImprovement).toBeCloseTo(-0.3);
    });

    test("score equal to original yields zero improvement", () => {
      const explanation = new AnalysisExplanation("rec", 0.5);
      explanation.setImprovedScore(0.5);
      expect(explanation.scoreContextImprovement).toBe(0);
    });

    test("originalScore remains unchanged after setImprovedScore", () => {
      const explanation = new AnalysisExplanation("rec", 0.4);
      explanation.setImprovedScore(0.9);
      expect(explanation.originalScore).toBe(0.4);
    });
  });

  describe("setSupportiveContextWord", () => {
    test("sets the supportive context word", () => {
      const explanation = new AnalysisExplanation("rec", 0.5);
      explanation.setSupportiveContextWord("email");
      expect(explanation.supportiveContextWord).toBe("email");
    });

    test("overwrites previous word", () => {
      const explanation = new AnalysisExplanation("rec", 0.5);
      explanation.setSupportiveContextWord("first");
      explanation.setSupportiveContextWord("second");
      expect(explanation.supportiveContextWord).toBe("second");
    });
  });

  describe("appendTextualExplanationLine", () => {
    test("sets text when explanation is null", () => {
      const explanation = new AnalysisExplanation("rec", 0.5);
      explanation.appendTextualExplanationLine("First line");
      expect(explanation.textualExplanation).toBe("First line");
    });

    test("appends with newline when text already exists", () => {
      const explanation = new AnalysisExplanation("rec", 0.5);
      explanation.appendTextualExplanationLine("First line");
      explanation.appendTextualExplanationLine("Second line");
      expect(explanation.textualExplanation).toBe("First line\nSecond line");
    });

    test("appends multiple lines", () => {
      const explanation = new AnalysisExplanation("rec", 0.5);
      explanation.appendTextualExplanationLine("Line 1");
      explanation.appendTextualExplanationLine("Line 2");
      explanation.appendTextualExplanationLine("Line 3");
      expect(explanation.textualExplanation).toBe("Line 1\nLine 2\nLine 3");
    });

    test("works when initialized with existing text", () => {
      const explanation = new AnalysisExplanation(
        "rec",
        0.5,
        null,
        null,
        null,
        "Initial",
      );
      explanation.appendTextualExplanationLine("Appended");
      expect(explanation.textualExplanation).toBe("Initial\nAppended");
    });
  });

  describe("toDict", () => {
    test("returns object with all own properties", () => {
      const explanation = new AnalysisExplanation(
        "rec",
        0.5,
        "pat",
        "\\d+",
        true,
        "desc",
        "gms",
      );
      const dict = explanation.toDict();
      expect(dict.recognizer).toBe("rec");
      expect(dict.originalScore).toBe(0.5);
      expect(dict.score).toBe(0.5);
      expect(dict.patternName).toBe("pat");
      expect(dict.pattern).toBe("\\d+");
      expect(dict.validationResult).toBe(true);
      expect(dict.textualExplanation).toBe("desc");
      expect(dict.regexFlags).toBe("gms");
    });
  });
});
