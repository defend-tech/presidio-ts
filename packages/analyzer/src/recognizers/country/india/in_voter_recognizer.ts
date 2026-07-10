import { Pattern, PatternRecognizer } from "@presidio/core";

/** IN_VOTER recognizer for IN region. */
export class InVoterRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "in";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["voter", "epic", "elector photo identity card"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "IN_VOTER",
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
