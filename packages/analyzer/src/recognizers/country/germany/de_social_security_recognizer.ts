import { Pattern, PatternRecognizer } from "@presidio/core";

/** DE_SOCIAL_SECURITY recognizer for DE region. */
export class DeSocialSecurityRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["rentenversicherungsnummer", "sozialversicherungsnummer", "versicherungsnummer", "rvnr", "svnr", "sv-nummer", "rente", "rentenversicherung", "deutsche rentenversicherung", "drv", "sozialversicherung", "sozialversicherungsausweis", "rentenausweis"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "DE_SOCIAL_SECURITY",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? DeSocialSecurityRecognizer.PATTERNS,
      undefined,
      context ?? DeSocialSecurityRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the Rentenversicherungsnummer using the VKVV § 4 checksum.
   */
}
