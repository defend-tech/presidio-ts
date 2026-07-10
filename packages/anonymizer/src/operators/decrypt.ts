import { AESCipher } from "../crypto/aes-cipher.js";
import { Encrypt } from "./encrypt.js";
import { OperatorType } from "./operator-type.js";
import { Operator } from "./operator.js";

/** Decrypts text from a reversible encrypted form. */
export class Decrypt extends Operator {
  operatorType = OperatorType.Deanonymize;

  async operate(text: string, params: Record<string, unknown>): Promise<string> {
    this.validate(params);
    return AESCipher.decrypt(params[Encrypt.KEY] as string | Uint8Array, text);
  }

  validate(params: Record<string, unknown>): void {
    new Encrypt().validate(params);
  }
}
