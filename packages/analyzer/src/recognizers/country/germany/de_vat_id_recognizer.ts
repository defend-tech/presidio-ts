import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** DE_VAT_ID recognizer for DE region. */
export class DeVatIdRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [
    new Pattern(
      "Umsatzsteuer-Identifikationsnummer USt-IdNr. (DE + 9 digits)",
      "\\bDE\\d{9}\\b",
      0.5,
    ),
    new Pattern(
      "Umsatzsteuer-Identifikationsnummer USt-IdNr. (with separators)",
      "\\bDE[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}[\\s.\\-]?\\d{3}\\b",
      0.4,
    ),
  ];

  static readonly CONTEXT = [
    "umsatzsteuer-identifikationsnummer",
    "umsatzsteueridentifikationsnummer",
    "ust-idnr",
    "ust-id",
    "ustidnr",
    "umsatzsteuer-id",
    "mehrwertsteuer",
    "vat",
    "vat-id",
    "vat id",
    "steueridentifikation",
    "bzst",
    "bundeszentralamt für steuern",
    "finanzamt",
    "invoice",
    "rechnung",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "DE_VAT_ID",
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
  strictChecksum = false;

  override validateResult(patternText: string): boolean | null {
    const value = patternText.toUpperCase().replace(/[\s.-]/g, "");
    if (!/^DE\d{9}$/.test(value)) return false;
    const digits = value.slice(2);
    let product = 10;
    for (const digit of digits.slice(0, 8)) {
      let total = (Number(digit) + product) % 10;
      if (total === 0) total = 10;
      product = (total * 2) % 11;
    }
    let check = 11 - product;
    if (check === 10) check = 0;
    return check === Number(digits[8]) ? true : this.strictChecksum ? false : null;
  }
}
