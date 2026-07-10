import { parse } from "tldts";

import { Pattern, PatternRecognizer } from "@presidio/core";

/**
 * Recognize email addresses using regex with TLD validation.
 *
 * The domain part allows internal hyphen groups inside each label,
 * including consecutive hyphens, so RFC 3490 punycode labels
 * (e.g. "xn--80ak6aa92e") and raw IDN labels (matched via the
 * Unicode-aware "\w") are detected. Each label still starts and
 * ends with an alphanumeric, and at least one dot is required,
 * so no arbitrary non-email text is matched.
 *
 * TLD validation is performed via `tldts` to ensure the domain
 * has a recognized public suffix.
 */
export class EmailRecognizer extends PatternRecognizer {
  /** Default email pattern. */
  public static readonly PATTERNS: Pattern[] = [
    new Pattern(
      "Email (Medium)",
      "\\b((([!#$%&'*+\\-/=?^_`{|}~\\w])|([!#$%&'*+\\-/=?^_`{|}~\\w][!#$%&'*+\\-/=?^_`{|}~\\.\\w]{0,}[!#$%&'*+\\-/=?^_`{|}~\\w]))[@]\\w+(?:-+\\w+)*(?:\\.\\w+(?:-+\\w+)*)+)\\b",
      0.5,
    ),
  ];

  /** Context words that increase confidence in email detection. */
  public static readonly CONTEXT: string[] = ["email"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supportedLanguage: string = "en",
    supportedEntity: string = "EMAIL_ADDRESS",
    name: string | null = null,
  ) {
    super(
      supportedEntity,
      name,
      supportedLanguage,
      patterns ?? EmailRecognizer.PATTERNS,
      null,
      context ?? EmailRecognizer.CONTEXT,
    );
  }

  /**
   * Validate the matched text as a real email address by checking
   * that its domain has a recognized public suffix (FQDN).
   *
   * Uses `tldts.parse()` to extract domain information. A valid
   * email must have a non-empty domain with a recognized TLD.
   *
   * @param patternText - The matched email candidate
   * @returns `true` if the domain has a valid domain (FQDN), `false` otherwise
   */
  validateResult(patternText: string): boolean {
    const result = parse(patternText);
    // For email addresses, the domain field will be empty if no valid
    // TLD is found. If found, it is non-empty.
    return result.domain !== null && result.domain !== "";
  }
}