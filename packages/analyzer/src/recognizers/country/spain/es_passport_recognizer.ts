import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** ES_PASSPORT recognizer for ES region. */
export class EsPassportRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "es";

  static readonly PATTERNS = [new Pattern("ES_PASSPORT", "\\b[A-Z]{3}[0-9]{6}\\b", 0.05)];

  static readonly CONTEXT = [
    "pasaporte",
    "passport",
    "número de pasaporte",
    "passport number",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "ES_PASSPORT",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? EsPassportRecognizer.PATTERNS,
      undefined,
      context ?? EsPassportRecognizer.CONTEXT,
    );
  }
}
