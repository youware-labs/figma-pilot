#!/bin/bash
#
# figma-pilot 卸载脚本
#

echo "🗑️  卸载 figma-pilot..."

# 移除 MCP 配置
if command -v claude &> /dev/null; then
  claude mcp remove figma-pilot 2>/dev/null && echo "✓ 已移除 MCP 配置" || echo "  MCP 配置不存在"
fi

echo ""
echo "✅ 卸载完成"
echo ""
echo "   注意: Figma 插件需要手动移除"
echo "   Figma → Plugins → Development → Manage plugins..."
