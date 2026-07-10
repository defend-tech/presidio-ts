#!/usr/bin/env node
/**
 * Line-based Python→TS country recognizer converter.
 * Reads Python files line by line to extract PATTERNS, CONTEXT, and metadata.
 */
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BASE = "/home/staticduo/defend.tech/git/presidio-ts";
const PY_ROOT = join(
  BASE,
  "presidio-analyzer/presidio_analyzer/predefined_recognizers/country_specific",
);
const TS_ROOT = join(BASE, "packages/analyzer/src/recognizers/country");

function escapeForTSString(s) {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n");
}

function parsePatterns(lineBlock) {
  // Join lines, find Pattern("name", r"regex", score,) entries
  const joined = lineBlock.join(" ");
  const results = [];

  // Find each Pattern( ... ) call
  let idx = 0;
  while (idx < joined.length) {
    const pi = joined.indexOf("Pattern(", idx);
    if (pi === -1) break;

    // Find matching ) with bracket counting
    // Start depth at 1 because we're already past Pattern(
    let depth = 1;
    let inStr = false;
    let strChar = null;
    let end = -1;
    for (let i = pi + "Pattern(".length; i < joined.length; i++) {
      const c = joined[i];
      if (!inStr) {
        if (c === '"' || c === "'") {
          inStr = true;
          strChar = c;
          continue;
        }
        if (c === "(") depth++;
        if (c === ")") {
          depth--;
          if (depth === 0) {
            end = i;
            break;
          }
        }
      } else {
        if (c === strChar && joined[i - 1] !== "\\") inStr = false;
      }
    }
    if (end === -1) break;

    const call = joined.slice(pi + "Pattern(".length, end);

    // Extract quoted strings
    const strings = [];
    let si = 0;
    while (si < call.length) {
      const qi = call.indexOf('"', si);
      if (qi === -1) break;
      let ei = qi + 1;
      while (ei < call.length && !(call[ei] === '"' && call[ei - 1] !== "\\")) ei++;
      if (ei < call.length) strings.push(call.slice(qi + 1, ei));
      si = ei + 1;
    }

    // Extract score (number at end before trailing comma/whitespace)
    const scoreMatch = call.match(/(,\s*)(\d+\.?\d*)\s*$/);
    const score = scoreMatch ? Number.parseFloat(scoreMatch[2]) : 0.05;

    if (strings.length >= 2 && scoreMatch) {
      const name = strings[0].replace(/"/g, '\\"');
      const regex = strings[1].replace(/\\/g, "\\\\").replace(/"/g, '\\"');
      results.push(`        new Pattern("${name}", "${regex}", ${score})`);
    }

    idx = end + 1;
  }

  return results.join(",\n");
}

function extractContext(content) {
  const lines = content.split("\n");
  let inContext = false;
  const ctxStrings = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("CONTEXT = [")) {
      inContext = true;
      // Check if context is on one line
      if (trimmed.includes("]")) {
        inContext = false;
        const matches = trimmed.matchAll(/"([^"]*)"/g);
        for (const m of matches) ctxStrings.push(`"${m[1]}"`);
      }
      continue;
    }
    if (inContext) {
      if (trimmed === "])" || trimmed === "]") {
        inContext = false;
        continue;
      }
      if (trimmed.startsWith("#")) continue;
      const matches = [...trimmed.matchAll(/"([^"]*)"/g)];
      for (const m of matches) ctxStrings.push(`"${m[1]}"`);
    }
  }
  return `[${ctxStrings.join(", ")}]`;
}

function extractMeta(content) {
  const classMatch = content.match(/^\s*(?:class)\s+(\w+)/m);
  const countryMatch = content.match(/COUNTRY_CODE\s*=\s*"([^"]+)"/);
  const entityMatch = content.match(/supported_entity\s*:\s*str\s*=\s*"([^"]+)"/);
  const nameMatch = content.match(/name\s*:\s*Optional\[str\]\s*=\s*"([^"]+)"/);

  return {
    className: classMatch?.[1] || "Unknown",
    countryCode: countryMatch?.[1] || "unknown",
    entityType: entityMatch?.[1] || classMatch?.[1] || "UNKNOWN",
    defaultName: nameMatch?.[1] || null,
  };
}

