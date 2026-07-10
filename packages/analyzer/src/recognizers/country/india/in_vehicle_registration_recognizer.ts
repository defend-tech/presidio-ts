import { Pattern, PatternRecognizer } from "@presidio/core";

/** IN_VEHICLE_REGISTRATION recognizer for IN region. */
export class InVehicleRegistrationRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "in";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["RTO", "vehicle", "plate", "registration"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "IN_VEHICLE_REGISTRATION",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? InVehicleRegistrationRecognizer.PATTERNS,
      undefined,
      context ?? InVehicleRegistrationRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  sanitized_value = EntityRecognizer.sanitize_value(
  pattern_text, self.replacement_pairs
  )
  return self.__check_vehicle_registration(sanitized_value)
   */
}
