import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** DE_BSNR recognizer for DE region. */
export class DeBsnrRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [
    new Pattern("Betriebsst\u00e4ttennummer BSNR (9 digits)", "\\b\\d{9}\\b", 0.2),
  ];

  static readonly CONTEXT = [
    "betriebsstättennummer",
    "betriebsstätten-nummer",
    "bsnr",
    "betriebsstätte",
    "praxisnummer",
    "arztpraxis",
    "praxis",
    "kassenärztliche vereinigung",
    "kv-nummer",
    "kv nummer",
    "praxisadresse",
    "praxisstandort",
    "nebenbetriebsstätte",
    "hauptbetriebsstätte",
    "behandlungsort",
    "vertragsarztpraxis",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "DE_BSNR",
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
  override validateResult(patternText: string): boolean | null {
    const value = patternText.trim();
    if (!/^\d{9}$/.test(value) || value === "000000000") return false;
    return null;
  }
}
