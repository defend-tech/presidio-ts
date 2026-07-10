export interface AnalysisResult {
  entityType: string;
  start: number;
  end: number;
  score: number;
}

export interface AnonymizationResult {
  text: string;
  items: Array<{
    entityType: string;
    start: number;
    end: number;
    text: string;
    operator: string;
  }>;
}

export interface CliDependencies {
  version: string;
  analyze(text: string, language: string): Promise<AnalysisResult[]>;
  anonymize(text: string, language: string): Promise<AnonymizationResult>;
}

export interface CliIo {
  stdout(message: string): void;
  stderr(message: string): void;
}

const USAGE = "Usage: presidio <analyze|anonymize> --text <text> [--language <language>]";

export async function runCli(
  args: string[],
  dependencies: CliDependencies,
  io: CliIo,
): Promise<number> {
  if (args.length === 1 && args[0] === "--version") {
    io.stdout(`${dependencies.version}\n`);
    return 0;
  }

  if (args.length === 1 && (args[0] === "--help" || args[0] === "-h")) {
    io.stdout(`${USAGE}\n`);
    return 0;
  }

  const [command, ...options] = args;
  if (command !== "analyze" && command !== "anonymize") {
    io.stderr(`Error: expected \"analyze\" or \"anonymize\".\n${USAGE}\n`);
    return 1;
  }

  const parsed = parseOptions(options);
  if (!parsed.ok) {
    io.stderr(`Error: ${parsed.error}\n${USAGE}\n`);
    return 1;
  }

  const { text, language } = parsed;
  try {
    const result =
      command === "analyze"
        ? { results: await dependencies.analyze(text, language) }
        : await dependencies.anonymize(text, language);
    io.stdout(`${JSON.stringify(result)}\n`);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    io.stderr(`Error: ${message}\n`);
    return 1;
  }
}

function parseOptions(
  args: string[],
): { ok: true; text: string; language: string } | { ok: false; error: string } {
  let text: string | undefined;
  let language = "en";

  for (let index = 0; index < args.length; index += 1) {
    const option = args[index];
    if (option !== "--text" && option !== "--language") {
      return { ok: false, error: `unknown option \"${option}\"` };
    }
    const value = args[index + 1];
    if (value === undefined || value.startsWith("--")) {
      return { ok: false, error: `option \"${option}\" requires a value` };
    }
    if (option === "--text") {
      if (text !== undefined)
        return { ok: false, error: 'option "--text" may only be provided once' };
      text = value;
    } else {
      language = value;
    }
    index += 1;
  }

  if (text === undefined) return { ok: false, error: 'option "--text" is required' };
  return { ok: true, text, language };
}
