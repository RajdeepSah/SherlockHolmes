import { describe, it, expect } from 'vitest';
import type { Case } from './types';
import { validateCase, assertValidCase } from './validate';
import caseSpeckledBand from '../content/case-speckled-band';

/** A minimal, valid case used as a mutation base for the failure tests. */
function baseCase(): Case {
  return {
    id: 'test-case',
    title: 'Test Case',
    source: 'fixture',
    briefing: 'A briefing.',
    scene: 'A scene.',
    suspects: [
      { id: 'culprit', name: 'The Culprit', blurb: 'Did it.' },
      { id: 'innocent', name: 'The Innocent', blurb: 'Did not.' },
    ],
    clues: [
      { id: 'key1', label: 'Key One', description: '...', location: 'here', source: 'scene', implicates: ['culprit'], redHerring: false },
      { id: 'key2', label: 'Key Two', description: '...', location: 'here', source: 'scene', implicates: ['culprit'], redHerring: false },
      { id: 'herring', label: 'A Herring', description: '...', location: 'here', source: 'scene', implicates: ['innocent'], redHerring: true },
    ],
    solution: { culpritId: 'culprit', motive: 'because', method: 'somehow', keyClueIds: ['key1', 'key2'] },
  };
}

describe('validateCase', () => {
  it('passes the shipped Speckled Band case', () => {
    expect(validateCase(caseSpeckledBand)).toEqual([]);
  });

  it('passes a well-formed fixture case', () => {
    expect(validateCase(baseCase())).toEqual([]);
  });

  it('flags a case with no clues', () => {
    const c = baseCase();
    c.clues = [];
    c.solution.keyClueIds = [];
    expect(validateCase(c).join(' ')).toContain('no clues');
  });

  it('flags a culprit who is not a listed suspect', () => {
    const c = baseCase();
    c.solution.culpritId = 'ghost';
    expect(validateCase(c).some((p) => p.includes('culprit "ghost"'))).toBe(true);
  });

  it('flags a key clue that does not exist', () => {
    const c = baseCase();
    c.solution.keyClueIds = ['key1', 'nope'];
    expect(validateCase(c).some((p) => p.includes('key clue "nope"'))).toBe(true);
  });

  it('flags a key clue that is a red herring', () => {
    const c = baseCase();
    c.solution.keyClueIds = ['key1', 'herring'];
    expect(validateCase(c).some((p) => p.includes('red herring'))).toBe(true);
  });

  it('flags a key clue that does not implicate the culprit', () => {
    const c = baseCase();
    // key2 now points only at the innocent, but is still listed as a key clue.
    c.clues = c.clues.map((cl) => (cl.id === 'key2' ? { ...cl, implicates: ['innocent'] } : cl));
    expect(validateCase(c).some((p) => p.includes('does not implicate the culprit'))).toBe(true);
  });

  it('flags a clue implicating an unknown suspect', () => {
    const c = baseCase();
    c.clues[0]!.implicates = ['phantom'];
    expect(validateCase(c).some((p) => p.includes('unknown suspect "phantom"'))).toBe(true);
  });

  it('flags duplicate clue ids', () => {
    const c = baseCase();
    c.clues.push({ ...c.clues[0]! });
    expect(validateCase(c)).toContain('duplicate clue ids');
  });
});

describe('assertValidCase', () => {
  it('does not throw for a valid case', () => {
    expect(() => assertValidCase(caseSpeckledBand)).not.toThrow();
  });

  it('throws with the case id for an invalid case', () => {
    const c = baseCase();
    c.solution.culpritId = 'ghost';
    expect(() => assertValidCase(c)).toThrow(/test-case/);
  });
});
