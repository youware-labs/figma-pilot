# figma-pilot

[![npm version](https://img.shields.io/npm/v/@youware-labs/figma-pilot-mcp)](https://www.npmjs.com/package/@youware-labs/figma-pilot-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> AI agents control Figma through code execution.

**English** | [中文](./README.zh-CN.md)

## Demo

### OpenAI Landing Page
> Prompt: "Create an OpenAI style landing page introducing the upcoming GPT 5.3 release on Figma"

<video src="https://github.com/youware-labs/figma-pilot/raw/master/assets/openai.mp4" controls width="100%"></video>

### Manus Design System
> Prompt: "Generate a Manus design system components based on the screenshot, on Figma"

<video src="https://github.com/youware-labs/figma-pilot/raw/master/assets/manus.mp4" controls width="100%"></video>

## Design Philosophy

This project is inspired by Anthropic's [Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp) approach.

Instead of exposing dozens of individual MCP tools (which bloat the context window and slow down agents), figma-pilot provides **only 3 tools**:

| Tool | Description |
|------|-------------|
| `figma_status` | Check connection status |
| `figma_execute` | Execute JavaScript code with full Figma API |
| `figma_get_api_docs` | Get API documentation |

The AI writes code to interact with Figma. This means:
- **90%+ fewer tokens** in tool definitions
- **Batch operations** - modify 100 elements in one call
- **Data filtering** - filter results before returning to context
- **Complex workflows** - loops, conditionals, error handling

## Quick Start

### Prerequisites

- Node.js >= 18
- Figma Desktop app
- An MCP-compatible AI client (Claude Desktop, Claude Code, Cursor, Codex, etc.)

### 1. Install MCP Server

```bash
# Claude Code
claude mcp add figma-pilot -- npx @youware-labs/figma-pilot-mcp

# Other MCP clients - add to your MCP config:
```

```json
{
  "mcpServers": {
    "figma-pilot": {
      "command": "npx",
      "args": ["@youware-labs/figma-pilot-mcp"]
    }
  }
}
```

Config locations:
- **Claude Desktop**: `~/.config/claude/claude_desktop_config.json` (macOS/Linux)
- **Cursor**: `~/.cursor/mcp.json`

### 2. Install Figma Plugin

1. Download `figma-pilot-plugin-vX.X.X.zip` from [Releases](https://github.com/youware-labs/figma-pilot/releases)
2. Unzip the file
3. In Figma: **Plugins > Development > Import plugin from manifest...**
4. Select `manifest.json` from the unzipped folder
5. Run: **Plugins > Development > figma-pilot**

### 3. Verify Connection

Ask your AI agent:
```
Check the Figma connection status
```

## Usage Examples

### Natural Language

```
Create a card with a title and description
```

### What the AI Generates

**Creating a Card:**
```javascript
await figma.create({
  type: 'card',
  name: 'User Card',
  children: [
    { type: 'text', content: 'Card Title', fontSize: 18, fontWeight: 600 },
    { type: 'text', content: 'Description here', fontSize: 14, fill: '#666' }
  ]
});
```

**Batch Modifying Elements:**
```javascript
const { nodes } = await figma.query({ target: 'selection' });
const rects = nodes.filter(n => n.type === 'RECTANGLE');
for (const rect of rects) {
  await figma.modify({ target: rect.id, fill: '#0066FF', cornerRadius: 8 });
}
console.log(`Modified ${rects.length} rectangles`);
```

**Accessibility Check:**
```javascript
const result = await figma.accessibility({ 
  target: 'page', 
  level: 'AA', 
  autoFix: true 
});
console.log(`Fixed ${result.fixedCount} of ${result.totalIssues} issues`);
```

## API Reference

```javascript
// Query & Modify
figma.query({ target })           // Query elements
figma.create({ type, ... })       // Create elements  
figma.modify({ target, ... })     // Modify elements
figma.delete({ target })          // Delete elements
figma.append({ target, parent })  // Move into container

// Components
figma.listComponents()            // List components
figma.instantiate({ component })  // Create instance
figma.toComponent({ target })     // Convert to component
figma.createVariants({ ... })     // Create variants

// Accessibility & Tokens
figma.accessibility({ target })   // WCAG checking
figma.createToken({ ... })        // Create design token
figma.bindToken({ ... })          // Bind token to element

// Export
figma.export({ target, format })  // Export as image
```

Full documentation: [skills/SKILL.md](./skills/SKILL.md)

## Architecture

```
┌─────────────┐     stdio      ┌─────────────────┐     HTTP      ┌──────────────┐
│ MCP Client  │ <------------> │  MCP Server     │ <-----------> │ Figma Plugin │
│             │                │  (with bridge)  │   port 38451  │              │
└─────────────┘                └─────────────────┘               └──────────────┘
```

## Development

### Project Structure

```
figma-pilot/
├── packages/
│   ├── cli/           # CLI application
│   ├── plugin/        # Figma plugin
│   ├── mcp-server/    # MCP server (npm package)
│   └── shared/        # Shared TypeScript types
├── scripts/
│   ├── install.sh     # Installation script
│   └── package-plugin.sh
└── skills/            # API documentation for AI agents
```

### Building from Source

```bash
git clone https://github.com/youware-labs/figma-pilot.git
cd figma-pilot
bun install && bun run build
```

### Creating a Release

```bash
# Build and package
bun run build
./scripts/package-plugin.sh 0.1.6

# Publish to npm
cd packages/mcp-server && npm publish --access public

# Create GitHub release
gh release create v0.1.6 dist/releases/figma-pilot-plugin-v0.1.6.zip \
  --title "v0.1.6" \
  --notes "Release notes here"
```

## Troubleshooting

### Plugin Not Connecting

1. Ensure MCP server is running (check your AI client's MCP status)
2. Plugin should show "Connected" in Figma
3. Try reopening the plugin
4. Check that port 38451 is not blocked

### Port 38451 Already in Use

```bash
lsof -i :38451
kill <PID>
```

### MCP Server Not Found

For offline use, install globally:
```bash
npm install -g @youware-labs/figma-pilot-mcp
```

### Plugin Error: "ENOENT: no such file or directory, lstat '.../dist/main.js'"

This error means the `dist` folder is missing from the plugin directory. This can happen if:
1. The downloaded zip file was incomplete
2. You're using the source code directly without building

**Solution:**

If you have the source code, build the plugin:
```bash
cd packages/plugin
bun install
bun run build
```

Or build from the project root:
```bash
bun run build:plugin
```

After building, verify that `packages/plugin/dist/main.js` and `packages/plugin/dist/ui.html` exist, then import the plugin again in Figma.

## License

MIT - [YouWare Labs](https://github.com/youware-labs)
