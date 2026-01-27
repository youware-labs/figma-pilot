---
name: selection
description: Get information about the current selection in Figma
metadata:
  tags: selection, query, nodes
---

## figma_selection

Get information about the current selection in Figma.

```typescript
figma_selection()
// Returns: { nodes: [{ id: "123:456", name: "Frame", type: "FRAME", ... }] }
```

Use this to understand what the user has selected before performing operations.
