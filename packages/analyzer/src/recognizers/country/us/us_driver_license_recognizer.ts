import { Pattern, PatternRecognizer } from "@presidio/core";

/** US_DRIVER_LICENSE recognizer for US region. */
export class UsLicenseRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "us";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["driver", "license", "permit", "lic", "identification", "dls", "cdls", "lic#", "driving"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "US_DRIVER_LICENSE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? UsLicenseRecognizer.PATTERNS,
      undefined,
      context ?? UsLicenseRecognizer.CONTEXT,
    );
  }

}
