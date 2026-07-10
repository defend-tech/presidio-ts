import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/**
 * Recognize MAC (Media Access Control) addresses using regex.
 *
 * Supports three common MAC address formats:
 * - Colon-separated: 00:1A:2B:3C:4D:5E
 * - Hyphen-separated: 00-1A-2B-3C-4D-5E
 * - Cisco format (dot-separated groups of 4): 0012.3456.789A
 *
 * @see https://en.wikipedia.org/wiki/MAC_address#Notational_conventions
 * @see https://www.ieee802.org/1/files/public/docs2020/yangsters-smansfield-mac-address-format-0420-v01.pdf
 */
export class MacAddressRecognizer extends PatternRecognizer {
  /** Default MAC address patterns. */
  public static readonly PATTERNS: Pattern[] = [
    new Pattern(
      "MAC_COLON_OR_HYPHEN",
      "\\b[0-9A-Fa-f]{2}([:-])(?:[0-9A-Fa-f]{2}\\1){4}[0-9A-Fa-f]{2}\\b",
      0.6,
    ),
    new Pattern(
      "MAC_CISCO_DOT",
      "\\b[0-9A-Fa-f]{4}\\.[0-9A-Fa-f]{4}\\.[0-9A-Fa-f]{4}\\b",
      0.6,
    ),
  ];

  /** Context words that increase confidence in MAC address detection. */
  public static readonly CONTEXT: string[] = [
    "mac",
    "mac address",
    "hardware address",
    "physical address",
    "ethernet",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supportedLanguage = "en",
    supportedEntity = "MAC_ADDRESS",
    name: string | null = null,
  ) {
    super(
      supportedEntity,
      name,
      supportedLanguage,
      patterns ?? MacAddressRecognizer.PATTERNS,
      null,
      context ?? MacAddressRecognizer.CONTEXT,
    );
  }

  /**
   * Invalidate a match if it is not a valid MAC address format.
   *
   * Checks that the cleaned text (without separators) contains exactly
   * 12 hexadecimal characters. Additionally rejects broadcast (all F's)
   * and null (all 0's) addresses.
   *
   * @param patternText - The matched text
   * @returns `true` if the text should be invalidated
   */
  invalidateResult(patternText: string): boolean {
    // Remove separators and validate hex characters and length
    const cleaned = patternText.replace(/[:\-.]/g, "");

    // All characters must be valid hex and exactly 12 chars
    if (!/^[0-9A-Fa-f]{12}$/.test(cleaned)) {
      return true;
    }

    // Reject broadcast (FFFFFFFFFFFF) and null (000000000000) addresses
    const upper = cleaned.toUpperCase();
    if (upper === "FFFFFFFFFFFF" || upper === "000000000000") {
      return true;
    }

    return false;
  }
}
