import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** NG_NIN recognizer for NG region. */
export class NgNinRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "ng";

  static readonly PATTERNS = [new Pattern("NIN (Very Weak)", "\\b\\d{11}\\b", 0.01)];

  static readonly CONTEXT = [
    "nin",
    "national identification number",
    "national identity number",
    "nimc",
    "national identity",
    "nigeria id",
    "nigerian identification",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "NG_NIN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? NgNinRecognizer.PATTERNS,
      undefined,
      context ?? NgNinRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    return /^\d{11}$/.test(patternText) && this.isVerhoeff(patternText);
  }

  private isVerhoeff(value: string): boolean {
    const d = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 0, 3, 4, 2, 5, 6, 7, 8, 9],
      [2, 3, 0, 1, 4, 5, 6, 7, 8, 9],
      [3, 4, 1, 0, 2, 5, 6, 7, 8, 9],
      [4, 0, 2, 3, 1, 5, 6, 7, 8, 9],
      [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
      [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
      [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
      [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
      [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
    ];
    const p = [
      [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
      [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
      [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
      [8, 9, 1, 6, 0, 4, 3, 5, 7, 2],
      [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
      [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
      [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
      [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
    ];
    const inv = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];
    let c = 0;
    [...value].reverse().forEach((digit, index) => {
      c = d[c][p[index % 8][Number(digit)]];
    });
    return inv[c] === 0;
  }
}
