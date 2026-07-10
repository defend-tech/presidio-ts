import { EntityRecognizer } from "./entity-recognizer.js";

/**
 * PII entity recognizer which runs on the same process as the AnalyzerEngine.
 * This is a marker class that indicates the recognizer is local (not remote).
 */
export abstract class LocalRecognizer extends EntityRecognizer {}
