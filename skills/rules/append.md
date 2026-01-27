---
name: append
description: Move elements into container frames
metadata:
  tags: append, move, reparent
---

## figma_append

Move element(s) into a container frame.

```typescript
// Move selection into a frame by name
figma_append({ target: "selection", parent: "name:Hero Section" })

// Move specific element into another
figma_append({ target: "name:Title", parent: "name:Card" })

// Move by ID
figma_append({ target: "123:456", parent: "789:012" })
```
