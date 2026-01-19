#!/usr/bin/env node
/**
 * figma-pilot MCP Server
 *
 * Exposes figma-pilot CLI capabilities as MCP tools for AI agents.
 * Connects to the Figma plugin via the same HTTP bridge as the CLI.
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

// Tool definitions
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
        name: {
          type: "string",
          description: "Name for the element",
        },
        width: {
          type: "number",
          description: "Width in pixels",
        },
        height: {
          type: "number",
          description: "Height in pixels",
        },
        x: {
          type: "number",
          description: "X position",
        },
        y: {
          type: "number",
          description: "Y position",
        },
        parent: {
          type: "string",
          description: "Parent element (ID, 'selection', or 'name:ElementName')",
        },
        fill: {
          type: "string",
          description: "Fill color (hex, e.g., '#FF0000')",
        },
        stroke: {
          type: "string",
          description: "Stroke color (hex)",
        },
        strokeWidth: {
          type: "number",
          description: "Stroke width",
        },
        cornerRadius: {
          type: "number",
          description: "Corner radius",
        },
        content: {
          type: "string",
          description: "Text content (for text elements)",
        },
        fontSize: {
          type: "number",
          description: "Font size (for text elements)",
        },
        fontWeight: {
          type: "number",
          description: "Font weight (for text elements)",
        },
        textColor: {
          type: "string",
          description: "Text color (hex). For text elements, preferred over 'fill' for clarity.",
        },
        textAutoResize: {
          type: "string",
          enum: ["WIDTH_AND_HEIGHT", "HEIGHT", "TRUNCATE", "NONE"],
          description: "Text auto-resize mode. 'HEIGHT' enables text wrapping within maxWidth.",
        },
        maxWidth: {
          type: "number",
          description: "Maximum width for text wrapping. Automatically sets textAutoResize to HEIGHT.",
        },
        lineHeight: {
          type: "number",
          description: "Line height in pixels (for text elements)",
        },
        letterSpacing: {
          type: "number",
          description: "Letter spacing in pixels (for text elements)",
        },
        textDecoration: {
          type: "string",
          enum: ["NONE", "UNDERLINE", "STRIKETHROUGH"],
          description: "Text decoration (for text elements)",
        },
        textCase: {
          type: "string",
          enum: ["ORIGINAL", "UPPER", "LOWER", "TITLE"],
          description: "Text case transformation (for text elements)",
        },
        topLeftRadius: {
          type: "number",
          description: "Top-left corner radius (overrides cornerRadius)",
        },
        topRightRadius: {
          type: "number",
          description: "Top-right corner radius (overrides cornerRadius)",
        },
        bottomLeftRadius: {
          type: "number",
          description: "Bottom-left corner radius (overrides cornerRadius)",
        },
        bottomRightRadius: {
          type: "number",
          description: "Bottom-right corner radius (overrides cornerRadius)",
        },
        strokeAlign: {
          type: "string",
          enum: ["INSIDE", "OUTSIDE", "CENTER"],
          description: "Stroke alignment relative to the shape boundary",
        },
        strokeCap: {
          type: "string",
          enum: ["NONE", "ROUND", "SQUARE", "ARROW_LINES", "ARROW_EQUILATERAL"],
          description: "Stroke cap style (for lines)",
        },
        dashPattern: {
          type: "array",
          items: { type: "number" },
          description: "Dash pattern for strokes, e.g., [5, 5] for dashed line",
        },
        effects: {
          type: "array",
          description: "Visual effects (shadows, blur)",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["DROP_SHADOW", "INNER_SHADOW", "LAYER_BLUR", "BACKGROUND_BLUR"] },
              color: { type: "string", description: "Color with alpha, e.g., '#00000040'" },
              offset: { type: "object", properties: { x: { type: "number" }, y: { type: "number" } } },
              radius: { type: "number", description: "Blur radius" },
              spread: { type: "number", description: "Shadow spread (for shadows only)" },
            },
            required: ["type", "radius"],
          },
        },
        gradient: {
          type: "object",
          description: "Gradient fill (overrides solid fill)",
          properties: {
            type: { type: "string", enum: ["LINEAR", "RADIAL", "ANGULAR", "DIAMOND"] },
            angle: { type: "number", description: "Angle in degrees for linear gradient (0=left-to-right, 90=top-to-bottom)" },
            stops: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  position: { type: "number", description: "Position from 0 to 1" },
                  color: { type: "string", description: "Hex color" },
                },
                required: ["position", "color"],
              },
            },
          },
          required: ["type", "stops"],
        },
        rotation: {
          type: "number",
          description: "Rotation angle in degrees",
        },
        blendMode: {
          type: "string",
          enum: ["PASS_THROUGH", "NORMAL", "DARKEN", "MULTIPLY", "LINEAR_BURN", "COLOR_BURN", "LIGHTEN", "SCREEN", "LINEAR_DODGE", "COLOR_DODGE", "OVERLAY", "SOFT_LIGHT", "HARD_LIGHT", "DIFFERENCE", "EXCLUSION", "HUE", "SATURATION", "COLOR", "LUMINOSITY"],
          description: "Blend mode for layer compositing",
        },
        clipsContent: {
          type: "boolean",
          description: "Whether the frame clips its children (for frames)",
        },
        constraints: {
          type: "object",
          description: "Responsive constraints",
          properties: {
            horizontal: { type: "string", enum: ["MIN", "CENTER", "MAX", "STRETCH", "SCALE"] },
            vertical: { type: "string", enum: ["MIN", "CENTER", "MAX", "STRETCH", "SCALE"] },
          },
        },
        layoutPositioning: {
          type: "string",
          enum: ["AUTO", "ABSOLUTE"],
          description: "Positioning within auto-layout parent. ABSOLUTE removes from flow.",
        },
        minWidth: {
          type: "number",
          description: "Minimum width constraint",
        },
        maxHeight: {
          type: "number",
          description: "Maximum height constraint",
        },
        minHeight: {
          type: "number",
          description: "Minimum height constraint",
        },
        layoutSizingHorizontal: {
          type: "string",
          enum: ["FIXED", "HUG", "FILL"],
          description: "Horizontal sizing mode when inside auto-layout. FILL stretches to parent, HUG wraps content.",
        },
        layoutSizingVertical: {
          type: "string",
          enum: ["FIXED", "HUG", "FILL"],
          description: "Vertical sizing mode when inside auto-layout. FILL stretches to parent, HUG wraps content.",
        },
        layout: {
          type: "object",
          description: "Auto-layout configuration",
          properties: {
            direction: { type: "string", enum: ["row", "column"] },
            gap: { type: "number" },
            padding: { type: "number" },
            alignItems: {
              type: "string",
              enum: ["start", "center", "end", "baseline"],
              description: "Cross-axis alignment. For stretch behavior, use layoutSizingVertical/Horizontal: FILL on children."
            },
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
        target: {
          type: "string",
          description: "Element to modify (ID, 'selection', or 'name:ElementName')",
        },
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
        target: {
          type: "string",
          description: "Element to delete (ID, 'selection', or 'name:ElementName')",
        },
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
        target: {
          type: "string",
          description: "Element to move (ID, 'selection', or 'name:ElementName')",
        },
        parent: {
          type: "string",
          description: "Container to move into (ID, 'selection', or 'name:ContainerName')",
        },
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
        component: {
          type: "string",
          description: "Component ID or 'name:ComponentName'",
        },
        x: { type: "number", description: "X position" },
        y: { type: "number", description: "Y position" },
        parent: {
          type: "string",
          description: "Parent element to add instance to",
        },
      },
      required: ["component"],
    },
  },
  {
    name: "figma_selection",
    description: "Get information about the current selection in Figma.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "figma_query",
    description: "Get detailed information about a specific element.",
    inputSchema: {
      type: "object",
      properties: {
        target: {
          type: "string",
          description: "Element to query (ID, 'selection', or 'name:ElementName')",
        },
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
        target: {
          type: "string",
          description: "Element to convert (ID, 'selection', or 'name:ElementName')",
        },
        name: {
          type: "string",
          description: "Component name (e.g., 'Button/Primary')",
        },
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
        target: {
          type: "string",
          description: "Component to create variants from",
        },
        property: {
          type: "string",
          description: "Variant property name (e.g., 'state', 'size')",
        },
        values: {
          type: "array",
          items: { type: "string" },
          description: "Variant values (e.g., ['default', 'hover', 'pressed'])",
        },
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
        target: {
          type: "string",
          description: "Element to check (ID, 'selection', 'page', or 'name:ElementName')",
        },
        level: {
          type: "string",
          enum: ["AA", "AAA"],
          description: "WCAG conformance level",
        },
        autoFix: {
          type: "boolean",
          description: "Automatically fix issues",
        },
      },
      required: ["target", "level"],
    },
  },
  {
    name: "figma_export",
    description: "Export elements as images (PNG, SVG, PDF).",
    inputSchema: {
      type: "object",
      properties: {
        target: {
          type: "string",
          description: "Element to export",
        },
        format: {
          type: "string",
          enum: ["png", "svg", "pdf", "jpg"],
          description: "Export format",
        },
        scale: {
          type: "number",
          description: "Scale factor (default: 1)",
        },
      },
      required: ["target", "format"],
    },
  },
];

// Bridge client for communicating with Figma plugin
class MCPBridgeClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `http://${BRIDGE_CONFIG.DEFAULT_HOST}:${BRIDGE_CONFIG.DEFAULT_PORT}`;
  }

  async sendRequest<T>(operation: OperationType, params: Record<string, unknown>): Promise<T> {
    const request: BridgeRequest = {
      id: generateRequestId(),
      operation,
      params,
    };

    // Queue the request
    const queueResponse = await fetch(`${this.baseUrl}/queue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        operation,
        params,
        timeout: BRIDGE_CONFIG.TIMEOUT_MS,
      }),
    });

    if (!queueResponse.ok) {
      throw new Error(`Bridge request failed: ${queueResponse.statusText}`);
    }

    const result = await queueResponse.json() as { success: boolean; data?: T; error?: string };

    if (!result.success) {
      throw new Error(result.error || "Unknown error");
    }

    return result.data as T;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

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

// Create and run the MCP server
async function main() {
  const bridgeClient = new MCPBridgeClient();

  const server = new Server(
    {
      name: "figma-pilot",
      version: "0.1.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // List available tools
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: TOOLS,
  }));

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Check if bridge server is running
    const isHealthy = await bridgeClient.checkHealth();
    if (!isHealthy) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: "Figma bridge server not running. Please run 'figma-pilot serve' first and ensure the Figma plugin is active.",
            }),
          },
        ],
        isError: true,
      };
    }

    const operation = TOOL_OPERATION_MAP[name];
    if (!operation) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: `Unknown tool: ${name}` }),
          },
        ],
        isError: true,
      };
    }

    try {
      // Transform args for specific operations
      let params = args || {};

      // Handle create-variants values array
      if (operation === "create-variants" && Array.isArray(params.values)) {
        // Values already in correct format
      }

      const result = await bridgeClient.sendRequest(operation, params as Record<string, unknown>);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              error: error instanceof Error ? error.message : "Unknown error",
            }),
          },
        ],
        isError: true,
      };
    }
  });

  // Start the server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("figma-pilot MCP server running on stdio");
}

main().catch(console.error);
