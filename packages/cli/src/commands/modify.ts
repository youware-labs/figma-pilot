/**
 * Modify command - modify existing elements
 */

import { defineCommand } from 'citty';
import { sendRequest, bridgeClient } from '../bridge/client';
import type { ModifyResult, ModifyParams } from '@figma-pilot/shared';
import { output, error, success } from '../utils/output';
import { parseJsonInput, parseSize, parsePosition, mergeParams } from '../utils/json-schema';

export const modifyCommand = defineCommand({
  meta: {
    name: 'modify',
    description: 'Modify existing elements in Figma',
  },
  args: {
    target: {
      type: 'string',
      description: 'Node ID or "selection" for current selection',
      required: true,
    },
    name: {
      type: 'string',
      description: 'New element name',
    },
    size: {
      type: 'string',
      description: 'New size as "width,height"',
    },
    position: {
      type: 'string',
      description: 'New position as "x,y"',
    },
    fill: {
      type: 'string',
      description: 'Fill color (hex)',
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
    opacity: {
      type: 'string',
      description: 'Opacity (0-1)',
    },
    visible: {
      type: 'boolean',
      description: 'Visibility',
    },
    locked: {
      type: 'boolean',
      description: 'Locked state',
    },
    content: {
      type: 'string',
      description: 'Text content (for text elements)',
    },
    'font-size': {
      type: 'string',
      description: 'Font size (for text elements)',
    },
    'font-family': {
      type: 'string',
      description: 'Font family (for text elements)',
    },
    'font-weight': {
      type: 'string',
      description: 'Font weight (for text elements)',
    },
    'text-color': {
      type: 'string',
      description: 'Text color (hex, for text elements)',
    },
    json: {
      type: 'string',
      description: 'Modifications as JSON',
    },
    'output-json': {
      type: 'boolean',
      description: 'Output result as JSON',
      default: false,
    },
  },
  async run({ args }) {
    try {
      let params: ModifyParams = { target: args.target };

      // Parse JSON input if provided
      if (args.json) {
        const jsonParams = parseJsonInput(args.json) as Partial<ModifyParams>;
        params = { ...params, ...jsonParams };
      }

      // Merge CLI flags
      const cliParams: Partial<ModifyParams> = {};

      if (args.name) cliParams.name = args.name;
      if (args.fill) cliParams.fill = args.fill;
      if (args.stroke) cliParams.stroke = args.stroke;
      if (args['stroke-width']) cliParams.strokeWidth = parseFloat(args['stroke-width']);
      if (args['corner-radius']) cliParams.cornerRadius = parseFloat(args['corner-radius']);
      if (args.opacity) cliParams.opacity = parseFloat(args.opacity);
      if (args.visible !== undefined) cliParams.visible = args.visible;
      if (args.locked !== undefined) cliParams.locked = args.locked;
      if (args.content) cliParams.content = args.content;
      if (args['font-size']) cliParams.fontSize = parseFloat(args['font-size']);
      if (args['font-family']) cliParams.fontFamily = args['font-family'];
      if (args['font-weight']) cliParams.fontWeight = parseFloat(args['font-weight']);
      if (args['text-color']) cliParams.textColor = args['text-color'];

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

      params = mergeParams(params as unknown as Record<string, unknown>, cliParams) as unknown as ModifyParams;

      await bridgeClient.start();

      const result = await sendRequest<ModifyResult>('modify', params);

      if (args['output-json']) {
        output(result);
      } else {
        success(`Modified element ${result.nodeId}`, {
          modified: result.modified,
        });
      }
    } catch (err) {
      error('Failed to modify element', (err as Error).message);
      process.exit(1);
    } finally {
      await bridgeClient.stop();
    }
  },
});
