import { Custom } from "./custom.js";
import { Decrypt } from "./decrypt.js";
import { Encrypt } from "./encrypt.js";
import { Hash } from "./hash.js";
import { Keep } from "./keep.js";
import { Mask } from "./mask.js";
import { OperatorType } from "./operator-type.js";
import type { Operator } from "./operator.js";
import { Redact } from "./redact.js";
import { Replace } from "./replace.js";

type OperatorCtor = new () => Operator;

/** Factory/registry for anonymize and deanonymize operators. */
export class OperatorsFactory {
  private anonymizers = new Map<string, OperatorCtor>();
  private deanonymizers = new Map<string, OperatorCtor>();

  constructor() {
    this.addAnonymizeOperator("replace", Replace);
    this.addAnonymizeOperator("redact", Redact);
    this.addAnonymizeOperator("mask", Mask);
    this.addAnonymizeOperator("hash", Hash);
    this.addAnonymizeOperator("encrypt", Encrypt);
    this.addAnonymizeOperator("keep", Keep);
    this.addAnonymizeOperator("custom", Custom);
    this.addDeanonymizeOperator("decrypt", Decrypt);
  }

  addAnonymizeOperator(name: string, operator: OperatorCtor): void {
    this.anonymizers.set(name, operator);
  }

  removeAnonymizeOperator(name: string): void {
    this.anonymizers.delete(name);
  }

  addDeanonymizeOperator(name: string, operator: OperatorCtor): void {
    this.deanonymizers.set(name, operator);
  }

  removeDeanonymizeOperator(name: string): void {
    this.deanonymizers.delete(name);
  }

  getAnonymizers(): Map<string, OperatorCtor> {
    return this.anonymizers;
  }

  getDeanonymizers(): Map<string, OperatorCtor> {
    return this.deanonymizers;
  }

  createOperatorClass(name: string, type: OperatorType): Operator {
    const registry =
      type === OperatorType.Anonymize ? this.anonymizers : this.deanonymizers;
    const ctor = registry.get(name);
    if (!ctor) {
      throw new Error(`Operator ${name} is not registered for type ${type}`);
    }
    return new ctor();
  }
}
