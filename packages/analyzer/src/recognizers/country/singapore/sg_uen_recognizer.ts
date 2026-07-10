import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** SG_UEN recognizer for SG region. */
export class SgUenRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "sg";

  static readonly PATTERNS = [
    new Pattern(
      "UEN (low)",
      "\\b\\d{8}[A-Z]\\b|\\b\\d{9}[A-Z]\\b|\\b[TSR]\\d{2}[A-Z]{2}\\d{4}[A-Z]\\b",
      0.3,
    ),
  ];

  static readonly CONTEXT = [
    "uen",
    "unique entity number",
    "business registration",
    "ACRA",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "SG_UEN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? SgUenRecognizer.PATTERNS,
      undefined,
      context ?? SgUenRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    const value = patternText.toUpperCase();
    if (/^\d{8}[A-Z]$/.test(value)) {
      const weights = [10, 4, 9, 3, 8, 2, 7, 1];
      const total = [...value.slice(0, 8)].reduce(
        (sum, digit, index) => sum + Number(digit) * weights[index],
        0,
      );
      return value[8] === "XMKECAWLJDB"[total % 11];
    }
    if (/^\d{9}[A-Z]$/.test(value)) {
      if (Number(value.slice(0, 4)) > new Date().getFullYear()) return false;
      const weights = [10, 8, 6, 4, 9, 7, 5, 3, 1];
      const total = [...value.slice(0, 9)].reduce(
        (sum, digit, index) => sum + Number(digit) * weights[index],
        0,
      );
      return value[9] === "ZKCMDNERGWH"[total % 11];
    }
    const types = new Set([
      "LP",
      "LL",
      "FC",
      "PF",
      "RF",
      "MQ",
      "MM",
      "NB",
      "CC",
      "CS",
      "MB",
      "FM",
      "GS",
      "DP",
      "CP",
      "NR",
      "CM",
      "CD",
      "MD",
      "HS",
      "VH",
      "CH",
      "MH",
      "CL",
      "XL",
      "CX",
      "HC",
      "RP",
      "TU",
      "TC",
      "FB",
      "FN",
      "PA",
      "PB",
      "SS",
      "MC",
      "SM",
      "GA",
      "GB",
    ]);
    if (!/^[TSR]\d{2}[A-Z]{2}\d{4}[A-Z]$/.test(value) || !types.has(value.slice(3, 5)))
      return false;
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWX0123456789";
    const weights = [4, 3, 5, 3, 10, 2, 2, 5, 7];
    const total = [...value.slice(0, 9)].reduce(
      (sum, char, index) => sum + alphabet.indexOf(char) * weights[index],
      0,
    );
    return value[9] === alphabet[(total - 5) % 11];
  }
}
