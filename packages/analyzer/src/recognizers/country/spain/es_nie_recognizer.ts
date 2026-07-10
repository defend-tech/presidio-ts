import { Pattern, PatternRecognizer } from "@presidio/core";

/** ES_NIE recognizer for ES region. */
export class EsNieRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "es";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["número de identificación de extranjero", "NIE"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "ES_NIE",
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
