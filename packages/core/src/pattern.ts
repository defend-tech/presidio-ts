/**
 * A class that represents a regex pattern for PII detection.
 *
 * @param name - the name of the pattern
 * @param regex - the regex pattern to detect
 * @param score - the pattern's strength (values varies 0-1)
 */
export class Pattern {
  public name: string;
  public regex: string;
  public score: number;
  public compiledRegex: RegExp | null = null;
  public compiledWithFlags: string | undefined;

  constructor(name: string, regex: string, score: number) {
    this.name = name;
    this.regex = regex;
    this.score = score;
    this.compiledRegex = null;

    Pattern.#validateRegex(this.regex);
    Pattern.#validateScore(this.score);
  }

  static #validateRegex(pattern: string): void {
    try {
      const { source, flags } = Pattern.normalizePythonRegex(pattern);
      new RegExp(source, flags);
    } catch (e) {
      throw new Error(`Invalid regex pattern: ${(e as Error).message}`);
    }
  }

  /** Translate the Python inline flags used by retained recognizer patterns. */
  static normalizePythonRegex(pattern: string): { source: string; flags: string } {
    const flags = new Set<string>();
    const source = pattern.replace(/\(\?([ims]+)\)/g, (_match, inlineFlags: string) => {
      for (const flag of inlineFlags) flags.add(flag);
      return "";
    });
    return { source, flags: [...flags].join("") };
  }

  static #validateScore(score: number): void {
    if (score < 0 || score > 1) {
      throw new Error(`Invalid score: ${score}. Score should be between 0 and 1`);
    }
  }

  toDict(): { name: string; score: number; regex: string } {
    return { name: this.name, score: this.score, regex: this.regex };
  }

  static fromDict(patternDict: { name: string; regex: string; score: number }): Pattern {
    return new Pattern(patternDict.name, patternDict.regex, patternDict.score);
  }

  toString(): string {
    return JSON.stringify(this.toDict());
  }
}
