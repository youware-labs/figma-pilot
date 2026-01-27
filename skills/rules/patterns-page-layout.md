---
name: patterns-page-layout
description: Creating page layouts with sections in Figma
metadata:
  tags: patterns, page, layout, sections
---

## Creating a Page Layout with Sections

When creating multiple sections for a page, always specify position to stack them vertically:

```typescript
// Navigation at top (y=0)
figma_create({
  type: "frame", name: "Nav", width: 1440, height: 80,
  x: 0, y: 0, fill: "#FFFFFF"
})

// Hero section below nav (y=80)
figma_create({
  type: "frame", name: "Hero", width: 1440, height: 600,
  x: 0, y: 80, fill: "#F5F5F5"
})

// Features section (y=680)
figma_create({
  type: "frame", name: "Features", width: 1440, height: 400,
  x: 0, y: 680, fill: "#FFFFFF"
})

// Footer (y=1080)
figma_create({
  type: "frame", name: "Footer", width: 1440, height: 200,
  x: 0, y: 1080, fill: "#333333"
})
```

**Key Points:**
- Always specify `x` and `y` to avoid element overlap
- Use consistent widths for page sections
- Name each section for easy targeting later
