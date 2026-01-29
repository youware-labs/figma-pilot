# figma-pilot

[![npm version](https://img.shields.io/npm/v/@youware-labs/figma-pilot-mcp)](https://www.npmjs.com/package/@youware-labs/figma-pilot-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> AI Agent 通过代码执行控制 Figma

[English](./README.md) | **中文**

## 演示

### OpenAI 着陆页
> 提示词: "Create an OpenAI style landing page introducing the upcoming GPT 5.3 release on Figma"

[![OpenAI 着陆页演示](./assets/openai.gif)](./assets/openai.mp4)

### Manus 设计系统
> 提示词: "Generate a Manus design system components based on the screenshot, on Figma"

[![Manus 设计系统演示](./assets/manus.gif)](./assets/manus.mp4)

## 设计理念

本项目的设计灵感来自 Anthropic 的 [Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)。

与其暴露数十个独立的 MCP 工具（这会导致上下文窗口膨胀并拖慢 Agent），figma-pilot **只提供 3 个工具**：

| 工具 | 描述 |
|------|------|
| `figma_status` | 检查连接状态 |
| `figma_execute` | 执行 JavaScript 代码，完整访问 Figma API |
| `figma_get_api_docs` | 获取 API 文档 |

AI 编写代码与 Figma 交互。这意味着：
- **减少 90%+ 的 token** 消耗
- **批量操作** - 一次调用修改 100 个元素
- **数据过滤** - 在返回上下文前过滤结果
- **复杂工作流** - 循环、条件判断、错误处理

## 快速开始

### 前置要求

- Node.js >= 18
- Figma 桌面应用
- MCP 兼容的 AI 客户端（Claude Desktop、Claude Code、Cursor、Codex 等）

### 1. 安装 MCP Server

```bash
# Claude Code
claude mcp add figma-pilot -- npx @youware-labs/figma-pilot-mcp

# 其他 MCP 客户端 - 添加到你的 MCP 配置:
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

配置文件位置：
- **Claude Desktop**: `~/.config/claude/claude_desktop_config.json` (macOS/Linux)
- **Cursor**: `~/.cursor/mcp.json`

### 2. 安装 Skill（推荐）

`skills/` 文件夹包含 API 文档，帮助 AI Agent 正确使用 `figma_execute`。将其安装到你的 AI 客户端的 skill 目录：

| AI 客户端 | Skill 目录 |
|-----------|-----------|
| Claude Code / Codex | `~/.codex/skills/figma-pilot` |
| Cursor | `~/.cursor/skills-cursor/figma-pilot` |
| Claude Desktop | `~/.claude/skills/figma-pilot` |

安装完成后，重启你的 AI 客户端以加载新的 skill。

### 3. 安装 Figma 插件

1. 从 [Releases](https://github.com/youware-labs/figma-pilot/releases) 下载 `figma-pilot-plugin-vX.X.X.zip`
2. 解压文件
3. 在 Figma 中: **Plugins > Development > Import plugin from manifest...**
4. 选择解压后的 `manifest.json`
5. 运行: **Plugins > Development > figma-pilot**

### 4. 验证连接

让你的 AI Agent：
```
检查 Figma 连接状态
```

## 使用示例

### 自然语言

```
创建一个带有标题和描述的卡片
```

### AI 生成的代码

**创建卡片：**
```javascript
await figma.create({
  type: 'card',
  name: 'User Card',
  children: [
    { type: 'text', content: '卡片标题', fontSize: 18, fontWeight: 600 },
    { type: 'text', content: '描述内容', fontSize: 14, fill: '#666' }
  ]
});
```

**批量修改元素：**
```javascript
const { nodes } = await figma.query({ target: 'selection' });
const rects = nodes.filter(n => n.type === 'RECTANGLE');
for (const rect of rects) {
  await figma.modify({ target: rect.id, fill: '#0066FF', cornerRadius: 8 });
}
console.log(`Modified ${rects.length} rectangles`);
```

**无障碍检查：**
```javascript
const result = await figma.accessibility({ 
  target: 'page', 
  level: 'AA', 
  autoFix: true 
});
console.log(`Fixed ${result.fixedCount} of ${result.totalIssues} issues`);
```

## API 参考

```javascript
// 查询 & 修改
figma.query({ target })           // 查询元素
figma.create({ type, ... })       // 创建元素  
figma.modify({ target, ... })     // 修改元素
figma.delete({ target })          // 删除元素
figma.append({ target, parent })  // 移动到容器

// 组件
figma.listComponents()            // 列出组件
figma.instantiate({ component })  // 创建实例
figma.toComponent({ target })     // 转换为组件
figma.createVariants({ ... })     // 创建变体

// 无障碍 & Token
figma.accessibility({ target })   // WCAG 检查
figma.createToken({ ... })        // 创建设计 Token
figma.bindToken({ ... })          // 绑定 Token 到元素

// 导出
figma.export({ target, format })  // 导出图片
```

完整文档: [skills/SKILL.md](./skills/SKILL.md)

## 架构

```
┌─────────────┐     stdio      ┌─────────────────┐     HTTP      ┌──────────────┐
│ MCP 客户端   │ <------------> │  MCP Server     │ <-----------> │ Figma 插件   │
│             │                │  (内置桥接)      │   port 38451  │              │
└─────────────┘                └─────────────────┘               └──────────────┘
```

## 开发

### 项目结构

```
figma-pilot/
├── packages/
│   ├── cli/           # CLI 应用
│   ├── plugin/        # Figma 插件
│   ├── mcp-server/    # MCP 服务器 (npm 包)
│   └── shared/        # 共享 TypeScript 类型
├── scripts/
│   ├── install.sh     # 安装脚本
│   └── package-plugin.sh
└── skills/            # AI Agent 的 API 文档
```

### 从源码构建

```bash
git clone https://github.com/youware-labs/figma-pilot.git
cd figma-pilot
bun install && bun run build
```

### 创建发布

```bash
# 构建和打包
bun run build
./scripts/package-plugin.sh 0.1.6

# 发布到 npm
cd packages/mcp-server && npm publish --access public

# 创建 GitHub Release
gh release create v0.1.6 dist/releases/figma-pilot-plugin-v0.1.6.zip \
  --title "v0.1.6" \
  --notes "发布说明"
```

## 故障排除

### 插件无法连接

1. 确保 MCP 服务器正在运行（检查 AI 客户端的 MCP 状态）
2. 插件应在 Figma 中显示 "Connected"
3. 尝试重新打开插件
4. 检查端口 38451 是否被阻止

### 端口 38451 被占用

```bash
lsof -i :38451
kill <PID>
```

### 找不到 MCP Server

离线使用时，全局安装：
```bash
npm install -g @youware-labs/figma-pilot-mcp
```

### 插件错误："ENOENT: no such file or directory, lstat '.../dist/main.js'"

此错误表示插件目录缺少 `dist` 文件夹。可能的原因：
1. 下载的 zip 文件不完整
2. 直接使用源码但未构建

**解决方法：**

如果你有源码，构建插件：
```bash
cd packages/plugin
bun install
bun run build
```

或从项目根目录构建：
```bash
bun run build:plugin
```

构建完成后，确认 `packages/plugin/dist/main.js` 和 `packages/plugin/dist/ui.html` 存在，然后在 Figma 中重新导入插件。

## 许可证

MIT - [YouWare Labs](https://github.com/youware-labs)
