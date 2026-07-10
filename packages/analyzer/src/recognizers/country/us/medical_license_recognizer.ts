import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** MEDICAL_LICENSE recognizer for US region. */
export class MedicalLicenseRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "us";

  static readonly PATTERNS = [
    new Pattern(
      "USA DEA Certificate Number (weak)",
      "[abcdefghjklmprstuxABCDEFGHJKLMPRSTUX]{1}[a-zA-Z]{1}\\d{7}|[abcdefghjklmprstuxABCDEFGHJKLMPRSTUX]{1}9\\d{7}",
      0.4,
    ),
  ];

  static readonly CONTEXT = ["medical", "certificate", "DEA"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "MEDICAL_LICENSE",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? MedicalLicenseRecognizer.PATTERNS,
      undefined,
      context ?? MedicalLicenseRecognizer.CONTEXT,
    );
  }
  override validateResult(patternText: string): boolean {
    const value = patternText.replace(/[ -]/g, "");
    if (value.length < 3 || !/^\d+$/.test(value)) return false;
    const digits = [...value.slice(2)].map(Number);
    const checksum = digits.pop()!;
    const body = digits.reverse();
    return (
      (-checksum +
        body.reduce(
          (sum, digit, index) => sum + (index % 2 === 0 ? digit * 2 : digit),
          0,
        )) %
        10 ===
      0
    );
  }
}
