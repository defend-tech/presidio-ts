import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** DE_SOCIAL_SECURITY recognizer for DE region. */
export class DeSocialSecurityRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [
    new Pattern(
      "Rentenversicherungsnummer (Strict, with birth date structure)",
      "\\b\\d{2}(0[1-9]|[12]\\d|3[01]|5[1-9]|[67]\\d|8[01])(0[1-9]|1[0-2])\\d{2}[A-Z]\\d{2}[0-9]\\b",
      0.5,
    ),
    new Pattern("Rentenversicherungsnummer (Relaxed)", "\\b\\d{8}[A-Z]\\d{3}\\b", 0.3),
  ];

  static readonly CONTEXT = [
    "rentenversicherungsnummer",
    "sozialversicherungsnummer",
    "versicherungsnummer",
    "rvnr",
    "svnr",
    "sv-nummer",
    "rente",
    "rentenversicherung",
    "deutsche rentenversicherung",
    "drv",
    "sozialversicherung",
    "sozialversicherungsausweis",
    "rentenausweis",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "DE_SOCIAL_SECURITY",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? DeSocialSecurityRecognizer.PATTERNS,
      undefined,
      context ?? DeSocialSecurityRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    const value = patternText.toUpperCase().trim();
    if (!/^\d{8}[A-Z]\d{3}$/.test(value)) return false;
    const day = Number(value.slice(2, 4));
    const month = Number(value.slice(4, 6));
    if (!((day >= 1 && day <= 31) || (day >= 51 && day <= 81)) || month < 1 || month > 12)
      return false;
    const effective =
      value.slice(0, 8) +
      String(value.charCodeAt(8) - 64).padStart(2, "0") +
      value.slice(9, 11);
    const weights = [2, 1, 2, 5, 7, 1, 2, 1, 2, 1, 2, 1];
    const total = [...effective].reduce((sum, digit, index) => {
      const product = Number(digit) * weights[index];
      return sum + Math.floor(product / 10) + (product % 10);
    }, 0);
    return total % 10 === Number(value[11]);
  }
}
