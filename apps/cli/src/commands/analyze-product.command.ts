import { Command, CommandRunner, Option } from 'nest-commander';
import { ProductAnalysisService, LoggingService } from '@repo/ai';
import { input, confirm } from '@inquirer/prompts';

@Command({ name: 'analyze', description: 'Analyze a digital product' })
export class AnalyzeProductCommand extends CommandRunner {
  constructor(
    private readonly analysisService: ProductAnalysisService,
    private readonly loggingService: LoggingService,
  ) {
    super();
  }

  async run(
    passedParams: string[],
    options?: Record<string, any>,
  ): Promise<void> {
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

    this.loggingService.startSpinner(
      `Analyzing ${product} (Type: ${productType})`,
    );

    try {
      const analysis = await this.analysisService.executeProductAnalysis(
        product,
        productType,
        'thread-id',
        outputFile,
      );

      this.loggingService.stopSpinner('Analysis completed successfully');

      if (!outputFile) {
        this.loggingService.info('\nFull Analysis:');
        this.loggingService.log(analysis);
      } else {
        this.loggingService.info(`\nFull analysis saved to ${outputFile}`);
      }
    } catch (error) {
      this.loggingService.stopSpinner();
      this.loggingService.error('Analysis process encountered errors');
      this.loggingService.error(`Error details: ${(error as Error).message}`);
      this.loggingService.warn(
        'The analysis may be incomplete or contain errors.',
      );
      if (outputFile) {
        this.loggingService.info(
          `Check ${outputFile} for any partial results.`,
        );
      }
    }
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
