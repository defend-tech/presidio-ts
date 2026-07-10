import { isValidIBAN as ibantoolsIsValidIBAN } from "ibantools";

import { EntityRecognizer, Pattern, PatternRecognizer } from "@defend-tech/presidio-core";
import type { NlpArtifacts } from "@defend-tech/presidio-core";
import { RecognizerResult } from "@defend-tech/presidio-core";
import { BOS, EOS, regexPerCountry } from "./iban-patterns.js";

/**
 * Recognize IBAN codes using regex and checksum validation.
 *
 * Uses a generic IBAN pattern for initial matching, then validates
 * each match against the IBAN checksum algorithm and country-specific
 * format rules. Multiple capture groups enable progressive truncation
 * to avoid false positives from trailing characters.
 *
 * @see https://en.wikipedia.org/wiki/International_Bank_Account_Number
 */
export class IbanRecognizer extends PatternRecognizer {
  /**
   * Generic IBAN pattern with three capture groups for progressive matching.
   *
   * Group 1: Country code + check digits + 2-6 groups of 4 alphanumerics
   * Group 2 (optional): 1 additional group of 4 alphanumerics
   * Group 3 (optional): 1-3 trailing alphanumerics
   *
   * The analyze method iterates through groups in reverse order (3 → 2 → 1),
   * trying progressively shorter matches so that trailing non-IBAN characters
   * do not cause false positives.
   */
  public static readonly PATTERNS: Pattern[] = [
    new Pattern(
      "IBAN Generic",
      "(?<![A-Z0-9])([A-Z]{2}[0-9]{2}(?:[ -]?[A-Z0-9]{4}){2,6})((?:[ -]?[A-Z0-9]{4})?)((?:[ -]?[A-Z0-9]{1,3})?)(?![A-Z0-9])",
      0.5,
    ),
  ];

  /** Context words that increase confidence in IBAN detection. */
  public static readonly CONTEXT: string[] = ["iban", "bank", "transaction"];

  /** Replacement pairs used to normalize IBAN text. */
  private readonly replacementPairs: [string, string][];

  /** Whether to use exact BOS/EOS matching. */
  private readonly exactMatch: boolean;

