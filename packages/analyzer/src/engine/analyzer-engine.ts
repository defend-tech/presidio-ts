import {
  EntityRecognizer,
  NlpArtifacts,
  RecognizerResult,
  AppTracer,
} from "@presidio/core";
import { NlpEngine } from "../nlp/nlp-engine.js";
import { RecognizerRegistry } from "../registry/recognizer-registry.js";
import { LemmaContextAwareEnhancer } from "../context/lemma-context-aware-enhancer.js";
import type { ContextAwareEnhancer } from "../context/context-aware-enhancer.js";

/**
 * Default regex flags matching Python `re.DOTALL | re.MULTILINE | re.IGNORECASE`.
 * Mapped to JS regex flags `"gmsi"`.
 */
const DEFAULT_REGEX_FLAGS = "gmsi";

/** Built-in English stopwords used by the fallback NLP engine. */
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "it", "as", "be", "this", "that",
  "are", "was", "were", "has", "have", "had", "not", "no", "do", "does",
  "did", "will", "would", "shall", "should", "may", "might", "can", "could",
  "its", "my", "your", "his", "her", "our", "their", "he", "she", "we",
  "they", "i", "me", "him", "us", "them", "am", "been", "being",
  "so", "if", "into", "than", "too", "very", "just", "about", "up", "out",
  "then", "there", "when", "where", "how", "all", "each", "which", "who",
  "whom", "what", "these", "those", "some", "any", "both", "few", "more",
  "most", "other", "such", "only", "own", "same", "also", "after", "before",
  "over", "under", "again", "further", "once", "here", "why", "because",
  "until", "while", "above", "below", "between", "through", "during",
]);

const PUNCT = new Set([
  ".", ",", "!", "?", ";", ":", "'", '"', "(", ")", "[", "]", "{", "}",
  "<", ">", "/", "\\", "|", "@", "#", "$", "%", "^", "&", "*", "-", "=",
  "+", "~", "`", "…", "—", "–",
]);

/** Check if a word is a stop word. */
function isStopWord(word: string): boolean {
  return STOP_WORDS.has(word.toLowerCase());
}

/** Check if a word is purely punctuation. */
function isPunctuation(word: string): boolean {
  return PUNCT.has(word);
}

/** Valid allow-list matching strategies. */
export type AllowListMatch = "exact" | "regex";

/** Options for constructing an `AnalyzerEngine`. */
export interface AnalyzerEngineOptions {
  registry?: RecognizerRegistry;
  nlpEngine?: NlpEngine;
  appTracer?: AppTracer;
  logDecisionProcess?: boolean;
  defaultScoreThreshold?: number;
  supportedLanguages?: string[];
  contextAwareEnhancer?: ContextAwareEnhancer;
}

/** Parameters passed to `AnalyzerEngine.analyze()`. */
export interface AnalyzeOptions {
  entities?: string[];
  correlationId?: string;
  scoreThreshold?: number;
  returnDecisionProcess?: boolean;
  adHocRecognizers?: EntityRecognizer[];
  context?: string[];
  allowList?: string[];
  allowListMatch?: AllowListMatch;
  regexFlags?: string;
  nlpArtifacts?: NlpArtifacts;
}

/* ------------------------------------------------------------------ */
/*  AnalyzerEngine                                                     */
/* ------------------------------------------------------------------ */

/**
 * Entry point for Presidio Analyzer.
 *
 * Orchestrates PII detection: NLP → recognizers → context enhancement →
 * deduplicate → threshold filter → allow-list removal.
 *
 * TypeScript port of `presidio_analyzer.AnalyzerEngine`.
 */
export class AnalyzerEngine {
  public registry: RecognizerRegistry;
  public nlpEngine: NlpEngine;
  public appTracer: AppTracer;
  public logDecisionProcess: boolean;
  public defaultScoreThreshold: number;
  public supportedLanguages: string[];
  public contextAwareEnhancer: ContextAwareEnhancer;

  constructor(options: AnalyzerEngineOptions = {}) {
    this.supportedLanguages = options.supportedLanguages ?? ["en"];
    this.logDecisionProcess = options.logDecisionProcess ?? false;
    this.defaultScoreThreshold = options.defaultScoreThreshold ?? 0;
    this.appTracer = options.appTracer ?? new AppTracer();

    this.nlpEngine = options.nlpEngine ?? createFallbackNlpEngine();
    if (!this.nlpEngine.isLoaded()) {
      void this.nlpEngine.load();
    }

    let registry = options.registry;
    if (!registry) {
      registry = new RecognizerRegistry(
        undefined,
        DEFAULT_REGEX_FLAGS,
        this.supportedLanguages,
      );
    }

    const regLangs = [...registry.supportedLanguages].sort();
    const engLangs = [...this.supportedLanguages].sort();
    if (JSON.stringify(regLangs) !== JSON.stringify(engLangs)) {
      throw new Error(
        `Misconfigured engine: language mismatch. ` +
        `registry: ${JSON.stringify(registry.supportedLanguages)}, ` +
        `engine: ${JSON.stringify(this.supportedLanguages)}`,
      );
    }
    this.registry = registry;

    this.contextAwareEnhancer =
      options.contextAwareEnhancer ?? new LemmaContextAwareEnhancer();
  }

