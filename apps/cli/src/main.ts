import { CommandFactory } from 'nest-commander';
import { AppModule } from './app.module';

async function bootstrap() {
  await CommandFactory.run(AppModule, ['warn', 'error']);
}

// This check ensures the script can run both as a normal Node.js script and as a SEA
if (require.main === module) {
  bootstrap();
}

export default bootstrap;
