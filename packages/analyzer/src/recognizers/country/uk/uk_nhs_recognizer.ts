import { Pattern, PatternRecognizer } from "@presidio/core";

/** UK_NHS recognizer for UK region. */
export class NhsRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "uk";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["national health service", "nhs", "health services authority", "health authority"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "UK_NHS",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? NhsRecognizer.PATTERNS,
      undefined,
      context ?? NhsRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the pattern logic e.g., by running checksum on a detected pattern.
   */
}
