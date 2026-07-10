import { Pattern, PatternRecognizer } from "@presidio/core";

/** KR_PASSPORT recognizer for KR region. */
export class KrPassportRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "kr";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["Korean passport", "Korean passport number", "대한민국 여권", "여권", "passport", "passport number"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "KR_PASSPORT",
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
