/**
 * Operation helpers and constants
 */

import type { CreateParams, ElementType, LayoutConfig, EffectConfig, GradientConfig } from './types';

// Default values for element creation
export const DEFAULT_DIMENSIONS: Record<ElementType, { width: number; height: number }> = {
  frame: { width: 100, height: 100 },
  text: { width: 100, height: 20 },
  rect: { width: 100, height: 100 },
  rectangle: { width: 100, height: 100 },
  ellipse: { width: 100, height: 100 },
  line: { width: 100, height: 0 },
  card: { width: 320, height: 200 },
  button: { width: 120, height: 40 },
  form: { width: 400, height: 300 },
  nav: { width: 800, height: 60 },
  input: { width: 240, height: 40 },
};

// Preset styles for semantic elements
export const ELEMENT_PRESETS: Record<string, Partial<CreateParams>> = {
  card: {
    type: 'frame',
    cornerRadius: 8,
    fill: '#FFFFFF',
    layout: { direction: 'column', padding: 16, gap: 12 },
  },
  button: {
    type: 'frame',
    cornerRadius: 6,
    fill: '#0066FF',
    layout: { direction: 'row', padding: { top: 10, right: 20, bottom: 10, left: 20 }, alignItems: 'center', justifyContent: 'center' },
  },
  nav: {
    type: 'frame',
    fill: '#FFFFFF',
    layout: { direction: 'row', padding: { top: 12, right: 24, bottom: 12, left: 24 }, gap: 24, alignItems: 'center' },
  },
  input: {
    type: 'frame',
    cornerRadius: 4,
    fill: '#FFFFFF',
    stroke: '#CCCCCC',
    strokeWidth: 1,
    layout: { direction: 'row', padding: { top: 10, right: 12, bottom: 10, left: 12 }, alignItems: 'center' },
  },
  form: {
    type: 'frame',
    fill: '#FFFFFF',
    cornerRadius: 8,
    layout: { direction: 'column', padding: 24, gap: 16 },
  },
};

// Accessibility constants
export const A11Y_CONSTANTS = {
  MIN_TOUCH_TARGET: 44,
  MIN_CONTRAST_AA: 4.5,
  MIN_CONTRAST_AA_LARGE: 3,
  MIN_CONTRAST_AAA: 7,
  MIN_CONTRAST_AAA_LARGE: 4.5,
  LARGE_TEXT_SIZE: 18,
  LARGE_TEXT_BOLD_SIZE: 14,
};

// HTTP bridge configuration
export const BRIDGE_CONFIG = {
  DEFAULT_PORT: 38451,
  DEFAULT_HOST: 'localhost',
  TIMEOUT_MS: 10000,
  PING_INTERVAL_MS: 5000,
  HEALTH_TTL_MS: 15000,
  MAX_QUEUE: 100,
  MAX_PENDING: 100,
  MAX_BODY_BYTES: 1_000_000,
};

// Parse color string to RGBA
export function parseColor(color: string): { r: number; g: number; b: number; a: number } | null {
  // Handle hex colors
  const hexMatch = color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{4})$/);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    } else if (hex.length === 4) {
      hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1;
    return { r, g, b, a };
  }

  // Handle rgb/rgba
  const rgbMatch = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1], 10) / 255,
      g: parseInt(rgbMatch[2], 10) / 255,
      b: parseInt(rgbMatch[3], 10) / 255,
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
    };
  }

  return null;
}

// Convert layout config to Figma auto-layout properties
export function layoutToFigma(layout: LayoutConfig) {
  const result: Record<string, unknown> = {};

  if (layout.direction) {
    result.layoutMode = layout.direction === 'row' ? 'HORIZONTAL' : 'VERTICAL';
  }

  if (layout.gap !== undefined) {
    result.itemSpacing = layout.gap;
  }

  if (layout.padding !== undefined) {
    if (typeof layout.padding === 'number') {
      result.paddingTop = layout.padding;
      result.paddingRight = layout.padding;
      result.paddingBottom = layout.padding;
      result.paddingLeft = layout.padding;
    } else {
      result.paddingTop = layout.padding.top ?? 0;
      result.paddingRight = layout.padding.right ?? 0;
      result.paddingBottom = layout.padding.bottom ?? 0;
      result.paddingLeft = layout.padding.left ?? 0;
    }
  }

  if (layout.alignItems) {
    const alignMap: Record<string, string> = {
      start: 'MIN',
      center: 'CENTER',
      end: 'MAX',
      baseline: 'BASELINE',
      // Note: 'stretch' is handled via layoutSizingVertical on children, not counterAxisAlignItems
    };
    // For 'stretch', default to 'MIN' and let children handle sizing
    result.counterAxisAlignItems = alignMap[layout.alignItems] ?? 'MIN';

    // Flag for child sizing (handled in createFrame)
    // Check for stretch at runtime (even though TypeScript type doesn't include it)
    if ((layout.alignItems as string) === 'stretch') {
      result._stretchChildren = true;
    }
  }

  if (layout.justifyContent) {
    const justifyMap: Record<string, string> = {
      start: 'MIN',
      center: 'CENTER',
      end: 'MAX',
      'space-between': 'SPACE_BETWEEN',
      'space-around': 'SPACE_BETWEEN', // Figma doesn't have space-around
    };
    result.primaryAxisAlignItems = justifyMap[layout.justifyContent] ?? 'MIN';
  }

  if (layout.wrap) {
    result.layoutWrap = 'WRAP';
  }

  return result;
}

// Generate unique request ID
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Convert effect config to Figma effect
export function effectToFigma(effect: EffectConfig): Record<string, unknown> {
  const result: Record<string, unknown> = {
    type: effect.type,
    visible: effect.visible !== false,
    radius: effect.radius,
  };

  // Parse color with alpha
  if (effect.color) {
    const color = parseColor(effect.color);
    if (color) {
      result.color = { r: color.r, g: color.g, b: color.b, a: color.a };
    }
  } else {
    // Default shadow color
    result.color = { r: 0, g: 0, b: 0, a: 0.25 };
  }

  // Offset and blendMode for shadows
  if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
    result.offset = effect.offset || { x: 0, y: 4 };
    result.spread = effect.spread || 0;
    result.blendMode = 'NORMAL';
  }

  return result;
}

// Convert gradient config to Figma gradient paint
export function gradientToFigma(gradient: GradientConfig, width: number, height: number): Record<string, unknown> {
  const stops = gradient.stops.map(stop => {
    const color = parseColor(stop.color);
    return {
      position: stop.position,
      color: color ? { r: color.r, g: color.g, b: color.b, a: color.a } : { r: 0, g: 0, b: 0, a: 1 },
    };
  });

  const result: Record<string, unknown> = {
    type: 'GRADIENT_' + gradient.type,
    gradientStops: stops,
  };

  // Calculate gradient transform based on angle for linear gradient
  if (gradient.type === 'LINEAR') {
    const angle = (gradient.angle || 0) * (Math.PI / 180);
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    // Figma uses a 2x3 transform matrix
    result.gradientTransform = [
      [cos, sin, 0.5 - cos * 0.5 - sin * 0.5],
      [-sin, cos, 0.5 + sin * 0.5 - cos * 0.5],
    ];
  } else {
    // Default radial/angular/diamond gradient transform (centered)
    result.gradientTransform = [
      [1, 0, 0],
      [0, 1, 0],
    ];
  }

  return result;
}

// Convert degrees to radians
export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
