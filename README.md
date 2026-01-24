# figma-pilot

A bridge that enables AI agents to create and modify Figma designs through natural language.

让 AI 代理（如 Claude Code、Gemini CLI）能够直接操作 Figma 设计文件。

## One-Line Install (Local) / 一键安装

```bash
git clone https://github.com/youware-labs/figma-pilot.git && cd figma-pilot && ./scripts/install.sh
```

This will:
- Build the project
- Configure Claude Code MCP
- Open Figma plugin folder for manual import

## Quick Start (For Users) / 快速开始

### 1. Configure MCP / 配置 MCP

**Claude Code:**
```bash
claude mcp add figma-pilot -- npx @youware-labs/figma-pilot-mcp
```

**Claude Desktop / Cursor / Gemini CLI:**

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

### 2. Install Figma Plugin / 安装 Figma 插件

1. Download `figma-pilot-plugin-vX.X.X.zip` from [GitHub Releases](https://github.com/youware-labs/figma-pilot/releases)
2. Unzip the file
3. In Figma Desktop: **Plugins → Development → Import plugin from manifest...**
4. Select `manifest.json` from the unzipped folder
5. Run the plugin: **Plugins → Development → figma-pilot**

### 3. Start Using / 开始使用

Ask your AI agent:
```
"Create a card component with a header and body"
"Change the selected frame's background to blue"
"Create a navigation bar with logo and menu items"
"Check accessibility and fix any issues"
```

After finishing a requested change, export a PNG for review:
```
figma_export({ target: "selection", format: "png", scale: 2 })
```

## How It Works / 工作原理

```
┌─────────────┐     stdio      ┌─────────────────┐     HTTP      ┌──────────────┐
│   Claude    │ ◄────────────► │  MCP Server     │ ◄───────────► │ Figma Plugin │
│   (or AI)   │                │  (with bridge)  │   port 38451  │              │
└─────────────┘                └─────────────────┘               └──────────────┘
```

The MCP server includes a built-in HTTP bridge. No separate server process needed.

## Available MCP Tools / 可用工具

| Tool | Description |
|------|-------------|
| `figma_status` | Check connection status |
| `figma_selection` | Get current selection |
| `figma_query` | Query element by ID or name |
| `figma_create` | Create elements (frame, text, rectangle, etc.) |
| `figma_modify` | Modify element properties |
| `figma_delete` | Delete elements |
| `figma_append` | Move elements into a container |
| `figma_list_components` | List available components |
| `figma_instantiate` | Create component instance |
| `figma_to_component` | Convert selection to component |
| `figma_create_variants` | Create component variants |
| `figma_ensure_accessibility` | Check and fix accessibility |
| `figma_audit_accessibility` | Audit accessibility without fixing |
| `figma_bind_token` | Bind a design token to a node |
| `figma_create_token` | Create a design token |
| `figma_sync_tokens` | Import/export design tokens |
| `figma_export` | Export as image (use after finishing a request to review PNG) |

## Development / 开发

For contributors and local development:

```bash
# Clone and build
git clone https://github.com/youware-labs/figma-pilot.git
cd figma-pilot
bun install
bun run build

# Run MCP server locally
bun run packages/mcp-server/dist/index.js

# Or use CLI directly
bun run cli status
bun run cli create --type frame --name "Test" --width 200 --height 100
```

### Project Structure / 项目结构

```
figma-pilot/
├── packages/
│   ├── cli/           # CLI application
│   ├── plugin/        # Figma plugin
│   ├── mcp-server/    # MCP server (npm package)
│   └── shared/        # Shared TypeScript types
├── scripts/
│   └── package-plugin.sh  # Script to package plugin for releases
├── SKILL.md           # Detailed documentation for AI agents
└── README.md
```

### Creating a Release / 发布版本

```bash
# Build everything
bun run build

# Package plugin for GitHub release
chmod +x scripts/package-plugin.sh
./scripts/package-plugin.sh 0.1.0

# Publish MCP server to npm
cd packages/mcp-server
npm publish --access public

# Create GitHub release with plugin zip
gh release create v0.1.0 dist/releases/figma-pilot-plugin-v0.1.0.zip \
  --title "v0.1.0" \
  --notes "Initial release"
```

## Troubleshooting / 故障排除

### Plugin not connecting / 插件无法连接

1. Make sure the MCP server is running (check Claude Code or your AI client)
2. The plugin should show "Connected" status
3. Try closing and reopening the plugin in Figma

### Port 38451 already in use / 端口被占用

```bash
lsof -i :38451
kill <PID>
```

## For AI Agent Developers / AI 开发者

The `SKILL.md` file contains comprehensive documentation designed for AI agents, including:

- Complete command reference with JSON schemas
- Common patterns and workflows
- Best practices for creating complex layouts

## License

MIT
