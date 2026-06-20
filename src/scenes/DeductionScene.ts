// Deduction — assemble revealed clues into statements. The scene composes a
// `Deduction` from the player's selection and forwards a `recordDeduction` move.
// It uses the core's `isDeductionSupported` only to LABEL a deduction for the player;
// the authoritative scoring still happens later, in the core, at accusation time.

import Phaser from 'phaser';
import type { GameController } from './controller';
import type { Deduction } from '../logic/types';
import { isDeductionSupported } from '../logic/deduction';
import { BASE_W, MARGIN, CONTENT_W, FONT, T } from './theme';
import { Button, ScrollArea, makeListItem, heading } from './ui';
import { AccusationScene } from './AccusationScene';

const TOP = 96;
const BOTTOM = 684;
const GAP = 8;

export class DeductionScene extends Phaser.Scene {
  static readonly KEY = 'Deduction';
  private controller!: GameController;
  private scroll!: ScrollArea;
  private recordBtn!: Button;
  private readonly selected = new Set<string>();
  private counter = 0;

  constructor() {
    super(DeductionScene.KEY);
  }

  create(): void {
    this.controller = this.registry.get('controller') as GameController;
    this.selected.clear();
    this.counter = 0;

    this.add.text(MARGIN, 36, 'Deduction', {
      fontFamily: FONT,
      fontSize: '26px',
      color: T.text,
    });
    this.add.text(MARGIN, 70, 'Select clues that share a single explanation.', {
      fontFamily: FONT,
      fontSize: '13px',
      color: T.muted,
    });

    this.scroll = new ScrollArea(this, MARGIN, TOP, CONTENT_W, BOTTOM - TOP);

    this.recordBtn = new Button(
      this,
      BASE_W / 2,
      712,
      'Record deduction',
      () => this.record(),
      { width: CONTENT_W, height: 46, fontSize: 16 },
    );
    new Button(
      this,
      BASE_W / 2,
      764,
      'Proceed to Accusation',
      () => {
        this.controller.dispatch({ type: 'advancePhase' }); // deduction → accusation
        this.scene.start(AccusationScene.KEY);
      },
      { primary: true, width: CONTENT_W },
    );

    this.rebuild();
  }

  private record(): void {
    if (this.selected.size === 0) return;
    const ids = [...this.selected];
    const labels = ids.map((id) => this.controller.theCase.clues.find((c) => c.id === id)!.label);
    const deduction: Deduction = {
      id: `d${++this.counter}`,
      statement: `One hand connects: ${labels.join(', ')}.`,
      supportingClueIds: ids,
    };
    this.controller.dispatch({ type: 'recordDeduction', deduction });
    this.selected.clear();
    this.rebuild();
  }

  private toggle(id: string): void {
    if (this.selected.has(id)) this.selected.delete(id);
    else this.selected.add(id);
    this.rebuild();
  }

  private rebuild(): void {
    const { theCase } = this.controller;
    const state = this.controller.state;
    this.recordBtn.setEnabled(this.selected.size > 0);

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

    addHeading('Clues in evidence');
    if (state.revealedClueIds.length === 0) {
      addNote('You gathered no clues. Deductions need evidence to stand on.');
    } else {
      for (const id of state.revealedClueIds) {
        const clue = theCase.clues.find((c) => c.id === id)!;
        addRow(
          makeListItem(this, {
            width: CONTENT_W,
            title: clue.label,
            subtitle: clue.description,
            marker: 'toggle',
            selected: this.selected.has(id),
            onClick: () => this.toggle(id),
          }),
        );
      }
    }

    addHeading('Deductions recorded');
    if (state.deductions.length === 0) {
      addNote('None yet. Pick clues above and record what they reveal.');
    } else {
      for (const d of state.deductions) {
        const sound = isDeductionSupported(theCase, d, state.revealedClueIds);
        addRow(
          makeListItem(this, {
            width: CONTENT_W,
            title: `${sound ? '✓ sound' : '✗ thin'} — ${d.statement}`,
            selected: sound,
          }),
        );
      }
    }

    this.scroll.setContentHeight(y);
  }
}
