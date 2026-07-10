import { AnalyzerEngine } from "@presidio/analyzer";
import type {
  ColumnAnalysisResult,
  ColumnConfig,
  StructuredAnalysisResult,
  StructuredConfig,
} from "../entities.js";

/** Builds column-level PII analysis from a bounded sample of structured rows. */
export class AnalysisBuilder {
  private readonly analyzer: AnalyzerEngine;

  constructor(analyzer = new AnalyzerEngine()) {
    this.analyzer = analyzer;
  }

  public async build(
    rows: ReadonlyArray<Record<string, unknown>>,
    config: StructuredConfig = {},
  ): Promise<StructuredAnalysisResult> {
    const columns = config.columns ?? inferColumns(rows);
    const sampleSize = config.sampleSize ?? rows.length;
    const result: StructuredAnalysisResult = { columns: {} };

    for (const column of columns) {
      const analyzer = column.analyzer ?? config.defaultAnalyzer ?? this.analyzer;
      const cells: ColumnAnalysisResult["cells"] = [];
      const entityCounts: Record<string, number> = {};
      let sampled = 0;

      for (let rowIndex = 0; rowIndex < rows.length && sampled < sampleSize; rowIndex += 1) {
        const value = rows[rowIndex][column.name];
        if (value === null || value === undefined || value === "") continue;

        sampled += 1;
        const results = await analyzer.analyze(String(value), column.language ?? config.language ?? "en", {
          ...column.analyzerOptions,
          entities: column.entities,
          context: column.context,
        });
        for (const analysis of results) {
          entityCounts[analysis.entityType] = (entityCounts[analysis.entityType] ?? 0) + 1;
        }
        cells.push({ rowIndex, value, results });
      }

      result.columns[column.name] = {
        column: column.name,
        cells,
        entityCounts,
        entityType: mostCommonEntity(entityCounts),
      };
    }

    return result;
  }
}

function inferColumns(rows: ReadonlyArray<Record<string, unknown>>): ColumnConfig[] {
  const names = new Set<string>();
  for (const row of rows) {
    for (const name of Object.keys(row)) names.add(name);
  }
  return [...names].map((name) => ({ name }));
}

function mostCommonEntity(counts: Record<string, number>): string | undefined {
  let entityType: string | undefined;
  let count = -1;
  for (const [entity, currentCount] of Object.entries(counts)) {
    if (currentCount > count) {
      entityType = entity;
      count = currentCount;
    }
  }
  return entityType;
}
