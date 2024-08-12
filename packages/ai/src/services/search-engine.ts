import { TavilySearchResults } from '@langchain/community/tools/tavily_search';

import { Logger } from '../core/logger';
import { SearchError } from '../core/errors';

export class SearchEngine {
  constructor(
    private readonly tavilyApiKey: string | undefined,
    private readonly logger: Logger,
  ) {}

  public async performSearch(query: string): Promise<any[]> {
    try {
      return JSON.parse(await this.getTavilySearch().invoke(query));
    } catch (error) {
      this.logger.warn(
        `Search failed for query: "${query}". Error: ${(error as Error).message}`,
      );
      return [];
      // throw new SearchError(
      //   `Search operation failed: ${(error as Error).message}`,
      // );
    }
  }

  private getTavilySearch() {
    if (!this.tavilyApiKey) {
      throw new SearchError('Tavily API key is not provided');
    }
    return new TavilySearchResults({
      apiKey: this.tavilyApiKey,
      maxResults: 3,
    });
  }
}
