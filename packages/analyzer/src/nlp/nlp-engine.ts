import type { NlpArtifacts } from "@defend-tech/presidio-core";

/**
 * NlpEngine is an abstraction layer over the NLP module.
 *
 * It provides NLP preprocessing functionality as well as other queries
 * on tokens. Implementations may use browser-native APIs or third-party
 * libraries such as transformers.js,_compiled spaCy models, etc.
 *
 * This interface is compatible with the Python `presidio_analyzer.nlp_engine.NlpEngine`.
 */
export abstract class NlpEngine {
  /**
   * Load the NLP model.
   *
   * Implementations should download, compile, or otherwise initialize
   * the underlying model so that subsequent calls to `processText`
   * return results without additional setup.
   */
  public abstract load(): Promise<void>;

  /**
   * Return `true` if the model is already loaded.
   */
  public abstract isLoaded(): boolean;

  /**
   * Execute the NLP pipeline on the given text and language.
   *
   * @param text - The text to process.
   * @param language - The ISO code of the text language (e.g. `"en"`).
   * @returns NlpArtifacts containing entities, tokens, lemmas, keywords, etc.
   */
  public abstract processText(text: string, language: string): Promise<NlpArtifacts>;

  /**
   * Execute the NLP pipeline on a batch of texts.
   *
   * @param texts - Iterable of texts to process.
   * @param language - The ISO code of the text language.
   * @param batchSize - Number of texts to process in parallel. Defaults to 1.
   * @param nProcess - Number of worker processes/threads. Defaults to 1.
   * @returns Async iterator yielding `[text, NlpArtifacts]` tuples.
   */
  public abstract processBatch(
    texts: Iterable<string>,
    language: string,
    batchSize?: number,
    nProcess?: number,
  ): AsyncIterable<[string, NlpArtifacts]>;

  /**
   * Return `true` if the given word is a stop word in the given language.
   *
   * @param word - The word to check.
   * @param language - The ISO code of the language.
   */
  public abstract isStopword(word: string, language: string): boolean;

  /**
   * Return `true` if the given word is a punctuation token in the given language.
   *
   * @param word - The word to check.
   * @param language - The ISO code of the language.
   */
  public abstract isPunct(word: string, language: string): boolean;

  /**
   * Return the list of entity types this NLP engine can detect
   * (e.g. `["PERSON", "LOCATION", "ORG"]`).
   */
  public abstract getSupportedEntities(): string[];

  /**
   * Return the list of language codes this NLP engine supports.
   */
  public abstract getSupportedLanguages(): string[];
}
