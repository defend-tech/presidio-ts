import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** PL_PESEL recognizer for PL region. */
export class PlPeselRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "pl";

  static readonly PATTERNS = [
    new Pattern(
      "PESEL",
      "[0-9]{2}([02468][1-9]|[13579][012])(0[1-9]|1[0-9]|2[0-9]|3[01])[0-9]{5}",
      0.4,
    ),
  ];

  static readonly CONTEXT = ["PESEL"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "PL_PESEL",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? PlPeselRecognizer.PATTERNS,
      undefined,
      context ?? PlPeselRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    if (!/^\d{11}$/.test(patternText)) return false;
    const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
    const total = weights.reduce(
      (sum, weight, index) => sum + Number(patternText[index]) * weight,
      0,
    );
    return (10 - (total % 10)) % 10 === Number(patternText[10]);
  }
}
