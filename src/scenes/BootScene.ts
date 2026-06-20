// Boot — the single place that loads a case's art/audio before play begins. It reads
// the shared controller's case, queues whatever assets exist, then hands off to the
// briefing. With no assets (today's state) it loads nothing and starts immediately.

import Phaser from 'phaser';
import type { GameController } from './controller';
import { queueCaseAssets, Ambience } from './assets';
import { BriefingScene } from './BriefingScene';

export class BootScene extends Phaser.Scene {
  static readonly KEY = 'Boot';
  constructor() {
    super(BootScene.KEY);
  }

  preload(): void {
    const controller = this.registry.get('controller') as GameController;
    // Asset paths are pre-wired (see ARTWORK.md) but the files may not exist yet. A
    // failed load is expected and harmless: the scene helpers check textures.exists and
    // fall back to the procedural look. Swallow the loader's own error so it doesn't
    // abort the boot or add noise of its own.
    this.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, () => {});
    queueCaseAssets(this, controller.theCase);
  }

  create(): void {
    Ambience.armOnFirstGesture(this);
    this.scene.start(BriefingScene.KEY);
  }
}
