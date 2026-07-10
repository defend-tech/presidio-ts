import { OperatorType } from "./operator-type.js";
import { Operator } from "./operator.js";

/** No-op anonymizer that keeps the PII text unmodified. */
export class Keep extends Operator {
  operatorType = OperatorType.Anonymize;

  operate(text: string, _params: Record<string, unknown>): string {
    return text;
  }

  validate(_params: Record<string, unknown>): void {
    // No validation needed
  }
}
