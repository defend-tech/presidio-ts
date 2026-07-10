import { Pattern, PatternRecognizer } from "@presidio/core";

/** UK_DRIVING_LICENCE recognizer for UK region. */
export class UkDrivingLicenceRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "uk";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["driving licence", "driving license", "driver's licence", "driver's license", "dvla", "dl number", "licence number", "license number"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "UK_DRIVING_LICENCE",
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
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the pattern logic for a UK driving licence number.
   */
}
