/**
 * Create operation handler
 */

import type { CreateParams, CreateResult, EffectConfig, GradientConfig } from '@figma-pilot/shared';
import { DEFAULT_DIMENSIONS, ELEMENT_PRESETS, parseColor, layoutToFigma, effectToFigma, gradientToFigma } from '@figma-pilot/shared';

export async function handleCreate(params: CreateParams): Promise<CreateResult> {
  // Apply presets for semantic types
  const preset = ELEMENT_PRESETS[params.type];
  if (preset) {
    params = { ...preset, ...params };
  }

  // Determine actual Figma type
  const figmaType = getFigmaType(params.type);

  // Get default dimensions
  const defaults = DEFAULT_DIMENSIONS[params.type] || { width: 100, height: 100 };

  let node: SceneNode;

  switch (figmaType) {
    case 'FRAME':
      node = await createFrame(params, defaults);
      break;
    case 'TEXT':
      node = await createText(params, defaults);
      break;
    case 'RECTANGLE':
      node = await createRectangle(params, defaults);
      break;
    case 'ELLIPSE':
      node = await createEllipse(params, defaults);
      break;
    case 'LINE':
      node = await createLine(params, defaults);
      break;
    default:
      throw new Error(`Unsupported element type: ${params.type}`);
  }

  // Determine parent container
  let parentNode: BaseNode & ChildrenMixin = figma.currentPage;

  if (params.parent) {
    if (params.parent === 'selection') {
      const selection = figma.currentPage.selection;
      if (selection.length > 0 && 'appendChild' in selection[0]) {
        parentNode = selection[0] as BaseNode & ChildrenMixin;
      }
    } else if (params.parent.startsWith('name:')) {
      // Find parent by name
      const name = params.parent.slice(5);
      const found = figma.currentPage.findOne(n => n.name === name);
      if (found && 'appendChild' in found) {
        parentNode = found as BaseNode & ChildrenMixin;
      }
    } else {
      // Find parent by ID
      const targetParent = await figma.getNodeByIdAsync(params.parent);
      if (targetParent && 'appendChild' in targetParent) {
        parentNode = targetParent as BaseNode & ChildrenMixin;
      }
    }
  }

  // Add to parent
  parentNode.appendChild(node);

  // Apply layoutSizing AFTER appending to parent (only works in auto-layout context)
  if (params.layoutSizingHorizontal || params.layoutSizingVertical) {
    // Check if parent has auto-layout
    const hasAutoLayout = 'layoutMode' in parentNode &&
      (parentNode as FrameNode).layoutMode !== 'NONE';

    if (hasAutoLayout) {
      if (params.layoutSizingHorizontal) {
        (node as any).layoutSizingHorizontal = params.layoutSizingHorizontal;
      }
      if (params.layoutSizingVertical) {
        (node as any).layoutSizingVertical = params.layoutSizingVertical;
      }
    }
  }

  // Position element if x/y not specified and adding to page level
  if (params.x === undefined && params.y === undefined && parentNode === figma.currentPage) {
    const viewport = figma.viewport.center;
    node.x = viewport.x - node.width / 2;
    node.y = viewport.y - node.height / 2;
  }

  // Select the new node
  figma.currentPage.selection = [node];

  return {
    nodeId: node.id,
    name: node.name,
    type: node.type,
  };
}

function getFigmaType(type: string): string {
  switch (type) {
    case 'frame':
    case 'card':
    case 'button':
    case 'form':
    case 'nav':
    case 'input':
      return 'FRAME';
    case 'text':
      return 'TEXT';
    case 'rect':
    case 'rectangle':
      return 'RECTANGLE';
    case 'ellipse':
      return 'ELLIPSE';
    case 'line':
      return 'LINE';
    default:
      return 'FRAME';
  }
}

