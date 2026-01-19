/**
 * Build script for plugin UI
 * Copies the HTML file to dist
 */

import { copyFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

async function buildUI() {
  await mkdir(join(root, 'dist'), { recursive: true });
  await copyFile(join(root, 'src', 'ui.html'), join(root, 'dist', 'ui.html'));
  console.log('UI built successfully');
}

buildUI().catch(console.error);
