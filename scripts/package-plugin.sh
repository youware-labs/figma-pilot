#!/bin/bash
# Package Figma plugin for GitHub releases

set -e

VERSION=${1:-"0.1.0"}
OUTPUT_DIR="dist/releases"
PLUGIN_DIR="packages/plugin"
ZIP_NAME="figma-pilot-plugin-v${VERSION}.zip"

echo "Packaging Figma plugin v${VERSION}..."

# Ensure plugin is built
echo "Building plugin..."
bun run build:plugin

# Verify dist files exist
if [ ! -f "$PLUGIN_DIR/dist/main.js" ] || [ ! -f "$PLUGIN_DIR/dist/ui.html" ]; then
  echo "Error: dist files not found after build!"
  echo "Expected: $PLUGIN_DIR/dist/main.js and $PLUGIN_DIR/dist/ui.html"
  exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Create zip with required files and proper directory structure
# Using -r to preserve directory structure
echo "Creating ${ZIP_NAME}..."
cd "$PLUGIN_DIR"
zip -r "../../${OUTPUT_DIR}/${ZIP_NAME}" \
  manifest.json \
  dist/

cd ../..

echo ""
echo "✓ Plugin packaged: ${OUTPUT_DIR}/${ZIP_NAME}"
echo ""
echo "Zip contents should include:"
echo "  - manifest.json"
echo "  - dist/main.js"
echo "  - dist/ui.html"
echo ""
echo "To create a GitHub release:"
echo "  gh release create v${VERSION} ${OUTPUT_DIR}/${ZIP_NAME} --title 'v${VERSION}' --notes 'Release v${VERSION}'"
