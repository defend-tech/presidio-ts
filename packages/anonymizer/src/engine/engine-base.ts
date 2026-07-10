import { EngineResult, EngineResultItem } from "../entities/engine-result.js";
import type { OperatorConfig } from "../entities/operator-config.js";
import type { RecognizerResult } from "../entities/recognizer-result.js";
import type { OperatorType } from "../operators/operator-type.js";
import { OperatorsFactory } from "../operators/operators-factory.js";

/** Shared text operation logic used by anonymizer and deanonymizer engines. */
export abstract class EngineBase {
  operatorsFactory: OperatorsFactory;

  constructor() {
    this.operatorsFactory = new OperatorsFactory();
  }

  protected async operate(
    text: string,
    piiEntities: RecognizerResult[],
    operatorsMetadata: Record<string, OperatorConfig>,
    operatorType: OperatorType,
  ): Promise<EngineResult> {
    let outputText = text;
    const items: EngineResultItem[] = [];
    const sortedEntities = [...piiEntities].sort(
      (a, b) => b.start - a.start || b.end - a.end,
    );

    for (const entity of sortedEntities) {
      const textToOperateOn = outputText.slice(entity.start, entity.end);
      const operatorMetadata = this.getEntityOperatorMetadata(
        entity.entityType,
        operatorsMetadata,
      );
      const operator = this.operatorsFactory.createOperatorClass(
        operatorMetadata.operatorName,
        operatorType,
      );

      const params = { ...operatorMetadata.params, entity_type: entity.entityType };
      operator.validate(params);
      const changedText = await operator.operate(textToOperateOn, params);
      outputText =
        outputText.slice(0, entity.start) + changedText + outputText.slice(entity.end);

      items.push(
        new EngineResultItem(
          entity.start,
          entity.start + changedText.length,
          entity.entityType,
          changedText,
          operatorMetadata.operatorName,
        ),
      );
    }

    items.sort((a, b) => a.start - b.start);
    return new EngineResult(outputText, items);
  }

  private getEntityOperatorMetadata(
    entityType: string,
    operatorsMetadata: Record<string, OperatorConfig>,
  ): OperatorConfig {
    const operator = operatorsMetadata[entityType];
    if (operator) return operator;
    const defaultOperator = operatorsMetadata.DEFAULT;
    if (!defaultOperator) {
      throw new Error(`No operator configured for ${entityType} and no DEFAULT operator`);
    }
    return defaultOperator;
  }
}
