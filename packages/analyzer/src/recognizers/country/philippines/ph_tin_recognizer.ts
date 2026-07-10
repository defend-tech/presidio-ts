import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** PH_TIN recognizer for PH region. */
export class PhTinRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "ph";

  static readonly PATTERNS = [
    new Pattern("TIN (Low)", "\\b(\\d{3}-\\d{3}-\\d{3}(-\\d{3})?)\\b", 0.05),
    new Pattern("TIN (Very Low)", "\\b(\\d{9}|\\d{12})\\b", 0.01),
  ];

  static readonly CONTEXT = [
    "tin",
    "taxpayer identification number",
    "bir",
    "taxpayer id",
    "tax id",
    "rdo",
    "revenue district office",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "PH_TIN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? PhTinRecognizer.PATTERNS,
      undefined,
      context ?? PhTinRecognizer.CONTEXT,
    );
  }
  override invalidateResult(patternText: string): boolean {
    const value = patternText.replace(/[ -]/g, "");
    if (!/^\d{9}(?:\d{3})?$/.test(value)) return true;
    const weights = [9, 8, 7, 6, 5, 4, 3, 2];
    const total = weights.reduce(
      (sum, weight, index) => sum + Number(value[index]) * weight,
      0,
    );
    return total % 11 !== Number(value[8]);
  }
}
