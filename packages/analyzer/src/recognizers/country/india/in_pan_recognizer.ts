import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** IN_PAN recognizer for IN region. */
export class InPanRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "in";

  static readonly PATTERNS = [
    new Pattern(
      "PAN (High)",
      "\\b([A-Za-z]{3}[AaBbCcFfGgHhJjLlPpTt]{1}[A-Za-z]{1}[0-9]{4}[A-Za-z]{1})\\b",
      0.5,
    ),
    new Pattern("PAN (Medium)", "\\b([A-Za-z]{5}[0-9]{4}[A-Za-z]{1})\\b", 0.1),
    new Pattern(
      "PAN (Low)",
      "\\b((?=.*?[a-zA-Z])(?=.*?[0-9]{4})[\\w@#$%^?~-]{10})\\b",
      0.01,
    ),
  ];

  static readonly CONTEXT = ["permanent account number", "pan"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "IN_PAN",
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
