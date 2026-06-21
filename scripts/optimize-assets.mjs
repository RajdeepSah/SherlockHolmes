// Asset optimizer — shrink generated art/audio for free web hosting + the Android APK.
//
// Why this exists: the Phase 3 art was generated at ~2x spec resolution as full 24-bit
// PNGs (~65 MB total). That is far too heavy for GitHub Pages / Netlify and bloats the
// APK. This script downscales each image to roughly its spec size (see ARTWORK.md) and
// re-encodes PNGs with a quantised palette, and transcodes the ambience MP3s down to a
// sane bitrate — keeping every filename identical so no content/loader paths change.
//
// It is build-time only (sharp is a devDependency). Run it on PRISTINE source art:
//   npm run optimize:assets
// Re-running on already-optimised files would re-quantise them (mild extra loss) but is
// otherwise safe — it never upscales. Regenerated full-res art should overwrite the files
// in static/ before running this again.

import sharp from 'sharp';
import { execFileSync } from 'node:child_process';
import { existsSync, renameSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const STATIC = join(root, 'static');

// PNG palette encoding: libimagequant lossy palette — pngquant-grade. quality drives the
// adaptive palette; dithering hides banding in the painterly gradients.
const PNG = { palette: true, quality: 80, effort: 10, compressionLevel: 9, dither: 1 };

// Per-asset spec sizes (the "roughly its spec size" target from ARTWORK.md). `fit:'inside'`
// keeps aspect ratio and never enlarges (withoutEnlargement).
const IMAGE_JOBS = [
  // Portraits — 1:1, spec 1024x1024.
  { file: 'assets/portraits/roylott.png', w: 1024, h: 1024 },
  { file: 'assets/portraits/band.png', w: 1024, h: 1024 },
  { file: 'assets/portraits/fiance.png', w: 1024, h: 1024 },
  // Phase backdrops — portrait ~9:16, spec width 1024 (height follows aspect).
  { file: 'assets/bg/briefing.png', w: 1024, h: 2048 },
  { file: 'assets/bg/investigation.png', w: 1024, h: 2048 },
  { file: 'assets/bg/deduction.png', w: 1024, h: 2048 },
  { file: 'assets/bg/accusation.png', w: 1024, h: 2048 },
  { file: 'assets/bg/resolved.png', w: 1024, h: 2048 },
  // Cover / deploy thumbnail — 16:9, spec 1280x720.
  { file: 'assets/cover.png', w: 1280, h: 720 },
  // App / browser icon — 1:1, spec 512x512 (user-requested).
  { file: 'favicon.png', w: 512, h: 512 },
];

// Ambience — transcode to a modest constant bitrate. The originals are ~3 Mbps (huge);
// 128 kbps stereo is plenty for night-wind/clock atmosphere and is a ~24x reduction.
const AUDIO_JOBS = [
  { file: 'assets/audio/ambience-loop.mp3', bitrate: '128k' },
  { file: 'assets/audio/ambience-sting.mp3', bitrate: '128k' },
];

const kb = (bytes) => `${(bytes / 1024).toFixed(0)} KB`;
const size = (p) => (existsSync(p) ? statSync(p).size : 0);

function hasFfmpeg() {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function optimizeImages() {
  let before = 0;
  let after = 0;
  for (const job of IMAGE_JOBS) {
    const abs = join(STATIC, job.file);
    if (!existsSync(abs)) {
      console.warn(`  skip (missing): ${job.file}`);
      continue;
    }
    const tmp = `${abs}.opt.png`;
    const b = size(abs);
    await sharp(abs)
      .resize({ width: job.w, height: job.h, fit: 'inside', withoutEnlargement: true })
      .png(PNG)
      .toFile(tmp);
    const a = size(tmp);
    const meta = await sharp(tmp).metadata();
    renameSync(tmp, abs);
    before += b;
    after += a;
    console.log(`  ${job.file.padEnd(34)} ${kb(b).padStart(9)} -> ${kb(a).padStart(8)}  (${meta.width}x${meta.height})`);
  }
  return { before, after };
}

function optimizeAudio() {
  let before = 0;
  let after = 0;
  if (!hasFfmpeg()) {
    console.warn('  ffmpeg not found — skipping audio (install ffmpeg to transcode).');
    return { before, after };
  }
  for (const job of AUDIO_JOBS) {
    const abs = join(STATIC, job.file);
    if (!existsSync(abs)) {
      console.warn(`  skip (missing): ${job.file}`);
      continue;
    }
    const tmp = `${abs}.opt.mp3`;
    const b = size(abs);
    // -map_metadata -1 strips tags; libmp3lame CBR at the target bitrate.
    execFileSync('ffmpeg', [
      '-y', '-loglevel', 'error', '-i', abs,
      '-map_metadata', '-1', '-c:a', 'libmp3lame', '-b:a', job.bitrate,
      tmp,
    ]);
    const a = size(tmp);
    renameSync(tmp, abs); // atomically replaces the original (execFileSync threw if ffmpeg failed)
    before += b;
    after += a;
    console.log(`  ${job.file.padEnd(34)} ${kb(b).padStart(9)} -> ${kb(a).padStart(8)}  (@${job.bitrate})`);
  }
  return { before, after };
}

console.log('Optimizing images (sharp):');
const img = await optimizeImages();
console.log('Optimizing audio (ffmpeg):');
const aud = optimizeAudio();

const before = img.before + aud.before;
const after = img.after + aud.after;
const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
console.log('—'.repeat(56));
console.log(`Total: ${mb(before)} -> ${mb(after)}  (${(100 * (1 - after / before)).toFixed(1)}% smaller)`);
