import { Pattern, PatternRecognizer } from "@presidio/core";

/** KR_DRIVER_LICENSE recognizer for KR region. */
export class KrDriverLicenseRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "kr";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["운전면허", "운전면허번호", "면허번호", "Korean driver license", "Korean driver's license"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "KR_DRIVER_LICENSE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? KrDriverLicenseRecognizer.PATTERNS,
      undefined,
      context ?? KrDriverLicenseRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate length, region code.
   */
}
