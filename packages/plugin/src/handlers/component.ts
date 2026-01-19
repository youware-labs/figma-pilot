/**
 * Component operation handlers
 */

import type {
  ToComponentParams,
  ToComponentResult,
  CreateVariantsParams,
  CreateVariantsResult,
  InstantiateParams,
  InstantiateResult,
  ListComponentsParams,
  ListComponentsResult,
  ComponentInfo,
} from '@figma-pilot/shared';
import { getTargetNode } from '../utils/serialize';

export async function handleListComponents(params: ListComponentsParams): Promise<ListComponentsResult> {
  const components: ComponentInfo[] = [];

  // Load all pages first (required for dynamic-page documentAccess)
  await figma.loadAllPagesAsync();

  // Find all components in the document
  const allComponents = figma.root.findAllWithCriteria({
    types: ['COMPONENT'],
  });

  for (const comp of allComponents) {
    // Filter by name if provided
    if (params.filter && !comp.name.toLowerCase().includes(params.filter.toLowerCase())) {
      continue;
    }

    const info: ComponentInfo = {
      id: comp.id,
      name: comp.name,
      description: comp.description || undefined,
      isVariant: comp.parent?.type === 'COMPONENT_SET',
    };

    // Get variant properties if it's a variant
    if (info.isVariant && comp.parent?.type === 'COMPONENT_SET') {
      const variantProps: Record<string, string> = {};
      const parts = comp.name.split(',').map(p => p.trim());
      for (const part of parts) {
        const [key, value] = part.split('=').map(s => s.trim());
        if (key && value) {
          variantProps[key] = value;
        }
      }
      info.variantProperties = variantProps;
    }

    components.push(info);
  }

  return { components };
}

export async function handleComponent(params: ToComponentParams): Promise<ToComponentResult> {
  const node = await getTargetNode(params.target);
  if (!node) {
    throw new Error(`Node not found: ${params.target}`);
  }

  if (node.type === 'COMPONENT') {
    // Already a component
    return {
      componentId: node.id,
      name: node.name,
    };
  }

  if (!('children' in node) && node.type !== 'TEXT' && node.type !== 'RECTANGLE' && node.type !== 'ELLIPSE') {
    throw new Error(`Cannot convert ${node.type} to component`);
  }

  // Create component from node
  let component: ComponentNode;

  if (node.type === 'FRAME' || node.type === 'GROUP') {
    component = figma.createComponentFromNode(node);
  } else {
    // Wrap in a frame first
    const frame = figma.createFrame();
    frame.name = params.name || node.name;
    frame.x = node.x;
    frame.y = node.y;
    frame.resize(node.width, node.height);
    frame.fills = [];

    const clone = node.clone();
    clone.x = 0;
    clone.y = 0;
    frame.appendChild(clone);

    component = figma.createComponentFromNode(frame);
    node.remove();
  }

  if (params.name) {
    component.name = params.name;
  }

  return {
    componentId: component.id,
    name: component.name,
  };
}

export async function handleCreateVariants(params: CreateVariantsParams): Promise<CreateVariantsResult> {
  const node = await figma.getNodeByIdAsync(params.target);
  if (!node) {
    throw new Error(`Node not found: ${params.target}`);
  }

  let component: ComponentNode;

  // Convert to component if needed
  if (node.type === 'COMPONENT') {
    component = node;
  } else if (node.type === 'FRAME' || node.type === 'GROUP') {
    component = figma.createComponentFromNode(node as FrameNode);
  } else {
    throw new Error(`Cannot create variants from ${node.type}`);
  }

  // Check if already in a component set
  if (component.parent?.type === 'COMPONENT_SET') {
    // Add variants to existing set
    const componentSet = component.parent;
    const createdVariants: string[] = [component.name];

    for (let i = 1; i < params.values.length; i++) {
      const value = params.values[i];
      const variant = component.clone();
      variant.name = `${params.property}=${value}`;
      componentSet.appendChild(variant);
      createdVariants.push(variant.name);

      // Apply variant-specific styling
      await applyVariantStyle(variant, params.property, value);
    }

    // Rename original
    component.name = `${params.property}=${params.values[0]}`;

    return {
      componentSetId: componentSet.id,
      variants: createdVariants,
      variantCount: createdVariants.length,
    };
  }

  // Create new component set
  const variants: ComponentNode[] = [component];
  component.name = `${params.property}=${params.values[0]}`;

  // Create additional variants
  for (let i = 1; i < params.values.length; i++) {
    const value = params.values[i];
    const variant = component.clone();
    variant.name = `${params.property}=${value}`;
    variants.push(variant);

    // Apply variant-specific styling
    await applyVariantStyle(variant, params.property, value);
  }

  // Combine into component set
  const componentSet = figma.combineAsVariants(variants, figma.currentPage);
  componentSet.name = component.name.split('=')[0] || 'Component';

  return {
    componentSetId: componentSet.id,
    variants: variants.map(v => v.name),
    variantCount: variants.length,
  };
}

