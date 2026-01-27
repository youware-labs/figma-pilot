# @figma-pilot/cli

Command-line interface for figma-pilot. Provides a semantic CLI for AI agents and developers to operate on Figma designs.

## Installation

```bash
# From the monorepo root
bun install
bun run build:cli

# Or link locally
bun run install-cli
```

## Usage

```bash
# Start the bridge server
figma-pilot serve

# Check connection status
figma-pilot status

# Get current selection
figma-pilot selection

# Query an element
figma-pilot query --target "selection"
figma-pilot query --target "123:456"
figma-pilot query --target "name:MyFrame"

# Create elements
figma-pilot create --type frame --name "Container" --width 400 --height 300
figma-pilot create --type text --content "Hello World" --fontSize 24
figma-pilot create --type button --name "Submit"

# Modify elements
figma-pilot modify --target "selection" --fill "#FF0000"
figma-pilot modify --target "name:MyFrame" --width 500 --height 400

# Delete elements
figma-pilot delete --target "selection"

# Append elements to container
figma-pilot append --target "selection" --parent "name:Container"

# Component operations
figma-pilot list-components
figma-pilot to-component --target "selection" --name "Button/Primary"
figma-pilot create-variants --target "selection" --property "state" --values "default,hover,pressed"
figma-pilot instantiate --component "123:456"

# Accessibility
figma-pilot ensure-accessibility --target "selection" --level "AA" --autoFix
figma-pilot audit-a11y --target "page" --output "json"

# Design tokens
figma-pilot create-token --collection "colors" --name "primary" --type "COLOR" --value "#2563EB"
figma-pilot bind-token --target "selection" --property "fill" --token "colors/primary"
figma-pilot sync-tokens --from "./tokens.json"
figma-pilot sync-tokens --to "./tokens.json"

# Export
figma-pilot export --target "selection" --format "png" --scale 2
```

## Commands

### `serve`

Start the HTTP bridge server that the Figma plugin connects to.

```bash
figma-pilot serve
```

Options:
- `--port <number>`: Port number (default: 38451)

### `status`

Check connection status to the Figma plugin.

```bash
figma-pilot status
```

### `selection`

Get information about the current selection in Figma.

```bash
figma-pilot selection
```

### `query`

Query an element by ID, name, or selection.

```bash
figma-pilot query --target <target>
```

Options:
- `--target <string>`: Target specifier (ID, "selection", or "name:ElementName")

### `create`

Create new elements in Figma.

```bash
figma-pilot create --type <type> [options]
```

Options:
- `--type <string>`: Element type (required): `frame`, `text`, `rect`, `ellipse`, `line`, `card`, `button`, `nav`, `form`, `input`
- `--name <string>`: Element name
- `--width <number>`: Width in pixels
- `--height <number>`: Height in pixels
- `--x <number>`: X position
- `--y <number>`: Y position
- `--parent <string>`: Parent container
- `--fill <string>`: Fill color (hex)
- `--content <string>`: Text content (for text elements)
- `--fontSize <number>`: Font size
- And many more... See `figma-pilot create --help` for full options

### `modify`

Modify existing elements.

```bash
figma-pilot modify --target <target> [options]
```

Options:
- `--target <string>`: Target specifier (required)
- `--name <string>`: New name
- `--width <number>`: New width
- `--height <number>`: New height
- `--fill <string>`: New fill color
- And more... See `figma-pilot modify --help` for full options

### `delete`

Delete elements.

```bash
figma-pilot delete --target <target>
```

### `append`

Move elements into a container.

```bash
figma-pilot append --target <target> --parent <parent>
```

### Component Commands

- `list-components`: List all available components
- `to-component`: Convert selection to component
- `create-variants`: Create component variants
- `instantiate`: Create component instance

### Accessibility Commands

- `ensure-accessibility`: Check and fix accessibility issues
- `audit-a11y`: Audit accessibility without fixing

### Token Commands

- `create-token`: Create a design token
- `bind-token`: Bind token to node property
- `sync-tokens`: Import/export tokens

### `export`

Export elements as images.

```bash
figma-pilot export --target <target> --format <format> [--scale <number>]
```

## Development

```bash
# Build
bun run build

# Run in development
bun run dev

# Type check
bun run typecheck
```

## See Also

- [Main README](../../README.md)
- [SKILL.md](../../SKILL.md) - Complete API reference
- [MCP Server README](../mcp-server/README.md)
