import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** DE_TAX_NUMBER recognizer for DE region. */
export class DeTaxNumberRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [
    new Pattern(
      "Steuernummer ELSTER (bundeseinheitlich, 13-stellig)",
      "\\b(0[1-9]|1[0-6])\\d{11}\\b",
      0.5,
    ),
    new Pattern(
      "Steuernummer mit Schr\u00e4gstrich (Bayern/BW: 3/3/5)",
      "(?<!\\w)\\d{3}/\\d{3}/\\d{5}(?!\\w)",
      0.4,
    ),
    new Pattern(
      "Steuernummer mit Schr\u00e4gstrich (NW: 3/4/4 oder allgemein 2-3/3-4/4-5)",
      "(?<!\\w)\\d{2,3}/\\d{3,4}/\\d{4,5}(?!\\w)",
      0.2,
    ),
  ];

  static readonly CONTEXT = [
    "steuernummer",
    "steuer-nr",
    "steuer nr",
    "st.-nr",
    "st-nr",
    "finanzamt",
    "umsatzsteuer",
    "einkommensteuer",
    "körperschaftsteuer",
    "gewerbesteuer",
    "steuerveranlagung",
    "steuerbescheid",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "DE_TAX_NUMBER",
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
