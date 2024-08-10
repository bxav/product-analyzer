import * as fs from 'fs';
import { Command, CommandRunner, Option } from 'nest-commander';
import { input, confirm, password } from '@inquirer/prompts';
import { ConfigService } from '@nestjs/config';

import { ProductAnalyzerBuilder, ProductAnalyzerConfig } from '@repo/ai';

import { CLILogger } from '../services/cli-logger.service';

@Command({ name: 'analyze', description: 'Analyze a digital product' })
export class AnalyzeProductCommand extends CommandRunner {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: CLILogger,
  ) {
    super();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
    const config: ProductAnalyzerConfig = {};

    if (!this.configService.get<string>('AZURE_OPENAI_API_KEY')) {
      config.openAIApiKey = await this.ensureApiKey('OPENAI_API_KEY', 'OpenAI');
    }

    config.tavilyApiKey = await this.ensureApiKey('TAVILY_API_KEY', 'Tavily');

    const productAnalyzer = new ProductAnalyzerBuilder(
      config,
      this.logger,
    ).build();

    let product = passedParams[0];
    let productType = options?.['type'];
    let outputFile = options?.['output'];

    if (!product) {
      product = await input({
        message: 'What product would you like to analyze?',
      });
    }

    if (!productType) {
      productType = await input({ message: 'What type of product is it?' });
    }

    if (!outputFile) {
      const saveToFile = await confirm({
        message: 'Would you like to save the analysis to a file?',
      });
      if (saveToFile) {
        outputFile = await input({
          message: 'Enter the filename to save the analysis:',
          default: 'analysis.md',
        });
      }
    }

    this.logger.startSpinner(`Analyzing ${product} (Type: ${productType})`);

    try {
      const analysis = await productAnalyzer.executeProductAnalysis(
        product,
        productType,
        'thread-id',
      );

      this.logger.stopSpinner('Analysis completed successfully');

      if (!outputFile) {
        this.logger.info('\nFull Analysis:');
        this.logger.log(analysis);
      } else {
        fs.writeFileSync(outputFile, analysis);
        this.logger.info(`\nFull analysis saved to ${outputFile}`);

        this.logger.stopSpinner();
      }
    } catch (error) {
      this.logger.stopSpinner();
      this.logger.error('Analysis process encountered errors');
      this.logger.error(`Error details: ${(error as Error).message}`);
      this.logger.warn('The analysis may be incomplete or contain errors.');
      if (outputFile) {
        this.logger.info(`Check ${outputFile} for any partial results.`);
      }
    }
  }

  private async ensureApiKey(
    envKey: string,
    serviceName: string,
  ): Promise<string> {
    let apiKey = this.configService.get<string>(envKey);
    if (!apiKey) {
      apiKey = await password({
        message: `Please enter your ${serviceName} API key:`,
      });
    }
    return apiKey;
  }

  @Option({
    flags: '-t, --type <type>',
    description: 'Specify the type of digital product',
  })
  parseType(val: string) {
    return val;
  }

  @Option({
    flags: '-o, --output <outputFile>',
    description: 'Specify an output file for the full analysis',
  })
  parseOutput(val: string) {
    return val;
  }
}
