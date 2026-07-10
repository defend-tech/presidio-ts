import type { RecognizerResult } from "@presidio/core";
import { AnalyzerEngine } from "./analyzer-engine.js";
import type { AnalyzeOptions } from "./analyzer-engine.js";

/**
 * Batch analysis of documents (tables, lists, dictionaries).
 *
 * Wraps `AnalyzerEngine` for batch processing of iterables and nested
 * dictionary structures.
 *
 * TypeScript port of `presidio_analyzer.BatchAnalyzerEngine`.
 */
export class BatchAnalyzerEngine {
  public analyzerEngine: AnalyzerEngine;

  constructor(analyzerEngine?: AnalyzerEngine) {
    this.analyzerEngine = analyzerEngine ?? new AnalyzerEngine();
  }

  /**
   * Analyze an iterable of primitive values.
   *
   * @param texts - Values to analyze.
   * @param language - Text language.
   * @param batchSize - Batch size.
   * @param nProcess - Parallel processors.
   * @param opts - Options forwarded to `AnalyzerEngine.analyze()`.
   * @returns Array of result arrays, one per input.
   */
  public async analyzeIterator(
    texts: Iterable<string | number | boolean>,
    language: string,
    batchSize: number = 1,
    nProcess: number = 1,
    opts: AnalyzeOptions = {},
  ): Promise<RecognizerResult[][]> {
    const validated: (string | number | boolean)[] = [...texts];
    for (const val of validated) {
      if (
        val !== null &&
        val !== undefined &&
        typeof val !== "string" &&
        typeof val !== "number" &&
        typeof val !== "boolean"
      ) {
        throw new Error(
          "analyzeIterator only works on primitive types " +
            "(string, number, boolean). Objects are not supported.",
        );
      }
    }

    const listResults: RecognizerResult[][] = [];
    const batchIter = this.analyzerEngine.nlpEngine.processBatch(
      validated.map(String),
      language,
      batchSize,
      nProcess,
    );

    for await (const [text, nlpArtifacts] of batchIter) {
      const results = await this.analyzerEngine.analyze(text, language, {
        ...opts,
        nlpArtifacts,
      });
      listResults.push(results);
    }

    return listResults;
  }

  /**
   * Analyze a dictionary of keys and values.
   *
   * Non-string primitives are coerced to strings. Nested dicts are
   * recursed; array values are analyzed via `analyzeIterator`. Each
   * key is added as context for its value.
   *
   * @param inputDict - Dictionary to analyze.
   * @param language - Text language.
   * @param keysToSkip - Keys to ignore.
   * @param batchSize - Batch size for array values.
   * @param nProcess - Parallel processors.
   * @param opts - Additional analyze options.
   * @returns Async generator yielding `DictAnalyzerResult`.
   */
  public async *analyzeDict(
    inputDict: Record<string, unknown>,
    language: string,
    keysToSkip: string[] = [],
    batchSize: number = 1,
    nProcess: number = 1,
    opts: AnalyzeOptions = {},
  ): AsyncGenerator<DictAnalyzerResult, void, unknown> {
    const context: string[] = opts.context ?? [];

    for (const [key, value] of Object.entries(inputDict)) {
      if (value === null || value === undefined || keysToSkip.includes(key)) {
        yield new DictAnalyzerResult(key, value as DictValue, []);
        continue;
      }

      const specificContext = [...context, key];

      const dr = await analyzeDictEntry(
        key,
        value,
        this,
        language,
        specificContext,
        keysToSkip,
        batchSize,
        nProcess,
        opts,
      );
      yield dr;
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** Primitive or structured value in a dictionary. */
export type DictValue =
  | string
  | number
  | boolean
  | null
  | undefined;

/** Nested result types for dictionary entries. */
export type DictNestedResults =
  | RecognizerResult[]
  | RecognizerResult[][];

/**
 * Data class for dictionary analysis output.
 *
 * Port of `presidio_analyzer.DictAnalyzerResult`.
 */
export class DictAnalyzerResult {
  public key: string;
  public value: DictValue;
  public recognizerResults: DictNestedResults;

  constructor(
    key: string,
    value: DictValue,
    recognizerResults: DictNestedResults,
  ) {
    this.key = key;
    this.value = value;
    this.recognizerResults = recognizerResults;
  }
}

/* ------------------------------------------------------------------ */
/*  Pure helpers                                                       */
/* ------------------------------------------------------------------ */

/**
 * Analyze a single dictionary entry, recursing into nested structures.
 */
async function analyzeDictEntry(
  key: string,
  value: unknown,
  engine: BatchAnalyzerEngine,
  language: string,
  specificContext: string[],
  keysToSkip: string[],
  batchSize: number,
  nProcess: number,
  opts: AnalyzeOptions,
): Promise<DictAnalyzerResult> {
  // Primitive
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const results = await engine.analyzerEngine.analyze(String(value), language, {
      ...opts,
      context: specificContext,
    });
    return new DictAnalyzerResult(key, value as DictValue, results);
  }

  // Nested dict
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    const nestedKeys = getNestedKeysToSkip(key, keysToSkip);
    const nestedResults: DictAnalyzerResult[] = [];
    for await (const dr of engine.analyzeDict(
      value as Record<string, unknown>,
      language,
      nestedKeys,
      batchSize,
      nProcess,
      { ...opts, context: specificContext },
    )) {
      nestedResults.push(dr);
    }
    return new DictAnalyzerResult(
      key,
      null,
      nestedResults as unknown as DictNestedResults,
    );
  }

  // Array
  if (Array.isArray(value)) {
    const itemResults = await engine.analyzeIterator(value, language, batchSize, nProcess, {
      ...opts,
      context: specificContext,
    });
    return new DictAnalyzerResult(key, null, itemResults);
  }

  throw new Error(`type ${typeof value} is unsupported in analyzeDict`);
}

/**
 * Given parent key `"a.b.c"` and top-level skip list `["a.b.x"]`,
 * return `["x"]` for the nested call.
 */
function getNestedKeysToSkip(key: string, keysToSkip: string[]): string[] {
  const prefix = `${key}.`;
  return keysToSkip
    .filter((k) => k.startsWith(prefix))
    .map((k) => k.slice(prefix.length));
}