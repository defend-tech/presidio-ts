import { Pattern, PatternRecognizer } from "@presidio/core";

/** DE_KFZ recognizer for DE region. */
export class DeKfzRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "de";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["kennzeichen", "kfz-kennzeichen", "kraftfahrzeugkennzeichen", "nummernschild", "fahrzeugkennzeichen", "zulassung", "kfz", "fahrzeug", "auto", "pkw", "lkw", "fahrzeugschein", "fahrzeugbrief", "zulassungsbescheinigung", "amtliches kennzeichen"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "DE_KFZ",
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
