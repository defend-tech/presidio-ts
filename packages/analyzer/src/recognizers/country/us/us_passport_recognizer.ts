import { Pattern, PatternRecognizer } from "@presidio/core";

/** US_PASSPORT recognizer for US region. */
export class UsPassportRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "us";

  static readonly PATTERNS = [
        new Pattern("Passport (very weak)", "(\\b[0-9]{9}\\b)", 0.05),
        new Pattern("Passport Next Generation (very weak)", "(\\b[A-Z][0-9]{8}\\b)", 0.1)
  ];

  static readonly CONTEXT = ["us", "united", "states", "passport", "passport#", "travel", "document"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "US_PASSPORT",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? UsPassportRecognizer.PATTERNS,
      undefined,
      context ?? UsPassportRecognizer.CONTEXT,
    );
  }

}
