---
name: figma-pilot
description: REQUIRED reading before using figma_execute. Contains API syntax, parameter formats, and examples. READ rules/*.md files for correct usage.
metadata:
  tags: figma, mcp, design, ai, components, accessibility, tokens
---

## When to use

**ALWAYS read this skill BEFORE calling figma_execute!** This skill contains the correct API syntax, parameter formats, and examples that you MUST follow. Failure to read this will result in syntax errors.

Use this skill whenever you are working with figma-pilot MCP tools to create or modify Figma designs.

## Code Execution Mode

figma-pilot uses a **code execution mode** for maximum efficiency. Instead of 15+ individual tools, you use `figma_execute` to run JavaScript code with access to all Figma APIs.

### Available Tools

| Tool | Description |
|------|-------------|
| `figma_status` | Check connection to Figma plugin (call first) |
| `figma_execute` | Execute JavaScript with all Figma APIs |
| `figma_get_api_docs` | Get detailed API documentation |

### Quick Example

```javascript
// figma_execute
// Create a card and modify selection
await figma.create({
  type: 'card',
  name: 'Welcome Card',
  children: [
    { type: 'text', content: 'Hello!', fontSize: 24 }
  ]
});

const { nodes } = await figma.query({ target: 'selection' });
for (const node of nodes) {
  await figma.modify({ target: node.id, fill: '#0066FF' });
}
console.log(`Modified ${nodes.length} elements`);
```

### Benefits

- **90%+ fewer tokens** - 3 tools instead of 15+
- **Batch operations** - Modify many elements in one call
- **Data filtering** - Filter results before returning to context
- **Complex workflows** - Loops, conditionals, error handling

## API Reference

Read individual rule files for detailed API documentation:

### Getting Started
- [rules/quick-start.md](rules/quick-start.md) - Quick start guide and setup requirements
- [rules/workflow.md](rules/workflow.md) - Recommended agent workflow and operator rules

### Core APIs
- [rules/status.md](rules/status.md) - `figma.status()` - Check connection
- [rules/query.md](rules/query.md) - `figma.query()` - Query elements by ID, name, or selection

### Creating Elements
- [rules/create.md](rules/create.md) - `figma.create()` - Create elements (frames, text, shapes, semantic types)
- [rules/layout.md](rules/layout.md) - Auto-layout configuration and patterns

### Modifying Elements
- [rules/modify.md](rules/modify.md) - `figma.modify()`, `figma.delete()`, `figma.append()`

### Styling
- [rules/effects.md](rules/effects.md) - Shadows, blur, and visual effects
- [rules/gradients.md](rules/gradients.md) - Gradient fills (linear, radial, angular)
- [rules/corner-radius.md](rules/corner-radius.md) - Independent corner radius
- [rules/strokes.md](rules/strokes.md) - Stroke styling (dash patterns, caps, alignment)
- [rules/transforms.md](rules/transforms.md) - Rotation and blend modes
- [rules/constraints.md](rules/constraints.md) - Responsive constraints and min/max sizes

### Text
- [rules/text.md](rules/text.md) - Text elements, wrapping, and sizing
- [rules/fonts.md](rules/fonts.md) - Loading and using custom fonts

### Components
- [rules/components.md](rules/components.md) - `figma.listComponents()`, `figma.instantiate()`, `figma.toComponent()`, `figma.createVariants()`

### Accessibility
- [rules/accessibility.md](rules/accessibility.md) - `figma.accessibility()` - WCAG compliance checking and auto-fixing

### Design Tokens
- [rules/tokens.md](rules/tokens.md) - `figma.createToken()`, `figma.bindToken()`, `figma.syncTokens()`

### Export
- [rules/export.md](rules/export.md) - `figma.export()` - Export as PNG, SVG, PDF, JPG

### Common Patterns
- [rules/patterns.md](rules/patterns.md) - Cards, navigation bars, page layouts

### Reference
- [rules/target-specifiers.md](rules/target-specifiers.md) - How to target elements (ID, selection, name)
