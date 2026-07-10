import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** ES_NIF recognizer for ES region. */
export class EsNifRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "es";

  static readonly PATTERNS = [new Pattern("NIF", "\\b[0-9]?[0-9]{7}[-]?[A-Z]\\b", 0.5)];

  static readonly CONTEXT = [
    "documento nacional de identidad",
    "DNI",
    "NIF",
    "identificación",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "ES_NIF",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? EsNifRecognizer.PATTERNS,
      undefined,
      context ?? EsNifRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    const value = patternText.replace(/[ -]/g, "").toUpperCase();
    if (!/^\d{8}[A-Z]$/.test(value)) return false;
    return value[8] === "TRWAGMYFPDXBNJZSQVHLCKE"[Number(value.slice(0, 8)) % 23];
  }
}
