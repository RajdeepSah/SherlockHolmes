// Public entry for the pure game-logic module.
//
// Phase 4: this file is bundled to `dist/logic.js` to satisfy the Higgsfield deploy
// contract (zip root: logic.js + index.html). The exact exported interface Higgsfield
// expects will be confirmed against its `references/build-game.md` (via
// get_game_creation_instructions) before the first deploy, and adapted here.
export * from './types';
export { createInitialState, applyMove, isGameOver, getAvailableMoves } from './engine';
export { scoreAccusation, isDeductionSupported, SCORING } from './deduction';
export { validateCase, assertValidCase } from './validate';
export { CASES, getCase, listCases } from '../content/index';
export type { CaseSummary } from '../content/index';
export { default as caseSpeckledBand } from '../content/case-speckled-band';
