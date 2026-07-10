import { Pattern, PatternRecognizer } from "@presidio/core";

/** TH_TNIN recognizer for TH region. */
export class ThTninRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "th";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["Thai National ID", "Thai ID Number", "TNIN", "เลขประจำตัวประชาชน", "เลขบัตรประชาชน", "รหัสปชช"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "TH_TNIN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? ThTninRecognizer.PATTERNS,
      undefined,
      context ?? ThTninRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the pattern logic e.g., by running checksum on a detected pattern.
   */
}