  /** BOS and EOS anchors for exact matching. */
  private readonly bosEos: [string, string];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supportedLanguage = "en",
    supportedEntity = "IBAN_CODE",
    exactMatch = false,
    bosEos: [string, string] = [BOS, EOS],
    globalRegexFlags = "gmsi",
    replacementPairs: [string, string][] | null = null,
    name: string | null = null,
  ) {
    super(
      supportedEntity,
      name,
      supportedLanguage,
      patterns ?? IbanRecognizer.PATTERNS,
      null,
      context ?? IbanRecognizer.CONTEXT,
      1.0,
      globalRegexFlags,
    );
    this.replacementPairs = replacementPairs ?? [
      ["-", ""],
      [" ", ""],
    ];
    this.exactMatch = exactMatch;
    this.bosEos = exactMatch ? bosEos : ["", ""];
  }

  /**
   * Validate an IBAN by checking its checksum and format using ibantools.
   *
   * @param patternText - The matched IBAN candidate
   * @returns `true` if valid checksum and format, `null` if checksum valid
   *          but uppercase format matches (partial confidence), `false` if invalid
   */
  validateResult(patternText: string): boolean | null {
    try {
      const sanitized = EntityRecognizer.sanitizeValue(
        patternText,
        this.replacementPairs,
      );

      // Use ibantools library for IBAN validation
      const ibantoolsValid = ibantoolsIsValidIBAN(sanitized);

      if (ibantoolsValid) {
        // Also verify country-specific format if exactMatch is enabled
        if (this.exactMatch) {
          if (IbanRecognizer.isValidFormat(sanitized.toUpperCase(), this.bosEos)) {
            return true;
          }
          if (IbanRecognizer.isValidFormat(sanitized, this.bosEos)) {
            return null;
          }
        }
        return true;
      }

      // Fallback: use our own checksum validation for edge cases
      const generatedCheck = IbanRecognizer.generateIbanCheckDigits(sanitized);
      const isChecksumValid = generatedCheck === sanitized.slice(2, 4);

      if (isChecksumValid) {
        if (IbanRecognizer.isValidFormat(sanitized, this.bosEos)) {
          return true;
        }
        if (IbanRecognizer.isValidFormat(sanitized.toUpperCase(), this.bosEos)) {
          return null;
        }
      }
      return false;
    } catch {
      return false;
    }
  }

  /**
   * Override analyze to handle the multi-group progressive matching logic
   * used by the Python IBAN recognizer.
   *
   * The Python version iterates through capture groups in reverse order
   * (3 → 2 → 1), trying progressively shorter matches until one validates.
   * This prevents false positives from trailing non-IBAN characters.
   *
   * For example: "IBAN123456 X" — tries "IBAN123456 X" (fails validation),
   * then "IBAN123456" (passes), avoiding the trailing " X".
   *
   * @param text - Text to analyze
   * @param entities - Entities to detect
   * @param _nlpArtifacts - Optional NLP artifacts (unused)
   * @returns List of RecognizerResult
   */
  analyze(
    text: string,
    entities: string[],
    _nlpArtifacts: NlpArtifacts | null = null,
  ): RecognizerResult[] {
    const results: RecognizerResult[] = [];

    for (const pattern of this.patterns) {
      const regex = new RegExp(pattern.regex, this.globalRegexFlags);
      let match = regex.exec(text);

      while (match !== null) {
        // Iterate through capture groups in reverse order (3 → 2 → 1)
        const numGroups = match.length - 1;

        for (let grpNum = numGroups; grpNum >= 1; grpNum--) {
          const groupValue = match[grpNum];
          if (groupValue === undefined || groupValue === "") continue;

          const start = match.index;
          // For group 1, the end is start + length of group 1
          // For groups 2 and 3, calculate cumulative length
          let end: number;
          if (grpNum === 1) {
            end = start + groupValue.length;
          } else {
            // Calculate cumulative length of all groups up to grpNum
            let cumulativeLength = 0;
            for (let i = 1; i <= grpNum; i++) {
              const gv = match[i] ?? "";
              cumulativeLength += gv.length;
            }
            end = start + cumulativeLength;
          }

          const currentMatch = text.slice(start, end);
          if (currentMatch === "") continue;

          const score = pattern.score;
          const validationResult = this.validateResult(currentMatch);

          const description = PatternRecognizer.buildRegexExplanation(
            this.name,
            pattern.name,
            pattern.regex,
            score,
            validationResult,
            this.globalRegexFlags,
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

          if (patternResult.score > EntityRecognizer.MIN_SCORE) {
            results.push(patternResult);
            break; // Found a valid match for this occurrence, try next occurrence
          }
        }
        match = regex.exec(text);
      }
    }

    return EntityRecognizer.removeDuplicates(results);
  }

  /**
   * Generate IBAN check digits using the MOD-97 algorithm.
   *
   * The check digits are computed by:
   * 1. Moving the first 4 characters to the end
   * 2. Replacing letters with digits (A=10, B=11, ..., Z=35)
   * 3. Computing 98 - (number mod 97)
   *
   * @param iban - The IBAN string (spaces/dashes already removed)
   * @returns The 2-digit check code
   */
  private static generateIbanCheckDigits(iban: string): string {
    // Replace letters with their numeric equivalents
    const numbered = [...iban]
      .map((ch) => {
        if (ch >= "0" && ch <= "9") return ch;
        if (ch >= "A" && ch <= "Z") return String(ch.charCodeAt(0) - 55);
        if (ch >= "a" && ch <= "z") return String(ch.charCodeAt(0) - 87);
        return ch;
      })
      .join("");

    // MOD-97 using BigInt for large number handling
    let remainder = BigInt(0);
    for (const digit of numbered) {
      remainder = (remainder * 10n + BigInt(digit)) % 97n;
    }
    const check = (97n - remainder) % 97n;
    return String(check).padStart(2, "0");
  }

  /**
   * Check if an IBAN matches its country-specific format regex.
   *
   * @param iban - The IBAN to validate (spaces/dashes removed)
   * @param bosEos - Beginning and end of string anchors
   * @returns `true` if the format matches
   */
  private static isValidFormat(iban: string, bosEos: [string, string]): boolean {
    const countryCode = iban.slice(0, 2);
    const countryRegex = regexPerCountry[countryCode];
    if (!countryRegex) {
      return false;
    }

    const fullRegex = bosEos[0] + countryRegex + bosEos[1];
    try {
      return new RegExp(fullRegex, "im").test(iban);
    } catch {
      return false;
    }
  }
}
