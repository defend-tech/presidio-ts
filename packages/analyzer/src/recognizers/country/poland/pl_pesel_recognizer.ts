import { Pattern, PatternRecognizer } from "@presidio/core";

/** PL_PESEL recognizer for PL region. */
export class PlPeselRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "pl";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["PESEL"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "PL_PESEL",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? PlPeselRecognizer.PATTERNS,
      undefined,
      context ?? PlPeselRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  if len(pattern_text) != 11 or not pattern_text.isdigit():
  return False
   */
}
