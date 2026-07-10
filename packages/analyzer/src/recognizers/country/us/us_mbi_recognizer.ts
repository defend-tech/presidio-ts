import { Pattern, PatternRecognizer } from "@presidio/core";

/** US_MBI recognizer for US region. */
export class UsMbiRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "us";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["medicare", "mbi", "beneficiary", "cms", "medicaid", "hic", "hicn"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "US_MBI",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? UsMbiRecognizer.PATTERNS,
      undefined,
      context ?? UsMbiRecognizer.CONTEXT,
    );
  }

}
