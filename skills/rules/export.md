---
name: export
description: Export Figma elements as PNG, SVG, PDF, or JPG
metadata:
  tags: export, png, svg, pdf, image
---

## figma.export()

Export elements as images.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | string | Element to export (required) |
| `format` | string | Export format: "png", "svg", "pdf", "jpg" (required) |
| `scale` | number | Scale factor (default: 1) |

### Examples

```javascript
// Inside figma_execute:

// Export selection as PNG
await figma.export({ target: "selection", format: "png" });

// Export as SVG
await figma.export({ target: "selection", format: "svg" });

// Export at 2x scale
const result = await figma.export({ target: "selection", format: "png", scale: 2 });
console.log(`Exported ${result.size} bytes`);
```

**Tip**: After finishing a requested change (not every step), export a PNG for review.
