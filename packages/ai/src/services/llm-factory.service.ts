import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';

@Injectable()
export class LLMFactoryService {
  //constructor(private configService: ConfigService) {}

  createFastLLM(): ChatOpenAI {
    return new ChatOpenAI({
      temperature: 0,
      modelName: 'gpt-3.5-turbo',
      //openAIApiKey: this.configService.get<string>('OPENAI_API_KEY') as string,
    });
  }

  createLongContextLLM(): ChatOpenAI {
    return new ChatOpenAI({
      temperature: 0,
      modelName: 'gpt-4',
      //openAIApiKey: this.configService.get<string>('OPENAI_API_KEY') as string,
    });
  }
}
