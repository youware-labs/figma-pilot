---
name: target-specifiers
description: How to target elements in figma-pilot - ID, selection, name
metadata:
  tags: target, selection, name, id
---

## Target Specifiers

Many tools accept a `target` or `parent` parameter. Valid values:

| Specifier | Description | Example |
|-----------|-------------|---------|
| `"selection"` | The currently selected element(s) in Figma | `target: "selection"` |
| `"page"` | All elements on the current page | `target: "page"` |
| `"123:456"` | A specific node ID | `target: "123:456"` |
| `"name:ElementName"` | Find element by name | `target: "name:Hero Section"` |

## Recommended: Use Names

Use `"name:"` prefix for targeting - names are more stable than IDs.

```javascript
// Inside figma_execute:
await figma.modify({ target: "name:Navigation", fill: "#FFFFFF" });
await figma.create({ type: "text", content: "Hello", parent: "name:Hero" });
await figma.append({ target: "selection", parent: "name:Container" });
```

**Best Practices:**
- Always name containers you expect to modify later
- Prefer `"name:"` targeting over IDs for stability
- Use `"selection"` for operations on user-selected elements
