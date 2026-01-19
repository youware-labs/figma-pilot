/**
 * Node serialization utilities
 */

import type { NodeInfo, FillInfo, StrokeInfo, RGBAColor } from '@figma-pilot/shared';

/**
 * Serialize a Figma node to a JSON-friendly format
 */
export async function serializeNode(node: SceneNode, includeChildren = false): Promise<NodeInfo> {
  const base: NodeInfo = {
    id: node.id,
    name: node.name,
    type: node.type,
    x: 'x' in node ? node.x : 0,
    y: 'y' in node ? node.y : 0,
    width: 'width' in node ? node.width : 0,
    height: 'height' in node ? node.height : 0,
    visible: node.visible,
    locked: node.locked,
    opacity: 'opacity' in node ? node.opacity : 1,
  };

  // Add type-specific properties
  if (node.type === 'TEXT') {
    base.characters = node.characters;
  }

  if ('fills' in node && Array.isArray(node.fills)) {
    base.fills = serializeFills(node.fills as readonly Paint[]);
  }

  if ('strokes' in node && Array.isArray(node.strokes)) {
    base.strokes = serializeStrokes(node.strokes as readonly Paint[], 'strokeWeight' in node ? node.strokeWeight : 1);
  }

  if ('cornerRadius' in node && typeof node.cornerRadius === 'number') {
    base.cornerRadius = node.cornerRadius;
  }

  if ('layoutMode' in node && node.layoutMode !== 'NONE') {
    base.layoutMode = node.layoutMode;
  }

  if (node.type === 'INSTANCE') {
    const mainComponent = await node.getMainComponentAsync();
    base.componentId = mainComponent?.id;
  }

  // Include children if requested
  if (includeChildren && 'children' in node) {
    base.children = await Promise.all(node.children.map(child => serializeNode(child, true)));
  }

  return base;
}

function serializeFills(fills: readonly Paint[]): FillInfo[] {
  return fills
    .filter((fill): fill is SolidPaint => fill.type === 'SOLID')
    .map(fill => ({
      type: fill.type,
      color: {
        r: fill.color.r,
        g: fill.color.g,
        b: fill.color.b,
        a: fill.opacity ?? 1,
      },
      opacity: fill.opacity,
    }));
}

function serializeStrokes(strokes: readonly Paint[], weight: number | typeof figma.mixed): StrokeInfo[] {
  return strokes
    .filter((stroke): stroke is SolidPaint => stroke.type === 'SOLID')
    .map(stroke => ({
      type: stroke.type,
      color: {
        r: stroke.color.r,
        g: stroke.color.g,
        b: stroke.color.b,
        a: stroke.opacity ?? 1,
      },
      weight: typeof weight === 'number' ? weight : 1,
    }));
}

/**
 * Get target node by ID, name, or 'selection'
 * Supports:
 * - 'selection' - current selection
 * - '123:456' - node ID
 * - 'name:MyFrame' - find by name
 */
export async function getTargetNode(target: string): Promise<SceneNode | null> {
  if (target === 'selection') {
    const selection = figma.currentPage.selection;
    return selection.length > 0 ? selection[0] : null;
  }

  // Find by name (format: "name:ElementName")
  if (target.startsWith('name:')) {
    const name = target.slice(5);
    const found = figma.currentPage.findOne(node => node.name === name);
    if (found && 'visible' in found) {
      return found as SceneNode;
    }
    return null;
  }

  // Try to find by ID
  const node = await figma.getNodeByIdAsync(target);
  if (node && 'visible' in node) {
    return node as SceneNode;
  }

  return null;
}

/**
 * Get multiple target nodes
 * Supports:
 * - 'selection' - current selection
 * - 'page' - all page children
 * - '123:456' - node ID
 * - 'name:MyFrame' - find by name
 */
export async function getTargetNodes(target: string): Promise<SceneNode[]> {
  if (target === 'selection') {
    return [...figma.currentPage.selection];
  }

  if (target === 'page') {
    return [...figma.currentPage.children];
  }

  // Find by name (format: "name:ElementName")
  if (target.startsWith('name:')) {
    const name = target.slice(5);
    const found = figma.currentPage.findAll(node => node.name === name);
    return found as SceneNode[];
  }

  // Single node by ID
  const node = await figma.getNodeByIdAsync(target);
  if (node && 'visible' in node) {
    return [node as SceneNode];
  }

  return [];
}

/**
 * Find all nodes matching a predicate within a subtree
 */
export function findNodes<T extends SceneNode>(
  root: SceneNode | PageNode,
  predicate: (node: SceneNode) => node is T
): T[] {
  const results: T[] = [];

  function traverse(node: SceneNode | PageNode) {
    if ('children' in node) {
      for (const child of node.children) {
        if (predicate(child)) {
          results.push(child);
        }
        if ('children' in child) {
          traverse(child);
        }
      }
    }
  }

  if ('visible' in root && predicate(root)) {
    results.push(root);
  }
  traverse(root);

  return results;
}

/**
 * Find all text nodes in a subtree
 */
export function findTextNodes(root: SceneNode | PageNode): TextNode[] {
  return findNodes(root, (node): node is TextNode => node.type === 'TEXT');
}

/**
 * Find all interactive nodes (likely buttons, links, etc.)
 */
export function findInteractiveNodes(root: SceneNode | PageNode): SceneNode[] {
  const results: SceneNode[] = [];

  function traverse(node: SceneNode | PageNode) {
    if ('children' in node) {
      for (const child of node.children) {
        // Heuristics for interactive elements
        const name = child.name.toLowerCase();
        const isInteractive =
          name.includes('button') ||
          name.includes('link') ||
          name.includes('input') ||
          name.includes('checkbox') ||
          name.includes('radio') ||
          name.includes('toggle') ||
          name.includes('tab') ||
          name.includes('menu') ||
          // Instance components often indicate interactive elements
          (child.type === 'INSTANCE' && (
            name.includes('btn') ||
            name.includes('cta') ||
            name.includes('action')
          ));

        if (isInteractive) {
          results.push(child);
        }

        if ('children' in child) {
          traverse(child);
        }
      }
    }
  }

  traverse(root);
  return results;
}
