import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AnalyzeProductCommand } from './commands/analyze-product.command';
import { CLILogger } from './services/cli-logger.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [AnalyzeProductCommand, CLILogger],
})
export class AppModule {}
