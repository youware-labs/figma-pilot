---
name: list-components
description: List all available components in the Figma file
metadata:
  tags: components, list, discovery
---

## figma_list_components

List all available components in the Figma file.

```typescript
figma_list_components()
figma_list_components({ filter: "Button" })  // Filter by name
```

Use this to discover existing components before creating instances with `figma_instantiate`.
