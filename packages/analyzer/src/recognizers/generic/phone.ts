import { searchPhoneNumbersInText } from "libphonenumber-js";

import {
  AnalysisExplanation,
  EntityRecognizer,
  LocalRecognizer,
  RecognizerResult,
} from "@defend-tech/presidio-core";
import type { NlpArtifacts } from "@defend-tech/presidio-core";

/**
 * Recognize multi-regional phone numbers using libphonenumber-js.
 *
 * Searches across all supported regions simultaneously using
 * `searchPhoneNumbersInText`. Duplicate results are removed before
 * returning.
 *
 * Note: libphonenumber-js uses ISO 3166-1 alpha-2 country codes
 * (e.g., "GB" instead of "UK").
 */
export class PhoneRecognizer extends LocalRecognizer {
  /** Default confidence score for recognized phone numbers. */
  public static readonly SCORE: number = 0.4;

  /** Context words that increase confidence in phone number detection. */
  public static readonly CONTEXT: string[] = [
    "phone",
    "number",
    "telephone",
    "cell",
    "cellphone",
    "mobile",
    "call",
  ];

  /** Default set of regions to support for phone number matching. */
  public static readonly DEFAULT_SUPPORTED_REGIONS: string[] = [
    "US",
    "GB",
    "DE",
    "FR",
    "IL",
    "IN",
    "CA",
    "BR",
  ];

  /** Regions this recognizer can parse phone numbers for. */
  public readonly supportedRegions: string[];

  /**
   * Strictness level of phone number formats.
   * Accepts values from 0 (lenient) to 3 (strict).
   * Maps to libphonenumber-js strictness values.
   */
  public readonly leniency: number;

  constructor(
    context: string[] | null = null,
    supportedLanguage = "en",
    supportedEntity = "PHONE_NUMBER",
    supportedRegions: string[] = PhoneRecognizer.DEFAULT_SUPPORTED_REGIONS,
    leniency = 1,
    name: string | null = null,
  ) {
    super(
      [supportedEntity],
      name,
      supportedLanguage,
      "0.0.1",
      context ?? PhoneRecognizer.CONTEXT,
    );
    this.supportedRegions = supportedRegions;
    this.leniency = leniency;
  }

  load(): void {
    // No-op: libphonenumber-js is loaded at import time
  }

  /**
   * Analyze text to detect phone numbers using libphonenumber-js.
   *
   * Uses `searchPhoneNumbersInText` to find phone number patterns across all
   * supported regions simultaneously. Results are deduplicated
   * before returning.
   *
   * @param text - Text to analyze
   * @param entities - Entities this recognizer should detect
   * @param _nlpArtifacts - Optional NLP artifacts (unused)
   * @returns List of RecognizerResult for detected phone numbers
   */
  analyze(
    text: string,
    entities: string[],
    _nlpArtifacts: NlpArtifacts | null = null,
  ): RecognizerResult[] {
    const results: RecognizerResult[] = [];

    // Map Python leniency (0-3) to libphonenumber-js strictness
    const strictnessMap: Record<
      number,
      "possible" | "probable" | "significant" | "strict"
    > = {
      0: "possible",
      1: "probable",
      2: "significant",
      3: "strict",
    };
    const strictness = strictnessMap[this.leniency] ?? "probable";

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const options: any = {
      regions: this.supportedRegions,
      strictness,
    };

    const matches = searchPhoneNumbersInText(text, options);
    for (const match of matches) {
      const region = match.number?.country ?? "unknown";
      results.push(
        new RecognizerResult(
          this.supportedEntities[0],
          match.startsAt,
          match.endsAt,
          PhoneRecognizer.SCORE,
          new AnalysisExplanation(
            PhoneRecognizer.name,
            PhoneRecognizer.SCORE,
            null,
            null,
            null,
            `Recognized as ${region} region phone number, using PhoneRecognizer`,
          ),
          {
            [RecognizerResult.RECOGNIZER_NAME_KEY]: this.name,
            [RecognizerResult.RECOGNIZER_IDENTIFIER_KEY]: this.id,
          },
        ),
      );
    }

    return EntityRecognizer.removeDuplicates(results);
  }
}
