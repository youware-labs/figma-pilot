/**
 * Accessibility operation handlers
 */

import type {
  AccessibilityParams,
  AccessibilityResult,
  AccessibilityIssue,
} from '@figma-pilot/shared';
import { A11Y_CONSTANTS } from '@figma-pilot/shared';
import { getTargetNodes, findTextNodes, findInteractiveNodes } from '../utils/serialize';

/**
 * Unified accessibility handler - checks and optionally fixes accessibility issues
 */
export async function handleAccessibility(
  params: AccessibilityParams
): Promise<AccessibilityResult> {
  const nodes = await getTargetNodes(params.target);
  if (nodes.length === 0) {
    throw new Error(`No nodes found: ${params.target}`);
  }

  const level = params.level || 'AA';
  const autoFix = params.autoFix || false;
  
  const issues: AccessibilityIssue[] = [];
  let fixedCount = 0;
  let passed = 0;
  let failed = 0;
  let warnings = 0;

  for (const rootNode of nodes) {
    // Check text contrast
    const textNodes = findTextNodes(rootNode);
    for (const textNode of textNodes) {
      const issue = await checkTextContrast(textNode, level);
      if (issue) {
        if (autoFix) {
          const fixed = await fixTextContrast(textNode, level);
          if (fixed) {
            issue.fixed = true;
            fixedCount++;
          }
        }
        issues.push(issue);
        if (issue.severity === 'error') failed++;
        else warnings++;
      } else {
        passed++;
      }
    }

    // Check touch target sizes
    const interactiveNodes = findInteractiveNodes(rootNode);
    for (const node of interactiveNodes) {
      const issue = checkTouchTarget(node);
      if (issue) {
        if (autoFix) {
          const fixed = await fixTouchTarget(node);
          if (fixed) {
            issue.fixed = true;
            fixedCount++;
          }
        }
        issues.push(issue);
        if (issue.severity === 'error') failed++;
        else warnings++;
      } else {
        passed++;
      }
    }
  }

  return {
    issues,
    totalIssues: issues.length,
    fixedCount,
    passed,
    failed,
    warnings,
  };
}

/**
 * Check text contrast against background
 */
async function checkTextContrast(
  textNode: TextNode,
  level: 'AA' | 'AAA'
): Promise<AccessibilityIssue | null> {
  const textColor = getNodeColor(textNode);
  if (!textColor) return null;

  const bgColor = findBackgroundColor(textNode);
  if (!bgColor) return null;

  const contrast = calculateContrastRatio(textColor, bgColor);
  const fontSize = textNode.fontSize !== figma.mixed ? textNode.fontSize : 16;
  const isLargeText = fontSize >= A11Y_CONSTANTS.LARGE_TEXT_SIZE;

  let requiredContrast: number;
  if (level === 'AAA') {
    requiredContrast = isLargeText ? A11Y_CONSTANTS.MIN_CONTRAST_AAA_LARGE : A11Y_CONSTANTS.MIN_CONTRAST_AAA;
  } else {
    requiredContrast = isLargeText ? A11Y_CONSTANTS.MIN_CONTRAST_AA_LARGE : A11Y_CONSTANTS.MIN_CONTRAST_AA;
  }

  if (contrast < requiredContrast) {
    return {
      type: 'contrast',
      nodeId: textNode.id,
      nodeName: textNode.name,
      message: `Text contrast ${contrast.toFixed(2)}:1 is below ${level} requirement of ${requiredContrast}:1`,
      severity: 'error',
      current: contrast.toFixed(2),
      required: requiredContrast.toString(),
    };
  }

  return null;
}

/**
 * Check touch target size
 */
function checkTouchTarget(node: SceneNode): AccessibilityIssue | null {
  const minSize = A11Y_CONSTANTS.MIN_TOUCH_TARGET;

  if (node.width < minSize || node.height < minSize) {
    return {
      type: 'touch-target',
      nodeId: node.id,
      nodeName: node.name,
      message: `Touch target ${node.width}x${node.height} is below minimum ${minSize}x${minSize}`,
      severity: 'error',
      current: `${node.width}x${node.height}`,
      required: `${minSize}x${minSize}`,
    };
  }

  return null;
}

