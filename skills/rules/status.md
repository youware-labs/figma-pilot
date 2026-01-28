---
name: status
description: Check connection status to Figma plugin
metadata:
  tags: connection, status, health-check
---

## figma.status()

Check connection status to Figma plugin. Call this first to verify the plugin is running.

```javascript
// Use figma_status tool directly, or inside figma_execute:
await figma.status()
// Returns: { connected: true, pluginVersion: "1.0.0", documentName: "...", currentPage: "..." }
```

Always call `figma_status` before running `figma_execute` to ensure the connection is active.
