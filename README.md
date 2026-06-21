# The Speckled Band — a Sherlock deduction game

A mobile-first detective deduction game adapted from the public-domain *Adventures of
Sherlock Holmes*. Examine the scene, gather clues, question suspects, form deductions, and
accuse the culprit — scored on getting the *who* and the *why* right.

## Status

Phases 0–3 complete: a pure, fully unit-tested game-logic core (**43 tests green** + 1
skipped, strict typecheck + build clean), **two cases** authored as data (*The Speckled
Band* and *The Red-Headed League*), a playable Phaser slice, and generated, compressed art
+ ambient audio (~4.4 MB total). Next is Phase 4 — free web deploy (GitHub Pages / Netlify)
and an Android APK via Capacitor. See **`PLAN.md`** for the full roadmap.

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

TypeScript + Vitest (TDD) for the core, Phaser 3 for presentation, Vite for the static web
build (hosted free on GitHub Pages or Netlify), and Capacitor to wrap the same build into an
Android APK. The guiding rule: **all game rules live in the pure core; the UI only renders
state and forwards moves; cases are data.** Adding a new mystery never means changing the engine.

Source text is public domain (Arthur Conan Doyle, 1892), so there are no licensing issues.
