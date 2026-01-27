---
name: transforms
description: Rotation and blend modes for Figma elements
metadata:
  tags: rotation, transform, blend-mode
---

## Transform Properties

Apply rotation and blend modes to elements.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `rotation` | number | Rotation angle in degrees |
| `blendMode` | string | Blend mode for compositing |

### Blend Modes

`PASS_THROUGH`, `NORMAL`, `DARKEN`, `MULTIPLY`, `LINEAR_BURN`, `COLOR_BURN`, `LIGHTEN`, `SCREEN`, `LINEAR_DODGE`, `COLOR_DODGE`, `OVERLAY`, `SOFT_LIGHT`, `HARD_LIGHT`, `DIFFERENCE`, `EXCLUSION`, `HUE`, `SATURATION`, `COLOR`, `LUMINOSITY`

### Examples

```typescript
// Rotated element
figma_create({
  type: "rect",
  name: "Diamond",
  width: 100,
  height: 100,
  fill: "#FF6B6B",
  rotation: 45,
  x: 100,
  y: 100
})

// Blend mode overlay
figma_create({
  type: "frame",
  name: "Overlay Container",
  width: 400,
  height: 300,
  fill: "#000000",
  children: [
    {
      type: "rect",
      name: "Background Image",
      width: 400,
      height: 300,
      fill: "#336699"
    },
    {
      type: "rect",
      name: "Color Overlay",
      width: 400,
      height: 300,
      fill: "#FF6B6B",
      blendMode: "MULTIPLY"
    }
  ]
})
```
