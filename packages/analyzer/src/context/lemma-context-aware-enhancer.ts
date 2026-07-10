import {
  AnalysisExplanation,
  type EntityRecognizer,
  type NlpArtifacts,
  RecognizerResult,
} from "@defend-tech/presidio-core";
import { ContextAwareEnhancer } from "./context-aware-enhancer.js";

/**
 * Built-in English stopwords used for filtering context tokens.
 *
 * In the Python version this relies on spaCy's stopwords list.
 * Here we ship a minimal built-in set covering common English stop words.
 */
const STOP_WORDS_EN = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "in",
  "on",
  "at",
  "to",
  "for",
  "of",
  "with",
  "by",
  "from",
  "is",
  "it",
  "as",
  "be",
  "this",
  "that",
  "are",
  "was",
  "were",
  "has",
  "have",
  "had",
  "not",
  "no",
  "do",
  "does",
  "did",
  "will",
  "would",
  "shall",
  "should",
  "may",
  "might",
  "can",
  "could",
  "its",
  "my",
  "your",
  "his",
  "her",
  "our",
  "their",
  "he",
  "she",
  "we",
  "they",
  "i",
  "me",
  "him",
  "us",
  "them",
  "am",
  "been",
  "being",
  "so",
  "if",
  "into",
  "than",
  "too",
  "very",
  "just",
  "about",
  "up",
  "out",
  "then",
  "there",
  "when",
  "where",
  "how",
  "all",
  "each",
  "which",
  "who",
  "whom",
  "what",
  "these",
  "those",
  "some",
  "any",
  "both",
  "few",
  "more",
  "most",
  "other",
  "such",
  "only",
  "own",
  "same",
  "also",
  "after",
  "before",
  "over",
  "under",
  "again",
  "further",
  "once",
  "here",
  "why",
  "because",
  "until",
  "while",
  "above",
  "below",
  "between",
  "through",
  "during",
]);

const PUNCTUATION = new Set([
  ".",
  ",",
  "!",
  "?",
  ";",
  ":",
  "'",
  '"',
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  "<",
  ">",
  "/",
  "\\",
  "|",
  "@",
  "#",
  "$",
  "%",
  "^",
  "&",
  "*",
  "-",
  "=",
  "+",
  "~",
  "`",
  "\u2026",
  "\u2014",
  "\u2013",
]);

/** Check if a word is a stop word. */
export function isStopWord(word: string): boolean {
  return STOP_WORDS_EN.has(word.toLowerCase());
}

/** Check if a word is purely punctuation. */
export function isPunctuation(word: string): boolean {
  return PUNCTUATION.has(word);
}

/**
 * Tokenize text by splitting on non-alphanumeric characters.
 *
 * @returns Array of { token, index, lemma } objects.
 */
function tokenizeText(
  text: string,
): Array<{ token: string; index: number; lemma: string }> {
  const tokens: Array<{ token: string; index: number; lemma: string }> = [];
  const regex = /[a-zA-Z0-9]+/g;
  let match = regex.exec(text);
  while (match !== null) {
    tokens.push({
      token: match[0],
      index: match.index,
      lemma: match[0].toLowerCase(),
    });
    match = regex.exec(text);
  }
  return tokens;
}

/* ------------------------------------------------------------------ */
/*  LemmaContextAwareEnhancer                                          */
/* ------------------------------------------------------------------ */

/**
 * Lemma-based context-aware enhancer.
 *
 * Compares words surrounding the matched entity to the recognizer's
 * context words and user-provided context words. When a match is found,
 * the confidence score is boosted by `contextSimilarityFactor`.
 *
 * Without spaCy, this uses a simple tokenizer: split on non-alphanumeric
 * chars, filter stopwords/punctuation, then match context keywords.
 *
 * TypeScript port of `presidio_analyzer.context_aware_enhancers.LemmaContextAwareEnhancer`.
 */
export class LemmaContextAwareEnhancer extends ContextAwareEnhancer {
  public contextMatchingMode: "substring" | "whole_word";

