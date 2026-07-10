/**
 * Generic PII recognizers for common entity types.
 *
 * Each recognizer uses regex patterns combined with optional
 * validation logic to detect and validate PII entities.
 */

export { CreditCardRecognizer } from "./credit-card.js";
export { EmailRecognizer } from "./email.js";
export { PhoneRecognizer } from "./phone.js";
export { IpRecognizer } from "./ip.js";
export { UrlRecognizer } from "./url.js";
export { MacAddressRecognizer } from "./mac.js";
export { CryptoRecognizer } from "./crypto.js";
export { DateRecognizer } from "./date.js";
export { IbanRecognizer } from "./iban.js";

// IBAN patterns are exported for consumers that need country-specific patterns
export { regexPerCountry, BOS, EOS } from "./iban-patterns.js";