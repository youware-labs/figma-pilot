/**
 * List Components command - discover available components
 */

import { defineCommand } from 'citty';
import { sendRequest } from '../bridge/client';
import type { ListComponentsResult } from '@figma-pilot/shared';
import { output, success } from '../utils/output';

export const listComponentsCommand = defineCommand({
  meta: {
    name: 'list-components',
    description: 'List available components in the Figma file',
  },
  args: {
    filter: {
      type: 'string',
      description: 'Filter components by name (case-insensitive)',
    },
    json: {
      type: 'boolean',
      description: 'Output result as JSON',
      default: false,
    },
  },
  async run({ args }) {
    try {
      const result = await sendRequest<ListComponentsResult>('list-components', {
        filter: args.filter,
      });

      if (args.json) {
        output(result);
      } else {
        if (result.components.length === 0) {
          console.log('No components found.');
        } else {
          console.log(`Found ${result.components.length} component(s):\n`);
          for (const comp of result.components) {
            const variantInfo = comp.isVariant ? ' [variant]' : '';
            console.log(`  • ${comp.name}${variantInfo}`);
            console.log(`    ID: ${comp.id}`);
            if (comp.description) {
              console.log(`    Description: ${comp.description}`);
            }
            if (comp.variantProperties && Object.keys(comp.variantProperties).length > 0) {
              console.log(`    Properties: ${JSON.stringify(comp.variantProperties)}`);
            }
            console.log('');
          }
          console.log('Use with instantiate:');
          console.log('  figma-pilot instantiate --component "name:ComponentName"');
        }
      }
    } catch (err) {
      console.error('Failed to list components:', (err as Error).message);
      process.exit(1);
    }
  },
});
