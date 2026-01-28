# @youware-labs/figma-pilot-mcp

MCP server that enables AI agents (Claude, Cursor, Codex, and any MCP-compatible client) to create and modify Figma designs through natural language.

**English** | [中文](../../README.zh-CN.md)

## Quick Start

### 1. Configure MCP

**Claude Code:**
```bash
claude mcp add figma-pilot -- npx @youware-labs/figma-pilot-mcp
```

**Claude Desktop:**

Add to your MCP config file (usually `~/.config/claude/claude_desktop_config.json` on macOS/Linux, or `%APPDATA%\Claude\claude_desktop_config.json` on Windows):

**Cursor:**

Add to your Cursor MCP config file (usually `~/.cursor/mcp.json` or in Cursor settings):

**Codex / Other MCP Clients:**

Add to your MCP config file (location varies by client):
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

### 2. Install the Figma Plugin

1. Download `figma-pilot-plugin-vX.X.X.zip` from [GitHub Releases](https://github.com/youware-labs/figma-pilot/releases)
2. Unzip the file
3. In Figma Desktop: **Plugins → Development → Import plugin from manifest**
4. Select the `manifest.json` file from the unzipped folder
5. Run the plugin in your Figma file (Plugins → Development → figma-pilot)

### 3. Start Using

Once the MCP is configured and the Figma plugin is running, you can ask your AI agent to:
- "Create a login form in Figma"
- "Add a navigation bar with logo and menu items"
- "Change the selected element's color to blue"
- "Check accessibility and fix any issues"

## Available Tools

figma-pilot uses **code execution mode** for maximum efficiency:

| Tool | Description |
|------|-------------|
| `figma_status` | Check connection to Figma plugin |
| `figma_execute` | Execute JavaScript with full Figma API access |
| `figma_get_api_docs` | Get detailed API documentation |

### Why Only 3 Tools?

Traditional MCP servers expose many tools, but each tool definition consumes context tokens. With code execution:
- **90%+ fewer tokens** in tool definitions
- **Batch operations** in a single call
- **Data filtering** before returning results
- **Complex logic** with loops and conditionals

## Example Usage

```javascript
// figma_execute: Create a card with auto-layout
await figma.create({
  type: "card",
  name: "User Card",
  width: 320,
  layout: { direction: "column", gap: 16, padding: 24 },
  children: [
    { type: "text", content: "John Doe", fontSize: 18, fontWeight: 600 },
    { type: "text", content: "john@example.com", fontSize: 14, fill: "#666666" }
  ]
});

// figma_execute: Batch modify all selected rectangles
const { nodes } = await figma.query({ target: "selection" });
for (const node of nodes.filter(n => n.type === "RECTANGLE")) {
  await figma.modify({ target: node.id, fill: "#0066FF", cornerRadius: 8 });
}

// figma_execute: Check and fix accessibility
const result = await figma.accessibility({ target: "page", level: "AA", autoFix: true });
console.log(`Fixed ${result.fixedCount} issues`);

// figma_execute: Export for review
await figma.export({ target: "selection", format: "png", scale: 2 });
```

## Available APIs

All operations are available on the `figma` object inside `figma_execute`:

- `figma.status()` - Check connection
- `figma.query({ target })` - Query elements
- `figma.create({ type, ... })` - Create elements
- `figma.modify({ target, ... })` - Modify elements
- `figma.delete({ target })` - Delete elements
- `figma.append({ target, parent })` - Move into container
- `figma.listComponents({ filter? })` - List components
- `figma.instantiate({ component })` - Create instance
- `figma.toComponent({ target })` - Convert to component
- `figma.createVariants({ ... })` - Create variants
- `figma.accessibility({ target })` - WCAG checking
- `figma.createToken({ ... })` - Create design token
- `figma.bindToken({ ... })` - Bind token
- `figma.syncTokens({ ... })` - Import/export tokens
- `figma.export({ target, format })` - Export image

Use `figma_get_api_docs` to get detailed parameter documentation.

## How It Works

```
┌─────────────┐     stdio      ┌─────────────────┐     HTTP      ┌──────────────┐
│ MCP Client  │ ◄────────────► │  MCP Server     │ ◄───────────► │ Figma Plugin │
│(Claude/Cursor│                │  (with bridge)  │   port 38451  │              │
│  /Codex/etc)│                └─────────────────┘               └──────────────┘
└─────────────┘
```

The MCP server includes a built-in HTTP bridge that the Figma plugin connects to. No separate server process needed.

## Requirements

- Node.js >= 18
- Figma Desktop app
- The figma-pilot Figma plugin running

## License

MIT
