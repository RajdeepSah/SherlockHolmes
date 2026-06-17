import type { Case, GameState, Move, MoveResult, GameEvent } from './types';
import { scoreAccusation } from './deduction';

const PHASE_ORDER = ['briefing', 'investigation', 'deduction', 'accusation', 'resolved'] as const;

export function createInitialState(theCase: Case): GameState {
  return {
    caseId: theCase.id,
    phase: 'briefing',
    revealedClueIds: [],
    interrogated: [],
    deductions: [],
    score: 0,
    turns: 0,
    solved: false,
  };
}

export function isGameOver(state: GameState): boolean {
  return state.phase === 'resolved';
}

function nextPhase(phase: GameState['phase']): GameState['phase'] {
  const i = PHASE_ORDER.indexOf(phase);
  return PHASE_ORDER[Math.min(i + 1, PHASE_ORDER.length - 1)]!;
}

function reject(state: GameState, message: string): MoveResult {
  return { state, events: [{ kind: 'rejected', message }], error: message };
}

/**
 * Pure reducer. Never mutates the incoming state; always returns a fresh one.
 * Every game rule lives here so the UI can stay a thin renderer.
 */
export function applyMove(theCase: Case, state: GameState, move: Move): MoveResult {
  if (isGameOver(state)) return reject(state, 'The case is already resolved.');

  switch (move.type) {
    case 'examine': {
      if (state.phase !== 'investigation')
        return reject(state, 'You can only examine clues during the investigation.');
      const clue = theCase.clues.find((c) => c.id === move.clueId);
      if (!clue) return reject(state, `No such clue: ${move.clueId}`);
      if (state.revealedClueIds.includes(clue.id))
        return reject(state, 'That clue is already in your notes.');
      const events: GameEvent[] = [
        { kind: 'clueRevealed', message: `Examined: ${clue.label}`, data: { clueId: clue.id } },
      ];
      return {
        state: { ...state, revealedClueIds: [...state.revealedClueIds, clue.id], turns: state.turns + 1 },
        events,
      };
    }

    case 'interrogate': {
      if (state.phase !== 'investigation')
        return reject(state, 'You can only interrogate during the investigation.');
      const suspect = theCase.suspects.find((s) => s.id === move.suspectId);
      if (!suspect) return reject(state, `No such suspect: ${move.suspectId}`);
      if (state.interrogated.includes(suspect.id))
        return reject(state, 'You have already questioned that person.');
      return {
        state: { ...state, interrogated: [...state.interrogated, suspect.id], turns: state.turns + 1 },
        events: [
          { kind: 'suspectInterrogated', message: `Questioned: ${suspect.name}`, data: { suspectId: suspect.id } },
        ],
      };
    }

    case 'recordDeduction': {
      if (state.phase !== 'deduction' && state.phase !== 'investigation')
        return reject(state, 'You can only record deductions while investigating or deducing.');
      return {
        state: { ...state, deductions: [...state.deductions, move.deduction] },
        events: [{ kind: 'deductionRecorded', message: `Noted: ${move.deduction.statement}` }],
      };
    }

    case 'accuse': {
      if (state.phase !== 'accusation')
        return reject(state, 'You can only make an accusation in the accusation phase.');
      const suspect = theCase.suspects.find((s) => s.id === move.accusation.suspectId);
      if (!suspect) return reject(state, `No such suspect: ${move.accusation.suspectId}`);
      const breakdown = scoreAccusation(theCase, move.accusation);
      return {
        state: {
          ...state,
          phase: 'resolved',
          accusation: move.accusation,
          score: breakdown.score,
          solved: breakdown.correctCulprit,
          turns: state.turns + 1,
        },
        events: [
          {
            kind: 'accusationResolved',
            message: breakdown.correctCulprit
              ? `Correct. ${suspect.name} is the culprit. Score: ${breakdown.score}.`
              : `Wrong. ${suspect.name} is not the culprit. Score: ${breakdown.score}.`,
            data: { correctCulprit: breakdown.correctCulprit, score: breakdown.score },
          },
        ],
      };
    }

    case 'advancePhase': {
      const np = nextPhase(state.phase);
      return { state: { ...state, phase: np }, events: [{ kind: 'phaseChanged', message: `Phase: ${np}` }] };
    }

    default: {
      const _never: never = move; // exhaustiveness guard
      return reject(state, 'Unknown move.');
    }
  }
}

/** Convenience for UI and AI players: what can be done right now. */
export function getAvailableMoves(theCase: Case, state: GameState): Move[] {
  switch (state.phase) {
    case 'investigation':
      return [
        ...theCase.clues
          .filter((c) => !state.revealedClueIds.includes(c.id))
          .map((c) => ({ type: 'examine', clueId: c.id }) as const),
        ...theCase.suspects
          .filter((s) => !state.interrogated.includes(s.id))
          .map((s) => ({ type: 'interrogate', suspectId: s.id }) as const),
        { type: 'advancePhase' } as const,
      ];
    case 'briefing':
    case 'deduction':
      return [{ type: 'advancePhase' } as const];
    case 'accusation':
      return theCase.suspects.map(
        (s) => ({ type: 'accuse', accusation: { suspectId: s.id, citedClueIds: [...state.revealedClueIds] } }) as const,
      );
    case 'resolved':
      return [];
  }
}
