---
name: status
description: Check connection status to Figma plugin
metadata:
  tags: connection, status, health-check
---

## figma_status

Check connection status to Figma plugin. Call this first to verify the plugin is running.

```typescript
figma_status()
// Returns: { connected: true, pluginVersion: "1.0.0" }
```

Always call this before running other commands to ensure the connection is active.
