/**
 * Append command - move elements into a container
 */

import { defineCommand } from 'citty';
import { sendRequest } from '../bridge/client';
import type { AppendResult } from '@figma-pilot/shared';
import { output, error, success } from '../utils/output';

export const appendCommand = defineCommand({
  meta: {
    name: 'append',
    description: 'Move element(s) into a container frame',
  },
  args: {
    target: {
      type: 'string',
      description: 'Element to move (ID, "selection", or "name:ElementName")',
      required: true,
    },
    to: {
      type: 'string',
      description: 'Container to move into (ID, "selection", or "name:ContainerName")',
      required: true,
    },
    json: {
      type: 'boolean',
      description: 'Output result as JSON',
      default: false,
    },
  },
  async run({ args }) {
    try {
      const result = await sendRequest<AppendResult>('append', {
        target: args.target,
        parent: args.to,
      });

      if (args.json) {
        output(result);
      } else {
        success(`Moved ${result.movedCount} element(s) to ${result.parentName}`);
      }
    } catch (err) {
      error('Failed to append element', (err as Error).message);
      process.exit(1);
    }
  },
});
