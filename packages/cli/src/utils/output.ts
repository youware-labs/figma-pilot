/**
 * Output formatting utilities
 */

export interface OutputOptions {
  json?: boolean;
  quiet?: boolean;
}

let globalOptions: OutputOptions = {};

export function setOutputOptions(options: OutputOptions): void {
  globalOptions = { ...globalOptions, ...options };
}

export function output(data: unknown, message?: string): void {
  if (globalOptions.quiet) return;

  if (globalOptions.json) {
    console.log(JSON.stringify(data, null, 2));
  } else if (message) {
    console.log(message);
    if (typeof data === 'object' && data !== null) {
      console.log(formatObject(data as Record<string, unknown>));
    }
  } else {
    console.log(typeof data === 'object' ? formatObject(data as Record<string, unknown>) : data);
  }
}

export function success(message: string, data?: unknown): void {
  if (globalOptions.quiet) {
    if (data && globalOptions.json) {
      console.log(JSON.stringify(data, null, 2));
    }
    return;
  }

  console.log(`✓ ${message}`);
  if (data) {
    output(data);
  }
}

export function error(message: string, details?: unknown): void {
  console.error(`✗ ${message}`);
  if (details && !globalOptions.quiet) {
    if (typeof details === 'object') {
      console.error(formatObject(details as Record<string, unknown>, '  '));
    } else {
      console.error(`  ${details}`);
    }
  }
}

export function info(message: string): void {
  if (!globalOptions.quiet) {
    console.log(`ℹ ${message}`);
  }
}

export function warn(message: string): void {
  if (!globalOptions.quiet) {
    console.log(`⚠ ${message}`);
  }
}

function formatObject(obj: Record<string, unknown>, indent = ''): string {
  const lines: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      if (value.length === 0) {
        lines.push(`${indent}${key}: []`);
      } else if (typeof value[0] === 'object') {
        lines.push(`${indent}${key}:`);
        for (const item of value) {
          lines.push(formatObject(item as Record<string, unknown>, indent + '  '));
          lines.push('');
        }
      } else {
        lines.push(`${indent}${key}: ${value.join(', ')}`);
      }
    } else if (typeof value === 'object' && value !== null) {
      lines.push(`${indent}${key}:`);
      lines.push(formatObject(value as Record<string, unknown>, indent + '  '));
    } else {
      lines.push(`${indent}${key}: ${value}`);
    }
  }

  return lines.join('\n');
}

export function formatNodeInfo(node: {
  id: string;
  name: string;
  type: string;
  width?: number;
  height?: number;
}): string {
  return `${node.name} (${node.type}) [${node.id}]${node.width ? ` ${node.width}x${node.height}` : ''}`;
}

export function formatAccessibilityIssue(issue: {
  type: string;
  nodeName: string;
  message: string;
  fixed?: boolean;
}): string {
  const status = issue.fixed ? '✓ Fixed' : '✗';
  return `${status} [${issue.type}] ${issue.nodeName}: ${issue.message}`;
}
