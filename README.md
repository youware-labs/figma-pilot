# figma-pilot

A bridge that enables AI agents to create and modify Figma designs through natural language.

让 AI 代理（如 Claude Code、Gemini CLI）能够直接操作 Figma 设计文件。

## How It Works / 工作原理

```
┌─────────────────────────────────────────────────────────────────┐
│           AI Agent (Claude Code / Gemini CLI / Cursor)          │
│                                                                 │
│   "Create a blue button with text 'Submit'"                     │
│                           │                                     │
│                           ▼                                     │
│   MCP Server translates to: figma_create({type: "frame", ...})  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                   figma-pilot Bridge Server                     │
│                     (localhost:38451)                            │
│                                                                 │
│   • Receives requests via HTTP                                  │
│   • Queues operations for plugin                                │
│   • Returns results to MCP client                               │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Figma Plugin                                │
│                                                                 │
│   • Polls bridge server for pending requests                    │
│   • Executes operations via Figma Plugin API                    │
│   • Sends results back to bridge                                │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
                  ┌─────────────────┐
                  │  Figma Desktop  │
                  │   (Your file)   │
                  └─────────────────┘
```

## Quick Start / 快速开始

### 1. Install / 安装

```bash
git clone https://github.com/anthropics/figma-pilot.git
cd figma-pilot
bun install
bun run build
```

### 2. Install Figma Plugin / 安装 Figma 插件

1. Open Figma Desktop
2. Go to **Plugins → Development → Import plugin from manifest...**
3. Select `packages/plugin/manifest.json`

### 3. Start the Bridge / 启动桥接服务

```bash
# Terminal 1: Start persistent server
bun run cli serve
```

### 4. Connect Figma / 连接 Figma

1. Open your Figma file
2. Run the plugin: **Plugins → Development → figma-pilot**
3. You should see "Connected" in the plugin UI

### 5. Use with AI Agent / 配置 AI 代理

#### Claude Code (One-liner)

```bash
claude mcp add figma-pilot -- bun run $(pwd)/packages/mcp-server/dist/index.js
```

#### Gemini CLI

Add to `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "figma-pilot": {
      "command": "bun",
      "args": ["run", "/path/to/figma-pilot/packages/mcp-server/dist/index.js"]
    }
  }
}
```

#### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "figma-pilot": {
      "command": "bun",
      "args": ["run", "/path/to/figma-pilot/packages/mcp-server/dist/index.js"]
    }
  }
}
```

## Usage Examples / 使用示例

Once connected, you can ask your AI agent:

```
"Create a card component with a header, body, and footer"
"Change the background color of the selected frame to blue"
"List all components in this file"
"Create an instance of the Button component"
"Move these elements into a vertical auto-layout frame"
```

The AI will use the MCP tools to execute these operations in Figma.

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
| `figma_export` | Export as image |

## CLI Commands / CLI 命令

You can also use the CLI directly:

```bash
# Check connection
bun run cli status

# Get current selection
bun run cli selection

# Create a frame
bun run cli create --type frame --name "Container" --width 400 --height 300

# Modify selection
bun run cli modify --target selection --fill "#0066FF"

# Create with JSON
bun run cli create --json '{
  "type": "frame",
  "name": "Card",
  "width": 300,
  "height": 200,
  "fill": "#FFFFFF",
  "cornerRadius": 8
}'

# List components
bun run cli list-components

# Create component instance
bun run cli instantiate --component "name:Button" --parent selection

# Move elements into container
bun run cli append --targets selection --parent "name:Container"
```

## Targeting Elements / 定位元素

Elements can be targeted in multiple ways:

| Format | Example | Description |
|--------|---------|-------------|
| `selection` | `--target selection` | Current Figma selection |
| Node ID | `--target "123:456"` | Specific node by ID |
| By name | `--target "name:MyFrame"` | Find by element name |
| `page` | `--target page` | All elements on current page |

## Project Structure / 项目结构

```
figma-pilot/
├── packages/
│   ├── cli/           # CLI application
│   ├── plugin/        # Figma plugin (polls bridge, executes API calls)
│   ├── mcp-server/    # MCP server (for AI agents)
│   └── shared/        # Shared TypeScript types
├── SKILL.md           # Detailed documentation for AI agents
└── README.md
```

## Development / 开发

```bash
# Install dependencies
bun install

# Build everything
bun run build

# Build only plugin
bun run build:plugin

# Build only CLI
bun run build:cli

# Build only MCP server
bun run build:mcp

# Run CLI commands during development
bun run cli <command>
```

## Troubleshooting / 故障排除

### Plugin not connecting / 插件无法连接

1. Make sure `bun run cli serve` is running
2. Check that the plugin shows the correct bridge URL (`http://localhost:38451`)
3. Try closing and reopening the plugin in Figma

### "Cannot call with documentAccess: dynamic-page" error

This is fixed in the latest version. Make sure to:
1. Rebuild the plugin: `bun run build:plugin`
2. Close and reopen the plugin in Figma

### Port already in use / 端口被占用

```bash
# Find and kill the process using port 38451
lsof -i :38451
kill <PID>
```

## For AI Agent Developers / AI 开发者

The `SKILL.md` file contains comprehensive documentation designed for AI agents, including:

- Complete command reference with JSON schemas
- Common patterns and workflows
- Best practices for creating complex layouts
- Position and hierarchy guidelines

When building an AI agent integration, provide `SKILL.md` as context.

## License

MIT
