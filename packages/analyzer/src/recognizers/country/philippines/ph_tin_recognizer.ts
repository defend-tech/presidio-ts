import { Pattern, PatternRecognizer } from "@presidio/core";

/** PH_TIN recognizer for UNKNOWN region. */
export class PhTinRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "unknown";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["tin", "taxpayer identification number", "bir", "taxpayer id", "tax id", "rdo", "revenue district office"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "PH_TIN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? PhTinRecognizer.PATTERNS,
      undefined,
      context ?? PhTinRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* invalidate_result:
  Check if the Philippines TIN fails weighted modulo 11 validation.
   */
}