/**
 * Fix text contrast by adjusting text color
 */
async function fixTextContrast(textNode: TextNode, level: 'AA' | 'AAA'): Promise<boolean> {
  const textColor = getNodeColor(textNode);
  if (!textColor) return false;

  const bgColor = findBackgroundColor(textNode);
  if (!bgColor) return false;

  const fontSize = textNode.fontSize !== figma.mixed ? textNode.fontSize : 16;
  const isLargeText = fontSize >= A11Y_CONSTANTS.LARGE_TEXT_SIZE;

  let requiredContrast: number;
  if (level === 'AAA') {
    requiredContrast = isLargeText ? A11Y_CONSTANTS.MIN_CONTRAST_AAA_LARGE : A11Y_CONSTANTS.MIN_CONTRAST_AAA;
  } else {
    requiredContrast = isLargeText ? A11Y_CONSTANTS.MIN_CONTRAST_AA_LARGE : A11Y_CONSTANTS.MIN_CONTRAST_AA;
  }

  // Try to adjust text color to meet contrast requirement
  const adjustedColor = adjustColorForContrast(textColor, bgColor, requiredContrast);

  textNode.fills = [{ type: 'SOLID', color: adjustedColor }];
  return true;
}

/**
 * Fix touch target by increasing size
 */
async function fixTouchTarget(node: SceneNode): Promise<boolean> {
  const minSize = A11Y_CONSTANTS.MIN_TOUCH_TARGET;

  if (!('resize' in node)) return false;

  const newWidth = Math.max(node.width, minSize);
  const newHeight = Math.max(node.height, minSize);

  (node as FrameNode).resize(newWidth, newHeight);
  return true;
}

// Color utility functions

function getNodeColor(node: SceneNode): RGB | null {
  if (!('fills' in node) || !Array.isArray(node.fills)) return null;

  const fills = node.fills as readonly Paint[];
  const solidFill = fills.find((f): f is SolidPaint => f.type === 'SOLID' && f.visible !== false);

  if (solidFill) {
    return solidFill.color;
  }

  return null;
}

function findBackgroundColor(node: SceneNode): RGB | null {
  let current: BaseNode | null = node.parent;

  while (current) {
    if ('fills' in current && Array.isArray(current.fills)) {
      const fills = current.fills as readonly Paint[];
      const solidFill = fills.find((f): f is SolidPaint => f.type === 'SOLID' && f.visible !== false);

      if (solidFill) {
        return solidFill.color;
      }
    }
    current = current.parent;
  }

  // Default to white background
  return { r: 1, g: 1, b: 1 };
}

function calculateContrastRatio(fg: RGB, bg: RGB): number {
  const l1 = getRelativeLuminance(fg);
  const l2 = getRelativeLuminance(bg);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

function getRelativeLuminance(color: RGB): number {
  const rsRGB = color.r;
  const gsRGB = color.g;
  const bsRGB = color.b;

  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function adjustColorForContrast(fg: RGB, bg: RGB, targetContrast: number): RGB {
  const bgLuminance = getRelativeLuminance(bg);

  // Determine if we need to lighten or darken
  const shouldDarken = bgLuminance > 0.5;

  // Binary search for appropriate brightness
  let low = 0;
  let high = 1;
  let result = fg;

  for (let i = 0; i < 20; i++) {
    const mid = (low + high) / 2;
    const adjusted: RGB = shouldDarken
      ? { r: fg.r * mid, g: fg.g * mid, b: fg.b * mid }
      : { r: 1 - (1 - fg.r) * mid, g: 1 - (1 - fg.g) * mid, b: 1 - (1 - fg.b) * mid };

    const contrast = calculateContrastRatio(adjusted, bg);

    if (contrast >= targetContrast) {
      result = adjusted;
      if (shouldDarken) {
        low = mid;
      } else {
        high = mid;
      }
    } else {
      if (shouldDarken) {
        high = mid;
      } else {
        low = mid;
      }
    }
  }

  return result;
}
