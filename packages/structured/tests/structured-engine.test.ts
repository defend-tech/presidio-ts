import { AnalyzerEngine } from "@defend-tech/presidio-analyzer";
import { RecognizerRegistry } from "@defend-tech/presidio-analyzer";
import { EmailRecognizer } from "@defend-tech/presidio-analyzer";
import { describe, expect, it } from "vitest";
import { StructuredEngine, readCsv, readJson } from "../src/index.js";

function createEngine(): StructuredEngine {
  const registry = new RecognizerRegistry();
  registry.addRecognizer(new EmailRecognizer());
  return new StructuredEngine({ defaultAnalyzer: new AnalyzerEngine({ registry }) });
}

describe("StructuredEngine", () => {
  it("detects PII per selected column and cell", async () => {
    const analysis = await createEngine().analyze(
      [
        { email: "alice@example.com", note: "No PII" },
        { email: "bob@example.com", note: "Still no PII" },
      ],
      { columns: [{ name: "email", entities: ["EMAIL_ADDRESS"] }] },
    );

    expect(analysis.columns.email.entityType).toBe("EMAIL_ADDRESS");
    expect(analysis.columns.email.cells).toHaveLength(2);
    expect(analysis.columns.email.cells[0].results[0].entityType).toBe("EMAIL_ADDRESS");
  });

  it("samples values during pre-build analysis", async () => {
    const analysis = await createEngine().pre_build_analysis(
      [{ email: "alice@example.com" }, { email: "bob@example.com" }],
      { columns: [{ name: "email" }], sampleSize: 1 },
    );

    expect(analysis.columns.email.cells).toHaveLength(1);
  });

  it("anonymizes detected cells without mutating input rows", async () => {
    const rows = [{ email: "alice@example.com" }];
    const result = await createEngine().anonymize(rows, {
      columns: [{ name: "email", entities: ["EMAIL_ADDRESS"] }],
    });
    expect(result.rows[0].email).toBe("<EMAIL_ADDRESS>");
    expect(rows[0].email).toBe("alice@example.com");
  });
});

describe("structured readers", () => {
  it("parses CSV quotes and JSON rows", () => {
    expect(readCsv('name,email\n"Doe, Jane",jane@example.com\n')).toEqual([
      { name: "Doe, Jane", email: "jane@example.com" },
    ]);
    expect(readJson('[{"email":"jane@example.com"}]')).toEqual([
      { email: "jane@example.com" },
    ]);
  });
});
