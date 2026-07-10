import { Pattern, PatternRecognizer } from "@presidio/core";

/** ABA_ROUTING_NUMBER recognizer for US region. */
export class AbaRoutingRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "us";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["aba", "routing", "abarouting", "association", "bankrouting"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "ABA_ROUTING_NUMBER",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? AbaRoutingRecognizer.PATTERNS,
      undefined,
      context ?? AbaRoutingRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  sanitized_value = EntityRecognizer.sanitize_value(
  pattern_text, self.replacement_pairs
  )
  return self.__checksum(sanitized_value)
   */
}
