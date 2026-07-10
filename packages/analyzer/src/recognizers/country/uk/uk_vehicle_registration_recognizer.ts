import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** UK_VEHICLE_REGISTRATION recognizer for UK region. */
export class UkVehicleRegistrationRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "uk";

  static readonly PATTERNS = [
    new Pattern(
      "UK Vehicle Registration (current)",
      "\\b[A-HJ-PR-Y][A-HJ-PR-Y](?:0[1-9]|[1-7][0-9])[- ]?[A-HJ-PR-Z]{3}\\b",
      0.3,
    ),
    new Pattern(
      "UK Vehicle Registration (prefix)",
      "\\b[A-HJ-NPR-TV-Y]\\d{1,3}[- ]?[A-HJ-PR-Y][A-HJ-PR-Z]{2}\\b",
      0.2,
    ),
    new Pattern(
      "UK Vehicle Registration (suffix)",
      "\\b[A-HJ-PR-Z]{3}[- ]?\\d{1,3}[- ]?[A-HJ-NPR-TV-Y]\\b",
      0.15,
    ),
  ];

  static readonly CONTEXT = [
    "vehicle",
    "registration",
    "number plate",
    "licence plate",
    "license plate",
    "reg",
    "vrn",
    "dvla",
    "v5c",
    "logbook",
    "mot",
    "car",
    "insured vehicle",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "UK_VEHICLE_REGISTRATION",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? UkVehicleRegistrationRecognizer.PATTERNS,
      undefined,
      context ?? UkVehicleRegistrationRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean | null {
    const value = patternText.replace(/[ -]/g, "");
    if (
      value.length === 7 &&
      /^[A-Za-z]{2}/.test(value) &&
      /^\d{2}$/.test(value.slice(2, 4))
    ) {
      const age = Number(value.slice(2, 4));
      return (age >= 2 && age <= 29) || (age >= 51 && age <= 79);
    }
    return null;
  }
}
