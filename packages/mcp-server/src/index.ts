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
  type Tool,
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
  private lastPollAt: number | null = null;
  private lastResponseAt: number | null = null;
  private lastRequestAt: number | null = null;

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
      this.lastPollAt = Date.now();
      const requests = [...this.requestQueue];
      this.requestQueue = [];
      res.writeHead(200);
      res.end(JSON.stringify({ requests }));
      return;
    }

    // Plugin sends responses
    if (url.pathname === '/response' && req.method === 'POST') {
      this.readJsonBody<BridgeResponse>(req, res).then((response) => {
        if (!response) return;
        this.lastResponseAt = Date.now();
        this.handleResponse(response);
        res.writeHead(200);
        res.end(JSON.stringify({ success: true }));
      });
      return;
    }

    // Health check
    if (url.pathname === '/health') {
      const health = this.getHealthSummary();
      res.writeHead(200);
      res.end(JSON.stringify(health));
      return;
    }

    // External MCP server queues requests
    if (url.pathname === '/queue' && req.method === 'POST') {
      this.readJsonBody<{
        operation: OperationType;
        params: Record<string, unknown>;
        timeout?: number;
      }>(req, res).then(async (body) => {
        if (!body) return;

        if (this.requestQueue.length >= BRIDGE_CONFIG.MAX_QUEUE) {
          res.writeHead(429);
          res.end(JSON.stringify({ success: false, error: 'Bridge queue is full' }));
          return;
        }
        if (this.pendingRequests.size >= BRIDGE_CONFIG.MAX_PENDING) {
          res.writeHead(429);
          res.end(JSON.stringify({ success: false, error: 'Too many pending requests' }));
          return;
        }

        this.lastRequestAt = Date.now();

        try {
          const { operation, params, timeout } = body;
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
      return this.getHealthSummary().pluginConnected;
    }

    // Check if external bridge is running
    try {
      const response = await fetch(
        `http://${BRIDGE_CONFIG.DEFAULT_HOST}:${BRIDGE_CONFIG.DEFAULT_PORT}/health`
      );
      if (!response.ok) return false;
      const health = await response.json() as { pluginConnected?: boolean };
      return Boolean(health.pluginConnected);
    } catch {
      return false;
    }
  }

  getIsRunning(): boolean {
    return this.isRunning;
  }

  private getHealthSummary() {
    const now = Date.now();
    const pluginConnected = this.lastPollAt !== null
      ? (now - this.lastPollAt) <= BRIDGE_CONFIG.HEALTH_TTL_MS
      : false;

    return {
      status: 'ok',
      pluginConnected,
      pendingRequests: this.pendingRequests.size,
      queuedRequests: this.requestQueue.length,
      lastPollAt: this.lastPollAt,
      lastResponseAt: this.lastResponseAt,
      lastRequestAt: this.lastRequestAt,
    };
  }

  private async readJsonBody<T>(
    req: IncomingMessage,
    res: ServerResponse
  ): Promise<T | null> {
    return new Promise((resolve) => {
      let body = '';
      let size = 0;
      const maxBytes = BRIDGE_CONFIG.MAX_BODY_BYTES;

      req.on('data', (chunk) => {
        size += chunk.length;
        if (size > maxBytes) {
          res.writeHead(413);
          res.end(JSON.stringify({ error: 'Payload too large' }));
          req.destroy();
          resolve(null);
          return;
        }
        body += chunk;
      });

      req.on('end', () => {
        try {
          const parsed = JSON.parse(body) as T;
          resolve(parsed);
        } catch {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'Invalid JSON body' }));
          resolve(null);
        }
      });

      req.on('error', () => {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid request body' }));
        resolve(null);
      });
    });
  }
}

// ============================================================================
// Tool definitions (Code Execution Mode - minimal footprint)
// ============================================================================

