import type { AnalyzerEngine, AnalyzeOptions } from "@presidio/analyzer";
import type { RecognizerResult } from "@presidio/core";

/** Per-column analyzer settings for structured data. */
export interface ColumnConfig {
  /** Key used in every input row. */
  name: string;
  /** Limit detection to these Presidio entity types. */
  entities?: string[];
  /** Override the configured language for this column. */
  language?: string;
  /** Extra context supplied to Presidio recognizers. */
  context?: string[];
  /** Override the analyzer used for this column. */
  analyzer?: AnalyzerEngine;
  /** Additional options forwarded to `AnalyzerEngine.analyze`. */
  analyzerOptions?: Omit<AnalyzeOptions, "entities" | "context">;
}

/** Configuration used to analyze an array of structured rows. */
export interface StructuredConfig {
  /** Columns to analyze. When omitted, columns are inferred from the input rows. */
  columns?: ColumnConfig[];
  /** Analyzer used unless a column defines its own analyzer. */
  defaultAnalyzer?: AnalyzerEngine;
  /** Default language for all columns. */
  language?: string;
  /** Maximum non-empty values sampled from each column during pre-build analysis. */
  sampleSize?: number;
}

/** PII results for one input value. */
export interface CellAnalysisResult {
  rowIndex: number;
  value: unknown;
  results: RecognizerResult[];
}

/** PII analysis and inferred entity distribution for one column. */
export interface ColumnAnalysisResult {
  column: string;
  cells: CellAnalysisResult[];
  /** Number of detections grouped by entity type. */
  entityCounts: Record<string, number>;
  /** Most frequently detected entity type, if the column contains PII. */
  entityType?: string;
}

/** Structured PII analysis grouped by column. */
export interface StructuredAnalysisResult {
  columns: Record<string, ColumnAnalysisResult>;
}
