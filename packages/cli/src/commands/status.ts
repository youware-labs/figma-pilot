/**
 * Status command - check connection to Figma plugin
 */

import { defineCommand } from 'citty';
import { sendRequest, checkServerRunning } from '../bridge/client';
import type { StatusResult } from '@figma-pilot/shared';
import { output, error, success } from '../utils/output';

export const statusCommand = defineCommand({
  meta: {
    name: 'status',
    description: 'Check connection status to Figma plugin',
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
      const serverRunning = await checkServerRunning();

      if (!serverRunning) {
        console.log('No server running. Starting temporary server...');
        console.log('Tip: Run `bun run cli serve` in another terminal for persistent connection.');
        console.log('');
      }

      console.log('Waiting for Figma plugin response...');

      const result = await sendRequest<StatusResult>('status', {});

      if (args.json) {
        output(result);
      } else {
        success('Connected to Figma plugin', {
          pluginVersion: result.pluginVersion,
          figmaVersion: result.figmaVersion,
          document: result.documentName,
          page: result.currentPage,
        });
      }
    } catch (err) {
      error('Failed to connect to Figma plugin', (err as Error).message);
      process.exit(1);
    }
  },
});
