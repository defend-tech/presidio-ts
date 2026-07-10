# Capability Parity Matrix

Status reflects tracked TypeScript code, not the untracked Python reference.

| Upstream capability | TypeScript status | Notes |
| --- | --- | --- |
| Core result, pattern, recognizer models | Parity-adapted | Native TypeScript models and JS regex semantics. |
| Generic regex recognizers | Parity-adapted | Loaded deterministically; validation covers portable algorithms. |
| Country recognizers | Parity-adapted, opt-in | 65 exported regex recognizers are available and can be loaded explicitly by country code; they are not registered by `loadPredefinedRecognizers()`. Portable checksum and format validators are ported from the retained Python reference; regex syntax is normalized for JavaScript. |
| Analyzer, batch analyzer, and chunkers | Parity-adapted | Rule-based analysis, context, nested batch analysis, and a character chunker with overlap, offsets, and duplicate removal. |
| ML NLP (spaCy/Stanza/Transformers/GLiNER) | Unsupported | Requires Python/native models or separately integrated WASM/provider implementation. |
| Remote, LLM, Azure recognizers | Unsupported | No tested provider contract shipped. |
| Text anonymization/deanonymization | Parity-adapted | Built-in operators use Web Crypto where applicable. |
| Batch anonymizer | Parity-adapted | `BatchAnonymizerEngine` supports primitive lists and nested dictionary analysis output; structured cell anonymization remains a separate copied-row API. |
| Structured analysis/anonymization | Parity-adapted | Native arrays/objects, not pandas DataFrames. |
| Image box redaction | Parity-adapted | Canvas/OffscreenCanvas path. |
| Tesseract OCR | Optional adaptation | WASM dependency; OCR errors fail closed. |
| DICOM/native image processing | Unsupported/partial | Do not claim Python image-engine parity. |
| Python REST/Docker/deployment assets | Out of scope | Base npm SDK deliberately ships none. |
