---
name: nested-children
description: Complex nested layouts with children in Figma
metadata:
  tags: children, nested, layout, hierarchy
---

## Nested Children

Use the `children` parameter to create complex nested layouts in a single call.

```typescript
figma_create({
  type: "frame",
  name: "User Card",
  width: 320,
  height: 80,
  fill: "#FFFFFF",
  cornerRadius: 8,
  layout: { direction: "row", gap: 12, padding: 16 },
  children: [
    {
      type: "ellipse",
      name: "Avatar",
      width: 48,
      height: 48,
      fill: "#E0E0E0"
    },
    {
      type: "frame",
      name: "Info",
      layout: { direction: "column", gap: 4 },
      children: [
        { type: "text", content: "John Doe", fontSize: 16, fontWeight: 600 },
        { type: "text", content: "john@example.com", fontSize: 14, fill: "#666666" }
      ]
    }
  ]
})
```

**Best Practices:**
- Use `children` for complex layouts instead of multiple top-level calls
- Each child can have its own `children` for deep nesting
- Name important containers for easy targeting later
- Use auto-layout on parent frames for proper alignment
