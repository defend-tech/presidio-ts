import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** IT_IDENTITY_CARD recognizer for IT region. */
export class ItIdentityCardRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "it";

  static readonly PATTERNS = [
    new Pattern(
      "Paper-based Identity Card (very weak)",
      "(?i)\\b[A-Z]{2}\\s?\\d{7}\\b",
      0.01,
    ),
    new Pattern(
      "Electronic Identity Card (CIE) 2.0 (very weak)",
      "(?i)\\b\\d{7}[A-Z]{2}\\b",
      0.01,
    ),
    new Pattern(
      "Electronic Identity Card (CIE) 3.0 (very weak)",
      "(?i)\\b[A-Z]{2}\\d{5}[A-Z]{2}\\b",
      0.01,
    ),
  ];

  static readonly CONTEXT = [
    "carta",
    "identità",
    "elettronica",
    "cie",
    "documento",
    "riconoscimento",
    "espatrio",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "IT_IDENTITY_CARD",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? ItIdentityCardRecognizer.PATTERNS,
      undefined,
      context ?? ItIdentityCardRecognizer.CONTEXT,
    );
  }
}
