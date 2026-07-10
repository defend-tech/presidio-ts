import { Pattern, PatternRecognizer } from "@presidio/core";

/** DE_BSNR recognizer for DE region. */
export class DeBsnrRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["betriebsstättennummer", "betriebsstätten-nummer", "bsnr", "betriebsstätte", "praxisnummer", "arztpraxis", "praxis", "kassenärztliche vereinigung", "kv-nummer", "kv nummer", "praxisadresse", "praxisstandort", "nebenbetriebsstätte", "hauptbetriebsstätte", "behandlungsort", "vertragsarztpraxis"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "DE_BSNR",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? DeBsnrRecognizer.PATTERNS,
      undefined,
      context ?? DeBsnrRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  r"""
  Validate the BSNR structurally.
   */
}
