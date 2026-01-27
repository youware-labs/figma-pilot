# @figma-pilot/plugin

Figma plugin that executes operations requested by the MCP server or CLI. This plugin runs in Figma Desktop and communicates with the bridge server via HTTP.

## Overview

The plugin acts as the execution layer for figma-pilot. It receives operation requests from the MCP server (via the bridge) and executes them using the Figma Plugin API.

## Installation

### For Development

1. Build the plugin:
   ```bash
   bun run build:plugin
   ```

2. In Figma Desktop:
   - Go to **Plugins → Development → Import plugin from manifest...**
   - Select `packages/plugin/manifest.json`

3. Run the plugin:
   - **Plugins → Development → figma-pilot**

### For Production

Download the plugin zip from [GitHub Releases](https://github.com/youware-labs/figma-pilot/releases) and import it in Figma Desktop.

## Development

### Project Structure

```
plugin/
├── src/
│   ├── main.ts              # Plugin entry point
│   ├── handlers/            # Operation handlers
│   │   ├── create.ts
│   │   ├── modify.ts
│   │   ├── component.ts
│   │   ├── accessibility.ts
│   │   ├── tokens.ts
│   │   └── export.ts
│   ├── utils/
│   │   └── serialize.ts     # Node serialization utilities
│   └── ui.html              # Plugin UI (status display)
├── manifest.json            # Plugin manifest
└── package.json
```

### Building

```bash
# Build plugin code
bun run build

# Build main code only
bun run build:main

# Build UI only
bun run build:ui

# Watch mode for development
bun run dev
```

### Development Workflow

1. Make changes to plugin code
2. Run `bun run build` or `bun run dev` (watch mode)
3. Reload the plugin in Figma Desktop (right-click plugin → Reload)

### Testing

1. Start the bridge server: `bun run cli serve`
2. Run the plugin in Figma Desktop
3. The plugin should show "Connected" status
4. Test operations via CLI or MCP client

## Architecture

The plugin communicates with the bridge server via HTTP:

```
┌──────────────┐     HTTP      ┌──────────────┐
│ Bridge Server│ ◄───────────► │   Plugin     │
│  (port 38451)│               │  (Figma UI)   │
└──────────────┘               └──────────────┘
```

The plugin UI receives HTTP requests from the bridge and posts messages to the plugin's main thread, which executes operations using the Figma Plugin API.

## Operation Handlers

### Create Handler

Handles element creation operations:
- Frames, text, rectangles, ellipses, lines
- Semantic types (card, button, nav, form, input)
- Auto-layout configuration
- Nested children

### Modify Handler

Handles element modification:
- Property updates (size, position, style)
- Layout changes
- Text content updates

### Component Handler

Handles component operations:
- Component creation
- Variant creation
- Instance creation
- Component listing

### Accessibility Handler

Handles accessibility operations:
- WCAG compliance checking
- Contrast ratio validation
- Touch target size validation
- Auto-fixing issues

### Token Handler

Handles design token operations:
- Token creation
- Token binding
- Token synchronization

### Export Handler

Handles export operations:
- PNG, SVG, PDF, JPG export
- Scale factor support

## Plugin UI

The plugin UI displays connection status and provides a visual indicator that the plugin is running. The UI is minimal and primarily serves as a status display.

## Manifest

The `manifest.json` file defines:
- Plugin name and ID
- Main entry point
- UI entry point
- Permissions required

## Limitations

- Plugin runs only in Figma Desktop (not in browser)
- Some operations require specific permissions
- Network requests are limited to localhost

## Troubleshooting

### Plugin Not Connecting

1. Ensure bridge server is running: `bun run cli serve`
2. Check that port 38451 is not blocked
3. Reload the plugin in Figma

### Build Errors

1. Ensure dependencies are installed: `bun install`
2. Check TypeScript errors: `bun run typecheck`
3. Verify Figma plugin types are installed

### Operation Failures

1. Check plugin console for errors
2. Verify operation parameters are correct
3. Ensure required permissions are granted

## See Also

- [Main README](../../README.md)
- [CLI README](../cli/README.md)
- [Figma Plugin API Documentation](https://www.figma.com/plugin-docs/)
