import { Pattern, PatternRecognizer } from "@presidio/core";

/** IT_VAT_CODE recognizer for IT region. */
export class ItVatCodeRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "it";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["piva", "partita iva", "pi"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "IT_VAT_CODE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? ItVatCodeRecognizer.PATTERNS,
      undefined,
      context ?? ItVatCodeRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the pattern logic e.g., by running checksum on a detected pattern.
   */
}
