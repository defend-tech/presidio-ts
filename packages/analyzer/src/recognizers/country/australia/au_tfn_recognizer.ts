import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** AU_TFN recognizer for AU region. */
export class AuTfnRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "au";

  static readonly PATTERNS = [
    new Pattern("TFN (Medium)", "\\b\\d{3}\\s\\d{3}\\s\\d{3}\\b", 0.1),
    new Pattern("TFN (Low)", "\\b\\d{9}\\b", 0.01),
  ];

  static readonly CONTEXT = ["tax file number", "tfn"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "AU_TFN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? AuTfnRecognizer.PATTERNS,
      undefined,
      context ?? AuTfnRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    const digits = patternText.replace(/[ -]/g, "");
    if (!/^\d{9}$/.test(digits)) return false;
    const weights = [1, 4, 3, 7, 5, 8, 6, 9, 10];
    return (
      weights.reduce((sum, weight, index) => sum + Number(digits[index]) * weight, 0) %
        11 ===
      0
    );
  }
}
