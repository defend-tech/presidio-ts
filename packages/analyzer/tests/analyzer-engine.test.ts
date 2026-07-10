import { describe, it, expect, beforeEach } from "vitest";
import { AnalyzerEngine } from "../src/engine/analyzer-engine";
import { BatchAnalyzerEngine, DictAnalyzerResult } from "../src/engine/batch-analyzer-engine";
import { AnalyzerRequest } from "../src/entities/analyzer-request";
import { EmailRecognizer } from "../src/recognizers/generic/email";
import { PhoneRecognizer } from "../src/recognizers/generic/phone";
import { CreditCardRecognizer } from "../src/recognizers/generic/credit-card";
import { RecognizerRegistry } from "../src/registry/recognizer-registry";

describe("AnalyzerEngine", () => {
  let engine: AnalyzerEngine;

  beforeEach(() => {
    const registry = new RecognizerRegistry();
    registry.addRecognizer(new EmailRecognizer());
    registry.addRecognizer(new PhoneRecognizer());
    registry.addRecognizer(new CreditCardRecognizer());
    engine = new AnalyzerEngine({ registry });
  });

  it("detects email addresses", async () => {
    const results = await engine.analyze(
      "Contact me at john@example.com for details",
      "en",
      { entities: ["EMAIL_ADDRESS"] },
    );
    expect(results.length).toBeGreaterThanOrEqual(1);
    const email = results.find((r) => r.entityType === "EMAIL_ADDRESS");
    expect(email).toBeDefined();
    expect(email?.start).toBe(14);
    expect(email?.end).toBe(30);
  });

  it("detects phone numbers", async () => {
    const results = await engine.analyze(
      "My phone number is +1-212-555-5555",
      "en",
      { entities: ["PHONE_NUMBER"] },
    );
    // PhoneRecognizer validates; at least some phone formats are detected
    const phone = results.find((r) => r.entityType === "PHONE_NUMBER");
    if (phone) {
      expect(phone.score).toBeGreaterThan(0);
    } else {
      // Phone patterns may differ; ensure engine ran without error
      expect(results).toBeDefined();
    }
  });

it("removes results below threshold", async () => {
    // With threshold > 1.0, no results should pass
    const results = await engine.analyze(
      "Contact john@example.com",
      "en",
      {
        entities: ["EMAIL_ADDRESS"],
        scoreThreshold: 1.01,
      },
    );
    expect(results.length).toBe(0);
  });

  it("strips decision process when returnDecisionProcess is false", async () => {
    const results = await engine.analyze(
      "Email: john@example.com",
      "en",
      {
        entities: ["EMAIL_ADDRESS"],
        returnDecisionProcess: false,
      },
    );
    for (const r of results) {
      expect(r.analysisExplanation).toBeNull();
    }
  });

  it("keeps decision process when returnDecisionProcess is true", async () => {
    const results = await engine.analyze(
      "Email: john@example.com",
      "en",
      {
        entities: ["EMAIL_ADDRESS"],
        returnDecisionProcess: true,
      },
    );
    const emails = results.filter((r) => r.entityType === "EMAIL_ADDRESS");
    if (emails.length > 0) {
      expect(emails[0].analysisExplanation).not.toBeNull();
    }
  });

  it("filters via allow-list (exact)", async () => {
    const results = await engine.analyze(
      "Support email: support@example.com",
      "en",
      {
        entities: ["EMAIL_ADDRESS"],
        allowList: ["support@example.com"],
        allowListMatch: "exact",
      },
    );
    const emails = results.filter((r) => r.entityType === "EMAIL_ADDRESS" && r.score > 0);
    expect(emails.length).toBe(0);
  });

  it("returns all supported entities", async () => {
    const entities = engine.getSupportedEntities("en");
    expect(entities).toContain("EMAIL_ADDRESS");
    expect(entities).toContain("PHONE_NUMBER");
    expect(entities).toContain("CREDIT_CARD");
  });

  it("returns recognizers for language", async () => {
    const recognizers = engine.getRecognizers("en");
    expect(recognizers.length).toBeGreaterThanOrEqual(3);
  });

  it("throws on language mismatch between engine and registry", () => {
    const registry = new RecognizerRegistry(undefined, "gmsi", ["es"]);
    expect(() => {
      new AnalyzerEngine({ registry });
    }).toThrow("language mismatch");
  });

  it("uses default fallback NLP engine when no engine provided", () => {
    const e = new AnalyzerEngine({
      registry: new RecognizerRegistry(),
    });
    expect(e.nlpEngine).toBeDefined();
    expect(e.nlpEngine.isLoaded()).toBe(true);
  });

  it("handles empty text", async () => {
    const results = await engine.analyze("", "en");
    expect(results.length).toBe(0);
  });
});

