export * from './services/analysis-writing.service';
export * from './services/expert.service';
export * from './services/llm-factory.service';
export * from './services/outline.service';
export * from './services/product-analysis.service';
export * from './services/search.service';
export * from './services/logging.service';
export * from './types';
export * from './utils';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnalysisWritingService } from './services/analysis-writing.service';
import { ExpertService } from './services/expert.service';
import { LLMFactoryService } from './services/llm-factory.service';
import { OutlineService } from './services/outline.service';
import { ProductAnalysisService } from './services/product-analysis.service';
import { SearchService } from './services/search.service';
import { LoggingService } from './services/logging.service';

import { ConfigService } from '@nestjs/config';
import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { PromptManagerService } from './services/prompt-manager.service';
@Module({
  imports: [ConfigModule.forRoot()],
  providers: [
    {
      provide: TavilySearchResults,
      useFactory: (configService: ConfigService) => {
        return new TavilySearchResults({
          apiKey: configService.get<string>('TAVILY_API_KEY') || '',
          maxResults: 3,
        });
      },
      inject: [ConfigService],
    },
    LLMFactoryService,
    ExpertService,
    OutlineService,
    AnalysisWritingService,
    ProductAnalysisService,
    SearchService,
    PromptManagerService,
    LoggingService,
  ],
  exports: [
    LLMFactoryService,
    ExpertService,
    OutlineService,
    AnalysisWritingService,
    ProductAnalysisService,
    SearchService,
    PromptManagerService,
    LoggingService,
  ],
})
class AIModule {}

export { AIModule };
