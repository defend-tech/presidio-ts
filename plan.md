# Plan de Migración: Presidio → TypeScript (rama `typescript`)

## Objetivo

Transformar Microsoft Presidio —librería de detección y anonimización de PII (Personally Identifiable Information)— en una librería **íntegramente en TypeScript**, portable a **extensión de Chrome** (service worker + content scripts) y también usable en Node.js.

La rama `typescript` partirá de `main` y contendrá el proyecto **fichero por fichero, línea por línea, TODO en TypeScript**, reemplazando cada dependencia Python por su análoga JS/TS cuando exista, y documentando qué partes no son portables con la solución alternativa.

---

## Arquitectura de Paquetes (monorepo npm)

```
presidio-ts/
├── packages/
│   ├── core/                  # Modelos base, interfaces, utilities
│   ├── analyzer/              # AnalyzerEngine + recognizers
│   │   ├── src/
│   │   │   ├── recognizers/
│   │   │   │   ├── generic/       # CreditCard, Email, IP, URL, MAC, Crypto, IBAN, Date, Phone
│   │   │   │   ├── country/       # US, UK, ES, DE, FR, IT, CA, AU, IN, FI, KR, NG, PH, PL, SG, ZA, SE, TH, TR
│   │   │   │   ├── nlp/           # NLP engine interface + API wrapper (Python backend)
│   │   │   │   └── third-party/   # Azure, LLM remote recognizers
│   │   │   ├── registry/         # RecognizerRegistry
│   │   │   ├── context/          # ContextAwareEnhancer
│   │   │   └── engine/           # AnalyzerEngine
│   │   └── tests/
│   ├── anonymizer/             # AnonymizerEngine + DeanonymizeEngine + operators
│   │   ├── src/
│   │   │   ├── operators/      # Replace, Redact, Mask, Hash, Encrypt, Decrypt, Keep, Custom
│   │   │   ├── crypto/         # AESCipher (Web Crypto API)
│   │   │   ├── engine/         # AnonymizerEngine, DeanonymizeEngine
│   │   │   └── entities/       # OperatorConfig, EngineResult, conflict resolution
│   │   └── tests/
│   ├── image-redactor/         # Image redaction (híbrido: Canvas API + tesseract.js WASM)
│   │   ├── src/
│   │   │   ├── ocr/            # TesseractOCR, AzureOCR
│   │   │   ├── engine/         # ImageRedactorEngine, DicomImageRedactorEngine
│   │   │   └── processing/     # Image processing (Canvas API, sharp para Node)
│   │   └── tests/
│   ├── structured/             # Structured/tabular data analysis
│   │   ├── src/
│   │   │   └── engine/         # StructuredEngine (sin pandas, arrays nativos)
│   │   └── tests/
│   └── cli/                    # CLI para Node.js (commander)
│       ├── src/
│       └── tests/
├── package.json                # Root workspace (npm workspaces)
├── tsconfig.json               # Base TS config
├── tsconfig.browser.json       # Config para browser bundle
├── tsconfig.node.json          # Config para Node.js
└── vite.config.ts / tsup.config.ts  # Build tooling
```

---

# PLAN DE EJECUCIÓN DETALLADO — FASES

---

## FASE 0: Preparación de la Rama e Infraestructura

### Qué se crea
- Rama `typescript` desde `main`
- Package.json root con npm workspaces
- `tsconfig.json` base
- Build tooling (tsup para librerías, vite para demos)
- ESLint/Biome config
- Vitest para tests
- Estructura de directorios completa del monorepo

### Dependencias npm
```json
{
  "devDependencies": {
    "typescript": "^5.6.0",
    "tsup": "^8.3.0",
    "vitest": "^2.1.0",
    "@biomejs/biome": "^1.9.0",
    "@types/node": "^22.0.0"
  }
}
```

### Archivos clave
- `package.json` (root workspace)
- `tsconfig.json` (base)
- `tsup.config.ts`
- `vitest.config.ts`
- `biome.json`
- `.gitignore` (actualizado para TS)

---

## FASE 1: Core Models + AnonymizerEngine (completo)

### 1.1 Modelos Base (`@presidio/core`)

