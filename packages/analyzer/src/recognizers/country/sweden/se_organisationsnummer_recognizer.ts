import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** SE_ORGANISATIONSNUMMER recognizer for SE region. */
export class SeOrganisationsnummerRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "se";

  static readonly PATTERNS = [
    new Pattern("Swedish Organisationsnummer (Medium)", "\\b\\d{6}[-]?\\d{4}\\b", 0.6),
    new Pattern("Swedish Organisationsnummer (Weak)", "\\d{6}[-]?\\d{4}", 0.2),
  ];

  static readonly CONTEXT = ["organisationsnummer", "orgnr", "org nr", "företagsnummer"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "SE_ORGANISATIONSNUMMER",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? SeOrganisationsnummerRecognizer.PATTERNS,
      undefined,
      context ?? SeOrganisationsnummerRecognizer.CONTEXT,
    );
  }
}
