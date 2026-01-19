/**
 * Design token operation handlers
 */

import type {
  BindTokenParams,
  BindTokenResult,
  CreateTokenParams,
  CreateTokenResult,
  SyncTokensParams,
  SyncTokensResult,
} from '@figma-pilot/shared';
import { getTargetNode } from '../utils/serialize';

export async function handleBindToken(params: BindTokenParams): Promise<BindTokenResult> {
  const node = await getTargetNode(params.target);
  if (!node) {
    throw new Error(`Node not found: ${params.target}`);
  }

  // Find the variable by path
  const variable = await findVariableByPath(params.token);
  if (!variable) {
    throw new Error(`Token not found: ${params.token}`);
  }

  let previousValue: string | undefined;

  // Bind the variable to the property
  switch (params.property) {
    case 'fill':
      if ('fills' in node) {
        previousValue = describeFills(node.fills as readonly Paint[]);
        const fills = figma.variables.setBoundVariableForPaint(
          { type: 'SOLID', color: { r: 0, g: 0, b: 0 } },
          'color',
          variable
        );
        (node as FrameNode).fills = [fills];
      }
      break;

    case 'stroke':
      if ('strokes' in node) {
        previousValue = describeFills(node.strokes as readonly Paint[]);
        const stroke = figma.variables.setBoundVariableForPaint(
          { type: 'SOLID', color: { r: 0, g: 0, b: 0 } },
          'color',
          variable
        );
        (node as FrameNode).strokes = [stroke];
      }
      break;

    case 'cornerRadius':
      if ('cornerRadius' in node && 'setBoundVariable' in node) {
        previousValue = String((node as FrameNode).cornerRadius);
        (node as FrameNode).setBoundVariable('topLeftRadius', variable);
        (node as FrameNode).setBoundVariable('topRightRadius', variable);
        (node as FrameNode).setBoundVariable('bottomLeftRadius', variable);
        (node as FrameNode).setBoundVariable('bottomRightRadius', variable);
      }
      break;

    case 'gap':
      if ('itemSpacing' in node && 'setBoundVariable' in node) {
        previousValue = String((node as FrameNode).itemSpacing);
        (node as FrameNode).setBoundVariable('itemSpacing', variable);
      }
      break;

    case 'padding':
      if ('paddingTop' in node && 'setBoundVariable' in node) {
        const frame = node as FrameNode;
        previousValue = `${frame.paddingTop}/${frame.paddingRight}/${frame.paddingBottom}/${frame.paddingLeft}`;
        frame.setBoundVariable('paddingTop', variable);
        frame.setBoundVariable('paddingRight', variable);
        frame.setBoundVariable('paddingBottom', variable);
        frame.setBoundVariable('paddingLeft', variable);
      }
      break;

    case 'fontSize':
      if (node.type === 'TEXT' && 'setBoundVariable' in node) {
        previousValue = String(node.fontSize);
        node.setBoundVariable('fontSize', variable);
      }
      break;

    default:
      throw new Error(`Unsupported property for token binding: ${params.property}`);
  }

  return {
    nodeId: node.id,
    property: params.property,
    token: params.token,
    previousValue,
  };
}

export async function handleCreateToken(params: CreateTokenParams): Promise<CreateTokenResult> {
  // Find or create collection
  let collection = await findCollectionByName(params.collection);

  if (!collection) {
    collection = figma.variables.createVariableCollection(params.collection);
  }

  // Determine variable type
  let resolvedType: VariableResolvedDataType;
  switch (params.type) {
    case 'COLOR':
      resolvedType = 'COLOR';
      break;
    case 'NUMBER':
      resolvedType = 'FLOAT';
      break;
    case 'STRING':
      resolvedType = 'STRING';
      break;
    case 'BOOLEAN':
      resolvedType = 'BOOLEAN';
      break;
    default:
      resolvedType = 'STRING';
  }

  // Create variable
  const variable = figma.variables.createVariable(params.name, collection, resolvedType);

  // Set value for default mode
  const modeId = collection.modes[0].modeId;

  if (resolvedType === 'COLOR' && typeof params.value === 'string') {
    const color = parseColorValue(params.value);
    if (color) {
      variable.setValueForMode(modeId, color);
    }
  } else {
    variable.setValueForMode(modeId, params.value);
  }

  return {
    collection: params.collection,
    name: params.name,
    id: variable.id,
  };
}

