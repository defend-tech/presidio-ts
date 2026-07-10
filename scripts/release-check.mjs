import { execFileSync } from "node:child_process";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const packages = [
  "core",
  "analyzer",
  "anonymizer",
  "image-redactor",
  "structured",
  "cli",
];
const temp = mkdtempSync(join(tmpdir(), "presidio-ts-release-"));
const run = (command, args, cwd = root) =>
  execFileSync(command, args, { cwd, stdio: "inherit" });

try {
  for (const name of packages)
    run("npm", ["pack", "--dry-run"], join(root, "packages", name));
  for (const name of packages)
    run("npm", ["pack", "--pack-destination", temp], join(root, "packages", name));

  const tarballs = readdirSync(temp).map((file) => join(temp, file));
  for (const tarball of tarballs) {
    const contents = execFileSync("tar", ["-tzf", tarball], { encoding: "utf8" });
    if (!contents.split("\n").includes("package/LICENSE")) {
      throw new Error(`Packed tarball is missing LICENSE: ${tarball}`);
    }
  }
  const consumer = join(temp, "consumer");
  mkdirSync(consumer);
  run("npm", ["init", "--yes"], consumer);
  run("npm", ["install", ...tarballs], consumer);
  run(
    "node",
    [
      "--input-type=module",
      "-e",
      [
        'import { AnalyzerEngine } from "@defend-tech/presidio-analyzer";',
        'import { AnonymizerEngine, RecognizerResult } from "@defend-tech/presidio-anonymizer";',
        'const text = "Email me@example.com";',
        'const found = await new AnalyzerEngine().analyze(text, "en");',
        'if (!found.length) throw new Error("analysis found no PII");',
        "const results = found.map((r) => new RecognizerResult(r.entityType, r.start, r.end, r.score));",
        "const output = await new AnonymizerEngine().anonymize(text, results);",
        'if (!output.text.includes("<EMAIL_ADDRESS>")) throw new Error("anonymization failed");',
      ].join(""),
    ],
    consumer,
  );
  run(
    "node",
    ["-e", packages.map((name) => `require("@defend-tech/presidio-${name}");`).join("")],
    consumer,
  );
  run(join(consumer, "node_modules", ".bin", "presidio"), ["--version"], consumer);
  run(
    join(consumer, "node_modules", ".bin", "presidio"),
    ["analyze", "--text", "me@example.com"],
    consumer,
  );
  const mv3 = join(temp, "mv3");
  cpSync(join(root, "fixtures", "mv3"), mv3, { recursive: true });
  run("npm", ["install", "--no-save", ...tarballs], mv3);
  run("npm", ["run", "build"], mv3);
  const manifest = JSON.parse(readFileSync(join(mv3, "dist", "manifest.json"), "utf8"));
  if (manifest.background?.service_worker !== "service-worker.js") {
    throw new Error("MV3 manifest does not reference the built service worker");
  }
  run(
    join(consumer, "node_modules", ".bin", "presidio"),
    ["anonymize", "--text", "me@example.com"],
    consumer,
  );
} finally {
  rmSync(temp, { recursive: true, force: true });
}
