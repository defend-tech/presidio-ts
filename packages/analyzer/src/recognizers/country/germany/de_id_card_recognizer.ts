import { Pattern, PatternRecognizer } from "@presidio/core";

/** DE_ID_CARD recognizer for DE region. */
export class DeIdCardRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["personalausweis", "ausweis", "personalausweisnummer", "ausweisnummer", "ausweisdokument", "dokumentennummer", "seriennummer", "npa", "neuer personalausweis", "personalausweisgesetz", "pauwsg", "bundespersonalausweis", "identity card", "national id"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "DE_ID_CARD",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? DeIdCardRecognizer.PATTERNS,
      undefined,
      context ?? DeIdCardRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the nPA ICAO Doc 9303 check digit.
   */
}
