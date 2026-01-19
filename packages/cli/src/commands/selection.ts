/**
 * Selection command - get current selection in Figma
 */

import { defineCommand } from 'citty';
import { sendRequest, bridgeClient } from '../bridge/client';
import type { SelectionResult } from '@figma-pilot/shared';
import { output, error, info, formatNodeInfo } from '../utils/output';

export const selectionCommand = defineCommand({
  meta: {
    name: 'selection',
    description: 'Get current selection in Figma',
  },
  args: {
    json: {
      type: 'boolean',
      description: 'Output as JSON',
      default: false,
    },
  },
  async run({ args }) {
    try {
      await bridgeClient.start();

      const result = await sendRequest<SelectionResult>('selection', {});

      if (args.json) {
        output(result);
      } else if (result.nodes.length === 0) {
        info('No elements selected');
      } else {
        console.log(`Selected ${result.nodes.length} element(s):`);
        for (const node of result.nodes) {
          console.log(`  ${formatNodeInfo(node)}`);
        }
      }
    } catch (err) {
      error('Failed to get selection', (err as Error).message);
      process.exit(1);
    } finally {
      await bridgeClient.stop();
    }
  },
});
