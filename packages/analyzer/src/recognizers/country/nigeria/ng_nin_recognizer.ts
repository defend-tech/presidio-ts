import { Pattern, PatternRecognizer } from "@presidio/core";

/** NG_NIN recognizer for NG region. */
export class NgNinRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "ng";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["nin", "national identification number", "national identity number", "nimc", "national identity", "nigeria id", "nigerian identification"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "NG_NIN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? NgNinRecognizer.PATTERNS,
      undefined,
      context ?? NgNinRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  return self.__check_nin(pattern_text)
   */
}
