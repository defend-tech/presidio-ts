import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** ZA_ID_NUMBER recognizer for ZA region. */
export class ZaIdNumberRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "za";

  static readonly PATTERNS = [
    new Pattern("South African ID Number", "\\b\\d{10}[0-2][89]\\d\\b", 0.2),
  ];

  static readonly CONTEXT = [
    "id",
    "identity",
    "identity number",
    "id number",
    "south african id",
    "rsa id",
    "smart id",
    "national id",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "ZA_ID_NUMBER",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? ZaIdNumberRecognizer.PATTERNS,
      undefined,
      context ?? ZaIdNumberRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    if (
      !/^\d{13}$/.test(patternText) ||
      !["0", "1"].includes(patternText[10]) ||
      !["8", "9"].includes(patternText[11])
    )
      return false;
    const yy = Number(patternText.slice(0, 2));
    const month = Number(patternText.slice(2, 4));
    const day = Number(patternText.slice(4, 6));
    const year = yy > new Date().getFullYear() % 100 ? 1900 + yy : 2000 + yy;
    const birth = new Date(year, month - 1, day);
    if (
      birth.getFullYear() !== year ||
      birth.getMonth() !== month - 1 ||
      birth.getDate() !== day ||
      birth > new Date()
    )
      return false;
    let sum = 0;
    [...patternText].forEach((char, index) => {
      let digit = Number(char);
      if (index % 2 === 1) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
    });
    return sum % 10 === 0;
  }
}
