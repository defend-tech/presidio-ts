import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** IN_VOTER recognizer for IN region. */
export class InVoterRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "in";

  static readonly PATTERNS = [
    new Pattern(
      "VOTER",
      "\\b([A-Za-z]{1}[ABCDGHJKMNPRSYabcdghjkmnprsy]{1}[A-Za-z]{1}([0-9]){7})\\b",
      0.4,
    ),
    new Pattern("VOTER", "\\b([A-Za-z]){3}([0-9]){7}\\b", 0.3),
  ];

  static readonly CONTEXT = ["voter", "epic", "elector photo identity card"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "IN_VOTER",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? InVoterRecognizer.PATTERNS,
      undefined,
      context ?? InVoterRecognizer.CONTEXT,
    );
  }
}
