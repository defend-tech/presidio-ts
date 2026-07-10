/**
 * Individual item in the anonymization result.
 */
export class EngineResultItem {
  start: number;
  end: number;
  entityType: string;
  text: string;
  operator: string;

  constructor(
    start: number,
    end: number,
    entityType: string,
    text: string,
    operator: string,
  ) {
    this.start = start;
    this.end = end;
    this.entityType = entityType;
    this.text = text;
    this.operator = operator;
  }
}

/**
 * Result of the anonymization process.
 */
export class EngineResult {
  text: string;
  items: EngineResultItem[];

  constructor(text: string, items: EngineResultItem[] = []) {
    this.text = text;
    this.items = items;
  }
}
