---
name: corner-radius
description: Independent corner radius for Figma elements
metadata:
  tags: corner, radius, rounded, border-radius
---

## Independent Corner Radius

Set different radius for each corner using individual properties.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `cornerRadius` | number | Uniform corner radius |
| `topLeftRadius` | number | Top-left corner radius |
| `topRightRadius` | number | Top-right corner radius |
| `bottomLeftRadius` | number | Bottom-left corner radius |
| `bottomRightRadius` | number | Bottom-right corner radius |

### Examples

```typescript
// Speech bubble style
figma_create({
  type: "frame",
  name: "Speech Bubble",
  width: 200,
  height: 80,
  fill: "#E8E8E8",
  topLeftRadius: 16,
  topRightRadius: 16,
  bottomLeftRadius: 4,
  bottomRightRadius: 16
})

// Tab shape
figma_create({
  type: "rect",
  name: "Tab",
  width: 120,
  height: 40,
  fill: "#FFFFFF",
  topLeftRadius: 8,
  topRightRadius: 8,
  bottomLeftRadius: 0,
  bottomRightRadius: 0
})

// Notch style
figma_create({
  type: "frame",
  name: "Notched Card",
  width: 300,
  height: 200,
  fill: "#FFFFFF",
  topLeftRadius: 24,
  topRightRadius: 4,
  bottomLeftRadius: 4,
  bottomRightRadius: 24
})
```
