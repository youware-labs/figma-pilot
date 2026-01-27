---
name: query
description: Query elements by ID, name, or current selection
metadata:
  tags: query, element, details, selection
---

## figma_query

Get detailed information about elements. Replaces the old `figma_selection` tool.

```typescript
// Query current selection (returns all selected elements)
figma_query({ target: "selection" })

// Query by node ID
figma_query({ target: "123:456" })

// Query by element name
figma_query({ target: "name:Hero Section" })
```

### Target Options

See [target-specifiers.md](target-specifiers.md) for full details.

| Specifier | Description | Example |
|-----------|-------------|---------|
| `"selection"` | Currently selected element(s) | Returns multiple nodes if multiple are selected |
| `"123:456"` | A specific node ID | Returns single node |
| `"name:ElementName"` | Find element by name | Returns single node |

### Response

The response includes:
- `node`: The first/only matching node (or null)
- `nodes`: Array of all matching nodes (useful for selection)

**Recommended**: Use `"name:"` prefix for targeting - names are more stable than IDs.
