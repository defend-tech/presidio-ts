import { Pattern, PatternRecognizer } from "@presidio/core";

/** KR_BRN recognizer for KR region. */
export class KrBrnRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "kr";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["사업자등록번호", "사업자번호", "사업자", "BRN", "Business Registration Number", "Korean BRN", "business number", "tax registration number"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "KR_BRN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? KrBrnRecognizer.PATTERNS,
      undefined,
      context ?? KrBrnRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the pattern logic by running a checksum on a detected BRN.
   */
}
