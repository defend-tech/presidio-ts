import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** DE_PLZ recognizer for DE region. */
export class DePlzRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [
    new Pattern(
      "Postleitzahl (5 digits, very low base confidence \u2013 context required)",
      "\\b(?!01000\\b|99999\\b)(0[1-9]\\d{3}|[1-9]\\d{4})\\b",
      0.05,
    ),
  ];

  static readonly CONTEXT = [
    "plz",
    "postleitzahl",
    "postanschrift",
    "adresse",
    "wohnort",
    "ort",
    "wohnanschrift",
    "lieferadresse",
    "rechnungsadresse",
    "straße",
    "strasse",
    "hausnummer",
    "postfach",
    "bundesland",
    "gemeinde",
    "stadt",
    "dorf",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "DE_PLZ",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? DePlzRecognizer.PATTERNS,
      undefined,
      context ?? DePlzRecognizer.CONTEXT,
    );
  }
}
