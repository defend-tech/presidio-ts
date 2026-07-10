import { Pattern, PatternRecognizer } from "@presidio/core";

/** IN_PAN recognizer for IN region. */
export class InPanRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "in";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["permanent account number", "pan"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "IN_PAN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? InPanRecognizer.PATTERNS,
      undefined,
      context ?? InPanRecognizer.CONTEXT,
    );
  }

}
