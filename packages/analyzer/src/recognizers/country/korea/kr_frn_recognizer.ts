import { Pattern, PatternRecognizer } from "@presidio/core";

/** KR_FRN recognizer for KR region. */
export class KrFrnRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "kr";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["외국인등록번호", "Korean FRN", "FRN", "Foreigner Registration Number", "Korean Foreigner Registration Number", "외국인번호"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "KR_FRN",
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
