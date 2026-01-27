---
name: instantiate
description: Create instances of Figma components
metadata:
  tags: instance, component, clone
---

## figma_instantiate

Create an instance of a component.

```typescript
figma_instantiate({ component: "123:456" })
figma_instantiate({ component: "123:456", x: 100, y: 200 })
figma_instantiate({ component: "name:Button/Primary", parent: "name:Card" })
```

Use `figma_list_components` first to discover available components and their IDs or names.
