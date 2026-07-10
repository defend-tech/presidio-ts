import { Pattern, PatternRecognizer } from "@presidio/core";

/** MEDICAL_LICENSE recognizer for US region. */
export class MedicalLicenseRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "us";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["medical", "certificate", "DEA"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "MEDICAL_LICENSE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? MedicalLicenseRecognizer.PATTERNS,
      undefined,
      context ?? MedicalLicenseRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  sanitized_value = EntityRecognizer.sanitize_value(
  pattern_text, self.replacement_pairs
  )
  checksum = self.__luhn_checksum(sanitized_value)
   */
}
