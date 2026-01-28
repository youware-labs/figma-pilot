---
name: modify
description: Modify, move, and delete elements in Figma
metadata:
  tags: modify, update, delete, append, move, properties
---

## figma.modify()

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

```javascript
// Inside figma_execute:

// Change fill color
await figma.modify({ target: "selection", fill: "#FF0000" });

// Target by name
await figma.modify({ target: "name:Hero Section", fill: "#0066FF" });

// Resize and move
await figma.modify({ target: "123:456", width: 200, height: 100, x: 50, y: 50 });

// Change text
await figma.modify({ target: "selection", content: "New Text", fontSize: 18 });

// Toggle visibility
await figma.modify({ target: "selection", visible: false });

// Change opacity
await figma.modify({ target: "selection", opacity: 0.5 });

// Update layout
await figma.modify({ target: "selection", layout: { gap: 24, padding: 16 } });

// Batch modify multiple elements
const { nodes } = await figma.query({ target: "selection" });
for (const node of nodes) {
  await figma.modify({ target: node.id, fill: "#0066FF" });
}
console.log(`Modified ${nodes.length} elements`);
```

---

## figma.delete()

Delete elements.

```javascript
// Inside figma_execute:
await figma.delete({ target: "selection" });
await figma.delete({ target: "123:456" });
await figma.delete({ target: "name:OldElement" });
```

---

## figma.append()

Move element(s) into a container frame.

```javascript
// Inside figma_execute:

// Move selection into a frame by name
await figma.append({ target: "selection", parent: "name:Hero Section" });

// Move specific element into another
await figma.append({ target: "name:Title", parent: "name:Card" });

// Move by ID
await figma.append({ target: "123:456", parent: "789:012" });
```
