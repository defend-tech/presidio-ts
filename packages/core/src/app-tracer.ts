/**
 * AppTracer is used to trace the logic used during analysis requests
 * for interpretability reasons.
 */
export class AppTracer {
  trace(correlationId: string | null, message: string): void {
    // In production, this could log to a tracing system
    if (correlationId) {
      console.debug(`[${correlationId}] ${message}`);
    }
  }
}
