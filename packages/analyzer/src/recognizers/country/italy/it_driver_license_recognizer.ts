import { Pattern, PatternRecognizer } from "@presidio/core";

/** IT_DRIVER_LICENSE recognizer for IT region. */
export class ItDriverLicenseRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "it";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["patente", "patente di guida", "licenza", "licenza di guida"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "IT_DRIVER_LICENSE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? ItDriverLicenseRecognizer.PATTERNS,
      undefined,
      context ?? ItDriverLicenseRecognizer.CONTEXT,
    );
  }

}
