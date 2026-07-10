import { Pattern, PatternRecognizer } from "@presidio/core";

/** UK_POSTCODE recognizer for UK region. */
export class UkPostcodeRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "uk";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["postcode", "post code", "postal code", "zip", "address", "delivery", "mailing", "shipping", "correspondence"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "UK_POSTCODE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? UkPostcodeRecognizer.PATTERNS,
      undefined,
      context ?? UkPostcodeRecognizer.CONTEXT,
    );
  }

}
