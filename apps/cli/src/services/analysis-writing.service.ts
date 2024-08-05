import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';

import { LLMFactoryService } from './llm-factory.service';
import { delay } from '../utils';
import { ProductAnalysisState } from '../types';
import { LoggingService } from './logging.service';

@Injectable()
export class AnalysisWritingService {
  private readonly longContextLLM: ChatOpenAI;

  constructor(
    private readonly llmFactoryService: LLMFactoryService,
    private readonly loggingService: LoggingService,
  ) {
    this.longContextLLM = this.llmFactoryService.createLongContextLLM();
  }

  async writeSections(
    state: ProductAnalysisState,
  ): Promise<Partial<ProductAnalysisState>> {
    const sectionPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'Write a section for a digital product analysis based on the provided outline and expert interviews. Consider the specific product type in your analysis.',
      ],
      [
        'user',
        'Product: {product}\nProduct Type: {productType}\nSection: {section}\nExpert interviews: {interviews}\n\n\nWrite the section content:',
      ],
    ]);
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
    const analysisPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'You are writing a complete digital product analysis based on the provided sections. Follow a professional and detailed format. Use markdown formatting for headings and subheadings. Ensure each section has a unique title and relevant subsections. Consider the specific product type throughout the analysis.',
      ],
      [
        'user',
        'Product: {product}\nProduct Type: {productType}\n\nSections: {sections}\n\nWrite the complete analysis using proper markdown formatting:',
      ],
    ]);
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

      // Remove sections that have been covered
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
    const continuationPrompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        'You are continuing a digital product analysis that was cut off due to length limitations. Pick up where the previous content left off and continue the analysis. Consider the product type and ensure you cover all remaining sections.',
      ],
      [
        'user',
        `Product: {product}
  Product Type: {productType}
  
  Previous content (ending mid-sentence or mid-paragraph):
  
  {previous_content}
  
  Remaining sections to cover:
  {remaining_sections}
  
  Continue the analysis, ensuring you address all remaining sections:`,
      ],
    ]);

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
