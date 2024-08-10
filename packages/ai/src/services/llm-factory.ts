import { ChatOpenAI } from '@langchain/openai';
import { ProductAnalyzerConfig } from '../product-analyzer-builder';
import { LLMError } from '../core/errors';

export class LLMFactory {
  private fastLLM?: ChatOpenAI;
  private longContextLLM?: ChatOpenAI;

  constructor(_: ProductAnalyzerConfig) {}

  getFastLLM(): ChatOpenAI {
    if (!this.fastLLM) {
      this.fastLLM = this.createFastLLM();
    }
    return this.fastLLM;
  }

  getLongContextLLM(): ChatOpenAI {
    if (!this.longContextLLM) {
      this.longContextLLM = this.createLongContextLLM();
    }
    return this.longContextLLM;
  }

  private createFastLLM(): ChatOpenAI {
    try {
      return new ChatOpenAI({
        temperature: 0,
        modelName: 'gpt-4o-mini',
        // openAIApiKey: this.config.openAIApiKey,
        // azureOpenAIApiKey: this.config.azureOpenAIApiKey,
      });
    } catch (error) {
      throw new LLMError(
        `Failed to create fast LLM: ${(error as Error).message}`,
      );
    }
  }

  private createLongContextLLM(): ChatOpenAI {
    try {
      return new ChatOpenAI({
        temperature: 0,
        modelName: 'gpt-4o',
        // openAIApiKey: this.config.openAIApiKey,
        // azureOpenAIApiKey: this.config.azureOpenAIApiKey,
      });
    } catch (error) {
      throw new LLMError(
        `Failed to create long context LLM: ${(error as Error).message}`,
      );
    }
  }
}
