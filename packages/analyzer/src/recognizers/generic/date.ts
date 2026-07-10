import { Pattern, PatternRecognizer } from "@presidio/core";

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
    new Pattern(
      "mm/yyyy or m/yyyy",
      "\\b(([1-9]|0[1-9]|1[0-2])/\\d{4})\\b",
      0.2,
    ),
    new Pattern(
      "mm/yy or m/yy",
      "\\b(([1-9]|0[1-9]|1[0-2])/\\d{2})\\b",
      0.1,
    ),
  ];

  /** Context words that increase confidence in date detection. */
  public static readonly CONTEXT: string[] = ["date", "birthday"];

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supportedLanguage: string = "en",
    supportedEntity: string = "DATE_TIME",
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
}