import { Pattern, PatternRecognizer } from "@presidio/core";

/** DE_PASSPORT recognizer for DE region. */
export class DePassportRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["reisepass", "pass", "passnummer", "reisepassnummer", "passport", "passport number", "pass-nr", "dokumentennummer", "bundesrepublik deutschland", "ausweisdokument", "mrz"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "DE_PASSPORT",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? DePassportRecognizer.PATTERNS,
      undefined,
      context ?? DePassportRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the ICAO Doc 9303 check digit at position 9.
   */
}
