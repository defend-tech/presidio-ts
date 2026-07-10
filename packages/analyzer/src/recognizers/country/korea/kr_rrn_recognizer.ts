import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** KR_RRN recognizer for KR region. */
export class KrRrnRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "kr";

  static readonly PATTERNS = [
    new Pattern(
      "RRN (Medium)",
      "(?<!\\d)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])(-?)[1-4]\\d{6}(?!\\d)",
      0.5,
    ),
  ];

  static readonly CONTEXT = [
    "Korean RRN",
    "Korean Resident Registration Number",
    "Resident Registration Number",
    "RRN",
    "rrn",
    "rrn#",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "KR_RRN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? KrRrnRecognizer.PATTERNS,
      undefined,
      context ?? KrRrnRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean | null {
    const value = patternText.replace(/-/g, "");
    if (!/^\d{13}$/.test(value)) return false;
    const region = Number(value.slice(7, 9));
    const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
    const total = weights.reduce(
      (sum, weight, index) => sum + Number(value[index]) * weight,
      0,
    );
    return region >= 0 && region <= 95 && (11 - (total % 11)) % 10 === Number(value[12])
      ? true
      : null;
  }
}
