import { Pattern, PatternRecognizer } from "@presidio/core";

/** KR_RRN recognizer for KR region. */
export class KrRrnRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "kr";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["Korean RRN", "Korean Resident Registration Number", "Resident Registration Number", "RRN", "rrn", "rrn#"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "KR_RRN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? KrRrnRecognizer.PATTERNS,
      undefined,
      context ?? KrRrnRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the pattern logic e.g., by running checksum on a detected pattern.
   */
}