async function createFrame(
  params: CreateParams,
  defaults: { width: number; height: number }
): Promise<FrameNode> {
  const frame = figma.createFrame();

  frame.name = params.name || params.type || 'Frame';
  frame.resize(params.width ?? defaults.width, params.height ?? defaults.height);

  if (params.x !== undefined) frame.x = params.x;
  if (params.y !== undefined) frame.y = params.y;

  // Apply fill
  if (params.fill) {
    const color = parseColor(params.fill);
    if (color) {
      frame.fills = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: color.a }];
    }
  }

  // Apply stroke
  if (params.stroke) {
    const color = parseColor(params.stroke);
    if (color) {
      frame.strokes = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: color.a }];
      frame.strokeWeight = params.strokeWidth ?? 1;
    }
  }

  // Apply stroke properties
  if (params.strokeAlign) {
    frame.strokeAlign = params.strokeAlign;
  }
  if (params.dashPattern && params.dashPattern.length > 0) {
    frame.dashPattern = params.dashPattern;
  }

  // Apply corner radius (uniform or independent)
  if (params.cornerRadius !== undefined) {
    frame.cornerRadius = params.cornerRadius;
  }
  // Independent corner radii (override uniform)
  if (params.topLeftRadius !== undefined) {
    frame.topLeftRadius = params.topLeftRadius;
  }
  if (params.topRightRadius !== undefined) {
    frame.topRightRadius = params.topRightRadius;
  }
  if (params.bottomLeftRadius !== undefined) {
    frame.bottomLeftRadius = params.bottomLeftRadius;
  }
  if (params.bottomRightRadius !== undefined) {
    frame.bottomRightRadius = params.bottomRightRadius;
  }

  // Apply gradient fill (overrides solid fill)
  if (params.gradient) {
    const gradientPaint = gradientToFigma(params.gradient, frame.width, frame.height);
    frame.fills = [gradientPaint as Paint];
  }

  // Apply effects (shadows, blur)
  if (params.effects && params.effects.length > 0) {
    frame.effects = params.effects.map(effect => effectToFigma(effect) as Effect);
  }

  // Apply rotation
  if (params.rotation !== undefined) {
    frame.rotation = params.rotation;
  }

  // Apply blend mode
  if (params.blendMode) {
    frame.blendMode = params.blendMode;
  }

  // Apply clipsContent
  if (params.clipsContent !== undefined) {
    frame.clipsContent = params.clipsContent;
  }

  // Apply constraints
  if (params.constraints) {
    frame.constraints = {
      horizontal: params.constraints.horizontal,
      vertical: params.constraints.vertical,
    };
  }

  // Apply min/max size constraints
  if (params.minWidth !== undefined) {
    frame.minWidth = params.minWidth;
  }
  if (params.maxWidth !== undefined) {
    frame.maxWidth = params.maxWidth;
  }
  if (params.minHeight !== undefined) {
    frame.minHeight = params.minHeight;
  }
  if (params.maxHeight !== undefined) {
    frame.maxHeight = params.maxHeight;
  }

  // Apply layout
  if (params.layout) {
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
    if (layoutProps.layoutWrap) {
      frame.layoutWrap = layoutProps.layoutWrap as 'NO_WRAP' | 'WRAP';
    }

    // Set primary axis sizing mode (for the frame itself)
    if (frame.layoutMode === 'HORIZONTAL') {
      frame.primaryAxisSizingMode = params.width ? 'FIXED' : 'AUTO';
      frame.counterAxisSizingMode = params.height ? 'FIXED' : 'AUTO';
    } else if (frame.layoutMode === 'VERTICAL') {
      frame.primaryAxisSizingMode = params.height ? 'FIXED' : 'AUTO';
      frame.counterAxisSizingMode = params.width ? 'FIXED' : 'AUTO';
    }
  }

  // Create children recursively
  if (params.children && params.children.length > 0) {
    for (const childParams of params.children) {
      const childResult = await handleCreate(childParams);
      const childNode = await figma.getNodeByIdAsync(childResult.nodeId);
      if (childNode && 'parent' in childNode) {
        frame.appendChild(childNode as SceneNode);
      }
    }
  }

  return frame;
}

