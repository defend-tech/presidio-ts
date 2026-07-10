import { Pattern, PatternRecognizer } from "@presidio/core";

/** CA_SIN recognizer for CA region. */
export class CaSinRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "ca";

  static readonly PATTERNS = [
        new Pattern("SIN (weak)", "\\b[1-79]\\d{8}\\b", 0.05),
        new Pattern("SIN (medium)", "\\b[1-79]\\d{2}([- ])\\d{3}\\1\\d{3}\\b", 0.5)
  ];

  static readonly CONTEXT = ["sin", "sin number", "social insurance", "social insurance number", "canada", "nas", "numéro nas", "numéro d'assurance sociale", "assurance sociale"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "CA_SIN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? CaSinRecognizer.PATTERNS,
      undefined,
      context ?? CaSinRecognizer.CONTEXT,
    );
  }
  // FIXME: Manual port required — Python source:
  /* invalidate_result:
  Check if the pattern text cannot be validated as a CA_SIN entity.
   */
}
