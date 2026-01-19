/**
 * Create command - create elements in Figma
 */

import { defineCommand } from 'citty';
import { sendRequest, bridgeClient } from '../bridge/client';
import type { CreateResult, CreateParams, ElementType } from '@figma-pilot/shared';
import { output, error, success } from '../utils/output';
import { parseJsonInput, validateCreateParams, parseSize, parsePosition, mergeParams } from '../utils/json-schema';

export const createCommand = defineCommand({
  meta: {
    name: 'create',
    description: 'Create elements in Figma',
  },
  args: {
    type: {
      type: 'string',
      description: 'Element type (frame, text, rect, ellipse, card, button, form, nav, input)',
    },
    name: {
      type: 'string',
      description: 'Element name',
    },
    width: {
      type: 'string',
      description: 'Element width',
    },
    height: {
      type: 'string',
      description: 'Element height',
    },
    size: {
      type: 'string',
      description: 'Size as "width,height" (alternative to --width/--height)',
    },
    position: {
      type: 'string',
      description: 'Position as "x,y"',
    },
    fill: {
      type: 'string',
      description: 'Fill color (hex, e.g., #FF0000)',
    },
    stroke: {
      type: 'string',
      description: 'Stroke color (hex)',
    },
    'stroke-width': {
      type: 'string',
      description: 'Stroke width',
    },
    'corner-radius': {
      type: 'string',
      description: 'Corner radius',
    },
    content: {
      type: 'string',
      description: 'Text content (for text elements)',
    },
    'font-size': {
      type: 'string',
      description: 'Font size (for text elements)',
    },
    layout: {
      type: 'string',
      description: 'Layout direction: "row" or "column"',
    },
    gap: {
      type: 'string',
      description: 'Gap between children (auto-layout)',
    },
    padding: {
      type: 'string',
      description: 'Padding (single value or "top,right,bottom,left")',
    },
    json: {
      type: 'string',
      description: 'Full element specification as JSON',
    },
    parent: {
      type: 'string',
      description: 'Parent element ID or "selection" to append to',
    },
    'output-json': {
      type: 'boolean',
      description: 'Output result as JSON',
      default: false,
    },
  },
  async run({ args }) {
    try {
      let params: CreateParams;

      // Parse JSON input if provided
      if (args.json) {
        const jsonParams = parseJsonInput(args.json);
        params = validateCreateParams(jsonParams);
      } else if (!args.type) {
        error('Either --type or --json must be provided');
        process.exit(1);
      } else {
        params = { type: args.type as ElementType };
      }

      // Merge CLI flags
      const cliParams: Partial<CreateParams> = {};

      if (args.name) cliParams.name = args.name;
      if (args.width) cliParams.width = parseFloat(args.width);
      if (args.height) cliParams.height = parseFloat(args.height);
      if (args.fill) cliParams.fill = args.fill;
      if (args.stroke) cliParams.stroke = args.stroke;
      if (args['stroke-width']) cliParams.strokeWidth = parseFloat(args['stroke-width']);
      if (args['corner-radius']) cliParams.cornerRadius = parseFloat(args['corner-radius']);
      if (args.content) cliParams.content = args.content;
      if (args['font-size']) cliParams.fontSize = parseFloat(args['font-size']);
      if (args.parent) cliParams.parent = args.parent;

      // Parse size
      if (args.size) {
        const { width, height } = parseSize(args.size);
        cliParams.width = width;
        cliParams.height = height;
      }

      // Parse position
      if (args.position) {
        const { x, y } = parsePosition(args.position);
        cliParams.x = x;
        cliParams.y = y;
      }

      // Parse layout
      if (args.layout || args.gap || args.padding) {
        cliParams.layout = cliParams.layout || {};
        if (args.layout) {
          cliParams.layout.direction = args.layout as 'row' | 'column';
        }
        if (args.gap) {
          cliParams.layout.gap = parseFloat(args.gap);
        }
        if (args.padding) {
          const paddingParts = args.padding.split(',');
          if (paddingParts.length === 1) {
            cliParams.layout.padding = parseFloat(paddingParts[0]);
          } else if (paddingParts.length === 4) {
            cliParams.layout.padding = {
              top: parseFloat(paddingParts[0]),
              right: parseFloat(paddingParts[1]),
              bottom: parseFloat(paddingParts[2]),
              left: parseFloat(paddingParts[3]),
            };
          }
        }
      }

      params = mergeParams(params, cliParams);

      await bridgeClient.start();

      const result = await sendRequest<CreateResult>('create', params);

      if (args['output-json']) {
        output(result);
      } else {
        success(`Created ${result.type}: ${result.name}`, {
          nodeId: result.nodeId,
        });
      }
    } catch (err) {
      error('Failed to create element', (err as Error).message);
      process.exit(1);
    } finally {
      await bridgeClient.stop();
    }
  },
});