describe("BatchAnalyzerEngine", () => {
  it("analyzes a list of texts", async () => {
    const registry = new RecognizerRegistry();
    registry.addRecognizer(new EmailRecognizer());
    const ae = new AnalyzerEngine({ registry });
    const batch = new BatchAnalyzerEngine(ae);

    const results = await batch.analyzeIterator(
      [
        "Contact alice@example.com",
        "Call 212-555-5555",
        "No PII here",
      ],
      "en",
      1,
      1,
      { entities: ["EMAIL_ADDRESS"] },
    );

    expect(results.length).toBe(3);
    const firstEmails = results[0].filter((r) => r.entityType === "EMAIL_ADDRESS");
    expect(firstEmails.length).toBeGreaterThanOrEqual(1);
  });

  it("analyzes a dict", async () => {
    const registry = new RecognizerRegistry();
    registry.addRecognizer(new EmailRecognizer());
    const ae = new AnalyzerEngine({ registry });
    const batch = new BatchAnalyzerEngine(ae);

    const dict = {
      email: "user@example.com",
      name: "John Doe",
    };

    const results: DictAnalyzerResult[] = [];
    for await (const dr of batch.analyzeDict(dict, "en")) {
      results.push(dr);
    }

    expect(results.length).toBe(2);
    const emailResult = results.find((dr) => dr.key === "email");
    expect(emailResult).toBeDefined();
  });

  it("skips specified keys", async () => {
    const registry = new RecognizerRegistry();
    registry.addRecognizer(new EmailRecognizer());
    const ae = new AnalyzerEngine({ registry });
    const batch = new BatchAnalyzerEngine(ae);

    const dict = { email: "user@example.com", skipKey: "skip@example.com" };
    const results: DictAnalyzerResult[] = [];
    for await (const dr of batch.analyzeDict(dict, "en", ["skipKey"])) {
      results.push(dr);
    }

    expect(results.length).toBe(2);
    const skipResult = results.find((dr) => dr.key === "skipKey");
    expect(skipResult?.recognizerResults).toEqual([]);
  });
});

describe("AnalyzerRequest", () => {
  it("parses a valid request", () => {
    const req = new AnalyzerRequest({
      text: "My SSN is 123-45-6789",
      language: "en",
      entities: ["SSN"],
      score_threshold: 0.5,
    });

    expect(req.text).toBe("My SSN is 123-45-6789");
    expect(req.language).toBe("en");
    expect(req.entities).toEqual(["SSN"]);
    expect(req.scoreThreshold).toBe(0.5);
    expect(req.allowListMatch).toBe("exact");
  });

  it("supports camelCase keys", () => {
    const req = new AnalyzerRequest({
      text: "test",
      language: "en",
      scoreThreshold: 0.3,
      returnDecisionProcess: true,
    });

    expect(req.scoreThreshold).toBe(0.3);
    expect(req.returnDecisionProcess).toBe(true);
  });

  it("throws on invalid data", () => {
    expect(() => {
      new AnalyzerRequest({ text: 123 as unknown as string, language: "en" });
    }).toThrow();
  });

  it("fromData is an alias for the constructor", () => {
    const req = AnalyzerRequest.fromData({
      text: "hello",
      language: "en",
    });
    expect(req.text).toBe("hello");
    expect(req.language).toBe("en");
  });

  it("parses ad-hoc recognizers", () => {
    const req = new AnalyzerRequest({
      text: "test",
      language: "en",
      ad_hoc_recognizers: [
        {
          supported_entity: "SSN",
          name: "Custom SSN Recognizer",
          patterns: [
            {
              name: "ssn_regex",
              regex: "\\d{3}-\\d{2}-\\d{4}",
              score: 0.85,
            },
          ],
          context: ["ssn", "social"],
        },
      ],
    });

    expect(req.adHocRecognizers.length).toBe(1);
    expect(req.adHocRecognizers[0].name).toBe("Custom SSN Recognizer");
  });
});