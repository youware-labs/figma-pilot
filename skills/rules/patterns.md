---
name: patterns
description: Common design patterns - cards, navigation, page layouts
metadata:
  tags: patterns, card, navigation, layout, page
---

## Card Component

```javascript
// Inside figma_execute:

// 1. Create the card layout
await figma.create({
  type: "card",
  name: "Card",
  width: 320,
  children: [
    { type: "text", name: "Title", content: "Card Title", fontSize: 18, fontWeight: 600 },
    { type: "text", name: "Description", content: "Card description goes here", fontSize: 14, fill: "#666666" }
  ]
});

// 2. Convert to component
await figma.toComponent({ target: "selection", name: "Card/Default" });

// 3. Create variants
await figma.createVariants({ target: "selection", property: "state", values: ["default", "hover"] });
```

**Key Points:**
- Use the `card` semantic type for pre-styled card layouts
- Convert to component for reusability
- Create variants for different states (default, hover, etc.)

---

## Navigation Bar

```javascript
// Inside figma_execute:
await figma.create({
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
});
```

**Key Points:**
- Use the `nav` semantic type for pre-styled navigation layouts
- Group menu items in a frame with row layout
- Include a CTA button for conversion

---

## Page Layout with Sections

When creating multiple sections for a page, always specify position to stack them vertically:

```javascript
// Inside figma_execute:

// Navigation at top (y=0)
await figma.create({
  type: "frame", name: "Nav", width: 1440, height: 80,
  x: 0, y: 0, fill: "#FFFFFF"
});

// Hero section below nav (y=80)
await figma.create({
  type: "frame", name: "Hero", width: 1440, height: 600,
  x: 0, y: 80, fill: "#F5F5F5"
});

// Features section (y=680)
await figma.create({
  type: "frame", name: "Features", width: 1440, height: 400,
  x: 0, y: 680, fill: "#FFFFFF"
});

// Footer (y=1080)
await figma.create({
  type: "frame", name: "Footer", width: 1440, height: 200,
  x: 0, y: 1080, fill: "#333333"
});
```

**Key Points:**
- Always specify `x` and `y` to avoid element overlap
- Use consistent widths for page sections
- Name each section for easy targeting later