function extractValidationMethods(content) {
  const methods = {};
  for (const methodName of ["validate_result", "invalidate_result"]) {
    const lines = content.split("\n");
    const methodLines = [];
    let capture = false;
    const classIndent = 4; // class methods are at 4 spaces

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes(`def ${methodName}(`)) {
        capture = true;
        continue;
      }
      if (capture) {
        // Stop at next method/class/attribute
        const trimmed = line.trim();
        if (!trimmed || !line[0] || (line[0] !== " " && line[0] !== "\t")) {
          capture = false;
          break;
        }
        // Check if this is a new method at class level (4-space indent)
        const lineIndent = line.match(/^(\s*)/)[1].length;
        if (
          lineIndent <= classIndent &&
          trimmed &&
          !trimmed.startsWith('"') &&
          !trimmed.startsWith("#")
        ) {
          if (
            trimmed.startsWith("def ") ||
            trimmed.startsWith("class ") ||
            trimmed.match(/^[A-Z_]+\s*=/)
          ) {
            capture = false;
            break;
          }
        }
        // Remove docstrings
        if (trimmed.startsWith('"""') || trimmed.startsWith("'''")) continue;
        if (trimmed === '"""') {
          capture = false;
          continue;
        }

        methodLines.push(line.trim());
      }
    }

    if (methodLines.length > 0) {
      methods[methodName] = methodLines.join("\n");
    }
  }
  return methods;
}

// --- MAIN ---
const dirs = readdirSync(PY_ROOT).filter(
  (d) => !d.startsWith("__") && !d.startsWith(".") && !d.includes("."),
);
let total = 0;

for (const dir of dirs) {
  const pyDir = join(PY_ROOT, dir);
  const tsDir = join(TS_ROOT, dir);

  try {
    readdirSync(pyDir);
  } catch {
    continue;
  }

  const pyFiles = readdirSync(pyDir).filter(
    (f) => f.endsWith(".py") && !f.startsWith("__"),
  );
  const exports = [];

  for (const pyFile of pyFiles) {
    const content = readFileSync(join(pyDir, pyFile), "utf8");
    const meta = extractMeta(content);
    const contextArr = extractContext(content);

    // Extract patterns by finding PATTERNS block lines
    const lines = content.split("\n");
    let patternLines = [];
    let inPatterns = false;
    const classIndent = 4;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      if (trimmed.startsWith("PATTERNS = [")) {
        inPatterns = true;
        // Check if single-line
        if (trimmed.includes("])") || (trimmed.endsWith("]") && !trimmed.includes("["))) {
          inPatterns = false;
          patternLines = [trimmed];
        } else {
          patternLines = [trimmed];
        }
        continue;
      }

      if (inPatterns) {
        const lineIndent = line.match(/^(\s*)/)[1].length;
        if (trimmed === "]" && lineIndent <= classIndent) {
          inPatterns = false;
          patternLines.push(trimmed);
          break;
        }
        patternLines.push(line);
      }
    }

    const patterns = parsePatterns(patternLines);

    // Extract validation methods
    const validation = extractValidationMethods(content);

    const tsFilename = pyFile.replace(".py", ".ts");

    const defaultNameLine = meta.defaultName
      ? `    name: string | null = "${meta.defaultName}",`
      : "    name: string | null = null,";

    let validationCode = "";
    if (Object.keys(validation).length > 0) {
      validationCode = "  // FIXME: Manual port required — Python source:";
      for (const [name, body] of Object.entries(validation)) {
        const cleanBody = body
          .split("\n")
          .filter((l) => l.trim())
          .slice(0, 25)
          .join("\n  ");
        validationCode += `\n  /* ${name}:\n  ${cleanBody}${body.split("\n").filter((l) => l.trim()).length > 25 ? "\n  ...truncated" : ""}\n   */`;
      }
    }

    const ts = `import { Pattern, PatternRecognizer } from "@presidio/core";

/** ${meta.entityType} recognizer for ${meta.countryCode.toUpperCase()} region. */
export class ${meta.className} extends PatternRecognizer {
  static override readonly COUNTRY_CODE = "${meta.countryCode}";

  static readonly PATTERNS = [
${patterns}
  ];

  static readonly CONTEXT = ${contextArr};

  constructor(
    patterns: Pattern[] | null = null,
    context: string[] | null = null,
    supported_language: string = "en",
    supported_entity: string = "${meta.entityType}",
${defaultNameLine}
  ) {
    super(
      supported_entity,
      name,
      supported_language,
      patterns ?? ${meta.className}.PATTERNS,
      undefined,
      context ?? ${meta.className}.CONTEXT,
    );
  }
${validationCode}
}
`;
    writeFileSync(join(tsDir, tsFilename), ts);
    exports.push(
      `export { ${meta.className} } from "./${tsFilename.replace(".ts", "")}";`,
    );
    total++;
  }

  writeFileSync(join(tsDir, "index.ts"), `${exports.join("\n")}\n`);
}

console.log(`Generated ${total} TS files for ${dirs.length} countries.`);
