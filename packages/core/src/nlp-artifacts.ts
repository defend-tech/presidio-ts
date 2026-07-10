/**
 * NlpArtifacts is an abstraction layer over the results of an NLP pipeline.
 *
 * It holds attributes such as entities, tokens and lemmas
 * which can be used by any recognizer.
 */
export class NlpArtifacts {
  entities: string[];
  tokens: string[];
  tokensIndices: number[];
  lemmas: string[];
  keywords: string[];
  language: string;
  scores: number[];

  constructor(
    entities: string[],
    tokens: string[],
    tokensIndices: number[],
    lemmas: string[],
    keywords: string[],
    language: string,
    scores: number[] | null = null,
  ) {
    this.entities = entities;
    this.tokens = tokens;
    this.tokensIndices = tokensIndices;
    this.lemmas = lemmas;
    this.keywords = keywords;
    this.language = language;
    this.scores = scores ?? Array(entities.length).fill(0.85);
  }

  toJson(): string {
    return JSON.stringify({ ...this });
  }
}
