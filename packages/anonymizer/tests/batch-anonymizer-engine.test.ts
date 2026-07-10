import { describe, expect, it } from "vitest";
import { BatchAnonymizerEngine } from "../src/engine/batch-anonymizer-engine.js";
import { RecognizerResult } from "../src/entities/recognizer-result.js";

describe("BatchAnonymizerEngine", () => {
  it("anonymizes primitive lists using the supplied analysis result pairs", async () => {
    const engine = new BatchAnonymizerEngine();
    await expect(
      engine.anonymizeList(
        ["alice@example.com", 42, null, { raw: true }],
        [[new RecognizerResult("EMAIL_ADDRESS", 0, 17, 1)], []],
      ),
    ).resolves.toEqual(["<EMAIL_ADDRESS>", "42"]);
  });

  it("anonymizes nested dictionary analysis output", async () => {
    const engine = new BatchAnonymizerEngine();
    const output = await engine.anonymizeDict([
      {
        key: "contact",
        value: "alice@example.com",
        recognizerResults: [new RecognizerResult("EMAIL_ADDRESS", 0, 17, 1)],
      },
      {
        key: "nested",
        value: { phone: "1234" },
        recognizerResults: [
          {
            key: "phone",
            value: "1234",
            recognizerResults: [new RecognizerResult("PHONE_NUMBER", 0, 4, 1)],
          },
        ],
      },
    ]);

    expect(output).toEqual({
      contact: "<EMAIL_ADDRESS>",
      nested: { phone: "<PHONE_NUMBER>" },
    });
  });
});
