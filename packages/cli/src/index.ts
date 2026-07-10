import { AnalyzerEngine, RecognizerRegistry } from "@defend-tech/presidio-analyzer";
import {
  AnonymizerEngine,
  RecognizerResult as AnonymizerRecognizerResult,
} from "@defend-tech/presidio-anonymizer";
import packageManifest from "../package.json";
import type { AnalysisResult, AnonymizationResult, CliDependencies } from "./program.js";

export { runCli } from "./program.js";
export type {
  AnalysisResult,
  AnonymizationResult,
  CliDependencies,
  CliIo,
} from "./program.js";

function packageVersion(): string {
  return packageManifest.version;
}

async function analyze(text: string, language: string): Promise<AnalysisResult[]> {
  const registry = new RecognizerRegistry(undefined, undefined, [language]);
  registry.loadPredefinedRecognizers([language]);
  const engine = new AnalyzerEngine({ registry, supportedLanguages: [language] });
  const originalDebug = console.debug;
  console.debug = () => undefined;
  let results: AnalysisResult[];
  try {
    results = await engine.analyze(text, language);
  } finally {
    console.debug = originalDebug;
  }

  return results.map(({ entityType, start, end, score }) => ({
    entityType,
    start,
    end,
    score,
  }));
}

async function anonymize(text: string, language: string): Promise<AnonymizationResult> {
  const analysisResults = await analyze(text, language);
  const anonymizerResults = analysisResults.map(
    (result) =>
      new AnonymizerRecognizerResult(
        result.entityType,
        result.start,
        result.end,
        result.score,
      ),
  );
  const result = await new AnonymizerEngine().anonymize(text, anonymizerResults);

  return {
    text: result.text,
    items: result.items.map(({ entityType, start, end, text: itemText, operator }) => ({
      entityType,
      start,
      end,
      text: itemText,
      operator,
    })),
  };
}

export function createCliDependencies(): CliDependencies {
  return { version: packageVersion(), analyze, anonymize };
}
