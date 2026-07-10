#!/usr/bin/env node
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const TS_ROOT = "/home/staticduo/defend.tech/git/presidio-ts/packages/analyzer/src/recognizers/country";

const dirs = readdirSync(TS_ROOT).filter(d => !d.startsWith(".") && d !== "index.ts");

for (const dir of dirs) {
  const dirPath = join(TS_ROOT, dir);
  const files = readdirSync(dirPath).filter(f => f.endsWith(".ts") && f !== "index.ts");

  const exports = [];
  for (const file of files) {
    const content = readFileSync(join(dirPath, file), "utf8");
    const match = content.match(/export class (\w+)/);
    if (match) {
      exports.push(`export { ${match[1]} } from "./${file.replace(".js", "")}";`);
    }
  }

  writeFileSync(join(dirPath, "index.ts"), exports.join("\n") + "\n");
}

console.log(`Regenerated index.ts for ${dirs.length} countries.`);