import { EntityRecognizer, Pattern, PatternRecognizer } from "@presidio/core";
import type { NlpEngine } from "../nlp/nlp-engine.js";

// Default regex flags: dotall, multiline, ignoreCase.
// In the Python version this is `re.DOTALL | re.MULTILINE | re.IGNORECASE`.
// The TypeScript PatternRecognizer uses string flags, so we map to `"gmsi"`.
const DEFAULT_GLOBAL_REGEX_FLAGS = "gmsi";

/**
 * Detect, register and hold all recognizers to be used by the analyzer.
 *
 * This is a TypeScript port of
 * `presidio_analyzer.recognizer_registry.RecognizerRegistry`.
 *
 * Browser-friendly constraints:
 * - No YAML loading (use `addRecognizer` or `addPatternRecognizerFromDict` instead).
 * - No spaCy / Stanza / Transformers NLP integration in the base class.
 *   NLP recognizers are added via `addNlpRecognizer` when a concrete
 *   `NlpEngine` implementation is provided.
 */
export class RecognizerRegistry {
  /** Registered recognizers. */
  public recognizers: EntityRecognizer[];

  /** Regex flags applied to all PatternRecognizers. */
  public globalRegexFlags: string;

  /** Languages this registry defaults to. */
  public supportedLanguages: string[];

  /**
   * @param recognizers - Optional initial list of recognizers.
   * @param globalRegexFlags - Regex flags for pattern matching. Defaults to `"gmsi"`.
   * @param supportedLanguages - Languages supported by this registry. Defaults to `["en"]`.
   */
  constructor(
    recognizers?: EntityRecognizer[],
    globalRegexFlags: string = DEFAULT_GLOBAL_REGEX_FLAGS,
    supportedLanguages: string[] = ["en"],
  ) {
    this.recognizers = recognizers ? [...recognizers] : [];
    this.globalRegexFlags = globalRegexFlags;
    this.supportedLanguages = supportedLanguages;
  }

  /* ------------------------------------------------------------------ */
  /*  Recognizer lifecycle                                               */
  /* ------------------------------------------------------------------ */

  /**
   * Add a new recognizer to the registry.
   *
   * @param recognizer - Recognizer instance to add.
   * @throws {TypeError} If the input is not an `EntityRecognizer`.
   */
  public addRecognizer(recognizer: EntityRecognizer): void {
    if (!this.#isEntityRecognizer(recognizer)) {
      throw new TypeError("Input is not of type EntityRecognizer");
    }
    this.recognizers.push(recognizer);
  }

  /**
   * Remove a recognizer by name (optionally scoped to a language).
   *
   * @param recognizerName - Name of recognizer to remove.
   * @param language - Optional language filter. If omitted, all languages are removed.
   */
  public removeRecognizer(
    recognizerName: string,
    language?: string,
  ): void {
    const before = this.recognizers.length;
    if (!language) {
      this.recognizers = this.recognizers.filter((rec) => rec.name !== recognizerName);
      console.info(
        `[RecognizerRegistry] Removed ${before - this.recognizers.length} ` +
          `recognizers named "${recognizerName}"`,
      );
    } else {
      this.recognizers = this.recognizers.filter(
        (rec) => rec.name !== recognizerName || rec.supportedLanguage !== language,
      );
      console.info(
        `[RecognizerRegistry] Removed ${before - this.recognizers.length} ` +
          `recognizers named "${recognizerName}" for language "${language}"`,
      );
    }
  }

  /**
   * Add a pattern recognizer from a plain object (dict-like config).
   *
   * This mirrors the Python `add_pattern_recognizer_from_dict`.
   *
   * @param recognizerDict - Dict holding a serialization of a PatternRecognizer.
   *
   * @example
   * ```ts
   * registry.addPatternRecognizerFromDict({
   *   name: "Titles Recognizer",
   *   supported_language: "en",
   *   supported_entity: "TITLE",
   *   deny_list: ["Mr.", "Mrs."],
   * });
   * ```
   */
  public addPatternRecognizerFromDict(
    recognizerDict: Record<string, unknown>,
  ): void {
    const recognizer = this.#createPatternRecognizerFromDict(recognizerDict);
    this.addRecognizer(recognizer);
  }

  /* ------------------------------------------------------------------ */
  /*  Querying recognizers                                               */
  /* ------------------------------------------------------------------ */

