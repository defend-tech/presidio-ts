import { Pattern, PatternRecognizer } from "@presidio/core";

/** AU_ACN recognizer for AU region. */
export class AuAcnRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "au";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["australian company number", "acn"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "AU_ACN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? AuAcnRecognizer.PATTERNS,
      undefined,
      context ?? AuAcnRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the pattern logic e.g., by running checksum on a detected pattern.
   */
}
