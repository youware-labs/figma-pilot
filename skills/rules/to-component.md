---
name: to-component
description: Convert elements to reusable Figma components
metadata:
  tags: component, convert, reusable
---

## figma_to_component

Convert an element to a reusable component.

```typescript
figma_to_component({ target: "selection" })
figma_to_component({ target: "selection", name: "Button/Primary" })
```

Use `/` in the name to create component hierarchies (e.g., "Button/Primary", "Button/Secondary").
