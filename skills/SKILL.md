---
name: figma-pilot
description: MCP tools for AI agents to create and modify Figma designs through natural language
metadata:
  tags: figma, mcp, design, ai, components, accessibility, tokens
---

## When to use

Use this skill whenever you are working with figma-pilot MCP tools to create or modify Figma designs. This provides domain-specific knowledge for all available tools and best practices.

## How to use

Read individual rule files for detailed explanations and code examples:

### Getting Started
- [rules/quick-start.md](rules/quick-start.md) - Quick start guide and setup requirements
- [rules/workflow.md](rules/workflow.md) - Recommended agent workflow and operator rules

### Connection & Query Tools
- [rules/status.md](rules/status.md) - Check connection status to Figma plugin
- [rules/query.md](rules/query.md) - Query elements by ID, name, or selection (also returns selection info)
- [rules/list-components.md](rules/list-components.md) - List available components in the file

### Creating Elements
- [rules/create.md](rules/create.md) - Create elements (frames, text, shapes, semantic types, nested layouts)
- [rules/layout.md](rules/layout.md) - Auto-layout configuration and patterns

### Modifying Elements
- [rules/modify.md](rules/modify.md) - Modify existing element properties
- [rules/delete.md](rules/delete.md) - Delete elements
- [rules/append.md](rules/append.md) - Move elements into containers

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
- [rules/to-component.md](rules/to-component.md) - Convert elements to reusable components
- [rules/create-variants.md](rules/create-variants.md) - Create component variants
- [rules/instantiate.md](rules/instantiate.md) - Create component instances

### Accessibility
- [rules/accessibility.md](rules/accessibility.md) - WCAG compliance checking and auto-fixing

### Design Tokens
- [rules/tokens.md](rules/tokens.md) - Create, bind, and sync design tokens

### Export
- [rules/export.md](rules/export.md) - Export elements as PNG, SVG, PDF, JPG

### Common Patterns
- [rules/patterns-page-layout.md](rules/patterns-page-layout.md) - Creating page layouts with sections
- [rules/patterns-card.md](rules/patterns-card.md) - Creating card components
- [rules/patterns-navigation.md](rules/patterns-navigation.md) - Building navigation bars

### Reference
- [rules/target-specifiers.md](rules/target-specifiers.md) - How to target elements (ID, selection, name)
