/**
 * Token commands - bind-token, create-token, sync-tokens
 */

import { defineCommand } from 'citty';
import { sendRequest, bridgeClient } from '../bridge/client';
import type {
  BindTokenResult,
  CreateTokenResult,
  SyncTokensResult,
  TokenProperty,
} from '@figma-pilot/shared';
import { output, error, success, info } from '../utils/output';

export const bindTokenCommand = defineCommand({
  meta: {
    name: 'bind-token',
    description: 'Bind a design token to an element property',
  },
  args: {
    target: {
      type: 'string',
      description: 'Node ID or "selection" for current selection',
      required: true,
    },
    property: {
      type: 'string',
      description: 'Property to bind (fill, stroke, fontSize, cornerRadius, gap, padding)',
      required: true,
    },
    token: {
      type: 'string',
      description: 'Token path (e.g., "colors/primary")',
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
      const validProperties: TokenProperty[] = [
        'fill', 'stroke', 'fontSize', 'fontFamily', 'fontWeight',
        'cornerRadius', 'gap', 'padding',
      ];

      if (!validProperties.includes(args.property as TokenProperty)) {
        error(`Invalid property. Must be one of: ${validProperties.join(', ')}`);
        process.exit(1);
      }

      await bridgeClient.start();

      const result = await sendRequest<BindTokenResult>('bind-token', {
        target: args.target,
        property: args.property as TokenProperty,
        token: args.token,
      });

      if (args['output-json']) {
        output(result);
      } else {
        success(`Bound token "${args.token}" to ${args.property}`, {
          nodeId: result.nodeId,
          previousValue: result.previousValue,
        });
      }
    } catch (err) {
      error('Failed to bind token', (err as Error).message);
      process.exit(1);
    } finally {
      await bridgeClient.stop();
    }
  },
});

export const createTokenCommand = defineCommand({
  meta: {
    name: 'create-token',
    description: 'Create a new design token',
  },
  args: {
    collection: {
      type: 'string',
      description: 'Variable collection name',
      required: true,
    },
    name: {
      type: 'string',
      description: 'Token name',
      required: true,
    },
    type: {
      type: 'string',
      description: 'Token type: COLOR, NUMBER, STRING, or BOOLEAN',
      required: true,
    },
    value: {
      type: 'string',
      description: 'Token value (e.g., "#FF0000" for color, "16" for number)',
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
      const validTypes = ['COLOR', 'NUMBER', 'STRING', 'BOOLEAN'];
      const tokenType = args.type.toUpperCase();

      if (!validTypes.includes(tokenType)) {
        error(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
        process.exit(1);
      }

      // Parse value based on type
      let value: string | number | boolean = args.value;
      if (tokenType === 'NUMBER') {
        value = parseFloat(args.value);
        if (isNaN(value)) {
          error('Value must be a number for NUMBER type');
          process.exit(1);
        }
      } else if (tokenType === 'BOOLEAN') {
        value = args.value.toLowerCase() === 'true';
      }

      await bridgeClient.start();

      const result = await sendRequest<CreateTokenResult>('create-token', {
        collection: args.collection,
        name: args.name,
        type: tokenType as 'COLOR' | 'NUMBER' | 'STRING' | 'BOOLEAN',
        value,
      });

      if (args['output-json']) {
        output(result);
      } else {
        success(`Created token: ${result.name}`, {
          collection: result.collection,
          id: result.id,
        });
      }
    } catch (err) {
      error('Failed to create token', (err as Error).message);
      process.exit(1);
    } finally {
      await bridgeClient.stop();
    }
  },
});

export const syncTokensCommand = defineCommand({
  meta: {
    name: 'sync-tokens',
    description: 'Sync design tokens between Figma and JSON file',
  },
  args: {
    from: {
      type: 'string',
      description: 'Import tokens from JSON file',
    },
    to: {
      type: 'string',
      description: 'Export tokens to JSON file',
    },
    'output-json': {
      type: 'boolean',
      description: 'Output result as JSON',
      default: false,
    },
  },
  async run({ args }) {
    try {
      const params: { from?: string; to?: string; tokenData?: unknown } = {};

      // Read tokens file if importing
      if (args.from) {
        const file = Bun.file(args.from);
        if (!await file.exists()) {
          error(`File not found: ${args.from}`);
          process.exit(1);
        }
        const tokenData = await file.json();
        params.from = args.from;
        (params as Record<string, unknown>).tokenData = tokenData;
      }

      if (args.to) {
        params.to = args.to;
      }

      await bridgeClient.start();

      const result = await sendRequest<SyncTokensResult & { tokenData?: unknown }>('sync-tokens', params);

      // Write tokens file if exporting
      if (args.to && result.tokenData) {
        await Bun.write(args.to, JSON.stringify(result.tokenData, null, 2));
      }

      if (args['output-json']) {
        output(result);
      } else {
        if (result.imported) {
          success(`Imported ${result.imported} tokens`);
        }
        if (result.exported) {
          success(`Exported ${result.exported} tokens to ${args.to}`);
        }
        if (result.collections.length > 0) {
          info(`Collections: ${result.collections.join(', ')}`);
        }
      }
    } catch (err) {
      error('Failed to sync tokens', (err as Error).message);
      process.exit(1);
    } finally {
      await bridgeClient.stop();
    }
  },
});
