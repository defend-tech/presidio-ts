import { Operator } from "./operator.js";
import { OperatorType } from "./operator-type.js";

/**
 * Redact operator - removes PII text entirely (replaces with empty string).
 */
export class Redact extends Operator {
  operatorType = OperatorType.Anonymize;

  operate(_text: string, _params: Record<string, unknown>): string {
    return "";
  }

  validate(_params: Record<string, unknown>): void {
    // No validation needed
  }
}
