import { Pattern, PatternRecognizer } from "@presidio/core";

/** IT_IDENTITY_CARD recognizer for IT region. */
export class ItIdentityCardRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "it";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["carta", "identità", "elettronica", "cie", "documento", "riconoscimento", "espatrio"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "IT_IDENTITY_CARD",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? ItIdentityCardRecognizer.PATTERNS,
      undefined,
      context ?? ItIdentityCardRecognizer.CONTEXT,
    );
  }

}
