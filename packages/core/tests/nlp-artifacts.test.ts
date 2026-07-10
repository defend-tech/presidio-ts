import { NlpArtifacts } from "@presidio/core";

describe("NlpArtifacts", () => {
  describe("constructor", () => {
    test("sets all fields correctly", () => {
      const artifacts = new NlpArtifacts(
        ["PERSON", "LOCATION"],
        ["John", "lives", "in", "NYC"],
        [0, 5, 11, 14],
        ["john", "live", "in", "nyc"],
        ["john", "nyc"],
        "en",
      );
      expect(artifacts.entities).toEqual(["PERSON", "LOCATION"]);
      expect(artifacts.tokens).toEqual(["John", "lives", "in", "NYC"]);
      expect(artifacts.tokensIndices).toEqual([0, 5, 11, 14]);
      expect(artifacts.lemmas).toEqual(["john", "live", "in", "nyc"]);
      expect(artifacts.keywords).toEqual(["john", "nyc"]);
      expect(artifacts.language).toBe("en");
    });

    test("sets all fields including custom scores", () => {
      const artifacts = new NlpArtifacts(
        ["PERSON", "LOCATION"],
        ["John", "lives"],
        [0, 5],
        ["john", "live"],
        ["john"],
        "en",
        [0.9, 0.7],
      );
      expect(artifacts.scores).toEqual([0.9, 0.7]);
    });
  });

  describe("default scores", () => {
    test("defaults to 0.85 for each entity when scores not provided", () => {
      const artifacts = new NlpArtifacts(
        ["PERSON", "LOCATION", "EMAIL"],
        ["tokens"],
        [0],
        ["lemmas"],
        [],
        "en",
      );
      expect(artifacts.scores).toEqual([0.85, 0.85, 0.85]);
    });

    test("default scores count matches entity count", () => {
      const entities = ["A", "B"];
      const artifacts = new NlpArtifacts(entities, [], [], [], [], "en");
      expect(artifacts.scores).toHaveLength(2);
    });

    test("default scores are all 0.85", () => {
      const artifacts = new NlpArtifacts(["X", "Y", "Z"], [], [], [], [], "en");
      expect(artifacts.scores).toEqual([0.85, 0.85, 0.85]);
    });
  });

  describe("toJson", () => {
    test("returns valid JSON string", () => {
      const artifacts = new NlpArtifacts(
        ["PERSON"],
        ["John"],
        [0],
        ["john"],
        ["john"],
        "en",
        [0.9],
      );
      const json = artifacts.toJson();
      const parsed = JSON.parse(json);
      expect(parsed.entities).toEqual(["PERSON"]);
      expect(parsed.tokens).toEqual(["John"]);
      expect(parsed.tokensIndices).toEqual([0]);
      expect(parsed.lemmas).toEqual(["john"]);
      expect(parsed.keywords).toEqual(["john"]);
      expect(parsed.language).toBe("en");
      expect(parsed.scores).toEqual([0.9]);
    });

    test("toJson with default scores", () => {
      const artifacts = new NlpArtifacts(
        ["EMAIL"],
        ["test@email.com"],
        [0],
        ["test@email.com"],
        [],
        "en",
      );
      const parsed = JSON.parse(artifacts.toJson());
      expect(parsed.scores).toEqual([0.85]);
    });

    test("toJson output includes all NlpArtifacts fields", () => {
      const artifacts = new NlpArtifacts(
        ["A"],
        ["a"],
        [0],
        ["a"],
        [],
        "en",
      );
      const parsed = JSON.parse(artifacts.toJson());
      expect(parsed).toHaveProperty("entities");
      expect(parsed).toHaveProperty("tokens");
      expect(parsed).toHaveProperty("tokensIndices");
      expect(parsed).toHaveProperty("lemmas");
      expect(parsed).toHaveProperty("keywords");
      expect(parsed).toHaveProperty("language");
      expect(parsed).toHaveProperty("scores");
    });
  });

  describe("edge cases", () => {
    test("empty entities array", () => {
      const artifacts = new NlpArtifacts([], [], [], [], [], "en");
      expect(artifacts.entities).toEqual([]);
      expect(artifacts.scores).toEqual([]);
    });

    test("null scores uses defaults", () => {
      const artifacts = new NlpArtifacts(
        ["A"],
        ["a"],
        [0],
        ["a"],
        [],
        "en",
        null,
      );
      expect(artifacts.scores).toEqual([0.85]);
    });
  });
});