// Menu — the case-select screen. Driven entirely by the content registry's `listCases()`
// (Phase 1 exit criterion), so registering a new case makes it appear here with no UI
// change. Picking a case builds a fresh controller for it and hands off to Boot, which
// preloads that case's art before play. Holds no game rules.

import Phaser from 'phaser';
import { controllerForCase } from './controller';
import { listCases } from '../content/index';
import { getBestScore } from './scores';
import { proceduralBackdrop } from './assets';
import { BASE_W, MARGIN, CONTENT_W, FONT, T } from './theme';
import { ScrollArea, makeListItem, heading } from './ui';
import { BootScene } from './BootScene';

const TOP = 188;
const BOTTOM = 760;
const GAP = 10;

export class MenuScene extends Phaser.Scene {
  static readonly KEY = 'Menu';
  constructor() {
    super(MenuScene.KEY);
  }

  create(): void {
    proceduralBackdrop(this);

    this.add
      .text(BASE_W / 2, 70, 'THE CASEBOOK OF', {
        fontFamily: FONT,
        fontSize: '13px',
        color: T.muted,
        letterSpacing: 4,
      } as Phaser.Types.GameObjects.Text.TextStyle)
      .setOrigin(0.5, 0);
    this.add
      .text(BASE_W / 2, 90, 'Sherlock Holmes', {
        fontFamily: FONT,
        fontSize: '34px',
        color: T.text,
      })
      .setOrigin(0.5, 0);
    this.add
      .text(BASE_W / 2, 140, 'Choose a case to investigate.', {
        fontFamily: FONT,
        fontSize: '14px',
        color: T.muted,
        fontStyle: 'italic',
      })
      .setOrigin(0.5, 0);

    const scroll = new ScrollArea(this, MARGIN, TOP, CONTENT_W, BOTTOM - TOP);
    let y = 0;
    scroll.add(heading(this, 0, 0, 'Cases'), y);
    y += 26;

    for (const c of listCases()) {
      const best = getBestScore(c.id);
      const subtitle = best === undefined ? c.source : `${c.source}  ·  best ${best}`;
      const item = makeListItem(this, {
        width: CONTENT_W,
        title: c.title,
        subtitle,
        onClick: () => this.choose(c.id),
      });
      scroll.add(item.container, y);
      y += item.height + GAP;
    }

    scroll.setContentHeight(y);
  }

  private choose(caseId: string): void {
    const controller = controllerForCase(caseId);
    if (!controller) return; // unknown id — registry is the source of truth
    this.registry.set('controller', controller);
    this.scene.start(BootScene.KEY);
  }
}
