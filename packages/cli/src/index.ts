#!/usr/bin/env bun
/**
 * figma-pilot CLI
 * A semantic CLI for AI agents to operate on Figma
 */

import { defineCommand, runMain } from 'citty';
import { statusCommand } from './commands/status';
import { selectionCommand } from './commands/selection';
import { queryCommand } from './commands/query';
import { createCommand } from './commands/create';
import { modifyCommand } from './commands/modify';
import { deleteCommand } from './commands/delete';
import { appendCommand } from './commands/append';
import { listComponentsCommand } from './commands/list-components';
import { toComponentCommand, createVariantsCommand, instantiateCommand } from './commands/component';
import { ensureAccessibilityCommand, auditA11yCommand } from './commands/accessibility';
import { bindTokenCommand, createTokenCommand, syncTokensCommand } from './commands/tokens';
import { exportCommand } from './commands/export';
import { serveCommand } from './commands/serve';

const main = defineCommand({
  meta: {
    name: 'figma-pilot',
    version: '0.1.0',
    description: 'Semantic CLI for AI agents to operate on Figma',
  },
  subCommands: {
    serve: serveCommand,
    status: statusCommand,
    selection: selectionCommand,
    query: queryCommand,
    create: createCommand,
    modify: modifyCommand,
    delete: deleteCommand,
    append: appendCommand,
    'list-components': listComponentsCommand,
    'to-component': toComponentCommand,
    'create-variants': createVariantsCommand,
    instantiate: instantiateCommand,
    'ensure-accessibility': ensureAccessibilityCommand,
    'audit-a11y': auditA11yCommand,
    'bind-token': bindTokenCommand,
    'create-token': createTokenCommand,
    'sync-tokens': syncTokensCommand,
    export: exportCommand,
  },
});

runMain(main);
