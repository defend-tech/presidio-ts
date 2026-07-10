import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** DE_FUEHRERSCHEIN recognizer for DE region. */
export class DeFuehrerscheinRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [
    new Pattern(
      "F\u00fchrerscheinnummer (Post-2013 EU-Format, 11 Zeichen)",
      "\\b[A-Z]{2}\\d{8}[A-Z0-9]\\b",
      0.35,
    ),
  ];

  static readonly CONTEXT = [
    "führerscheinnummer",
    "führerschein",
    "fahrerlaubnis",
    "fahrerlaubnisnummer",
    "fahrerlaubnisklasse",
    "führerscheininhaber",
    "fev",
    "kba",
    "kraftfahrt-bundesamt",
    "driving licence",
    "driving license",
    "driver's license",
    "licence number",
    "license number",
    "dokument nr",
    "dokument-nr",
    "feld 5",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "DE_FUEHRERSCHEIN",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? DeFuehrerscheinRecognizer.PATTERNS,
      undefined,
      context ?? DeFuehrerscheinRecognizer.CONTEXT,
    );
  }
}