  constructor(
    contextSimilarityFactor = 0.35,
    minScoreWithContextSimilarity = 0.4,
    contextPrefixCount = 5,
    contextSuffixCount = 0,
    contextMatchingMode: "substring" | "whole_word" = "substring",
  ) {
    super(
      contextSimilarityFactor,
      minScoreWithContextSimilarity,
      contextPrefixCount,
      contextSuffixCount,
    );
    if (contextMatchingMode !== "whole_word" && contextMatchingMode !== "substring") {
      throw new Error(
        `contextMatchingMode must be one of: 'whole_word', 'substring'. Got: ${contextMatchingMode}`,
      );
    }
    this.contextMatchingMode = contextMatchingMode;
  }

  /**
   * Enhance scores based on surrounding context words.
   */
  public enhanceUsingContext(
    text: string,
    rawResults: RecognizerResult[],
    nlpArtifacts: NlpArtifacts,
    recognizers: EntityRecognizer[],
    context?: string[],
  ): RecognizerResult[] {
    // Deep copy results so we don't mutate the originals
    const results = rawResults.map(deepCopyRecognizerResult);

    // Lookup recognizer by id
    const recognizersDict = new Map<string, EntityRecognizer>();
    for (const rec of recognizers) {
      recognizersDict.set(rec.id, rec);
    }

    // Normalize user-provided context
    const normalizedContext: string[] = context
      ? context.map((w) => w.toLowerCase())
      : [];

    // Build token data from NLP artifacts or fallback tokenizer
    const { tokens, lemmas, tokenIndices, keywords } = buildTokenData(nlpArtifacts, text);

    for (const result of results) {
      let recognizer: EntityRecognizer | undefined;
      if (
        result.recognitionMetadata &&
        RecognizerResult.RECOGNIZER_IDENTIFIER_KEY in result.recognitionMetadata
      ) {
        const recId = result.recognitionMetadata[
          RecognizerResult.RECOGNIZER_IDENTIFIER_KEY
        ] as string;
        recognizer = recognizersDict.get(recId);
      }

      if (!recognizer) continue;

      // Skip if no context words defined
      if (!recognizer.context || recognizer.context.length === 0) continue;

      // Skip if already boosted by recognizer-level enhancement
      if (result.recognitionMetadata?.[RecognizerResult.IS_SCORE_ENHANCED_BY_CONTEXT_KEY])
        continue;

      const matchedWord = text.slice(result.start, result.end);

      // Extract surrounding words
      const surroundingWords = extractSurroundingWords(
        tokens,
        lemmas,
        keywords,
        tokenIndices,
        matchedWord,
        result.start,
        this.contextPrefixCount,
        this.contextSuffixCount,
      );

      // Combine with external context
      surroundingWords.push(...normalizedContext);

      // Find supportive context word
      const supportiveContextWord = findSupportiveWordInContext(
        surroundingWords,
        recognizer.context,
        this.contextMatchingMode,
      );

      if (supportiveContextWord !== "") {
        result.score += this.contextSimilarityFactor;
        result.score = Math.max(result.score, this.minScoreWithContextSimilarity);
        result.score = Math.min(result.score, ContextAwareEnhancer.MAX_SCORE);

        const explanation = result.analysisExplanation;
        if (explanation) {
          explanation.setSupportiveContextWord(supportiveContextWord);
          explanation.setImprovedScore(result.score);
        }
      }
    }

    return results;
  }
}

/* ------------------------------------------------------------------ */
/*  Pure helper functions                                              */
/* ------------------------------------------------------------------ */

/** Deep-copy a `RecognizerResult` so mutations don't affect originals. */
function deepCopyRecognizerResult(r: RecognizerResult): RecognizerResult {
  const copy = new RecognizerResult(
    r.entityType,
    r.start,
    r.end,
    r.score,
    r.analysisExplanation
      ? Object.assign(
          new AnalysisExplanation(
            r.analysisExplanation.recognizer,
            r.analysisExplanation.originalScore,
            r.analysisExplanation.patternName,
            r.analysisExplanation.pattern,
            r.analysisExplanation.validationResult,
            r.analysisExplanation.textualExplanation,
            r.analysisExplanation.regexFlags,
          ),
          r.analysisExplanation,
        )
      : null,
    r.recognitionMetadata ? { ...r.recognitionMetadata } : null,
  );
  return copy;
}

