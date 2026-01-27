# figma-pilot

[![npm version](https://img.shields.io/npm/v/@youware-labs/figma-pilot-mcp)](https://www.npmjs.com/package/@youware-labs/figma-pilot-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

> 让 AI 代理通过自然语言创建和修改 Figma 设计。

[English](./README.md) | **中文**

figma-pilot 是一个 MCP（模型上下文协议）服务器，允许 Claude、Gemini 等 AI 代理直接与 Figma 设计文件交互。通过自然语言命令创建布局、修改组件、检查无障碍性并导出设计。

## 为什么选择 figma-pilot

与其他 Figma 自动化工具不同，figma-pilot **专为 AI 代理设计**：

| 特性 | figma-pilot | 传统 Figma API |
|-----|-------------|---------------|
| **语义化操作** | 高级命令如 `create card`、`create button`，自带自动布局 | 低级节点操作 |
| **LLM 优化** | 专为自然语言理解设计的工具模式 | 需要精确参数的技术 API |
| **按名称定位** | `target: "name:Header"` - 人类可读的元素定位 | 需要精确的节点 ID |
| **内置预设** | 语义类型（`card`、`button`、`nav`、`form`）带有合理默认值 | 必须指定每个属性 |
| **嵌套创建** | 使用 `children` 在单次调用中创建复杂层次结构 | 需要多次顺序 API 调用 |
| **无障碍优先** | 内置 WCAG 检查和自动修复 | 需要手动实现 |

### 核心差异化优势

1. **语义化 API 设计**：figma-pilot 提供高级操作，与设计师的思维方式相匹配，而非低级的 Figma 节点操作。创建"卡片"或"导航栏"，而不是手动构建具有特定属性的框架。

2. **通用 MCP 支持**：与任何 MCP 兼容的 AI 客户端配合使用——Claude Desktop、Claude Code、Cursor、Codex 等。一次集成，全平台通用。

3. **零配置桥接**：MCP 服务器包含内置 HTTP 桥接。无需单独的服务器进程，无需复杂设置。安装即可连接。

4. **AI 原生定位**：通过名称定位元素（`"name:Hero Section"`）而非晦涩的节点 ID。AI 可以像人类描述一样引用元素。

5. **声明式嵌套布局**：使用 `children` 参数在单次操作中创建复杂的组件层次结构，而不是进行数十次顺序 API 调用。

## 特性

- **自然语言设计** - 使用自然语言创建和修改 Figma 设计
- **通用 MCP 支持** - 与任何 MCP 兼容客户端配合使用：Claude Desktop、Claude Code、Cursor、Codex 等
- **组件支持** - 创建、实例化和管理 Figma 组件
- **无障碍工具** - 内置 WCAG 合规性检查和自动修复
- **设计令牌** - 创建和绑定设计令牌以实现一致的样式
- **语义类型** - 预样式组件如 `card`、`button`、`nav`、`form`
- **自动布局** - 自动布局管理，包括间距、内边距和对齐
- **字体控制** - 完整的排版支持，包括自定义字体、粗细和样式

## 快速开始

### 前置要求

- Node.js >= 18
- Bun（推荐）或 npm/yarn
- Figma Desktop 应用
- 兼容 MCP 的 AI 客户端（见下方[支持的客户端](#支持的-mcp-客户端)）

### 一键安装

```bash
git clone https://github.com/youware-labs/figma-pilot.git && cd figma-pilot && ./scripts/install.sh
```

这将：
- 构建项目
- 配置 Claude Code MCP（如果可用）
- 打开 Figma 插件文件夹以供手动导入

### 手动设置

#### 1. 安装 MCP 服务器

figma-pilot 与任何 MCP 兼容客户端配合使用。选择您的客户端：

**Claude Code：**
```bash
claude mcp add figma-pilot -- npx @youware-labs/figma-pilot-mcp
```

**Claude Desktop：**

添加到您的 MCP 配置文件（通常是 `~/.config/claude/claude_desktop_config.json`（macOS/Linux）或 `%APPDATA%\Claude\claude_desktop_config.json`（Windows））：

**Cursor：**

添加到您的 Cursor MCP 配置文件（通常是 `~/.cursor/mcp.json` 或在 Cursor 设置中）：

**Codex / 其他 MCP 客户端：**

添加到您的 MCP 配置文件（位置因客户端而异）：

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

#### 2. 安装 Figma 插件

1. 从 [GitHub Releases](https://github.com/youware-labs/figma-pilot/releases) 下载 `figma-pilot-plugin-vX.X.X.zip`
2. 解压文件
3. 在 Figma Desktop 中：**Plugins > Development > Import plugin from manifest...**
4. 选择解压文件夹中的 `manifest.json`
5. 运行插件：**Plugins > Development > figma-pilot**

#### 3. 验证连接

询问您的 AI 代理：
```
检查 Figma 连接状态
```

或使用 CLI：
```bash
npx @youware-labs/figma-pilot-mcp
# 然后在另一个终端或通过 MCP 客户端，调用 figma_status
```

## 使用示例

### 创建卡片组件

```
创建一个带有标题和正文部分的卡片组件。标题应该有一个标题，正文应该有描述性文本。
```

### 修改元素

```
将所选框架的背景颜色改为蓝色并添加圆角。
```

### 构建导航栏

```
创建一个导航栏，左侧有徽标，中间有菜单项（首页、关于、联系），右侧有注册按钮。
```

### 无障碍性检查

```
检查当前选择的无障碍性并自动修复任何问题。
```

### 导出以供审查

完成设计后，导出以供审查：
```
将当前选择导出为 2x 比例的 PNG
```

## 可用的 MCP 工具

| 工具 | 描述 |
|------|------|
| `figma_status` | 检查与 Figma 插件的连接状态 |
| `figma_selection` | 获取当前选择的信息 |
| `figma_query` | 通过 ID 或名称查询元素 |
| `figma_create` | 创建元素（框架、文本、矩形、按钮、卡片等） |
| `figma_modify` | 修改元素属性 |
| `figma_delete` | 删除元素 |
| `figma_append` | 将元素移动到容器中 |
| `figma_list_components` | 列出可用组件 |
| `figma_instantiate` | 创建组件实例 |
| `figma_to_component` | 将选择转换为组件 |
| `figma_create_variants` | 创建组件变体 |
| `figma_ensure_accessibility` | 检查并修复无障碍性问题 |
| `figma_audit_accessibility` | 审核无障碍性但不修复 |
| `figma_bind_token` | 将设计令牌绑定到节点 |
| `figma_create_token` | 创建设计令牌 |
| `figma_sync_tokens` | 导入/导出设计令牌 |
| `figma_export` | 导出为图像（PNG/SVG/PDF/JPG） |

详细的工具文档，请参阅 [skills/SKILL.md](./skills/SKILL.md)。

## 支持的 MCP 客户端

figma-pilot 设计为与任何支持[模型上下文协议 (MCP)](https://modelcontextprotocol.io/) 的客户端配合使用。以下是一些流行的客户端：

| 客户端 | 配置位置 | 文档 |
|--------|---------|------|
| **Claude Desktop** | `~/.config/claude/claude_desktop_config.json` (macOS/Linux)<br>`%APPDATA%\Claude\claude_desktop_config.json` (Windows) | [Claude Desktop MCP](https://claude.ai/docs/mcp) |
| **Claude Code** | 通过 CLI: `claude mcp add` | [Claude Code 文档](https://claude.ai/code) |
| **Cursor** | `~/.cursor/mcp.json` 或设置 > MCP | [Cursor MCP 文档](https://cursor.sh/docs/mcp) |
| **Codex** | 因安装而异 | 查看 Codex 文档 |
| **其他 MCP 客户端** | 因客户端而异 | 查看您客户端的 MCP 文档 |

所有客户端使用相同的配置格式：

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

## 架构

```
┌─────────────┐     stdio      ┌─────────────────┐     HTTP      ┌──────────────┐
│ MCP Client  │ <------------> │  MCP Server     │ <-----------> │ Figma Plugin │
│(Claude/Cursor               │  (with bridge)  │   port 38451  │              │
│  /Codex/etc)│                └─────────────────┘               └──────────────┘
└─────────────┘
```

MCP 服务器包含一个内置的 HTTP 桥接器，Figma 插件连接到该桥接器。无需单独的服务器进程。

### 组件

- **MCP 服务器** (`packages/mcp-server`) - 将 Figma 操作公开为工具的 MCP 协议服务器
- **Figma 插件** (`packages/plugin`) - 接收 HTTP 请求并执行操作的 Figma 插件
- **CLI** (`packages/cli`) - 用于直接 Figma 操作的命令行界面
- **共享** (`packages/shared`) - 共享的 TypeScript 类型和实用程序

## 开发

### 项目结构

```
figma-pilot/
├── packages/
│   ├── cli/           # CLI 应用程序
│   ├── plugin/        # Figma 插件
│   ├── mcp-server/    # MCP 服务器（npm 包）
│   └── shared/        # 共享的 TypeScript 类型
├── scripts/
│   ├── install.sh     # 安装脚本
│   └── package-plugin.sh  # 插件打包脚本
├── skills/            # AI 代理的详细文档
│   ├── SKILL.md       # 主技能索引
│   └── rules/         # 各个规则文件
└── README.md
```

### 从源码构建

```bash
# 克隆仓库
git clone https://github.com/youware-labs/figma-pilot.git
cd figma-pilot

# 安装依赖
bun install

# 构建所有包
bun run build

# 本地运行 MCP 服务器
bun run packages/mcp-server/dist/index.js

# 或直接使用 CLI
bun run cli status
bun run cli create --type frame --name "Test" --width 200 --height 100
```

### 在开发中运行插件

```bash
# 插件开发的监视模式
bun run dev:plugin
```

然后从 Figma Desktop 中的 `packages/plugin/manifest.json` 导入插件。

## 创建发布版本

```bash
# 构建所有内容
bun run build

# 为 GitHub 发布打包插件
chmod +x scripts/package-plugin.sh
./scripts/package-plugin.sh 0.1.6

# 发布 MCP 服务器到 npm（需要 npm 登录）
cd packages/mcp-server
npm publish --access public

# 使用插件 zip 创建 GitHub 发布
gh release create v0.1.6 dist/releases/figma-pilot-plugin-v0.1.6.zip \
  --title "v0.1.6" \
  --notes "发布说明"
```

## 故障排除

### 插件无法连接

1. 确保 MCP 服务器正在运行（检查您的 AI 客户端的 MCP 状态）
2. 插件应在 Figma 中显示"已连接"状态
3. 尝试在 Figma 中关闭并重新打开插件
4. 检查端口 38451 是否被防火墙阻止

### 端口 38451 已被使用

```bash
# 查找使用该端口的进程
lsof -i :38451

# 终止进程
kill <PID>
```

### 找不到 MCP 服务器

如果使用 `npx`，请确保您有稳定的互联网连接。对于离线使用，请全局安装：

```bash
npm install -g @youware-labs/figma-pilot-mcp
```

然后更新您的 MCP 配置以使用全局安装。

### 构建错误

确保您已安装 Bun：

```bash
curl -fsSL https://bun.sh/install | bash
```

或使用 npm/yarn，但您可能需要调整构建脚本。

## 贡献

我们欢迎贡献。请参阅 [CONTRIBUTING.zh-CN.md](./CONTRIBUTING.zh-CN.md) 了解指南。

## 文档

- [skills/SKILL.md](./skills/SKILL.md) - AI 代理的完整 API 参考
- [CONTRIBUTING.md](./CONTRIBUTING.md) - 贡献指南（英文）
- [CONTRIBUTING.zh-CN.md](./CONTRIBUTING.zh-CN.md) - 贡献指南（中文）

## 许可证

MIT 许可证 - 详见 [LICENSE](./LICENSE)。

## 致谢

使用以下技术构建：
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Figma Plugin API](https://www.figma.com/plugin-docs/)
- [Bun](https://bun.sh/)

---

**[YouWare Labs](https://github.com/youware-labs)**
