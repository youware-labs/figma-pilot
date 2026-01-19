/**
 * Build script for plugin main code
 * Uses esbuild to target ES2015 for Figma compatibility
 */

import * as esbuild from 'esbuild';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

async function build() {
  await esbuild.build({
    entryPoints: [join(root, 'src', 'main.ts')],
    bundle: true,
    outfile: join(root, 'dist', 'main.js'),
    format: 'iife',
    target: 'es2015',
    minify: true,
    sourcemap: false,
    // Figma plugin globals
    define: {
      'process.env.NODE_ENV': '"production"',
    },
  });

  console.log('Plugin main built successfully (ES2015)');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
