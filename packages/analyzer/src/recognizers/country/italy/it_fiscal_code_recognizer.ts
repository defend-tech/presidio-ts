import { Pattern, PatternRecognizer } from "@presidio/core";

/** IT_FISCAL_CODE recognizer for IT region. */
export class ItFiscalCodeRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "it";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["codice fiscale", "cf"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "IT_FISCAL_CODE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? ItFiscalCodeRecognizer.PATTERNS,
      undefined,
      context ?? ItFiscalCodeRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the pattern logic e.g., by running checksum on a detected pattern.
   */
}
