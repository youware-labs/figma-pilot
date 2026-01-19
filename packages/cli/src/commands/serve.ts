/**
 * Serve command - run persistent bridge server
 */

import { defineCommand } from 'citty';
import { bridgeClient } from '../bridge/client';

export const serveCommand = defineCommand({
  meta: {
    name: 'serve',
    description: 'Run persistent bridge server for Figma plugin connection',
  },
  args: {
    port: {
      type: 'string',
      description: 'Port to listen on',
      default: '38451',
    },
  },
  async run({ args }) {
    console.log('Starting figma-pilot bridge server...');

    // Start in server mode (persistent)
    await bridgeClient.start(true);

    console.log(`\n✓ Bridge server running on http://localhost:${args.port}`);
    console.log('\nTo connect:');
    console.log('  1. Open Figma Desktop');
    console.log('  2. Run the figma-pilot plugin');
    console.log('  3. Plugin will auto-connect to this server');
    console.log('\nOther CLI commands will automatically route through this server.');
    console.log('Press Ctrl+C to stop\n');

    // Keep the process running
    process.on('SIGINT', async () => {
      console.log('\nShutting down...');
      await bridgeClient.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await bridgeClient.stop();
      process.exit(0);
    });

    // Keep alive
    await new Promise(() => {});
  },
});
