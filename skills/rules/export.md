---
name: export
description: Export Figma elements as PNG, SVG, PDF, or JPG
metadata:
  tags: export, png, svg, pdf, image
---

## figma_export

Export elements as images.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | string | Element to export (required) |
| `format` | string | Export format: "png", "svg", "pdf", "jpg" (required) |
| `scale` | number | Scale factor (default: 1) |

### Examples

```typescript
// Export selection as PNG
figma_export({ target: "selection", format: "png" })

// Export as SVG
figma_export({ target: "selection", format: "svg" })

// Export at 2x scale
figma_export({ target: "selection", format: "png", scale: 2 })
```

**Tip**: After finishing a requested change (not every step), export a PNG for review using `figma_export({ target: "selection", format: "png", scale: 2 })`.
