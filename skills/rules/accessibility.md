---
name: accessibility
description: WCAG compliance checking and auto-fixing for Figma designs
metadata:
  tags: accessibility, wcag, a11y, contrast
---

## figma.accessibility()

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

```javascript
// Inside figma_execute:

// Audit current selection (read-only check)
const result = await figma.accessibility({ target: "selection" });

// Audit with AAA level
await figma.accessibility({ target: "selection", level: "AAA" });

// Audit and auto-fix issues
const fixed = await figma.accessibility({ target: "selection", level: "AA", autoFix: true });
console.log(`Fixed ${fixed.fixedCount} of ${fixed.totalIssues} issues`);

// Audit entire page with text output
await figma.accessibility({ target: "page", output: "text" });
```

### Response

```javascript
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

```javascript
// Inside figma_execute - complete accessibility workflow:

// 1. Audit the page
const audit = await figma.accessibility({ target: "page", level: "AA" });
console.log(`Found ${audit.totalIssues} issues`);

// 2. Fix issues automatically
const fixed = await figma.accessibility({ target: "page", level: "AA", autoFix: true });
console.log(`Fixed ${fixed.fixedCount} issues`);

// 3. Verify fixes
const verify = await figma.accessibility({ target: "page", level: "AA" });
console.log(`Remaining issues: ${verify.totalIssues}`);
```
