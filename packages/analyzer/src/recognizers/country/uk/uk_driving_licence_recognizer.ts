import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** UK_DRIVING_LICENCE recognizer for UK region. */
export class UkDrivingLicenceRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "uk";

  static readonly PATTERNS = [
    new Pattern(
      "UK Driving Licence",
      "\\b[A-Z9]{5}[0-9](?:0[1-9]|1[0-2]|5[1-9]|6[0-2])(?:0[1-9]|[12][0-9]|3[01])[0-9][A-Z9]{2}[A-Z0-9][A-Z]{2}\\b",
      0.5,
    ),
  ];

  static readonly CONTEXT = [
    "driving licence",
    "driving license",
    "driver's licence",
    "driver's license",
    "dvla",
    "dl number",
    "licence number",
    "license number",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "UK_DRIVING_LICENCE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? UkDrivingLicenceRecognizer.PATTERNS,
      undefined,
      context ?? UkDrivingLicenceRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean | null {
    const surname = patternText.toUpperCase().slice(0, 5);
    if (surname === "99999" || !/^[A-Z]+9*$/.test(surname)) return false;
    return null;
  }
}
