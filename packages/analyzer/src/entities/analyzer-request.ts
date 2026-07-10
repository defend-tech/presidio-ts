import { z } from "zod";
import { PatternRecognizer, Pattern } from "@presidio/core";

/**
 * Zod schema for an ad-hoc recognizer definition in an `AnalyzerRequest`.
 * Mirrors the Python `PatternRecognizer.from_dict` payload.
 */
export const AdHocRecognizerSchema = z.object({
  supported_entity: z.string().optional(),
  supportedEntity: z.string().optional(),
  name: z.string().nullable().optional(),
  supported_language: z.string().optional(),
  supportedLanguage: z.string().optional(),
  patterns: z.array(
    z.object({
      name: z.string(),
      regex: z.string(),
      score: z.number().min(0).max(1),
    }),
  ).optional(),
  deny_list: z.array(z.string()).optional(),
  denyList: z.array(z.string()).optional(),
  context: z.array(z.string()).optional(),
  deny_list_score: z.number().min(0).max(1).optional(),
  denyListScore: z.number().min(0).max(1).optional(),
  global_regex_flags: z.string().optional(),
  globalRegexFlags: z.string().optional(),
  version: z.string().optional(),
  country_code: z.string().nullable().optional(),
  countryCode: z.string().nullable().optional(),
});

/**
 * Zod schema for an `AnalyzerRequest`.
 * Port of `presidio_analyzer.AnalyzerRequest` with runtime validation.
 */
export const AnalyzerRequestSchema = z.object({
  text: z.string(),
  language: z.string(),
  entities: z.array(z.string()).optional(),
  correlation_id: z.string().optional(),
  correlationId: z.string().optional(),
  score_threshold: z.number().min(0).max(1).optional(),
  scoreThreshold: z.number().min(0).max(1).optional(),
  return_decision_process: z.boolean().optional(),
  returnDecisionProcess: z.boolean().optional(),
  ad_hoc_recognizers: z.array(AdHocRecognizerSchema).optional(),
  adHocRecognizers: z.array(AdHocRecognizerSchema).optional(),
  context: z.array(z.string()).optional(),
  allow_list: z.array(z.string()).optional(),
  allowList: z.array(z.string()).optional(),
  allow_list_match: z.union([z.literal("exact"), z.literal("regex")]).optional(),
  allowListMatch: z.union([z.literal("exact"), z.literal("regex")]).optional(),
  regex_flags: z.string().optional(),
  regexFlags: z.string().optional(),
});

/** Parsed AnalyzerRequest data. */
export interface AnalyzerRequestData {
  text: string;
  language: string;
  entities: string[] | undefined;
  correlationId: string | undefined;
  scoreThreshold: number | undefined;
  returnDecisionProcess: boolean | undefined;
  adHocRecognizers: PatternRecognizer[];
  context: string[] | undefined;
  allowList: string[] | undefined;
  allowListMatch: "exact" | "regex";
  regexFlags: string | undefined;
}

/**
 * Analyzer request data with validated fields.
 *
 * Port of `presidio_analyzer.AnalyzerRequest`.
 *
 * @example
 * ```ts
 * const req = new AnalyzerRequest({
 *   text: "My SSN is 123-45-6789",
 *   language: "en",
 *   entities: ["SSN"],
 * });
 * ```
 */
export class AnalyzerRequest {
  public readonly text: string;
  public readonly language: string;
  public readonly entities: string[] | undefined;
  public readonly correlationId: string | undefined;
  public readonly scoreThreshold: number | undefined;
  public readonly returnDecisionProcess: boolean | undefined;
  public readonly adHocRecognizers: PatternRecognizer[];
  public readonly context: string[] | undefined;
  public readonly allowList: string[] | undefined;
  public readonly allowListMatch: "exact" | "regex";
  public readonly regexFlags: string | undefined;

  constructor(rawData: Record<string, unknown>) {
    const parsed = AnalyzerRequestSchema.parse(rawData);

    this.text = parsed.text;
    this.language = parsed.language;
    this.entities = parsed.entities ?? undefined;
    this.correlationId = parsed.correlationId ?? parsed.correlation_id ?? undefined;
    this.scoreThreshold = parsed.scoreThreshold ?? parsed.score_threshold ?? undefined;
    this.returnDecisionProcess =
      parsed.returnDecisionProcess ?? parsed.return_decision_process ?? undefined;

    const rawAdHoc = parsed.adHocRecognizers ?? parsed.ad_hoc_recognizers ?? [];
    this.adHocRecognizers = rawAdHoc.map((raw) => createPatternRecognizerFromAdHoc(raw));

    this.context = parsed.context ?? undefined;
    this.allowList = parsed.allowList ?? parsed.allow_list ?? undefined;
    this.allowListMatch =
      (parsed.allowListMatch ?? parsed.allow_list_match ?? "exact") as "exact" | "regex";
    this.regexFlags = parsed.regexFlags ?? parsed.regex_flags ?? undefined;
  }

  /** Create from plain data. */
  static fromData(data: Record<string, unknown>): AnalyzerRequest {
    return new AnalyzerRequest(data);
  }
}

/** Deserialize an ad-hoc recognizer dict into a `PatternRecognizer`. */
function createPatternRecognizerFromAdHoc(
  raw: z.infer<typeof AdHocRecognizerSchema>,
): PatternRecognizer {
  const entity: string = raw.supportedEntity ?? (raw.supported_entity ?? "Unknown");
  const name: string | null = raw.name ?? null;
  const supportedLanguage: string = raw.supportedLanguage ?? (raw.supported_language ?? "en");
  const context: string[] | null = raw.context ?? null;
  const denyListScore: number = raw.denyListScore ?? (raw.deny_list_score ?? 1.0);
  const globalRegexFlags: string = raw.globalRegexFlags ?? (raw.global_regex_flags ?? "gmsi");
  const version: string = raw.version ?? "0.0.1";
  const countryCode: string | null = raw.countryCode ?? (raw.country_code ?? null);

  let patterns: Pattern[] | null = null;
  if (raw.patterns) {
    patterns = raw.patterns.map((p) => new Pattern(p.name, p.regex, p.score));
  }

  const denyList: string[] | null = raw.denyList ?? (raw.deny_list ?? null);

  return new PatternRecognizer(
    entity,
    name,
    supportedLanguage,
    patterns,
    denyList,
    context,
    denyListScore,
    globalRegexFlags,
    version,
    countryCode,
  );
}