import { LLMFactory } from './llm-factory';
import { delay } from '../utils';
import { PromptManager } from './prompt-manager';
import { ProductAnalysisState, productOutlineSchema } from '../types';
import { Logger } from '../core/logger';

export class OutlineGenerator {
  constructor(
    private readonly llmFactory: LLMFactory,
    private readonly logger: Logger,
    private readonly promptManager: PromptManager,
  ) {}

  async generateOutline(
    state: ProductAnalysisState,
  ): Promise<Partial<ProductAnalysisState>> {
    const outlinePrompt = this.promptManager.getPrompt('outline');

    this.logger.startSpinner('Generating initial outline');
    const outlineChain = outlinePrompt.pipe(
      this.llmFactory.getFastLLM().withStructuredOutput(productOutlineSchema),
    );
    const outline = await outlineChain.invoke({
      product: state.product,
      productType: state.productType,
    });
    this.logger.stopSpinner('Initial outline generated successfully');
    return { outline };
  }

  async refineOutline(
    state: ProductAnalysisState,
  ): Promise<Partial<ProductAnalysisState>> {
    const refinePrompt = this.promptManager.getPrompt('refine_outline');

    const refineChain = refinePrompt.pipe(
      this.llmFactory
        .getLongContextLLM()
        .withStructuredOutput(productOutlineSchema),
    );
    this.logger.startSpinner('Refining outline based on expert interviews');
    await delay(1000);
    const refinedOutline = await refineChain.invoke({
      original_outline: JSON.stringify(state.outline),
      interviews: JSON.stringify(state.interview_results),
    });
    this.logger.stopSpinner('Outline refined successfully');
    return { outline: refinedOutline };
  }
}
