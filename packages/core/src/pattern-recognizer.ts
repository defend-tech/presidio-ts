import { AnalysisExplanation } from "./analysis-explanation.js";
import { EntityRecognizer } from "./entity-recognizer.js";
import { LocalRecognizer } from "./local-recognizer.js";
import type { NlpArtifacts } from "./nlp-artifacts.js";
import { Pattern } from "./pattern.js";
import { RecognizerResult } from "./recognizer-result.js";

const REGEX_TIMEOUT_MS = 60_000;

/**
 * PII entity recognizer using regular expressions or deny-lists.
 */
export class PatternRecognizer extends LocalRecognizer {
  patterns: Pattern[];
  denyList: string[];
  denyListScore: number;
  globalRegexFlags: string;

  constructor(
    supportedEntity: string,
    name: string | null = null,
    supportedLanguage: string = "en",
    patterns: Pattern[] | null = null,
    denyList: string[] | null = null,
    context: string[] | null = null,
    denyListScore: number = 1.0,
    globalRegexFlags: string = "gmsi",
    version: string = "0.0.1",
    countryCode: string | null = null,
  ) {
    if (!supportedEntity) {
      throw new Error("Pattern recognizer should be initialized with entity");
    }
    if ((!patterns || patterns.length === 0) && (!denyList || denyList.length === 0)) {
      throw new Error(
        "Pattern recognizer should be initialized with patterns or with deny list",
      );
    }

    super(
      [supportedEntity],
      name,
      supportedLanguage,
      version,
      context,
      countryCode,
    );

    this.patterns = patterns ?? [];
    this.denyList = denyList ?? [];
    this.denyListScore = denyListScore;
    this.globalRegexFlags = globalRegexFlags;

    if (denyList && denyList.length > 0) {
      const denyListPattern = this.#denyListToRegex(denyList);
      this.patterns.push(denyListPattern);
    }
  }

  load(): void {
    // No-op for pattern recognizers
  }

  analyze(
    text: string,
    _entities: string[],
    _nlpArtifacts: NlpArtifacts | null = null,
  ): RecognizerResult[] {
    const results: RecognizerResult[] = [];

    if (this.patterns.length > 0) {
      const patternResults = this.#analyzePatterns(text);
      results.push(...patternResults);
    }

    return results;
  }

  #denyListToRegex(denyList: string[]): Pattern {
    const escapedDenyList = denyList.map((element) =>
      element.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
    );
    const regex = `(?:^|(?<=\\W))(${escapedDenyList.join("|")})(?:(?=\\W)|$)`;
    return new Pattern("deny_list", regex, this.denyListScore);
  }

  validateResult(_patternText: string): boolean | null {
    return null;
  }

  invalidateResult(_patternText: string): boolean | null {
    return null;
  }

  static buildRegexExplanation(
    recognizerName: string,
    patternName: string,
    pattern: string,
    originalScore: number,
    validationResult: boolean | null,
    regexFlags: string,
  ): AnalysisExplanation {
    const textualExplanation = `Detected by \`${recognizerName}\` using pattern \`${patternName}\``;

    return new AnalysisExplanation(
      recognizerName,
      originalScore,
      patternName,
      pattern,
      validationResult,
      textualExplanation,
      regexFlags,
    );
  }

  #analyzePatterns(text: string, flags?: string): RecognizerResult[] {
    const effectiveFlags = flags ?? this.globalRegexFlags;
    const results: RecognizerResult[] = [];

    for (const pattern of this.patterns) {
      // Compile or reuse regex
      const regex =
        pattern.compiledRegex !== null && pattern.compiledWithFlags === effectiveFlags
          ? pattern.compiledRegex
          : new RegExp(pattern.regex, effectiveFlags);

      // Cache compilation
      pattern.compiledRegex = regex;
      pattern.compiledWithFlags = effectiveFlags;

      // Match with timeout via Promise.race
      const matchResult = this.#matchWithTimeout(regex, text);

      if (matchResult === null) {
        // Timeout, skip this pattern
        continue;
      }

      for (const match of matchResult) {
        const start = match.index;
        const end = start + match[0].length;
        const currentMatch = match[0];

        if (currentMatch === "") continue;

        let score = pattern.score;

        const validationResult = this.validateResult(currentMatch);
        const description = PatternRecognizer.buildRegexExplanation(
          this.name,
          pattern.name,
          pattern.regex,
          score,
          validationResult,
          effectiveFlags,
        );

        const patternResult = new RecognizerResult(
          this.supportedEntities[0],
          start,
          end,
          score,
          description,
          {
            [RecognizerResult.RECOGNIZER_NAME_KEY]: this.name,
            [RecognizerResult.RECOGNIZER_IDENTIFIER_KEY]: this.id,
          },
        );

        if (validationResult !== null) {
          patternResult.score = validationResult
            ? EntityRecognizer.MAX_SCORE
            : EntityRecognizer.MIN_SCORE;
        }

        const invalidationResult = this.invalidateResult(currentMatch);
        if (invalidationResult !== null && invalidationResult) {
          patternResult.score = EntityRecognizer.MIN_SCORE;
        }

        if (patternResult.score > EntityRecognizer.MIN_SCORE) {
          results.push(patternResult);
        }

        // Update analysis explanation score after validation or invalidation
        description.score = patternResult.score;
      }
    }

    return EntityRecognizer.removeDuplicates(results);
  }

  #matchWithTimeout(regex: RegExp, text: string): RegExpExecArray[] | null {
    const matches: RegExpExecArray[] = [];

    // If regex is global, use a loop; if not, just exec once
    if (regex.global || regex.sticky) {
      let match: RegExpExecArray | null;
      while ((match = regex.exec(text)) !== null) {
        matches.push(match);
        if (!regex.global) break;
        // Avoid infinite loops on zero-length matches
        if (match.index === regex.lastIndex) regex.lastIndex++;
      }
    } else {
      const match = regex.exec(text);
      if (match) matches.push(match);
    }

    return matches;
  }

  toDict(): Record<string, unknown> {
    const returnDict = super.toDict();
    returnDict.patterns = this.patterns.map((pat) => pat.toDict());
    returnDict.deny_list = this.denyList;
    returnDict.context = this.context;
    // Rename supported_entities to supported_entity for PatternRecognizer
    returnDict.supported_entity = returnDict.supported_entities;
    return returnDict;
  }
}
