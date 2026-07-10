import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** KR_FRN recognizer for KR region. */
export class KrFrnRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "kr";

  static readonly PATTERNS = [
    new Pattern(
      "FRN (Medium)",
      "(?<!\\d)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])(-?)[5-8]\\d{6}(?!\\d)",
      0.5,
    ),
  ];

  static readonly CONTEXT = [
    "외국인등록번호",
    "Korean FRN",
    "FRN",
    "Foreigner Registration Number",
    "Korean Foreigner Registration Number",
    "외국인번호",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "KR_FRN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? KrFrnRecognizer.PATTERNS,
      undefined,
      context ?? KrFrnRecognizer.CONTEXT,
    );
  }
}
