import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** DE_PASSPORT recognizer for DE region. */
export class DePassportRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [
    new Pattern(
      "Reisepassnummer (Strict ICAO charset)",
      "\\b[CFGHJKLMNPRTVWXYZ][CFGHJKLMNPRTVWXYZ0-9]{7}[0-9]\\b",
      0.4,
    ),
  ];

  static readonly CONTEXT = [
    "reisepass",
    "pass",
    "passnummer",
    "reisepassnummer",
    "passport",
    "passport number",
    "pass-nr",
    "dokumentennummer",
    "bundesrepublik deutschland",
    "ausweisdokument",
    "mrz",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "DE_PASSPORT",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? DePassportRecognizer.PATTERNS,
      undefined,
      context ?? DePassportRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    const value = patternText.toUpperCase().trim();
    if (
      value.length !== 9 ||
      !/^\d$/.test(value[8]) ||
      /[ABDEIOQSU]/.test(value.slice(0, 8))
    )
      return false;
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
