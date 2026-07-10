import { EntityRecognizer, Pattern, PatternRecognizer } from "@presidio/core";

/**
 * Recognize common credit card numbers using regex + Luhn checksum.
 *
 * Supports detection of credit card numbers with optional separators
 * (dashes or spaces), validated using the Luhn algorithm.
 *
 * @see https://en.wikipedia.org/wiki/Luhn_algorithm
 */
export class CreditCardRecognizer extends PatternRecognizer {
  /** Default patterns for credit card detection. */
  public static readonly PATTERNS: Pattern[] = [
    new Pattern(
      "All Credit Cards (weak)",
      "\\b(?!1\\d{12}(?!\\d))((4\\d{3})|(5[0-5]\\d{2})|(6\\d{3})|(1\\d{3})|(3\\d{3}))[- ]?(\\d{3,4})[- ]?(\\d{3,4})[- ]?(\\d{3,5})\\b",
      0.3,
    ),
  ];

  /** Context words that increase confidence in credit card detection. */
  public static readonly CONTEXT: string[] = [
    "credit",
    "card",
    "visa",
    "mastercard",
    "cc ",
    "amex",
    "discover",
    "jcb",
    "diners",
    "maestro",
    "instapayment",
  ];

  /**
   * Pairs used to normalize input before pattern matching and validation.
   * Removes dashes and spaces so the Luhn checksum can be applied to raw digits.
   */
  private readonly replacementPairs: [string, string][];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supportedLanguage: string = "en",
    supportedEntity: string = "CREDIT_CARD",
    replacementPairs: [string, string][] | null = null,
    name: string | null = null,
  ) {
    super(
      supportedEntity,
      name,
      supportedLanguage,
      patterns ?? CreditCardRecognizer.PATTERNS,
      null,
      context ?? CreditCardRecognizer.CONTEXT,
    );
    this.replacementPairs = replacementPairs ?? [[ "-", "" ], [ " ", "" ]];
  }

  /**
   * Validate a potential credit card number using the Luhn checksum algorithm.
   *
   * @param patternText - The matched text to validate
   * @returns `true` if the Luhn checksum passes, `false` otherwise
   */
  validateResult(patternText: string): boolean {
    const sanitizedValue = EntityRecognizer.sanitizeValue(
      patternText,
      this.replacementPairs,
    );
    return CreditCardRecognizer.luhnChecksum(sanitizedValue);
  }

  /**
   * Compute the Luhn checksum for a string of digits.
   *
   * Starting from the rightmost digit (the check digit), double every
   * second digit. If the doubled value exceeds 9, subtract 9.
   * Sum all digits and check if the total is divisible by 10.
   *
   * @param sanitizedValue - Digits only (separators already removed)
   * @returns `true` if the value passes the Luhn check
   */
  private static luhnChecksum(sanitizedValue: string): boolean {
    const digits = sanitizedValue.split("").map(Number);
    const oddDigits = digits.filter((_, i) => (digits.length - 1 - i) % 2 === 0);
    const evenDigits = digits.filter((_, i) => (digits.length - 1 - i) % 2 === 1);

    let checksum = oddDigits.reduce((sum, d) => sum + d, 0);
    for (const d of evenDigits) {
      const doubled = d * 2;
      checksum += String(doubled).split("").map(Number).reduce((s, n) => s + n, 0);
    }
    return checksum % 10 === 0;
  }
}