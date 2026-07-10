import { Pattern, PatternRecognizer } from "@presidio/core";

/** AU_MEDICARE recognizer for AU region. */
export class AuMedicareRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "au";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["medicare"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "AU_MEDICARE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? AuMedicareRecognizer.PATTERNS,
      undefined,
      context ?? AuMedicareRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the pattern logic e.g., by running checksum on a detected pattern.
   */
}
