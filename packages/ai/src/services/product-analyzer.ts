import {
  StateGraph,
  MemorySaver,
  START,
  StateGraphArgs,
  END,
} from '@langchain/langgraph';

import { ExpertManager } from './expert-manager';
import { ProductAnalysisState } from '../types';
import { AnalysisWriter } from './analysis-writer';
import { OutlineGenerator } from './outline-generator';
import { Logger } from '../core/logger';

export class ProductAnalyzer {
  constructor(
    private readonly expertManager: ExpertManager,
    private readonly analysisWriter: AnalysisWriter,
    private readonly outlineGenerator: OutlineGenerator,
    private readonly logger: Logger,
  ) {}

  async executeProductAnalysis(
    product: string,
    productType: string,
    threadId: string,
  ): Promise<string> {
    try {
      const workflow = this.createWorkflow();
      const app = workflow.compile({ checkpointer: new MemorySaver() });

      const finalState = await app.invoke(
        { product, productType },
        { configurable: { thread_id: threadId } },
      );

      this.logger.success('\nAnalysis completed successfully\n');

      const summary = this.generateSummary(finalState);
      const fullAnalysis = finalState.analysis;

      this.logger.info('\nAnalysis Summary:');
      this.logger.log(summary);

      return fullAnalysis;
    } catch (error) {
      this.logger.stopSpinner();
      this.logger.error('Analysis encountered issues');
      this.logger.error(`Error details: ${(error as Error).message}`);
      if (error instanceof Error && error.stack) {
        this.logger.error(`Stack trace: ${error.stack}`);
      }
      throw error;
    }
  }

  private generateSummary(state: ProductAnalysisState): string {
    const keyPoints = state.sections
      .map((section) => `- ${section.section_title}`)
      .join('\n');

    return `
Product: ${state.product}
Number of sections: ${state.sections.length}
Key points covered:
${keyPoints}
    `;
  }

  private createWorkflow() {
    return new StateGraph<ProductAnalysisState>({
      channels: this.createGraphState(),
    })
      .addNode('generate_outline', (state) =>
        this.outlineGenerator.generateOutline(state),
      )
      .addNode('generate_experts', (state) =>
        this.expertManager.generateExperts(state),
      )
      .addNode('conduct_interviews', (state) =>
        this.expertManager.conductInterviews(state),
      )
      .addNode('refine_outline', (state) =>
        this.outlineGenerator.refineOutline(state),
      )
      .addNode('write_sections', (state) =>
        this.analysisWriter.writeSections(state),
      )
      .addNode('write_analysis', (state) =>
        this.analysisWriter.writeAnalysis(state),
      )
      .addEdge(START, 'generate_outline')
      .addEdge('generate_outline', 'generate_experts')
      .addEdge('generate_experts', 'conduct_interviews')
      .addEdge('conduct_interviews', 'refine_outline')
      .addEdge('refine_outline', 'write_sections')
      .addEdge('write_sections', 'write_analysis')
      .addEdge('write_analysis', END);
  }

  private createGraphState(): StateGraphArgs<ProductAnalysisState>['channels'] {
    return {
      product: { value: (x, y) => y ?? x, default: () => '' },
      productType: { value: (x, y) => y ?? x, default: () => 'generic' },
      outline: {
        value: (x, y) => y ?? x,
        default: () => ({ product_name: '', sections: [] }),
      },
      experts: { value: (x, y) => y ?? x, default: () => [] },
      interview_results: { value: (x, y) => [...x, ...y], default: () => [] },
      sections: { value: (x, y) => [...x, ...y], default: () => [] },
      analysis: { value: (x, y) => y ?? x, default: () => '' },
    };
  }
}
