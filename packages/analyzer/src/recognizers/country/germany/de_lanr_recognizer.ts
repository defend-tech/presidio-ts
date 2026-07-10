import { Pattern, PatternRecognizer } from "@presidio/core";

/** DE_LANR recognizer for DE region. */
export class DeLanrRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["arztnummer", "lanr", "lebenslange arztnummer", "arzt-nr", "arzt nr", "arzt-nummer", "vertragsarzt", "kassenarzt", "niedergelassener arzt", "kbv", "kassenärztliche vereinigung", "kv-nummer", "rezept", "verschreibung", "behandelnder arzt", "hausarzt", "facharzt"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "DE_LANR",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? DeLanrRecognizer.PATTERNS,
      undefined,
      context ?? DeLanrRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the LANR using the KBV Arztnummern-Richtlinie checksum.
   */
}
