---
name: gradients
description: Gradient fills for Figma elements - linear, radial, angular, diamond
metadata:
  tags: gradient, linear, radial, angular, fill
---

## Gradient Fills

Create gradient fills instead of solid colors using the `gradient` parameter.

### Gradient Types

| Type | Description |
|------|-------------|
| `LINEAR` | Straight line gradient, use `angle` to control direction |
| `RADIAL` | Circular gradient from center outward |
| `ANGULAR` | Gradient that sweeps around center (conic) |
| `DIAMOND` | Diamond-shaped gradient from center |

### Examples

```typescript
// Linear gradient (left to right)
figma_create({
  type: "frame",
  name: "Gradient Banner",
  width: 800,
  height: 200,
  gradient: {
    type: "LINEAR",
    angle: 0,  // 0 = left-to-right, 90 = top-to-bottom
    stops: [
      { position: 0, color: "#667EEA" },
      { position: 1, color: "#764BA2" }
    ]
  }
})

// Diagonal gradient
figma_create({
  type: "rect",
  name: "Diagonal Gradient",
  width: 200,
  height: 200,
  gradient: {
    type: "LINEAR",
    angle: 45,
    stops: [
      { position: 0, color: "#FF6B6B" },
      { position: 0.5, color: "#FFE66D" },
      { position: 1, color: "#4ECDC4" }
    ]
  }
})

// Radial gradient
figma_create({
  type: "ellipse",
  name: "Radial Glow",
  width: 200,
  height: 200,
  gradient: {
    type: "RADIAL",
    stops: [
      { position: 0, color: "#FFFFFF" },
      { position: 1, color: "#0066FF" }
    ]
  }
})

// Angular gradient (conic)
figma_create({
  type: "ellipse",
  name: "Color Wheel",
  width: 200,
  height: 200,
  gradient: {
    type: "ANGULAR",
    stops: [
      { position: 0, color: "#FF0000" },
      { position: 0.17, color: "#FFFF00" },
      { position: 0.33, color: "#00FF00" },
      { position: 0.5, color: "#00FFFF" },
      { position: 0.67, color: "#0000FF" },
      { position: 0.83, color: "#FF00FF" },
      { position: 1, color: "#FF0000" }
    ]
  }
})
```
