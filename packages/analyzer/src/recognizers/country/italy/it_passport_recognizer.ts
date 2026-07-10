import { Pattern, PatternRecognizer } from "@presidio/core";

/** IT_PASSPORT recognizer for IT region. */
export class ItPassportRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "it";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["passaporto", "elettronico", "italiano", "viaggio", "viaggiare", "estero", "documento", "dogana"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "IT_PASSPORT",
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
