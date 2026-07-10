import { Pattern, PatternRecognizer } from "@presidio/core";

/** UK_VEHICLE_REGISTRATION recognizer for UK region. */
export class UkVehicleRegistrationRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "uk";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["vehicle", "registration", "number plate", "licence plate", "license plate", "reg", "vrn", "dvla", "v5c", "logbook", "mot", "car", "insured vehicle"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "UK_VEHICLE_REGISTRATION",
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
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the matched pattern.
   */
}
