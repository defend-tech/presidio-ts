import { Operator } from "./operator.js";
import { OperatorType } from "./operator-type.js";

/**
 * Mask operator - masks parts of the PII text.
 *
 * Parameters:
 * - masking_char: character to use for masking
 * - chars_to_mask: number of chars to mask
 * - from_end: if true, mask from the end; if false, mask from the start
 */
export class Mask extends Operator {
  operatorType = OperatorType.Anonymize;

  operate(text: string, params: Record<string, unknown>): string {
    this.validate(params);

    const maskingChar = params.masking_char as string;
    const charsToMask = params.chars_to_mask as number;
    const fromEnd = params.from_end as boolean;

    if (charsToMask <= 0) return text;
    if (charsToMask >= text.length) return maskingChar.repeat(text.length);

    if (fromEnd) {
      // Mask from end: "1234567890" -> "1234******" (charsToMask=6, fromEnd=true)
      const keepChars = text.length - charsToMask;
      return text.substring(0, keepChars) + maskingChar.repeat(charsToMask);
    } else {
      // Mask from start: "1234567890" -> "******7890" (charsToMask=6, fromEnd=false)
      return maskingChar.repeat(charsToMask) + text.substring(charsToMask);
    }
  }

  validate(params: Record<string, unknown>): void {
    if (typeof params.masking_char !== "string") {
      throw new Error("masking_char must be a string");
    }
    if ((params.masking_char as string).length !== 1) {
      throw new Error("masking_char must be a character");
    }
    if (typeof params.chars_to_mask !== "number") {
      throw new Error("chars_to_mask must be a number");
    }
    if (typeof params.from_end !== "boolean") {
      throw new Error("from_end must be a boolean");
    }
  }
}
