import { Pattern, PatternRecognizer } from "@presidio/core";

/** IN_PASSPORT recognizer for IN region. */
export class InPassportRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "in";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["passport", "indian passport", "passport number"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "IN_PASSPORT",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? InPassportRecognizer.PATTERNS,
      undefined,
      context ?? InPassportRecognizer.CONTEXT,
    );
  }

}
