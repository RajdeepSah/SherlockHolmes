// Core domain types for the Sherlock deduction engine.
//
// This module is PURE: no DOM, no Phaser, no I/O. It is the unit-tested heart of
// the game and the basis for the deployable `logic.js` module (Higgsfield contract).
// Game RULES live here and in engine.ts — never in the presentation layer.

export type Phase = 'briefing' | 'investigation' | 'deduction' | 'accusation' | 'resolved';

export interface Suspect {
  id: string;
  name: string;
  blurb: string;
  /** Higgsfield-generated portrait asset path, filled in during Phase 3. */
  portrait?: string;
}

export type ClueSource = 'scene' | 'interrogation' | 'document';

export interface Clue {
  id: string;
  label: string;
  description: string;
  /** Where the clue is found. */
  location: string;
  source: ClueSource;
  /** Suspect ids this clue implicates, if any. */
  implicates: string[];
  /** Looks relevant but misleads. Citing it in an accusation is penalised. */
  redHerring: boolean;
}

export interface Solution {
  culpritId: string;
  motive: string;
  method: string;
  /** The clues a sound accusation should rest on. */
  keyClueIds: string[];
}

export interface Case {
  id: string;
  title: string;
  source: string;
  briefing: string;
  scene: string;
  suspects: Suspect[];
  clues: Clue[];
  solution: Solution;
}

export interface Deduction {
  id: string;
  statement: string;
  supportingClueIds: string[];
}

export interface Accusation {
  suspectId: string;
  citedClueIds: string[];
}

export type Move =
  | { type: 'examine'; clueId: string }
  | { type: 'interrogate'; suspectId: string }
  | { type: 'recordDeduction'; deduction: Deduction }
  | { type: 'accuse'; accusation: Accusation }
  | { type: 'advancePhase' };

export interface GameState {
  caseId: string;
  phase: Phase;
  revealedClueIds: string[];
  interrogated: string[];
  deductions: Deduction[];
  accusation?: Accusation;
  score: number;
  turns: number;
  solved: boolean;
}

export interface GameEvent {
  kind:
    | 'clueRevealed'
    | 'suspectInterrogated'
    | 'deductionRecorded'
    | 'phaseChanged'
    | 'accusationResolved'
    | 'rejected';
  message: string;
  data?: Record<string, unknown>;
}

export interface MoveResult {
  state: GameState;
  events: GameEvent[];
  error?: string;
}
