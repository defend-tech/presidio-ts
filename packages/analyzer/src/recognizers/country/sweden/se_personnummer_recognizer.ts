import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** SE_PERSONNUMMER recognizer for SE region. */
export class SePersonnummerRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "se";

  static readonly PATTERNS = [
    new Pattern("Swedish Personnummer (Medium)", "\\b(\\d{6,8})([-+]?)\\d{4}\\b", 0.5),
    new Pattern("Swedish Personnummer (Very Weak)", "(\\d{6,8})([-+]?)\\d{4}", 0.1),
  ];

  static readonly CONTEXT = [
    "personnummer",
    "svenskt personnummer",
    "svensk id",
    "ssn",
    "personal identity number",
    "samordningsnummer",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "SE_PERSONNUMMER",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? SePersonnummerRecognizer.PATTERNS,
      undefined,
      context ?? SePersonnummerRecognizer.CONTEXT,
    );
  }
}
