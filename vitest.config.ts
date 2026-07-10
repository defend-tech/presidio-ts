import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["packages/*/tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["packages/*/src/**"],
      reporter: ["text", "lcov"],
    },
  },
  resolve: {
    alias: {
      "@presidio/core": resolve(__dirname, "packages/core/src"),
      "@presidio/analyzer": resolve(__dirname, "packages/analyzer/src"),
      "@presidio/anonymizer": resolve(__dirname, "packages/anonymizer/src"),
    },
  },
});
