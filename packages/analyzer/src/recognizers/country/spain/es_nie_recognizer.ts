import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** ES_NIE recognizer for ES region. */
export class EsNieRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "es";

  static readonly PATTERNS = [
    new Pattern("NIE", "\\b[X-Z]?[0-9]?[0-9]{7}[-]?[A-Z]\\b", 0.5),
  ];

  static readonly CONTEXT = ["número de identificación de extranjero", "NIE"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "ES_NIE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? EsNieRecognizer.PATTERNS,
      undefined,
      context ?? EsNieRecognizer.CONTEXT,
    );
  }
}
