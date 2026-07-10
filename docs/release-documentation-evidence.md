# Release documentation evidence

## Documentation impact

- Replaced the root README with the independent npm SDK guide for all six packages, Node compatibility, ESM/CJS, SDK APIs, CLI limits, OCR, attribution, and release preparation.
- Added [`chrome-extension.md`](chrome-extension.md) with MV3 messaging, Vite, CSP, Web Crypto, worker lifetime, country opt-in, OCR assets, and fail-closed handling.
- Corrected [`capability-parity-matrix.md`](capability-parity-matrix.md) so country recognizers are available but opt-in.
- Added package README links to the canonical guide.

## Verification record

Snippets were checked against tracked exports and source APIs. Required checks:
`npm run lint`, `npm run release:check`, and `git diff --check`. No installed
Chrome runtime test is claimed; the MV3 fixture is a build smoke test only.
