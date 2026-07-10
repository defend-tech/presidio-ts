import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** IN_PASSPORT recognizer for IN region. */
export class InPassportRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "in";

  static readonly PATTERNS = [
    new Pattern("PASSPORT", "\\b[A-Z][1-9]\\d\\s?\\d{4}[1-9]\\b", 0.1),
  ];

  static readonly CONTEXT = ["passport", "indian passport", "passport number"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "IN_PASSPORT",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? InPassportRecognizer.PATTERNS,
      undefined,
      context ?? InPassportRecognizer.CONTEXT,
    );
  }
}
