import { Pattern, PatternRecognizer } from "@presidio/core";

/** SG_UEN recognizer for SG region. */
export class SgUenRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "sg";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["uen", "unique entity number", "business registration", "ACRA"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "SG_UEN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? SgUenRecognizer.PATTERNS,
      undefined,
      context ?? SgUenRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the pattern logic e.g., by running checksum on a detected pattern.
   */
}
