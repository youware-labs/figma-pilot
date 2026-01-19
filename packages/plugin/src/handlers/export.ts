/**
 * Export operation handler
 */

import type { ExportParams, ExportResult } from '@figma-pilot/shared';
import { getTargetNode } from '../utils/serialize';

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

  // Export the node
  const bytes = await node.exportAsync(exportSettings);

  // Convert to base64
  const base64 = bytesToBase64(bytes);

  return {
    nodeId: node.id,
    format: params.format,
    data: base64,
    size: bytes.length,
  };
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
