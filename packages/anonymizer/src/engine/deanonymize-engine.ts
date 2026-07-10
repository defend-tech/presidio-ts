import type { EngineResult } from "../entities/engine-result.js";
import { OperatorConfig } from "../entities/operator-config.js";
import type { RecognizerResult } from "../entities/recognizer-result.js";
import { OperatorType } from "../operators/operator-type.js";
import type { Operator } from "../operators/operator.js";
import { EngineBase } from "./engine-base.js";

/** Reverts anonymized text using deanonymize operators such as decrypt. */
export class DeanonymizeEngine extends EngineBase {
  async deanonymize(
    text: string,
    entities: RecognizerResult[],
    operators: Record<string, OperatorConfig>,
  ): Promise<EngineResult> {
    return this.operate(text, entities, operators, OperatorType.Deanonymize);
  }

  addDeanonymizer(name: string, deanonymizer: new () => Operator): void {
    this.operatorsFactory.addDeanonymizeOperator(name, deanonymizer);
  }

  removeDeanonymizer(name: string): void {
    this.operatorsFactory.removeDeanonymizeOperator(name);
  }

  getDeanonymizers(): string[] {
    return [...this.operatorsFactory.getDeanonymizers().keys()];
  }
}