/** Build token data from NlpArtifacts or fall back to simple tokenizer. */
function buildTokenData(
  nlpArtifacts: NlpArtifacts,
  text: string,
): {
  tokens: string[];
  lemmas: string[];
  tokenIndices: number[];
  keywords: string[];
} {
  if (nlpArtifacts.tokens && nlpArtifacts.tokens.length > 0) {
    return {
      tokens: nlpArtifacts.tokens,
      lemmas: nlpArtifacts.lemmas,
      tokenIndices: nlpArtifacts.tokensIndices,
      keywords: nlpArtifacts.keywords,
    };
  }

  const allTokens = tokenizeText(text);
  return {
    tokens: allTokens.map((t) => t.token),
    lemmas: allTokens.map((t) => t.lemma),
    tokenIndices: allTokens.map((t) => t.index),
    keywords: allTokens
      .filter((t) => !isStopWord(t.token) && !isPunctuation(t.token))
      .map((t) => t.lemma),
  };
}

/** Extract surrounding context words near a matched entity. */
function extractSurroundingWords(
  tokens: string[],
  lemmas: string[],
  keywords: string[],
  tokenIndices: number[],
  word: string,
  start: number,
  prefixCount: number,
  suffixCount: number,
): string[] {
  if (tokens.length === 0) return [""];
  const i = findIndexOfMatchToken(word, start, tokens, tokenIndices);
  const keywordSet = new Set(keywords.map((k) => k.toLowerCase()));

  const backward = addNWords(i, prefixCount, lemmas, keywordSet, true);
  const forward = addNWords(i, suffixCount, lemmas, keywordSet, false);
  return [...new Set([...backward, ...forward])];
}

/** Find the token index that covers or is adjacent to `start`. */
function findIndexOfMatchToken(
  _word: string,
  start: number,
  tokens: string[],
  tokenIndices: number[],
): number {
  for (let i = 0; i < tokens.length; i++) {
    if (tokenIndices[i] === start || start < tokenIndices[i] + tokens[i].length) {
      return i;
    }
  }
  // Fallback: closest token
  let best = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < tokenIndices.length; i++) {
    const d = Math.abs(tokenIndices[i] - start);
    if (d < bestDist) {
      bestDist = d;
      best = i;
    }
  }
  return best;
}

/** Collect up to `nWords` context words before/after the index. */
function addNWords(
  index: number,
  nWords: number,
  lemmas: string[],
  keywordSet: Set<string>,
  isBackward: boolean,
): string[] {
  const ctx: string[] = [];
  let i = index;
  let remaining = nWords + 1;
  while (i >= 0 && i < lemmas.length && remaining > 0) {
    const lw = lemmas[i].toLowerCase();
    if (keywordSet.has(lw)) {
      ctx.push(lw);
      remaining--;
    }
    i = isBackward ? i - 1 : i + 1;
  }
  return ctx;
}

/**
 * Find a supportive context word by matching the context list
 * against the recognizer's context words.
 */
export function findSupportiveWordInContext(
  contextList: string[],
  recognizerContextList: string[],
  matchingMode: "substring" | "whole_word" = "substring",
): string {
  if (
    !contextList ||
    !recognizerContextList ||
    contextList.length === 0 ||
    recognizerContextList.length === 0
  ) {
    return "";
  }
  for (const predefined of recognizerContextList) {
    let found = false;
    if (matchingMode === "substring") {
      const lower = predefined.toLowerCase();
      found = contextList.some((kw) => kw.toLowerCase().includes(lower));
    } else {
      const lower = predefined.toLowerCase();
      found = contextList.some((kw) => kw.toLowerCase() === lower);
    }
    if (found) return predefined;
  }
  return "";
}
