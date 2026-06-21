// Public entry for the pure game-logic module — the single import surface for the
// presentation layer and tests. It re-exports the domain types, the engine reducer,
// scoring, the content validator, and the case registry. Keeping logic behind one
// barrel keeps the dependency rule (presentation → logic → nothing) easy to enforce.
export * from './types';
export { createInitialState, applyMove, isGameOver, getAvailableMoves } from './engine';
export { scoreAccusation, isDeductionSupported, SCORING } from './deduction';
export { validateCase, assertValidCase } from './validate';
export { CASES, getCase, listCases } from '../content/index';
export type { CaseSummary } from '../content/index';
export { default as caseSpeckledBand } from '../content/case-speckled-band';
