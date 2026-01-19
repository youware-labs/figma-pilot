/**
 * Query command - get information about a specific element
 */

import { defineCommand } from 'citty';
import { sendRequest, bridgeClient } from '../bridge/client';
import type { QueryResult } from '@figma-pilot/shared';
import { output, error, info } from '../utils/output';

export const queryCommand = defineCommand({
  meta: {
    name: 'query',
    description: 'Query information about an element',
  },
  args: {
    target: {
      type: 'string',
      description: 'Node ID or "selection" for current selection',
      required: true,
    },
    json: {
      type: 'boolean',
      description: 'Output as JSON',
      default: false,
    },
  },
  async run({ args }) {
    try {
      await bridgeClient.start();

      const result = await sendRequest<QueryResult>('query', {
        target: args.target,
      });

      if (args.json) {
        output(result);
      } else if (!result.node) {
        info('Node not found');
      } else {
        output(result.node);
      }
    } catch (err) {
      error('Failed to query element', (err as Error).message);
      process.exit(1);
    } finally {
      await bridgeClient.stop();
    }
  },
});
