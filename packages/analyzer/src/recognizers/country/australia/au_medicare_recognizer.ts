import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** AU_MEDICARE recognizer for AU region. */
export class AuMedicareRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "au";

  static readonly PATTERNS = [
    new Pattern(
      "Australian Medicare Number (Medium)",
      "\\b[2-6]\\d{3}\\s\\d{5}\\s\\d\\b",
      0.1,
    ),
    new Pattern("Australian Medicare Number (Low)", "\\b[2-6]\\d{9}\\b", 0.01),
  ];

  static readonly CONTEXT = ["medicare"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "AU_MEDICARE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? AuMedicareRecognizer.PATTERNS,
      undefined,
      context ?? AuMedicareRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    const digits = patternText.replace(/[ -]/g, "");
    if (!/^\d{10}$/.test(digits)) return false;
    const weights = [1, 3, 7, 9, 1, 3, 7, 9];
    return (
      weights.reduce((sum, weight, index) => sum + Number(digits[index]) * weight, 0) %
        10 ===
      Number(digits[8])
    );
  }
}
