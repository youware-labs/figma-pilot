# figma-pilot MCP Tools

A semantic MCP interface for AI agents to create and modify Figma designs. Unlike low-level Figma APIs, figma-pilot provides high-level operations that are easy for LLMs to understand and use.

## Quick Start

```typescript
// Check connection to Figma plugin
figma_status()

// Create a simple frame
figma_create({ type: "frame", name: "Card", width: 320, height: 200 })

// Create a button with auto-layout
figma_create({ type: "button", name: "Submit", content: "Submit" })

// Modify the current selection
figma_modify({ target: "selection", fill: "#FF0000" })

// Check accessibility
figma_ensure_accessibility({ target: "selection", level: "AA", autoFix: true })
```

## Setup Requirements

1. The figma-pilot Figma plugin must be installed and running in Figma Desktop
2. Run `figma-pilot serve` in a terminal to keep the bridge server running
3. Call `figma_status()` first to verify the connection

## Tool Reference

### Connection & Query

#### `figma_status`
Check connection status to Figma plugin. Call this first to verify the plugin is running.

```typescript
figma_status()
// Returns: { connected: true, pluginVersion: "1.0.0" }
```

#### `figma_selection`
Get information about the current selection in Figma.

```typescript
figma_selection()
// Returns: { nodes: [{ id: "123:456", name: "Frame", type: "FRAME", ... }] }
```

#### `figma_query`
Get detailed information about a specific element.

```typescript
figma_query({ target: "selection" })
figma_query({ target: "123:456" })
figma_query({ target: "name:Hero Section" })
```

#### `figma_list_components`
List all available components in the Figma file.

```typescript
figma_list_components()
figma_list_components({ filter: "Button" })  // Filter by name
```

### Creating Elements

#### `figma_create`
Create new elements in Figma. Supports frames, text, rectangles, ellipses, and semantic types.

**Basic element types**: `frame`, `text`, `rect`, `ellipse`, `line`
**Semantic types** (pre-styled): `card`, `button`, `form`, `nav`, `input`

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Element type (required) |
| `name` | string | Element name |
| `width` | number | Width in pixels |
| `height` | number | Height in pixels |
| `x` | number | X position |
| `y` | number | Y position |
| `parent` | string | Parent container (ID, "selection", or "name:ElementName") |
| `fill` | string | Fill color (hex, e.g., "#FF0000") |
| `stroke` | string | Stroke color (hex) |
| `strokeWidth` | number | Stroke width |
| `strokeAlign` | string | Stroke alignment: "INSIDE", "OUTSIDE", "CENTER" |
| `strokeCap` | string | Stroke cap: "NONE", "ROUND", "SQUARE", "ARROW_LINES", "ARROW_EQUILATERAL" |
| `dashPattern` | number[] | Dash pattern, e.g., [5, 5] for dashed line |
| `cornerRadius` | number | Corner radius (uniform) |
| `topLeftRadius` | number | Top-left corner radius |
| `topRightRadius` | number | Top-right corner radius |
| `bottomLeftRadius` | number | Bottom-left corner radius |
| `bottomRightRadius` | number | Bottom-right corner radius |
| `content` | string | Text content (for text elements) |
| `fontSize` | number | Font size (for text elements) |
| `fontWeight` | number | Font weight (for text elements) |
| `textColor` | string | Text color (hex). Preferred over `fill` for text elements |
| `textAutoResize` | string | Text resize mode: "WIDTH_AND_HEIGHT", "HEIGHT", "TRUNCATE", "NONE" |
| `maxWidth` | number | Max width for text wrapping (auto-enables HEIGHT resize) |
| `lineHeight` | number | Line height in pixels |
| `letterSpacing` | number | Letter spacing in pixels |
| `textDecoration` | string | Text decoration: "NONE", "UNDERLINE", "STRIKETHROUGH" |
| `textCase` | string | Text case: "ORIGINAL", "UPPER", "LOWER", "TITLE" |
| `layoutSizingHorizontal` | string | Horizontal sizing in auto-layout: "FIXED", "HUG", "FILL" |
| `layoutSizingVertical` | string | Vertical sizing in auto-layout: "FIXED", "HUG", "FILL" |
| `effects` | array | Visual effects (shadows, blur) - see Effects section |
| `gradient` | object | Gradient fill - see Gradient section |
| `rotation` | number | Rotation angle in degrees |
| `blendMode` | string | Blend mode for compositing |
| `clipsContent` | boolean | Whether frame clips its children |
| `constraints` | object | Responsive constraints { horizontal, vertical } |
| `layoutPositioning` | string | "AUTO" or "ABSOLUTE" within auto-layout parent |
| `minWidth` | number | Minimum width constraint |
| `minHeight` | number | Minimum height constraint |
| `maxHeight` | number | Maximum height constraint |
| `layout` | object | Auto-layout configuration |
| `children` | array | Nested child elements |

