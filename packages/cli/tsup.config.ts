import { defineConfig } from "tsup";

export default defineConfig({
  noExternal: ["@defend-tech/presidio-core"],
  esbuildOptions(options) {
    options.alias = {
      "@defend-tech/presidio-core": "../core/src/index.ts",
    };
  },
});
