# The Speckled Band — a Sherlock deduction game

A mobile-first detective deduction game adapted from the public-domain *Adventures of
Sherlock Holmes*. Examine the scene, gather clues, question suspects, form deductions, and
accuse the culprit — scored on getting the *who* and the *why* right.

## Status

Phase 0 complete and Phase 1 well underway: a pure, fully unit-tested game-logic core
(**31 tests green**, strict typecheck clean) and **two cases** — *The Speckled Band* and
*The Red-Headed League* — authored as data. The presentation layer (Phaser) and generated
art/audio are the next phases. See **`PLAN.md`** for the full roadmap.

## Quickstart

```bash
npm install        # Node >= 20
npm test           # run the deduction engine's test suite
npm run test:watch # TDD loop while developing
npm run typecheck  # strict type check
npm run dev        # web dev server (presentation layer, Phase 2+)
```

## Project layout

```
src/logic/     pure, tested game rules (no DOM/engine) — the heart of the game
src/content/   cases as data (+ registry + validator)
public/        the game page (Phaser mounts here; ships with the deploy)
PLAN.md        roadmap from here to a shippable build
CLAUDE.md      rules for working in the repo (read before changing code)
SKILLS.md      step-by-step playbooks (add a case, deploy, build the APK, ...)
```

## How it's built

TypeScript + Vitest (TDD) for the core, Phaser 3 for presentation, Higgsfield for art and
audio, Capacitor to wrap the web build into an Android APK. The guiding rule: **all game
rules live in the pure core; the UI only renders state and forwards moves; cases are data.**
Adding a new mystery never means changing the engine.

Source text is public domain (Arthur Conan Doyle, 1892), so there are no licensing issues.
