import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/** US_BANK_NUMBER recognizer for US region. */
export class UsBankRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "us";

  static readonly PATTERNS = [
    new Pattern("Bank Account (weak)", "\\b[0-9]{8,17}\\b", 0.05),
  ];

  static readonly CONTEXT = [
    "check",
    "account",
    "account#",
    "acct",
    "bank",
    "save",
    "debit",
  ];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language = "en",
    supported_entity = "US_BANK_NUMBER",
    name: string | null = null,
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? UsBankRecognizer.PATTERNS,
      undefined,
      context ?? UsBankRecognizer.CONTEXT,
    );
  }
}
