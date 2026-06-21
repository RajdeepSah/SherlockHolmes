// Phase 2 entry point. Boots Phaser into #game, wires the single GameController into
// the registry so every scene shares one game, then starts the briefing.
//
// This file (and everything under src/scenes/) is the PRESENTATION layer: it renders
// state and forwards Moves. All rules stay in src/logic. See CLAUDE.md.

import Phaser from 'phaser';
import { BASE_W, BASE_H } from './scenes/theme';
import { MenuScene } from './scenes/MenuScene';
import { BootScene } from './scenes/BootScene';
import { BriefingScene } from './scenes/BriefingScene';
import { InvestigationScene } from './scenes/InvestigationScene';
import { DeductionScene } from './scenes/DeductionScene';
import { AccusationScene } from './scenes/AccusationScene';
import { ResolutionScene } from './scenes/ResolutionScene';

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#14110d',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: BASE_W,
    height: BASE_H,
  },
  scene: [],
});

// The menu picks a case and puts its controller in the registry; Boot then preloads that
// case's art and hands off to the briefing. No case is chosen up front.
game.scene.add(MenuScene.KEY, MenuScene);
game.scene.add(BootScene.KEY, BootScene);
game.scene.add(BriefingScene.KEY, BriefingScene);
game.scene.add(InvestigationScene.KEY, InvestigationScene);
game.scene.add(DeductionScene.KEY, DeductionScene);
game.scene.add(AccusationScene.KEY, AccusationScene);
game.scene.add(ResolutionScene.KEY, ResolutionScene);

game.scene.start(MenuScene.KEY);
