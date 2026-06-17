import type { Case, Accusation, Deduction } from './types';

export interface AccusationBreakdown {
  correctCulprit: boolean;
  keyCluesCited: number;
  keyCluesTotal: number;
  redHerringsCited: number;
  score: number;
}

export const SCORING = {
  correctCulprit: 100,
  perKeyClue: 25,
  redHerringPenalty: 15,
} as const;

/**
 * Score an accusation against the case solution.
 * Pure: identical inputs always yield identical output.
 */
export function scoreAccusation(theCase: Case, accusation: Accusation): AccusationBreakdown {
  const { solution } = theCase;
  const correctCulprit = accusation.suspectId === solution.culpritId;

  const keyClueSet = new Set(solution.keyClueIds);
  const cited = new Set(accusation.citedClueIds);
  const keyCluesCited = [...cited].filter((id) => keyClueSet.has(id)).length;

  const redHerringIds = new Set(theCase.clues.filter((c) => c.redHerring).map((c) => c.id));
  const redHerringsCited = [...cited].filter((id) => redHerringIds.has(id)).length;

  let score = 0;
  if (correctCulprit) {
    score += SCORING.correctCulprit;
    score += keyCluesCited * SCORING.perKeyClue;
  }
  score -= redHerringsCited * SCORING.redHerringPenalty;
  if (score < 0) score = 0;

  return {
    correctCulprit,
    keyCluesCited,
    keyCluesTotal: solution.keyClueIds.length,
    redHerringsCited,
    score,
  };
}

/**
 * A deduction is "supported" when every clue it cites has actually been revealed
 * and at least one cited clue does real inferential work (implicates someone and
 * is not a red herring).
 */
export function isDeductionSupported(
  theCase: Case,
  deduction: Deduction,
  revealedClueIds: readonly string[],
): boolean {
  if (deduction.supportingClueIds.length === 0) return false;
  const revealed = new Set(revealedClueIds);
  if (!deduction.supportingClueIds.every((id) => revealed.has(id))) return false;

  const clueById = new Map(theCase.clues.map((c) => [c.id, c]));
  return deduction.supportingClueIds.some((id) => {
    const clue = clueById.get(id);
    return !!clue && clue.implicates.length > 0 && !clue.redHerring;
  });
}
