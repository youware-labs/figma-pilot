/**
 * Modify, Delete, and Append operation handlers
 */

import type { ModifyParams, ModifyResult, DeleteParams, DeleteResult, AppendParams, AppendResult } from '@figma-pilot/shared';
import { parseColor, layoutToFigma } from '@figma-pilot/shared';
import { getTargetNode, getTargetNodes } from '../utils/serialize';

function getFontStyle(weight: number): string {
  if (weight <= 100) return 'Thin';
  if (weight <= 200) return 'Extra Light';
  if (weight <= 300) return 'Light';
  if (weight <= 400) return 'Regular';
  if (weight <= 500) return 'Medium';
  if (weight <= 600) return 'Semi Bold';
  if (weight <= 700) return 'Bold';
  if (weight <= 800) return 'Extra Bold';
  return 'Black';
}

export async function handleModify(params: ModifyParams): Promise<ModifyResult> {
  const node = await getTargetNode(params.target);
  if (!node) {
    throw new Error(`Node not found: ${params.target}`);
  }

  const modified: string[] = [];

  // Name
  if (params.name !== undefined) {
    node.name = params.name;
    modified.push('name');
  }

  // Position
  if (params.x !== undefined && 'x' in node) {
    node.x = params.x;
    modified.push('x');
  }
  if (params.y !== undefined && 'y' in node) {
    node.y = params.y;
    modified.push('y');
  }

  // Size
  if ((params.width !== undefined || params.height !== undefined) && 'resize' in node) {
    const width = params.width ?? ('width' in node ? node.width : 100);
    const height = params.height ?? ('height' in node ? node.height : 100);
    (node as FrameNode).resize(width, height);
    modified.push('size');
  }

  // Visibility
  if (params.visible !== undefined) {
    node.visible = params.visible;
    modified.push('visible');
  }

  // Locked
  if (params.locked !== undefined) {
    node.locked = params.locked;
    modified.push('locked');
  }

  // Opacity
  if (params.opacity !== undefined && 'opacity' in node) {
    (node as FrameNode).opacity = params.opacity;
    modified.push('opacity');
  }

  // Fill
  if (params.fill !== undefined && 'fills' in node) {
    const color = parseColor(params.fill);
    if (color) {
      (node as FrameNode).fills = [
        { type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: color.a },
      ];
      modified.push('fill');
    }
  }

  // Stroke
  if (params.stroke !== undefined && 'strokes' in node) {
    const color = parseColor(params.stroke);
    if (color) {
      (node as FrameNode).strokes = [
        { type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: color.a },
      ];
      modified.push('stroke');
    }
  }

  // Stroke width
  if (params.strokeWidth !== undefined && 'strokeWeight' in node) {
    (node as FrameNode).strokeWeight = params.strokeWidth;
    modified.push('strokeWidth');
  }

  // Corner radius
  if (params.cornerRadius !== undefined && 'cornerRadius' in node) {
    (node as FrameNode).cornerRadius = params.cornerRadius;
    modified.push('cornerRadius');
  }

  // Text content
  if (params.content !== undefined && node.type === 'TEXT') {
    const textNode = node as TextNode;
    // Need to load font first
    if (textNode.fontName !== figma.mixed) {
      await figma.loadFontAsync(textNode.fontName as FontName);
    }
    textNode.characters = params.content;
    modified.push('content');
  }

  // Font size
  if (params.fontSize !== undefined && node.type === 'TEXT') {
    const textNode = node as TextNode;
    if (textNode.fontName !== figma.mixed) {
      await figma.loadFontAsync(textNode.fontName as FontName);
    }
    textNode.fontSize = params.fontSize;
    modified.push('fontSize');
  }

  // Font family and weight
  if ((params.fontFamily !== undefined || params.fontWeight !== undefined) && node.type === 'TEXT') {
    const textNode = node as TextNode;
    const currentFont = textNode.fontName !== figma.mixed ? textNode.fontName as FontName : { family: 'Inter', style: 'Regular' };
    const family = params.fontFamily || currentFont.family;
    const weight = params.fontWeight || 400;
    const style = getFontStyle(weight);

    try {
      await figma.loadFontAsync({ family, style });
      textNode.fontName = { family, style };
      if (params.fontFamily) modified.push('fontFamily');
      if (params.fontWeight) modified.push('fontWeight');
    } catch {
      // Try with Regular style as fallback
      try {
        await figma.loadFontAsync({ family, style: 'Regular' });
        textNode.fontName = { family, style: 'Regular' };
        if (params.fontFamily) modified.push('fontFamily');
      } catch {
        console.warn(`Font not available: ${family} ${style}`);
      }
    }
  }

  // Text color
  if (params.textColor !== undefined && node.type === 'TEXT') {
    const textNode = node as TextNode;
    if (textNode.fontName !== figma.mixed) {
      await figma.loadFontAsync(textNode.fontName as FontName);
    }
    const color = parseColor(params.textColor);
    if (color) {
      textNode.fills = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: color.a }];
      modified.push('textColor');
    }
  }

  // Layout
  if (params.layout && 'layoutMode' in node) {
    const frame = node as FrameNode;
    const layoutProps = layoutToFigma(params.layout);

    if (layoutProps.layoutMode) {
      frame.layoutMode = layoutProps.layoutMode as 'HORIZONTAL' | 'VERTICAL';
    }
    if (layoutProps.itemSpacing !== undefined) {
      frame.itemSpacing = layoutProps.itemSpacing as number;
    }
    if (layoutProps.paddingTop !== undefined) {
      frame.paddingTop = layoutProps.paddingTop as number;
    }
    if (layoutProps.paddingRight !== undefined) {
      frame.paddingRight = layoutProps.paddingRight as number;
    }
    if (layoutProps.paddingBottom !== undefined) {
      frame.paddingBottom = layoutProps.paddingBottom as number;
    }
    if (layoutProps.paddingLeft !== undefined) {
      frame.paddingLeft = layoutProps.paddingLeft as number;
    }
    if (layoutProps.counterAxisAlignItems) {
      frame.counterAxisAlignItems = layoutProps.counterAxisAlignItems as 'MIN' | 'CENTER' | 'MAX' | 'BASELINE';
    }
    if (layoutProps.primaryAxisAlignItems) {
      frame.primaryAxisAlignItems = layoutProps.primaryAxisAlignItems as 'MIN' | 'CENTER' | 'MAX' | 'SPACE_BETWEEN';
    }

    modified.push('layout');
  }

  return {
    nodeId: node.id,
    modified,
  };
}

