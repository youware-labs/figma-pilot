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

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Create zip with required files
echo "Creating ${ZIP_NAME}..."
cd "$PLUGIN_DIR"
zip -r "../../${OUTPUT_DIR}/${ZIP_NAME}" \
  manifest.json \
  dist/main.js \
  dist/ui.html

cd ../..

echo ""
echo "✓ Plugin packaged: ${OUTPUT_DIR}/${ZIP_NAME}"
echo ""
echo "To create a GitHub release:"
echo "  gh release create v${VERSION} ${OUTPUT_DIR}/${ZIP_NAME} --title 'v${VERSION}' --notes 'Release v${VERSION}'"
