import { Pattern, PatternRecognizer } from "@presidio/core";

/** TR_LICENSE_PLATE recognizer for TR region. */
export class TrLicensePlateRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "tr";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["plaka", "araç plakası", "plaka numarası", "kayıt plakası", "tr plaka", "license plate", "number plate", "plate", "taşıt plakası", "kayıt"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "TR_LICENSE_PLATE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? TrLicensePlateRecognizer.PATTERNS,
      undefined,
      context ?? TrLicensePlateRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the matched pattern by checking province code is 01-81.
   */
}
