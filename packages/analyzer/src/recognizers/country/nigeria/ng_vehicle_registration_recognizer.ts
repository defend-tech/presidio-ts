import { Pattern, PatternRecognizer } from "@presidio/core";

/** NG_VEHICLE_REGISTRATION recognizer for NG region. */
export class NgVehicleRegistrationRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "ng";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["plate number", "vehicle registration", "license plate", "number plate", "plate", "vehicle", "registration"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "NG_VEHICLE_REGISTRATION",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? NgVehicleRegistrationRecognizer.PATTERNS,
      undefined,
      context ?? NgVehicleRegistrationRecognizer.CONTEXT,
    );
  }

}
