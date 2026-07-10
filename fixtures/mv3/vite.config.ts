import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const fixtureDirectory = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    lib: { entry: "src/service-worker.ts", formats: ["es"], fileName: "service-worker" },
    rollupOptions: {
      input: `${fixtureDirectory}src/service-worker.ts`,
      output: { entryFileNames: "service-worker.js" },
    },
  },
});
