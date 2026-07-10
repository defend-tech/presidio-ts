#!/usr/bin/env node
import { createCliDependencies, runCli } from "./index.js";

export async function main(args = process.argv.slice(2)): Promise<void> {
  const exitCode = await runCli(args, createCliDependencies(), {
    stdout: (message) => process.stdout.write(message),
    stderr: (message) => process.stderr.write(message),
  });
  if (exitCode !== 0) process.exitCode = exitCode;
}

void main();
