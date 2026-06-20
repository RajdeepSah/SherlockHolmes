import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// The game page lives in public/index.html (the documented mount point) and pulls in
// ../src/main.ts. We therefore run Vite with `root: public` and allow it to read the
// sibling src/ tree. The production build lands in dist/ — the same folder Phase 4
// zips for Higgsfield (index.html + assets) and Capacitor uses as its web dir.
const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL('./public', import.meta.url)),
  // Generated Phase 3 art/audio live in static/ and are copied verbatim to the dist
  // root (so static/assets/x.png is served at /assets/x.png in dev and in the build).
  // Case content references them by that runtime path (e.g. "assets/portraits/...").
  publicDir: fileURLToPath(new URL('./static', import.meta.url)),
  build: {
    outDir: fileURLToPath(new URL('./dist', import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    // Allow serving src/ which sits outside the public/ root.
    fs: { allow: [projectRoot] },
  },
});
