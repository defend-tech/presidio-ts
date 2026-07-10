import { Operator } from "./operator.js";
import { OperatorType } from "./operator-type.js";

export type CustomOperatorFunction = (text: string) => string;

/** Replaces the PII text with the result of a user-supplied function. */
export class Custom extends Operator {
  static LAMBDA = "lambda";
  operatorType = OperatorType.Anonymize;

  operate(text: string, params: Record<string, unknown>): string {
    this.validate(params);
    const fn = params[Custom.LAMBDA] as CustomOperatorFunction;
    const result = fn(text);
    if (typeof result !== "string") {
      throw new Error("Function return type must be a string");
    }
    return result;
  }

  validate(params: Record<string, unknown>): void {
    if (typeof params[Custom.LAMBDA] !== "function") {
      throw new Error("New value must be a callable function");
    }
  }
}
