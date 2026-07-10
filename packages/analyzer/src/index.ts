/**
 * @defend-tech/presidio-analyzer — Presidio PII analyzer engine and recognizers.
 *
 * TypeScript port of the Python `presidio_analyzer` package.
 */

// ——— Registry ———
export { RecognizerRegistry, createRecognizerRegistry } from "./registry/index.js";
export type { RecognizerRegistryOptions } from "./registry/index.js";

// ——— NLP ———
export { NlpEngine } from "./nlp/index.js";

// ——— Context-aware enhancers ———
export { ContextAwareEnhancer } from "./context/index.js";
export { LemmaContextAwareEnhancer } from "./context/index.js";

// ——— Engines ———
export { AnalyzerEngine } from "./engine/index.js";
export type {
  AnalyzerEngineOptions,
  AnalyzeOptions,
  AllowListMatch,
} from "./engine/index.js";
export { BatchAnalyzerEngine, DictAnalyzerResult } from "./engine/index.js";
export type { DictValue, DictNestedResults } from "./engine/index.js";

// --- Bounded-text chunkers ---
export {
  BaseTextChunker,
  CharacterBasedTextChunker,
  TextChunkerProvider,
} from "./chunkers/text-chunker.js";
export type { TextChunk, TextChunkerConfig } from "./chunkers/text-chunker.js";

// ——— Entities ———
export { AnalyzerRequest } from "./entities/index.js";
export type { AnalyzerRequestData } from "./entities/index.js";
export { AnalyzerRequestSchema, AdHocRecognizerSchema } from "./entities/index.js";

// ——— Generic recognizers ———
export * from "./recognizers/generic/index.js";

// Country recognizers are available for opt-in imports and default loading.
export * from "./recognizers/country/index.js";