export async function handleInstantiate(params: InstantiateParams): Promise<InstantiateResult> {
  let componentNode: ComponentNode | null = null;

  // Find component by name or ID
  if (params.component.startsWith('name:')) {
    const name = params.component.slice(5);
    // Load all pages first (required for dynamic-page documentAccess)
    await figma.loadAllPagesAsync();
    const found = figma.root.findOne(n => n.type === 'COMPONENT' && n.name === name);
    if (found && found.type === 'COMPONENT') {
      componentNode = found;
    }
  } else {
    const node = await figma.getNodeByIdAsync(params.component);
    if (node && node.type === 'COMPONENT') {
      componentNode = node as ComponentNode;
    }
  }

  if (!componentNode) {
    throw new Error(`Component not found: ${params.component}`);
  }

  const instance = componentNode.createInstance();

  if (params.x !== undefined) instance.x = params.x;
  if (params.y !== undefined) instance.y = params.y;

  // Determine parent
  let parentNode: BaseNode & ChildrenMixin = figma.currentPage;

  if (params.parent) {
    if (params.parent === 'selection') {
      const selection = figma.currentPage.selection;
      if (selection.length > 0 && 'appendChild' in selection[0]) {
        parentNode = selection[0] as BaseNode & ChildrenMixin;
      }
    } else if (params.parent.startsWith('name:')) {
      const name = params.parent.slice(5);
      const found = figma.currentPage.findOne(n => n.name === name);
      if (found && 'appendChild' in found) {
        parentNode = found as BaseNode & ChildrenMixin;
      }
    } else {
      const found = await figma.getNodeByIdAsync(params.parent);
      if (found && 'appendChild' in found) {
        parentNode = found as BaseNode & ChildrenMixin;
      }
    }
  }

  parentNode.appendChild(instance);
  figma.currentPage.selection = [instance];

  return {
    instanceId: instance.id,
    componentId: componentNode.id,
  };
}

/**
 * Apply styling based on variant value (e.g., hover, pressed, disabled)
 */
async function applyVariantStyle(node: ComponentNode, property: string, value: string) {
  const lowerValue = value.toLowerCase();

  // Common state-based styling
  if (property.toLowerCase() === 'state' || property.toLowerCase() === 'variant') {
    switch (lowerValue) {
      case 'hover':
        // Slightly darker
        adjustBrightness(node, -0.05);
        break;
      case 'pressed':
      case 'active':
        // More darker
        adjustBrightness(node, -0.1);
        break;
      case 'disabled':
        // Reduced opacity and desaturated
        node.opacity = 0.5;
        break;
      case 'focus':
        // Add focus ring (outline)
        if ('strokes' in node) {
          node.strokes = [{ type: 'SOLID', color: { r: 0, g: 0.4, b: 1 } }];
          node.strokeWeight = 2;
        }
        break;
    }
  }
}

/**
 * Adjust the brightness of fills in a node
 */
function adjustBrightness(node: SceneNode, amount: number) {
  if (!('fills' in node) || !Array.isArray(node.fills)) return;

  const fills = [...node.fills] as Paint[];
  for (let i = 0; i < fills.length; i++) {
    const fill = fills[i];
    if (fill.type === 'SOLID') {
      fills[i] = {
        ...fill,
        color: {
          r: Math.max(0, Math.min(1, fill.color.r + amount)),
          g: Math.max(0, Math.min(1, fill.color.g + amount)),
          b: Math.max(0, Math.min(1, fill.color.b + amount)),
        },
      };
    }
  }
  (node as FrameNode).fills = fills;
}
