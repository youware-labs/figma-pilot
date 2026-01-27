---
name: text
description: Text elements, wrapping, and sizing in Figma
metadata:
  tags: text, font, wrapping, typography, fontFamily
---

## Text Elements

Create and configure text elements.

### Text Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `content` | string | Text content |
| `fontSize` | number | Font size in pixels |
| `fontWeight` | number | Font weight (100-900) |
| `fontFamily` | string | Font family name (e.g., "Inter", "Roboto", "Arial") |
| `textAlign` | string | Horizontal alignment: "LEFT", "CENTER", "RIGHT", "JUSTIFIED" |
| `textColor` | string | Text color (hex). Preferred over `fill` |
| `textAutoResize` | string | "WIDTH_AND_HEIGHT", "HEIGHT", "TRUNCATE", "NONE" |
| `maxWidth` | number | Max width for text wrapping |
| `lineHeight` | number | Line height in pixels |
| `letterSpacing` | number | Letter spacing in pixels |
| `textDecoration` | string | "NONE", "UNDERLINE", "STRIKETHROUGH" |
| `textCase` | string | "ORIGINAL", "UPPER", "LOWER", "TITLE" |

### Font Weight to Style Mapping

| Weight | Style |
|--------|-------|
| 100 | Thin |
| 200 | Extra Light |
| 300 | Light |
| 400 | Regular |
| 500 | Medium |
| 600 | Semi Bold |
| 700 | Bold |
| 800 | Extra Bold |
| 900 | Black |

## Text Wrapping and Sizing

```typescript
// Text with custom font
figma_create({
  type: "text",
  content: "Custom Font Text",
  fontFamily: "Roboto",
  fontWeight: 700,
  fontSize: 24
})

// Text that wraps within a max width
figma_create({
  type: "text",
  content: "This is a long paragraph that will wrap to multiple lines.",
  maxWidth: 300,  // Automatically enables text wrapping
  lineHeight: 24
})

// Centered text
figma_create({
  type: "text",
  content: "Centered Heading",
  textAlign: "CENTER",
  fontSize: 32,
  fontWeight: 700
})

// Text with explicit color (white text on dark background)
figma_create({
  type: "frame",
  fill: "#333333",
  layout: { direction: "row", padding: 16 },
  children: [
    { type: "text", content: "Button", textColor: "#FFFFFF", fontWeight: 600 }
  ]
})

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
