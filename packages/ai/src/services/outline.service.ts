import { Injectable } from '@nestjs/common';

import { LLMFactoryService } from '../services/llm-factory.service';
import { delay } from '../utils';
import { ProductAnalysisState, productOutlineSchema } from '../types';
import { LoggingService } from './logging.service';
import { PromptManagerService } from './prompt-manager.service';

@Injectable()
export class OutlineService {
  constructor(
    private readonly llmFactoryService: LLMFactoryService,
    private readonly loggingService: LoggingService,
    private readonly promptManager: PromptManagerService,
  ) {}

  async generateOutline(
    state: ProductAnalysisState,
  ): Promise<Partial<ProductAnalysisState>> {
    const outlinePrompt = this.promptManager.getPrompt('outline');

    this.loggingService.startSpinner('Generating initial outline');
    const outlineChain = outlinePrompt.pipe(
      this.llmFactoryService
        .getFastLLM()
        .withStructuredOutput(productOutlineSchema),
    );
    const outline = await outlineChain.invoke({
      product: state.product,
      productType: state.productType,
    });
    this.loggingService.stopSpinner('Initial outline generated successfully');
    return { outline };
  }

  async refineOutline(
    state: ProductAnalysisState,
  ): Promise<Partial<ProductAnalysisState>> {
    const refinePrompt = this.promptManager.getPrompt('refine_outline');

    const refineChain = refinePrompt.pipe(
      this.llmFactoryService
        .getLongContextLLM()
        .withStructuredOutput(productOutlineSchema),
    );
    this.loggingService.startSpinner(
      'Refining outline based on expert interviews',
    );
    await delay(1000);
    const refinedOutline = await refineChain.invoke({
      original_outline: JSON.stringify(state.outline),
      interviews: JSON.stringify(state.interview_results),
    });
    this.loggingService.stopSpinner('Outline refined successfully');
    return { outline: refinedOutline };
  }
}
