import { Pattern, PatternRecognizer } from "@presidio/core";

/** ES_NIF recognizer for ES region. */
export class EsNifRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "es";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["documento nacional de identidad", "DNI", "NIF", "identificación"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "ES_NIF",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? EsNifRecognizer.PATTERNS,
      undefined,
      context ?? EsNifRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  pattern_text = EntityRecognizer.sanitize_value(
  pattern_text, self.replacement_pairs
  ).upper()
  letter = pattern_text[-1]
  number = int("".join(filter(str.isdigit, pattern_text)))
  letters = "TRWAGMYFPDXBNJZSQVHLCKE"
  return letter == letters[number % 23]
   */
}
