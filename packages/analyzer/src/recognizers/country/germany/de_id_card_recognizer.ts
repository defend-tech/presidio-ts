import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** DE_ID_CARD recognizer for DE region. */
export class DeIdCardRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [
    new Pattern(
      "Personalausweisnummer nPA (ICAO charset + check digit)",
      "\\b[CFGHJKLMNPRTVWXYZ][CFGHJKLMNPRTVWXYZ0-9]{7}[0-9]\\b",
      0.4,
    ),
    new Pattern("Personalausweisnummer alt (T + 8 Ziffern)", "\\bT\\d{8}\\b", 0.5),
  ];

  static readonly CONTEXT = [
    "personalausweis",
    "ausweis",
    "personalausweisnummer",
    "ausweisnummer",
    "ausweisdokument",
    "dokumentennummer",
    "seriennummer",
    "npa",
    "neuer personalausweis",
    "personalausweisgesetz",
    "pauwsg",
    "bundespersonalausweis",
    "identity card",
    "national id",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "DE_ID_CARD",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? DeIdCardRecognizer.PATTERNS,
      undefined,
      context ?? DeIdCardRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean | null {
    const value = patternText.toUpperCase().trim();
    if (value.length !== 9) return false;
    if (value[0] === "T" && /^\d{8}$/.test(value.slice(1))) return null;
    if (!/^.[0-9]$/.test(value)) return false;
    const weights = [7, 3, 1];
    let total = 0;
    for (let index = 0; index < 8; index++) {
      const char = value[index];
      const numeric = /^\d$/.test(char)
        ? Number(char)
        : /^[A-Z]$/.test(char)
          ? char.charCodeAt(0) - 55
          : Number.NaN;
      if (Number.isNaN(numeric)) return false;
      total += numeric * weights[index % 3];
    }
    return total % 10 === Number(value[8]);
  }
}
