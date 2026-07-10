import { Pattern, PatternRecognizer } from "@presidio/core";

/** IN_GSTIN recognizer for IN region. */
export class InGstinRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "in";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["gstin", "gst", "goods and services tax", "tax identification", "gst number", "gst registration"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "IN_GSTIN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? InGstinRecognizer.PATTERNS,
      undefined,
      context ?? InGstinRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* validate_result:
  Validate the GSTIN format and structure.
   */
}
