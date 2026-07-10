import { Pattern, PatternRecognizer } from "@presidio/core";

/** DE_HANDELSREGISTER recognizer for DE region. */
export class DeHandelsregisterRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["handelsregister", "handelsregisternummer", "amtsgericht", "registergericht", "hra", "hrb", "hr-nummer", "registerauszug", "handelsregistereintrag", "firma", "gesellschaft", "gmbh", "ag", "ug", "kg", "ohg", "einzelkaufmann", "einzelkauffrau", "handelsregisterblattnummer"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "DE_HANDELSREGISTER",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? DeHandelsregisterRecognizer.PATTERNS,
      undefined,
      context ?? DeHandelsregisterRecognizer.CONTEXT,
    );
  }

}
