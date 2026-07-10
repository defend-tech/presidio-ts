import { Pattern, PatternRecognizer } from "@presidio/core";

/** TR_NATIONAL_ID recognizer for TR region. */
export class TrNationalIdRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "tr";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["tc kimlik", "kimlik no", "kimlik numarası", "tckn", "tc no", "nüfus cüzdanı", "national id", "turkish id", "türk kimlik"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "TR_NATIONAL_ID",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? TrNationalIdRecognizer.PATTERNS,
      undefined,
      context ?? TrNationalIdRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the pattern logic by running checksum on a detected pattern.
   */
}