  /**
   * Return a list of recognizers matching the specified language and entities.
   *
   * @param language - The requested language.
   * @param entities - Optional list of entity types to filter by.
   * @param allFields - If `true`, return all recognizers for the language.
   * @param adHocRecognizers - Optional additional recognizers to include in this query.
   *
   * @returns List of matching recognizers.
   * @throws {Error} If `language` is empty, or if neither `entities` nor `allFields` is provided.
   * @throws {Error} If no matching recognizers are found.
   */
  public getRecognizers(
    language: string,
    entities: string[] | null = null,
    allFields: boolean = false,
    adHocRecognizers?: EntityRecognizer[],
  ): EntityRecognizer[] {
    if (!language) {
      throw new Error("No language provided");
    }
    if (entities === null && !allFields) {
      throw new Error("No entities provided");
    }

    const allPossible = [...this.recognizers];
    if (adHocRecognizers) {
      allPossible.push(...adHocRecognizers);
    }

    let toReturn: EntityRecognizer[];

    if (allFields) {
      toReturn = allPossible.filter(
        (rec) => rec.supportedLanguage === language,
      );
    } else {
      // entities is guaranteed non-null here because we throw above when
      // both entities === null and allFields === false
      const safeEntities = entities!;
      const matching = new Set<EntityRecognizer>();
      for (const entity of safeEntities) {
        const subset = allPossible.filter(
          (rec) =>
            rec.supportedEntities.includes(entity) &&
            rec.supportedLanguage === language,
        );

        if (subset.length === 0) {
          console.warn(
            `[RecognizerRegistry] Entity "${entity}" has no recognizer ` +
              `for language "${language}"`,
          );
        } else {
          for (const rec of subset) {
            matching.add(rec);
          }
        }
      }
      toReturn = [...matching];
    }

    console.debug(
      `[RecognizerRegistry] Returning ${toReturn.length} recognizers`,
    );

    if (toReturn.length === 0) {
      throw new Error(
        "No matching recognizers were found to serve the request.",
      );
    }

    return toReturn;
  }

  /**
   * Return the unique set of country codes currently represented in the registry.
   *
   * Aggregates the resolved country tag (`countryCode()`) across all loaded
   * recognizers and excludes locale-agnostic ones (`null`).
   *
   * @returns Sorted list of unique lowercased country codes.
   */
  public getCountryCodes(): string[] {
    const codes = new Set<string>();
    for (const rec of this.recognizers) {
      try {
        const code = rec.countryCode();
        if (typeof code === "string" && code.length > 0) {
          codes.add(code.toLowerCase());
        }
      } catch {
        // Defensive: third-party subclasses may throw
      }
    }
    return [...codes].sort();
  }

  /**
   * Return the supported entities across all loaded recognizers
   * for the given languages.
   *
   * @param languages - Optional language filter. If omitted, all languages are used.
   * @returns Deduplicated list of supported entity names.
   */
  public getSupportedEntities(languages?: string[]): string[] {
    const langs = languages ?? this.#getSupportedLanguages();
    const supported = new Set<string>();

    for (const language of langs) {
      try {
        const recognizers = this.getRecognizers(language, null, true);
        for (const rec of recognizers) {
          for (const entity of rec.getSupportedEntities()) {
            supported.add(entity);
          }
        }
      } catch {
        // No recognizers for this language — skip
      }
    }

    return [...supported];
  }

  /* ------------------------------------------------------------------ */
  /*  Predefined recognizer loading                                      */
  /* ------------------------------------------------------------------ */