**Examples:**

```typescript
// Simple frame
figma_create({ type: "frame", name: "Container", width: 400, height: 300 })

// Text element
figma_create({ type: "text", content: "Hello World", fontSize: 24, fill: "#333333" })

// Pre-styled button
figma_create({ type: "button", name: "Primary Button" })

// Frame with auto-layout
figma_create({
  type: "frame",
  name: "Row",
  layout: { direction: "row", gap: 16, padding: 24 }
})

// Positioned element
figma_create({ type: "rect", width: 100, height: 100, x: 50, y: 50, fill: "#0066FF" })

// Create inside a parent container
figma_create({ type: "text", content: "Hello", parent: "name:Hero Section" })
figma_create({ type: "text", content: "Hello", parent: "selection" })
figma_create({ type: "text", content: "Hello", parent: "123:456" })
```

**Complex nested layout:**

```typescript
figma_create({
  type: "frame",
  name: "User Card",
  width: 320,
  height: 80,
  fill: "#FFFFFF",
  cornerRadius: 8,
  layout: { direction: "row", gap: 12, padding: 16 },
  children: [
    {
      type: "ellipse",
      name: "Avatar",
      width: 48,
      height: 48,
      fill: "#E0E0E0"
    },
    {
      type: "frame",
      name: "Info",
      layout: { direction: "column", gap: 4 },
      children: [
        { type: "text", content: "John Doe", fontSize: 16, fontWeight: 600 },
        { type: "text", content: "john@example.com", fontSize: 14, fill: "#666666" }
      ]
    }
  ]
})
```

### Modifying Elements

#### `figma_modify`
Modify existing elements.

**Parameters:**
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
| `cornerRadius` | number | New corner radius |
| `opacity` | number | Opacity (0-1) |
| `visible` | boolean | Visibility |
| `content` | string | New text content |
| `fontSize` | number | New font size |
| `layout` | object | Layout updates |

**Examples:**

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

#### `figma_delete`
Delete elements.

```typescript
figma_delete({ target: "selection" })
figma_delete({ target: "123:456" })
figma_delete({ target: "name:OldElement" })
```

#### `figma_append`
Move element(s) into a container frame.

```typescript
// Move selection into a frame by name
figma_append({ target: "selection", parent: "name:Hero Section" })

// Move specific element into another
figma_append({ target: "name:Title", parent: "name:Card" })

// Move by ID
figma_append({ target: "123:456", parent: "789:012" })
```

### Components

#### `figma_to_component`
Convert an element to a reusable component.

```typescript
figma_to_component({ target: "selection" })
figma_to_component({ target: "selection", name: "Button/Primary" })
```

#### `figma_create_variants`
Create component variants with different property values.

```typescript
// Create state variants
figma_create_variants({
  target: "selection",
  property: "state",
  values: ["default", "hover", "pressed", "disabled"]
})

// Create size variants
figma_create_variants({
  target: "123:456",
  property: "size",
  values: ["small", "medium", "large"]
})
```

#### `figma_instantiate`
Create an instance of a component.

```typescript
figma_instantiate({ component: "123:456" })
figma_instantiate({ component: "123:456", x: 100, y: 200 })
figma_instantiate({ component: "name:Button/Primary", parent: "name:Card" })
```

