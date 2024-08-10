import { Module } from '@nestjs/common';
import { AnalyzeProductCommand } from './commands/analyze-product.command';

import { ProductAnalyzerBuilder } from '@repo/ai';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [AnalyzeProductCommand, {
    provide: 'PRODUCT_ANALYZER',
    useFactory: () => {
      return new ProductAnalyzerBuilder().build();
    },
  },],
})
export class AppModule {}