| Archivo TS | Equivalente Python | Portabilidad | Notas |
|---|---|---|---|
| `src/pattern.ts` | `pattern.py` | ✅ 100% portable | Clase con name, regex, score, validación, toDict/fromDict |
| `src/recognizer-result.ts` | `recognizer_result.py` | ✅ 100% portable | entityType, start, end, score, analysisExplanation, recognitionMetadata. Métodos: intersects, containedIn, contains, equalIndices, hasConflict |
| `src/analysis-explanation.ts` | `analysis_explanation.py` | ✅ 100% portable | recognizer, originalScore, score, patternName, pattern, textualExplanation, regexFlags |
| `src/entity-recognizer.ts` | `entity_recognizer.py` | ✅ 100% portable | Clase abstracta: supportedEntities, supportedLanguage, name, id, context, countryCode. load() y analyze() abstractos. removeDuplicates, sanitizeValue |
| `src/local-recognizer.ts` | `local_recognizer.py` | ✅ 100% portable | Marca vacía (extiende EntityRecognizer). Sin lógica añadida |
| `src/pattern-recognizer.ts` | `pattern_recognizer.py` | ✅ 100% portable | Regex matching + deny-lists + validateResult + invalidateResult. Usa RegExp nativo con timeout vía Promise.race |
| `src/app-tracer.ts` | `app_tracer.py` | ✅ 100% portable | Trazabilidad para debugging |

### 1.2 AnonymizerEngine (`@presidio/anonymizer`)

#### Operadores

| Archivo TS | Equivalente Python | Portabilidad | Notas |
|---|---|---|---|
| `src/operators/operator.ts` | `operator.py` | ✅ 100% portable | Clase abstracta base. operatorType: Anonymize o Deanonymize. operate() abstracto |
| `src/operators/operator-type.ts` | (enum en operator.py) | ✅ 100% portable | Enum: Anonymize, Deanonymize |
| `src/operators/replace.ts` | `replace.py` | ✅ 100% portable | Reemplaza texto PII por otro texto. Lógica pura de string |
| `src/operators/redact.ts` | `redact.py` | ✅ 100% portable | Elimina el texto PII (lo reemplaza por cadena vacía) |
| `src/operators/mask.ts` | `mask.py` | ✅ 100% portable | Enmascara caracteres: maskingChar, charsToMask, fromEnd. Lógica pura de string |
| `src/operators/hash.ts` | `hash.py` | ✅ 100% portable | Reemplaza con hash SHA256. Usa Web Crypto API `crypto.subtle.digest('SHA-256', ...)` |
| `src/operators/encrypt.ts` | `encrypt.py` | ✅ 100% portable | Encripta con AES-256-CBC via Web Crypto API |
| `src/operators/decrypt.ts` | `decrypt.py` | ✅ 100% portable | Desencripta con AES-256-CBC via Web Crypto API |
| `src/operators/keep.ts` | `keep.py` | ✅ 100% portable | No modifica el texto (útil para debugging) |
| `src/operators/custom.ts` | `custom.py` | ✅ 100% portable | Permite operador personalizado |

#### AESCipher

| Archivo TS | Equivalente Python | Portabilidad | Notas |
|---|---|---|---|
| `src/crypto/aes-cipher.ts` | `aes_cipher.py` | ✅ **Portable** via Web Crypto API | AES-256-CBC encrypt/decrypt. Usa `crypto.subtle.generateKey`, `crypto.subtle.encrypt`/`decrypt` con IV |

**⚠️ Diferencia clave**: 
- Python `cryptography` usa AES-CBC con PKCS7 padding automático. Web Crypto API usa AES-CBC sin padding automático.
- **Solución**: implementar PKCS7 padding manualmente (30 líneas de código). Compatible con el formato de Presidio Python.

#### Engine

| Archivo TS | Equivalente Python | Portabilidad | Notas |
|---|---|---|---|
| `src/engine/anonymizer-engine.ts` | `anonymizer_engine.py` | ✅ 100% portable | Orquestador: recibe texto + analyzerResults + operators → texto anonimizado. Conflict resolution, merge de entidades, espacio entre entidades iguales |
| `src/engine/deanonymize-engine.ts` | `deanonymize_engine.py` | ✅ 100% portable | Revierte Encrypt → Decrypt. Misma lógica que anonymize pero con operadores deanonymize |

#### Entities

| Archivo TS | Equivalente Python | Portabilidad | Notas |
|---|---|---|---|
| `src/entities/operator-config.ts` | `operator_config.py` | ✅ 100% portable | `{operatorName, params}` |
| `src/entities/engine-result.ts` | `engine_result.py` | ✅ 100% portable | `{text, items[]}` con start, end, entityType, text anonimizado, operator |
| `src/entities/conflict-resolution.ts` | (en entities/) | ✅ 100% portable | Estrategia: MERGE_SIMILAR_OR_CONTAINED, REMOVE_INTERSECTIONS |

#### Factory

| Archivo TS | Equivalente Python | Portabilidad | Notas |
|---|---|---|---|
| `src/operators/operators-factory.ts` | `operators_factory.py` | ✅ 100% portable | Registry + lookup de operadores por nombre |

---

## FASE 2: Recognizer Registry + Generic Recognizers

### 2.1 RecognizerRegistry

