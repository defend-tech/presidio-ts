import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** IN_AADHAAR recognizer for IN region. */
export class InAadhaarRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "in";

  static readonly PATTERNS = [
    new Pattern("AADHAAR (Very Weak)", "\\b[0-9]{12}\\b", 0.01),
    new Pattern("AADHAR (Very Weak)", "\\b[0-9]{4}[- :][0-9]{4}[- :][0-9]{4}\\b", 0.01),
  ];

  static readonly CONTEXT = ["aadhaar", "uidai"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "IN_AADHAAR",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? InAadhaarRecognizer.PATTERNS,
      undefined,
      context ?? InAadhaarRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    const value = patternText.replace(/[ -]/g, "");
    if (
      !/^\d{12}$/.test(value) ||
      Number(value[0]) < 2 ||
      value === [...value].reverse().join("")
    )
      return false;
    return this.isVerhoeff(value);
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
