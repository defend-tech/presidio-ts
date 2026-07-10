import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** US_MBI recognizer for US region. */
export class UsMbiRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "us";

  static readonly PATTERNS = [
    new Pattern(
      "MBI (weak)",
      "\\b[0-9][ACDEFGHJKMNPQRTUVWXY][0-9ACDEFGHJKMNPQRTUVWXY][0-9][ACDEFGHJKMNPQRTUVWXY][0-9ACDEFGHJKMNPQRTUVWXY][0-9][ACDEFGHJKMNPQRTUVWXY][ACDEFGHJKMNPQRTUVWXY][0-9][0-9]\\b",
      0.3,
    ),
    new Pattern(
      "MBI (medium)",
      "\\b[0-9][ACDEFGHJKMNPQRTUVWXY][0-9ACDEFGHJKMNPQRTUVWXY][0-9]-[ACDEFGHJKMNPQRTUVWXY][0-9ACDEFGHJKMNPQRTUVWXY][0-9]-[ACDEFGHJKMNPQRTUVWXY][ACDEFGHJKMNPQRTUVWXY][0-9][0-9]\\b",
      0.5,
    ),
  ];

  static readonly CONTEXT = [
    "medicare",
    "mbi",
    "beneficiary",
    "cms",
    "medicaid",
    "hic",
    "hicn",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "US_MBI",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? UsMbiRecognizer.PATTERNS,
      undefined,
      context ?? UsMbiRecognizer.CONTEXT,
    );
  }
}
