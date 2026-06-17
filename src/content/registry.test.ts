import { describe, it, expect } from 'vitest';
import { CASES, getCase, listCases } from './index';
import { validateCase } from '../logic/validate';

describe('case registry', () => {
  it('finds a registered case by id', () => {
    expect(getCase('speckled-band')?.title).toBe('The Speckled Band');
  });

  it('returns undefined for an unknown id', () => {
    expect(getCase('no-such-case')).toBeUndefined();
  });

  it('lists every registered case as a spoiler-free summary', () => {
    const summaries = listCases();
    expect(summaries.map((s) => s.id)).toContain('speckled-band');
    // Summaries must not leak the solution.
    expect(Object.keys(summaries[0]!)).toEqual(['id', 'title', 'source']);
  });

  it('every registered case is structurally valid', () => {
    for (const c of CASES) {
      expect(validateCase(c), `case "${c.id}" must be structurally valid`).toEqual([]);
    }
  });
});
