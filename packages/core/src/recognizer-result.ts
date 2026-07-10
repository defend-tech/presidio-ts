import type { AnalysisExplanation } from "./analysis-explanation.js";

/**
 * Recognizer Result represents the findings of the detected entity.
 *
 * @param entityType - the type of the entity
 * @param start - the start location of the detected entity
 * @param end - the end location of the detected entity
 * @param score - the score of the detection
 * @param analysisExplanation - contains the explanation of why this entity was identified
 * @param recognitionMetadata - a dictionary of metadata
 */
export class RecognizerResult {
  static RECOGNIZER_NAME_KEY = "recognizer_name";
  static RECOGNIZER_IDENTIFIER_KEY = "recognizer_identifier";
  static IS_SCORE_ENHANCED_BY_CONTEXT_KEY = "is_score_enhanced_by_context";

  entityType: string;
  start: number;
  end: number;
  score: number;
  analysisExplanation: AnalysisExplanation | null;
  recognitionMetadata: Record<string, unknown> | null;

  constructor(
    entityType: string,
    start: number,
    end: number,
    score: number,
    analysisExplanation: AnalysisExplanation | null = null,
    recognitionMetadata: Record<string, unknown> | null = null,
  ) {
    this.entityType = entityType;
    this.start = start;
    this.end = end;
    this.score = score;
    this.analysisExplanation = analysisExplanation;
    this.recognitionMetadata = recognitionMetadata;
  }

  appendAnalysisExplanationText(text: string): void {
    if (this.analysisExplanation) {
      this.analysisExplanation.appendTextualExplanationLine(text);
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

  static fromJson(data: {
    start: number;
    end: number;
    score: number;
    entityType: string;
  }): RecognizerResult {
    return new RecognizerResult(data.entityType, data.start, data.end, data.score);
  }

  /**
   * Check if self intersects with a different RecognizerResult.
   * @returns the number of intersecting characters, or 0 if not intersecting
   */
  intersects(other: RecognizerResult): number {
    if (this.end < other.start || other.end < this.start) {
      return 0;
    }
    return Math.min(this.end, other.end) - Math.max(this.start, other.start);
  }

  /**
   * Check if self is contained in a different RecognizerResult.
   */
  containedIn(other: RecognizerResult): boolean {
    return this.start >= other.start && this.end <= other.end;
  }

  /**
   * Check if one result contains another RecognizerResult.
   */
  contains(other: RecognizerResult): boolean {
    return this.start <= other.start && this.end >= other.end;
  }

  /**
   * Check if the indices are equal between two results.
   */
  equalIndices(other: RecognizerResult): boolean {
    return this.start === other.start && this.end === other.end;
  }

  /**
   * Compare by start position, then end position.
   */
  compareTo(other: RecognizerResult): number {
    if (this.start === other.start) {
      return this.end - other.end;
    }
    return this.start - other.start;
  }

  /**
   * Two results are equal if they have the same type, score, and indices.
   */
  equals(other: RecognizerResult): boolean {
    const equalType = this.entityType === other.entityType;
    const equalScore = this.score === other.score;
    return this.equalIndices(other) && equalType && equalScore;
  }

  /**
   * Hash string for use in sets.
   */
  hashCode(): string {
    return `${this.start} ${this.end} ${this.score} ${this.entityType}`;
  }

  toString(): string {
    return `type: ${this.entityType}, start: ${this.start}, end: ${this.end}, score: ${this.score}`;
  }

  /**
   * Check if two recognizer results are conflicted or not.
   * A conflict exists if:
   * 1. Same indices and this score <= other score
   * 2. This is contained in another
   */
  hasConflict(other: RecognizerResult): boolean {
    if (this.equalIndices(other)) {
      return this.score <= other.score;
    }
    return other.contains(this);
  }
}
