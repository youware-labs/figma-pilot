---
name: components
description: Create, list, and manage Figma components - convert, variants, instances
metadata:
  tags: component, variants, instance, reusable
---

## figma.listComponents()

List all available components in the Figma file.

```javascript
// Inside figma_execute:
const { components } = await figma.listComponents();
const { components } = await figma.listComponents({ filter: "Button" });  // Filter by name
console.log(`Found ${components.length} components`);
```

Use this to discover existing components before creating instances.

---

## figma.toComponent()

Convert an element to a reusable component.

```javascript
// Inside figma_execute:
await figma.toComponent({ target: "selection" });
await figma.toComponent({ target: "selection", name: "Button/Primary" });
```

Use `/` in the name to create component hierarchies (e.g., "Button/Primary", "Button/Secondary").

---

## figma.createVariants()

Create component variants with different property values.

```javascript
// Inside figma_execute:

// Create state variants
await figma.createVariants({
  target: "selection",
  property: "state",
  values: ["default", "hover", "pressed", "disabled"]
});

// Create size variants
await figma.createVariants({
  target: "123:456",
  property: "size",
  values: ["small", "medium", "large"]
});
```

This creates multiple variants of the component with the specified property values.

---

## figma.instantiate()

Create an instance of a component.

```javascript
// Inside figma_execute:
await figma.instantiate({ component: "123:456" });
await figma.instantiate({ component: "123:456", x: 100, y: 200 });
await figma.instantiate({ component: "name:Button/Primary", parent: "name:Card" });
```

Use `figma.listComponents()` first to discover available components and their IDs or names.

---

## Component Workflow Example

```javascript
// Inside figma_execute - complete component workflow:

// 1. Create a button design
await figma.create({
  type: "button",
  name: "Button",
  children: [
    { type: "text", content: "Click Me", textColor: "#FFFFFF" }
  ]
});

// 2. Convert to component
await figma.toComponent({ target: "selection", name: "Button/Primary" });

// 3. Create variants
await figma.createVariants({ 
  target: "selection", 
  property: "state", 
  values: ["default", "hover", "pressed"] 
});

// 4. List components to verify
const { components } = await figma.listComponents({ filter: "Button" });
console.log(`Created ${components.length} button components`);

// 5. Create instances
await figma.instantiate({ component: "name:Button/Primary", x: 100, y: 100 });
```
