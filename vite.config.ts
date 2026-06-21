import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

// The game page lives in public/index.html (the documented mount point) and pulls in
// ../src/main.ts. We therefore run Vite with `root: public` and allow it to read the
// sibling src/ tree. The production build lands in dist/ — served by GitHub Pages /
// Netlify and used by Capacitor as its web dir (see PLAN.md §6 Phase 4).
const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  // Relative base so the built index.html resolves its bundle/assets relative to wherever
  // it is served from. This is the one setting that works for ALL three deploy targets:
  //   • GitHub Pages project site  (served under /<repo>/  — e.g. /SherlockHolmes/)
  //   • Netlify / any host at root (served under /)
  //   • Capacitor Android WebView  (served from capacitor://localhost or a file:// dir)
  // An absolute base like '/SherlockHolmes/' would fix Pages but break Capacitor; './'
  // satisfies all three, so no per-target build is needed.
  base: './',
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
