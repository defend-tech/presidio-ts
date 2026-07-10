import { Pattern, PatternRecognizer } from "@presidio/core";

/** ZA_ID_NUMBER recognizer for ZA region. */
export class ZaIdNumberRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "za";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["id", "identity", "identity number", "id number", "south african id", "rsa id", "smart id", "national id"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "ZA_ID_NUMBER",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? ZaIdNumberRecognizer.PATTERNS,
      undefined,
      context ?? ZaIdNumberRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  if len(pattern_text) != self.ID_LENGTH or not pattern_text.isdigit():
  return False
   */
}
