import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** AU_ABN recognizer for AU region. */
export class AuAbnRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "au";

  static readonly PATTERNS = [
    new Pattern("ABN (Medium)", "\\b\\d{2}\\s\\d{3}\\s\\d{3}\\s\\d{3}\\b", 0.1),
    new Pattern("ABN (Low)", "\\b\\d{11}\\b", 0.01),
  ];

  static readonly CONTEXT = ["australian business number", "abn"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "AU_ABN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? AuAbnRecognizer.PATTERNS,
      undefined,
      context ?? AuAbnRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    const digits = patternText.replace(/[ -]/g, "");
    if (!/^\d{11}$/.test(digits)) return false;
    const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    return (
      digits
        .split("")
        .reduce(
          (sum, digit, index) =>
            sum + (Number(digit) - (index === 0 ? 1 : 0)) * weights[index],
          0,
        ) %
        89 ===
      0
    );
  }
}
