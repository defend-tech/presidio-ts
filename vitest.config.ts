import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // Each workspace invokes Vitest from its own directory.
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["src/**"],
      reporter: ["text", "lcov"],
    },
  },
  resolve: {
    alias: {
      "@defend-tech/presidio-core": resolve(__dirname, "packages/core/src"),
      "@defend-tech/presidio-analyzer": resolve(__dirname, "packages/analyzer/src"),
      "@defend-tech/presidio-anonymizer": resolve(__dirname, "packages/anonymizer/src"),
    },
  },
});
