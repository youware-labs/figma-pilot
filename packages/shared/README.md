# @figma-pilot/shared

Shared TypeScript types and utilities for figma-pilot packages. This package provides the common type definitions and operation schemas used across the CLI, MCP server, and Figma plugin.

## Installation

This package is part of the figma-pilot monorepo and is used internally. It's not published to npm.

```bash
# Install dependencies (from monorepo root)
bun install
```

## Usage

```typescript
import type { BridgeRequest, BridgeResponse, OperationType } from '@figma-pilot/shared';
import { OperationSchema } from '@figma-pilot/shared';
```

## Exports

### Types

#### `BridgeRequest`

Request structure for bridge communication:

```typescript
interface BridgeRequest {
  id: string;
  operation: OperationType;
  params: unknown;
}
```

#### `BridgeResponse`

Response structure for bridge communication:

```typescript
interface BridgeResponse {
  id: string;
  success: boolean;
  data?: unknown;
  error?: string;
}
```

#### `OperationType`

Union type of all supported operations:

```typescript
type OperationType =
  | 'status'
  | 'selection'
  | 'query'
  | 'create'
  | 'modify'
  | 'delete'
  | 'append'
  | 'list-components'
  | 'to-component'
  | 'create-variants'
  | 'instantiate'
  | 'ensure-accessibility'
  | 'audit-a11y'
  | 'bind-token'
  | 'create-token'
  | 'sync-tokens'
  | 'export';
```

### Operation Schemas

Operation parameter schemas are defined in `operations.ts` and can be used for validation and type checking.

## Project Structure

```
shared/
├── src/
│   ├── index.ts          # Main exports
│   ├── types.ts          # TypeScript type definitions
│   └── operations.ts     # Operation definitions and schemas
└── package.json
```

## Development

```bash
# Type check
bun run typecheck
```

## Type Definitions

### Core Types

- `BridgeRequest` - Request structure
- `BridgeResponse` - Response structure
- `OperationType` - All operation types
- `TargetSpecifier` - Element targeting (ID, selection, name)

### Operation Parameters

Each operation has its own parameter type defined in `operations.ts`:

- `CreateParams` - Parameters for create operation
- `ModifyParams` - Parameters for modify operation
- `QueryParams` - Parameters for query operation
- And more...

## Usage in Other Packages

### CLI

```typescript
import type { CreateParams } from '@figma-pilot/shared';

const params: CreateParams = {
  type: 'frame',
  name: 'Container',
  width: 400,
  height: 300,
};
```

### Plugin

```typescript
import type { BridgeRequest, OperationType } from '@figma-pilot/shared';

async function handleRequest(request: BridgeRequest) {
  const { operation, params } = request;
  // Handle operation...
}
```

### MCP Server

```typescript
import type { OperationType } from '@figma-pilot/shared';

// Use types for tool schema generation
```

## See Also

- [Main README](../../README.md)
- [CLI README](../cli/README.md)
- [Plugin README](../plugin/README.md)
