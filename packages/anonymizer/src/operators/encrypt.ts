import { AESCipher } from "../crypto/aes-cipher.js";
import { Operator } from "./operator.js";
import { OperatorType } from "./operator-type.js";

/** Encrypts text to a reversible encrypted form. */
export class Encrypt extends Operator {
  static KEY = "key";
  operatorType = OperatorType.Anonymize;

  async operate(text: string, params: Record<string, unknown>): Promise<string> {
    this.validate(params);
    return AESCipher.encrypt(params[Encrypt.KEY] as string | Uint8Array, text);
  }

  validate(params: Record<string, unknown>): void {
    const key = params[Encrypt.KEY];
    if (!(typeof key === "string" || key instanceof Uint8Array)) {
      throw new Error("key must be a string or Uint8Array");
    }
    if (!AESCipher.isValidKeySize(key)) {
      throw new Error("Invalid input, key must be of length 128, 192 or 256 bits");
    }
  }
}
