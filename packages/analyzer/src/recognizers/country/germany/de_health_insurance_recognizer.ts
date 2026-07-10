import { Pattern, PatternRecognizer } from "@presidio/core";

/** DE_HEALTH_INSURANCE recognizer for DE region. */
export class DeHealthInsuranceRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["krankenversicherungsnummer", "krankenversichertennummer", "versichertennummer", "kvnr", "krankenkasse", "krankenversicherung", "gesundheitskarte", "egk", "elektronische gesundheitskarte", "gkv", "gesetzliche krankenversicherung", "krankenversicherungsausweis", "versichertenausweis", "versichertenkarte", "aok", "tkk", "barmer", "dak"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "DE_HEALTH_INSURANCE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? DeHealthInsuranceRecognizer.PATTERNS,
      undefined,
      context ?? DeHealthInsuranceRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the KVNR using the GKV-Spitzenverband checksum algorithm.
   */
}
