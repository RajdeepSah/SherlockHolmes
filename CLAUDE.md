# CLAUDE.md — how to work in this repo

Read this first. It is the contract for any AI (or human) making changes here. `PLAN.md`
is the roadmap; `SKILLS.md` is the cookbook; this file is the rulebook.

> **Best run from Claude Code.** This is a multi-file TDD project: the natural loop is
> edit → `npm run test:watch` → repeat, with the repo on disk. Plain chat can plan and
> draft, but the build itself wants a terminal. The Higgsfield MCP tools used in Phases
> 3–4 are approval-/network-gated — see the note at the bottom.

---

## What this is

A TypeScript detective deduction game (Sherlock, public-domain source). **Current state:
Phase 0–2 complete + Phase 3 groundwork — playable Phaser slice in the browser with an
asset pipeline and procedural fallback (locked style in `STYLE.md`); real Higgsfield
generation is blocked on credits. 39 tests green, typecheck clean.** See `PLAN.md §6`.

## The golden rules (do not break these)

1. **The logic core is pure.** Nothing in `src/logic/**` may import Phaser, touch the DOM,
   read files, use `Date.now()`/`Math.random()` directly, or do any I/O. Same input →
   same output, always. This is what makes it testable and reusable as `logic.js`.
2. **All rules live in the core.** Phase logic, scoring, what's legal when — that belongs
   in `engine.ts`/`deduction.ts`. The UI must never decide game outcomes; it renders state
   and forwards `Move`s.
3. **State is immutable.** `applyMove()` returns a *new* `GameState`; it never mutates its
   input. There is a test that enforces this — keep it green.
4. **Content is data.** New cases/clues/suspects are data in `src/content/**`. Adding
   content must not require changing the engine. If it seems to, the model is wrong — stop
   and reconsider before adding engine code.
5. **Test first.** Write the failing test, watch it fail, then implement. No new behaviour
   without a test that pins it.
6. **Stay lean.** Do not add dependencies casually. The stack in `package.json` is
   intentionally minimal. A new dep needs a one-line justification.

## Architecture map (where things go)

- New **rule / scoring / move** → `src/logic/` (+ test alongside it).
- New **case / clue / suspect** → `src/content/` (+ it must pass `validateCase`).
- New **screen / animation / input** → `src/scenes/` (Phase 2; thin; no rules).
- New **art / audio path** → referenced from content fields (e.g. `Suspect.portrait`),
  never hard-coded inside `src/logic`.

## Commands

```bash
npm install            # restore deps (Node >= 20)
npm run test:watch     # the TDD loop — keep this open while coding
npm test               # full suite once (CI gate)
npm run test:cov       # coverage report (logic core)
npm run typecheck      # tsc --noEmit (CI gate)
npm run dev            # Vite dev server (Phase 2+)
npm run build          # production web bundle (Phase 4)
npm run build:logic    # emit dist/logic.js for the Higgsfield deploy (Phase 4)
```

## The change loop (every task)

1. Find the right layer using the architecture map above.
2. Write or extend a test that states the desired behaviour. Run `test:watch`; see it red.
3. Implement the minimum to go green.
4. Refactor; keep tests + typecheck green.
5. **Definition of done:** `npm test` green, `npm run typecheck` clean, coverage not
   reduced, no new dependency without a written reason, and the golden rules upheld.

## Conventions

- TypeScript strict, `noUncheckedIndexedAccess` on — guard array/Map access (`x[i]!` only
  when you've checked, prefer explicit checks).
- The `Move` union is exhaustively switched in `applyMove`; the `never` guard at the end
  catches unhandled variants — add a `case`, don't remove the guard.
- Keep files small and single-purpose. Tests live next to the code as `*.test.ts`.
- Prose in content (briefings, blurbs) is period-flavoured but lean. No filler.

## Anti-patterns (rejected in review)

- A scene deciding whether an accusation is correct (rules belong in the core).
- Mutating `state` in place inside `applyMove`.
- A new case that only works because the engine was special-cased for it.
- Importing `phaser` or referencing `window`/`document` anywhere under `src/logic`.
- Adding a UI/state/animation library to do something the pure core could express.
- Deploying to Higgsfield before reconciling the `logic.js` contract (see `PLAN.md §6`).

## Higgsfield / MCP note (Phases 3–4)

Asset generation (`generate_image`, `generate_audio`, …) and deployment (`deploy_game`,
`publish_game`) run through Higgsfield's MCP tools. Those tools require **per-call approval
and outbound network access**, which a plain chat sandbox may deny (`host_not_allowed`).
Run those phases in an environment where the tools are approved and the network is open
(e.g. Claude Code on your machine). Logic and content work (Phases 0–2) need none of that.
