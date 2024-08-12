import { LLMFactory } from './llm-factory';
import { delay } from '../utils';
import { ProductAnalysisState } from '../types';
import { PromptManager } from './prompt-manager';
import { Logger } from '../core/logger';
import { ReferenceIndexer } from './reference-indexer';

export class AnalysisWriter {
  constructor(
    private readonly llmFactory: LLMFactory,
    private readonly logger: Logger,
    private readonly promptManager: PromptManager,
    private readonly referenceIndexer: ReferenceIndexer,
  ) {}

  async writeSections(
    state: ProductAnalysisState,
  ): Promise<Partial<ProductAnalysisState>> {
    const sectionPrompt = this.promptManager.getPrompt('write_section');
    const sectionChain = sectionPrompt.pipe(
      this.llmFactory.getLongContextLLM(),
    );

    this.logger.startSpinner('Writing analysis sections');
    const sections = await Promise.all(
      state.outline.sections.map(async (section) => {
        await delay(1000);
        this.logger.updateSpinner(`Writing section: ${section.section_title}`);

        const relevantDocs = await this.referenceIndexer.similaritySearch(
          section.section_title,
        );
        const relevantReferences = relevantDocs
          .map((doc) => doc.pageContent)
          .join('\n\n');

        const content = await sectionChain.invoke({
          product: state.product,
          productType: state.productType,
          section: JSON.stringify(section),
          interviews: JSON.stringify(state.interview_results),
          relevantReferences: relevantReferences,
        });
        return {
          section_title: section.section_title,
          content: content.content as string,
        };
      }),
    );
    this.logger.stopSpinner('All sections written successfully');

    return { sections };
  }

  async writeAnalysis(
    state: ProductAnalysisState,
  ): Promise<Partial<ProductAnalysisState>> {
    const analysisPrompt = this.promptManager.getPrompt('write_full_analysis');
    const analysisChain = analysisPrompt.pipe(
      this.llmFactory.getLongContextLLM(),
    );

    this.logger.startSpinner('Writing full analysis');
    await delay(1000);

    const relevantDocs = await this.referenceIndexer.similaritySearch(state.product);
    const relevantReferences = relevantDocs.map(doc => doc.pageContent).join('\n\n');

    let analysis = await analysisChain.invoke({
      product: state.product,
      productType: state.productType,
      sections: JSON.stringify(state.sections),
      relevantReferences: relevantReferences
    });

    let fullAnalysis = analysis.content as string;
    let metadata = analysis.response_metadata;
    let remainingSections = [...state.sections];

    while (metadata?.['finish_reason'] === 'length') {
      this.logger.info('Analysis truncated. Generating continuation...');

      const coveredSections = this.identifyCoveredSections(
        fullAnalysis,
        remainingSections,
      );
      remainingSections = remainingSections.filter(
        (section) => !coveredSections.includes(section.section_title),
      );

      const continuation = await this.generateAnalysisContinuation(
        state,
        fullAnalysis,
        remainingSections,
      );
      fullAnalysis += '\n' + continuation;

      analysis = await this.llmFactory.getLongContextLLM().invoke(continuation);
      metadata = analysis.response_metadata;
    }

    this.logger.stopSpinner('Full analysis written successfully');

    return { analysis: fullAnalysis };
  }

  private identifyCoveredSections(
    content: string,
    sections: Array<{ section_title: string; content: string }>,
  ): string[] {
    return sections
      .filter((section) => content.includes(section.section_title))
      .map((section) => section.section_title);
  }

  private async generateAnalysisContinuation(
    state: ProductAnalysisState,
    previousContent: string,
    remainingSections: Array<{ section_title: string; content: string }>,
  ): Promise<string> {
    const continuationPrompt =
      this.promptManager.getPrompt('continue_analysis');
    const continuationChain = continuationPrompt.pipe(
      this.llmFactory.getLongContextLLM(),
    );
    await delay(1000);

    const continuation = await continuationChain.invoke({
      product: state.product,
      productType: state.productType,
      previous_content: previousContent,
      remaining_sections: remainingSections
        .map((section) => section.section_title)
        .join('\n'),
    });

    return continuation.content as string;
  }
}
