import { Pattern, PatternRecognizer } from "@presidio/core";

/** DE_VAT_ID recognizer for DE region. */
export class DeVatIdRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["umsatzsteuer-identifikationsnummer", "umsatzsteueridentifikationsnummer", "ust-idnr", "ust-id", "ustidnr", "umsatzsteuer-id", "mehrwertsteuer", "vat", "vat-id", "vat id", "steueridentifikation", "bzst", "bundeszentralamt für steuern", "finanzamt", "invoice", "rechnung"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "DE_VAT_ID",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? DeVatIdRecognizer.PATTERNS,
      undefined,
      context ?? DeVatIdRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the USt-IdNr. after real-world-tolerant normalisation.
   */
}
