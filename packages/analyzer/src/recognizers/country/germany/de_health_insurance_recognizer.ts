import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** DE_HEALTH_INSURANCE recognizer for DE region. */
export class DeHealthInsuranceRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [
    new Pattern(
      "Krankenversicherungsnummer KVNR (letter + 9 digits)",
      "\\b[A-Z]\\d{9}\\b",
      0.3,
    ),
  ];

  static readonly CONTEXT = [
    "krankenversicherungsnummer",
    "krankenversichertennummer",
    "versichertennummer",
    "kvnr",
    "krankenkasse",
    "krankenversicherung",
    "gesundheitskarte",
    "egk",
    "elektronische gesundheitskarte",
    "gkv",
    "gesetzliche krankenversicherung",
    "krankenversicherungsausweis",
    "versichertenausweis",
    "versichertenkarte",
    "aok",
    "tkk",
    "barmer",
    "dak",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "DE_HEALTH_INSURANCE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? DeHealthInsuranceRecognizer.PATTERNS,
      undefined,
      context ?? DeHealthInsuranceRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    const value = patternText.toUpperCase().trim();
    if (!/^[A-Z]\d{9}$/.test(value)) return false;
    const effective =
      String(value.charCodeAt(0) - 64).padStart(2, "0") + value.slice(1, 9);
    const total = [...effective].reduce((sum, digit, index) => {
      const product = Number(digit) * (index % 2 === 0 ? 1 : 2);
      return sum + (product >= 10 ? Math.floor(product / 10) + (product % 10) : product);
    }, 0);
    return total % 10 === Number(value[9]);
  }
}
