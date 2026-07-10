import { Pattern } from "@defend-tech/presidio-core";

describe("Pattern class", () => {
  test("normalizes Python inline flags wherever they occur in a pattern", () => {
    expect(Pattern.normalizePythonRegex("\\b(?i)[A-Z]+\\b")).toEqual({
      source: "\\b[A-Z]+\\b",
      flags: "i",
    });
  });

  describe("constructor validation", () => {
    test("creates a valid Pattern with name, regex, and score", () => {
      const pattern = new Pattern(
        "email",
        "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b",
        0.85,
      );
      expect(pattern.name).toBe("email");
      expect(pattern.regex).toBe(
        "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b",
      );
      expect(pattern.score).toBe(0.85);
      expect(pattern.compiledRegex).toBeNull();
      expect(pattern.compiledWithFlags).toBeUndefined();
    });

    test("accepts score of 0", () => {
      const pattern = new Pattern("low", "test", 0);
      expect(pattern.score).toBe(0);
    });

    test("accepts score of 1", () => {
      const pattern = new Pattern("high", "test", 1);
      expect(pattern.score).toBe(1);
    });

    test("accepts fractional scores", () => {
      const pattern = new Pattern("mid", "test", 0.5);
      expect(pattern.score).toBe(0.5);
    });

    test("invalid regex throws error", () => {
      expect(() => new Pattern("bad", "[invalid", 0.5)).toThrow(/Invalid regex pattern/);
    });

    test("score below 0 throws error", () => {
      expect(() => new Pattern("low", "test", -0.1)).toThrow(
        /Invalid score: -0.1\. Score should be between 0 and 1/,
      );
    });

    test("score above 1 throws error", () => {
      expect(() => new Pattern("high", "test", 1.1)).toThrow(
        /Invalid score: 1\.1\. Score should be between 0 and 1/,
      );
    });

    test("score of exactly 0 does not throw", () => {
      expect(() => new Pattern("zero", "test", 0)).not.toThrow();
    });

    test("score of exactly 1 does not throw", () => {
      expect(() => new Pattern("one", "test", 1)).not.toThrow();
    });
  });

  describe("toDict", () => {
    test("returns correct dictionary with name, regex, and score", () => {
      const pattern = new Pattern("ssn", "\\d{3}-\\d{2}-\\d{4}", 0.85);
      const dict = pattern.toDict();
      expect(dict).toEqual({
        name: "ssn",
        regex: "\\d{3}-\\d{2}-\\d{4}",
        score: 0.85,
      });
    });
  });

  describe("fromDict", () => {
    test("creates Pattern from dictionary", () => {
      const dict = { name: "phone", regex: "\\d{10}", score: 0.7 };
      const pattern = Pattern.fromDict(dict);
      expect(pattern.name).toBe("phone");
      expect(pattern.regex).toBe("\\d{10}");
      expect(pattern.score).toBe(0.7);
    });

    test("fromDict with invalid regex throws", () => {
      const dict = { name: "bad", regex: "[broken", score: 0.5 };
      expect(() => Pattern.fromDict(dict)).toThrow(/Invalid regex pattern/);
    });
  });

  describe("toDict / fromDict roundtrip", () => {
    test("roundtrip preserves all fields", () => {
      const original = new Pattern(
        "credit_card",
        "\\b\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b",
        0.9,
      );
      const dict = original.toDict();
      const restored = Pattern.fromDict(dict);
      expect(restored.name).toBe(original.name);
      expect(restored.regex).toBe(original.regex);
      expect(restored.score).toBe(original.score);
    });

    test("roundtrip equality via toDict", () => {
      const original = new Pattern("url", "https?://\\S+", 0.6);
      const dict = original.toDict();
      const restored = Pattern.fromDict(dict);
      expect(restored.toDict()).toEqual(original.toDict());
    });
  });

  describe("toString", () => {
    test("returns JSON string of the pattern dict", () => {
      const pattern = new Pattern(
        "ipv4",
        "\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}",
        0.5,
      );
      const jsonStr = pattern.toString();
      const parsed = JSON.parse(jsonStr);
      expect(parsed).toEqual({
        name: "ipv4",
        regex: "\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}",
        score: 0.5,
      });
    });

    test("toString output is valid JSON", () => {
      const pattern = new Pattern("name", "\\w+", 0.3);
      expect(() => JSON.parse(pattern.toString())).not.toThrow();
    });
  });
});
