import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** AU_ACN recognizer for AU region. */
export class AuAcnRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "au";

  static readonly PATTERNS = [
    new Pattern("ACN (Medium)", "\\b\\d{3}\\s\\d{3}\\s\\d{3}\\b", 0.1),
    new Pattern("ACN (Low)", "\\b\\d{9}\\b", 0.01),
  ];

  static readonly CONTEXT = ["australian company number", "acn"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "AU_ACN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? AuAcnRecognizer.PATTERNS,
      undefined,
      context ?? AuAcnRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    const digits = patternText.replace(/[ -]/g, "");
    if (!/^\d{9}$/.test(digits)) return false;
    const weights = [8, 7, 6, 5, 4, 3, 2, 1];
    const total = weights.reduce(
      (sum, weight, index) => sum + Number(digits[index]) * weight,
      0,
    );
    return (10 - (total % 10)) % 10 === Number(digits[8]);
  }
}
