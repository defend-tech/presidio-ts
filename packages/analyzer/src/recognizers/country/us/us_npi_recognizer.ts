import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** US_NPI recognizer for US region. */
export class UsNpiRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "us";

  static readonly PATTERNS = [
    new Pattern("NPI (weak)", "\\b[12]\\d{9}\\b", 0.1),
    new Pattern("NPI (medium)", "\\b[12]\\d{3}[ -]\\d{3}[ -]\\d{3}\\b", 0.4),
  ];

  static readonly CONTEXT = [
    "npi",
    "national provider",
    "provider",
    "npi number",
    "provider id",
    "provider identifier",
    "taxonomy",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "US_NPI",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? UsNpiRecognizer.PATTERNS,
      undefined,
      context ?? UsNpiRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    const value = patternText.replace(/[ -]/g, "");
    if (!/^\d{10}$/.test(value)) return false;
    let sum = 0;
    [...`80840${value}`].reverse().forEach((char, index) => {
      const digit = Number(char);
      const doubled = index % 2 === 1 ? digit * 2 : digit;
      sum += doubled > 9 ? doubled - 9 : doubled;
    });
    return sum % 10 === 0;
  }

  override invalidateResult(patternText: string): boolean {
    const value = patternText.replace(/[ -]/g, "");
    const body = value.slice(0, -1);
    return body.length > 0 && [...body].every((digit) => digit === body[0]);
  }
}
