import { AnalyzerEngine } from "@presidio/analyzer";
import { AnalysisBuilder } from "./analysis-builder.js";
import type { StructuredAnalysisResult, StructuredConfig } from "../entities.js";

/** Detects PII in native JavaScript tabular data. */
export class StructuredEngine {
  private readonly analyzer: AnalyzerEngine;
  private readonly defaultConfig: StructuredConfig;

  constructor(config: StructuredConfig = {}) {
    this.defaultConfig = config;
    this.analyzer = config.defaultAnalyzer ?? new AnalyzerEngine();
  }

  /** Analyze every non-empty cell in the selected columns. */
  public async analyze(
    rows: ReadonlyArray<Record<string, unknown>>,
    config: StructuredConfig = {},
  ): Promise<StructuredAnalysisResult> {
    return new AnalysisBuilder(this.analyzer).build(rows, this.mergeConfig(config));
  }

  /** Analyze a configured sample of values per column before processing full data. */
  public async pre_build_analysis(
    rows: ReadonlyArray<Record<string, unknown>>,
    config: StructuredConfig = {},
  ): Promise<StructuredAnalysisResult> {
    return new AnalysisBuilder(this.analyzer).build(rows, this.mergeConfig(config));
  }

  /** Camel-case alias for TypeScript callers. */
  public preBuildAnalysis(
    rows: ReadonlyArray<Record<string, unknown>>,
    config: StructuredConfig = {},
  ): Promise<StructuredAnalysisResult> {
    return this.pre_build_analysis(rows, config);
  }

  private mergeConfig(config: StructuredConfig): StructuredConfig {
    return {
      ...this.defaultConfig,
      ...config,
      defaultAnalyzer: config.defaultAnalyzer ?? this.defaultConfig.defaultAnalyzer ?? this.analyzer,
    };
  }
}
