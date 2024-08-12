import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from '@langchain/core/documents';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

import { ProductAnalysisState } from '../types';

export class ReferenceIndexer {
  private vectorStore: MemoryVectorStore;

  constructor(embeddings: OpenAIEmbeddings) {
    this.vectorStore = new MemoryVectorStore(embeddings);
  }

  async indexReferences(
    state: ProductAnalysisState,
  ): Promise<Partial<ProductAnalysisState>> {
    const allDocs: Document[] = [];

    for (const interviewResult of state.interview_results) {
      const docs = Object.entries(interviewResult.references).map(
        ([url, content]) =>
          new Document({ pageContent: content, metadata: { source: url } }),
      );
      allDocs.push(...docs);
    }

    await this.vectorStore.addDocuments(allDocs);

    return { vectorStore: this.vectorStore };
  }

  async similaritySearch(query: string, k = 4): Promise<Document[]> {
    return this.vectorStore.similaritySearch(query, k);
  }
}
