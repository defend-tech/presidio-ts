import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./generate-country-recognizers.mjs", import.meta.url),
  "utf8",
);
const functionsOnly = `${source.split("// --- MAIN ---")[0]}\nexport { parsePatterns };`;
const moduleUrl = `data:text/javascript;base64,${Buffer.from(functionsOnly).toString("base64")}`;
const { parsePatterns } = await import(moduleUrl);

test("parsePatterns preserves backslashes in generated TypeScript pattern names", () => {
  const patternBlock = [String.raw`PATTERNS = [Pattern("path\\label", r"\d+", 0.5)]`];

  assert.equal(
    parsePatterns(patternBlock),
    String.raw`        new Pattern("path\\\\label", "\\d+", 0.5)`,
  );
});
