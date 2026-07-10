import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** US_SSN recognizer for US region. */
export class UsSsnRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "us";

  static readonly PATTERNS = [
    new Pattern("SSN1 (very weak)", "\\b([0-9]{5})-([0-9]{4})\\b", 0.05),
    new Pattern("SSN2 (very weak)", "\\b([0-9]{3})-([0-9]{6})\\b", 0.05),
    new Pattern("SSN3 (very weak)", "\\b(([0-9]{3})-([0-9]{2})-([0-9]{4}))\\b", 0.05),
    new Pattern("SSN4 (very weak)", "\\b[0-9]{9}\\b", 0.05),
    new Pattern("SSN5 (medium)", "\\b([0-9]{3})[- .]([0-9]{2})[- .]([0-9]{4})\\b", 0.5),
  ];

  static readonly CONTEXT = ["social", "security", "ssn", "ssns", "ssid"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "US_SSN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? UsSsnRecognizer.PATTERNS,
      undefined,
      context ?? UsSsnRecognizer.CONTEXT,
    );
  }

  invalidateResult(patternText: string): boolean {
    const digits = patternText.replace(/\D/g, "");
    if (digits.length !== 9) return true;
    const area = digits.slice(0, 3);
    const group = digits.slice(3, 5);
    const serial = digits.slice(5);
    return (
      area === "000" ||
      area === "666" ||
      area.startsWith("9") ||
      group === "00" ||
      serial === "0000"
    );
  }
}
