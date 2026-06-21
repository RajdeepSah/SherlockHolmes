# Generated assets (Phase 3)

The game's art and audio live here and are copied to the dist root by Vite
(`static/assets/x` → served at `/assets/x`). Case content references these by their
runtime path, e.g. `assets/portraits/roylott.png`. See ../../STYLE.md for the locked
house style. This tree is intentionally committed (with .gitkeep) so the build has a
stable publicDir even before art exists.

These files are kept small for free hosting and the APK: run `npm run optimize:assets`
after dropping in freshly generated (full-resolution) art — it downscales each image to
its spec size, palette-compresses the PNGs, and transcodes the MP3s, in place, keeping
every filename. See `scripts/optimize-assets.mjs`.
