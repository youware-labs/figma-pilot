---
name: constraints
description: Responsive constraints and min/max sizes for Figma elements
metadata:
  tags: constraints, responsive, min-width, max-width
---

## Responsive Constraints

Set constraints for responsive behavior.

### Constraint Values

| Value | Behavior |
|-------|----------|
| `MIN` | Anchor to left/top |
| `CENTER` | Stay centered |
| `MAX` | Anchor to right/bottom |
| `STRETCH` | Stretch with container |
| `SCALE` | Scale proportionally |

### Examples

```typescript
// Element that stretches horizontally
figma_create({
  type: "frame",
  name: "Header",
  width: 1440,
  height: 60,
  fill: "#FFFFFF",
  constraints: {
    horizontal: "STRETCH",
    vertical: "MIN"
  }
})

// Centered element
figma_create({
  type: "frame",
  name: "Modal",
  width: 400,
  height: 300,
  fill: "#FFFFFF",
  cornerRadius: 16,
  constraints: {
    horizontal: "CENTER",
    vertical: "CENTER"
  }
})

// Bottom-right anchored
figma_create({
  type: "button",
  name: "FAB",
  constraints: {
    horizontal: "MAX",
    vertical: "MAX"
  }
})
```

## Min/Max Size Constraints

Set size limits for responsive elements.

| Parameter | Type | Description |
|-----------|------|-------------|
| `minWidth` | number | Minimum width constraint |
| `minHeight` | number | Minimum height constraint |
| `maxWidth` | number | Maximum width constraint |
| `maxHeight` | number | Maximum height constraint |

```typescript
// Card with min/max width
figma_create({
  type: "card",
  name: "Responsive Card",
  width: 320,
  minWidth: 280,
  maxWidth: 480,
  layout: { direction: "column", padding: 24, gap: 16 },
  children: [
    { type: "text", content: "Flexible Card", fontSize: 20, fontWeight: 600 }
  ]
})

// Text container with max height
figma_create({
  type: "frame",
  name: "Scrollable Content",
  width: 300,
  minHeight: 100,
  maxHeight: 400,
  fill: "#FFFFFF",
  clipsContent: true,
  layout: { direction: "column", padding: 16, gap: 8 }
})
```
