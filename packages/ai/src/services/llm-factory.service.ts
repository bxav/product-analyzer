import { ChatOpenAI } from '@langchain/openai';

export class LLMFactoryService {
  private fastLLM?: ChatOpenAI;
  private longContextLLM?: ChatOpenAI;

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

  createFastLLM(): ChatOpenAI {
    return new ChatOpenAI({
      temperature: 0,
      modelName: 'gpt-4o-mini',
      //openAIApiKey: process.env['OPENAI_API_KEY'] || '',
    });
  }

  createLongContextLLM(): ChatOpenAI {
    return new ChatOpenAI({
      temperature: 0,
      modelName: 'gpt-4o',
      //openAIApiKey: process.env['OPENAI_API_KEY'] || '',
    });
  }
}