async function createText(
  params: CreateParams,
  defaults: { width: number; height: number }
): Promise<TextNode> {
  const text = figma.createText();

  // Load font first
  const fontFamily = params.fontFamily || 'Inter';
  const fontWeight = params.fontWeight || 400;
  const fontStyle = getFontStyle(fontWeight);

  let loadedFont: FontName = { family: 'Inter', style: 'Regular' };
  try {
    await figma.loadFontAsync({ family: fontFamily, style: fontStyle });
    loadedFont = { family: fontFamily, style: fontStyle };
  } catch {
    // Fallback to Inter Regular
    await figma.loadFontAsync({ family: 'Inter', style: 'Regular' });
  }

  // Apply the loaded font to the text node
  text.fontName = loadedFont;

  text.name = params.name || 'Text';
  text.characters = params.content || '';

  if (params.fontSize) {
    text.fontSize = params.fontSize;
  }

  if (params.textAlign) {
    text.textAlignHorizontal = params.textAlign;
  }

  // Apply text color (prefer textColor, fallback to fill)
  const textColorValue = params.textColor || params.fill;
  if (textColorValue) {
    const color = parseColor(textColorValue);
    if (color) {
      text.fills = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: color.a }];
    }
  }

  // Set text auto resize mode
  if (params.textAutoResize) {
    text.textAutoResize = params.textAutoResize;
  } else if (params.maxWidth) {
    // If maxWidth specified, enable height-only resize for wrapping
    text.textAutoResize = 'HEIGHT';
    text.resize(params.maxWidth, text.height);
  } else {
    // Default: auto-size both dimensions
    text.textAutoResize = 'WIDTH_AND_HEIGHT';
  }

  // Set line height
  if (params.lineHeight) {
    text.lineHeight = { value: params.lineHeight, unit: 'PIXELS' };
  }

  // Set letter spacing
  if (params.letterSpacing !== undefined) {
    text.letterSpacing = { value: params.letterSpacing, unit: 'PIXELS' };
  }

  // Set text decoration
  if (params.textDecoration) {
    text.textDecoration = params.textDecoration;
  }

  // Set text case
  if (params.textCase) {
    text.textCase = params.textCase;
  }

  // Apply rotation
  if (params.rotation !== undefined) {
    text.rotation = params.rotation;
  }

  // Apply blend mode
  if (params.blendMode) {
    text.blendMode = params.blendMode;
  }

  // Apply effects (shadows, blur)
  if (params.effects && params.effects.length > 0) {
    text.effects = params.effects.map(effect => effectToFigma(effect) as Effect);
  }

  if (params.x !== undefined) text.x = params.x;
  if (params.y !== undefined) text.y = params.y;

  return text;
}

async function createRectangle(
  params: CreateParams,
  defaults: { width: number; height: number }
): Promise<RectangleNode> {
  const rect = figma.createRectangle();

  rect.name = params.name || 'Rectangle';
  rect.resize(params.width ?? defaults.width, params.height ?? defaults.height);

  if (params.x !== undefined) rect.x = params.x;
  if (params.y !== undefined) rect.y = params.y;

  // Apply fill
  if (params.fill) {
    const color = parseColor(params.fill);
    if (color) {
      rect.fills = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: color.a }];
    }
  }

  // Apply gradient fill (overrides solid fill)
  if (params.gradient) {
    const gradientPaint = gradientToFigma(params.gradient, rect.width, rect.height);
    rect.fills = [gradientPaint as Paint];
  }

  // Apply stroke
  if (params.stroke) {
    const color = parseColor(params.stroke);
    if (color) {
      rect.strokes = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: color.a }];
      rect.strokeWeight = params.strokeWidth ?? 1;
    }
  }

  // Apply stroke properties
  if (params.strokeAlign) {
    rect.strokeAlign = params.strokeAlign;
  }
  if (params.dashPattern && params.dashPattern.length > 0) {
    rect.dashPattern = params.dashPattern;
  }

  // Apply corner radius (uniform or independent)
  if (params.cornerRadius !== undefined) {
    rect.cornerRadius = params.cornerRadius;
  }
  if (params.topLeftRadius !== undefined) {
    rect.topLeftRadius = params.topLeftRadius;
  }
  if (params.topRightRadius !== undefined) {
    rect.topRightRadius = params.topRightRadius;
  }
  if (params.bottomLeftRadius !== undefined) {
    rect.bottomLeftRadius = params.bottomLeftRadius;
  }
  if (params.bottomRightRadius !== undefined) {
    rect.bottomRightRadius = params.bottomRightRadius;
  }

  // Apply effects
  if (params.effects && params.effects.length > 0) {
    rect.effects = params.effects.map(effect => effectToFigma(effect) as Effect);
  }

  // Apply rotation
  if (params.rotation !== undefined) {
    rect.rotation = params.rotation;
  }

  // Apply blend mode
  if (params.blendMode) {
    rect.blendMode = params.blendMode;
  }

  // Apply constraints
  if (params.constraints) {
    rect.constraints = {
      horizontal: params.constraints.horizontal,
      vertical: params.constraints.vertical,
    };
  }

  return rect;
}

