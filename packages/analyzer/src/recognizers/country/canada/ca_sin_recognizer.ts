import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** CA_SIN recognizer for CA region. */
export class CaSinRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "ca";

  static readonly PATTERNS = [
    new Pattern("SIN (weak)", "\\b[1-79]\\d{8}\\b", 0.05),
    new Pattern("SIN (medium)", "\\b[1-79]\\d{2}([- ])\\d{3}\\1\\d{3}\\b", 0.5),
  ];

  static readonly CONTEXT = [
    "sin",
    "sin number",
    "social insurance",
    "social insurance number",
    "canada",
    "nas",
    "numéro nas",
    "numéro d'assurance sociale",
    "assurance sociale",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "CA_SIN",
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

  invalidateResult(patternText: string): boolean {
    const digits = patternText.replace(/\D/g, "");
    if (!/^[1-9]\d{8}$/.test(digits)) return true;
    let sum = 0;
    for (let index = 0; index < digits.length; index += 1) {
      let value = Number(digits[index]);
      if (index % 2 === 1) value *= 2;
      sum += value > 9 ? value - 9 : value;
    }
    return sum % 10 !== 0;
  }
}
