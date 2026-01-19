/**
 * Figma Plugin Main Entry Point
 * Runs in Figma's sandbox and handles operations via Plugin API
 */

import type { BridgeRequest, BridgeResponse, OperationType } from '@figma-pilot/shared';
import { handleCreate } from './handlers/create';
import { handleModify, handleDelete, handleAppend } from './handlers/modify';
import { handleComponent, handleCreateVariants, handleInstantiate, handleListComponents } from './handlers/component';
import { handleEnsureAccessibility, handleAuditA11y } from './handlers/accessibility';
import { handleBindToken, handleCreateToken, handleSyncTokens } from './handlers/tokens';
import { handleExport } from './handlers/export';
import { serializeNode, getTargetNode } from './utils/serialize';

const PLUGIN_VERSION = '0.1.0';

// Show the UI (visible for status display)
figma.showUI(__html__, {
  visible: true,
  width: 300,
  height: 150,
});

// Handle messages from UI (HTTP requests from CLI)
figma.ui.onmessage = async (msg: { type: string; request?: BridgeRequest }) => {
  if (msg.type === 'bridge-request' && msg.request) {
    const response = await handleRequest(msg.request);
    figma.ui.postMessage({ type: 'bridge-response', response });
  }
};

async function handleRequest(request: BridgeRequest): Promise<BridgeResponse> {
  const { id, operation, params } = request;

  try {
    const data = await executeOperation(operation, params);
    return { id, success: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { id, success: false, error: message };
  }
}

async function executeOperation(operation: OperationType, params: unknown): Promise<unknown> {
  switch (operation) {
    case 'status':
      return handleStatus();

    case 'selection':
      return handleSelection();

    case 'query':
      return handleQuery(params as { target: string });

    case 'create':
      return handleCreate(params as Parameters<typeof handleCreate>[0]);

    case 'modify':
      return handleModify(params as Parameters<typeof handleModify>[0]);

    case 'delete':
      return handleDelete(params as Parameters<typeof handleDelete>[0]);

    case 'append':
      return handleAppend(params as Parameters<typeof handleAppend>[0]);

    case 'list-components':
      return handleListComponents(params as Parameters<typeof handleListComponents>[0]);

    case 'to-component':
      return handleComponent(params as Parameters<typeof handleComponent>[0]);

    case 'create-variants':
      return handleCreateVariants(params as Parameters<typeof handleCreateVariants>[0]);

    case 'instantiate':
      return handleInstantiate(params as Parameters<typeof handleInstantiate>[0]);

    case 'ensure-accessibility':
      return handleEnsureAccessibility(params as Parameters<typeof handleEnsureAccessibility>[0]);

    case 'audit-a11y':
      return handleAuditA11y(params as Parameters<typeof handleAuditA11y>[0]);

    case 'bind-token':
      return handleBindToken(params as Parameters<typeof handleBindToken>[0]);

    case 'create-token':
      return handleCreateToken(params as Parameters<typeof handleCreateToken>[0]);

    case 'sync-tokens':
      return handleSyncTokens(params as Parameters<typeof handleSyncTokens>[0]);

    case 'export':
      return handleExport(params as Parameters<typeof handleExport>[0]);

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

// Built-in operation handlers

function handleStatus() {
  return {
    connected: true,
    pluginVersion: PLUGIN_VERSION,
    figmaVersion: figma.apiVersion,
    documentName: figma.root.name,
    currentPage: figma.currentPage.name,
  };
}

async function handleSelection() {
  const nodes = await Promise.all(figma.currentPage.selection.map(node => serializeNode(node)));
  return { nodes };
}

async function handleQuery(params: { target: string }) {
  const node = await getTargetNode(params.target);
  if (!node) {
    return { node: null };
  }
  return { node: await serializeNode(node, true) };
}

// Keep plugin running
figma.on('close', () => {
  // Cleanup if needed
});
