---
name: accessibility
description: WCAG compliance checking and auto-fixing for Figma designs
metadata:
  tags: accessibility, wcag, a11y, contrast
---

## figma_accessibility

Unified accessibility tool - check and optionally fix accessibility issues.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | string | Element to check (required): ID, "selection", "page", or "name:ElementName" |
| `level` | string | WCAG conformance level: "AA" or "AAA" (default: "AA") |
| `autoFix` | boolean | Automatically fix issues where possible (default: false) |
| `output` | string | Output format: "json" or "text" (default: "json") |

### Checks Performed

- **Text contrast**: Ensures text meets WCAG contrast requirements
- **Touch targets**: Ensures interactive elements are at least 44x44px

### Examples

```typescript
// Audit current selection (read-only check)
figma_accessibility({ target: "selection" })

// Audit with AAA level
figma_accessibility({ target: "selection", level: "AAA" })

// Audit and auto-fix issues
figma_accessibility({ target: "selection", level: "AA", autoFix: true })

// Audit entire page with text output
figma_accessibility({ target: "page", output: "text" })
```

### Response

```typescript
{
  issues: AccessibilityIssue[],
  totalIssues: number,
  fixedCount: number,    // Number fixed (if autoFix was true)
  passed: number,
  failed: number,
  warnings: number
}
```

## Accessibility Workflow

```typescript
// 1. Audit the page
figma_accessibility({ target: "page", level: "AA" })

// 2. Fix issues automatically
figma_accessibility({ target: "page", level: "AA", autoFix: true })

// 3. Verify fixes
figma_accessibility({ target: "page", level: "AA" })
```
