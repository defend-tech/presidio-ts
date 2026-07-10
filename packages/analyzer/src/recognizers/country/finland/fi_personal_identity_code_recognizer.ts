import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** FI_PERSONAL_IDENTITY_CODE recognizer for FI region. */
export class FiPersonalIdentityCodeRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "fi";

  static readonly PATTERNS = [
    new Pattern(
      "Finnish Personal Identity Code (Medium)",
      "\\b(\\d{6})([-+ABCDEFYXWVU])(\\d{3})([0123456789ABCDEFHJKLMNPRSTUVWXY])\\b",
      0.5,
    ),
    new Pattern(
      "Finnish Personal Identity Code (Very Weak)",
      "(\\d{6})([-+ABCDEFYXWVU])(\\d{3})([0123456789ABCDEFHJKLMNPRSTUVWXY])",
      0.1,
    ),
  ];

  static readonly CONTEXT = [
    "hetu",
    "henkilötunnus",
    "personbeteckningen",
    "personal identity code",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "FI_PERSONAL_IDENTITY_CODE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? FiPersonalIdentityCodeRecognizer.PATTERNS,
      undefined,
      context ?? FiPersonalIdentityCodeRecognizer.CONTEXT,
    );
  }
}
