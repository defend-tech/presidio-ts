import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** TH_TNIN recognizer for TH region. */
export class ThTninRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "th";

  static readonly PATTERNS = [
    new Pattern(
      "TNIN (Medium)",
      "\\b[1-9](?:[134][0-9]|2[0-7]|5[0-8]|[67][01234567]|[89][0123456])\\d{10}\\b",
      0.5,
    ),
  ];

  static readonly CONTEXT = [
    "Thai National ID",
    "Thai ID Number",
    "TNIN",
    "เลขประจำตัวประชาชน",
    "เลขบัตรประชาชน",
    "รหัสปชช",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "TH_TNIN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? ThTninRecognizer.PATTERNS,
      undefined,
      context ?? ThTninRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    if (!/^\d{13}$/.test(patternText)) return false;
    const total = [...patternText.slice(0, 12)].reduce(
      (sum, digit, index) => sum + Number(digit) * (13 - index),
      0,
    );
    const remainder = total % 11;
    const check = remainder <= 1 ? 1 - remainder : 11 - remainder;
    return check === Number(patternText[12]);
  }
}
