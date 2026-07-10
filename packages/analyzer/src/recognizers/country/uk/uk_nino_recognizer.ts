import { Pattern, PatternRecognizer } from "@presidio/core";

/** UK_NINO recognizer for UK region. */
export class UkNinoRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "uk";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["national insurance", "ni number", "nino"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "UK_NINO",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? UkNinoRecognizer.PATTERNS,
      undefined,
      context ?? UkNinoRecognizer.CONTEXT,
    );
  }

}
