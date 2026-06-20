// Resolution — the verdict. Reads the resolved state the core produced (score, solved,
// accusation) and reveals the solution. It re-derives the score *breakdown* via the pure
// `scoreAccusation` for display only; the authoritative result lives in `state`.

import Phaser from 'phaser';
import type { GameController } from './controller';
import { scoreAccusation } from '../logic/deduction';
import { BASE_W, MARGIN, CONTENT_W, FONT, T } from './theme';
import { Button, ScrollArea, heading } from './ui';
import { applyBackdrop, Ambience } from './assets';
import { BriefingScene } from './BriefingScene';

const TOP = 150;
const BOTTOM = 720;

export class ResolutionScene extends Phaser.Scene {
  static readonly KEY = 'Resolution';

  constructor() {
    super(ResolutionScene.KEY);
  }

  create(): void {
    const controller = this.registry.get('controller') as GameController;
    const { theCase } = controller;
    const state = controller.state;
    const solved = state.solved;
    applyBackdrop(this, 'resolved');
    Ambience.sting(this);

    this.add.text(MARGIN, 40, solved ? 'Case closed.' : 'The wrong hand.', {
      fontFamily: FONT,
      fontSize: '30px',
      color: solved ? T.good : T.bad,
    });
    this.add.text(MARGIN, 86, `Score  ${state.score}`, {
      fontFamily: FONT,
      fontSize: '20px',
      color: T.text,
    });

    // Display-only breakdown; the engine already decided the score above.
    const breakdown = state.accusation
      ? scoreAccusation(theCase, state.accusation)
      : undefined;
    if (breakdown) {
      const parts = [
        `Key clues cited ${breakdown.keyCluesCited}/${breakdown.keyCluesTotal}`,
        `Red herrings cited ${breakdown.redHerringsCited}`,
      ];
      this.add.text(MARGIN, 114, parts.join('   ·   '), {
        fontFamily: FONT,
        fontSize: '13px',
        color: T.muted,
      });
    }

    const scroll = new ScrollArea(this, MARGIN, TOP, CONTENT_W, BOTTOM - TOP);
    let y = 0;
    const culprit = theCase.suspects.find((s) => s.id === theCase.solution.culpritId)!;

    const addHeading = (label: string) => {
      if (y > 0) y += 12;
      scroll.add(heading(this, 0, 0, label), y);
      y += 24;
    };
    const addBody = (text: string, color: string = T.text) => {
      const t = this.add.text(0, 0, text, {
        fontFamily: FONT,
        fontSize: '16px',
        color,
        lineSpacing: 5,
        wordWrap: { width: CONTENT_W },
      });
      scroll.add(t, y);
      y += t.height;
    };

    addHeading('The culprit');
    addBody(culprit.name, T.accent);
    addHeading('The motive');
    addBody(theCase.solution.motive);
    addHeading('The method');
    addBody(theCase.solution.method);

    scroll.setContentHeight(y);

    new Button(
      this,
      BASE_W / 2,
      764,
      'Play again',
      () => {
        controller.reset();
        this.scene.start(BriefingScene.KEY);
      },
      { primary: true, width: CONTENT_W },
    );
  }
}
