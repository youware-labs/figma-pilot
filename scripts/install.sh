#!/bin/bash
#
# figma-pilot 一键安装脚本
# 安装 MCP server + 准备 Figma 插件
#

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  figma-pilot 安装脚本"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 检查依赖
check_deps() {
  if ! command -v bun &> /dev/null; then
    echo "❌ 需要安装 bun: https://bun.sh"
    exit 1
  fi

  if ! command -v claude &> /dev/null; then
    echo "⚠️  未检测到 claude CLI，跳过 MCP 配置"
    echo "   如需配置，请先安装: https://claude.ai/code"
    HAS_CLAUDE=false
  else
    HAS_CLAUDE=true
  fi
}

# 构建项目
build_project() {
  echo "📦 安装依赖..."
  cd "$PROJECT_DIR"
  bun install --silent

  echo "🔨 构建项目..."
  bun run build
  echo "✓ 构建完成"
  echo ""
}

# 配置 MCP
setup_mcp() {
  if [ "$HAS_CLAUDE" = true ]; then
    echo "🔌 配置 Claude Code MCP..."

    # 先移除旧的配置（如果存在）
    claude mcp remove figma-pilot 2>/dev/null || true

    # 添加新配置
    claude mcp add figma-pilot -- bun run "$PROJECT_DIR/packages/mcp-server/dist/index.js"

    echo "✓ MCP 配置完成"
    echo ""
  fi
}

# 准备 Figma 插件
setup_plugin() {
  PLUGIN_DIR="$PROJECT_DIR/packages/plugin"

  echo "🎨 Figma 插件准备就绪"
  echo ""
  echo "   请在 Figma Desktop 中手动导入:"
  echo "   1. 打开 Figma Desktop"
  echo "   2. 菜单: Plugins → Development → Import plugin from manifest..."
  echo "   3. 选择: $PLUGIN_DIR/manifest.json"
  echo ""

  # macOS: 打开 Finder 到插件目录
  if [[ "$OSTYPE" == "darwin"* ]]; then
    read -p "   是否打开插件文件夹? [Y/n] " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
      open "$PLUGIN_DIR"
    fi
  fi
}

# 显示使用说明
show_usage() {
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "  ✅ 安装完成!"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "  使用方法:"
  echo ""
  echo "  1. 在 Figma 中运行 figma-pilot 插件"
  echo "     Plugins → Development → figma-pilot"
  echo ""
  echo "  2. 在 Claude Code 中使用 Figma 工具"
  echo "     例如: \"在 Figma 里创建一个登录表单\""
  echo ""
  echo "  3. 插件状态变为绿色 \"Connected\" 即可使用"
  echo ""
}

# 主流程
main() {
  check_deps
  build_project
  setup_mcp
  setup_plugin
  show_usage
}

main
