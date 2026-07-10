import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** UK_POSTCODE recognizer for UK region. */
export class UkPostcodeRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "uk";

  static readonly PATTERNS = [
    new Pattern(
      "UK Postcode",
      "\\b(GIR\\s?0AA|[A-PR-UWYZ][0-9][ABCDEFGHJKPSTUW]?\\s?[0-9][ABD-HJLNP-UW-Z]{2}|[A-PR-UWYZ][0-9]{2}\\s?[0-9][ABD-HJLNP-UW-Z]{2}|[A-PR-UWYZ][A-HK-Y][0-9][ABEHMNPRVWXY]?\\s?[0-9][ABD-HJLNP-UW-Z]{2}|[A-PR-UWYZ][A-HK-Y][0-9]{2}\\s?[0-9][ABD-HJLNP-UW-Z]{2})\\b",
      0.1,
    ),
  ];

  static readonly CONTEXT = [
    "postcode",
    "post code",
    "postal code",
    "zip",
    "address",
    "delivery",
    "mailing",
    "shipping",
    "correspondence",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "UK_POSTCODE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? UkPostcodeRecognizer.PATTERNS,
      undefined,
      context ?? UkPostcodeRecognizer.CONTEXT,
    );
  }
}
