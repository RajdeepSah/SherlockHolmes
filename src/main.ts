// Phase 2 entry point. Boots Phaser into #game, wires the single GameController into
// the registry so every scene shares one game, then starts the briefing.
//
// This file (and everything under src/scenes/) is the PRESENTATION layer: it renders
// state and forwards Moves. All rules stay in src/logic. See CLAUDE.md.

import Phaser from 'phaser';
import { GameController } from './scenes/controller';
import caseSpeckledBand from './content/case-speckled-band';
import { BASE_W, BASE_H } from './scenes/theme';
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
  scene: [], // added below so the controller is in the registry before any scene starts
});

game.registry.set('controller', new GameController(caseSpeckledBand));

game.scene.add(BootScene.KEY, BootScene);
game.scene.add(BriefingScene.KEY, BriefingScene);
game.scene.add(InvestigationScene.KEY, InvestigationScene);
game.scene.add(DeductionScene.KEY, DeductionScene);
game.scene.add(AccusationScene.KEY, AccusationScene);
game.scene.add(ResolutionScene.KEY, ResolutionScene);

// Boot loads any case art/audio first, then hands off to the briefing.
game.scene.start(BootScene.KEY);
