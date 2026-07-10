import { OperatorType } from "./operator-type.js";
import { Operator } from "./operator.js";

/**
 * Replace operator - replaces PII text with a specified new value.
 */
export class Replace extends Operator {
  operatorType = OperatorType.Anonymize;

  operate(_text: string, params: Record<string, unknown>): string {
    this.validate(params);
    const newValue = params.new_value as string | undefined;
    if (!newValue) {
      return `<${params.entity_type as string}>`;
    }
    return newValue;
  }

  validate(params: Record<string, unknown>): void {
    if (params.new_value !== undefined && typeof params.new_value !== "string") {
      throw new Error("new_value must be a string");
    }
  }
}