| Archivo TS | Equivalente Python | Portabilidad | Notas |
|---|---|---|---|
| `src/registry/recognizer-registry.ts` | `recognizer_registry.py` | ✅ 100% portable | Registra recognizers, los filtra por idioma/entidad/todos, addNlpRecognizer, loadPredefinedRecognizers |
| `src/registry/recognizer-registry-provider.ts` | `recognizer_registry_provider.py` | ✅ 100% portable | Factory basada en YAML (js-yaml) |
| `src/registry/recognizers-loader-utils.ts` | `recognizers_loader_utils.py` | ✅ 100% portable | Utilidades de carga: import dinámico de recognizers por país |

### 2.2 Generic Recognizers

| Archivo TS | Equivalente Python | Portabilidad | Dependencia npm | Notas |
|---|---|---|---|---|
| `src/recognizers/generic/credit-card.ts` | `credit_card_recognizer.py` | ✅ 100% portable | Ninguna | Regex + Luhn checksum (10 líneas inline, no necesita paquete) |
| `src/recognizers/generic/email.ts` | `email_recognizer.py` | ✅ Portable | `tldts` | Regex + validación con `tldts` (58M semanales, pure TS) |
| `src/recognizers/generic/ip.ts` | `ip_recognizer.py` | ✅ 100% portable | Ninguna | Solo regex IPv4 + IPv6 |
| `src/recognizers/generic/url.ts` | `url_recognizer.py` | ✅ 100% portable | Ninguna | Solo regex URL |
| `src/recognizers/generic/mac.ts` | `mac_recognizer.py` | ✅ 100% portable | Ninguna | Solo regex MAC address |
| `src/recognizers/generic/crypto.ts` | `crypto_recognizer.py` | ✅ 100% portable | Ninguna | Regex direcciones wallet (BTC, ETH, etc.) |
| `src/recognizers/generic/iban.ts` | `iban_recognizer.py` | ✅ Portable | `ibantools` | Regex + validación checksum con ibantools |
| `src/recognizers/generic/date.ts` | `date_recognizer.py` | ✅ 100% portable | Ninguna | Regex múltiples formatos de fecha |
| `src/recognizers/generic/phone.ts` | `phone_recognizer.py` | ✅ Portable | `libphonenumber-js` | PhoneNumberMatcher + validación por región. Dependencia ~60KB comprimido |

#### Dependencias npm Fase 2

```json
{
  "dependencies": {
    "tldts": "^7.4.0",
    "ibantools": "^4.5.0",
    "libphonenumber-js": "^1.13.0"
  }
}
```

---

## FASE 3: Country-Specific Recognizers (19 países)

