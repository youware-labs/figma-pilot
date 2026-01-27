---
name: patterns-card
description: Creating card components in Figma
metadata:
  tags: patterns, card, component
---

## Creating a Card Component

```typescript
// 1. Create the card layout
figma_create({
  type: "card",
  name: "Card",
  width: 320,
  children: [
    { type: "text", name: "Title", content: "Card Title", fontSize: 18, fontWeight: 600 },
    { type: "text", name: "Description", content: "Card description goes here", fontSize: 14, fill: "#666666" }
  ]
})

// 2. Convert to component
figma_to_component({ target: "selection", name: "Card/Default" })

// 3. Create variants
figma_create_variants({ target: "selection", property: "state", values: ["default", "hover"] })
```

**Key Points:**
- Use the `card` semantic type for pre-styled card layouts
- Convert to component for reusability
- Create variants for different states (default, hover, etc.)
