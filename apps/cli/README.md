# Product Analyzer CLI

## Overview
Product Analyzer CLI is a powerful command-line tool that leverages advanced language models and a sophisticated graph-based approach to provide comprehensive analyses of digital products. With the latest updates, it now offers an improved, interactive user experience.

## Installation
You can download the latest version of Product Analyzer CLI using wget or curl. Here are instructions for each operating system:

### Linux
```bash
# Download the CLI
wget https://github.com/bxav/product-analyzer/releases/latest/download/product-analyzer-cli-linux
# Make it executable
chmod +x product-analyzer-cli-linux
# Move it to a directory in your PATH (optional)
sudo mv product-analyzer-cli-linux /usr/local/bin/product-analyzer
```

### macOS
For macOS, we provide two versions: one for Intel-based Macs and one for Apple Silicon (M1/M2) Macs.

To determine your Mac's architecture, open Terminal and run:
```bash
uname -m
```
If it returns `x86_64`, you have an Intel-based Mac. If it returns `arm64`, you have an Apple Silicon Mac.

Download the appropriate version:

For Intel-based Macs:
```bash
curl -L https://github.com/bxav/product-analyzer/releases/latest/download/product-analyzer-cli-macos-x64 -o product-analyzer
```

For Apple Silicon Macs:
```bash
curl -L https://github.com/bxav/product-analyzer/releases/latest/download/product-analyzer-cli-macos-arm64 -o product-analyzer
```

Then, make it executable:
```bash
chmod +x product-analyzer
# Move it to a directory in your PATH (optional)
sudo mv product-analyzer /usr/local/bin/
```

### Windows
```powershell
# Download the CLI using PowerShell
Invoke-WebRequest -Uri https://github.com/bxav/product-analyzer/releases/latest/download/product-analyzer-cli-windows.exe -OutFile product-analyzer.exe
```

## Usage
After installation, you can use the CLI as follows:
```bash
product-analyzer analyze [product name] [options]
```

### Interactive Mode
If you run the command without arguments, or with partial information, the CLI will prompt you for the missing details:

```bash
product-analyzer analyze
```

The CLI will then guide you through a series of questions to gather the necessary information for the analysis.

### Options
- `--type`: Specify the product type
- `--output`: Specify the output file for the analysis

Example:
```bash
product-analyzer analyze "ChatGPT" --type "ai_assistant" --output chatgpt_analysis.md
```

## Configuration
Before using the CLI, set up your environment variables:
1. Create a `.env` file in the same directory as the executable.
2. Add the following variables:
```
OPENAI_API_KEY=your_openai_api_key
TAVILY_API_KEY=your_tavily_api_key
```
Replace `your_openai_api_key` and `your_tavily_api_key` with your actual API keys.

## Features
- Interactive prompts for missing information
- Progress indicators during analysis
- Colored output for improved readability
- Option to save analysis to a file
- Comprehensive product analysis using AI and web search capabilities

## Development

To set up the project for development:

1. Navigate to the CLI package directory:
   ```bash
   cd apps/cli
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Build the project:
   ```bash
   pnpm run build
   ```

4. Run the CLI locally:
   ```bash
   node dist/main.js analyze
   ```

## Contributing
Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer
This tool uses AI models and web search capabilities. The accuracy and completeness of the analysis depend on the available information and the performance of the underlying models. Always verify critical information from authoritative sources.
