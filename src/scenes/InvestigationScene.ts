// Investigation — examine clues and question suspects. Every action is a Move
// forwarded to the core; the scene re-reads the resulting state to redraw. It never
// decides what a clue means or whether the case is solved.

import Phaser from 'phaser';
import type { GameController } from './controller';
import { BASE_W, MARGIN, CONTENT_W, FONT, T } from './theme';
import { Button, ScrollArea, makeListItem, heading } from './ui';
import { applyBackdrop, portraitKey } from './assets';
import { DeductionScene } from './DeductionScene';

const TOP = 96;
const BOTTOM = 712;
const GAP = 8;

export class InvestigationScene extends Phaser.Scene {
  static readonly KEY = 'Investigation';
  private controller!: GameController;
  private scroll!: ScrollArea;
  private turnText!: Phaser.GameObjects.Text;

  constructor() {
    super(InvestigationScene.KEY);
  }

  create(): void {
    this.controller = this.registry.get('controller') as GameController;
    applyBackdrop(this, 'investigation');

    this.add.text(MARGIN, 36, 'Investigation', {
      fontFamily: FONT,
      fontSize: '26px',
      color: T.text,
    });
    this.add.text(MARGIN, 70, 'Examine the scene and question those present.', {
      fontFamily: FONT,
      fontSize: '13px',
      color: T.muted,
    });
    this.turnText = this.add
      .text(BASE_W - MARGIN, 44, '', {
        fontFamily: FONT,
        fontSize: '12px',
        color: T.muted,
      })
      .setOrigin(1, 0);

    this.scroll = new ScrollArea(this, MARGIN, TOP, CONTENT_W, BOTTOM - TOP);

    new Button(
      this,
      BASE_W / 2,
      760,
      'Proceed to Deduction',
      () => {
        this.controller.dispatch({ type: 'advancePhase' }); // investigation → deduction
        this.scene.start(DeductionScene.KEY);
      },
      { primary: true, width: CONTENT_W },
    );

    this.rebuild();
  }

  private rebuild(): void {
    const { theCase } = this.controller;
    const state = this.controller.state;
    this.turnText.setText(`${state.turns} ${state.turns === 1 ? 'turn' : 'turns'}`);

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

    // Leads still to examine.
    const unexamined = theCase.clues.filter((c) => !state.revealedClueIds.includes(c.id));
    addHeading('Leads to examine');
    if (unexamined.length === 0) {
      addNote('Every lead has been examined.');
    } else {
      for (const clue of unexamined) {
        addRow(
          makeListItem(this, {
            width: CONTENT_W,
            title: clue.label,
            subtitle: `${clue.location} · tap to examine`,
            onClick: () => {
              this.controller.dispatch({ type: 'examine', clueId: clue.id });
              this.rebuild();
            },
          }),
        );
      }
    }

    // People to question.
    addHeading('Persons of interest');
    for (const s of theCase.suspects) {
      const done = state.interrogated.includes(s.id);
      addRow(
        makeListItem(this, {
          width: CONTENT_W,
          title: s.name,
          subtitle: done ? 'Questioned.' : s.blurb,
          avatar: { textureKey: portraitKey(s.id), initial: s.name },
          selected: done,
          disabled: done,
          onClick: done
            ? undefined
            : () => {
                this.controller.dispatch({ type: 'interrogate', suspectId: s.id });
                this.rebuild();
              },
        }),
      );
    }

    // The notebook: everything revealed so far.
    addHeading('Notebook');
    if (state.revealedClueIds.length === 0) {
      addNote('Nothing recorded yet. Examine the scene to gather clues.');
    } else {
      for (const id of state.revealedClueIds) {
        const clue = theCase.clues.find((c) => c.id === id)!;
        addRow(
          makeListItem(this, {
            width: CONTENT_W,
            title: clue.label,
            subtitle: clue.description,
          }),
        );
      }
    }

    this.scroll.setContentHeight(y);
  }
}
