/**
 * Hold tracing information to explain why PII entities were identified as such.
 */
export class AnalysisExplanation {
  recognizer: string;
  patternName: string | null;
  pattern: string | null;
  originalScore: number;
  score: number;
  textualExplanation: string | null;
  scoreContextImprovement: number = 0;
  supportiveContextWord: string = "";
  validationResult: boolean | null;
  regexFlags: string | undefined;

  constructor(
    recognizer: string,
    originalScore: number,
    patternName: string | null = null,
    pattern: string | null = null,
    validationResult: boolean | null = null,
    textualExplanation: string | null = null,
    regexFlags: string | undefined = undefined,
  ) {
    this.recognizer = recognizer;
    this.patternName = patternName;
    this.pattern = pattern;
    this.originalScore = originalScore;
    this.score = originalScore;
    this.textualExplanation = textualExplanation;
    this.validationResult = validationResult;
    this.regexFlags = regexFlags;
  }

  setImprovedScore(score: number): void {
    this.score = score;
    this.scoreContextImprovement = this.score - this.originalScore;
  }

  setSupportiveContextWord(word: string): void {
    this.supportiveContextWord = word;
  }

  appendTextualExplanationLine(text: string): void {
    if (this.textualExplanation === null) {
      this.textualExplanation = text;
    } else {
      this.textualExplanation = `${this.textualExplanation}\n${text}`;
    }
  }

  toDict(): Record<string, unknown> {
    return Object.getOwnPropertyNames(this).reduce(
      (acc, key) => {
        acc[key] = (this as Record<string, unknown>)[key];
        return acc;
      },
      {} as Record<string, unknown>,
    );
  }
}
