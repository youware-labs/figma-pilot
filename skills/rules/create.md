---
name: create
description: Create elements in Figma - frames, text, shapes, and semantic types
metadata:
  tags: create, frame, text, rect, ellipse, button, card
---

## figma_create

Create new elements in Figma. Supports frames, text, rectangles, ellipses, and semantic types.

**Basic element types**: `frame`, `text`, `rect`, `ellipse`, `line`
**Semantic types** (pre-styled): `card`, `button`, `form`, `nav`, `input`

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Element type (required) |
| `name` | string | Element name |
| `width` | number | Width in pixels |
| `height` | number | Height in pixels |
| `x` | number | X position |
| `y` | number | Y position |
| `parent` | string | Parent container (ID, "selection", or "name:ElementName") |
| `fill` | string | Fill color (hex, e.g., "#FF0000") |
| `stroke` | string | Stroke color (hex) |
| `strokeWidth` | number | Stroke width |
| `cornerRadius` | number | Corner radius (uniform) |
| `content` | string | Text content (for text elements) |
| `fontSize` | number | Font size (for text elements) |
| `fontWeight` | number | Font weight 100-900 (for text elements) |
| `fontFamily` | string | Font family name (e.g., "Inter", "Roboto") |
| `textAlign` | string | Text alignment: "LEFT", "CENTER", "RIGHT", "JUSTIFIED" |
| `textColor` | string | Text color (hex). Preferred over `fill` for text elements |
| `maxWidth` | number | Max width for text wrapping |
| `lineHeight` | number | Line height in pixels |
| `letterSpacing` | number | Letter spacing in pixels |
| `layout` | object | Auto-layout configuration |
| `children` | array | Nested child elements |

See also: [layout.md](layout.md), [effects.md](effects.md), [gradients.md](gradients.md), [text.md](text.md)

### Basic Examples

```typescript
// Simple frame
figma_create({ type: "frame", name: "Container", width: 400, height: 300 })

// Text element
figma_create({ type: "text", content: "Hello World", fontSize: 24, fill: "#333333" })

// Text with custom font
figma_create({ 
  type: "text", 
  content: "Custom Font", 
  fontFamily: "Roboto", 
  fontWeight: 700, 
  fontSize: 32,
  textAlign: "CENTER"
})

// Pre-styled button
figma_create({ type: "button", name: "Primary Button" })

// Frame with auto-layout
figma_create({
  type: "frame",
  name: "Row",
  layout: { direction: "row", gap: 16, padding: 24 }
})

// Positioned element
figma_create({ type: "rect", width: 100, height: 100, x: 50, y: 50, fill: "#0066FF" })

// Create inside a parent container
figma_create({ type: "text", content: "Hello", parent: "name:Hero Section" })
figma_create({ type: "text", content: "Hello", parent: "selection" })
figma_create({ type: "text", content: "Hello", parent: "123:456" })
```

### Complex Nested Layout

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
