import { ConflictResolutionStrategy } from "../entities/conflict-resolution.js";
import type { EngineResult } from "../entities/engine-result.js";
import { OperatorConfig } from "../entities/operator-config.js";
import { RecognizerResult } from "../entities/recognizer-result.js";
import { OperatorType } from "../operators/operator-type.js";
import type { Operator } from "../operators/operator.js";
import { EngineBase } from "./engine-base.js";

const DEFAULT = "replace";

/** Handles the entire Presidio anonymization flow. */
export class AnonymizerEngine extends EngineBase {
  async anonymize(
    text: string,
    analyzerResults: RecognizerResult[],
    operators: Record<string, OperatorConfig> | null = null,
    conflictResolution: ConflictResolutionStrategy = ConflictResolutionStrategy.MERGE_SIMILAR_OR_CONTAINED,
    mergeEntitiesWithSpaces: boolean = true,
  ): Promise<EngineResult> {
    let results = this.copyRecognizerResults(analyzerResults);
    results.sort((a, b) => a.start - b.start || a.end - b.end);
    results = this.removeConflictsAndGetTextManipulationData(results, conflictResolution);

    const mergedResults = mergeEntitiesWithSpaces
      ? this.mergeEntitiesWithSpacesBetween(text, results)
      : results;

    return this.operate(
      text,
      mergedResults,
      this.checkOrAddDefaultOperator(operators),
      OperatorType.Anonymize,
    );
  }

  addAnonymizer(name: string, anonymizer: new () => Operator): void {
    this.operatorsFactory.addAnonymizeOperator(name, anonymizer);
  }

  removeAnonymizer(name: string): void {
    this.operatorsFactory.removeAnonymizeOperator(name);
  }

  getAnonymizers(): string[] {
    return [...this.operatorsFactory.getAnonymizers().keys()];
  }

  private removeConflictsAndGetTextManipulationData(
    analyzerResults: RecognizerResult[],
    conflictResolution: ConflictResolutionStrategy,
  ): RecognizerResult[] {
    const tmpAnalyzerResults: RecognizerResult[] = [];
    let otherElements = [...analyzerResults];

    for (const result of analyzerResults) {
      otherElements = otherElements.filter((item) => item !== result);
      let isMergeSameEntityType = false;

      for (const otherElement of otherElements) {
        if (otherElement.entityType !== result.entityType) continue;
        if (result.intersects(otherElement) === 0) continue;

        otherElement.start = Math.min(result.start, otherElement.start);
        otherElement.end = Math.max(result.end, otherElement.end);
        otherElement.score = Math.max(result.score, otherElement.score);
        isMergeSameEntityType = true;
        break;
      }

      if (!isMergeSameEntityType) {
        otherElements.push(result);
        tmpAnalyzerResults.push(result);
      }
    }

    const uniqueElements: RecognizerResult[] = [];
    otherElements = [...tmpAnalyzerResults];

    for (const result of tmpAnalyzerResults) {
      otherElements = otherElements.filter((item) => item !== result);
      const conflicted = otherElements.some((other) => result.hasConflict(other));
      if (!conflicted) {
        otherElements.push(result);
        uniqueElements.push(result);
      }
    }

    if (conflictResolution === ConflictResolutionStrategy.REMOVE_INTERSECTIONS) {
      return this.removeIntersections(uniqueElements);
    }

    return uniqueElements;
  }

  private removeIntersections(elements: RecognizerResult[]): RecognizerResult[] {
    const sorted = [...elements].sort((a, b) => a.start - b.start);
    let index = 0;
    while (index < sorted.length - 1) {
      const current = sorted[index];
      const next = sorted[index + 1];
      if (current.end <= next.start) {
        index += 1;
      } else {
        if (current.score >= next.score) next.start = current.end;
        else current.end = next.start;
        sorted.sort((a, b) => a.start - b.start);
      }
    }
    return sorted.filter((element) => element.start <= element.end);
  }

  private mergeEntitiesWithSpacesBetween(
    text: string,
    analyzerResults: RecognizerResult[],
  ): RecognizerResult[] {
    const mergedResults: RecognizerResult[] = [];
    let prevResult: RecognizerResult | null = null;
    for (const result of analyzerResults) {
      if (prevResult !== null && prevResult.entityType === result.entityType) {
        if (/^( )+$/.test(text.slice(prevResult.end, result.start))) {
          const prevIndex = mergedResults.indexOf(prevResult);
          if (prevIndex >= 0) mergedResults.splice(prevIndex, 1);
          result.start = prevResult.start;
        }
      }
      mergedResults.push(result);
      prevResult = result;
    }
    return mergedResults;
  }

  private checkOrAddDefaultOperator(
    operators: Record<string, OperatorConfig> | null,
  ): Record<string, OperatorConfig> {
    const defaultOperator = new OperatorConfig(DEFAULT);
    if (!operators) return { DEFAULT: defaultOperator };
    if (!operators.DEFAULT) operators.DEFAULT = defaultOperator;
    return operators;
  }

  private copyRecognizerResults(analyzerResults: RecognizerResult[]): RecognizerResult[] {
    return analyzerResults.map(
      (result) => new RecognizerResult(result.entityType, result.start, result.end, result.score),
    );
  }
}
