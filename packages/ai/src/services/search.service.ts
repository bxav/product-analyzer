import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { LoggingService } from './logging.service';

export class SearchService {
  constructor(private readonly loggingService: LoggingService) {}

  public async performSearch(query: string): Promise<any[]> {
    try {
      return JSON.parse(await this.getTavilySearch().invoke(query));
    } catch (error) {
      this.loggingService.warn(
        `Search failed for query: "${query}". Error: ${(error as Error).message}`,
      );
      return [];
    }
  }

  private getTavilySearch() {
    return new TavilySearchResults({
      apiKey: process.env['TAVILY_API_KEY'] || '',
      maxResults: 3,
    });
  }
}
