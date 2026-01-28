---
name: fonts
description: Loading and using custom fonts in Figma with figma-pilot
metadata:
  tags: font, fontFamily, typography, text
---

## Using Fonts

figma-pilot supports custom fonts through the `fontFamily` and `fontWeight` parameters.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `fontFamily` | string | Font family name (e.g., "Inter", "Roboto", "Arial") |
| `fontWeight` | number | Font weight from 100 to 900 |

### Font Weight to Style Mapping

| Weight | Style Name |
|--------|------------|
| 100 | Thin |
| 200 | Extra Light |
| 300 | Light |
| 400 | Regular |
| 500 | Medium |
| 600 | Semi Bold |
| 700 | Bold |
| 800 | Extra Bold |
| 900 | Black |

### Examples

```javascript
// Inside figma_execute:

// Default Inter font
await figma.create({
  type: "text",
  content: "Default Inter Text",
  fontSize: 16
});

// Using Roboto Bold
await figma.create({
  type: "text",
  content: "Roboto Bold",
  fontFamily: "Roboto",
  fontWeight: 700,
  fontSize: 24
});

// Using system fonts
await figma.create({
  type: "text",
  content: "System Font",
  fontFamily: "Arial",
  fontWeight: 400,
  fontSize: 16
});

// Light weight text
await figma.create({
  type: "text",
  content: "Light Text",
  fontFamily: "Inter",
  fontWeight: 300,
  fontSize: 18
});

// Multiple text styles in a card
await figma.create({
  type: "card",
  name: "Typography Demo",
  width: 300,
  children: [
    { type: "text", content: "Heading", fontFamily: "Inter", fontWeight: 700, fontSize: 24 },
    { type: "text", content: "Subheading", fontFamily: "Inter", fontWeight: 500, fontSize: 16 },
    { type: "text", content: "Body text goes here", fontFamily: "Inter", fontWeight: 400, fontSize: 14, fill: "#666666" }
  ]
});
```

### Font Fallback

If the specified font is not available, figma-pilot will fall back to Inter Regular. Common fonts that typically work:

- **System fonts**: Arial, Helvetica, Times New Roman, Georgia
- **Google fonts** (if installed in Figma): Roboto, Open Sans, Lato, Montserrat, Poppins
- **Figma default**: Inter (always available)

### Tips

- Use `fontWeight` to specify the exact weight - figma-pilot maps it to the appropriate font style
- The default font is "Inter" if no `fontFamily` is specified
- The default weight is 400 (Regular) if no `fontWeight` is specified
- For titles, use `fontWeight: 700` (Bold) or `fontWeight: 600` (Semi Bold)
- For body text, use `fontWeight: 400` (Regular)
- For captions or subtle text, use `fontWeight: 300` (Light)
