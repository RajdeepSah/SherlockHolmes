// Accusation — name a culprit and cite the evidence. The scene only assembles the
// `Accusation` and forwards it; the core scores it and decides the outcome.

import Phaser from 'phaser';
import type { GameController } from './controller';
import { BASE_W, MARGIN, CONTENT_W, FONT, T } from './theme';
import { Button, ScrollArea, makeListItem, heading } from './ui';
import { ResolutionScene } from './ResolutionScene';

const TOP = 96;
const BOTTOM = 736;
const GAP = 8;

export class AccusationScene extends Phaser.Scene {
  static readonly KEY = 'Accusation';
  private controller!: GameController;
  private scroll!: ScrollArea;
  private accuseBtn!: Button;
  private selectedSuspect: string | null = null;
  private readonly cited = new Set<string>();

  constructor() {
    super(AccusationScene.KEY);
  }

  create(): void {
    this.controller = this.registry.get('controller') as GameController;
    this.selectedSuspect = null;
    this.cited.clear();

    this.add.text(MARGIN, 36, 'Accusation', {
      fontFamily: FONT,
      fontSize: '26px',
      color: T.text,
    });
    this.add.text(MARGIN, 70, 'Name the culprit and cite the clues that damn them.', {
      fontFamily: FONT,
      fontSize: '13px',
      color: T.muted,
    });

    this.scroll = new ScrollArea(this, MARGIN, TOP, CONTENT_W, BOTTOM - TOP);

    this.accuseBtn = new Button(
      this,
      BASE_W / 2,
      768,
      'Make the accusation',
      () => this.accuse(),
      { primary: true, width: CONTENT_W },
    );

    this.rebuild();
  }

  private accuse(): void {
    if (!this.selectedSuspect) return;
    this.controller.dispatch({
      type: 'accuse',
      accusation: { suspectId: this.selectedSuspect, citedClueIds: [...this.cited] },
    });
    this.scene.start(ResolutionScene.KEY);
  }

  private rebuild(): void {
    const { theCase } = this.controller;
    const state = this.controller.state;
    this.accuseBtn.setEnabled(this.selectedSuspect !== null);

    this.scroll.clear();
    let y = 0;
    const addRow = (item: { container: Phaser.GameObjects.Container; height: number }) => {
      this.scroll.add(item.container, y);
      y += item.height + GAP;
    };
    const addHeading = (label: string) => {
      if (y > 0) y += 8;
      this.scroll.add(heading(this, 0, 0, label), y);
      y += 24;
    };
    const addNote = (text: string) => {
      const t = this.add.text(0, 0, text, {
        fontFamily: FONT,
        fontSize: '13px',
        color: T.muted,
        fontStyle: 'italic',
        wordWrap: { width: CONTENT_W },
      });
      this.scroll.add(t, y);
      y += t.height + GAP;
    };

    addHeading('Name the culprit');
    for (const s of theCase.suspects) {
      addRow(
        makeListItem(this, {
          width: CONTENT_W,
          title: s.name,
          subtitle: s.blurb,
          marker: 'toggle',
          selected: this.selectedSuspect === s.id,
          onClick: () => {
            this.selectedSuspect = s.id;
            this.rebuild();
          },
        }),
      );
    }

    addHeading('Cite your evidence');
    if (state.revealedClueIds.length === 0) {
      addNote('You gathered no clues to cite. An accusation will rest on nothing.');
    } else {
      for (const id of state.revealedClueIds) {
        const clue = theCase.clues.find((c) => c.id === id)!;
        addRow(
          makeListItem(this, {
            width: CONTENT_W,
            title: clue.label,
            subtitle: clue.description,
            marker: 'toggle',
            selected: this.cited.has(id),
            onClick: () => {
              if (this.cited.has(id)) this.cited.delete(id);
              else this.cited.add(id);
              this.rebuild();
            },
          }),
        );
      }
    }

    this.scroll.setContentHeight(y);
  }
}
