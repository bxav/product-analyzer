# Product Analyzer Monorepo

## Overview

This monorepo contains the Product Analyzer CLI, a powerful tool leveraging advanced language models and a sophisticated graph-based approach to provide comprehensive analyses of digital products.

## Repository Structure

```
product-analyzer/
├── apps/
│   └── cli/               # Command-line interface for product analysis
├── packages/
│   ├── ai/                # Core AI functionality
│   └── config/            # Shared configuration
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/bxav/product-analyzer.git
   cd product-analyzer
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build all packages:
   ```bash
   pnpm run build
   ```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

### Creating a Release

To create a new release:

1. Make your changes and commit them.
2. Create a changeset:
   ```bash
   pnpm changeset
   ```
3. Follow the prompts to specify the type of change (patch, minor, or major) and provide a description.
4. Commit the generated changeset file.
5. Push your changes.

Our CI/CD pipeline will automatically create a pull request to bump the version and update the changelog. Once merged, it will create a new release with built executables for all supported platforms.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This tool uses AI models and web search capabilities. The accuracy and completeness of the analysis depend on the available information and the performance of the underlying models. Always verify critical information from authoritative sources.