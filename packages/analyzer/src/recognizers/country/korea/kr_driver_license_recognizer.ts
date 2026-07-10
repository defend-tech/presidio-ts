import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** KR_DRIVER_LICENSE recognizer for KR region. */
export class KrDriverLicenseRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "kr";

  static readonly PATTERNS = [
    new Pattern(
      "Driver License (very weak)",
      "(?<!\\d)(\\d{2})[- ]?(\\d{2})[- ]?(\\d{6})[- ]?(\\d{2})(?!\\d)",
      0.05,
    ),
  ];

  static readonly CONTEXT = [
    "운전면허",
    "운전면허번호",
    "면허번호",
    "Korean driver license",
    "Korean driver's license",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "KR_DRIVER_LICENSE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? KrDriverLicenseRecognizer.PATTERNS,
      undefined,
      context ?? KrDriverLicenseRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    const value = patternText.replace(/-/g, "");
    return (
      /^\d{12}$/.test(value) &&
      [
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
        "24",
        "25",
        "26",
        "28",
      ].includes(value.slice(0, 2))
    );
  }
}
