import { Pattern, PatternRecognizer } from "@presidio/core";

/** IN_AADHAAR recognizer for IN region. */
export class InAadhaarRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "in";

  static readonly PATTERNS = [
        new Pattern("AADHAR (Very Weak)", "\\b[0-9]{4}[- :][0-9]{4}[- :][0-9]{4}\\b", 0.01)
  ];

  static readonly CONTEXT = ["aadhaar", "uidai"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "IN_AADHAAR",
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
  // FIXME: Manual port required — Python source:
  /* validate_result:
  sanitized_value = EntityRecognizer.sanitize_value(
  pattern_text, self.replacement_pairs
  )
  return self.__check_aadhaar(sanitized_value)
   */
}
