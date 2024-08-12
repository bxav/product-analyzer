import { OpenAIEmbeddings } from '@langchain/openai';

import { LLMFactory } from './services/llm-factory';
import { Logger } from './core/logger';
import { ProductAnalyzer } from './services/product-analyzer';
import { PromptManager } from './services/prompt-manager';
import { SearchEngine } from './services/search-engine';
import { ExpertManager } from './services/expert-manager';
import { OutlineGenerator } from './services/outline-generator';
import { AnalysisWriter } from './services/analysis-writer';
import { ReferenceIndexer } from './services/reference-indexer';

export interface ProductAnalyzerConfig {
  openAIApiKey?: string;
  azureOpenAIApiKey?: string;
  tavilyApiKey?: string;
}

export class ProductAnalyzerBuilder {
  private config: ProductAnalyzerConfig;
  private logger: Logger;

  constructor(config: ProductAnalyzerConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }

  public build(): ProductAnalyzer {
    const llmFactory = new LLMFactory(this.config);
    const promptManager = new PromptManager();
    const searchEngine = new SearchEngine(
      this.config.tavilyApiKey,
      this.logger,
    );

    const expertManager = new ExpertManager(
      llmFactory,
      searchEngine,
      this.logger,
      promptManager,
    );

    const outlineGenerator = new OutlineGenerator(
      llmFactory,
      this.logger,
      promptManager,
    );

    const embeddings = new OpenAIEmbeddings();
    const referenceIndexer = new ReferenceIndexer(embeddings);

    const analysisWriter = new AnalysisWriter(
      llmFactory,
      this.logger,
      promptManager,
      referenceIndexer,
    );

    return new ProductAnalyzer(
      expertManager,
      analysisWriter,
      outlineGenerator,
      referenceIndexer,
      this.logger,
    );
  }
}