export async function handleDelete(params: DeleteParams): Promise<DeleteResult> {
  const nodes = await getTargetNodes(params.target);
  if (nodes.length === 0) {
    throw new Error(`No nodes found: ${params.target}`);
  }

  const deleted: string[] = [];

  for (const node of nodes) {
    deleted.push(node.id);
    node.remove();
  }

  return { deleted };
}

export async function handleAppend(params: AppendParams): Promise<AppendResult> {
  // Get nodes to move
  const nodes = await getTargetNodes(params.target);
  if (nodes.length === 0) {
    throw new Error(`No nodes found: ${params.target}`);
  }

  // Get parent container
  let parentNode: SceneNode | null = null;

  if (params.parent === 'selection') {
    const selection = figma.currentPage.selection;
    if (selection.length > 0 && 'appendChild' in selection[0]) {
      parentNode = selection[0];
    }
  } else if (params.parent.startsWith('name:')) {
    const name = params.parent.slice(5);
    const found = figma.currentPage.findOne(n => n.name === name);
    if (found && 'appendChild' in found) {
      parentNode = found as SceneNode;
    }
  } else {
    const found = await figma.getNodeByIdAsync(params.parent);
    if (found && 'appendChild' in found) {
      parentNode = found as SceneNode;
    }
  }

  if (!parentNode || !('appendChild' in parentNode)) {
    throw new Error(`Parent not found or not a container: ${params.parent}`);
  }

  const container = parentNode as FrameNode;

  // Move nodes to parent
  for (const node of nodes) {
    container.appendChild(node);
  }

  return {
    movedCount: nodes.length,
    parentId: container.id,
    parentName: container.name,
  };
}
