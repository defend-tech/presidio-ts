import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** US_DRIVER_LICENSE recognizer for US region. */
export class UsLicenseRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "us";

  static readonly PATTERNS = [
    new Pattern(
      "Driver License - Alphanumeric (weak)",
      "\\b([A-Z][0-9]{3,6}|[A-Z][0-9]{5,9}|[A-Z][0-9]{6,8}|[A-Z][0-9]{4,8}|[A-Z][0-9]{9,11}|[A-Z]{1,2}[0-9]{5,6}|H[0-9]{8}|V[0-9]{6}|X[0-9]{8}|A-Z]{2}[0-9]{2,5}|[A-Z]{2}[0-9]{3,7}|[0-9]{2}[A-Z]{3}[0-9]{5,6}|[A-Z][0-9]{13,14}|[A-Z][0-9]{18}|[A-Z][0-9]{6}R|[A-Z][0-9]{9}|[A-Z][0-9]{1,12}|[0-9]{9}[A-Z]|[A-Z]{2}[0-9]{6}[A-Z]|[0-9]{8}[A-Z]{2}|[0-9]{3}[A-Z]{2}[0-9]{4}|[A-Z][0-9][A-Z][0-9][A-Z]|[0-9]{7,8}[A-Z])\\b",
      0.3,
    ),
    new Pattern(
      "Driver License - Digits (very weak)",
      "\\b([0-9]{6,14}|[0-9]{16})\\b",
      0.01,
    ),
  ];

  static readonly CONTEXT = [
    "driver",
    "license",
    "permit",
    "lic",
    "identification",
    "dls",
    "cdls",
    "lic#",
    "driving",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "US_DRIVER_LICENSE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? UsLicenseRecognizer.PATTERNS,
      undefined,
      context ?? UsLicenseRecognizer.CONTEXT,
    );
  }
}