  /* ------ Public API ------ */

  /**
   * Find PII entities in text.
   *
   * @example
   * ```ts
   * const results = await engine.analyze(
   *   "My phone is 212-555-5555",
   *   "en",
   *   { entities: ["PHONE_NUMBER"] },
   * );
   * ```
   */
  public async analyze(
    text: string,
    language: string,
    opts: AnalyzeOptions = {},
  ): Promise<RecognizerResult[]> {
    const allFields = opts.entities === undefined;

    const recognizers = this.registry.getRecognizers(
      language,
      opts.entities ?? null,
      allFields,
      opts.adHocRecognizers,
    );

    let entities: string[] | undefined = opts.entities;
    if (allFields) {
      entities = this.getSupportedEntities(language);
    }

    // NLP
    const nlpArtifacts =
      opts.nlpArtifacts ??
      (await this.nlpEngine.processText(text, language));

    if (this.logDecisionProcess) {
      this.appTracer.trace(
        opts.correlationId ?? null,
        "nlp artifacts: " + nlpArtifacts.toJson(),
      );
    }

    // Recognizers
    let results: RecognizerResult[] = [];
    for (const rec of recognizers) {
      if (!rec.isLoaded) {
        rec.load();
        rec.isLoaded = true;
      }
      const current = rec.analyze(text, entities ?? [], nlpArtifacts);
      if (current.length > 0) {
        addRecognizerIdIfNotExists(current, rec);
        results.push(...current);
      }
    }

    // Context enhancement
    results = enhanceUsingContext(
      results,
      nlpArtifacts,
      recognizers,
      this.contextAwareEnhancer,
      text,
      opts.context,
    );

    if (this.logDecisionProcess) {
      this.appTracer.trace(
        opts.correlationId ?? null,
        JSON.stringify(results.map((r) => r.toDict())),
      );
    }

    // Deduplicate
    results = EntityRecognizer.removeDuplicates(results);

    // Threshold
    results = removeLowScores(results, opts.scoreThreshold, this.defaultScoreThreshold);

    // Allow list
    if (opts.allowList && opts.allowList.length > 0) {
      results = removeAllowList(
        results,
        opts.allowList,
        text,
        opts.regexFlags ?? DEFAULT_REGEX_FLAGS,
        opts.allowListMatch ?? "exact",
      );
    }

    // Decision process
    if (!opts.returnDecisionProcess) {
      results = stripDecisionProcess(results);
    }

    return results;
  }

  /** Return loaded recognizers for the given language(s). */
  public getRecognizers(language?: string): EntityRecognizer[] {
    const languages = language ? [language] : this.supportedLanguages;
    const set = new Set<EntityRecognizer>();
    for (const lang of languages) {
      for (const r of this.registry.getRecognizers(lang, null, true)) {
        set.add(r);
      }
    }
    return [...set];
  }

  /** Return supported entity types. */
  public getSupportedEntities(language?: string): string[] {
    const recs = this.getRecognizers(language);
    const ents: string[] = [];
    for (const r of recs) ents.push(...r.getSupportedEntities());
    return [...new Set(ents)];
  }
}

/* ------------------------------------------------------------------ */
/*  Pure helpers                                                       */
/* ------------------------------------------------------------------ */

/** Enhance results with context-aware logic. */
function enhanceUsingContext(
  rawResults: RecognizerResult[],
  nlpArtifacts: NlpArtifacts,
  recognizers: EntityRecognizer[],
  enhancer: ContextAwareEnhancer,
  text: string,
  context?: string[],
): RecognizerResult[] {
  let results: RecognizerResult[] = [];

  for (const rec of recognizers) {
    const recResults = rawResults.filter(
      (r) => r.recognitionMetadata?.[RecognizerResult.RECOGNIZER_IDENTIFIER_KEY] === rec.id,
    );
    const otherResults = rawResults.filter(
      (r) => r.recognitionMetadata?.[RecognizerResult.RECOGNIZER_IDENTIFIER_KEY] !== rec.id,
    );
    const enhanced = rec.enhanceUsingContext(
      text, recResults, otherResults, nlpArtifacts, context,
    );
    results.push(...enhanced);
  }

  results = enhancer.enhanceUsingContext(
    text, results, nlpArtifacts, recognizers, context,
  );
  return results;
}

