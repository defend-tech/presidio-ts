import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** DE_HANDELSREGISTER recognizer for DE region. */
export class DeHandelsregisterRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [
    new Pattern("Handelsregisternummer HRA/HRB", "\\bHR[AB]\\s*\\d{1,6}\\b", 0.5),
  ];

  static readonly CONTEXT = [
    "handelsregister",
    "handelsregisternummer",
    "amtsgericht",
    "registergericht",
    "hra",
    "hrb",
    "hr-nummer",
    "registerauszug",
    "handelsregistereintrag",
    "firma",
    "gesellschaft",
    "gmbh",
    "ag",
    "ug",
    "kg",
    "ohg",
    "einzelkaufmann",
    "einzelkauffrau",
    "handelsregisterblattnummer",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "DE_HANDELSREGISTER",
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
