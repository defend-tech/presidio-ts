/**
 * Strategy for handling conflicts between overlapping entity detections.
 */
export enum ConflictResolutionStrategy {
  /** Merge overlapping entities of the same type, remove contained entities */
  MERGE_SIMILAR_OR_CONTAINED = "MERGE_SIMILAR_OR_CONTAINED",
  /** Trim overlapping entities so they don't intersect */
  REMOVE_INTERSECTIONS = "REMOVE_INTERSECTIONS",
}