### Estructura
```
src/recognizers/country/
├── us/
│   ├── us-ssn.ts            # Social Security Number
│   ├── us-itin.ts           # Individual Taxpayer ID
│   ├── us-passport.ts       # US Passport
│   ├── us-driver-license.ts # US Driver License (multi-estado)
│   ├── us-bank.ts           # US Bank Account
│   ├── us-aba-routing.ts    # ABA Routing Number
│   ├── us-mbi.ts            # Medicare Beneficiary Identifier
│   └── us-npi.ts            # National Provider Identifier
├── uk/
│   ├── uk-nino.ts           # National Insurance Number
│   ├── uk-passport.ts       # UK Passport
│   ├── uk-driving-licence.ts# UK Driving Licence
│   ├── uk-nhs.ts            # NHS Number
│   ├── uk-postcode.ts       # UK Postcode
│   └── uk-vehicle.ts        # UK Vehicle Registration
├── es/
│   ├── es-dni.ts            # DNI (Documento Nacional de Identidad)
│   ├── es-nie.ts            # NIE (Extranjero)
│   ├── es-nif.ts            # NIF/CIF (empresas)
│   └── es-passport.ts       # Passport (español)
├── de/
│   ├── de-tax-id.ts         # Steuerliche Identifikationsnummer
│   ├── de-tax-number.ts     # Steuernummer
│   ├── de-passport.ts       # Reisepass
│   ├── de-id-card.ts        # Personalausweis
│   ├── de-drivers-license.ts# Führerschein
│   ├── de-social-security.ts# Sozialversicherungsnummer
│   ├── de-plz.ts            # PLZ (Postleitzahl)
│   ├── de-health-insurance.ts# Krankenversichertennummer
│   ├── de-vat-id.ts         # Umsatzsteuer-Identifikationsnummer
│   ├── de-kfz.ts            # KFZ-Kennzeichen (matrícula)
│   ├── de-lanr.ts           # LANR (Lebenslange Arztnummer)
│   ├── de-bsnr.ts           # BSNR (Betriebsstättennummer)
│   └── de-handelsregister.ts# Handelsregisternummer
├── fr/
│   ├── fr-insee.ts          # INSEE / Social Security
│   ├── fr-passport.ts       # Passport
│   ├── fr-driver-license.ts # Permis de conduire
│   ├── fr-vat.ts            # TVA intracommunautaire
│   └── fr-id-card.ts        # Carte d'identité
├── it/
│   ├── it-codice-fiscale.ts # Codice Fiscale
│   ├── it-passport.ts       # Passaporto
│   ├── it-driver-license.ts # Patente di guida
│   ├── it-vat.ts            # Partita IVA
│   └── it-id-card.ts        # Carta d'identità
├── ca/
│   ├── ca-sin.ts            # Social Insurance Number
│   ├── ca-passport.ts       # Passport
│   ├── ca-driver-license.ts # Driver License
│   ├── ca-health-card.ts    # Health Card
│   └── ca-bank.ts           # Bank Account
├── au/
│   ├── au-tfn.ts            # Tax File Number
│   ├── au-medicare.ts       # Medicare Number
│   ├── au-passport.ts       # Passport
│   ├── au-driver-license.ts # Driver License
│   └── au-abn.ts            # Australian Business Number
├── in/
│   ├── in-aadhaar.ts        # Aadhaar (12 dígitos)
│   ├── in-pan.ts            # PAN Card
│   ├── in-passport.ts       # Passport
│   ├── in-driver-license.ts # Driver License
│   └── in-voter-id.ts       # Voter ID
├── fi/ (Finland)
│   ├── fi-national-id.ts    # Henkilötunnus
│   └── fi-passport.ts       # Passi
├── kr/ (South Korea)
│   ├── kr-rrn.ts            # Resident Registration Number (주민등록번호)
│   ├── kr-passport.ts       # 여권 (Passport)
│   ├── kr-driver-license.ts # 운전면허증
│   └── kr-arc.ts            # Alien Registration Card
├── ng/ (Nigeria)
│   ├── ng-bvn.ts            # Bank Verification Number
│   ├── ng-nin.ts            # National Identification Number
│   ├── ng-passport.ts       # Passport
│   ├── ng-driver-license.ts # Driver License
│   └── ng-voter-id.ts       # Voter ID
├── ph/ (Philippines)
│   ├── ph-umid.ts           # Unified Multi-Purpose ID
│   ├── ph-passport.ts       # Passport
│   ├── ph-driver-license.ts # Driver License
│   ├── ph-philhealth.ts     # PhilHealth Number
│   ├── ph-sss.ts            # SSS Number
│   ├── ph-pagibig.ts        # Pag-IBIG Number
│   └── ph-postal-id.ts      # Postal ID
├── pl/ (Poland)
│   ├── pl-pesel.ts          # PESEL (identificación nacional)
│   ├── pl-regon.ts          # REGON (empresarial)
│   ├── pl-nip.ts            # NIP (VAT/tax ID)
│   ├── pl-passport.ts       # Paszport
│   └── pl-driver-license.ts # Prawo jazdy
├── sg/ (Singapore)
│   ├── sg-nric.ts           # NRIC (National Registration Identity Card)
│   ├── sg-fin.ts            # FIN (Foreign Identification Number)
│   ├── sg-passport.ts       # Passport
│   └── sg-driver-license.ts # Driver License
├── za/ (South Africa)
│   ├── za-id-number.ts      # ID Number (13 dígitos)
│   ├── za-passport.ts       # Passport
│   └── za-driver-license.ts # Driver License
├── se/ (Sweden)
│   ├── se-personal-number.ts# Personnummer (YYYYMMDD-XXXX)
│   ├── se-passport.ts       # Pass
│   └── se-driver-license.ts # Körkort
├── th/ (Thailand)
│   ├── th-id-card.ts        # Thai ID Card (13 dígitos)
│   ├── th-passport.ts       # Passport
│   └── th-vehicle.ts        # Vehicle plates
└── tr/ (Turkey)
    ├── tr-id.ts             # Turkish ID (11 dígitos)
    ├── tr-passport.ts       # Pasaport
    └── tr-driver-license.ts # Sürücü belgesi
```

**Todos son 100% portables** (solo regex + lógica pura de validación). Ninguna dependencia npm externa para esta fase. Cada recognizer es un `PatternRecognizer` con:
- Uno o más patrones regex
- Palabras de contexto
- Validación extra (checksums, formatos)
- Tests unitarios

---

## FASE 4: AnalyzerEngine Completo

### 4.1 AnalyzerEngine

| Archivo TS | Equivalente Python | Portabilidad | Notas |
|---|---|---|---|
| `src/engine/analyzer-engine.ts` | `analyzer_engine.py` | ✅ **95% portable** | Orquestador completo. Sin dependencia de NLP engines concretos. El NLP se inyecta como interfaz |

