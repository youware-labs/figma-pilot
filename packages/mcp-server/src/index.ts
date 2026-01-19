#!/usr/bin/env node
/**
 * figma-pilot MCP Server
 *
 * Exposes figma-pilot CLI capabilities as MCP tools for AI agents.
 * Includes built-in bridge server for Figma plugin communication.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { BRIDGE_CONFIG, generateRequestId } from "@figma-pilot/shared";
import type {
  BridgeRequest,
  BridgeResponse,
  OperationType,
} from "@figma-pilot/shared";
import { createServer, IncomingMessage, ServerResponse } from "http";

// ============================================================================
// Bridge Server (embedded)
// ============================================================================

interface PendingRequest {
  resolve: (response: BridgeResponse) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

class EmbeddedBridgeServer {
  private server: ReturnType<typeof createServer> | null = null;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private requestQueue: BridgeRequest[] = [];
  private isRunning = false;

  async start(): Promise<void> {
    if (this.isRunning) return;

    return new Promise((resolve, reject) => {
      this.server = createServer((req, res) => this.handleRequest(req, res));

      this.server.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          // Port already in use - another bridge is running, which is fine
          console.error(`Bridge port ${BRIDGE_CONFIG.DEFAULT_PORT} already in use - connecting to existing bridge`);
          this.isRunning = false;
          resolve();
        } else {
          reject(err);
        }
      });

      this.server.listen(BRIDGE_CONFIG.DEFAULT_PORT, BRIDGE_CONFIG.DEFAULT_HOST, () => {
        this.isRunning = true;
        console.error(`Bridge server started on http://${BRIDGE_CONFIG.DEFAULT_HOST}:${BRIDGE_CONFIG.DEFAULT_PORT}`);
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
    this.isRunning = false;

    // Reject all pending requests
    for (const [, pending] of this.pendingRequests) {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Bridge stopped'));
    }
    this.pendingRequests.clear();
    this.requestQueue = [];
  }

  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const headers: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    };

    // Set CORS headers
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host}`);

    // Plugin polls for requests
    if (url.pathname === '/poll' && req.method === 'GET') {
      const requests = [...this.requestQueue];
      this.requestQueue = [];
      res.writeHead(200);
      res.end(JSON.stringify({ requests }));
      return;
    }

    // Plugin sends responses
    if (url.pathname === '/response' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const response = JSON.parse(body) as BridgeResponse;
          this.handleResponse(response);
          res.writeHead(200);
          res.end(JSON.stringify({ success: true }));
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid response' }));
        }
      });
      return;
    }

    // Health check
    if (url.pathname === '/health') {
      res.writeHead(200);
      res.end(JSON.stringify({
        status: 'ok',
        pendingRequests: this.pendingRequests.size,
        queuedRequests: this.requestQueue.length,
      }));
      return;
    }

    // External MCP server queues requests
    if (url.pathname === '/queue' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', async () => {
        try {
          const { operation, params, timeout } = JSON.parse(body) as {
            operation: OperationType;
            params: Record<string, unknown>;
            timeout?: number;
          };

          const request: BridgeRequest = {
            id: generateRequestId(),
            operation,
            params,
          };

          const timeoutMs = timeout || BRIDGE_CONFIG.TIMEOUT_MS;

          const result = await new Promise<BridgeResponse>((resolve, reject) => {
            const timeoutHandle = setTimeout(() => {
              this.pendingRequests.delete(request.id);
              reject(new Error(`Request timeout: ${operation}`));
            }, timeoutMs);

            this.pendingRequests.set(request.id, {
              resolve: (response) => resolve(response),
              reject,
              timeout: timeoutHandle,
            });

            this.requestQueue.push(request);
          });

          if (result.success) {
            res.writeHead(200);
            res.end(JSON.stringify({ success: true, data: result.data }));
          } else {
            res.writeHead(200);
            res.end(JSON.stringify({ success: false, error: result.error }));
          }
        } catch (error) {
          res.writeHead(500);
          res.end(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          }));
        }
      });
      return;
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  private handleResponse(response: BridgeResponse): void {
    const pending = this.pendingRequests.get(response.id);
    if (!pending) {
      console.error(`No pending request for response: ${response.id}`);
      return;
    }

    clearTimeout(pending.timeout);
    this.pendingRequests.delete(response.id);
    pending.resolve(response);
  }

  async sendRequest<T>(
    operation: OperationType,
    params: Record<string, unknown>
  ): Promise<T> {
    // If we're not running the bridge, try to connect to an external one
    if (!this.isRunning) {
      return this.sendToExternalBridge<T>(operation, params);
    }

    const request: BridgeRequest = {
      id: generateRequestId(),
      operation,
      params,
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(request.id);
        reject(new Error(`Request timeout: ${operation}`));
      }, BRIDGE_CONFIG.TIMEOUT_MS);

      this.pendingRequests.set(request.id, {
        resolve: (response) => {
          if (response.success) {
            resolve(response.data as T);
          } else {
            reject(new Error(response.error || 'Unknown error'));
          }
        },
        reject,
        timeout,
      });

      this.requestQueue.push(request);
    });
  }

  private async sendToExternalBridge<T>(
    operation: OperationType,
    params: Record<string, unknown>
  ): Promise<T> {
    const baseUrl = `http://${BRIDGE_CONFIG.DEFAULT_HOST}:${BRIDGE_CONFIG.DEFAULT_PORT}`;

    const response = await fetch(`${baseUrl}/queue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation,
        params,
        timeout: BRIDGE_CONFIG.TIMEOUT_MS,
      }),
    });

    if (!response.ok) {
      throw new Error(`Bridge request failed: ${response.statusText}`);
    }

    const result = await response.json() as { success: boolean; data?: T; error?: string };

    if (!result.success) {
      throw new Error(result.error || "Unknown error");
    }

    return result.data as T;
  }

  async checkHealth(): Promise<boolean> {
    if (this.isRunning) {
      return true;
    }

    // Check if external bridge is running
    try {
      const response = await fetch(
        `http://${BRIDGE_CONFIG.DEFAULT_HOST}:${BRIDGE_CONFIG.DEFAULT_PORT}/health`
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }
}

// ============================================================================
// Tool definitions
// ============================================================================

const TOOLS: Tool[] = [
  {
    name: "figma_status",
    description: "Check connection status to Figma plugin. Call this first to verify the plugin is running.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "figma_list_components",
    description: "List all available components in the Figma file. Use this to discover reusable components before creating instances.",
    inputSchema: {
      type: "object",
      properties: {
        filter: {
          type: "string",
          description: "Optional filter to search components by name (case-insensitive)",
        },
      },
      required: [],
    },
  },
  {
    name: "figma_create",
    description: "Create a new element in Figma. Supports frames, text, rectangles, ellipses, and semantic types like card, button, nav.",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["frame", "text", "rect", "ellipse", "line", "card", "button", "form", "nav", "input"],
          description: "Element type to create",
        },
        name: { type: "string", description: "Name for the element" },
        width: { type: "number", description: "Width in pixels" },
        height: { type: "number", description: "Height in pixels" },
        x: { type: "number", description: "X position" },
        y: { type: "number", description: "Y position" },
        parent: { type: "string", description: "Parent element (ID, 'selection', or 'name:ElementName')" },
        fill: { type: "string", description: "Fill color (hex, e.g., '#FF0000')" },
        stroke: { type: "string", description: "Stroke color (hex)" },
        strokeWidth: { type: "number", description: "Stroke width" },
        cornerRadius: { type: "number", description: "Corner radius" },
        content: { type: "string", description: "Text content (for text elements)" },
        fontSize: { type: "number", description: "Font size (for text elements)" },
        fontWeight: { type: "number", description: "Font weight (for text elements)" },
        textColor: { type: "string", description: "Text color (hex). For text elements, preferred over 'fill' for clarity." },
        layout: {
          type: "object",
          description: "Auto-layout configuration",
          properties: {
            direction: { type: "string", enum: ["row", "column"] },
            gap: { type: "number" },
            padding: { type: "number" },
            alignItems: { type: "string", enum: ["start", "center", "end", "baseline"] },
            justifyContent: { type: "string", enum: ["start", "center", "end", "space-between"] },
          },
        },
        children: {
          type: "array",
          description: "Nested child elements to create",
          items: { type: "object" },
        },
      },
      required: ["type"],
    },
  },
  {
    name: "figma_modify",
    description: "Modify existing elements in Figma. Target by ID, name, or selection.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Element to modify (ID, 'selection', or 'name:ElementName')" },
        name: { type: "string", description: "New name" },
        width: { type: "number", description: "New width" },
        height: { type: "number", description: "New height" },
        x: { type: "number", description: "New X position" },
        y: { type: "number", description: "New Y position" },
        fill: { type: "string", description: "New fill color (hex)" },
        stroke: { type: "string", description: "New stroke color (hex)" },
        cornerRadius: { type: "number", description: "New corner radius" },
        opacity: { type: "number", description: "Opacity (0-1)" },
        visible: { type: "boolean", description: "Visibility" },
        content: { type: "string", description: "New text content" },
        fontSize: { type: "number", description: "New font size" },
        layout: { type: "object", description: "Layout updates" },
      },
      required: ["target"],
    },
  },
  {
    name: "figma_delete",
    description: "Delete elements from Figma.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Element to delete (ID, 'selection', or 'name:ElementName')" },
      },
      required: ["target"],
    },
  },
  {
    name: "figma_append",
    description: "Move element(s) into a container frame.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Element to move (ID, 'selection', or 'name:ElementName')" },
        parent: { type: "string", description: "Container to move into (ID, 'selection', or 'name:ContainerName')" },
      },
      required: ["target", "parent"],
    },
  },
  {
    name: "figma_instantiate",
    description: "Create an instance of a component. Use list_components first to discover available components.",
    inputSchema: {
      type: "object",
      properties: {
        component: { type: "string", description: "Component ID or 'name:ComponentName'" },
        x: { type: "number", description: "X position" },
        y: { type: "number", description: "Y position" },
        parent: { type: "string", description: "Parent element to add instance to" },
      },
      required: ["component"],
    },
  },
  {
    name: "figma_selection",
    description: "Get information about the current selection in Figma.",
    inputSchema: { type: "object", properties: {}, required: [] },
  },
  {
    name: "figma_query",
    description: "Get detailed information about a specific element.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Element to query (ID, 'selection', or 'name:ElementName')" },
      },
      required: ["target"],
    },
  },
  {
    name: "figma_to_component",
    description: "Convert an element to a reusable component.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Element to convert (ID, 'selection', or 'name:ElementName')" },
        name: { type: "string", description: "Component name (e.g., 'Button/Primary')" },
      },
      required: ["target"],
    },
  },
  {
    name: "figma_create_variants",
    description: "Create component variants with different property values.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Component to create variants from" },
        property: { type: "string", description: "Variant property name (e.g., 'state', 'size')" },
        values: { type: "array", items: { type: "string" }, description: "Variant values (e.g., ['default', 'hover', 'pressed'])" },
      },
      required: ["target", "property", "values"],
    },
  },
  {
    name: "figma_ensure_accessibility",
    description: "Check and optionally fix accessibility issues.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Element to check (ID, 'selection', 'page', or 'name:ElementName')" },
        level: { type: "string", enum: ["AA", "AAA"], description: "WCAG conformance level" },
        autoFix: { type: "boolean", description: "Automatically fix issues" },
      },
      required: ["target", "level"],
    },
  },
  {
    name: "figma_export",
    description: "Export elements as images (PNG, SVG, PDF). Use after finishing a request to review a PNG.",
    inputSchema: {
      type: "object",
      properties: {
        target: { type: "string", description: "Element to export" },
        format: { type: "string", enum: ["png", "svg", "pdf", "jpg"], description: "Export format" },
        scale: { type: "number", description: "Scale factor (default: 1)" },
      },
      required: ["target", "format"],
    },
  },
];

// Tool name to operation mapping
const TOOL_OPERATION_MAP: Record<string, OperationType> = {
  figma_status: "status",
  figma_list_components: "list-components",
  figma_create: "create",
  figma_modify: "modify",
  figma_delete: "delete",
  figma_append: "append",
  figma_instantiate: "instantiate",
  figma_selection: "selection",
  figma_query: "query",
  figma_to_component: "to-component",
  figma_create_variants: "create-variants",
  figma_ensure_accessibility: "ensure-accessibility",
  figma_export: "export",
};

// ============================================================================
// Main
// ============================================================================

async function main() {
  // Start embedded bridge server
  const bridge = new EmbeddedBridgeServer();
  await bridge.start();

  const server = new Server(
    { name: "figma-pilot", version: "0.1.0" },
    { capabilities: { tools: {} } }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Check if bridge/plugin is available
    const isHealthy = await bridge.checkHealth();
    if (!isHealthy) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: "Figma plugin not connected. Please open Figma Desktop and run the figma-pilot plugin.",
          }),
        }],
        isError: true,
      };
    }

    const operation = TOOL_OPERATION_MAP[name];
    if (!operation) {
      return {
        content: [{ type: "text", text: JSON.stringify({ error: `Unknown tool: ${name}` }) }],
        isError: true,
      };
    }

    try {
      let params = args || {};
      if (name === "figma_export_png") {
        params = { ...params, format: "png" };
      }
      const result = await bridge.sendRequest(operation, params as Record<string, unknown>);

      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
        }],
        isError: true,
      };
    }
  });

  // Cleanup on exit
  process.on('SIGINT', async () => {
    await bridge.stop();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await bridge.stop();
    process.exit(0);
  });

  // Start the MCP server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("figma-pilot MCP server running (bridge included)");
}

main().catch(console.error);
