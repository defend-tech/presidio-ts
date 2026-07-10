import { Pattern, PatternRecognizer } from "@presidio/core";

/** SE_ORGANISATIONSNUMMER recognizer for SE region. */
export class SeOrganisationsnummerRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "se";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["organisationsnummer", "orgnr", "org nr", "företagsnummer"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "SE_ORGANISATIONSNUMMER",
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