**Funcionalidades del AnalyzerEngine:**
- Carga de recognizers por idioma
- Ejecución de NLP pipeline (vía interfaz abstracta)
- Ejecución de cada recognizer
- Context-aware enhancement (con y sin lemma)
- Allow-list filtering (exact match y regex)
- Score threshold filtering
- Eliminación de duplicados
- Análisis batch (batchAnalyzerEngine)

**Dependencias npm Fase 4**
Se añade `js-yaml` para cargar configuraciones YAML de NLP engines:
```json
{
  "dependencies": {
    "js-yaml": "^4.1.0"
  }
}
```

### 4.2 ContextAwareEnhancer

| Archivo TS | Equivalente Python | Portabilidad | Notas |
|---|---|---|---|
| `src/context/context-aware-enhancer.ts` | `context_aware_enhancer.py` | ✅ 100% portable | Clase base abstracta. Context words matching sin NLP |
| `src/context/lemma-context-aware-enhancer.ts` | `lemma_context_aware_enhancer.py` | ⚠️ **Parcial** | Requiere lematización (que da spaCy). En TS, fallback a regex tokenizer simple + diccionario básico stopwords. Versión sin lemma funciona sin NLP |

### 4.3 AnalyzerRequest

| Archivo TS | Equivalente Python | Portabilidad | Notas |
|---|---|---|---|
| `src/entities/analyzer-request.ts` | `analyzer_request.py` | ✅ 100% portable | Schemas de petición con validación Zod |

### 4.4 BatchAnalyzerEngine

| Archivo TS | Equivalente Python | Portabilidad | Notas |
|---|---|---|---|
| `src/engine/batch-analyzer-engine.ts` | `batch_analyzer_engine.py` | ✅ 100% portable | Versión batch que procesa múltiples textos |

---

## FASE 5: Presidio CLI

### 5.1 CLI (`@presidio/cli`)

| Archivo TS | Equivalente Python | Portabilidad | Notas |
|---|---|---|---|
| `src/cli.ts` | `cli.py` | ✅ Portable (Node.js only) | Usa `commander` en vez de `click` |
| `src/config.ts` | `config.py` | ✅ Portable | Carga YAML config |
| `src/analyzer.ts` | `analyzer.py` | ✅ Portable | Wrapper CLI del analyzer |

**⚠️ NOTA**: CLI funciona solo en Node.js, NO en Chrome. Pero la lógica CLI se puede separar: el core de análisis funciona en browser, el CLI es solo un wrapper de linea de comandos para Node.js.

**Dependencias npm Fase 5**
```json
{
  "dependencies": {
    "commander": "^12.0.0",
    "js-yaml": "^4.1.0",
    "ignore": "^7.0.0",
    "@presidio/analyzer": "workspace:*",
    "@presidio/anonymizer": "workspace:*"
  }
}
```

---

## FASE 6: NLP Engines (Híbrido — NO portable a pure TS)

### ⚠️ Realidad: No existe spaCy, Transformers, Stanza ni GLiNER en pure TypeScript/browser

| Componente Python | ¿Portable a pure TS? | Solución en el plan |
|---|---|---|
| **SpacyNlpEngine** | ❌ No (Cython + modelos binarios) | Interfaz `NlpEngine` abstracta en TS + implementación API REST que llama al contenedor Docker Presidio (si se despliega) |
| **StanzaNlpEngine** | ❌ No (PyTorch) | Misma interfaz: implementación API REST |
| **TransformersNlpEngine** | ❌ No (PyTorch + modelos grandes) | Misma interfaz: implementación API REST |
| **SlimSpacyNlpEngine** | ❌ No (Cython) | Misma interfaz: implementación API REST |
| **GLiNER** | ⚠️ Parcial (ONNX.js) | onnxruntime-web permite correr modelos ONNX en browser. Dependencia WASM (~10MB), NO pure TS |
| **DeviceDetector** | ❌ No (PyTorch CUDA) | No aplica en browser. No aplica en Node sin GPU |
| **NerModelConfiguration** | ✅ Portable | Configuración de modelos (nombres, etiquetas) → datos planos |
| **NlpArtifacts** | ✅ **Portable** | Modelo de datos: entities, tokens, lemmas, scores. Sin dependencia de spaCy types |

### Alternativas browser-native:

**1. Compromise.js** — NLP en JS puro, ~200KB:
- Tokenización
- Lematización básica (plural→singular, conjugación verbal simple)
- POS tagging (partes de la oración)
- Extracción de entidades básicas (personas, lugares, organizaciones vía lexicon)
- ✅ Corre en browser, NO requiere modelos descargables, 100% JS

**2. NLP.js / @nlpjs** — Framework NLP en JS:
- NER entrenable
- Lenguaje natural
- Clasificación de intenciones
- ✅ Corre en browser pero es más orientado a chatbot