  /**
   * Load predefined (built-in) recognizers into the registry.
   *
   * This is a simplified browser-friendly version that does **not**
   * load YAML configurations or Python-based recognizers. Subclasses
   * may override to add custom loading logic.
   *
   * @param languages - Optional languages to load recognizers for.
   * @param nlpEngine - Optional NLP engine used to add NLP-based recognizers.
   *
   * @remarks
   * In the Python version this reads `default_recognizers.yaml` and
   * instantiates all built-in recognizers. For the TypeScript/browser
   * version, concrete implementations should call `addRecognizer`
   * with their predefined recognizers.
   */
  public loadPredefinedRecognizers(
    languages: string[] | null = null,
    nlpEngine?: NlpEngine,
  ): void {
    // In a browser environment the caller is responsible for registering
    // recognizers explicitly via `addRecognizer` or providing a custom
    // implementation that bundles recognizers at build time.

    if (languages) {
      this.supportedLanguages = [...languages];
    }

    if (nlpEngine) {
      this.addNlpRecognizer(nlpEngine);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  NLP recognizer integration                                         */
  /* ------------------------------------------------------------------ */

  /**
   * Add an NLP-based recognizer for every language the engine supports.
   *
   * This method defers to subclasses for the actual recognizer class
   * since browser-based NLP engines differ from spaCy / Stanza / Transformers.
   *
   * @param nlpEngine - The NLP engine to derive recognizers from.
   */
  public addNlpRecognizer(nlpEngine: NlpEngine): void {
    const languages = nlpEngine
      ? nlpEngine.getSupportedLanguages()
      : this.supportedLanguages;

    for (const lang of languages) {
      const recognizer = this.#createNlpRecognizer(nlpEngine, lang);
      if (recognizer) {
        this.recognizers.push(recognizer);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Private helpers                                                    */
  /* ------------------------------------------------------------------ */

  /**
   * Collect all unique languages currently registered.
   */
  #getSupportedLanguages(): string[] {
    const languages = new Set<string>();
    for (const rec of this.recognizers) {
      languages.add(rec.supportedLanguage);
    }
    return [...languages];
  }

  /**
   * Guard: check if an object is an EntityRecognizer.
   */
  #isEntityRecognizer(value: unknown): value is EntityRecognizer {
    return (
      value instanceof EntityRecognizer ||
      (typeof value === "object" &&
        value !== null &&
        "supportedEntities" in value &&
        "supportedLanguage" in value &&
        "analyze" in value)
    );
  }

  /**
   * Create a `PatternRecognizer` from a plain dict-like object.
   *
   * Supports both Python-style snake_case keys and JavaScript camelCase keys.
   */
  #createPatternRecognizerFromDict(
    dict: Record<string, unknown>,
  ): PatternRecognizer {
    const copy: Record<string, unknown> = { ...dict };

    // Normalize supported_entities (plural) -> supported_entity (singular)
    const supportedEntities = copy.supported_entities as string[] | undefined;
    const supportedEntity = copy.supported_entity as string | undefined;

    if (supportedEntity && supportedEntities) {
      throw new Error(
        "Both 'supported_entity' and 'supported_entities' are present. " +
          "Only one should be provided.",
      );
    }

    const entity: string =
      supportedEntity ??
      (supportedEntities?.[0] ??
        (copy.supportedEntity as string) ??
        (copy.supported_entity as string));
    const name = (copy.name as string) ?? null;
    const supportedLanguage =
      (copy.supportedLanguage as string) ??
      (copy.supported_language as string) ??
      "en";
    const context = (copy.context as string[]) ?? null;
    const denyListScore = (copy.denyListScore as number) ??
      (copy.deny_list_score as number) ??
      1.0;
    const globalRegexFlags =
      (copy.globalRegexFlags as string) ??
      (copy.global_regex_flags as string) ??
      "gmsi";
    const version = (copy.version as string) ?? "0.0.1";
    const countryCode =
      (copy.countryCode as string) ?? (copy.country_code as string) ?? null;

    // Parse patterns from dict objects using Pattern.fromDict
    let patterns: Pattern[] | null = null;
    if (copy.patterns) {
      const rawPatterns = copy.patterns as Array<Record<string, unknown>>;
      patterns = rawPatterns.map((pat) => Pattern.fromDict(pat as { name: string; regex: string; score: number }));
    }

    // Deny list — supports both snake_case and camelCase
    let denyList: string[] | null = null;
    if (copy.denyList) {
      denyList = copy.denyList as string[];
    } else if (copy.deny_list) {
      denyList = copy.deny_list as string[];
    }

    return new PatternRecognizer(
      entity,
      name,
      supportedLanguage,
      patterns,
      denyList,
      context,
      denyListScore,
      globalRegexFlags,
      version,
      countryCode ?? null,
    );
  }

  /**
   * Create an NLP recognizer for the given engine and language.
   *
   * By default this returns `null` (no-op). Subclasses or custom
   * implementations should override via `createNlpRecognizer`.
   */
  #createNlpRecognizer(
    _nlpEngine: NlpEngine | undefined,
    _language: string,
  ): EntityRecognizer | null {
    // Default: no-op. Override in subclasses.
    return null;
  }
}

/**
 * Simple factory that creates a `RecognizerRegistry` with a given
 * set of recognizers and options, mirroring the Python
 * `RecognizerRegistryProvider`.
 */
export interface RecognizerRegistryOptions {
  /** Initial recognizers. */
  recognizers?: EntityRecognizer[];
  /** Supported languages. Defaults to `["en"]`. */
  supportedLanguages?: string[];
  /** Regex flags for pattern matching. */
  globalRegexFlags?: string;
}

/**
 * Create a `RecognizerRegistry` from options.
 *
 * @param options - Registry configuration.
 * @returns A configured `RecognizerRegistry`.
 */
export function createRecognizerRegistry(
  options: RecognizerRegistryOptions = {},
): RecognizerRegistry {
  return new RecognizerRegistry(
    options.recognizers,
    options.globalRegexFlags,
    options.supportedLanguages,
  );
}