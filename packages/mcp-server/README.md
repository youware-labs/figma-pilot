# @youware-labs/figma-pilot-mcp

MCP server that enables AI agents (Claude, etc.) to create and modify Figma designs through natural language.

## Quick Start

### 1. Configure MCP

**Claude Code:**
```bash
claude mcp add figma-pilot -- npx @youware-labs/figma-pilot-mcp
```

**Claude Desktop / Cursor / Other MCP Clients:**

Add to your MCP config file:
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

Once the MCP is configured and the Figma plugin is running, you can ask Claude to:
- "Create a login form in Figma"
- "Add a navigation bar with logo and menu items"
- "Change the selected element's color to blue"
- "Check accessibility and fix any issues"

## Available Tools

| Tool | Description |
|------|-------------|
| `figma_status` | Check connection to Figma plugin |
| `figma_create` | Create elements (frames, text, shapes, buttons, cards) |
| `figma_modify` | Modify existing elements |
| `figma_delete` | Delete elements |
| `figma_query` | Get element details |
| `figma_selection` | Get current selection |
| `figma_append` | Move elements into a container |
| `figma_list_components` | List available components |
| `figma_instantiate` | Create component instances |
| `figma_to_component` | Convert to component |
| `figma_create_variants` | Create component variants |
| `figma_ensure_accessibility` | Check/fix accessibility issues |
| `figma_export` | Export as PNG/SVG/PDF (use after finishing a request to review PNG) |

## Example Usage

```typescript
// Create a card with auto-layout
figma_create({
  type: "card",
  name: "User Card",
  width: 320,
  layout: { direction: "column", gap: 16, padding: 24 },
  children: [
    { type: "text", content: "John Doe", fontSize: 18, fontWeight: 600 },
    { type: "text", content: "john@example.com", fontSize: 14, fill: "#666666" }
  ]
})

// Modify selection
figma_modify({ target: "selection", fill: "#0066FF", cornerRadius: 8 })

// Check accessibility
figma_ensure_accessibility({ target: "page", level: "AA", autoFix: true })

// After finishing a requested change, export PNG for review
figma_export({ target: "selection", format: "png", scale: 2 })
```

## How It Works

```
┌─────────────┐     stdio      ┌─────────────────┐     HTTP      ┌──────────────┐
│   Claude    │ ◄────────────► │  MCP Server     │ ◄───────────► │ Figma Plugin │
│   (or AI)   │                │  (with bridge)  │   port 38451  │              │
└─────────────┘                └─────────────────┘               └──────────────┘
```

The MCP server includes a built-in HTTP bridge that the Figma plugin connects to. No separate server process needed.

## Requirements

- Node.js >= 18
- Figma Desktop app
- The figma-pilot Figma plugin running

## License

MIT
