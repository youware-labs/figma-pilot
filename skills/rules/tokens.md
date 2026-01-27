---
name: tokens
description: Create, bind, and sync design tokens in Figma
metadata:
  tags: tokens, design-tokens, variables, styles
---

## Design Tokens

### figma_bind_token

Bind a design token to a node property.

```typescript
figma_bind_token({ target: "selection", property: "fill", token: "colors/primary" })
figma_bind_token({ target: "name:Button", property: "cornerRadius", token: "radii/sm" })
```

### figma_create_token

Create a new design token.

```typescript
figma_create_token({
  collection: "colors",
  name: "primary",
  type: "COLOR",
  value: "#2563EB"
})
```

### figma_sync_tokens

Import or export token JSON.

```typescript
// Import tokens
figma_sync_tokens({ from: "/path/to/tokens.json" })

// Export tokens
figma_sync_tokens({ to: "/path/to/tokens.json" })
```

Use tokens for consistency in design systems. Create tokens for colors, spacing, radii, and other reusable values.
