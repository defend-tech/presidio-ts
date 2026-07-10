import { RecognizerResult } from "@defend-tech/presidio-core";

export interface TextChunk {
  text: string;
  start: number;
  end: number;
}

export abstract class BaseTextChunker {
  abstract chunk(text: string): TextChunk[];

  predictWithChunking(
    text: string,
    predict: (chunk: string) => RecognizerResult[],
    overlapThreshold = 0.5,
  ): RecognizerResult[] {
    const chunks = this.chunk(text);
    if (chunks.length === 0) return [];
    if (chunks.length === 1) return predict(text);

    const predictions = chunks.flatMap(({ text: chunkText, start }) =>
      predict(chunkText).map(
        (prediction) =>
          new RecognizerResult(
            prediction.entityType,
            prediction.start + start,
            prediction.end + start,
            prediction.score,
            prediction.analysisExplanation,
            prediction.recognitionMetadata,
          ),
      ),
    );
    return this.deduplicateOverlappingEntities(predictions, overlapThreshold);
  }

  deduplicateOverlappingEntities(
    predictions: RecognizerResult[],
    overlapThreshold = 0.5,
  ): RecognizerResult[] {
    const unique: RecognizerResult[] = [];
    for (const prediction of [...predictions].sort((a, b) => b.score - a.score)) {
      const duplicate = unique.some((kept) => {
        if (prediction.entityType !== kept.entityType) return false;
        const overlap =
          Math.min(prediction.end, kept.end) - Math.max(prediction.start, kept.start);
        return (
          overlap > 0 &&
          overlap / Math.min(prediction.end - prediction.start, kept.end - kept.start) >
            overlapThreshold
        );
      });
      if (!duplicate) unique.push(prediction);
    }
    return unique.sort((a, b) => a.start - b.start);
  }
}

export class CharacterBasedTextChunker extends BaseTextChunker {
  public readonly boundaryChars: readonly string[];

  constructor(
    public readonly chunkSize = 250,
    public readonly chunkOverlap = 50,
    boundaryChars: Iterable<string> = [" ", "\n"],
  ) {
    super();
    if (chunkSize <= 0) throw new Error("chunk_size must be greater than 0");
    if (chunkOverlap < 0 || chunkOverlap >= chunkSize) {
      throw new Error("chunk_overlap must be non-negative and less than chunk_size");
    }
    this.boundaryChars = [...boundaryChars];
  }

  chunk(text: string): TextChunk[] {
    if (!text) return [];
    const chunks: TextChunk[] = [];
    let start = 0;
    while (start < text.length) {
      let end = Math.min(start + this.chunkSize, text.length);
      while (end < text.length && !this.boundaryChars.includes(text[end])) end += 1;
      chunks.push({ text: text.slice(start, end), start, end });
      if (end >= text.length) break;
      start = end - this.chunkOverlap;
    }
    return chunks;
  }
}

export interface TextChunkerConfig {
  chunkerType?: "character";
  chunkSize?: number;
  chunkOverlap?: number;
  boundaryChars?: Iterable<string>;
}

export class TextChunkerProvider {
  constructor(private readonly configuration: TextChunkerConfig = {}) {}

  createChunker(): BaseTextChunker {
    if (
      this.configuration.chunkerType &&
      this.configuration.chunkerType !== "character"
    ) {
      throw new Error(
        `Unknown chunker_type '${this.configuration.chunkerType}'. Available: character`,
      );
    }
    return new CharacterBasedTextChunker(
      this.configuration.chunkSize ?? 250,
      this.configuration.chunkOverlap ?? 50,
      this.configuration.boundaryChars,
    );
  }
}
