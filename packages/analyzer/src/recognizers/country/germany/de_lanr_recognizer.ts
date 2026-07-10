import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** DE_LANR recognizer for DE region. */
export class DeLanrRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [
    new Pattern("Lebenslange Arztnummer LANR (9 digits)", "\\b\\d{9}\\b", 0.3),
  ];

  static readonly CONTEXT = [
    "arztnummer",
    "lanr",
    "lebenslange arztnummer",
    "arzt-nr",
    "arzt nr",
    "arzt-nummer",
    "vertragsarzt",
    "kassenarzt",
    "niedergelassener arzt",
    "kbv",
    "kassenärztliche vereinigung",
    "kv-nummer",
    "rezept",
    "verschreibung",
    "behandelnder arzt",
    "hausarzt",
    "facharzt",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "DE_LANR",
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
  override validateResult(patternText: string): boolean {
    const value = patternText.trim();
    if (!/^\d{9}$/.test(value)) return false;
    const weights = [4, 9, 4, 9, 4, 9];
    const total = weights.reduce(
      (sum, weight, index) => sum + Number(value[index]) * weight,
      0,
    );
    return Number(value[6]) === (10 - (total % 10)) % 10;
  }
}
