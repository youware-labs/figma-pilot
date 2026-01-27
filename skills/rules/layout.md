---
name: layout
description: Auto-layout configuration and patterns for Figma frames
metadata:
  tags: layout, auto-layout, gap, padding, alignment
---

## Layout Object Schema

```typescript
interface Layout {
  direction?: "row" | "column";
  gap?: number;
  padding?: number | { top: number; right: number; bottom: number; left: number };
  alignItems?: "start" | "center" | "end" | "baseline";
  justifyContent?: "start" | "center" | "end" | "space-between" | "space-around";
  wrap?: boolean; // Enable wrapping for multi-row/column layouts
}
```

Note: For stretch behavior, use `layoutSizingVertical` or `layoutSizingHorizontal: "FILL"` on child elements.

## Examples

```typescript
// Horizontal row with gap
figma_create({
  type: "frame",
  name: "Row",
  layout: { direction: "row", gap: 16, padding: 24 }
})

// Vertical column centered
figma_create({
  type: "frame",
  name: "Column",
  layout: { 
    direction: "column", 
    gap: 12, 
    alignItems: "center",
    justifyContent: "center"
  }
})

// Asymmetric padding
figma_create({
  type: "frame",
  name: "Card",
  layout: { 
    direction: "column",
    padding: { top: 24, right: 16, bottom: 24, left: 16 }
  }
})

// Wrapping layout (multi-row)
figma_create({
  type: "frame",
  name: "Grid",
  width: 400,
  layout: {
    direction: "row",
    gap: 16,
    wrap: true  // Items wrap to next row when exceeding width
  }
})
```

## Layout Sizing

Control how child elements size within auto-layout:

| Parameter | Values | Description |
|-----------|--------|-------------|
| `layoutSizingHorizontal` | "FIXED", "HUG", "FILL" | Horizontal sizing behavior |
| `layoutSizingVertical` | "FIXED", "HUG", "FILL" | Vertical sizing behavior |

```typescript
// Child element that fills parent width
figma_create({
  type: "frame",
  width: 400,
  layout: { direction: "column", gap: 16 },
  children: [
    {
      type: "text",
      content: "Full width text",
      layoutSizingHorizontal: "FILL"  // Stretches to parent width
    }
  ]
})
```
