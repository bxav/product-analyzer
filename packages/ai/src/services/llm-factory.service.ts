import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
//import { ConfigService } from '@nestjs/config';

@Injectable()
export class LLMFactoryService {
  private fastLLM?: ChatOpenAI;
  private longContextLLM?: ChatOpenAI;

  //constructor(private configService: ConfigService) {}

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
      //openAIApiKey: this.configService.get<string>('OPENAI_API_KEY') as string,
    });
  }

  createLongContextLLM(): ChatOpenAI {
    return new ChatOpenAI({
      temperature: 0,
      modelName: 'gpt-4o',
      //openAIApiKey: this.configService.get<string>('OPENAI_API_KEY') as string,
    });
  }
}
