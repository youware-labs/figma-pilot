# Contributing to figma-pilot

Thank you for your interest in contributing to figma-pilot! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the issue list as you might find out that you don't need to create one. When creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples to demonstrate the steps**
- **Describe the behavior you observed after following the steps**
- **Explain which behavior you expected to see instead and why**
- **Include screenshots and animated GIFs if applicable**
- **Include system information** (OS, Node.js version, Figma version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a step-by-step description of the suggested enhancement**
- **Provide specific examples to demonstrate the steps**
- **Describe the current behavior and explain which behavior you expected to see instead**
- **Explain why this enhancement would be useful**

### Pull Requests

- Fill in the required template
- Do not include issue numbers in the PR title
- Include screenshots and animated GIFs in your pull request whenever possible
- Follow the TypeScript and code styleguides
- Include thoughtfully-worded, well-structured tests
- Document new code based on the Documentation Styleguide
- End all files with a newline

## Development Setup

### Prerequisites

- Node.js >= 18
- Bun (recommended) or npm/yarn
- Figma Desktop app
- Git

### Getting Started

1. **Fork the repository**

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/figma-pilot.git
   cd figma-pilot
   ```

3. **Install dependencies:**
   ```bash
   bun install
   ```

4. **Build the project:**
   ```bash
   bun run build
   ```

5. **Set up the development environment:**
   - Import the plugin from `packages/plugin/manifest.json` in Figma Desktop
   - Run the MCP server locally: `bun run packages/mcp-server/dist/index.js`
   - Or use the CLI: `bun run cli status`

### Development Workflow

1. Create a branch from `master`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Test your changes:
   ```bash
   # Build
   bun run build
   
   # Run tests (if available)
   # bun test
   
   # Test the plugin in Figma
   # Test the MCP server with your AI client
   ```

4. Commit your changes:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a Pull Request on GitHub

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Follow the existing code style
- Use meaningful variable and function names
- Add JSDoc comments for public APIs
- Prefer `const` over `let`, avoid `var`

### Code Style

- Use 2 spaces for indentation
- Use single quotes for strings (unless escaping)
- Use trailing commas in multi-line objects/arrays
- Maximum line length: 100 characters
- Use semicolons

### File Structure

- Keep files focused and small
- Group related functionality
- Use descriptive file names
- Place shared types in `packages/shared`

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

Examples:
```
feat: add support for gradient fills
fix: correct accessibility check for text contrast
docs: update README with new installation steps
```

## Project Structure

```
figma-pilot/
├── packages/
│   ├── cli/              # CLI application
│   │   └── src/
│   │       ├── commands/ # CLI commands
│   │       └── utils/    # CLI utilities
│   ├── plugin/           # Figma plugin
│   │   └── src/
│   │       ├── handlers/ # Request handlers
│   │       └── utils/    # Plugin utilities
│   ├── mcp-server/       # MCP server
│   │   └── src/
│   │       └── index.ts  # MCP server entry
│   └── shared/           # Shared types
│       └── src/
│           ├── types.ts  # TypeScript types
│           └── operations.ts # Operation definitions
├── scripts/              # Build and utility scripts
└── .github/             # GitHub templates and workflows
```

## Testing

When adding new features or fixing bugs:

1. **Test in Figma Desktop:**
   - Import the plugin from `packages/plugin/manifest.json`
   - Test all affected operations
   - Verify error handling

2. **Test with MCP clients:**
   - Test with Claude Desktop/Code
   - Test with Cursor
   - Verify tool schemas are correct

3. **Test edge cases:**
   - Invalid inputs
   - Missing selections
   - Network errors
   - Plugin disconnection

## Documentation

- Update README.md if you add new features
- Update SKILL.md if you add new MCP tools
- Add JSDoc comments for public APIs
- Include examples in documentation

## Release Process

Releases are managed by maintainers. When a release is ready:

1. Update version numbers in `package.json` files
2. Update CHANGELOG.md
3. Create a git tag
4. Build and publish to npm
5. Create a GitHub release

## Questions?

If you have questions, please:
- Open an issue with the `question` label
- Check existing issues and discussions
- Review the documentation

Thank you for contributing to figma-pilot! 🎉
