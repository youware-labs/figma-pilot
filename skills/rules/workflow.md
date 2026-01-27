---
name: workflow
description: Recommended agent workflow and operator rules for figma-pilot
metadata:
  tags: workflow, best-practices, tips
---

## Agent Workflow (Recommended)

Use this flow to keep requests reliable and minimize mis-targeting:

```text
1) figma_status
2) (If touching existing nodes) figma_selection or figma_query
3) (If using components) figma_list_components
4) figma_create / figma_modify / figma_append
5) figma_ensure_accessibility or figma_audit_accessibility (when relevant)
6) figma_export (only after finishing the request)
```

## Operator Rules

- Always name containers you expect to modify later.
- Prefer `"name:"` targeting over IDs for stability.
- Use `children` for complex layouts instead of multiple top-level calls.
- If no selection exists, use `name:` targets or create a container first.
- Avoid exporting after each micro-step; export once at the end.

## Tips for AI Agents

1. **Always call `figma_status()` first** to verify the connection before running other commands
2. **Query before you modify** using `figma_selection()` or `figma_query()` to avoid mis-targeting
3. **After finishing a requested change (not every step), export a PNG for review** using `figma_export({ target: "selection", format: "png", scale: 2 })`
4. **Always specify position** when creating multiple elements to avoid overlap - use `x` and `y` parameters
5. **Use semantic types** (`card`, `button`, `nav`) when possible - they come pre-styled with auto-layout
6. **Use nested `children`** for complex layouts instead of creating elements separately
7. **Use `"selection"` target** for operations on user-selected elements
8. **Run accessibility checks** after creating UI components with `figma_ensure_accessibility` or `figma_audit_accessibility`
9. **Use `figma_list_components`** to discover existing components before creating instances
10. **Prefer `"name:"` targeting** over IDs - names are more readable and stable
11. **Use `textColor` for text elements** instead of `fill` for better clarity
12. **Use `maxWidth` for long text** to enable automatic text wrapping
13. **Use `layoutSizingHorizontal: "FILL"`** to make child elements stretch to parent width
14. **Use tokens for consistency** via `figma_create_token` and `figma_bind_token` when design systems are involved
