/**
 * Component commands - to-component, create-variants, instantiate
 */

import { defineCommand } from 'citty';
import { sendRequest, bridgeClient } from '../bridge/client';
import type {
  ToComponentResult,
  CreateVariantsResult,
  InstantiateResult,
} from '@figma-pilot/shared';
import { output, error, success } from '../utils/output';
import { parseValues, parsePosition } from '../utils/json-schema';

export const toComponentCommand = defineCommand({
  meta: {
    name: 'to-component',
    description: 'Convert element to a component',
  },
  args: {
    target: {
      type: 'string',
      description: 'Node ID or "selection" for current selection',
      required: true,
    },
    name: {
      type: 'string',
      description: 'Component name',
    },
    'output-json': {
      type: 'boolean',
      description: 'Output result as JSON',
      default: false,
    },
  },
  async run({ args }) {
    try {
      await bridgeClient.start();

      const result = await sendRequest<ToComponentResult>('to-component', {
        target: args.target,
        name: args.name,
      });

      if (args['output-json']) {
        output(result);
      } else {
        success(`Created component: ${result.name}`, {
          componentId: result.componentId,
        });
      }
    } catch (err) {
      error('Failed to create component', (err as Error).message);
      process.exit(1);
    } finally {
      await bridgeClient.stop();
    }
  },
});

export const createVariantsCommand = defineCommand({
  meta: {
    name: 'create-variants',
    description: 'Create component variants',
  },
  args: {
    target: {
      type: 'string',
      description: 'Component ID or "selection" for current selection',
      required: true,
    },
    property: {
      type: 'string',
      description: 'Variant property name (e.g., "state", "size")',
      required: true,
    },
    values: {
      type: 'string',
      description: 'Comma-separated variant values (e.g., "default,hover,pressed")',
      required: true,
    },
    'output-json': {
      type: 'boolean',
      description: 'Output result as JSON',
      default: false,
    },
  },
  async run({ args }) {
    try {
      const values = parseValues(args.values);
      if (values.length < 2) {
        error('At least 2 variant values are required');
        process.exit(1);
      }

      await bridgeClient.start();

      const result = await sendRequest<CreateVariantsResult>('create-variants', {
        target: args.target,
        property: args.property,
        values,
      });

      if (args['output-json']) {
        output(result);
      } else {
        success(`Created ${result.variantCount} variants`, {
          componentSetId: result.componentSetId,
          variants: result.variants,
        });
      }
    } catch (err) {
      error('Failed to create variants', (err as Error).message);
      process.exit(1);
    } finally {
      await bridgeClient.stop();
    }
  },
});

export const instantiateCommand = defineCommand({
  meta: {
    name: 'instantiate',
    description: 'Create an instance of a component',
  },
  args: {
    component: {
      type: 'string',
      description: 'Component ID or "name:ComponentName"',
      required: true,
    },
    position: {
      type: 'string',
      description: 'Position as "x,y"',
    },
    parent: {
      type: 'string',
      description: 'Parent element (ID, "selection", or "name:ElementName")',
    },
    'output-json': {
      type: 'boolean',
      description: 'Output result as JSON',
      default: false,
    },
  },
  async run({ args }) {
    try {
      const params: { component: string; x?: number; y?: number; parent?: string } = {
        component: args.component,
      };

      if (args.position) {
        const { x, y } = parsePosition(args.position);
        params.x = x;
        params.y = y;
      }

      if (args.parent) {
        params.parent = args.parent;
      }

      await bridgeClient.start();

      const result = await sendRequest<InstantiateResult>('instantiate', params);

      if (args['output-json']) {
        output(result);
      } else {
        success(`Created instance`, {
          instanceId: result.instanceId,
          componentId: result.componentId,
        });
      }
    } catch (err) {
      error('Failed to create instance', (err as Error).message);
      process.exit(1);
    } finally {
      await bridgeClient.stop();
    }
  },
});
