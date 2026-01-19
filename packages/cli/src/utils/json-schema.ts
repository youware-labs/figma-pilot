/**
 * JSON schema validation and parsing utilities
 */

import type { CreateParams } from '@figma-pilot/shared';

/**
 * Parse JSON input from --json flag
 */
export function parseJsonInput(input: string): unknown {
  try {
    return JSON.parse(input);
  } catch (error) {
    throw new Error(`Invalid JSON: ${(error as Error).message}`);
  }
}

/**
 * Validate create parameters
 */
export function validateCreateParams(params: unknown): CreateParams {
  if (typeof params !== 'object' || params === null) {
    throw new Error('Create params must be an object');
  }

  const p = params as Record<string, unknown>;

  if (!p.type || typeof p.type !== 'string') {
    throw new Error('Create params must have a "type" field');
  }

  // Validate children recursively
  if (p.children && Array.isArray(p.children)) {
    p.children = p.children.map(child => validateCreateParams(child));
  }

  return p as CreateParams;
}

/**
 * Parse size string (e.g., "100,200" or "100x200")
 */
export function parseSize(size: string): { width: number; height: number } {
  const parts = size.split(/[,x]/);
  if (parts.length !== 2) {
    throw new Error('Size must be in format "width,height" or "widthxheight"');
  }

  const width = parseFloat(parts[0]);
  const height = parseFloat(parts[1]);

  if (isNaN(width) || isNaN(height)) {
    throw new Error('Size values must be numbers');
  }

  return { width, height };
}

/**
 * Parse position string (e.g., "100,200")
 */
export function parsePosition(position: string): { x: number; y: number } {
  const parts = position.split(',');
  if (parts.length !== 2) {
    throw new Error('Position must be in format "x,y"');
  }

  const x = parseFloat(parts[0]);
  const y = parseFloat(parts[1]);

  if (isNaN(x) || isNaN(y)) {
    throw new Error('Position values must be numbers');
  }

  return { x, y };
}

/**
 * Parse comma-separated values
 */
export function parseValues(values: string): string[] {
  return values.split(',').map(v => v.trim()).filter(v => v.length > 0);
}

/**
 * Merge CLI flags with JSON input, CLI flags take precedence
 */
export function mergeParams<T extends Record<string, unknown>>(
  jsonParams: T | undefined,
  cliParams: Partial<T>
): T {
  const result = { ...(jsonParams || {}) } as T;

  for (const [key, value] of Object.entries(cliParams)) {
    if (value !== undefined) {
      (result as Record<string, unknown>)[key] = value;
    }
  }

  return result;
}
