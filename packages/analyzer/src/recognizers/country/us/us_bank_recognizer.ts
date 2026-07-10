import { Pattern, PatternRecognizer } from "@presidio/core";

/** US_BANK_NUMBER recognizer for US region. */
export class UsBankRecognizer extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "us";

  static readonly PATTERNS = [

  ];

  static readonly CONTEXT = ["check", "account", "account#", "acct", "bank", "save", "debit"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "US_BANK_NUMBER",
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