**3. Transformers.js** — Hugging Face Transformers en browser via ONNX:
- ✅ Corre en browser vía ONNX runtime WASM
- ❌ PESO: ~30-50MB+ para modelos
- ❌ No es pure TS (WASM)

### Decisión para el plan

El plan incluye:
- **Interfaz NlpEngine** abstracta en TypeScript → 100% portable
- **NlpArtifacts** → 100% portable (modelo de datos)
- **SlimNlpEngine browser-native**: Implementación con Compromise.js que cubre tokenización + lematización básica + stopwords NlpEngine. ✅ Portable, corre en Chrome sin Docker
- **ApiNlpEngine**: Implementación que llama a un endpoint Python Presidio (para escenarios donde el Docker esté disponible). ⚠️ No corre en Chrome sin backend
- **NER recognizers** (gliner, huggingface): ❌ No portables → documentados como "no disponibles en browser"
- **Third-party recognizers** (Azure, LLM): ⚠️ Portables como API calls si el usuario tiene las credenciales

**Dependencias npm Fase 6**
```json
{
  "optionalDependencies": {
    "compromise": "^14.10.0"
  }
}
```

---

## FASE 7: Image Redactor (Híbrido — NO portable a 100% pure TS)

### ⚠️ Realidad: OpenCV, Tesseract y GDCM son C++ nativos

| Componente Python | ¿Portable? | Solución en el plan |
|---|---|---|
| **ImageRedactorEngine** | ⚠️ **Híbrido** | La lógica de redacción (dibujar rectángulos sobre texto detectado) es portable. OCR y procesamiento de imagen dependen de WASM |
| **ImageAnalyzerEngine** | ✅ **Portable** | Usa el AnalyzerEngine sobre el texto extraído por OCR |
| **ImageProcessingEngine** (OpenCV) | ❌ No | Canvas API nativa del browser cubre: greyscale, threshold, blur, resize. Para operaciones avanzadas: opencv.js WASM |
| **TesseractOCR** | ❌ No | `tesseract.js` WASM. NO es pure TS |
| **Azure DocumentIntelligence OCR** | ✅ **Portable** | API call REST. Funciona en browser con fetch |
| **DicomImageRedactorEngine** | ⚠️ **Híbrido** | `dicom-parser` (pure JS) para parsear DICOM + Canvas API para manipular píxeles |
| **DicomImagePiiVerifyEngine** | ⚠️ **Híbrido** | Misma lógica + dicom-parser |
| **BboxProcessor** | ✅ **Portable** | Lógica pura de bounding boxes |
| **ImageRecognizerResult** | ✅ **Portable** | Modelo de datos |

### Alternativas browser-native:

**OCR:**
- **Tesseract.js** → WASM, funcional en browser, ~3-5MB. Funciona pero NO es pure TS
- **Canvas API** (nativa del browser) → image preprocessing (threshold, blur, resize, greyscale) sin dependencias

**Image Processing:**
- **Canvas API** → `drawImage`, `getImageData`, `putImageData` para manipulate pixels
- Manipulación directa de ArrayBuffer → threshold, blur (simple kernel convolution), resize, rotate

**DICOM:**
- **dicom-parser** (npm) → pure JS, ~200KB, popular (~80K semanales). Parsea DICOM, extrae metadatos y píxeles

### Plugins/patrones de image processing para browser nativo (sin canvas API puro):
```typescript
// Greyscale: promedio de R+G+B
// Threshold: binary threshold por pixel
// Blur: convolución de kernel 3x3 sobre pixels
// Resize: Canvas API nativo
// Redact rectangles: Canvas 2D context fillRect
```

**Dependencias npm Fase 7**
```json
{
  "optionalDependencies": {
    "tesseract.js": "^5.1.0",
    "dicom-parser": "^1.8.0"
  }
}
```

---

## FASE 8: Structured Data (presidio-structured)

### 8.1 StructuredEngine (`@presidio/structured`)

| Archivo TS | Equivalente Python | Portabilidad | Notas |
|---|---|---|---|
| `src/engine/structured-engine.ts` | `structured_engine.py` | ✅ **Portable** sin pandas | En vez de pandas DataFrame, usa arrays JS nativos + objetos. Sin dependencia externa |
| `src/analysis-builder.ts` | `analysis_builder.py` | ✅ Portable | Construye análisis por columna/celda |
| `src/data/` | `data/` | ✅ Portable | Readers para CSV, JSON, etc. |

**Diferencia clave**: En Python se usa pandas para manejo tabular. En TS se reemplaza con métodos nativos de Array (map, filter, reduce) y utilidades como `csv-parse` para CSV.

**Dependencias npm Fase 8**
```json
{
  "optionalDependencies": {
    "csv-parse": "^5.5.0"
  }
}
```

