import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** IT_DRIVER_LICENSE recognizer for IT region. */
export class ItDriverLicenseRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "it";

  static readonly PATTERNS = [
    new Pattern(
      "Driver License",
      "\\b(?i)(([A-Z]{2}\\d{7}[A-Z])|(U1[BCDEFGHLJKMNPRSTUWYXZ0-9]{7}[A-Z]))\\b",
      0.2,
    ),
  ];

  static readonly CONTEXT = [
    "patente",
    "patente di guida",
    "licenza",
    "licenza di guida",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "IT_DRIVER_LICENSE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? ItDriverLicenseRecognizer.PATTERNS,
      undefined,
      context ?? ItDriverLicenseRecognizer.CONTEXT,
    );
  }
}
