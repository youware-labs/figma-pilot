---
name: tokens
description: Create, bind, and sync design tokens in Figma
metadata:
  tags: tokens, design-tokens, variables, styles
---

## Design Tokens

### figma.bindToken()

Bind a design token to a node property.

```javascript
// Inside figma_execute:
await figma.bindToken({ target: "selection", property: "fill", token: "colors/primary" });
await figma.bindToken({ target: "name:Button", property: "cornerRadius", token: "radii/sm" });
```

### figma.createToken()

Create a new design token.

```javascript
// Inside figma_execute:
await figma.createToken({
  collection: "colors",
  name: "primary",
  type: "COLOR",
  value: "#2563EB"
});
```

### figma.syncTokens()

Import or export token JSON.

```javascript
// Inside figma_execute:

// Import tokens
await figma.syncTokens({ from: "/path/to/tokens.json" });

// Export tokens
await figma.syncTokens({ to: "/path/to/tokens.json" });
```

Use tokens for consistency in design systems. Create tokens for colors, spacing, radii, and other reusable values.
