import { Pattern, PatternRecognizer } from "@presidio/core";

/** SE_PERSONNUMMER recognizer for SE region. */
export class SePersonnummerRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "se";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["personnummer", "svenskt personnummer", "svensk id", "ssn", "personal identity number", "samordningsnummer"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "SE_PERSONNUMMER",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? SePersonnummerRecognizer.PATTERNS,
      undefined,
      context ?? SePersonnummerRecognizer.CONTEXT,
    );
  }

}
