/**
 * Delete command - delete elements
 */

import { defineCommand } from 'citty';
import { sendRequest, bridgeClient } from '../bridge/client';
import type { DeleteResult } from '@figma-pilot/shared';
import { output, error, success } from '../utils/output';

export const deleteCommand = defineCommand({
  meta: {
    name: 'delete',
    description: 'Delete elements from Figma',
  },
  args: {
    target: {
      type: 'string',
      description: 'Node ID or "selection" for current selection',
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
      await bridgeClient.start();

      const result = await sendRequest<DeleteResult>('delete', {
        target: args.target,
      });

      if (args['output-json']) {
        output(result);
      } else {
        success(`Deleted ${result.deleted.length} element(s)`, {
          deleted: result.deleted,
        });
      }
    } catch (err) {
      error('Failed to delete element', (err as Error).message);
      process.exit(1);
    } finally {
      await bridgeClient.stop();
    }
  },
});
