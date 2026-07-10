import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** TR_LICENSE_PLATE recognizer for TR region. */
export class TrLicensePlateRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "tr";

  static readonly PATTERNS = [
    new Pattern(
      "TR License Plate (space)",
      "\\b(0[1-9]|[1-7][0-9]|8[0-1])\\s?[A-PR-VY-Z]{1,3}\\s?\\d{2,4}\\b",
      0.3,
    ),
    new Pattern(
      "TR License Plate (hyphen)",
      "\\b(0[1-9]|[1-7][0-9]|8[0-1])-[A-PR-VY-Z]{1,3}-\\d{2,4}\\b",
      0.3,
    ),
  ];

  static readonly CONTEXT = [
    "plaka",
    "araç plakası",
    "plaka numarası",
    "kayıt plakası",
    "tr plaka",
    "license plate",
    "number plate",
    "plate",
    "taşıt plakası",
    "kayıt",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "TR_LICENSE_PLATE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? TrLicensePlateRecognizer.PATTERNS,
      undefined,
      context ?? TrLicensePlateRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean | null {
    const value = patternText.replace(/[ -]/g, "");
    if (value.length >= 3 && /^\d{2}/.test(value)) {
      const code = Number(value.slice(0, 2));
      return code >= 1 && code <= 81;
    }
    return null;
  }
}
