// Pure structural validator for Case content. No DOM, no I/O.
//
// Content authors and the test suite use this to catch malformed cases BEFORE
// they ship. It is the safety net that lets new cases be added as plain data
// (see SKILLS.md → "Add a new case") without fear of silently breaking a puzzle.

import type { Case } from './types';

/**
 * Check a case for structural problems.
 * @returns a list of human-readable problems. An empty array means the case is valid.
 * Pure: identical input always yields identical output.
 */
export function validateCase(c: Case): string[] {
  const problems: string[] = [];

  const clueIds = new Set(c.clues.map((cl) => cl.id));
  const suspectIds = new Set(c.suspects.map((s) => s.id));
  const clueById = new Map(c.clues.map((cl) => [cl.id, cl]));

  if (!c.id.trim()) problems.push('case id is empty');
  if (!c.title.trim()) problems.push('case title is empty');
  if (c.suspects.length === 0) problems.push('case has no suspects');
  if (c.clues.length === 0) problems.push('case has no clues');

  if (clueIds.size !== c.clues.length) problems.push('duplicate clue ids');
  if (suspectIds.size !== c.suspects.length) problems.push('duplicate suspect ids');

  // Every clue must implicate suspects that actually exist.
  for (const clue of c.clues) {
    for (const sid of clue.implicates) {
      if (!suspectIds.has(sid)) {
        problems.push(`clue "${clue.id}" implicates unknown suspect "${sid}"`);
      }
    }
  }

  // The solution must point at a real suspect and rest on real, fair key clues.
  if (!suspectIds.has(c.solution.culpritId)) {
    problems.push(`solution culprit "${c.solution.culpritId}" is not a listed suspect`);
  }
  if (c.solution.keyClueIds.length === 0) {
    problems.push('solution lists no key clues');
  }
  for (const kid of c.solution.keyClueIds) {
    const clue = clueById.get(kid);
    if (!clue) {
      problems.push(`key clue "${kid}" is not a listed clue`);
      continue;
    }
    if (clue.redHerring) {
      problems.push(`key clue "${kid}" is marked as a red herring — a solution must not rest on one`);
    }
    if (!clue.implicates.includes(c.solution.culpritId)) {
      problems.push(`key clue "${kid}" does not implicate the culprit "${c.solution.culpritId}"`);
    }
  }

  return problems;
}

/** Throw if a case is invalid. Handy as a guard at content-load time. */
export function assertValidCase(c: Case): void {
  const problems = validateCase(c);
  if (problems.length > 0) {
    throw new Error(`Invalid case "${c.id}":\n - ${problems.join('\n - ')}`);
  }
}
