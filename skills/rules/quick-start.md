---
name: quick-start
description: Quick start guide and setup requirements for figma-pilot
metadata:
  tags: setup, installation, getting-started
---

## Quick Start

figma-pilot uses **code execution mode** for efficiency. Use `figma_execute` to run JavaScript with all Figma APIs:

```javascript
// First, check connection
figma_status()

// Then use figma_execute for all operations:

// Create a simple frame
await figma.create({ type: "frame", name: "Card", width: 320, height: 200 });

// Create a button with auto-layout
await figma.create({ type: "button", name: "Submit" });

// Modify the current selection
await figma.modify({ target: "selection", fill: "#FF0000" });

// Check accessibility
const result = await figma.accessibility({ target: "selection", level: "AA", autoFix: true });
console.log(`Fixed ${result.fixedCount} issues`);
```

## Available Tools

| Tool | Description |
|------|-------------|
| `figma_status` | Check connection (call first) |
| `figma_execute` | Execute JavaScript with Figma APIs |
| `figma_get_api_docs` | Get detailed API documentation |

## Setup Requirements

1. The figma-pilot Figma plugin must be installed and running in Figma Desktop
2. The MCP server must be configured in your AI client (Claude, Cursor, Codex, etc.)
3. Call `figma_status()` first to verify the connection
4. Call `figma_get_api_docs()` if you need detailed API parameter documentation
