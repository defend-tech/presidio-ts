import type { NlpArtifacts } from "./nlp-artifacts.js";
import type { RecognizerResult } from "./recognizer-result.js";

/**
 * A class representing an abstract PII entity recognizer.
 *
 * EntityRecognizer is an abstract class to be inherited by
 * Recognizers which hold the logic for recognizing specific PII entities.
 */
export abstract class EntityRecognizer {
  static MIN_SCORE = 0;
  static MAX_SCORE = 1.0;

  /** Canonical class-level country tag. Subclasses override on the class itself. */
  static COUNTRY_CODE: string | null = null;

  supportedEntities: string[];
  name: string;
  protected _id: string;
  supportedLanguage: string;
  version: string;
  isLoaded = false;
  context: string[];
  protected _countryCode: string | null;

  constructor(
    supportedEntities: string[],
    name: string | null = null,
    supportedLanguage = "en",
    version = "0.0.1",
    context: string[] | null = null,
    countryCode: string | null = null,
  ) {
    this.supportedEntities = supportedEntities;

    if (name === null) {
      // Use constructor name, fallback to "EntityRecognizer"
      this.name = this.constructor.name || "EntityRecognizer";
    } else {
      this.name = name;
    }

    this._id = `${this.name}_${Math.random().toString(36).substring(2, 11)}`;

    this.supportedLanguage = supportedLanguage;
    this.version = version;
    this.context = context ?? [];
    this._countryCode = EntityRecognizer.#resolveCountryCode(
      (this.constructor as typeof EntityRecognizer).COUNTRY_CODE,
      countryCode,
    );

    this.load();
    this.isLoaded = true;
  }

  static #resolveCountryCode(
    classCode: string | null,
    passed: string | null,
  ): string | null {
    const normalizedClass =
      typeof classCode === "string" ? classCode.toLowerCase().trim() : classCode;

    if (passed === null) {
      return normalizedClass;
    }

    if (typeof passed !== "string") {
      throw new TypeError(
        `country_code must be a string or null, got ${typeof passed}: ${passed}`,
      );
    }

    const trimmed = passed.trim();
    if (!trimmed) {
      throw new Error(`country_code must be a non-empty string; got ${passed}`);
    }

    const normalizedPassed = trimmed.toLowerCase();

    if (normalizedClass !== null && normalizedPassed !== normalizedClass) {
      throw new Error(
        `country_code="${passed}" conflicts with class-level ${
          (EntityRecognizer.constructor as typeof EntityRecognizer).name
        }.COUNTRY_CODE="${classCode}". The class attribute is the canonical declaration.`,
      );
    }

    return normalizedPassed;
  }

  countryCode(): string | null {
    return this._countryCode;
  }

  isCountrySpecific(): boolean {
    return this.countryCode() !== null;
  }

  get id(): string {
    return this._id;
  }

  abstract load(): void;

  abstract analyze(
    text: string,
    entities: string[],
    nlpArtifacts: NlpArtifacts | null,
  ): RecognizerResult[];

  enhanceUsingContext(
    _text: string,
    rawRecognizerResults: RecognizerResult[],
    _otherRawRecognizerResults: RecognizerResult[],
    _nlpArtifacts: NlpArtifacts | null,
    _context: string[] | null = null,
  ): RecognizerResult[] {
    return rawRecognizerResults;
  }

  getSupportedEntities(): string[] {
    return this.supportedEntities;
  }

  getSupportedLanguage(): string {
    return this.supportedLanguage;
  }

  getVersion(): string {
    return this.version;
  }

  toDict(): Record<string, unknown> {
    const returnDict: Record<string, unknown> = {
      supported_entities: this.supportedEntities,
      supported_language: this.supportedLanguage,
      name: this.name,
      version: this.version,
    };
    if (this._countryCode !== null) {
      returnDict.country_code = this._countryCode;
    }
    return returnDict;
  }

  static fromDict(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    entityRecognizerDict: Record<string, any>,
  ): EntityRecognizer {
    // This is meant to be overridden by subclasses
    const cls = EntityRecognizer as unknown as new (
      ...args: unknown[]
    ) => EntityRecognizer;
    return new cls(entityRecognizerDict);
  }

  /**
   * Remove duplicate results.
   * Duplicates are results with identical start/end positions and types.
   */
  static removeDuplicates(results: RecognizerResult[]): RecognizerResult[] {
    // Deduplicate using Set-like logic with hashCode string
    const seen = new Set<string>();
    const unique: RecognizerResult[] = [];
    for (const result of results) {
      const key = result.hashCode();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(result);
      }
    }

    // Sort by: higher score first, then earlier start, then shorter span
    unique.sort(
      (a, b) =>
        -b.score - -a.score ||
        a.start - b.start ||
        -(b.end - b.start) - -(a.end - a.start),
    );

    const filtered: RecognizerResult[] = [];

    for (const result of unique) {
      if (result.score === 0) continue;

      let toKeep = true;
      for (const existing of filtered) {
        if (result.equals(existing)) {
          toKeep = false;
          break;
        }
        if (result.containedIn(existing) && result.entityType === existing.entityType) {
          toKeep = false;
          break;
        }
      }

      if (toKeep) {
        filtered.push(result);
      }
    }

    return filtered;
  }

  /**
   * Cleanse the input string of the replacement pairs specified.
   */
  static sanitizeValue(text: string, replacementPairs: Array<[string, string]>): string {
    let result = text;
    for (const [searchString, replacementString] of replacementPairs) {
      result = result.replaceAll(searchString, replacementString);
    }
    return result;
  }
}
