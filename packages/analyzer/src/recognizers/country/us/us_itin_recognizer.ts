import { Pattern, PatternRecognizer } from "@presidio/core";

/** US_ITIN recognizer for US region. */
export class UsItinRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "us";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["individual", "taxpayer", "itin", "tax", "payer", "taxid", "tin"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "US_ITIN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? UsItinRecognizer.PATTERNS,
      undefined,
      context ?? UsItinRecognizer.CONTEXT,
    );
  }

}
