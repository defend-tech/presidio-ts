import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** DE_TAX_ID recognizer for DE region. */
export class DeTaxIdRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [
    new Pattern("Steueridentifikationsnummer (High)", "\\b[1-9]\\d{10}\\b", 0.5),
  ];

  static readonly CONTEXT = [
    "steueridentifikationsnummer",
    "steuer-id",
    "steuerid",
    "steuerliche identifikationsnummer",
    "steuerliche identifikation",
    "persönliche identifikationsnummer",
    "steuer identifikation",
    "idnr",
    "steuer-idnr",
    "steuernummer",
    "bzst",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "DE_TAX_ID",
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
  override validateResult(patternText: string): boolean {
    if (!/^[1-9]\d{10}$/.test(patternText)) return false;
    const digits = [...patternText].map(Number);
    if (
      Math.max(
        ...digits
          .slice(0, 10)
          .map((digit) => digits.slice(0, 10).filter((other) => other === digit).length),
      ) > 3
    )
      return false;
    let product = 10;
    for (const digit of digits.slice(0, 10)) {
      let total = (digit + product) % 10;
      if (total === 0) total = 10;
      product = (total * 2) % 11;
    }
    let check = 11 - product;
    if (check === 10) check = 0;
    return check === digits[10];
  }
}
