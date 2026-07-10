import { Pattern, PatternRecognizer } from "@presidio/core";

/** AU_TFN recognizer for AU region. */
export class AuTfnRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "au";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["tax file number", "tfn"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "AU_TFN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? AuTfnRecognizer.PATTERNS,
      undefined,
      context ?? AuTfnRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the pattern logic e.g., by running checksum on a detected pattern.
   */
}
