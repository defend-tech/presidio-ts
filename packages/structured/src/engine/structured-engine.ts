import { AnalyzerEngine } from "@defend-tech/presidio-analyzer";
import { AnonymizerEngine } from "@defend-tech/presidio-anonymizer";
import type {
  StructuredAnalysisResult,
  StructuredAnonymizationResult,
  StructuredAnonymizeConfig,
  StructuredConfig,
} from "../entities.js";
import { AnalysisBuilder } from "./analysis-builder.js";

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

  /** Analyze and anonymize selected string cells without mutating input rows. */
  public async anonymize(
    rows: ReadonlyArray<Record<string, unknown>>,
    config: StructuredAnonymizeConfig = {},
  ): Promise<StructuredAnonymizationResult> {
    const analysis = await this.analyze(rows, config);
    const anonymizer = config.anonymizer ?? new AnonymizerEngine();
    const output = rows.map((row) => ({ ...row }));
    const columns: StructuredAnonymizationResult["columns"] = {};

    for (const [column, result] of Object.entries(analysis.columns)) {
      columns[column] = [];
      for (const cell of result.cells) {
        if (typeof cell.value !== "string" || cell.results.length === 0) {
          columns[column].push({ rowIndex: cell.rowIndex, value: cell.value });
          continue;
        }
        const anonymized = await anonymizer.anonymize(
          cell.value,
          cell.results,
          config.operators,
        );
        output[cell.rowIndex][column] = anonymized.text;
        columns[column].push({
          rowIndex: cell.rowIndex,
          value: cell.value,
          result: anonymized,
        });
      }
    }
    return { rows: output, columns };
  }

  private mergeConfig(config: StructuredConfig): StructuredConfig {
    return {
      ...this.defaultConfig,
      ...config,
      defaultAnalyzer:
        config.defaultAnalyzer ?? this.defaultConfig.defaultAnalyzer ?? this.analyzer,
    };
  }
}
