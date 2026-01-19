/**
 * Export operation handler
 */

import type { ExportParams, ExportResult } from '@figma-pilot/shared';
import { getTargetNode } from '../utils/serialize';

// Base64 encoding without btoa (not available in Figma plugin sandbox)
const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let result = '';
  const len = bytes.length;

  for (let i = 0; i < len; i += 3) {
    const byte1 = bytes[i];
    const byte2 = i + 1 < len ? bytes[i + 1] : 0;
    const byte3 = i + 2 < len ? bytes[i + 2] : 0;

    const triplet = (byte1 << 16) | (byte2 << 8) | byte3;

    result += BASE64_CHARS[(triplet >> 18) & 0x3F];
    result += BASE64_CHARS[(triplet >> 12) & 0x3F];
    result += i + 1 < len ? BASE64_CHARS[(triplet >> 6) & 0x3F] : '=';
    result += i + 2 < len ? BASE64_CHARS[triplet & 0x3F] : '=';
  }

  return result;
}

export async function handleExport(params: ExportParams): Promise<ExportResult> {
  const node = await getTargetNode(params.target);
  if (!node) {
    throw new Error(`Node not found: ${params.target}`);
  }

  // Determine export settings
  const format = params.format.toUpperCase() as 'PNG' | 'JPG' | 'SVG' | 'PDF';
  const scale = params.scale ?? 1;

  const exportSettings: ExportSettings = {
    format,
    ...(format !== 'SVG' && format !== 'PDF' ? { constraint: { type: 'SCALE', value: scale } } : {}),
  };

  // Export the node - all SceneNodes should support exportAsync
  let bytes: Uint8Array;
  try {
    bytes = await (node as any).exportAsync(exportSettings);
  } catch (err) {
    throw new Error(`Failed to export node ${node.id} (${node.type}): ${err instanceof Error ? err.message : String(err)}`);
  }

  // Convert to base64 using custom implementation
  const base64 = uint8ArrayToBase64(bytes);

  return {
    nodeId: node.id,
    format: params.format,
    data: base64,
    size: bytes.length,
  };
}
