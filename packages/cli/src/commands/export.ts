/**
 * Export command - export elements to images
 */

import { defineCommand } from 'citty';
import { sendRequest, bridgeClient } from '../bridge/client';
import type { ExportResult } from '@figma-pilot/shared';
import { output, error, success } from '../utils/output';

export const exportCommand = defineCommand({
  meta: {
    name: 'export',
    description: 'Export element as image',
  },
  args: {
    target: {
      type: 'string',
      description: 'Node ID or "selection" for current selection',
      required: true,
    },
    format: {
      type: 'string',
      description: 'Export format: png, svg, pdf, or jpg',
      default: 'png',
    },
    scale: {
      type: 'string',
      description: 'Export scale (for raster formats)',
      default: '1',
    },
    out: {
      type: 'string',
      description: 'Output file path',
    },
    'output-json': {
      type: 'boolean',
      description: 'Output result as JSON (includes base64 data)',
      default: false,
    },
  },
  async run({ args }) {
    try {
      const validFormats = ['png', 'svg', 'pdf', 'jpg'];
      const format = args.format.toLowerCase();

      if (!validFormats.includes(format)) {
        error(`Invalid format. Must be one of: ${validFormats.join(', ')}`);
        process.exit(1);
      }

      const scale = parseFloat(args.scale);
      if (isNaN(scale) || scale <= 0) {
        error('Scale must be a positive number');
        process.exit(1);
      }

      await bridgeClient.start();

      const result = await sendRequest<ExportResult>('export', {
        target: args.target,
        format: format as 'png' | 'svg' | 'pdf' | 'jpg',
        scale,
      });

      // Write to file if output path specified
      if (args.out) {
        const buffer = Buffer.from(result.data, 'base64');
        await Bun.write(args.out, buffer);
        success(`Exported to ${args.out}`, {
          format: result.format,
          size: `${result.size} bytes`,
        });
      } else if (args['output-json']) {
        output(result);
      } else {
        // Output base64 to stdout
        console.log(result.data);
      }
    } catch (err) {
      error('Failed to export', (err as Error).message);
      process.exit(1);
    } finally {
      await bridgeClient.stop();
    }
  },
});
