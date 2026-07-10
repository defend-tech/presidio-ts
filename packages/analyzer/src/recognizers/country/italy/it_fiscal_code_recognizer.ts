import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** IT_FISCAL_CODE recognizer for IT region. */
export class ItFiscalCodeRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "it";

  static readonly PATTERNS = [
    new Pattern(
      "Fiscal Code",
      "(?i)((?:[A-Z][AEIOU][AEIOUX]|[AEIOU]X{2}|[B-DF-HJ-NP-TV-Z]{2}[A-Z]){2}(?:[\\dLMNP-V]{2}(?:[A-EHLMPR-T](?:[04LQ][1-9MNP-V]|[15MR][\\dLMNP-V]|[26NS][0-8LMNP-U])|[DHPS][37PT][0L]|[ACELMRT][37PT][01LM]|[AC-EHLMPR-T][26NS][9V])|(?:[02468LNQSU][048LQU]|[13579MPRTV][26NS])B[26NS][9V])(?:[A-MZ][1-9MNP-V][\\dLMNP-V]{2}|[A-M][0L](?:[1-9MNP-V][\\dLMNP-V]|[0L][1-9MNP-V]))[A-Z])",
      0.3,
    ),
  ];

  static readonly CONTEXT = ["codice fiscale", "cf"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "IT_FISCAL_CODE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? ItFiscalCodeRecognizer.PATTERNS,
      undefined,
      context ?? ItFiscalCodeRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean | null {
    const value = patternText.toUpperCase();
    if (!/^[A-Z0-9]{16}$/.test(value)) return null;
    const odd = {
      0: 1,
      1: 0,
      2: 5,
      3: 7,
      4: 9,
      5: 13,
      6: 15,
      7: 17,
      8: 19,
      9: 21,
      A: 1,
      B: 0,
      C: 5,
      D: 7,
      E: 9,
      F: 13,
      G: 15,
      H: 17,
      I: 19,
      J: 21,
      K: 2,
      L: 4,
      M: 18,
      N: 20,
      O: 11,
      P: 3,
      Q: 6,
      R: 8,
      S: 12,
      T: 14,
      U: 16,
      V: 10,
      W: 22,
      X: 25,
      Y: 24,
      Z: 23,
    } as Record<string, number>;
    const even = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const total = [...value.slice(0, 15)].reduce(
      (sum, char, index) =>
        sum +
        (index % 2 === 0
          ? odd[char]
          : even.indexOf(char) < 10
            ? even.indexOf(char)
            : even.indexOf(char) - 10),
      0,
    );
    return String.fromCharCode(65 + (total % 26)) === value[15] ? true : null;
  }
}
