import { AnalyzerEngine } from "@defend-tech/presidio-analyzer";
import { AnonymizerEngine, RecognizerResult } from "@defend-tech/presidio-anonymizer";

void (async () => {
  const text = "email me@example.com";
  const matches = await new AnalyzerEngine().analyze(text, "en");
  const results = matches.map(
    (match) =>
      new RecognizerResult(match.entityType, match.start, match.end, match.score),
  );
  const output = await new AnonymizerEngine().anonymize(text, results);
  if (!output.text.includes("<EMAIL_ADDRESS>"))
    throw new Error("MV3 analyzer/anonymizer smoke failed");
})();
