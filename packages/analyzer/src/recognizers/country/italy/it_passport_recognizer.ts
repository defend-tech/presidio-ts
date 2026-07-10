import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** IT_PASSPORT recognizer for IT region. */
export class ItPassportRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "it";

  static readonly PATTERNS = [
    new Pattern("Passport (very weak)", "(?i)\\b[A-Z]{2}\\d{7}\\b", 0.01),
  ];

  static readonly CONTEXT = [
    "passaporto",
    "elettronico",
    "italiano",
    "viaggio",
    "viaggiare",
    "estero",
    "documento",
    "dogana",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "IT_PASSPORT",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? ItPassportRecognizer.PATTERNS,
      undefined,
      context ?? ItPassportRecognizer.CONTEXT,
    );
  }
}
