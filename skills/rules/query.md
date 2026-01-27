---
name: query
description: Get detailed information about a specific element
metadata:
  tags: query, element, details
---

## figma_query

Get detailed information about a specific element.

```typescript
figma_query({ target: "selection" })
figma_query({ target: "123:456" })
figma_query({ target: "name:Hero Section" })
```

### Target Options

- `"selection"` - The currently selected element(s)
- `"123:456"` - A specific node ID
- `"name:ElementName"` - Find element by name

**Recommended**: Use `"name:"` prefix for targeting - names are more stable than IDs.
