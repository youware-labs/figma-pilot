/**
 * Accessibility command - unified accessibility checking and fixing
 */

import { defineCommand } from 'citty';
import { sendRequest, bridgeClient } from '../bridge/client';
import type { AccessibilityResult } from '@figma-pilot/shared';
import { output, error, success, warn, formatAccessibilityIssue } from '../utils/output';

export const accessibilityCommand = defineCommand({
  meta: {
    name: 'accessibility',
    description: 'Check accessibility issues and optionally fix them (WCAG compliance)',
  },
  args: {
    target: {
      type: 'string',
      description: 'Node ID, "selection", "page", or "name:ElementName"',
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
    'output-format': {
      type: 'string',
      description: 'Output format: "json" or "text"',
      default: 'text',
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

      const result = await sendRequest<AccessibilityResult>('accessibility', {
        target: args.target,
        level,
        autoFix: args['auto-fix'],
        output: args['output-format'] as 'json' | 'text',
      });

      if (args['output-format'] === 'json') {
        output(result);
      } else {
        console.log('Accessibility Results');
        console.log('=====================');
        console.log(`Level: WCAG ${level}`);
        console.log(`Passed: ${result.passed}`);
        console.log(`Failed: ${result.failed}`);
        console.log(`Warnings: ${result.warnings}`);
        
        if (args['auto-fix']) {
          console.log(`Fixed: ${result.fixedCount}`);
        }
        console.log('');

        if (result.totalIssues === 0) {
          success(`No accessibility issues found (WCAG ${level})`);
        } else {
          if (args['auto-fix']) {
            success(`Fixed ${result.fixedCount} of ${result.totalIssues} accessibility issues`);
          } else {
            warn(`Found ${result.totalIssues} accessibility issues`);
          }

          console.log('');
          console.log('Issues:');
          for (const issue of result.issues) {
            console.log(formatAccessibilityIssue(issue));
          }

          if (!args['auto-fix'] && result.totalIssues > 0) {
            console.log('');
            console.log('Run with --auto-fix to automatically fix these issues.');
          }
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
