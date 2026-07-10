import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** SG_NRIC_FIN recognizer for SG region. */
export class SgFinRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "sg";

  static readonly PATTERNS = [
    new Pattern("Nric (weak)", "(?i)(\\b[A-Z][0-9]{7}[A-Z]\\b)", 0.3),
    new Pattern("Nric (medium)", "(?i)(\\b[STFGM][0-9]{7}[A-Z]\\b)", 0.5),
  ];

  static readonly CONTEXT = ["fin", "fin#", "nric", "nric#"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "SG_NRIC_FIN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? SgFinRecognizer.PATTERNS,
      undefined,
      context ?? SgFinRecognizer.CONTEXT,
    );
  }
}
