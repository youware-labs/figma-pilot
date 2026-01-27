---
name: effects
description: Shadows, blur, and visual effects for Figma elements
metadata:
  tags: effects, shadow, blur, drop-shadow, inner-shadow
---

## Effects (Shadows & Blur)

Add visual effects like shadows and blur to elements using the `effects` parameter.

### Effect Types

| Type | Description | Properties |
|------|-------------|------------|
| `DROP_SHADOW` | Shadow outside the element | color, offset, radius, spread |
| `INNER_SHADOW` | Shadow inside the element | color, offset, radius, spread |
| `LAYER_BLUR` | Blur the element itself | radius |
| `BACKGROUND_BLUR` | Blur content behind element | radius |

### Examples

```typescript
// Drop shadow
figma_create({
  type: "card",
  name: "Elevated Card",
  width: 320,
  fill: "#FFFFFF",
  cornerRadius: 16,
  effects: [
    {
      type: "DROP_SHADOW",
      color: "#00000040",  // 25% opacity black
      offset: { x: 0, y: 4 },
      radius: 12,
      spread: 0
    }
  ],
  children: [
    { type: "text", content: "Card with shadow", fontSize: 16 }
  ]
})

// Multiple shadows (layered)
figma_create({
  type: "frame",
  name: "Multi-Shadow",
  width: 200,
  height: 100,
  fill: "#FFFFFF",
  cornerRadius: 8,
  effects: [
    { type: "DROP_SHADOW", color: "#0000001A", offset: { x: 0, y: 1 }, radius: 3 },
    { type: "DROP_SHADOW", color: "#0000000F", offset: { x: 0, y: 4 }, radius: 6 },
    { type: "DROP_SHADOW", color: "#0000000A", offset: { x: 0, y: 10 }, radius: 15 }
  ]
})

// Inner shadow
figma_create({
  type: "rect",
  name: "Inset",
  width: 100,
  height: 100,
  fill: "#F0F0F0",
  effects: [
    { type: "INNER_SHADOW", color: "#00000020", offset: { x: 0, y: 2 }, radius: 4 }
  ]
})

// Layer blur
figma_create({
  type: "rect",
  name: "Blurred",
  width: 200,
  height: 200,
  fill: "#0066FF80",
  effects: [
    { type: "LAYER_BLUR", radius: 20 }
  ]
})

// Background blur (glass effect)
figma_create({
  type: "frame",
  name: "Glass Panel",
  width: 300,
  height: 150,
  fill: "#FFFFFF40",
  cornerRadius: 20,
  effects: [
    { type: "BACKGROUND_BLUR", radius: 40 }
  ]
})
```
