import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';

import { LLMFactoryService } from './llm-factory.service';
import { delay } from '../utils';
import { ProductAnalysisState } from '../types';
import { LoggingService } from './logging.service';
import { PromptManagerService } from './prompt-manager.service';

@Injectable()
export class AnalysisWritingService {
  private readonly longContextLLM: ChatOpenAI;

  constructor(
    private readonly llmFactoryService: LLMFactoryService,
    private readonly loggingService: LoggingService,
    private readonly promptManager: PromptManagerService,
  ) {
    this.longContextLLM = this.llmFactoryService.createLongContextLLM();
  }

  async writeSections(
    state: ProductAnalysisState,
  ): Promise<Partial<ProductAnalysisState>> {
    const sectionPrompt = this.promptManager.getPrompt('write_section');
    const sectionChain = sectionPrompt.pipe(this.longContextLLM);

    this.loggingService.startSpinner('Writing analysis sections');
    const sections = await Promise.all(
      state.outline.sections.map(async (section) => {
        await delay(1000);
        this.loggingService.updateSpinner(
          `Writing section: ${section.section_title}`,
        );
        const content = await sectionChain.invoke({
          product: state.product,
          productType: state.productType,
          section: JSON.stringify(section),
          interviews: JSON.stringify(state.interview_results),
        });
        return {
          section_title: section.section_title,
          content: content.content as string,
        };
      }),
    );
    this.loggingService.stopSpinner('All sections written successfully');

    return { sections };
  }

  async writeAnalysis(
    state: ProductAnalysisState,
  ): Promise<Partial<ProductAnalysisState>> {
    const analysisPrompt = this.promptManager.getPrompt('write_full_analysis');
    const analysisChain = analysisPrompt.pipe(this.longContextLLM);

    this.loggingService.startSpinner('Writing full analysis');
    await delay(1000);
    let analysis = await analysisChain.invoke({
      product: state.product,
      productType: state.productType,
      sections: JSON.stringify(state.sections),
    });

    let fullAnalysis = analysis.content as string;
    let metadata = analysis.response_metadata;
    let remainingSections = [...state.sections];

    while (metadata?.['finish_reason'] === 'length') {
      this.loggingService.info(
        'Analysis truncated. Generating continuation...',
      );

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

      analysis = await this.longContextLLM.invoke(continuation);
      metadata = analysis.response_metadata;
    }

    this.loggingService.stopSpinner('Full analysis written successfully');

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
    const continuationChain = continuationPrompt.pipe(this.longContextLLM);
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
