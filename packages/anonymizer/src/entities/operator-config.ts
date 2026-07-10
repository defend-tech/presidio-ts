/**
 * Operator configuration for anonymization.
 * Specifies which operator to use and its parameters.
 */
export class OperatorConfig {
  operatorName: string;
  params: Record<string, unknown>;

  constructor(operatorName: string, params: Record<string, unknown> = {}) {
    this.operatorName = operatorName;
    this.params = params;
  }
}
