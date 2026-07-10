import { RecognizerResult } from "@defend-tech/presidio-core";
import { describe, expect, it } from "vitest";
import { CharacterBasedTextChunker } from "../src/chunkers/text-chunker.js";

describe("CharacterBasedTextChunker", () => {
  it("keeps word boundaries and overlaps chunks", () => {
    const chunks = new CharacterBasedTextChunker(7, 2).chunk("alpha beta gamma");
    expect(chunks).toEqual([
      { text: "alpha beta", start: 0, end: 10 },
      { text: "ta gamma", start: 8, end: 16 },
    ]);
  });

  it("adjusts and deduplicates chunk prediction offsets", () => {
    const chunker = new CharacterBasedTextChunker(5, 2);
    const results = chunker.predictWithChunking("one two three", (text) => {
      const start = text.indexOf("two");
      return start < 0 ? [] : [new RecognizerResult("WORD", start, start + 3, 1)];
    });
    expect(results).toHaveLength(1);
    expect(results[0].start).toBe(4);
  });
});
