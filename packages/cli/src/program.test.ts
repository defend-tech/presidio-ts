import { describe, expect, it, vi } from "vitest";
import { type CliDependencies, runCli } from "./program.js";

function dependencies(): CliDependencies {
  return {
    version: "0.0.1",
    analyze: vi
      .fn()
      .mockResolvedValue([{ entityType: "EMAIL_ADDRESS", start: 0, end: 16, score: 1 }]),
    anonymize: vi.fn().mockResolvedValue({
      text: "<EMAIL_ADDRESS>",
      items: [
        {
          entityType: "EMAIL_ADDRESS",
          start: 0,
          end: 15,
          text: "<EMAIL_ADDRESS>",
          operator: "replace",
        },
      ],
    }),
  };
}

function io() {
  const stdout = vi.fn();
  const stderr = vi.fn();
  return { stdout, stderr };
}

describe("presidio CLI", () => {
  it("prints the manifest version", async () => {
    const output = io();
    expect(await runCli(["--version"], dependencies(), output)).toBe(0);
    expect(output.stdout).toHaveBeenCalledWith("0.0.1\n");
  });

  it("serializes analysis results deterministically", async () => {
    const output = io();
    const deps = dependencies();
    expect(
      await runCli(["analyze", "--text", "a@b.com", "--language", "en"], deps, output),
    ).toBe(0);
    expect(deps.analyze).toHaveBeenCalledWith("a@b.com", "en");
    expect(output.stdout).toHaveBeenCalledWith(
      '{"results":[{"entityType":"EMAIL_ADDRESS","start":0,"end":16,"score":1}]}\n',
    );
  });

  it("serializes anonymization output deterministically", async () => {
    const output = io();
    expect(await runCli(["anonymize", "--text", "a@b.com"], dependencies(), output)).toBe(
      0,
    );
    expect(output.stdout).toHaveBeenCalledWith(
      expect.stringContaining('"text":"<EMAIL_ADDRESS>"'),
    );
  });

  it("returns useful errors for invalid invocations", async () => {
    const output = io();
    expect(await runCli(["analyze", "--language", "en"], dependencies(), output)).toBe(1);
    expect(output.stderr).toHaveBeenCalledWith(
      expect.stringContaining('--text" is required'),
    );
  });

  it("keeps the executable shebang in the CLI source", async () => {
    const { readFile } = await import("node:fs/promises");
    const source = await readFile(new URL("./cli.ts", import.meta.url), "utf8");
    expect(source.startsWith("#!/usr/bin/env node\n")).toBe(true);
  });
});
