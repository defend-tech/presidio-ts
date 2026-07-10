import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** IN_GSTIN recognizer for IN region. */
export class InGstinRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "in";

  static readonly PATTERNS = [
    new Pattern(
      "GSTIN (High)",
      "\\b((?:0[1-9]|[1-3][0-7])[A-Za-z0-9]{10}[A-Za-z0-9]{1}Z[A-Za-z0-9]{1})\\b",
      0.8,
    ),
    new Pattern(
      "GSTIN (Medium)",
      "\\b((?:0[1-9]|[1-3][0-7])[A-Za-z0-9]{11}Z[A-Za-z0-9]{1})\\b",
      0.4,
    ),
    new Pattern("GSTIN (Low)", "\\b([0-9]{2}[A-Za-z0-9]{11}Z[A-Za-z0-9]{1})\\b", 0.1),
  ];

  static readonly CONTEXT = [
    "gstin",
    "gst",
    "goods and services tax",
    "tax identification",
    "gst number",
    "gst registration",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "IN_GSTIN",
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
  override validateResult(patternText: string): boolean {
    const value = patternText.toUpperCase().replace(/[ -]/g, "");
    if (
      !/^(?:0[1-9]|[1-3][0-7])/.test(value) ||
      value.length !== 15 ||
      value[13] !== "Z" ||
      !/^[A-Z0-9]$/.test(value[12]) ||
      !/^[A-Z0-9]$/.test(value[14])
    )
      return false;
    const pan = value.slice(2, 12);
    return (
      [...pan.slice(0, 5)].filter((char) => /[A-Z]/.test(char)).length >= 3 &&
      /^\d{4}[A-Z]$/.test(pan.slice(5))
    );
  }
}
