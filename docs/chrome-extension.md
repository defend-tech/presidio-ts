# Chrome MV3 integration

This guide shows a Chrome Manifest V3 extension that analyzes text in a service
worker. The worker is bundled as ESM by Vite; the CLI is not part of an
extension. The example uses the same analyzer/anonymizer APIs as the repository
MV3 smoke fixture and adds the message boundary normally needed by a content
script.

## Install and layout

```sh
npm install @defend-tech/presidio-analyzer @defend-tech/presidio-anonymizer
npm install --save-dev typescript vite @types/chrome
```

```text
my-extension/
  public/manifest.json
  src/service-worker.ts
  src/content-script.ts
  vite.config.ts
  package.json
```

## Manifest

```json
{
  "manifest_version": 3,
  "name": "Local text protection",
  "version": "1.0.0",
  "background": { "service_worker": "service-worker.js", "type": "module" },
  "content_scripts": [{ "matches": ["https://example.com/*"], "js": ["content-script.js"] }]
}
```

## Service worker and messaging

```ts
// src/service-worker.ts
import { AnalyzerEngine } from "@defend-tech/presidio-analyzer";
import { AnonymizerEngine, RecognizerResult } from "@defend-tech/presidio-anonymizer";

const analyzer = new AnalyzerEngine();
const anonymizer = new AnonymizerEngine();

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "anonymize-text" || typeof message.text !== "string") return;
  void (async () => {
    try {
      const matches = await analyzer.analyze(message.text, "en");
      const results = matches.map(
        (match) => new RecognizerResult(match.entityType, match.start, match.end, match.score),
      );
      const output = await anonymizer.anonymize(message.text, results);
      sendResponse({ ok: true, text: output.text });
    } catch {
      // Fail closed: never send the original text after an error.
      sendResponse({ ok: false, error: "Anonymization failed" });
    }
  })();
  return true;
});
```

```ts
// src/content-script.ts
const response = await chrome.runtime.sendMessage({
  type: "anonymize-text",
  text: "Email me@example.com",
});
if (!response?.ok) throw new Error(response?.error ?? "Anonymization failed");
console.log(response.text);
```

Do not log source text, matches, replacement maps, or keys. If the worker
reports failure, discard the original value or keep it local; never transmit an
unredacted fallback.

## Vite, scripts, and loading

```ts
// vite.config.ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
const root = fileURLToPath(new URL(".", import.meta.url));
export default defineConfig({
  build: {
    outDir: "dist", emptyOutDir: true,
    rollupOptions: {
      input: { "service-worker": `${root}src/service-worker.ts`, "content-script": `${root}src/content-script.ts` },
      output: { entryFileNames: "[name].js", format: "es" },
    },
  },
});
```

```json
{ "type": "module", "scripts": { "build": "vite build" } }
```

Run `npm run build`, open `chrome://extensions`, enable Developer mode, choose
**Load unpacked**, and select `dist/`. Chrome MV3 CSP disallows ordinary remote
script execution and `eval`; keep code and dependencies bundled locally.

## Countries, lifetime, and privacy

Generic recognizers load by default. Countries are opt-in and must be loaded
deliberately in the worker:

```ts
import { RecognizerRegistry } from "@defend-tech/presidio-analyzer";
const registry = new RecognizerRegistry();
registry.loadPredefinedRecognizers();
registry.loadCountryRecognizers(["us"]);
```

MV3 workers can be suspended between events. Keep each request self-contained,
return the async response (`true` above), and persist only non-sensitive
configuration. The anonymizer's encryption support uses Web Crypto in extension
contexts; key lifecycle and storage remain application security decisions.

## Size and OCR

Bundle only the packages needed by the worker and measure the resulting files;
the SDK makes no universal bundle-size guarantee. `TesseractOcr` dynamically
imports `tesseract.js`, creates a worker, recognizes the image, and terminates
it. Package the Tesseract worker, language data, and `tesseract-core.wasm` as
local assets, expose only required assets with `web_accessible_resources`, and
use an offscreen document if the chosen worker setup cannot satisfy MV3 CSP.
OCR errors throw, so stop redaction rather than continuing with unverified
pixels. The repository fixture is a build smoke test, not installed-Chrome
runtime coverage.
