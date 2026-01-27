---
name: create-variants
description: Create component variants with different property values
metadata:
  tags: variants, component, states
---

## figma_create_variants

Create component variants with different property values.

```typescript
// Create state variants
figma_create_variants({
  target: "selection",
  property: "state",
  values: ["default", "hover", "pressed", "disabled"]
})

// Create size variants
figma_create_variants({
  target: "123:456",
  property: "size",
  values: ["small", "medium", "large"]
})
```

This creates multiple variants of the component with the specified property values.
