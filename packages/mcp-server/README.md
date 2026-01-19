# @youware-labs/figma-pilot-mcp

MCP server that enables AI agents (Claude, etc.) to create and modify Figma designs through natural language.

## Quick Start

### 1. Install the Figma Plugin

1. Clone the repo: `git clone https://github.com/anthropics/figma-pilot.git`
2. In Figma Desktop: **Plugins → Development → Import plugin from manifest**
3. Select `packages/plugin/manifest.json`
4. Run the plugin in your Figma file

### 2. Start the Bridge Server

```bash
# In the cloned repo
cd figma-pilot
bun install && bun run build
bun run cli serve
```

Keep this running while using the MCP server.

### 3. Configure MCP

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

## Available Tools

| Tool | Description |
|------|-------------|
| `figma_status` | Check connection to Figma plugin |
| `figma_create` | Create elements (frames, text, shapes, buttons, cards) |
| `figma_modify` | Modify existing elements |
| `figma_delete` | Delete elements |
| `figma_query` | Get element details |
| `figma_selection` | Get current selection |
| `figma_list_components` | List available components |
| `figma_instantiate` | Create component instances |
| `figma_to_component` | Convert to component |
| `figma_create_variants` | Create component variants |
| `figma_ensure_accessibility` | Check/fix accessibility issues |
| `figma_export` | Export as PNG/SVG/PDF |

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
```

## Requirements

- Node.js >= 18
- Figma Desktop app
- The figma-pilot Figma plugin running
- Bridge server running (`bun run cli serve`)

## License

MIT
