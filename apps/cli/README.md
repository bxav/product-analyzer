# Product Analyzer CLI

## Overview

Product Analyzer CLI is a powerful command-line tool that leverages advanced language models and a sophisticated graph-based approach to provide comprehensive analyses of digital products. This tool is designed for researchers, product managers, and technology enthusiasts who want to gain deep insights into various digital products and their potential impacts across different domains.

## Features

- Generates detailed outlines for digital product analysis
- Creates diverse expert personas for multi-perspective analysis
- Conducts simulated expert interviews using AI
- Refines analysis outlines based on gathered information
- Writes comprehensive sections for each aspect of the analysis
- Produces a final, detailed analysis report in Markdown format

## Installation

You can install the Product Analyzer CLI globally using npm or pnpm:

```bash
npm install -g product-analyzer
# or
pnpm add -g product-analyzer
```

## Usage

After installation, you can use the CLI as follows:

```bash
product-analyzer analyze "Product Name" --type "product_type" --output analysis.md
```

Replace "Product Name" with the name of the digital product you want to analyze, and "product_type" with a relevant category (e.g., "ai", "saas", "mobile_app", "web_platform", etc.).

## Configuration

Before using the CLI, make sure to set up your environment variables:

1. Create a `.env` file in your home directory.
2. Add the following variables:

```
OPENAI_API_KEY=your_openai_api_key
TAVILY_API_KEY=your_tavily_api_key
```

Replace `your_openai_api_key` and `your_tavily_api_key` with your actual API keys.

## Development

To set up the project for development:

1. Navigate to the CLI package directory:
   ```bash
   cd apps/cli
   ```

2. Install dependencies (if not already done at the root level):
   ```bash
   pnpm install
   ```

3. Build the project:
   ```bash
   pnpm run build
   ```

4. Run the CLI locally:
   ```bash
   node dist/main.js analyze "Product Name" --type "product_type"
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This tool uses AI models and web search capabilities. The accuracy and completeness of the analysis depend on the available information and the performance of the underlying models. Always verify critical information from authoritative sources.