/** Remove results with score below threshold. */
function removeLowScores(
  results: RecognizerResult[],
  scoreThreshold: number | undefined,
  defaultThreshold: number,
): RecognizerResult[] {
  const threshold = scoreThreshold ?? defaultThreshold;
  return results.filter((r) => r.score >= threshold);
}

/** Strip `analysisExplanation` from results. */
function stripDecisionProcess(results: RecognizerResult[]): RecognizerResult[] {
  for (const r of results) {
    r.analysisExplanation = null;
  }
  return results;
}

/** Remove allow-listed words from results. */
function removeAllowList(
  results: RecognizerResult[],
  allowList: string[],
  text: string,
  regexFlags: string,
  allowListMatch: AllowListMatch,
): RecognizerResult[] {
  if (allowListMatch === "regex") {
    const nonEmpty = allowList.filter((t) => t.length > 0);
    if (nonEmpty.length === 0) return [...results];
    const compiled = new RegExp(nonEmpty.join("|"), regexFlags);
    return results.filter((r) => {
      try {
        return !compiled.test(text.slice(r.start, r.end));
      } catch {
        return true;
      }
    });
  }

  if (allowListMatch === "exact") {
    const set = new Set(allowList);
    return results.filter(
      (r) => !set.has(text.slice(r.start, r.end)),
    );
  }

  throw new Error(
    `allowListMatch must be 'exact' or 'regex', got '${allowListMatch}'`,
  );
}

/** Ensure each result carries recognizer metadata. */
function addRecognizerIdIfNotExists(
  results: RecognizerResult[],
  rec: EntityRecognizer,
): void {
  for (const r of results) {
    if (!r.recognitionMetadata) {
      r.recognitionMetadata = {};
    }
    if (!Object.prototype.hasOwnProperty.call(r.recognitionMetadata, RecognizerResult.RECOGNIZER_IDENTIFIER_KEY)) {
      r.recognitionMetadata[RecognizerResult.RECOGNIZER_IDENTIFIER_KEY] = rec.id;
    }
    if (!Object.prototype.hasOwnProperty.call(r.recognitionMetadata, RecognizerResult.RECOGNIZER_NAME_KEY)) {
      r.recognitionMetadata[RecognizerResult.RECOGNIZER_NAME_KEY] = rec.name;
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Fallback NLP Engine (no spaCy)                                     */
/* ------------------------------------------------------------------ */

/** Minimal NLP engine using regex tokenization. */
class SimpleFallbackNlpEngine extends NlpEngine {
  #loaded = true;

  public isLoaded(): boolean {
    return this.#loaded;
  }

  public async load(): Promise<void> {
    this.#loaded = true;
  }

  public processText(text: string, language: string): Promise<NlpArtifacts> {
    const tokensData = tokenizeSimple(text);
    return Promise.resolve(
      new NlpArtifacts(
        [],
        tokensData.map((t) => t.token),
        tokensData.map((t) => t.index),
        tokensData.map((t) => t.lemma),
        tokensData
          .filter((t) => !isStopWord(t.token) && !isPunctuation(t.token))
          .map((t) => t.lemma),
        language,
      ),
    );
  }

  public async *processBatch(
    texts: Iterable<string>,
    language: string,
    _batchSize?: number,
    _nProcess?: number,
  ): AsyncIterable<[string, NlpArtifacts]> {
    for (const text of texts) {
      const artifacts = await this.processText(text, language);
      yield [text, artifacts];
    }
  }

  public isStopword(word: string, _language: string): boolean {
    return isStopWord(word);
  }

  public isPunct(word: string, _language: string): boolean {
    return isPunctuation(word);
  }

  public getSupportedEntities(): string[] {
    return [];
  }

  public getSupportedLanguages(): string[] {
    return ["en"];
  }
}

function createFallbackNlpEngine(): SimpleFallbackNlpEngine {
  return new SimpleFallbackNlpEngine();
}

/** Tokenize: split on alphanumeric runs. */
function tokenizeSimple(text: string): Array<{ token: string; index: number; lemma: string }> {
  const out: Array<{ token: string; index: number; lemma: string }> = [];
  const re = /[a-zA-Z0-9]+(?:['-][a-zA-Z]+)*/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    out.push({ token: m[0], index: m.index, lemma: m[0].toLowerCase() });
  }
  return out;
}