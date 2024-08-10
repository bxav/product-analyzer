import { ChatPromptTemplate } from '@langchain/core/prompts';

export class PromptManagerService {
  private prompts: Map<string, ChatPromptTemplate> = new Map();

  constructor() {
    this.initializePrompts();
  }

  private initializePrompts() {
    // Outline prompts
    this.prompts.set(
      'outline',
      ChatPromptTemplate.fromMessages([
        [
          'system',
          'You are a product analyst. Write an outline for a detailed analysis of a product. Be comprehensive and specific, considering the product type.',
        ],
        ['user', 'Product: {product}\nProduct Type: {productType}'],
      ]),
    );

    this.prompts.set(
      'refine_outline',
      ChatPromptTemplate.fromMessages([
        [
          'system',
          'You are refining the outline of a digital product analysis based on expert interviews. Make the outline comprehensive and specific, considering the product type.',
        ],
        [
          'user',
          'Original outline: {original_outline}\n\nExpert interviews: {interviews}\n\nRefine the outline:',
        ],
      ]),
    );

    // Expert prompts
    this.prompts.set(
      'generate_experts',
      ChatPromptTemplate.fromMessages([
        [
          'system',
          'Create a diverse group of expert personas to contribute to a digital product analysis. Each persona should have a unique perspective on the product type.',
        ],
        [
          'user',
          'Product: {product}\nProduct Type: {productType}\n\nGenerate 4-5 expert personas, each with a name, expertise, role, and brief description of their focus:',
        ],
      ]),
    );

    this.prompts.set(
      'generate_experts',
      ChatPromptTemplate.fromMessages([
        [
          'system',
          'Create a diverse group of expert personas to contribute to a digital product analysis. Each persona should have a unique perspective on the product type.',
        ],
        [
          'user',
          'Product: {product}\nProduct Type: {productType}\n\nGenerate 4-5 expert personas, each with a name, expertise, role, and brief description of their focus:',
        ],
      ]),
    );

    this.prompts.set(
      'expert_question',
      ChatPromptTemplate.fromMessages([
        [
          'system',
          `You are a digital product analyst with a specific focus. Your persona is:
          Name: {name}
          Role: {role}
          Expertise: {expertise}
          Description: {description}
  
          Ask a question to gather information for your digital product analysis. Be specific and relevant to your expertise and the product type.`,
        ],
        [
          'human',
          'Previous conversation:\n{conversation}\n\nAsk your next question:',
        ],
      ]),
    );

    this.prompts.set(
      'expert_answer',
      ChatPromptTemplate.fromMessages([
        [
          'system',
          'You are an expert answering questions for an AI product analyst. Use the provided search results to inform your answer. Provide informative and accurate answers, including relevant citations where possible. Use the format [1], [2], etc. for citations, referring to the numbered search results.',
        ],
        [
          'human',
          'Conversation so far:\n{conversation}\n\nSearch results:\n{search_results}\n\nAnswer the last question:',
        ],
      ]),
    );

    this.prompts.set(
      'write_section',
      ChatPromptTemplate.fromMessages([
        [
          'system',
          'Write a section for a digital product analysis based on the provided outline and expert interviews. Consider the specific product type in your analysis.',
        ],
        [
          'user',
          'Product: {product}\nProduct Type: {productType}\nSection: {section}\nExpert interviews: {interviews}\n\n\nWrite the section content:',
        ],
      ]),
    );

    this.prompts.set(
      'write_full_analysis',
      ChatPromptTemplate.fromMessages([
        [
          'system',
          'You are writing a complete digital product analysis based on the provided sections. Follow a professional and detailed format. Use markdown formatting for headings and subheadings. Ensure each section has a unique title and relevant subsections. Consider the specific product type throughout the analysis.',
        ],
        [
          'user',
          'Product: {product}\nProduct Type: {productType}\n\nSections: {sections}\n\nWrite the complete analysis using proper markdown formatting:',
        ],
      ]),
    );

    this.prompts.set(
      'continue_analysis',
      ChatPromptTemplate.fromMessages([
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
      ]),
    );
  }

  getPrompt(key: string): ChatPromptTemplate {
    const prompt = this.prompts.get(key);
    if (!prompt) {
      throw new Error(`Prompt with key "${key}" not found`);
    }
    return prompt;
  }
}
