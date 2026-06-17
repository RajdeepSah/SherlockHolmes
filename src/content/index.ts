// Case registry.
//
// This is the single place that knows which cases exist. The engine, the UI, and
// the case-select screen all look cases up through here. Adding a new case is a
// two-line change: import it, add it to CASES (see SKILLS.md → "Add a new case").
// Cases are DATA; the engine never changes when content is added.

import type { Case } from '../logic/types';
import caseSpeckledBand from './case-speckled-band';
import caseRedHeadedLeague from './case-red-headed-league';

export const CASES: readonly Case[] = [caseSpeckledBand, caseRedHeadedLeague];

export interface CaseSummary {
  id: string;
  title: string;
  source: string;
}

/** Look up a full case by id, or undefined if there is no such case. */
export function getCase(id: string): Case | undefined {
  return CASES.find((c) => c.id === id);
}

/** Lightweight list for a case-select menu (no spoilers — solution omitted). */
export function listCases(): CaseSummary[] {
  return CASES.map(({ id, title, source }) => ({ id, title, source }));
}
