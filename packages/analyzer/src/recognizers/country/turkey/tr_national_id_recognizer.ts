import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** TR_NATIONAL_ID recognizer for TR region. */
export class TrNationalIdRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "tr";

  static readonly PATTERNS = [new Pattern("TR_NATIONAL_ID", "\\b[1-9][0-9]{10}\\b", 0.3)];

  static readonly CONTEXT = [
    "tc kimlik",
    "kimlik no",
    "kimlik numarası",
    "tckn",
    "tc no",
    "nüfus cüzdanı",
    "national id",
    "turkish id",
    "türk kimlik",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "TR_NATIONAL_ID",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? TrNationalIdRecognizer.PATTERNS,
      undefined,
      context ?? TrNationalIdRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    if (!/^[1-9]\d{10}$/.test(patternText)) return false;
    const digits = [...patternText].map(Number);
    const odd = [0, 2, 4, 6, 8].reduce((sum, index) => sum + digits[index], 0);
    const even = [1, 3, 5, 7].reduce((sum, index) => sum + digits[index], 0);
    return (
      (odd * 7 - even) % 10 === digits[9] &&
      digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0) % 10 === digits[10]
    );
  }
}
