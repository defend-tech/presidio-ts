# Presidio TypeScript SDK

`@defend-tech/presidio-*` is a bounded, rule-based TypeScript SDK for PII
analysis and anonymization in Node.js and browser bundles. It is not a full
replacement for Microsoft Presidio's Python/ML services.

## Requirements and packages

Node.js `18.0.0` or newer is required for the Node packages and CLI. The
analyzer, anonymizer, core, structured, and image-redactor packages can also be
bundled for browsers. The CLI is Node-only.

| Package | Purpose | Browser-safe |
| --- | --- | --- |
| `@defend-tech/presidio-core` | Shared entities, patterns, and recognizer primitives | Yes |
| `@defend-tech/presidio-analyzer` | Rule-based text and batch analysis | Yes |
| `@defend-tech/presidio-anonymizer` | Text anonymization, deanonymization, and operators | Yes |
| `@defend-tech/presidio-image-redactor` | Canvas redaction and optional OCR adapters | Yes, with assets |
| `@defend-tech/presidio-structured` | Arrays and row-object workflows | Yes |
| `@defend-tech/presidio-cli` | Node executable for text workflows | No |

## Install and use

```sh
npm install @defend-tech/presidio-analyzer @defend-tech/presidio-anonymizer
```

ESM:

```ts
import { AnalyzerEngine } from "@defend-tech/presidio-analyzer";
import { AnonymizerEngine, RecognizerResult } from "@defend-tech/presidio-anonymizer";

const text = "Email me@example.com";
const matches = await new AnalyzerEngine().analyze(text, "en");
const results = matches.map(
  (match) => new RecognizerResult(match.entityType, match.start, match.end, match.score),
);
console.log((await new AnonymizerEngine().anonymize(text, results)).text);
```

CJS:

```js
const { AnalyzerEngine } = require("@defend-tech/presidio-analyzer");
const { AnonymizerEngine, RecognizerResult } = require("@defend-tech/presidio-anonymizer");

async function redact(text) {
  const matches = await new AnalyzerEngine().analyze(text, "en");
  const results = matches.map(
    (match) => new RecognizerResult(match.entityType, match.start, match.end, match.score),
  );
  return (await new AnonymizerEngine().anonymize(text, results)).text;
}
```

## Countries and customization

Generic recognizers load by default. Country recognizers are opt-in so ordinary
numbers are not treated as identifiers for every jurisdiction:

```ts
import { AnalyzerEngine, RecognizerRegistry, UsSsnRecognizer } from "@defend-tech/presidio-analyzer";

const registry = new RecognizerRegistry();
registry.loadPredefinedRecognizers();
registry.loadCountryRecognizers(["us", "ca"]);
const analyzer = new AnalyzerEngine({ registry });
await analyzer.analyze("US SSN 078-05-1120", "en");
```

Country classes are exported for direct composition, but importing a class does
not register it. Use `loadCountryRecognizers()` or
`registry.addRecognizer(new UsSsnRecognizer())` explicitly. Add custom patterns
with the public registry API:

```ts
registry.addPatternRecognizerFromDict({
  name: "Internal ticket", supported_language: "en",
  supported_entity: "TICKET_ID",
  patterns: [{ name: "ticket", regex: "\\bTKT-[0-9]{6}\\b", score: 0.9 }],
});
```

Anonymizer operators include `Replace`, `Redact`, `Mask`, `Hash`, `Encrypt`,
`Decrypt`, `Keep`, and `Custom`. `Custom` receives matched text and must return
a string:

```ts
import { Custom } from "@defend-tech/presidio-anonymizer";

const operators = { EMAIL_ADDRESS: { type: Custom, params: { lambda: () => "[email]" } } };
```

## Structured, batch, and images

`BatchAnalyzerEngine.analyzeIterator()` handles primitive iterables and
`analyzeDict()` traverses nested objects and arrays:

```ts
import { BatchAnalyzerEngine } from "@defend-tech/presidio-analyzer";
const batches = await new BatchAnalyzerEngine().analyzeIterator(
  ["me@example.com", "no PII"], "en", 2,
);
```

Pair results with `BatchAnonymizerEngine.anonymizeList()` or `anonymizeDict()`.
The structured
package handles native arrays and row objects and exports `readJson` and
`readCsv`; it does not provide pandas/DataFrame APIs.

The image-redactor package provides canvas redaction and optional `TesseractOcr`.
Tesseract dynamically imports `tesseract.js`; serve its worker, language data,
and WASM assets locally. OCR errors throw and must stop redaction. See
[`docs/chrome-extension.md`](docs/chrome-extension.md) for MV3 asset/CSP rules.

## CLI

```sh
npm install --global @defend-tech/presidio-cli
presidio --version
presidio analyze --text 'Email me@example.com' --language en
presidio anonymize --text 'Email me@example.com'
npx @defend-tech/presidio-cli analyze --text 'Email me@example.com'
```

The supported syntax is only `analyze|anonymize --text <text> [--language
<language>]`, producing JSON on stdout. File input, stdin input, config files,
and CLI country options are not implemented. Do not import the CLI in browsers.

## Compatibility and attribution

This SDK is rule-based and uses JavaScript regexp semantics. ML NLP
(spaCy/Stanza/Transformers/GLiNER), remote/LLM/Azure recognizers, Python
REST/Docker assets, and native DICOM processing are outside its contract. Custom
regexps should be bounded and tested; JavaScript has no interruptible
synchronous regexp timeout.

This is an independent TypeScript implementation, not affiliated with,
sponsored by, or endorsed by Microsoft. See
[`UPSTREAM_ATTRIBUTION.md`](UPSTREAM_ATTRIBUTION.md) and [`docs/NOTICE`](docs/NOTICE).

## Release preparation (does not publish)

```sh
npm ci
npm run release:check
```

The packages target GitHub Packages, not npmjs. For an authorized release,
manually dispatch `Publish TypeScript Packages` through the protected
`github-packages` environment. The dispatcher must enter
`PUBLISH_PRIVATE_PACKAGES`, provide the selected full source SHA, and review
the preflight for all six name/version pairs before any package is published.
Existing versions fail by default; the explicit resume option only skips an
existing archive when registry integrity exactly matches the packed archive. A
resume is not atomic and must be followed by an authenticated fresh-consumer
install/import smoke. `release:check` never runs `npm publish`.

See [`docs/github-packages.md`](docs/github-packages.md) for consumer
installation, initial private package behavior, package access, CI permissions,
resume limits, and safe extension build-time authentication.
