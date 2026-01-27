---
name: quick-start
description: Quick start guide and setup requirements for figma-pilot
metadata:
  tags: setup, installation, getting-started
---

## Quick Start

```typescript
// Check connection to Figma plugin
figma_status()

// Create a simple frame
figma_create({ type: "frame", name: "Card", width: 320, height: 200 })

// Create a button with auto-layout
figma_create({ type: "button", name: "Submit", content: "Submit" })

// Modify the current selection
figma_modify({ target: "selection", fill: "#FF0000" })

// Check accessibility
figma_ensure_accessibility({ target: "selection", level: "AA", autoFix: true })
```

## Setup Requirements

1. The figma-pilot Figma plugin must be installed and running in Figma Desktop
2. The MCP server must be configured in your AI client (Claude, Cursor, Codex, etc.)
3. Call `figma_status()` first to verify the connection
