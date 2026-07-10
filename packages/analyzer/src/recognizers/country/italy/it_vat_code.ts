import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** IT_VAT_CODE recognizer for IT region. */
export class ItVatCodeRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "it";

  static readonly PATTERNS = [
    new Pattern("IT Vat code (piva)", "\\b([0-9][ _]?){11}\\b", 0.1),
  ];

  static readonly CONTEXT = ["piva", "partita iva", "pi"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "IT_VAT_CODE",
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
  override validateResult(patternText: string): boolean {
    const value = patternText.replace(/[ -]/g, "");
    if (!/^\d{11}$/.test(value) || value === "00000000000") return false;
    let x = 0;
    let y = 0;
    for (let i = 0; i < 5; i++) {
      x += Number(value[2 * i]);
      const doubled = Number(value[2 * i + 1]) * 2;
      y += doubled > 9 ? doubled - 9 : doubled;
    }
    return (10 - ((x + y) % 10)) % 10 === Number(value[10]);
  }
}