export async function handleSyncTokens(params: SyncTokensParams): Promise<SyncTokensResult> {
  const result: SyncTokensResult = {
    collections: [],
  };

  if (params.from) {
    // Import tokens from JSON - this would be passed from CLI
    // In the plugin, we expect the token data to be included in params
    const tokenData = (params as unknown as { tokenData?: Record<string, unknown> }).tokenData;

    if (tokenData) {
      const imported = await importTokens(tokenData);
      result.imported = imported;
    }
  }

  if (params.to) {
    // Export tokens to be saved as JSON by CLI
    const exported = await exportTokens();
    result.exported = exported.count;
    result.collections = exported.collections;
    // The actual data would be sent back in the response
    (result as unknown as { tokenData: unknown }).tokenData = exported.data;
  }

  // List all collections if no import/export
  if (!params.from && !params.to) {
    const collections = await figma.variables.getLocalVariableCollectionsAsync();
    result.collections = collections.map(c => c.name);
  }

  return result;
}

// Helper functions

async function findVariableByPath(path: string): Promise<Variable | null> {
  const variables = await figma.variables.getLocalVariablesAsync();

  // Try exact match first
  let variable = variables.find(v => v.name === path);
  if (variable) return variable;

  // Try path with slashes converted
  const normalizedPath = path.replace(/\//g, '/');
  variable = variables.find(v => v.name === normalizedPath);
  if (variable) return variable;

  // Try partial match
  variable = variables.find(v => v.name.endsWith(path) || v.name.includes(path));

  return variable || null;
}

async function findCollectionByName(name: string): Promise<VariableCollection | null> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  return collections.find(c => c.name === name) || null;
}

function describeFills(fills: readonly Paint[]): string {
  const solidFill = fills.find((f): f is SolidPaint => f.type === 'SOLID');
  if (solidFill) {
    return rgbToHex(solidFill.color);
  }
  return 'none';
}

function rgbToHex(color: RGB): string {
  const r = Math.round(color.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(color.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(color.b * 255).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

function parseColorValue(value: string): RGBA | null {
  const hexMatch = value.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/);
  if (hexMatch) {
    const hex = hexMatch[1];
    return {
      r: parseInt(hex.slice(0, 2), 16) / 255,
      g: parseInt(hex.slice(2, 4), 16) / 255,
      b: parseInt(hex.slice(4, 6), 16) / 255,
      a: hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1,
    };
  }
  return null;
}

async function importTokens(data: Record<string, unknown>): Promise<number> {
  let count = 0;

  for (const [collectionName, tokens] of Object.entries(data)) {
    if (typeof tokens !== 'object' || tokens === null) continue;

    let collection = await findCollectionByName(collectionName);
    if (!collection) {
      collection = figma.variables.createVariableCollection(collectionName);
    }

    const modeId = collection.modes[0].modeId;

    for (const [tokenName, tokenDef] of Object.entries(tokens as Record<string, unknown>)) {
      if (typeof tokenDef !== 'object' || tokenDef === null) continue;

      const def = tokenDef as { $type?: string; $value?: unknown };
      if (!def.$type || def.$value === undefined) continue;

      let resolvedType: VariableResolvedDataType;
      switch (def.$type) {
        case 'color':
          resolvedType = 'COLOR';
          break;
        case 'dimension':
        case 'number':
          resolvedType = 'FLOAT';
          break;
        default:
          resolvedType = 'STRING';
      }

      try {
        const variable = figma.variables.createVariable(tokenName, collection, resolvedType);

        if (resolvedType === 'COLOR' && typeof def.$value === 'string') {
          const color = parseColorValue(def.$value);
          if (color) {
            variable.setValueForMode(modeId, color);
          }
        } else {
          variable.setValueForMode(modeId, def.$value as VariableValue);
        }

        count++;
      } catch {
        // Variable might already exist
      }
    }
  }

  return count;
}

async function exportTokens(): Promise<{ count: number; collections: string[]; data: Record<string, unknown> }> {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const data: Record<string, Record<string, unknown>> = {};
  let count = 0;

  for (const collection of collections) {
    data[collection.name] = {};
    const modeId = collection.modes[0].modeId;

    for (const variableId of collection.variableIds) {
      const variable = await figma.variables.getVariableByIdAsync(variableId);
      if (!variable) continue;

      const value = variable.valuesByMode[modeId];
      let $type: string;
      let $value: unknown;

      switch (variable.resolvedType) {
        case 'COLOR':
          $type = 'color';
          $value = value && typeof value === 'object' && 'r' in value ? rgbToHex(value as RGB) : null;
          break;
        case 'FLOAT':
          $type = 'number';
          $value = value;
          break;
        default:
          $type = 'string';
          $value = String(value);
      }

      data[collection.name][variable.name] = {
        $type,
        $value,
        $description: variable.description || undefined,
      };
      count++;
    }
  }

  return {
    count,
    collections: collections.map(c => c.name),
    data,
  };
}
