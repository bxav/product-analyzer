import { LLMFactoryService } from './services/llm-factory.service';
import { ExpertService } from './services/expert.service';
import { OutlineService } from './services/outline.service';
import { AnalysisWritingService } from './services/analysis-writing.service';
import { ProductAnalysisService } from './services/product-analysis.service';
import { SearchService } from './services/search.service';
import { LoggingService } from './services/logging.service';
import { PromptManagerService } from './services/prompt-manager.service';

export class ProductAnalyzerBuilder {
  private llmFactory: LLMFactoryService;
  private expertService?: ExpertService;
  private outlineService?: OutlineService;
  private analysisWritingService?: AnalysisWritingService;
  private productAnalysisService?: ProductAnalysisService;
  private searchService: SearchService;
  private loggingService: LoggingService;
  private promptManagerService: PromptManagerService;

  constructor() {
    this.llmFactory = new LLMFactoryService();
    this.loggingService = new LoggingService();
    this.promptManagerService = new PromptManagerService();
    this.searchService = new SearchService(this.loggingService);
  }

  public build(): ProductAnalysisService {
    this.expertService = new ExpertService(
      this.llmFactory,
      this.searchService,
      this.loggingService,
      this.promptManagerService,
    );

    this.outlineService = new OutlineService(
      this.llmFactory,
      this.loggingService,
      this.promptManagerService,
    );

    this.analysisWritingService = new AnalysisWritingService(
      this.llmFactory,
      this.loggingService,
      this.promptManagerService,
    );

    this.productAnalysisService = new ProductAnalysisService(
      this.expertService,
      this.analysisWritingService,
      this.outlineService,
      this.loggingService,
    );

    return this.productAnalysisService;
  }

  public setOpenAIApiKey(apiKey: string): this {
    process.env['OPENAI_API_KEY'] = apiKey;
    return this;
  }

  public setTavilyApiKey(apiKey: string): this {
    process.env['TAVILY_API_KEY'] = apiKey;
    return this;
  }
}
