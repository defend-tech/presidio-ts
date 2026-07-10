import { Pattern, PatternRecognizer } from "@presidio/core";

/** DE_TAX_NUMBER recognizer for DE region. */
export class DeTaxNumberRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["steuernummer", "steuer-nr", "steuer nr", "st.-nr", "st-nr", "finanzamt", "umsatzsteuer", "einkommensteuer", "körperschaftsteuer", "gewerbesteuer", "steuerveranlagung", "steuerbescheid"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "DE_TAX_NUMBER",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? DeTaxNumberRecognizer.PATTERNS,
      undefined,
      context ?? DeTaxNumberRecognizer.CONTEXT,
    );
  }

}
