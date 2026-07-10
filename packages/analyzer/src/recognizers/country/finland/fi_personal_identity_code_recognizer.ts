import { Pattern, PatternRecognizer } from "@presidio/core";

/** FI_PERSONAL_IDENTITY_CODE recognizer for FI region. */
export class FiPersonalIdentityCodeRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "fi";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["hetu", "henkilötunnus", "personbeteckningen", "personal identity code"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "FI_PERSONAL_IDENTITY_CODE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? FiPersonalIdentityCodeRecognizer.PATTERNS,
      undefined,
      context ?? FiPersonalIdentityCodeRecognizer.CONTEXT,
    );
  }

}