### Accessibility

#### `figma_ensure_accessibility`
Check and optionally fix accessibility issues.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | string | Element to check (required): ID, "selection", "page", or "name:ElementName" |
| `level` | string | WCAG conformance level: "AA" or "AAA" (required) |
| `autoFix` | boolean | Automatically fix issues |

**Checks performed:**
- **Text contrast**: Ensures text meets WCAG contrast requirements
- **Touch targets**: Ensures interactive elements are at least 44x44px

```typescript
// Audit current selection
figma_ensure_accessibility({ target: "selection", level: "AA" })

// Audit and auto-fix
figma_ensure_accessibility({ target: "selection", level: "AA", autoFix: true })

// Audit entire page
figma_ensure_accessibility({ target: "page", level: "AAA", autoFix: true })
```

### Export

#### `figma_export`
Export elements as images.

**Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | string | Element to export (required) |
| `format` | string | Export format: "png", "svg", "pdf", "jpg" (required) |
| `scale` | number | Scale factor (default: 1) |

```typescript
// Export selection as PNG
figma_export({ target: "selection", format: "png" })

// Export as SVG
figma_export({ target: "selection", format: "svg" })

// Export at 2x scale
figma_export({ target: "selection", format: "png", scale: 2 })
```

## Common Patterns

### Creating a Page Layout with Sections
When creating multiple sections for a page, always specify position to stack them vertically:

```typescript
// Navigation at top (y=0)
figma_create({
  type: "frame", name: "Nav", width: 1440, height: 80,
  x: 0, y: 0, fill: "#FFFFFF"
})

// Hero section below nav (y=80)
figma_create({
  type: "frame", name: "Hero", width: 1440, height: 600,
  x: 0, y: 80, fill: "#F5F5F5"
})

// Features section (y=680)
figma_create({
  type: "frame", name: "Features", width: 1440, height: 400,
  x: 0, y: 680, fill: "#FFFFFF"
})

// Footer (y=1080)
figma_create({
  type: "frame", name: "Footer", width: 1440, height: 200,
  x: 0, y: 1080, fill: "#333333"
})
```

### Creating a Card Component

```typescript
// 1. Create the card layout
figma_create({
  type: "card",
  name: "Card",
  width: 320,
  children: [
    { type: "text", name: "Title", content: "Card Title", fontSize: 18, fontWeight: 600 },
    { type: "text", name: "Description", content: "Card description goes here", fontSize: 14, fill: "#666666" }
  ]
})

// 2. Convert to component
figma_to_component({ target: "selection", name: "Card/Default" })

// 3. Create variants
figma_create_variants({ target: "selection", property: "state", values: ["default", "hover"] })
```

### Building a Navigation Bar

```typescript
figma_create({
  type: "nav",
  name: "Navigation",
  width: 1200,
  children: [
    { type: "text", content: "Logo", fontSize: 20, fontWeight: 700 },
    {
      type: "frame",
      layout: { direction: "row", gap: 24 },
      children: [
        { type: "text", content: "Home", fontSize: 14 },
        { type: "text", content: "About", fontSize: 14 },
        { type: "text", content: "Contact", fontSize: 14 }
      ]
    },
    {
      type: "button",
      name: "CTA",
      children: [{ type: "text", content: "Sign Up", fill: "#FFFFFF" }]
    }
  ]
})
```

### Accessibility Workflow

```typescript
// 1. Audit the page
figma_ensure_accessibility({ target: "page", level: "AA" })

// 2. Fix issues automatically
figma_ensure_accessibility({ target: "page", level: "AA", autoFix: true })

// 3. Verify fixes
figma_ensure_accessibility({ target: "page", level: "AA" })
```

## Target Specifiers

Many tools accept a `target` or `parent` parameter. Valid values:
- `"selection"` - The currently selected element(s) in Figma
- `"page"` - All elements on the current page
- `"123:456"` - A specific node ID
- `"name:ElementName"` - Find element by name (e.g., `"name:Hero Section"`)