---

# MAPA DE DEPENDENCIAS npm COMPLETO

```json
{
  "name": "presidio-ts",
  "private": true,
  "workspaces": [
    "packages/core",
    "packages/analyzer",
    "packages/anonymizer",
    "packages/image-redactor",
    "packages/structured",
    "packages/cli"
  ],
  "dependencies": {},
  "devDependencies": {
    "typescript": "^5.6.0",
    "tsup": "^8.3.0",
    "vitest": "^2.1.0",
    "@biomejs/biome": "^1.9.0",
    "@types/node": "^22.0.0"
  }
}
```

### `@presidio/core` — Sin dependencias externas de runtime

### `@presidio/analyzer`
```json
{
  "dependencies": {
    "@presidio/core": "workspace:*",
    "tldts": "^7.4.0",
    "ibantools": "^4.5.0",
    "libphonenumber-js": "^1.13.0",
    "js-yaml": "^4.1.0"
  },
  "optionalDependencies": {
    "compromise": "^14.10.0"
  }
}
```

### `@presidio/anonymizer`
```json
{
  "dependencies": {
    "@presidio/core": "workspace:*"
  }
}
```

### `@presidio/image-redactor`
```json
{
  "dependencies": {
    "@presidio/core": "workspace:*",
    "@presidio/analyzer": "workspace:*"
  },
  "optionalDependencies": {
    "tesseract.js": "^5.1.0",
    "dicom-parser": "^1.8.0"
  },
  "browser": {
    "tesseract.js": true,
    "dicom-parser": true
  }
}
```

### `@presidio/structured`
```json
{
  "dependencies": {
    "@presidio/core": "workspace:*",
    "@presidio/analyzer": "workspace:*",
    "@presidio/anonymizer": "workspace:*"
  },
  "optionalDependencies": {
    "csv-parse": "^5.5.0"
  }
}
```

### `@presidio/cli` (Node.js only)
```json
{
  "dependencies": {
    "@presidio/core": "workspace:*",
    "@presidio/analyzer": "workspace:*",
    "@presidio/anonymizer": "workspace:*",
    "commander": "^12.0.0",
    "js-yaml": "^4.1.0",
    "ignore": "^7.0.0"
  }
}
```

---

# MATRIZ DE PORTABILIDAD COMPLETA

## ✅ 100% Portable a Pure TypeScript (browser + Node.js)

| Componente | Archivos | Líneas aprox. | Notas |
|---|---|---|---|
| Models base | 7 | ~400 | Pattern, RecognizerResult, AnalysisExplanation, EntityRecognizer, LocalRecognizer, PatternRecognizer, AppTracer |
| AnonymizerEngine + DeanonymizeEngine | 2 | ~350 | Orquestación completa |
| Operadores anonymizer | 10 | ~500 | Replace, Redact, Mask, Hash, Encrypt, Decrypt, Keep, Custom |
| AESCipher | 1 | ~80 | Web Crypto API |
| Conflict Resolution | 1 | ~100 | Lógica pura |
| AnalyzerEngine (sin NLP) | 1 | ~450 | Orquestación sin NLP |
| BatchAnalyzerEngine | 1 | ~100 | Batch processing |
| ContextAwareEnhancer (sin lemma) | 2 | ~150 | Context matching |
| RecognizerRegistry | 3 | ~400 | Registry + provider + loader utils |
| Generic Recognizers (9) | 9 | ~500 | CreditCard, Email, IP, URL, MAC, Crypto, IBAN, Date, Phone |
| Country Recognizers (~80+) | 80 | ~2,000 | Regex puro, 19 países |
| AnalyzerRequest | 1 | ~100 | Zod schemas |
| StructuredEngine | 1 | ~200 | Sin pandas |
| AnalysisBuilder | 1 | ~150 | Análisis tabular |
| CLI (Node.js only) | 3 | ~200 | Commander CLI |
| **Total portable** | **~122** | **~5,680** | |

## 🟡 Portable con dependencias npm

| Componente | Dependencia | Tamaño aprox. | Notas |
|---|---|---|---|
| EmailRecognizer | tldts | ~50KB | Pure TS |
| IBANRecognizer | ibantools | ~30KB | Pure TS |
| PhoneRecognizer | libphonenumber-js | ~60KB comprimido | Pure JS |
| NLP Browser Engine | compromise | ~200KB | Pure JS, NLP ligero |
| CSV parsing | csv-parse | ~50KB | Pure JS |

## ⚠️ Híbrido (NO pure TS, requiere WASM o API externa)

