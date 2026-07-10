import type { OperatorType } from "./operator-type.js";

/**
 * Abstract base class for all anonymization operators.
 */
export abstract class Operator {
  abstract operatorType: OperatorType;

  abstract operate(
    text: string,
    params: Record<string, unknown>,
  ): string | Promise<string>;

  abstract validate(params: Record<string, unknown>): void;
}
