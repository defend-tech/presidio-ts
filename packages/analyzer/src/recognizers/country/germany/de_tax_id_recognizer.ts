import { Pattern, PatternRecognizer } from "@presidio/core";

/** DE_TAX_ID recognizer for DE region. */
export class DeTaxIdRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["steueridentifikationsnummer", "steuer-id", "steuerid", "steuerliche identifikationsnummer", "steuerliche identifikation", "persönliche identifikationsnummer", "steuer identifikation", "idnr", "steuer-idnr", "steuernummer", "bzst"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "DE_TAX_ID",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? DeTaxIdRecognizer.PATTERNS,
      undefined,
      context ?? DeTaxIdRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the Steueridentifikationsnummer using the official checksum algorithm.
   */
}