| Componente | Solución | Tamaño | Notas |
|---|---|---|---|
| SlimNlpEngine (browser) | compromise.js | ~200KB | Tokenización + lemmas básicos, sin NER ML |
| ImageRedactor (OCR) | tesseract.js WASM | ~3-5MB | NO pure TS |
| DICOM parsing | dicom-parser | ~200KB | Pure JS, no TS. Funciona en browser |
| Image processing | Canvas API nativa | 0KB | Nativo del browser. OpenCV.js como WASM opcional |
| GLiNER NER | onnxruntime-web | ~10MB WASM | Solo si se necesita zero-shot NER en browser |

## ❌ No portable (requiere backend Python)

| Componente | Razón | Alternativa en plan |
|---|---|---|
| SpacyNlpEngine | Cython + modelos | Interfaz abstracta + REST API wrapper |
| TransformersNlpEngine | PyTorch + modelos grandes | Interfaz abstracta + REST API wrapper |
| StanzaNlpEngine | PyTorch | Interfaz abstracta + REST API wrapper |
| MedicalNER | Modelos médicos especializados | Documentar como no disponible |
| Azure AI Language | API cloud | API call REST (funciona en browser) |
| LLM (LangExtract) | OpenAI API | API call REST (funciona en browser) |
| AHDS (Azure Health DeID) | API cloud | API call REST (funciona en browser) |

---

# RESUMEN: ¿Qué se PIERDE vs el Presidio Python original?

| Funcionalidad | ¿Disponible en TS? | Notas |
|---|---|---|
| **Regex PII detection** (credit card, email, SSN, etc.) | ✅ Sí | 100% portable. ~90% de los recognizers |
| **Phone detection** (multi-region) | ✅ Sí | Con libphonenumber-js |
| **Country-specific IDs** (DNI, NINO, Aadhaar, etc.) | ✅ Sí | 19 países, 80+ recognizers |
| **Text anonymization** (replace, redact, mask, hash) | ✅ Sí | AnonymizerEngine completo |
| **Encrypt/Decrypt** | ✅ Sí | AES-256-CBC con Web Crypto API |
| **Deanonymize** | ✅ Sí | Reversión completa |
| **Custom operators** | ✅ Sí | Custom operator interface |
| **Context-aware enhancement** | ✅ Sí | Versión con/sin lemma |
| **Allow-list** | ✅ Sí | Exact y regex |
| **Structured data** (tables) | ✅ Sí | Sin pandas, arrays nativos |
| **CLI** | ✅ Sí | Node.js only |
| **NLP tokenization + lemmatization** | 🟡 Parcial | compromise.js para browser, o API REST a Python |
| **NER ML** (PERSON, LOCATION, ORG) | ⚠️ No | Compromise.js tiene NER básico. GLiNER via ONNX WASM como opción pesada |
| **Image redaction** | ⚠️ Híbrido | tesseract.js WASM + Canvas API. NO pure TS |
| **DICOM** | ⚠️ Híbrido | dicom-parser JS. NO pure TS |
| **Azure AI Language** | ✅ Sí | API call REST |
| **LLM-based extraction** | ✅ Sí | API call REST (OpenAI) |
| **spaCy/Stanza NER** | ❌ No | Solo via API REST a backend Python |
| **Transformers models** | ❌ No | Solo via API REST |
| **HuggingFace NER** | ⚠️ Parcial | Transformers.js ONNX WASM posible pero pesado |
| **Medical NER** | ❌ No | Modelos especializados no disponibles |
| **GLiNER zero-shot** | ⚠️ Parcial | ONNX.js WASM posible |
| **Batch processing** | ✅ Sí | Tanto en analyzer como anonymizer |
| **Docker** | ❌ No | Sin Docker: todo inline. Docker opcional para NLP backend |

---

# CONCLUSIÓN

La migración a TypeScript **es viable para todo el core de Presidio**: analyzer (sin NLP), anonymizer, y structured data son 100% portables. 

**Lo que se pierde vs Python original:**
1. **NER ML de alta precisión** (spaCy, Transformers, Stanza) → personas, ubicaciones, organizaciones detectadas por modelos neuronales
2. **Imagen + OCR puro** → requiere WASM (tesseract.js) que no es pure TS
3. **Medical NER** → modelos especializados

**Lo que se gana:**
1. Corre en **cualquier navegador Chrome** sin backend
2. Sin Docker, sin servidores, sin dependencias de sistema
3. Bundle tree-shakeable: solo importas lo que necesitas
4. Tipado completo: mejor DX, menos bugs en tiempo de compilación
5. Integración directa con extensiones Chrome (service worker + content scripts)

**Tamaño estimado del bundle para Chrome:**
- Solo Core + Analyzer + Anonymizer: **~100-200KB** comprimido (gzip)
- Con PhoneRecognizer (libphonenumber-js): + ~60KB
- Con Image Redactor (tesseract.js WASM): + ~3-5MB
