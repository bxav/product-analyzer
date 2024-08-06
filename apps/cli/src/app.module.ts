import { Module } from '@nestjs/common';
import { AnalyzeProductCommand } from './commands/analyze-product.command';

import { AIModule } from '@repo/ai';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AIModule,
  ],
  providers: [AnalyzeProductCommand],
})
export class AppModule {}
