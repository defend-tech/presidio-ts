import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** UK_NINO recognizer for UK region. */
export class UkNinoRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "uk";

  static readonly PATTERNS = [
    new Pattern(
      "NINO (medium)",
      "\\b(?!bg|gb|nk|kn|nt|tn|zz|BG|GB|NK|KN|NT|TN|ZZ) ?([a-ceghj-pr-tw-zA-CEGHJ-PR-TW-Z]{1}[a-ceghj-npr-tw-zA-CEGHJ-NPR-TW-Z]{1}) ?([0-9]{2}) ?([0-9]{2}) ?([0-9]{2}) ?([a-dA-D]{1})\\b",
      0.5,
    ),
  ];

  static readonly CONTEXT = ["national insurance", "ni number", "nino"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "UK_NINO",
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
