# figma-pilot

[![npm version](https://img.shields.io/npm/v/@youware-labs/figma-pilot-mcp)](https://www.npmjs.com/package/@youware-labs/figma-pilot-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

> A bridge that enables AI agents to create and modify Figma designs through natural language.

**English** | [中文](./README.zh-CN.md)

figma-pilot is an MCP (Model Context Protocol) server that allows AI agents like Claude, Gemini, and other LLMs to directly interact with Figma design files. Create layouts, modify components, check accessibility, and export designs—all through natural language commands.

## Why figma-pilot

Unlike other Figma automation tools, figma-pilot is **designed specifically for AI agents**:

| Feature | figma-pilot | Traditional Figma APIs |
|---------|-------------|----------------------|
| **Semantic Operations** | High-level commands like `create card`, `create button` with auto-layout | Low-level node manipulation |
| **LLM-Optimized** | Tool schemas designed for natural language understanding | Technical API requiring precise parameters |
| **Target by Name** | `target: "name:Header"` - human-readable element targeting | Requires exact node IDs |
| **Built-in Presets** | Semantic types (`card`, `button`, `nav`, `form`) with sensible defaults | Must specify every property |
| **Nested Creation** | Create complex hierarchies in a single call with `children` | Multiple sequential API calls |
| **Accessibility First** | Built-in WCAG checking and auto-fixing | Manual implementation required |

### Key Differentiators

1. **Semantic API Design**: Instead of low-level Figma node manipulation, figma-pilot provides high-level operations that match how designers think. Create a "card" or "navigation bar" rather than manually constructing frames with specific properties.

2. **Universal MCP Support**: Works with any MCP-compatible AI client—Claude Desktop, Claude Code, Cursor, Codex, and more. One integration, all platforms.

3. **Zero Configuration Bridge**: The MCP server includes a built-in HTTP bridge. No separate server processes, no complex setup. Just install and connect.

4. **AI-Native Targeting**: Target elements by name (`"name:Hero Section"`) instead of cryptic node IDs. The AI can reference elements the same way a human would describe them.

5. **Declarative Nested Layouts**: Create complex component hierarchies in a single operation using the `children` parameter, rather than making dozens of sequential API calls.

## Features

- **Natural Language Design** - Create and modify Figma designs using plain English
- **Universal MCP Support** - Works with any MCP-compatible client: Claude Desktop, Claude Code, Cursor, Codex, and more
- **Component Support** - Create, instantiate, and manage Figma components
- **Accessibility Tools** - Built-in WCAG compliance checking and auto-fixing
- **Design Tokens** - Create and bind design tokens for consistent styling
- **Semantic Types** - Pre-styled components like `card`, `button`, `nav`, `form`
- **Auto-layout** - Automatic layout management with gap, padding, and alignment
- **Font Control** - Full typography support with custom fonts, weights, and styles

## Quick Start

### Prerequisites

- Node.js >= 18
- Bun (recommended) or npm/yarn
- Figma Desktop app
- An MCP-compatible AI client (see [Supported Clients](#supported-mcp-clients) below)

### One-Line Install

```bash
git clone https://github.com/youware-labs/figma-pilot.git && cd figma-pilot && ./scripts/install.sh
```

This will:
- Build the project
- Configure Claude Code MCP (if available)
- Open the Figma plugin folder for manual import

### Manual Setup

#### 1. Install the MCP Server

figma-pilot works with any MCP-compatible client. Choose your client below:

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

#### 2. Install the Figma Plugin

1. Download `figma-pilot-plugin-vX.X.X.zip` from [GitHub Releases](https://github.com/youware-labs/figma-pilot/releases)
2. Unzip the file
3. In Figma Desktop: **Plugins > Development > Import plugin from manifest...**
4. Select `manifest.json` from the unzipped folder
5. Run the plugin: **Plugins > Development > figma-pilot**

#### 3. Verify Connection

Ask your AI agent:
```
Check the Figma connection status
```

Or use the CLI:
```bash
npx @youware-labs/figma-pilot-mcp
# Then in another terminal or via MCP client, call figma_status
```

## Usage Examples

### Creating a Card Component

```
Create a card component with a header and body section. The header should have a title and the body should have descriptive text.
```

### Modifying Elements

```
Change the selected frame's background color to blue and add rounded corners.
```

### Building a Navigation Bar

```
Create a navigation bar with a logo on the left, menu items in the center (Home, About, Contact), and a Sign Up button on the right.
```

### Accessibility Check

```
Check accessibility for the current selection and fix any issues automatically.
```

### Export for Review

After completing a design, export it for review:
```
Export the current selection as a PNG at 2x scale
```

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `figma_status` | Check connection status to Figma plugin |
| `figma_query` | Query elements by ID, name, or selection |
| `figma_create` | Create elements (frame, text, rectangle, button, card, etc.) |
| `figma_modify` | Modify element properties |
| `figma_delete` | Delete elements |
| `figma_append` | Move elements into a container |
| `figma_list_components` | List available components |
| `figma_instantiate` | Create component instance |
| `figma_to_component` | Convert selection to component |
| `figma_create_variants` | Create component variants |
| `figma_accessibility` | Check and optionally fix accessibility issues (WCAG) |
| `figma_bind_token` | Bind a design token to a node |
| `figma_create_token` | Create a design token |
| `figma_sync_tokens` | Import/export design tokens |
| `figma_export` | Export as image (PNG/SVG/PDF/JPG) |

For detailed tool documentation, see [skills/SKILL.md](./skills/SKILL.md).

## Supported MCP Clients

figma-pilot is designed to work with any client that supports the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/). Here are some popular clients:

| Client | Config Location | Documentation |
|--------|----------------|--------------|
| **Claude Desktop** | `~/.config/claude/claude_desktop_config.json` (macOS/Linux)<br>`%APPDATA%\Claude\claude_desktop_config.json` (Windows) | [Claude Desktop MCP](https://claude.ai/docs/mcp) |
| **Claude Code** | Via CLI: `claude mcp add` | [Claude Code Docs](https://claude.ai/code) |
| **Cursor** | `~/.cursor/mcp.json` or Settings > MCP | [Cursor MCP Docs](https://cursor.sh/docs/mcp) |
| **Codex** | Varies by installation | Check Codex documentation |
| **Other MCP Clients** | Varies | Check your client's MCP documentation |

All clients use the same configuration format:

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

## Architecture

```
┌─────────────┐     stdio      ┌─────────────────┐     HTTP      ┌──────────────┐
│ MCP Client  │ <------------> │  MCP Server     │ <-----------> │ Figma Plugin │
│(Claude/Cursor               │  (with bridge)  │   port 38451  │              │
│  /Codex/etc)│                └─────────────────┘               └──────────────┘
└─────────────┘
```

The MCP server includes a built-in HTTP bridge that the Figma plugin connects to. No separate server process needed.

### Components

- **MCP Server** (`packages/mcp-server`) - MCP protocol server that exposes Figma operations as tools
- **Figma Plugin** (`packages/plugin`) - Figma plugin that receives HTTP requests and executes operations
- **CLI** (`packages/cli`) - Command-line interface for direct Figma operations
- **Shared** (`packages/shared`) - Shared TypeScript types and utilities

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
│   └── package-plugin.sh  # Plugin packaging script
├── skills/            # Detailed documentation for AI agents
│   ├── SKILL.md       # Main skill index
│   └── rules/         # Individual rule files
└── README.md
```

### Building from Source

```bash
# Clone the repository
git clone https://github.com/youware-labs/figma-pilot.git
cd figma-pilot

# Install dependencies
bun install

# Build all packages
bun run build

# Run MCP server locally
bun run packages/mcp-server/dist/index.js

# Or use CLI directly
bun run cli status
bun run cli create --type frame --name "Test" --width 200 --height 100
```

### Running the Plugin in Development

```bash
# Watch mode for plugin development
bun run dev:plugin
```

Then import the plugin from `packages/plugin/manifest.json` in Figma Desktop.

## Creating a Release

```bash
# Build everything
bun run build

# Package plugin for GitHub release
chmod +x scripts/package-plugin.sh
./scripts/package-plugin.sh 0.1.6

# Publish MCP server to npm (requires npm login)
cd packages/mcp-server
npm publish --access public

# Create GitHub release with plugin zip
gh release create v0.1.6 dist/releases/figma-pilot-plugin-v0.1.6.zip \
  --title "v0.1.6" \
  --notes "Release notes here"
```

## Troubleshooting

### Plugin Not Connecting

1. Make sure the MCP server is running (check your AI client's MCP status)
2. The plugin should show "Connected" status in Figma
3. Try closing and reopening the plugin in Figma
4. Check that port 38451 is not blocked by firewall

### Port 38451 Already in Use

```bash
# Find the process using the port
lsof -i :38451

# Kill the process
kill <PID>
```

### MCP Server Not Found

If using `npx`, ensure you have a stable internet connection. For offline use, install globally:

```bash
npm install -g @youware-labs/figma-pilot-mcp
```

Then update your MCP config to use the global installation.

### Build Errors

Make sure you have Bun installed:

```bash
curl -fsSL https://bun.sh/install | bash
```

Or use npm/yarn, but you may need to adjust build scripts.

## Contributing

We welcome contributions. Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Documentation

- [skills/SKILL.md](./skills/SKILL.md) - Complete API reference for AI agents
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Acknowledgments

Built with:
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Figma Plugin API](https://www.figma.com/plugin-docs/)
- [Bun](https://bun.sh/)

---

**[YouWare Labs](https://github.com/youware-labs)**