// API documentation for code execution
const API_DOCS = `
# Figma Pilot API

All functions are async and available on the \`figma\` object.

## Target Specifiers
Used in target, parent parameters:
- "selection" - currently selected element(s)
- "name:ElementName" - find by name (recommended)
- "123:456" - node ID
- "page" - entire page (for accessibility checks)

## figma.create()

Create elements in Figma.

### Basic Parameters
| Param | Type | Description |
|-------|------|-------------|
| type | string | REQUIRED: frame, text, rect, ellipse, line, card, button, form, nav, input |
| name | string | Element name |
| width | number | Width in pixels |
| height | number | Height in pixels |
| x | number | X position |
| y | number | Y position |
| parent | string | Parent container (ID, 'selection', or 'name:ElementName') |

### Fill & Stroke
| Param | Type | Description |
|-------|------|-------------|
| fill | string | Hex color: '#FF0000' (NOT an object!) |
| stroke | string | Stroke color hex |
| strokeWidth | number | Stroke width |
| strokeAlign | string | 'INSIDE', 'OUTSIDE', 'CENTER' |
| dashPattern | number[] | e.g., [5, 5] for dashed |
| strokeCap | string | 'NONE', 'ROUND', 'SQUARE', 'ARROW_EQUILATERAL' |

### Corner Radius
| Param | Type | Description |
|-------|------|-------------|
| cornerRadius | number | Uniform radius |
| topLeftRadius | number | Individual corners |
| topRightRadius | number | |
| bottomLeftRadius | number | |
| bottomRightRadius | number | |

### Text (for type: 'text')
| Param | Type | Description |
|-------|------|-------------|
| content | string | Text content |
| fontSize | number | Font size |
| fontWeight | number | 100-900 (400=Regular, 700=Bold) |
| fontFamily | string | 'Inter', 'Roboto', etc. |
| textColor | string | Text color hex (preferred over fill) |
| textAlign | string | 'LEFT', 'CENTER', 'RIGHT', 'JUSTIFIED' |
| maxWidth | number | Max width for text wrapping |
| lineHeight | number | Line height in pixels |
| letterSpacing | number | Letter spacing |

### Layout (Auto-layout)
| Param | Type | Description |
|-------|------|-------------|
| layout | object | See layout object below |
| layoutSizingHorizontal | string | 'FIXED', 'HUG', 'FILL' |
| layoutSizingVertical | string | 'FIXED', 'HUG', 'FILL' |

Layout object:
\`\`\`javascript
layout: {
  direction: 'row' | 'column',
  gap: number,
  padding: number | { top, right, bottom, left },
  alignItems: 'start' | 'center' | 'end' | 'baseline',
  justifyContent: 'start' | 'center' | 'end' | 'space-between',
  wrap: boolean
}
\`\`\`

### Gradient (replaces fill)
\`\`\`javascript
gradient: {
  type: 'LINEAR' | 'RADIAL' | 'ANGULAR' | 'DIAMOND',
  angle: number,  // degrees, for LINEAR
  stops: [
    { position: 0, color: '#FF0000' },
    { position: 1, color: '#0000FF' }
  ]
}
\`\`\`

### Effects (shadows, blur)
\`\`\`javascript
effects: [
  {
    type: 'DROP_SHADOW' | 'INNER_SHADOW' | 'LAYER_BLUR' | 'BACKGROUND_BLUR',
    color: '#00000040',  // hex with alpha
    offset: { x: 0, y: 4 },
    radius: 12,
    spread: 0
  }
]
\`\`\`

### Transform
| Param | Type | Description |
|-------|------|-------------|
| rotation | number | Degrees |
| blendMode | string | 'NORMAL', 'MULTIPLY', 'SCREEN', 'OVERLAY', etc. |
| opacity | number | 0-1 |

### Children (nested elements)
\`\`\`javascript
children: [
  { type: 'text', content: 'Hello', fontSize: 16 },
  { type: 'rect', width: 50, height: 50, fill: '#FF0000' }
]
\`\`\`

### Example
\`\`\`javascript
await figma.create({
  type: 'card',
  name: 'User Card',
  width: 320,
  fill: '#FFFFFF',
  cornerRadius: 12,
  layout: { direction: 'column', gap: 16, padding: 24 },
  effects: [{ type: 'DROP_SHADOW', color: '#00000020', offset: {x:0,y:4}, radius: 16 }],
  children: [
    { type: 'text', content: 'John Doe', fontSize: 20, fontWeight: 600 },
    { type: 'text', content: 'john@example.com', fontSize: 14, textColor: '#666666' }
  ]
});
\`\`\`

## figma.modify()

Modify existing elements.

\`\`\`javascript
await figma.modify({
  target: 'selection',  // or 'name:ElementName' or nodeId
  fill: '#FF0000',
  width: 200,
  cornerRadius: 8,
  opacity: 0.8
});
\`\`\`

Supports: name, width, height, x, y, fill, stroke, strokeWidth, cornerRadius, opacity, visible, locked, content, fontSize, fontFamily, fontWeight, textColor, layout

## figma.query()

Get element info.
\`\`\`javascript
const { nodes } = await figma.query({ target: 'selection' });
for (const node of nodes) {
  console.log(node.name, node.type, node.width, node.height);
}
\`\`\`

## figma.delete()
\`\`\`javascript
await figma.delete({ target: 'name:OldElement' });
\`\`\`

## figma.append()
Move element into container.
\`\`\`javascript
await figma.append({ target: 'selection', parent: 'name:Container' });
\`\`\`

## Components

\`\`\`javascript
// List components
const { components } = await figma.listComponents({ filter: 'Button' });

// Create instance
await figma.instantiate({ component: 'name:Button/Primary', x: 100, y: 100 });

// Convert to component
await figma.toComponent({ target: 'selection', name: 'Card/Default' });

// Create variants
await figma.createVariants({ target: 'selection', property: 'state', values: ['default', 'hover'] });
\`\`\`

## Accessibility
\`\`\`javascript
const result = await figma.accessibility({ target: 'page', level: 'AA', autoFix: true });
console.log(\`Fixed \${result.fixedCount} of \${result.totalIssues} issues\`);
\`\`\`

## Design Tokens
\`\`\`javascript
await figma.createToken({ collection: 'colors', name: 'primary', type: 'COLOR', value: '#0066FF' });
await figma.bindToken({ target: 'selection', property: 'fill', token: 'colors/primary' });
\`\`\`

## Export
\`\`\`javascript
await figma.export({ target: 'selection', format: 'png', scale: 2 });
\`\`\`

## Tips
- fill is a HEX STRING like '#FF0000', NOT an object
- Use gradient object for gradient fills (not fill)
- Use textColor for text instead of fill
- Use children for nested elements
- Name elements for easy targeting later

## More Documentation
For advanced patterns, detailed examples, and edge cases, read the figma-pilot skill:
- Look for "figma-pilot" in your available skills list
- Read SKILL.md for overview
- Read rules/*.md for detailed API docs (create.md, modify.md, layout.md, gradients.md, effects.md, fonts.md, components.md)
`;

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
    name: "figma_execute",
    description: `Execute JavaScript code with Figma Pilot APIs.

IMPORTANT: Before writing complex code, call figma_get_api_docs first to get correct parameter syntax!

Key API syntax (call figma_get_api_docs for full details):
- figma.create({ type, name?, width?, height?, x?, y?, fill?, layout?, children?, gradient?, effects? })
  - type: 'frame'|'text'|'rect'|'ellipse'|'line'|'card'|'button'|'nav'|'input'
  - fill: hex string like '#FF0000' (NOT an object)
  - gradient: { type: 'LINEAR'|'RADIAL', angle?, stops: [{position, color}] }
  - layout: { direction: 'row'|'column', gap?, padding?, alignItems?, justifyContent? }
  - effects: [{ type: 'DROP_SHADOW', color, offset: {x,y}, radius, spread? }]
- figma.modify({ target, fill?, width?, height?, ... })
- figma.query({ target }) → { node, nodes[] }
- figma.delete({ target })
- figma.export({ target, format: 'png'|'svg'|'pdf', scale? })

Target formats: 'selection', 'name:ElementName', or node ID like '123:456'

Example:
\`\`\`javascript
// Create a card with shadow
await figma.create({
  type: 'card',
  name: 'My Card',
  fill: '#FFFFFF',
  effects: [{ type: 'DROP_SHADOW', color: '#00000040', offset: {x:0,y:4}, radius: 12 }],
  children: [
    { type: 'text', content: 'Hello', fontSize: 24 }
  ]
});
\`\`\`

For advanced patterns, READ the figma-pilot skill files (look for "figma-pilot" in your skills, then read rules/*.md)`,
    inputSchema: {
      type: "object",
      properties: {
        code: {
          type: "string",
          description: "JavaScript code to execute. Use async/await for API calls. Use console.log() for output.",
        },
      },
      required: ["code"],
    },
  },
  {
    name: "figma_get_api_docs",
    description: `Get detailed API documentation for figma_execute. ALWAYS call this BEFORE writing complex figma_execute code to ensure correct syntax!

The docs reference the figma-pilot skill for advanced patterns. Look for "figma-pilot" in your available skills and READ rules/*.md for detailed examples and edge cases.`,
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
];

