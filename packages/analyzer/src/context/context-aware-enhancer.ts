import type {
  EntityRecognizer,
  NlpArtifacts,
  RecognizerResult,
} from "@defend-tech/presidio-core";

/**
 * Abstract base class for context-aware enhancers.
 *
 * Context words might enhance the confidence score of a recognized entity.
 * This abstract class is to be inherited by concrete context-aware enhancer implementations.
 *
 * This is a TypeScript port of `presidio_analyzer.context_aware_enhancers.ContextAwareEnhancer`.
 */
export abstract class ContextAwareEnhancer {
  public static readonly MIN_SCORE = 0;
  public static readonly MAX_SCORE = 1.0;

  protected contextSimilarityFactor: number;
  protected minScoreWithContextSimilarity: number;
  protected contextPrefixCount: number;
  protected contextSuffixCount: number;

  constructor(
    contextSimilarityFactor: number,
    minScoreWithContextSimilarity: number,
    contextPrefixCount: number,
    contextSuffixCount: number,
  ) {
    this.contextSimilarityFactor = contextSimilarityFactor;
    this.minScoreWithContextSimilarity = minScoreWithContextSimilarity;
    this.contextPrefixCount = contextPrefixCount;
    this.contextSuffixCount = contextSuffixCount;
  }

  /**
   * Update results in case surrounding words are relevant to the context words.
   *
   * Using the surrounding words of actual word matches, look for specific strings
   * that, if found, contribute to the score of the result, improving the confidence
   * that the match is indeed of that PII entity type.
   *
   * @param text - The actual text that was analyzed.
   * @param rawResults - Recognizer results which didn't take context into consideration.
   * @param nlpArtifacts - NLP artifacts containing lemmatized tokens for accuracy.
   * @param recognizers - The list of recognizers.
   * @param context - Optional list of context words.
   * @returns Enhanced list of RecognizerResult.
   */
  public abstract enhanceUsingContext(
    text: string,
    rawResults: RecognizerResult[],
    nlpArtifacts: NlpArtifacts,
    recognizers: EntityRecognizer[],
    context?: string[],
  ): RecognizerResult[];
}
