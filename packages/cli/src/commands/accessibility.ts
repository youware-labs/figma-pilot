/**
 * Accessibility commands - ensure-accessibility, audit-a11y
 */

import { defineCommand } from 'citty';
import { sendRequest, bridgeClient } from '../bridge/client';
import type {
  EnsureAccessibilityResult,
  AuditA11yResult,
} from '@figma-pilot/shared';
import { output, error, success, warn, formatAccessibilityIssue } from '../utils/output';

export const ensureAccessibilityCommand = defineCommand({
  meta: {
    name: 'ensure-accessibility',
    description: 'Check and fix accessibility issues',
  },
  args: {
    target: {
      type: 'string',
      description: 'Node ID, "selection", or "page"',
      required: true,
    },
    level: {
      type: 'string',
      description: 'WCAG level: "AA" or "AAA"',
      default: 'AA',
    },
    'auto-fix': {
      type: 'boolean',
      description: 'Automatically fix issues where possible',
      default: false,
    },
    'output-json': {
      type: 'boolean',
      description: 'Output result as JSON',
      default: false,
    },
  },
  async run({ args }) {
    try {
      const level = args.level.toUpperCase() as 'AA' | 'AAA';
      if (level !== 'AA' && level !== 'AAA') {
        error('Level must be "AA" or "AAA"');
        process.exit(1);
      }

      await bridgeClient.start();

      const result = await sendRequest<EnsureAccessibilityResult>('ensure-accessibility', {
        target: args.target,
        level,
        autoFix: args['auto-fix'],
      });

      if (args['output-json']) {
        output(result);
      } else if (result.totalIssues === 0) {
        success(`No accessibility issues found (WCAG ${level})`);
      } else {
        if (args['auto-fix']) {
          success(`Fixed ${result.fixedCount} of ${result.totalIssues} accessibility issues`);
        } else {
          warn(`Found ${result.totalIssues} accessibility issues`);
        }

        console.log('');
        for (const issue of result.issues) {
          console.log(formatAccessibilityIssue(issue));
        }

        if (!args['auto-fix'] && result.totalIssues > 0) {
          console.log('');
          console.log('Run with --auto-fix to automatically fix these issues.');
        }
      }
    } catch (err) {
      error('Failed to check accessibility', (err as Error).message);
      process.exit(1);
    } finally {
      await bridgeClient.stop();
    }
  },
});

export const auditA11yCommand = defineCommand({
  meta: {
    name: 'audit-a11y',
    description: 'Audit accessibility without making changes',
  },
  args: {
    target: {
      type: 'string',
      description: 'Node ID, "selection", or "page"',
      required: true,
    },
    output: {
      type: 'string',
      description: 'Output format: "json" or "text"',
      default: 'text',
    },
  },
  async run({ args }) {
    try {
      await bridgeClient.start();

      const result = await sendRequest<AuditA11yResult>('audit-a11y', {
        target: args.target,
        output: args.output as 'json' | 'text',
      });

      if (args.output === 'json') {
        output(result);
      } else {
        console.log('Accessibility Audit Results');
        console.log('===========================');
        console.log(`Passed: ${result.passed}`);
        console.log(`Failed: ${result.failed}`);
        console.log(`Warnings: ${result.warnings}`);
        console.log('');

        if (result.issues.length > 0) {
          console.log('Issues:');
          for (const issue of result.issues) {
            console.log(formatAccessibilityIssue(issue));
          }
        } else {
          success('No accessibility issues found');
        }
      }
    } catch (err) {
      error('Failed to audit accessibility', (err as Error).message);
      process.exit(1);
    } finally {
      await bridgeClient.stop();
    }
  },
});