// Operation name mapping for the figma object
const OPERATION_MAP: Record<string, OperationType> = {
  status: "status",
  query: "query",
  create: "create",
  modify: "modify",
  delete: "delete",
  append: "append",
  listComponents: "list-components",
  instantiate: "instantiate",
  toComponent: "to-component",
  createVariants: "create-variants",
  accessibility: "accessibility",
  createToken: "create-token",
  bindToken: "bind-token",
  syncTokens: "sync-tokens",
  export: "export",
};

// ============================================================================
// Code Execution Engine
// ============================================================================

interface ExecutionResult {
  result?: unknown;
  logs: string[];
  error?: string;
}

async function executeCode(
  code: string,
  bridge: EmbeddedBridgeServer
): Promise<ExecutionResult> {
  const logs: string[] = [];

  // Create the figma API object
  const figma: Record<string, (params?: Record<string, unknown>) => Promise<unknown>> = {};

  for (const [methodName, operationType] of Object.entries(OPERATION_MAP)) {
    figma[methodName] = async (params: Record<string, unknown> = {}) => {
      return bridge.sendRequest(operationType, params);
    };
  }

  // Create a mock console that captures logs
  const mockConsole = {
    log: (...args: unknown[]) => {
      logs.push(args.map(a => 
        typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
      ).join(' '));
    },
    error: (...args: unknown[]) => {
      logs.push('[ERROR] ' + args.map(a => 
        typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
      ).join(' '));
    },
    warn: (...args: unknown[]) => {
      logs.push('[WARN] ' + args.map(a => 
        typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
      ).join(' '));
    },
  };

  try {
    // Create async function from code
    const AsyncFunction = Object.getPrototypeOf(async () => {}).constructor;
    const fn = new AsyncFunction('figma', 'console', code);

    // Execute with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Execution timeout (30s)')), 30000);
    });

    const result = await Promise.race([
      fn(figma, mockConsole),
      timeoutPromise,
    ]);

    return { result, logs };
  } catch (error) {
    return {
      logs,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

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

    // figma_get_api_docs doesn't require connection
    if (name === "figma_get_api_docs") {
      return {
        content: [{ type: "text", text: API_DOCS }],
      };
    }

    // Check if bridge/plugin is available for other tools
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

    // Handle figma_status
    if (name === "figma_status") {
      try {
        const result = await bridge.sendRequest("status", {});
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
    }

    // Handle figma_execute
    if (name === "figma_execute") {
      const { code } = args as { code: string };

      if (!code || typeof code !== "string") {
        return {
          content: [{ type: "text", text: JSON.stringify({ error: "Code is required" }) }],
          isError: true,
        };
      }

      const result = await executeCode(code, bridge);

      if (result.error) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: result.error,
              logs: result.logs,
            }, null, 2),
          }],
          isError: true,
        };
      }

      // Format output
      const output: Record<string, unknown> = {};
      if (result.logs.length > 0) {
        output.logs = result.logs;
      }
      if (result.result !== undefined) {
        output.result = result.result;
      }

      return {
        content: [{
          type: "text",
          text: Object.keys(output).length > 0
            ? JSON.stringify(output, null, 2)
            : "Executed successfully (no output)",
        }],
      };
    }

    // Unknown tool
    return {
      content: [{ type: "text", text: JSON.stringify({ error: `Unknown tool: ${name}` }) }],
      isError: true,
    };
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

  console.error("figma-pilot MCP server running (code execution mode)");
}

main().catch(console.error);
