import { describe, it, expect } from 'vitest';
import { GameController } from './controller';
import caseSpeckledBand from '../content/case-speckled-band';

const firstClueId = caseSpeckledBand.clues[0]!.id;

describe('GameController (thin UI seam)', () => {
  it('starts a fresh case in the briefing phase', () => {
    const c = new GameController(caseSpeckledBand);
    expect(c.theCase).toBe(caseSpeckledBand);
    expect(c.state.phase).toBe('briefing');
    expect(c.state.revealedClueIds).toEqual([]);
    expect(c.log).toEqual([]);
    expect(c.isOver).toBe(false);
  });

  it('forwards moves to the core and adopts the new state', () => {
    const c = new GameController(caseSpeckledBand);
    c.dispatch({ type: 'advancePhase' });
    expect(c.state.phase).toBe('investigation');

    const result = c.dispatch({ type: 'examine', clueId: firstClueId });
    expect(result.error).toBeUndefined();
    expect(c.state.revealedClueIds).toContain(firstClueId);
  });

  it('accumulates the event log across moves', () => {
    const c = new GameController(caseSpeckledBand);
    c.dispatch({ type: 'advancePhase' });
    c.dispatch({ type: 'examine', clueId: firstClueId });
    expect(c.log.map((e) => e.kind)).toEqual(['phaseChanged', 'clueRevealed']);
  });

  it('does not change state when the core rejects a move', () => {
    const c = new GameController(caseSpeckledBand);
    const before = c.state;
    const result = c.dispatch({ type: 'examine', clueId: 'nope' }); // illegal in briefing
    expect(result.error).toBeDefined();
    expect(c.state).toBe(before); // engine returns the same state object on rejection
    expect(c.log.at(-1)?.kind).toBe('rejected');
  });

  it('delegates available moves to the core for the current phase', () => {
    const c = new GameController(caseSpeckledBand);
    expect(c.availableMoves()).toEqual([{ type: 'advancePhase' }]); // briefing
    c.dispatch({ type: 'advancePhase' });
    const kinds = new Set(c.availableMoves().map((m) => m.type));
    expect(kinds).toContain('examine');
    expect(kinds).toContain('interrogate');
  });

  it('notifies subscribers on dispatch and stops after unsubscribe', () => {
    const c = new GameController(caseSpeckledBand);
    let hits = 0;
    const off = c.subscribe(() => hits++);
    c.dispatch({ type: 'advancePhase' });
    expect(hits).toBe(1);
    off();
    c.dispatch({ type: 'advancePhase' });
    expect(hits).toBe(1);
  });

  it('reset returns to a clean initial state', () => {
    const c = new GameController(caseSpeckledBand);
    c.dispatch({ type: 'advancePhase' });
    c.dispatch({ type: 'examine', clueId: firstClueId });
    c.reset();
    expect(c.state.phase).toBe('briefing');
    expect(c.state.revealedClueIds).toEqual([]);
    expect(c.log).toEqual([]);
  });
});
