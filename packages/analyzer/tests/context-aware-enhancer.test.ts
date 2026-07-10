import {
  AnalysisExplanation,
  EntityRecognizer,
  NlpArtifacts,
  RecognizerResult,
} from "@defend-tech/presidio-core";
import { describe, expect, it } from "vitest";
import { ContextAwareEnhancer } from "../src/context/context-aware-enhancer";
import { LemmaContextAwareEnhancer } from "../src/context/lemma-context-aware-enhancer";
import {
  findSupportiveWordInContext,
  isPunctuation,
  isStopWord,
} from "../src/context/lemma-context-aware-enhancer";

// Minimal test recognizer with context words
class TestRecognizer extends EntityRecognizer {
  constructor(context: string[] = ["card", "credit", "number"]) {
    super(["TEST_ENTITY"], "TestRecognizer", "en", "0.0.1", context);
    this.isLoaded = true;
  }

  public override load(): void {}

  public override analyze(
    _text: string,
    _entities: string[],
    _nlpArtifacts: NlpArtifacts | null,
  ): RecognizerResult[] {
    return [];
  }
}

describe("ContextAwareEnhancer", () => {
  it("has correct score bounds", () => {
    expect(ContextAwareEnhancer.MIN_SCORE).toBe(0);
    expect(ContextAwareEnhancer.MAX_SCORE).toBe(1.0);
  });

  it("LemmaContextAwareEnhancer defaults to substring mode", () => {
    const enhancer = new LemmaContextAwareEnhancer();
    expect(enhancer.contextMatchingMode).toBe("substring");
    expect(enhancer.contextSimilarityFactor).toBe(0.35);
    expect(enhancer.minScoreWithContextSimilarity).toBe(0.4);
  });

  it("rejects invalid contextMatchingMode", () => {
    expect(() => {
      // @ts-expect-error intentionally passing invalid mode
      new LemmaContextAwareEnhancer(0.35, 0.4, 5, 0, "invalid");
    }).toThrow("contextMatchingMode must be one of");
  });
});

describe("isStopWord", () => {
  it("identifies common English stopwords", () => {
    expect(isStopWord("the")).toBe(true);
    expect(isStopWord("and")).toBe(true);
    expect(isStopWord("is")).toBe(true);
    expect(isStopWord("The")).toBe(true);
  });

  it("returns false for non-stopwords", () => {
    expect(isStopWord("presidio")).toBe(false);
    expect(isStopWord("phone")).toBe(false);
  });
});

describe("isPunctuation", () => {
  it("identifies punctuation characters", () => {
    expect(isPunctuation(".")).toBe(true);
    expect(isPunctuation(",")).toBe(true);
    expect(isPunctuation("!")).toBe(true);
  });

  it("returns false for regular words", () => {
    expect(isPunctuation("hello")).toBe(false);
  });
});

describe("findSupportiveWordInContext", () => {
  it("finds substring matches", () => {
    const result = findSupportiveWordInContext(
      ["creditcard", "number"],
      ["card"],
      "substring",
    );
    expect(result).toBe("card");
  });

  it("returns empty for no whole_word match", () => {
    const result = findSupportiveWordInContext(["creditcard"], ["card"], "whole_word");
    expect(result).toBe("");
  });

  it("returns match for exact whole_word", () => {
    const result = findSupportiveWordInContext(
      ["card", "number"],
      ["card"],
      "whole_word",
    );
    expect(result).toBe("card");
  });

  it("returns empty for empty context", () => {
    expect(findSupportiveWordInContext([], ["card"], "substring")).toBe("");
  });
});

describe("LemmaContextAwareEnhancer.enhanceUsingContext", () => {
  it("boosts score when context word is found", () => {
    const enhancer = new LemmaContextAwareEnhancer();
    const recognizer = new TestRecognizer(["card"]);

    const text = "my credit card number is test";
    const result = new RecognizerResult(
      "TEST_ENTITY",
      28,
      32,
      0.2,
      new AnalysisExplanation("TestRecognizer", 0.2),
      {
        [RecognizerResult.RECOGNIZER_IDENTIFIER_KEY]: recognizer.id,
        [RecognizerResult.RECOGNIZER_NAME_KEY]: "TestRecognizer",
      },
    );

    // Build proper token data
    const tokenData: Array<[string, number]> = [];
    const re = /[a-zA-Z]+/g;
    let m = re.exec(text);
    while (m !== null) {
      tokenData.push([m[0], m.index]);
      m = re.exec(text);
    }
    const nlpArtifacts = new NlpArtifacts(
      [],
      tokenData.map(([t]) => t),
      tokenData.map(([, i]) => i),
      tokenData.map(([t]) => t.toLowerCase()),
      tokenData.filter(([t]) => !isStopWord(t)).map(([t]) => t.toLowerCase()),
      "en",
    );

    const enhanced = enhancer.enhanceUsingContext(text, [result], nlpArtifacts, [
      recognizer,
    ]);

    expect(enhanced.length).toBe(1);
    expect(enhanced[0].score).toBeGreaterThan(result.score);
    expect(enhanced[0].score).toBeGreaterThanOrEqual(0.4);
  });

  it("skips results already boosted", () => {
    const enhancer = new LemmaContextAwareEnhancer();
    const recognizer = new TestRecognizer(["card"]);

    const text = "credit card is test";
    const result = new RecognizerResult(
      "TEST_ENTITY",
      13,
      17,
      0.2,
      new AnalysisExplanation("TestRecognizer", 0.2),
      {
        [RecognizerResult.RECOGNIZER_IDENTIFIER_KEY]: recognizer.id,
        [RecognizerResult.RECOGNIZER_NAME_KEY]: "TestRecognizer",
        [RecognizerResult.IS_SCORE_ENHANCED_BY_CONTEXT_KEY]: true,
      },
    );

    const tokenData: Array<[string, number]> = [];
    const re = /[a-zA-Z]+/g;
    let m = re.exec(text);
    while (m !== null) {
      tokenData.push([m[0], m.index]);
      m = re.exec(text);
    }
    const nlpArtifacts = new NlpArtifacts(
      [],
      tokenData.map(([t]) => t),
      tokenData.map(([, i]) => i),
      tokenData.map(([t]) => t.toLowerCase()),
      [],
      "en",
    );

    const originalScore = result.score;
    const enhanced = enhancer.enhanceUsingContext(text, [result], nlpArtifacts, [
      recognizer,
    ]);

    expect(enhanced.length).toBe(1);
    expect(enhanced[0].score).toBe(originalScore);
  });

  it("respects user-provided context words", () => {
    const enhancer = new LemmaContextAwareEnhancer();
    const recognizer = new TestRecognizer(["ssn"]);

    const text = "my number is 1234";
    const result = new RecognizerResult(
      "TEST_ENTITY",
      12,
      16,
      0.2,
      new AnalysisExplanation("TestRecognizer", 0.2),
      {
        [RecognizerResult.RECOGNIZER_IDENTIFIER_KEY]: recognizer.id,
        [RecognizerResult.RECOGNIZER_NAME_KEY]: "TestRecognizer",
      },
    );

    const nlpArtifacts = new NlpArtifacts(
      [],
      ["my", "number", "is", "1234"],
      [0, 3, 10, 12],
      ["my", "number", "is", "1234"],
      ["my", "number", "is", "1234"],
      "en",
    );

    const enhanced = enhancer.enhanceUsingContext(
      text,
      [result],
      nlpArtifacts,
      [recognizer],
      ["ssn"],
    );

    expect(enhanced.length).toBe(1);
    expect(enhanced[0].score).toBeGreaterThan(0.2);
  });
});
