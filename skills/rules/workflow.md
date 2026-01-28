---
name: workflow
description: Recommended agent workflow and operator rules for figma-pilot
metadata:
  tags: workflow, best-practices, tips
---

## Agent Workflow (Recommended)

figma-pilot uses **code execution mode**. Use `figma_status` to check connection, then `figma_execute` for all operations:

```text
1) figma_status                     # Check connection first
2) figma_execute with your code     # All operations in one call
3) figma_export at the end          # Export for review (inside figma_execute)
```

### Example Workflow

```javascript
// figma_execute - complete workflow in one call
// 1. Query existing elements
const { nodes } = await figma.query({ target: 'selection' });

// 2. List components if needed
const { components } = await figma.listComponents({ filter: 'Button' });

// 3. Create/modify elements
await figma.create({
  type: 'card',
  name: 'New Card',
  children: [
    { type: 'text', content: 'Title', fontSize: 18 }
  ]
});

// 4. Check accessibility
const a11y = await figma.accessibility({ target: 'selection', autoFix: true });
console.log(`Accessibility: ${a11y.passed} passed, ${a11y.fixedCount} fixed`);

// 5. Export for review
await figma.export({ target: 'selection', format: 'png', scale: 2 });
```

## Benefits of Code Execution Mode

- **Batch operations** - Modify 100 elements in one call, not 100 tool calls
- **Data filtering** - Filter query results before logging
- **Complex logic** - Loops, conditionals, error handling
- **90% fewer tokens** - 3 tools instead of 15+

## Operator Rules

- Always name containers you expect to modify later.
- Prefer `"name:"` targeting over IDs for stability.
- Use `children` for complex layouts instead of multiple create calls.
- If no selection exists, use `name:` targets or create a container first.
- Export once at the end, not after each step.

## Tips for AI Agents

1. **Always call `figma_status()` first** to verify the connection
2. **Query before you modify** - use `figma.query()` to avoid mis-targeting
3. **Use `figma_get_api_docs()`** if you need detailed parameter documentation
4. **Batch operations** - do multiple creates/modifies in one `figma_execute` call
5. **Filter data before logging** - reduce output by only logging what you need
6. **Use semantic types** (`card`, `button`, `nav`) - they come pre-styled with auto-layout
7. **Use nested `children`** for complex layouts instead of creating elements separately
8. **Use `"selection"` target** for operations on user-selected elements
9. **Run accessibility checks** after creating UI components
10. **Prefer `"name:"` targeting** over IDs - names are more readable and stable
11. **Use `textColor` for text elements** instead of `fill` for better clarity
12. **Use `maxWidth` for long text** to enable automatic text wrapping
13. **Use `layoutSizingHorizontal: "FILL"`** to make child elements stretch to parent width
14. **Use tokens for consistency** via `figma.createToken()` and `figma.bindToken()`
