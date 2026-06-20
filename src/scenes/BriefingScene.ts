// Briefing — the opening. Shows the case framing, then forwards a single
// `advancePhase` move and hands off to the investigation. No rules here.

import Phaser from 'phaser';
import type { GameController } from './controller';
import { BASE_W, MARGIN, CONTENT_W, FONT, T } from './theme';
import { Button } from './ui';
import { applyBackdrop } from './assets';
import { InvestigationScene } from './InvestigationScene';

export class BriefingScene extends Phaser.Scene {
  static readonly KEY = 'Briefing';
  constructor() {
    super(BriefingScene.KEY);
  }

  create(): void {
    const controller = this.registry.get('controller') as GameController;
    const c = controller.theCase;
    applyBackdrop(this, 'briefing');

    this.add.text(MARGIN, 40, c.title, {
      fontFamily: FONT,
      fontSize: '30px',
      color: T.text,
    });
    this.add.text(MARGIN, 80, c.source, {
      fontFamily: FONT,
      fontSize: '13px',
      color: T.muted,
      fontStyle: 'italic',
    });

    let y = 120;
    const briefing = this.add.text(MARGIN, y, c.briefing, {
      fontFamily: FONT,
      fontSize: '17px',
      color: T.text,
      lineSpacing: 6,
      wordWrap: { width: CONTENT_W },
    });
    y += briefing.height + 24;

    this.add.text(MARGIN, y, 'THE SCENE', {
      fontFamily: FONT,
      fontSize: '12px',
      color: T.muted,
      letterSpacing: 2,
    } as Phaser.Types.GameObjects.Text.TextStyle);
    y += 22;
    this.add.text(MARGIN, y, c.scene, {
      fontFamily: FONT,
      fontSize: '15px',
      color: T.muted,
      fontStyle: 'italic',
      lineSpacing: 5,
      wordWrap: { width: CONTENT_W },
    });

    new Button(
      this,
      BASE_W / 2,
      720,
      'Begin the Investigation',
      () => {
        controller.dispatch({ type: 'advancePhase' }); // briefing → investigation
        this.scene.start(InvestigationScene.KEY);
      },
      { primary: true, width: CONTENT_W },
    );
  }
}
