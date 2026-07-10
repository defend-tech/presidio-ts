import { Pattern, PatternRecognizer } from "@defend-tech/presidio-core";

/**
 * Recognize dates using regex.
 *
 * Supports multiple common date formats including ISO 8601 datetimes,
 * US-style (mm/dd/yyyy), European-style (dd/mm/yyyy), dot-separated,
 * month-name formats, and partial date formats (month/year, month/day).
 */
export class DateRecognizer extends PatternRecognizer {
  /** Default date patterns covering common formats. */
  public static readonly PATTERNS: Pattern[] = [
    new Pattern(
      "Datetime (yyyy-mm-ddThh:mm[:ss[.f]] with timezone)",
      "\\b(?:(\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])T[0-2]\\d:[0-5]\\d:[0-5]\\d\\.\\d+([+-][0-2]\\d:[0-5]\\d|Z))|(\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])T[0-2]\\d:[0-5]\\d:[0-5]\\d([+-][0-2]\\d:[0-5]\\d|Z))|(\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])T[0-2]\\d:[0-5]\\d([+-][0-2]\\d:[0-5]\\d|Z)))\\b",
      0.8,
    ),
    new Pattern(
      "mm/dd/yyyy or mm/dd/yy",
      "\\b(([1-9]|0[1-9]|1[0-2])/([1-9]|0[1-9]|[1-2][0-9]|3[0-1])/(\\d{4}|\\d{2}))\\b",
      0.6,
    ),
    new Pattern(
      "dd/mm/yyyy or dd/mm/yy",
      "\\b(([1-9]|0[1-9]|[1-2][0-9]|3[0-1])/([1-9]|0[1-9]|1[0-2])/(\\d{4}|\\d{2}))\\b",
      0.6,
    ),
    new Pattern(
      "yyyy/mm/dd",
      "\\b(\\d{4}/([1-9]|0[1-9]|1[0-2])/([1-9]|0[1-9]|[1-2][0-9]|3[0-1]))\\b",
      0.6,
    ),
    new Pattern(
      "mm-dd-yyyy",
      "\\b(([1-9]|0[1-9]|1[0-2])-([1-9]|0[1-9]|[1-2][0-9]|3[0-1])-\\d{4})\\b",
      0.6,
    ),
    new Pattern(
      "dd-mm-yyyy",
      "\\b(([1-9]|0[1-9]|[1-2][0-9]|3[0-1])-([1-9]|0[1-9]|1[0-2])-\\d{4})\\b",
      0.6,
    ),
    new Pattern(
      "yyyy-mm-dd",
      "\\b(\\d{4}-([1-9]|0[1-9]|1[0-2])-([1-9]|0[1-9]|[1-2][0-9]|3[0-1]))\\b",
      0.6,
    ),
    new Pattern(
      "dd.mm.yyyy or dd.mm.yy",
      "\\b(([1-9]|0[1-9]|[1-2][0-9]|3[0-1])\\.([1-9]|0[1-9]|1[0-2])\\.(\\d{4}|\\d{2}))\\b",
      0.6,
    ),
    new Pattern(
      "dd-MMM-yyyy or dd-MMM-yy",
      "\\b(([1-9]|0[1-9]|[1-2][0-9]|3[0-1])-(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)-(\\d{4}|\\d{2}))\\b",
      0.6,
    ),
    new Pattern(
      "MMM-yyyy or MMM-yy",
      "\\b((JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)-(\\d{4}|\\d{2}))\\b",
      0.6,
    ),
    new Pattern(
      "dd-MMM or dd-MMM",
      "\\b(([1-9]|0[1-9]|[1-2][0-9]|3[0-1])-(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC))\\b",
      0.6,
    ),
    new Pattern("mm/yyyy or m/yyyy", "\\b(([1-9]|0[1-9]|1[0-2])/\\d{4})\\b", 0.2),
    new Pattern("mm/yy or m/yy", "\\b(([1-9]|0[1-9]|1[0-2])/\\d{2})\\b", 0.1),
  ];

  /** Context words that increase confidence in date detection. */
  public static readonly CONTEXT: string[] = ["date", "birthday"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supportedLanguage = "en",
    supportedEntity = "DATE_TIME",
    name: string | null = null,
  ) {
    super(
      supportedEntity,
      name,
      supportedLanguage,
      patterns ?? DateRecognizer.PATTERNS,
      null,
      context ?? DateRecognizer.CONTEXT,
    );
  }

  validateResult(patternText: string): boolean | null {
    const iso = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:T|$)/.exec(patternText);
    if (iso) return isCalendarDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));

    const numeric = /^(\d{1,2})[/. -](\d{1,2})[/. -](\d{2,4})$/.exec(patternText);
    if (!numeric) return null;
    const year = numeric[3].length === 2 ? 2000 + Number(numeric[3]) : Number(numeric[3]);
    const first = Number(numeric[1]);
    const second = Number(numeric[2]);
    // Ambiguous numeric dates are valid when either US or day-first order is valid.
    return isCalendarDate(year, first, second) || isCalendarDate(year, second, first);
  }
}

function isCalendarDate(year: number, month: number, day: number): boolean {
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
