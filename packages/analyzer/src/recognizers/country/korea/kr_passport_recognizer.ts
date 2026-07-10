import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** KR_PASSPORT recognizer for KR region. */
export class KrPassportRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "kr";

  static readonly PATTERNS = [
    new Pattern(
      "Passport Number (Current)",
      "(?<![A-Z0-9a-z])[MmSsRrOoDd]\\d{3}[A-Za-z]\\d{4}(?![0-9])",
      0.1,
    ),
    new Pattern(
      "Passport Number (Previous)",
      "(?<![A-Z0-9a-z])[MmSsRrOoDd]\\d{8}(?![0-9])",
      0.05,
    ),
  ];

  static readonly CONTEXT = [
    "Korean passport",
    "Korean passport number",
    "대한민국 여권",
    "여권",
    "passport",
    "passport number",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "KR_PASSPORT",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? KrPassportRecognizer.PATTERNS,
      undefined,
      context ?? KrPassportRecognizer.CONTEXT,
    );
  }
}
