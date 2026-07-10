import { Pattern, PatternRecognizer } from "@presidio/core";

/**
 * Recognize IPv4 and IPv6 addresses using regex with validation.
 *
 * Supports standard IPv4, IPv6, IPv4-mapped IPv6, and IPv4-embedded
 * IPv6 address formats. Optional CIDR notation is also supported.
 */
export class IpRecognizer extends PatternRecognizer {
  /** Default IP address patterns. */
  public static readonly PATTERNS: Pattern[] = [
    new Pattern(
      "IPv4_mapped",
      "(?<![\\w:])::(?:ffff(?::0{1,4})?:)?(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:/(?:12[0-8]|1[01]\\d|[1-9]?\\d))?\\b",
      0.6,
    ),
    new Pattern(
      "IPv4_embedded",
      "(?<![\\w:])(?:(?:[0-9A-Fa-f]{1,4}:){1,5}:[0-9A-Fa-f]{1,4}:){0,4}|(?:[0-9A-Fa-f]{1,4}:){6})(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:/(?:12[0-8]|1[01]\\d|[1-9]?\\d))?\\b",
      0.6,
    ),
    new Pattern(
      "IPv4",
      "\\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:/(?:[0-2]?\\d|3[0-2]))?\\b",
      0.6,
    ),
    new Pattern(
      "IPv6",
      "(?<![\\w:])(?:(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(?:[0-9A-Fa-f]{1,4}:){1,7}:|:(?::[0-9A-Fa-f]{1,4}){1,7}|(?:[0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4}|(?:[0-9A-Fa-f]{1,4}:){1,5}(?::[0-9A-Fa-f]{1,4}){1,2}|(?:[0-9A-Fa-f]{1,4}:){1,4}(?::[0-9A-Fa-f]{1,4}){1,3}|(?:[0-9A-Fa-f]{1,4}:){1,3}(?::[0-9A-Fa-f]{1,4}){1,4}|(?:[0-9A-Fa-f]{1,4}:){1,2}(?::[0-9A-Fa-f]{1,4}){1,5}|[0-9A-Fa-f]{1,4}:(?::[0-9A-Fa-f]{1,4}){1,6}|:(?::[0-9A-Fa-f]{1,4}){1,6})(?:%[0-9a-zA-Z]+)?(?:/(?:12[0-8]|1[01]\\d|[1-9]?\\d))?(?![\\w:]|\\.\\d)",
      0.6,
    ),
    new Pattern(
      "IPv6_unspecified",
      "(?<![\\w:])::(?:/(?:12[0-8]|1[01]\\d|[1-9]?\\d))?(?![\\w:])",
      0.1,
    ),
  ];

  /** Context words that increase confidence in IP address detection. */
  public static readonly CONTEXT: string[] = ["ip", "ipv4", "ipv6"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supportedLanguage: string = "en",
    supportedEntity: string = "IP_ADDRESS",
    name: string | null = null,
  ) {
    super(
      supportedEntity,
      name,
      supportedLanguage,
      patterns ?? IpRecognizer.PATTERNS,
      null,
      context ?? IpRecognizer.CONTEXT,
    );
  }

  /**
   * Invalidate a match if it cannot be parsed as a valid IP address or CIDR.
   *
   * Uses regex-based validation to verify the matched text is a real
   * IP address (with optional CIDR suffix).
   *
   * @param patternText - The matched text
   * @returns `true` if the text should be invalidated, `false` otherwise
   */
  invalidateResult(patternText: string): boolean {
    try {
      IpRecognizer.validateIp(patternText);
      return false;
    } catch {
      return true;
    }
  }

  /**
   * Validate that a string represents a valid IP address or CIDR notation.
   *
   * @param text - The text to validate
   */
  private static validateIp(text: string): void {
    // Split on '/' for CIDR notation
    const parts = text.split("/");
    const ipPart = parts[0];

    // Validate IPv4
    const ipv4Regex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (ipv4Regex.test(ipPart)) {
      // Validate CIDR prefix if present
      if (parts.length === 2) {
        const cidr = parseInt(parts[1], 10);
        if (isNaN(cidr) || cidr < 0 || cidr > 32) {
          throw new Error("Invalid IPv4 CIDR");
        }
      }
      return;
    }

    // Validate IPv6 (simplified — allows full, compressed, and zone ID forms)
    // Remove zone ID (%eth0 etc.) for validation
    const ipv6Part = ipPart.replace(/%[0-9a-zA-Z]+$/, "");

    const ipv6Regex =
      /^(?:(?:[0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}|(?:[0-9A-Fa-f]{1,4}:){1,7}:|:(?::[0-9A-Fa-f]{1,4}){1,7}|(?:[0-9A-Fa-f]{1,4}:){1,6}:[0-9A-Fa-f]{1,4}|(?:[0-9A-Fa-f]{1,4}:){1,5}(?::[0-9A-Fa-f]{1,4}){1,2}|(?:[0-9A-Fa-f]{1,4}:){1,4}(?::[0-9A-Fa-f]{1,4}){1,3}|(?:[0-9A-Fa-f]{1,4}:){1,3}(?::[0-9A-Fa-f]{1,4}){1,4}|(?:[0-9A-Fa-f]{1,4}:){1,2}(?::[0-9A-Fa-f]{1,4}){1,5}|[0-9A-Fa-f]{1,4}:(?::[0-9A-Fa-f]{1,4}){1,6}|:(?::[0-9A-Fa-f]{1,4}){1,6})$/;
    if (ipv6Regex.test(ipv6Part)) {
      // Validate CIDR prefix if present
      if (parts.length === 2) {
        const cidr = parseInt(parts[1], 10);
        if (isNaN(cidr) || cidr < 0 || cidr > 128) {
          throw new Error("Invalid IPv6 CIDR");
        }
      }
      return;
    }

    throw new Error("Not a valid IP address");
  }
}