import { Pattern, PatternRecognizer } from "@presidio/core";

/** US_NPI recognizer for US region. */
export class UsNpiRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "us";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["npi", "national provider", "provider", "npi number", "provider id", "provider identifier", "taxonomy"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "US_NPI",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? UsNpiRecognizer.PATTERNS,
      undefined,
      context ?? UsNpiRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  sanitized_value = EntityRecognizer.sanitize_value(
  pattern_text, self.replacement_pairs
  )
  return self.__npi_luhn_checksum(sanitized_value)
   */
  /* invalidate_result:
  sanitized_value = EntityRecognizer.sanitize_value(
  pattern_text, self.replacement_pairs
  )
  # Reject degenerate patterns where all body digits are identical
  # (e.g., 1111111111 or 1111111112 where the last digit is a check digit).
  if sanitized_value:
  body = sanitized_value[:-1] if len(sanitized_value) > 1 else sanitized_value
  if body and len(set(body)) == 1:
  return True
  return False
   */
}
