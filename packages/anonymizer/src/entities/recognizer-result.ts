/**
 * Recognizer result used in the anonymizer context.
 * Simpler version than the core one - used for input from the analyzer.
 */
export class RecognizerResult {
  entityType: string;
  start: number;
  end: number;
  score: number;

  constructor(entityType: string, start: number, end: number, score: number) {
    this.entityType = entityType;
    this.start = start;
    this.end = end;
    this.score = score;
  }

  intersects(other: RecognizerResult): number {
    if (this.end < other.start || other.end < this.start) {
      return 0;
    }
    return Math.min(this.end, other.end) - Math.max(this.start, other.start);
  }

  containedIn(other: RecognizerResult): boolean {
    return this.start >= other.start && this.end <= other.end;
  }

  contains(other: RecognizerResult): boolean {
    return this.start <= other.start && this.end >= other.end;
  }

  equalIndices(other: RecognizerResult): boolean {
    return this.start === other.start && this.end === other.end;
  }

  hasConflict(other: RecognizerResult): boolean {
    if (this.equalIndices(other)) {
      return this.score <= other.score;
    }
    return other.contains(this);
  }

  toString(): string {
    return `type: ${this.entityType}, start: ${this.start}, end: ${this.end}, score: ${this.score}`;
  }
}
