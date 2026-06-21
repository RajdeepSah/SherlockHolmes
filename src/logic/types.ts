// Core domain types for the Sherlock deduction engine.
//
// This module is PURE: no DOM, no Phaser, no I/O. It is the unit-tested heart of
// the game and the single import surface for the presentation layer (see logic/index.ts).
// Game RULES live here and in engine.ts — never in the presentation layer.

export type Phase = 'briefing' | 'investigation' | 'deduction' | 'accusation' | 'resolved';

export interface Suspect {
  id: string;
  name: string;
  blurb: string;
  /** Portrait asset path (runtime `assets/...` form), added in Phase 3. */
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

/**
 * Optional presentation assets for a case (Phase 3). These are
 * just *paths* — pure data. The logic core never loads them; the UI does, and degrades
 * gracefully when a field is absent. Keeping them optional means content without art
 * still validates and still plays.
 */
export interface CaseArt {
  /** Per-phase backdrop image paths. Any phase may be omitted. */
  scenery?: Partial<Record<Phase, string>>;
  /** Ambient audio paths. */
  ambience?: {
    /** Looping background atmosphere. */
    loop?: string;
    /** One-shot tension sting (e.g. on the verdict). */
    sting?: string;
  };
  /** 16:9 cover/thumbnail, reused at deploy time (Phase 4). */
  cover?: string;
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
  /** Optional Phase 3 art/audio. Absence is fine — the UI falls back to a procedural look. */
  art?: CaseArt;
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
