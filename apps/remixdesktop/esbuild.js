const esbuild = require('esbuild');

esbuild.build({
  entryPoints: ['src/main.ts', 'src/preload.ts'],  // Your TypeScript entry point
  outdir: 'build',      // Output bundled file
  bundle: true,                  // Bundle all dependencies
  platform: 'node',              // Target Node.js platform
  external: ['electron', 'fsevents', 'node-pty'], // Exclude native modules
  target: ['node20'],            // Match the Node.js version for Electron
  tsconfig: 'tsconfig.json',     // Your TypeScript config
  minify: false,                  // Optional: Minify for production
}).catch(() => process.exit(1));
