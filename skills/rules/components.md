---
name: components
description: Create, list, and manage Figma components - convert, variants, instances
metadata:
  tags: component, variants, instance, reusable
---

## figma_list_components

List all available components in the Figma file.

```typescript
figma_list_components()
figma_list_components({ filter: "Button" })  // Filter by name
```

Use this to discover existing components before creating instances.

---

## figma_to_component

Convert an element to a reusable component.

```typescript
figma_to_component({ target: "selection" })
figma_to_component({ target: "selection", name: "Button/Primary" })
```

Use `/` in the name to create component hierarchies (e.g., "Button/Primary", "Button/Secondary").

---

## figma_create_variants

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

This creates multiple variants of the component with the specified property values.

---

## figma_instantiate

Create an instance of a component.

```typescript
figma_instantiate({ component: "123:456" })
figma_instantiate({ component: "123:456", x: 100, y: 200 })
figma_instantiate({ component: "name:Button/Primary", parent: "name:Card" })
```

Use `figma_list_components` first to discover available components and their IDs or names.

---

## Component Workflow Example

```typescript
// 1. Create a button design
figma_create({
  type: "button",
  name: "Button",
  children: [
    { type: "text", content: "Click Me", textColor: "#FFFFFF" }
  ]
})

// 2. Convert to component
figma_to_component({ target: "selection", name: "Button/Primary" })

// 3. Create variants
figma_create_variants({ target: "selection", property: "state", values: ["default", "hover", "pressed"] })

// 4. List components to verify
figma_list_components({ filter: "Button" })

// 5. Create instances
figma_instantiate({ component: "name:Button/Primary", x: 100, y: 100 })
```