**Recommended**: Use `"name:"` prefix for targeting - names are more stable than IDs.

```typescript
figma_modify({ target: "name:Navigation", fill: "#FFFFFF" })
figma_create({ type: "text", content: "Hello", parent: "name:Hero" })
figma_append({ target: "selection", parent: "name:Container" })
```

## Layout Object Schema

```typescript
interface Layout {
  direction?: "row" | "column";
  gap?: number;
  padding?: number | { top: number; right: number; bottom: number; left: number };
  alignItems?: "start" | "center" | "end" | "baseline";  // Note: for stretch, use layoutSizingVertical/Horizontal: "FILL"
  justifyContent?: "start" | "center" | "end" | "space-between";
}
```

## Text Wrapping and Sizing

For proper text handling, use these parameters:

```typescript
// Text that wraps within a max width
figma_create({
  type: "text",
  content: "This is a long paragraph that will wrap to multiple lines.",
  maxWidth: 300,  // Automatically enables text wrapping
  lineHeight: 24
})

// Text with explicit color (white text on dark background)
figma_create({
  type: "frame",
  fill: "#333333",
  layout: { direction: "row", padding: 16 },
  children: [
    { type: "text", content: "Button", textColor: "#FFFFFF", fontWeight: 600 }
  ]
})

// Child element that fills parent width
figma_create({
  type: "frame",
  width: 400,
  layout: { direction: "column", gap: 16 },
  children: [
    {
      type: "text",
      content: "Full width text",
      layoutSizingHorizontal: "FILL"  // Stretches to parent width
    }
  ]
})
```

## Effects (Shadows & Blur)

Add visual effects like shadows and blur to elements:

```typescript
// Drop shadow
figma_create({
  type: "card",
  name: "Elevated Card",
  width: 320,
  fill: "#FFFFFF",
  cornerRadius: 16,
  effects: [
    {
      type: "DROP_SHADOW",
      color: "#00000040",  // 25% opacity black
      offset: { x: 0, y: 4 },
      radius: 12,
      spread: 0
    }
  ],
  children: [
    { type: "text", content: "Card with shadow", fontSize: 16 }
  ]
})

// Multiple shadows (layered)
figma_create({
  type: "frame",
  name: "Multi-Shadow",
  width: 200,
  height: 100,
  fill: "#FFFFFF",
  cornerRadius: 8,
  effects: [
    { type: "DROP_SHADOW", color: "#0000001A", offset: { x: 0, y: 1 }, radius: 3 },
    { type: "DROP_SHADOW", color: "#0000000F", offset: { x: 0, y: 4 }, radius: 6 },
    { type: "DROP_SHADOW", color: "#0000000A", offset: { x: 0, y: 10 }, radius: 15 }
  ]
})

// Inner shadow
figma_create({
  type: "rect",
  name: "Inset",
  width: 100,
  height: 100,
  fill: "#F0F0F0",
  effects: [
    { type: "INNER_SHADOW", color: "#00000020", offset: { x: 0, y: 2 }, radius: 4 }
  ]
})

// Layer blur
figma_create({
  type: "rect",
  name: "Blurred",
  width: 200,
  height: 200,
  fill: "#0066FF80",
  effects: [
    { type: "LAYER_BLUR", radius: 20 }
  ]
})

// Background blur (glass effect)
figma_create({
  type: "frame",
  name: "Glass Panel",
  width: 300,
  height: 150,
  fill: "#FFFFFF40",
  cornerRadius: 20,
  effects: [
    { type: "BACKGROUND_BLUR", radius: 40 }
  ]
})
```

**Effect Types:**
| Type | Description | Properties |
|------|-------------|------------|
| `DROP_SHADOW` | Shadow outside the element | color, offset, radius, spread |
| `INNER_SHADOW` | Shadow inside the element | color, offset, radius, spread |
| `LAYER_BLUR` | Blur the element itself | radius |
| `BACKGROUND_BLUR` | Blur content behind element | radius |

## Gradient Fills

