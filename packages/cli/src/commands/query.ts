/**
 * Query command - get information about elements
 * Supports querying by ID, name, or current selection
 */

import { defineCommand } from 'citty';
import { sendRequest, bridgeClient } from '../bridge/client';
import type { QueryResult } from '@figma-pilot/shared';
import { output, error, info, formatNodeInfo } from '../utils/output';

export const queryCommand = defineCommand({
  meta: {
    name: 'query',
    description: 'Query information about elements (by ID, name, or selection)',
  },
  args: {
    target: {
      type: 'string',
      description: 'Element to query: ID, "selection", or "name:ElementName"',
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
      } else if (result.nodes.length === 0) {
        if (args.target === 'selection') {
          info('No elements selected');
        } else {
          info('Node not found');
        }
      } else if (result.nodes.length === 1) {
        output(result.node);
      } else {
        // Multiple nodes (selection)
        console.log(`Found ${result.nodes.length} element(s):`);
        for (const node of result.nodes) {
          console.log(`  ${formatNodeInfo(node)}`);
        }
      }
    } catch (err) {
      error('Failed to query element', (err as Error).message);
      process.exit(1);
    } finally {
      await bridgeClient.stop();
    }
  },
});
