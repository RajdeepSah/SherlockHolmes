import { describe, it, expect } from 'vitest';
import caseSpeckledBand from '../content/case-speckled-band';
import { createInitialState, applyMove, isGameOver, getAvailableMoves } from './engine';

function toInvestigation() {
  return applyMove(caseSpeckledBand, createInitialState(caseSpeckledBand), { type: 'advancePhase' }).state;
}

describe('engine', () => {
  it('starts in the briefing phase with empty notes', () => {
    const s = createInitialState(caseSpeckledBand);
    expect(s.phase).toBe('briefing');
    expect(s.revealedClueIds).toEqual([]);
    expect(isGameOver(s)).toBe(false);
  });

  it('treats the reducer as pure (input state is never mutated)', () => {
    const investigation = toInvestigation();
    const r = applyMove(caseSpeckledBand, investigation, { type: 'examine', clueId: 'ventilator' });
    expect(investigation.revealedClueIds).toEqual([]); // original untouched
    expect(r.state.revealedClueIds).toEqual(['ventilator']);
  });

  it('refuses to examine clues outside the investigation phase', () => {
    const r = applyMove(caseSpeckledBand, createInitialState(caseSpeckledBand), { type: 'examine', clueId: 'ventilator' });
    expect(r.error).toBeDefined();
    expect(r.state.revealedClueIds).toEqual([]);
  });

  it('reveals a clue once and rejects a duplicate examination', () => {
    const first = applyMove(caseSpeckledBand, toInvestigation(), { type: 'examine', clueId: 'bed' });
    expect(first.state.revealedClueIds).toContain('bed');
    const dup = applyMove(caseSpeckledBand, first.state, { type: 'examine', clueId: 'bed' });
    expect(dup.error).toBeDefined();
    expect(dup.state.revealedClueIds).toEqual(['bed']);
  });

  it('walks briefing -> investigation -> deduction -> accusation', () => {
    let s = createInitialState(caseSpeckledBand);
    s = applyMove(caseSpeckledBand, s, { type: 'advancePhase' }).state;
    expect(s.phase).toBe('investigation');
    s = applyMove(caseSpeckledBand, s, { type: 'advancePhase' }).state;
    expect(s.phase).toBe('deduction');
    s = applyMove(caseSpeckledBand, s, { type: 'advancePhase' }).state;
    expect(s.phase).toBe('accusation');
  });

  it('resolves correctly when the right culprit is accused', () => {
    let s = createInitialState(caseSpeckledBand);
    for (let i = 0; i < 3; i++) s = applyMove(caseSpeckledBand, s, { type: 'advancePhase' }).state;
    const r = applyMove(caseSpeckledBand, s, {
      type: 'accuse',
      accusation: { suspectId: 'roylott', citedClueIds: ['ventilator', 'bellrope', 'bed', 'whistle', 'will'] },
    });
    expect(r.state.phase).toBe('resolved');
    expect(r.state.solved).toBe(true);
    expect(r.state.score).toBeGreaterThan(0);
    expect(isGameOver(r.state)).toBe(true);
  });

  it('offers no moves once the case is resolved', () => {
    let s = createInitialState(caseSpeckledBand);
    for (let i = 0; i < 3; i++) s = applyMove(caseSpeckledBand, s, { type: 'advancePhase' }).state;
    const r = applyMove(caseSpeckledBand, s, { type: 'accuse', accusation: { suspectId: 'roylott', citedClueIds: [] } });
    expect(getAvailableMoves(caseSpeckledBand, r.state)).toEqual([]);
  });
});
