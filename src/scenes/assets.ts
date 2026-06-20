// Asset wiring for the presentation layer (Phase 3).
//
// The logic core only ever holds asset *paths* (see Case.art / Suspect.portrait). This
// module turns those paths into Phaser loads under stable keys, and provides a backdrop
// helper that falls back to a procedural look when no image is supplied — so the slice
// looks intentional today and simply gets richer when Higgsfield art is dropped in.

import Phaser from 'phaser';
import type { Case, Phase } from '../logic/types';
import { BASE_W, BASE_H, C } from './theme';

export const bgKey = (phase: Phase): string => `bg-${phase}`;
export const portraitKey = (suspectId: string): string => `portrait-${suspectId}`;
export const AUDIO_LOOP = 'ambience-loop';
export const AUDIO_STING = 'ambience-sting';

/**
 * Queue every asset a case references for loading. Call from a scene's `preload`.
 * Missing fields are simply skipped; a case with no art queues nothing.
 */
export function queueCaseAssets(scene: Phaser.Scene, theCase: Case): void {
  const art = theCase.art;
  for (const s of theCase.suspects) {
    if (s.portrait) scene.load.image(portraitKey(s.id), s.portrait);
  }
  if (art?.scenery) {
    for (const [phase, path] of Object.entries(art.scenery)) {
      if (path) scene.load.image(bgKey(phase as Phase), path);
    }
  }
  if (art?.ambience?.loop) scene.load.audio(AUDIO_LOOP, art.ambience.loop);
  if (art?.ambience?.sting) scene.load.audio(AUDIO_STING, art.ambience.sting);
}

/**
 * Paint a full-screen backdrop behind everything. Uses the loaded image for `phase`
 * if present (cover-fit, with a dark scrim for text legibility); otherwise draws a
 * warm vertical gradient. Always sits at a deeply negative depth.
 */
export function applyBackdrop(scene: Phaser.Scene, phase: Phase): void {
  const key = bgKey(phase);
  if (scene.textures.exists(key)) {
    const img = scene.add.image(BASE_W / 2, BASE_H / 2, key).setDepth(-20);
    const scale = Math.max(BASE_W / img.width, BASE_H / img.height);
    img.setScale(scale);
    scene.add
      .rectangle(0, 0, BASE_W, BASE_H, C.bg, 0.5)
      .setOrigin(0, 0)
      .setDepth(-19);
    return;
  }
  const g = scene.add.graphics().setDepth(-20);
  // Warm at the top, settling to near-black at the foot — gaslit-room depth.
  g.fillGradientStyle(0x1d1810, 0x1d1810, 0x100d09, 0x0c0a07, 1);
  g.fillRect(0, 0, BASE_W, BASE_H);
  // A faint brass seam near the top, like lamplight catching the wall.
  g.fillStyle(C.accent, 0.06);
  g.fillRect(0, 0, BASE_W, 2);
}

/**
 * Ambient audio. Starts the loop on the first user gesture (browsers block autoplay)
 * and only if the audio was actually loaded; the sting is a one-shot. All no-ops when
 * the assets are absent, so this is safe to call before any audio exists.
 */
export class Ambience {
  private static loop?: Phaser.Sound.BaseSound;

  static armOnFirstGesture(scene: Phaser.Scene): void {
    if (!scene.cache.audio.exists(AUDIO_LOOP)) return;
    scene.input.once(Phaser.Input.Events.POINTER_DOWN, () => {
      if (Ambience.loop) return;
      Ambience.loop = scene.sound.add(AUDIO_LOOP, { loop: true, volume: 0.4 });
      Ambience.loop.play();
    });
  }

  static sting(scene: Phaser.Scene): void {
    if (!scene.cache.audio.exists(AUDIO_STING)) return;
    scene.sound.play(AUDIO_STING, { volume: 0.6 });
  }
}
