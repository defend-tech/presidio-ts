/** Parse a CSV string into rows without requiring a runtime dependency. */
export function readCsv(input: string): Record<string, unknown>[] {
  const records = parseCsv(input);
  if (records.length === 0) return [];

  const [headers, ...values] = records;
  return values
    .filter((row) => row.some((value) => value !== ""))
    .map((row) =>
      Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])),
    );
}

function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    if (char === '"') {
      if (quoted && input[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && input[index + 1] === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  if (quoted) throw new Error("Invalid CSV: unterminated quoted field");
  if (value !== "" || row.length > 0) {
    row.push(value);
    rows.push(row);
  }
  return rows;
}
