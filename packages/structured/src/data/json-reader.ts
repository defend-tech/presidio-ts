/** Parse a JSON array, or a single JSON object, into structured rows. */
export function readJson(input: string | unknown): Record<string, unknown>[] {
  const value: unknown = typeof input === "string" ? JSON.parse(input) : input;
  if (Array.isArray(value)) {
    if (!value.every(isRecord)) throw new Error("JSON arrays must contain objects");
    return value;
  }
  if (isRecord(value)) return [value];
  throw new Error("JSON input must be an object or an array of objects");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
