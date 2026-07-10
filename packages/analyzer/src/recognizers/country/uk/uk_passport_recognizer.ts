import { Pattern, PatternRecognizer } from "@presidio/core";

/** UK_PASSPORT recognizer for UK region. */
export class UkPassportRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "uk";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["passport", "passport number", "travel document", "uk passport", "british passport", "her majesty", "his majesty", "hm passport", "hmpo"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "UK_PASSPORT",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? UkPassportRecognizer.PATTERNS,
      undefined,
      context ?? UkPassportRecognizer.CONTEXT,
    );
  }

}
