import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** KR_BRN recognizer for KR region. */
export class KrBrnRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "kr";

  static readonly PATTERNS = [
    new Pattern("BRN (Weak)", "(?<!\\d)\\d{3}-\\d{2}-\\d{5}(?!\\d)", 0.1),
    new Pattern("BRN (Very weak)", "(?<!\\d)\\d{10}(?!\\d)", 0.05),
  ];

  static readonly CONTEXT = [
    "사업자등록번호",
    "사업자번호",
    "사업자",
    "BRN",
    "Business Registration Number",
    "Korean BRN",
    "business number",
    "tax registration number",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "KR_BRN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? KrBrnRecognizer.PATTERNS,
      undefined,
      context ?? KrBrnRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    const value = patternText.replace(/-/g, "");
    if (!/^\d{10}$/.test(value)) return false;
    const digits = [...value].map(Number);
    const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
    let total = weights
      .slice(0, 8)
      .reduce((sum, weight, index) => sum + digits[index] * weight, 0);
    const last = digits[8] * weights[8];
    total += Math.floor(last / 10) + last;
    return (10 - (total % 10)) % 10 === digits[9];
  }
}
