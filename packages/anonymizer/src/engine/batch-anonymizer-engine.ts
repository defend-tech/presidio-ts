import type { OperatorConfig } from "../entities/operator-config.js";
import type { RecognizerResult } from "../entities/recognizer-result.js";
import { AnonymizerEngine } from "./anonymizer-engine.js";

/** Analysis output for one object property, compatible with batch analyzer output. */
export interface DictRecognizerResult {
  key: string;
  value: unknown;
  recognizerResults: RecognizerResult[] | RecognizerResult[][] | DictRecognizerResult[];
}

/**
 * Applies an AnonymizerEngine to list and nested-object analysis output.
 *
 * This is intentionally separate from StructuredEngine: it preserves the
 * Python batch API's analysis-result-driven list/dictionary semantics.
 */
export class BatchAnonymizerEngine {
  public readonly anonymizerEngine: AnonymizerEngine;

  constructor(anonymizerEngine: AnonymizerEngine = new AnonymizerEngine()) {
    this.anonymizerEngine = anonymizerEngine;
  }

  public async anonymizeList(
    texts: ReadonlyArray<unknown>,
    recognizerResultsList: ReadonlyArray<ReadonlyArray<RecognizerResult>> = [],
    operators: Record<string, OperatorConfig> | null = null,
  ): Promise<unknown[]> {
    const resultLists =
      recognizerResultsList.length === 0 ? texts.map(() => []) : recognizerResultsList;

    const output: unknown[] = [];
    for (let index = 0; index < texts.length && index < resultLists.length; index += 1) {
      const value = texts[index];
      if (
        typeof value === "string" ||
        typeof value === "boolean" ||
        typeof value === "number"
      ) {
        const result = await this.anonymizerEngine.anonymize(
          String(value),
          [...resultLists[index]],
          operators,
        );
        output.push(result.text);
      } else {
        output.push(value);
      }
    }
    return output;
  }

  public async anonymizeDict(
    analyzerResults: Iterable<DictRecognizerResult>,
    operators: Record<string, OperatorConfig> | null = null,
  ): Promise<Record<string, unknown>> {
    const output: Record<string, unknown> = {};
    for (const result of analyzerResults) {
      if (isDictResults(result.recognizerResults)) {
        output[result.key] = await this.anonymizeDict(
          result.recognizerResults,
          operators,
        );
      } else if (typeof result.value === "string") {
        output[result.key] = (
          await this.anonymizerEngine.anonymize(
            result.value,
            [...result.recognizerResults] as RecognizerResult[],
            operators,
          )
        ).text;
      } else if (Array.isArray(result.value)) {
        output[result.key] = await this.anonymizeList(
          result.value,
          result.recognizerResults as RecognizerResult[][],
          operators,
        );
      } else {
        output[result.key] = result.value;
      }
    }
    return output;
  }
}

function isDictResults(
  results: DictRecognizerResult["recognizerResults"],
): results is DictRecognizerResult[] {
  return results.length > 0 && "key" in results[0];
}
