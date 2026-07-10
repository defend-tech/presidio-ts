import { Pattern, PatternRecognizer } from "@presidio/core";

/** DE_PLZ recognizer for DE region. */
export class DePlzRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["plz", "postleitzahl", "postanschrift", "adresse", "wohnort", "ort", "wohnanschrift", "lieferadresse", "rechnungsadresse", "straße", "strasse", "hausnummer", "postfach", "bundesland", "gemeinde", "stadt", "dorf"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "DE_PLZ",
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
