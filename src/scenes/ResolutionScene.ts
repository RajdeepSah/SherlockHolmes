// Resolution — the verdict. Reads the resolved state the core produced (score, solved,
// accusation) and reveals the solution. It re-derives the score *breakdown* via the pure
// `scoreAccusation` for display only; the authoritative result lives in `state`.

import Phaser from 'phaser';
import type { GameController } from './controller';
import { scoreAccusation } from '../logic/deduction';
import { BASE_W, MARGIN, CONTENT_W, FONT, T } from './theme';
import { Button, ScrollArea, heading } from './ui';
import { applyBackdrop, Ambience } from './assets';
import { recordScore, getBestScore } from './scores';
import { BriefingScene } from './BriefingScene';
import { MenuScene } from './MenuScene';

const TOP = 150;
const BOTTOM = 686;

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
    // Persist the best score for this case (display convenience; not a game rule).
    const prevBest = getBestScore(theCase.id);
    recordScore(theCase.id, state.score);
    const isNewBest = state.score > 0 && (prevBest === undefined || state.score > prevBest);

    this.add.text(MARGIN, 86, `Score  ${state.score}`, {
      fontFamily: FONT,
      fontSize: '20px',
      color: T.text,
    });
    if (isNewBest) {
      this.add
        .text(BASE_W - MARGIN, 92, 'NEW BEST', {
          fontFamily: FONT,
          fontSize: '12px',
          color: T.accent,
          letterSpacing: 2,
        } as Phaser.Types.GameObjects.Text.TextStyle)
        .setOrigin(1, 0);
    }

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
      716,
      'Play this case again',
      () => {
        controller.reset();
        this.scene.start(BriefingScene.KEY);
      },
      { primary: true, width: CONTENT_W },
    );
    new Button(
      this,
      BASE_W / 2,
      766,
      'Back to cases',
      () => this.scene.start(MenuScene.KEY),
      { width: CONTENT_W, height: 46, fontSize: 16 },
    );
  }
}