Create gradient fills instead of solid colors:

```typescript
// Linear gradient (left to right)
figma_create({
  type: "frame",
  name: "Gradient Banner",
  width: 800,
  height: 200,
  gradient: {
    type: "LINEAR",
    angle: 0,  // 0 = left-to-right, 90 = top-to-bottom
    stops: [
      { position: 0, color: "#667EEA" },
      { position: 1, color: "#764BA2" }
    ]
  }
})

// Diagonal gradient
figma_create({
  type: "rect",
  name: "Diagonal Gradient",
  width: 200,
  height: 200,
  gradient: {
    type: "LINEAR",
    angle: 45,
    stops: [
      { position: 0, color: "#FF6B6B" },
      { position: 0.5, color: "#FFE66D" },
      { position: 1, color: "#4ECDC4" }
    ]
  }
})

// Radial gradient
figma_create({
  type: "ellipse",
  name: "Radial Glow",
  width: 200,
  height: 200,
  gradient: {
    type: "RADIAL",
    stops: [
      { position: 0, color: "#FFFFFF" },
      { position: 1, color: "#0066FF" }
    ]
  }
})

// Angular gradient (conic)
figma_create({
  type: "ellipse",
  name: "Color Wheel",
  width: 200,
  height: 200,
  gradient: {
    type: "ANGULAR",
    stops: [
      { position: 0, color: "#FF0000" },
      { position: 0.17, color: "#FFFF00" },
      { position: 0.33, color: "#00FF00" },
      { position: 0.5, color: "#00FFFF" },
      { position: 0.67, color: "#0000FF" },
      { position: 0.83, color: "#FF00FF" },
      { position: 1, color: "#FF0000" }
    ]
  }
})
```

**Gradient Types:**
| Type | Description |
|------|-------------|
| `LINEAR` | Straight line gradient, use `angle` to control direction |
| `RADIAL` | Circular gradient from center outward |
| `ANGULAR` | Gradient that sweeps around center (conic) |
| `DIAMOND` | Diamond-shaped gradient from center |

## Independent Corner Radius

Set different radius for each corner:

```typescript
// Speech bubble style
figma_create({
  type: "frame",
  name: "Speech Bubble",
  width: 200,
  height: 80,
  fill: "#E8E8E8",
  topLeftRadius: 16,
  topRightRadius: 16,
  bottomLeftRadius: 4,
  bottomRightRadius: 16
})

// Tab shape
figma_create({
  type: "rect",
  name: "Tab",
  width: 120,
  height: 40,
  fill: "#FFFFFF",
  topLeftRadius: 8,
  topRightRadius: 8,
  bottomLeftRadius: 0,
  bottomRightRadius: 0
})

// Notch style
figma_create({
  type: "frame",
  name: "Notched Card",
  width: 300,
  height: 200,
  fill: "#FFFFFF",
  topLeftRadius: 24,
  topRightRadius: 4,
  bottomLeftRadius: 4,
  bottomRightRadius: 24
})
```

## Transform Properties

Apply rotation and blend modes:

```typescript
// Rotated element
figma_create({
  type: "rect",
  name: "Diamond",
  width: 100,
  height: 100,
  fill: "#FF6B6B",
  rotation: 45,
  x: 100,
  y: 100
})

// Blend mode overlay
figma_create({
  type: "frame",
  name: "Overlay Container",
  width: 400,
  height: 300,
  fill: "#000000",
  children: [
    {
      type: "rect",
      name: "Background Image",
      width: 400,
      height: 300,
      fill: "#336699"
    },
    {
      type: "rect",
      name: "Color Overlay",
      width: 400,
      height: 300,
      fill: "#FF6B6B",
      blendMode: "MULTIPLY"
    }
  ]
})
```

**Blend Modes:**
`PASS_THROUGH`, `NORMAL`, `DARKEN`, `MULTIPLY`, `LINEAR_BURN`, `COLOR_BURN`, `LIGHTEN`, `SCREEN`, `LINEAR_DODGE`, `COLOR_DODGE`, `OVERLAY`, `SOFT_LIGHT`, `HARD_LIGHT`, `DIFFERENCE`, `EXCLUSION`, `HUE`, `SATURATION`, `COLOR`, `LUMINOSITY`