async function createEllipse(
  params: CreateParams,
  defaults: { width: number; height: number }
): Promise<EllipseNode> {
  const ellipse = figma.createEllipse();

  ellipse.name = params.name || 'Ellipse';
  ellipse.resize(params.width ?? defaults.width, params.height ?? defaults.height);

  if (params.x !== undefined) ellipse.x = params.x;
  if (params.y !== undefined) ellipse.y = params.y;

  // Apply fill
  if (params.fill) {
    const color = parseColor(params.fill);
    if (color) {
      ellipse.fills = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: color.a }];
    }
  }

  // Apply gradient fill (overrides solid fill)
  if (params.gradient) {
    const gradientPaint = gradientToFigma(params.gradient, ellipse.width, ellipse.height);
    ellipse.fills = [gradientPaint as Paint];
  }

  // Apply stroke
  if (params.stroke) {
    const color = parseColor(params.stroke);
    if (color) {
      ellipse.strokes = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: color.a }];
      ellipse.strokeWeight = params.strokeWidth ?? 1;
    }
  }

  // Apply stroke properties
  if (params.strokeAlign) {
    ellipse.strokeAlign = params.strokeAlign;
  }
  if (params.dashPattern && params.dashPattern.length > 0) {
    ellipse.dashPattern = params.dashPattern;
  }

  // Apply effects
  if (params.effects && params.effects.length > 0) {
    ellipse.effects = params.effects.map(effect => effectToFigma(effect) as Effect);
  }

  // Apply rotation
  if (params.rotation !== undefined) {
    ellipse.rotation = params.rotation;
  }

  // Apply blend mode
  if (params.blendMode) {
    ellipse.blendMode = params.blendMode;
  }

  // Apply constraints
  if (params.constraints) {
    ellipse.constraints = {
      horizontal: params.constraints.horizontal,
      vertical: params.constraints.vertical,
    };
  }

  return ellipse;
}

async function createLine(
  params: CreateParams,
  defaults: { width: number; height: number }
): Promise<LineNode> {
  const line = figma.createLine();

  line.name = params.name || 'Line';
  line.resize(params.width ?? defaults.width, 0);

  if (params.x !== undefined) line.x = params.x;
  if (params.y !== undefined) line.y = params.y;

  // Apply stroke
  if (params.stroke) {
    const color = parseColor(params.stroke);
    if (color) {
      line.strokes = [{ type: 'SOLID', color: { r: color.r, g: color.g, b: color.b }, opacity: color.a }];
    }
  }
  line.strokeWeight = params.strokeWidth ?? 1;

  // Apply stroke properties
  if (params.strokeCap) {
    line.strokeCap = params.strokeCap;
  }
  if (params.dashPattern && params.dashPattern.length > 0) {
    line.dashPattern = params.dashPattern;
  }

  // Apply rotation
  if (params.rotation !== undefined) {
    line.rotation = params.rotation;
  }

  // Apply blend mode
  if (params.blendMode) {
    line.blendMode = params.blendMode;
  }

  // Apply effects
  if (params.effects && params.effects.length > 0) {
    line.effects = params.effects.map(effect => effectToFigma(effect) as Effect);
  }

  // Apply constraints
  if (params.constraints) {
    line.constraints = {
      horizontal: params.constraints.horizontal,
      vertical: params.constraints.vertical,
    };
  }

  return line;
}

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
