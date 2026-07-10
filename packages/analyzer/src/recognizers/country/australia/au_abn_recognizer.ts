import { Pattern, PatternRecognizer } from "@presidio/core";

/** AU_ABN recognizer for AU region. */
export class AuAbnRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "au";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["australian business number", "abn"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "AU_ABN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? AuAbnRecognizer.PATTERNS,
      undefined,
      context ?? AuAbnRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the pattern logic e.g., by running checksum on a detected pattern.
   */
}
