---
name: accessibility
description: WCAG compliance checking and auto-fixing for Figma designs
metadata:
  tags: accessibility, wcag, a11y, contrast
---

## figma_ensure_accessibility

Check and optionally fix accessibility issues.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | string | Element to check (required): ID, "selection", "page", or "name:ElementName" |
| `level` | string | WCAG conformance level: "AA" or "AAA" (required) |
| `autoFix` | boolean | Automatically fix issues |

### Checks Performed

- **Text contrast**: Ensures text meets WCAG contrast requirements
- **Touch targets**: Ensures interactive elements are at least 44x44px

### Examples

```typescript
// Audit current selection
figma_ensure_accessibility({ target: "selection", level: "AA" })

// Audit and auto-fix
figma_ensure_accessibility({ target: "selection", level: "AA", autoFix: true })

// Audit entire page
figma_ensure_accessibility({ target: "page", level: "AAA", autoFix: true })
```

## figma_audit_accessibility

Audit accessibility without changing the design.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | string | Element to audit (required): ID, "selection", "page", or "name:ElementName" |
| `output` | string | Output format: "json" or "text" |

```typescript
// Get a structured report
figma_audit_accessibility({ target: "page", output: "json" })

// Get a human-readable report
figma_audit_accessibility({ target: "selection", output: "text" })
```

## Accessibility Workflow

```typescript
// 1. Audit the page
figma_ensure_accessibility({ target: "page", level: "AA" })

// 2. Fix issues automatically
figma_ensure_accessibility({ target: "page", level: "AA", autoFix: true })

// 3. Verify fixes
figma_ensure_accessibility({ target: "page", level: "AA" })
```
