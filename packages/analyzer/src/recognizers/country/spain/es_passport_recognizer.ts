import { Pattern, PatternRecognizer } from "@presidio/core";

/** ES_PASSPORT recognizer for ES region. */
export class EsPassportRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "es";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["pasaporte", "passport", "número de pasaporte", "passport number"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "ES_PASSPORT",
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
