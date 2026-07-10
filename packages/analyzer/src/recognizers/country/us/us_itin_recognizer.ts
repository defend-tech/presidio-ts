import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** US_ITIN recognizer for US region. */
export class UsItinRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "us";

  static readonly PATTERNS = [
    new Pattern(
      "Itin (very weak)",
      "\\b9\\d{2}[- ](5\\d|6[0-5]|7\\d|8[0-8]|9([0-2]|[4-9]))\\d{4}\\b|\\b9\\d{2}(5\\d|6[0-5]|7\\d|8[0-8]|9([0-2]|[4-9]))[- ]\\d{4}\\b",
      0.05,
    ),
    new Pattern(
      "Itin (weak)",
      "\\b9\\d{2}(5\\d|6[0-5]|7\\d|8[0-8]|9([0-2]|[4-9]))\\d{4}\\b",
      0.3,
    ),
    new Pattern(
      "Itin (medium)",
      "\\b9\\d{2}[- ](5\\d|6[0-5]|7\\d|8[0-8]|9([0-2]|[4-9]))[- ]\\d{4}\\b",
      0.5,
    ),
  ];

  static readonly CONTEXT = [
    "individual",
    "taxpayer",
    "itin",
    "tax",
    "payer",
    "taxid",
    "tin",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "US_ITIN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? UsItinRecognizer.PATTERNS,
      undefined,
      context ?? UsItinRecognizer.CONTEXT,
    );
  }
}
