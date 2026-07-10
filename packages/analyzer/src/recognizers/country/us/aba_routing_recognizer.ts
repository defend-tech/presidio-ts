import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** ABA_ROUTING_NUMBER recognizer for US region. */
export class AbaRoutingRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "us";

  static readonly PATTERNS = [
    new Pattern("ABA routing number (weak)", "\\b[0123678]\\d{8}\\b", 0.05),
    new Pattern("ABA routing number", "\\b[0123678]\\d{3}-\\d{4}-\\d\\b", 0.3),
  ];

  static readonly CONTEXT = [
    "aba",
    "routing",
    "abarouting",
    "association",
    "bankrouting",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "ABA_ROUTING_NUMBER",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? AbaRoutingRecognizer.PATTERNS,
      undefined,
      context ?? AbaRoutingRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    const value = patternText.replace(/[ -]/g, "");
    if (!/^\d{9}$/.test(value)) return false;
    return (
      [3, 7, 1, 3, 7, 1, 3, 7, 1].reduce(
        (sum, weight, index) => sum + Number(value[index]) * weight,
        0,
      ) %
        10 ===
      0
    );
  }
}
