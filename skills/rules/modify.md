---
name: modify
description: Modify, move, and delete elements in Figma
metadata:
  tags: modify, update, delete, append, move, properties
---

## figma_modify

Modify existing elements.

### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | string | Element to modify (required): ID, "selection", or "name:ElementName" |
| `name` | string | New name |
| `width` | number | New width |
| `height` | number | New height |
| `x` | number | New X position |
| `y` | number | New Y position |
| `fill` | string | New fill color (hex) |
| `stroke` | string | New stroke color (hex) |
| `strokeWidth` | number | Stroke width |
| `cornerRadius` | number | New corner radius |
| `opacity` | number | Opacity (0-1) |
| `visible` | boolean | Visibility |
| `locked` | boolean | Lock/unlock element |
| `content` | string | New text content |
| `fontSize` | number | New font size |
| `fontFamily` | string | New font family |
| `fontWeight` | number | New font weight |
| `textColor` | string | New text color |
| `layout` | object | Layout updates |

### Examples

```typescript
// Change fill color
figma_modify({ target: "selection", fill: "#FF0000" })

// Target by name
figma_modify({ target: "name:Hero Section", fill: "#0066FF" })

// Resize and move
figma_modify({ target: "123:456", width: 200, height: 100, x: 50, y: 50 })

// Change text
figma_modify({ target: "selection", content: "New Text", fontSize: 18 })

// Toggle visibility
figma_modify({ target: "selection", visible: false })

// Change opacity
figma_modify({ target: "selection", opacity: 0.5 })

// Update layout
figma_modify({ target: "selection", layout: { gap: 24, padding: 16 } })
```

---

## figma_delete

Delete elements.

```typescript
figma_delete({ target: "selection" })
figma_delete({ target: "123:456" })
figma_delete({ target: "name:OldElement" })
```

---

## figma_append

Move element(s) into a container frame.

```typescript
// Move selection into a frame by name
figma_append({ target: "selection", parent: "name:Hero Section" })

// Move specific element into another
figma_append({ target: "name:Title", parent: "name:Card" })

// Move by ID
figma_append({ target: "123:456", parent: "789:012" })
```
