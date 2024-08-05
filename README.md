# Product Analyzer Monorepo

## Overview

This monorepo contains a suite of tools for comprehensive digital product analysis, leveraging advanced AI models and sophisticated analytical approaches. The project currently includes a powerful CLI tool and lays the groundwork for future desktop and API implementations.

## Project Structure

```
product-analyzer/
├── apps/
│   └── cli/               # Command-line interface for product analysis
├── packages/
│   ├── core/              # Shared core functionality
│   ├── ui/                # (Future) Shared UI components
│   └── config/            # Shared configuration
├── package.json
├── turbo.json
└── README.md
```

## Features

- CLI tool for detailed digital product analysis
- Utilizes advanced language models (OpenAI's GPT)
- Implements a graph-based approach inspired by STORM methodology
- Generates expert personas for multi-perspective analysis
- Conducts simulated expert interviews
- Produces comprehensive analysis reports in Markdown format

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/bxav/product-analyzer.git
   cd product-analyzer
   ```

2. Install dependencies:
   ```
   pnpm install
   ```

3. Build all packages:
   ```
   pnpm run build
   ```

4. Run the CLI tool:
   ```
   pnpm --filter product-analyzer start
   ```

## Development

- To run all tests: `pnpm run test`
- To lint all packages: `pnpm run lint`
- To start development mode for all packages: `pnpm run dev`

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

This project is inspired by and adapts concepts from the STORM (Synthesis of Topic Outlines through Retrieval and Multi-perspective) example in the LangChain library.