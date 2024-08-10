import { AIMessage, HumanMessage } from '@langchain/core/messages';
import { END, START, StateGraph, StateGraphArgs } from '@langchain/langgraph';

import {
  Expert,
  groupExpertSchema,
  InterviewState,
  ProductAnalysisState,
} from '../types';
import { delay } from '../utils';
import { SearchEngine } from './search-engine';
import { LLMFactory } from './llm-factory';
import { PromptManager } from './prompt-manager';
import { Logger } from '../core/logger';

export class ExpertManager {
  constructor(
    private readonly llmFactory: LLMFactory,
    private readonly searchEngine: SearchEngine,
    private readonly logger: Logger,
    private readonly promptManager: PromptManager,
  ) {}

  async generateExperts(
    state: ProductAnalysisState,
  ): Promise<Partial<ProductAnalysisState>> {
    const expertPrompt = this.promptManager.getPrompt('generate_experts');

    this.logger.startSpinner('Generating expert personas');
    const expertChain = expertPrompt.pipe(
      this.llmFactory
        .getLongContextLLM()
        .withStructuredOutput(groupExpertSchema),
    );
    const experts = await expertChain.invoke({
      product: state.product,
      productType: state.productType,
    });
    this.logger.stopSpinner('Expert personas generated successfully');
    return { experts: experts.experts };
  }

  async conductInterviews(
    state: ProductAnalysisState,
  ): Promise<Partial<ProductAnalysisState>> {
    const interviewGraph = this.createInterviewGraph();
    this.logger.startSpinner('Conducting expert interviews');
    const interviewResults = await Promise.all(
      state.experts.map((expert) => {
        return this.conductSingleInterview(
          state.product,
          expert,
          interviewGraph,
        );
      }),
    );
    this.logger.stopSpinner('All expert interviews completed successfully');
    return { interview_results: interviewResults };
  }

  private async conductSingleInterview(
    product: string,
    expert: Expert,
    interviewGraph: ReturnType<typeof this.createInterviewGraph>,
  ) {
    const initialState: InterviewState = {
      messages: [
        new HumanMessage(
          `Let's discuss the AI product: ${product}. What aspects would you like to analyze?`,
        ),
      ],
      references: {},
      expert,
    };
    const finalState = await interviewGraph.invoke(initialState);
    return {
      messages: finalState.messages,
      references: finalState.references,
    };
  }

  private createInterviewGraph() {
    const interviewGraphState: StateGraphArgs<InterviewState>['channels'] = {
      messages: { value: (x, y) => x.concat(y), default: () => [] },
      references: { value: (x, y) => ({ ...x, ...y }), default: () => ({}) },
      expert: { value: (x, y) => y ?? x, default: () => ({}) as Expert },
    };

    return new StateGraph<InterviewState>({ channels: interviewGraphState })
      .addNode('ask_question', this.generateQuestion.bind(this))
      .addNode('answer_question', this.generateAnswer.bind(this))
      .addEdge(START, 'ask_question')
      .addConditionalEdges('ask_question', this.shouldContinue.bind(this), {
        continue: 'answer_question',
        end: END,
      })
      .addEdge('answer_question', 'ask_question')
      .compile();
  }

  private async generateQuestion(
    state: InterviewState,
  ): Promise<Partial<InterviewState>> {
    const questionPrompt = this.promptManager.getPrompt('expert_question');
    const questionChain = questionPrompt.pipe(this.llmFactory.getFastLLM());
    await delay(1000);
    const response = await questionChain.invoke({
      ...state.expert,
      conversation: state.messages
        .map((m) => `${m._getType()}: ${m.content}`)
        .join('\n'),
    });

    return { messages: [new AIMessage(response.content as string)] };
  }

  private async generateAnswer(
    state: InterviewState,
  ): Promise<Partial<InterviewState>> {
    const lastQuestion = state.messages[state.messages.length - 1]
      ?.content as string;
    const searchResults = await this.searchEngine.performSearch(lastQuestion);
    const formattedResults = this.formatSearchResults(searchResults);

    const answerPrompt = this.promptManager.getPrompt('expert_answer');
    const answerChain = answerPrompt.pipe(this.llmFactory.getLongContextLLM());
    await delay(1000);
    const response = await answerChain.invoke({
      conversation: state.messages
        .map((m) => `${m._getType()}: ${m.content}`)
        .join('\n'),
      search_results: formattedResults,
    });

    const newReferences = this.createReferences(searchResults);

    return {
      messages: [new AIMessage(response.content as string)],
      references: newReferences,
    };
  }

  private createReferences(results: any[]): Record<string, string> {
    return results.reduce((acc, result, index) => {
      acc[result.url] = `[${index + 1}] ${result.title}`;
      return acc;
    }, {});
  }

  private formatSearchResults(results: any[]): string {
    if (results.length === 0) {
      return 'No search results available.';
    }
    return results
      .map(
        (result, index) =>
          `[${index + 1}] ${result.title}\n${result.content}\nURL: ${result.url}`,
      )
      .join('\n\n');
  }

  private shouldContinue(state: InterviewState): 'continue' | 'end' {
    const lastMessage = state.messages[state.messages.length - 1];
    return (lastMessage?.content as string)
      .toLowerCase()
      .includes('thank you') || state.messages.length >= 10
      ? 'end'
      : 'continue';
  }
}
