import { describe, it, expect } from 'vitest';
import caseSpeckledBand from '../content/case-speckled-band';
import { scoreAccusation, isDeductionSupported, SCORING } from './deduction';

describe('scoreAccusation', () => {
  it('awards full marks for the right culprit citing every key clue', () => {
    const b = scoreAccusation(caseSpeckledBand, {
      suspectId: 'roylott',
      citedClueIds: ['ventilator', 'bellrope', 'bed', 'whistle', 'will'],
    });
    expect(b.correctCulprit).toBe(true);
    expect(b.keyCluesCited).toBe(5);
    expect(b.keyCluesTotal).toBe(5);
    expect(b.redHerringsCited).toBe(0);
    expect(b.score).toBe(SCORING.correctCulprit + 5 * SCORING.perKeyClue);
  });

  it('gives partial credit for the right culprit with some key clues', () => {
    const b = scoreAccusation(caseSpeckledBand, { suspectId: 'roylott', citedClueIds: ['ventilator', 'bed'] });
    expect(b.correctCulprit).toBe(true);
    expect(b.keyCluesCited).toBe(2);
    expect(b.score).toBe(SCORING.correctCulprit + 2 * SCORING.perKeyClue);
  });

  it('scores zero for accusing the wrong suspect', () => {
    const b = scoreAccusation(caseSpeckledBand, { suspectId: 'band', citedClueIds: ['camp'] });
    expect(b.correctCulprit).toBe(false);
    expect(b.score).toBe(0);
  });

  it('penalises citing a red herring even with the right culprit', () => {
    const b = scoreAccusation(caseSpeckledBand, { suspectId: 'roylott', citedClueIds: ['ventilator', 'camp'] });
    expect(b.redHerringsCited).toBe(1);
    expect(b.score).toBe(SCORING.correctCulprit + 1 * SCORING.perKeyClue - SCORING.redHerringPenalty);
  });

  it('never returns a negative score', () => {
    const b = scoreAccusation(caseSpeckledBand, { suspectId: 'band', citedClueIds: ['camp'] });
    expect(b.score).toBeGreaterThanOrEqual(0);
  });
});

describe('isDeductionSupported', () => {
  it('accepts a deduction backed by a revealed, implicating clue', () => {
    expect(
      isDeductionSupported(
        caseSpeckledBand,
        { id: 'd1', statement: 'The ventilator is a delivery route.', supportingClueIds: ['ventilator'] },
        ['ventilator', 'bed'],
      ),
    ).toBe(true);
  });

  it('rejects a deduction citing a clue that was never revealed', () => {
    expect(
      isDeductionSupported(
        caseSpeckledBand,
        { id: 'd2', statement: 'Pure guesswork.', supportingClueIds: ['ventilator'] },
        [],
      ),
    ).toBe(false);
  });

  it('rejects a deduction resting only on a red herring', () => {
    expect(
      isDeductionSupported(
        caseSpeckledBand,
        { id: 'd3', statement: 'The wanderers did it.', supportingClueIds: ['camp'] },
        ['camp'],
      ),
    ).toBe(false);
  });

  it('rejects an empty deduction', () => {
    expect(isDeductionSupported(caseSpeckledBand, { id: 'd4', statement: '', supportingClueIds: [] }, [])).toBe(false);
  });
});
