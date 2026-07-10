import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** UK_NHS recognizer for UK region. */
export class NhsRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "uk";

  static readonly PATTERNS = [
    new Pattern("NHS (medium)", "\\b([0-9]{3})[- ]?([0-9]{3})[- ]?([0-9]{4})\\b", 0.5),
  ];

  static readonly CONTEXT = [
    "national health service",
    "nhs",
    "health services authority",
    "health authority",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "UK_NHS",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? NhsRecognizer.PATTERNS,
      undefined,
      context ?? NhsRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    const value = patternText.replace(/[ -]/g, "");
    if (!/^\d{10}$/.test(value)) return false;
    return (
      [...value].reduce((sum, digit, index) => sum + Number(digit) * (10 - index), 0) %
        11 ===
      0
    );
  }
}
