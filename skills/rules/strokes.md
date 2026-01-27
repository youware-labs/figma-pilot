---
name: strokes
description: Stroke styling for Figma elements - dash patterns, caps, alignment
metadata:
  tags: stroke, border, dashed, dotted, arrow
---

## Stroke Styling

Advanced stroke options for lines and shapes.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `stroke` | string | Stroke color (hex) |
| `strokeWidth` | number | Stroke width in pixels |
| `strokeAlign` | string | "INSIDE", "OUTSIDE", "CENTER" |
| `strokeCap` | string | "NONE", "ROUND", "SQUARE", "ARROW_LINES", "ARROW_EQUILATERAL" |
| `strokeJoin` | string | "MITER", "BEVEL", "ROUND" (for corners) |
| `dashPattern` | number[] | Dash pattern, e.g., [5, 5] for dashed line |

### Examples

```typescript
// Dashed border
figma_create({
  type: "rect",
  name: "Dashed Box",
  width: 200,
  height: 100,
  fill: "#FFFFFF",
  stroke: "#666666",
  strokeWidth: 2,
  dashPattern: [8, 4],  // 8px dash, 4px gap
  cornerRadius: 8
})

// Dotted line
figma_create({
  type: "line",
  name: "Dotted Divider",
  width: 300,
  stroke: "#CCCCCC",
  strokeWidth: 2,
  dashPattern: [2, 4],
  strokeCap: "ROUND"
})

// Arrow line
figma_create({
  type: "line",
  name: "Arrow",
  width: 150,
  stroke: "#333333",
  strokeWidth: 2,
  strokeCap: "ARROW_EQUILATERAL"
})

// Inside stroke
figma_create({
  type: "rect",
  name: "Inside Border",
  width: 100,
  height: 100,
  fill: "#FFFFFF",
  stroke: "#0066FF",
  strokeWidth: 4,
  strokeAlign: "INSIDE",
  cornerRadius: 8
})
```
