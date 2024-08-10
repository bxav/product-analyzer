export class AIError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AIError';
  }
}

export class LLMError extends AIError {
  constructor(message: string) {
    super(message);
    this.name = 'LLMError';
  }
}

export class SearchError extends AIError {
  constructor(message: string) {
    super(message);
    this.name = 'SearchError';
  }
}

export class AnalysisError extends AIError {
  constructor(message: string) {
    super(message);
    this.name = 'AnalysisError';
  }
}
