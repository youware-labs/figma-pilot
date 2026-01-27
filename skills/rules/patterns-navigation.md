---
name: patterns-navigation
description: Building navigation bars in Figma
metadata:
  tags: patterns, navigation, navbar, menu
---

## Building a Navigation Bar

```typescript
figma_create({
  type: "nav",
  name: "Navigation",
  width: 1200,
  children: [
    { type: "text", content: "Logo", fontSize: 20, fontWeight: 700 },
    {
      type: "frame",
      layout: { direction: "row", gap: 24 },
      children: [
        { type: "text", content: "Home", fontSize: 14 },
        { type: "text", content: "About", fontSize: 14 },
        { type: "text", content: "Contact", fontSize: 14 }
      ]
    },
    {
      type: "button",
      name: "CTA",
      children: [{ type: "text", content: "Sign Up", fill: "#FFFFFF" }]
    }
  ]
})
```

**Key Points:**
- Use the `nav` semantic type for pre-styled navigation layouts
- Group menu items in a frame with row layout
- Include a CTA button for conversion