## Stroke Styling

Advanced stroke options for lines and shapes:

```typescript
// Dashed border
figma_create({
  type: "rect",
  name: "Dashed Box",
  width: 200,
  height: 100,
  fill: "#FFFFFF",
  stroke: "#666666",
  strokeWidth: 2,
  dashPattern: [8, 4],  // 8px dash, 4px gap
  cornerRadius: 8
})

// Dotted line
figma_create({
  type: "line",
  name: "Dotted Divider",
  width: 300,
  stroke: "#CCCCCC",
  strokeWidth: 2,
  dashPattern: [2, 4],
  strokeCap: "ROUND"
})

// Arrow line
figma_create({
  type: "line",
  name: "Arrow",
  width: 150,
  stroke: "#333333",
  strokeWidth: 2,
  strokeCap: "ARROW_EQUILATERAL"
})

// Inside stroke
figma_create({
  type: "rect",
  name: "Inside Border",
  width: 100,
  height: 100,
  fill: "#FFFFFF",
  stroke: "#0066FF",
  strokeWidth: 4,
  strokeAlign: "INSIDE",
  cornerRadius: 8
})
```

## Responsive Constraints

Set constraints for responsive behavior:

```typescript
// Element that stretches horizontally
figma_create({
  type: "frame",
  name: "Header",
  width: 1440,
  height: 60,
  fill: "#FFFFFF",
  constraints: {
    horizontal: "STRETCH",
    vertical: "MIN"
  }
})

// Centered element
figma_create({
  type: "frame",
  name: "Modal",
  width: 400,
  height: 300,
  fill: "#FFFFFF",
  cornerRadius: 16,
  constraints: {
    horizontal: "CENTER",
    vertical: "CENTER"
  }
})

// Bottom-right anchored
figma_create({
  type: "button",
  name: "FAB",
  constraints: {
    horizontal: "MAX",
    vertical: "MAX"
  }
})
```

**Constraint Values:**
| Value | Behavior |
|-------|----------|
| `MIN` | Anchor to left/top |
| `CENTER` | Stay centered |
| `MAX` | Anchor to right/bottom |
| `STRETCH` | Stretch with container |
| `SCALE` | Scale proportionally |

## Min/Max Size Constraints

Set size limits for responsive elements:

```typescript
// Card with min/max width
figma_create({
  type: "card",
  name: "Responsive Card",
  width: 320,
  minWidth: 280,
  maxWidth: 480,
  layout: { direction: "column", padding: 24, gap: 16 },
  children: [
    { type: "text", content: "Flexible Card", fontSize: 20, fontWeight: 600 }
  ]
})

// Text container with max height
figma_create({
  type: "frame",
  name: "Scrollable Content",
  width: 300,
  minHeight: 100,
  maxHeight: 400,
  fill: "#FFFFFF",
  clipsContent: true,
  layout: { direction: "column", padding: 16, gap: 8 }
})
```

## Tips for AI Agents

1. **Always call `figma_status()` first** to verify the connection before running other commands
2. **Always specify position** when creating multiple elements to avoid overlap - use `x` and `y` parameters
3. **Use semantic types** (`card`, `button`, `nav`) when possible - they come pre-styled with auto-layout
4. **Use nested `children`** for complex layouts instead of creating elements separately
5. **Use `"selection"` target** for operations on user-selected elements
6. **Run accessibility checks** after creating UI components with `figma_ensure_accessibility`
7. **Use `figma_list_components`** to discover existing components before creating instances
8. **Prefer `"name:"` targeting** over IDs - names are more readable and stable
9. **Use `textColor` for text elements** instead of `fill` for better clarity
10. **Use `maxWidth` for long text** to enable automatic text wrapping
11. **Use `layoutSizingHorizontal: "FILL"`** to make child elements stretch to parent width
