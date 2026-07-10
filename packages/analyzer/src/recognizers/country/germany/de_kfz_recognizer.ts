import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** DE_KFZ recognizer for DE region. */
export class DeKfzRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [
    new Pattern(
      "KFZ-Kennzeichen (mit Leerzeichen)",
      "(?<![\\w-])[A-Z\u00c4\u00d6\u00dc]{1,3}\\s[A-Z]{1,2}\\s\\d{1,4}[EH]?(?!\\w)",
      0.3,
    ),
    new Pattern(
      "KFZ-Kennzeichen (mit Bindestrich)",
      "(?<![\\w-])[A-Z\u00c4\u00d6\u00dc]{1,3}-[A-Z]{1,2}-\\d{1,4}[EH]?(?!\\w)",
      0.3,
    ),
    new Pattern(
      "KFZ-Kennzeichen (Bindestrich + Leerzeichen)",
      "(?<![\\w-])[A-Z\u00c4\u00d6\u00dc]{1,3}-[A-Z]{1,2}\\s\\d{1,4}[EH]?(?!\\w)",
      0.3,
    ),
    new Pattern(
      "KFZ-Kennzeichen (ASCII only, mit Leerzeichen)",
      "(?<![\\w-])[A-Z]{1,3}\\s[A-Z]{1,2}\\s\\d{1,4}[EH]?(?!\\w)",
      0.2,
    ),
    new Pattern(
      "KFZ-Kennzeichen (ASCII only, Bindestrich + Leerzeichen)",
      "(?<![\\w-])[A-Z]{1,3}-[A-Z]{1,2}\\s\\d{1,4}[EH]?(?!\\w)",
      0.2,
    ),
  ];

  static readonly CONTEXT = [
    "kennzeichen",
    "kfz-kennzeichen",
    "kraftfahrzeugkennzeichen",
    "nummernschild",
    "fahrzeugkennzeichen",
    "zulassung",
    "kfz",
    "fahrzeug",
    "auto",
    "pkw",
    "lkw",
    "fahrzeugschein",
    "fahrzeugbrief",
    "zulassungsbescheinigung",
    "amtliches kennzeichen",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "DE_KFZ",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? DeKfzRecognizer.PATTERNS,
      undefined,
      context ?? DeKfzRecognizer.CONTEXT,
    );
  }
}
