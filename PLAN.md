# PLAN.md — The Speckled Band: a Sherlock deduction game

This is the single source of truth for *where the project is going*. `CLAUDE.md` says
how to work in the repo; `SKILLS.md` gives step-by-step playbooks; this file is the map.

---

## 1. What we are building (and an honest scope note)

A polished, mobile-first **detective deduction game** adapted from the public-domain
*Adventures of Sherlock Holmes*. The player examines a crime scene, gathers clues,
interrogates suspects, forms deductions, and accuses a culprit — and is scored on
getting both the *who* and the *why* right while resisting the red herrings.

**On "AAA":** AAA is a budget tier — hundreds of people, years, eight-figure budgets.
That literal bar is not reachable by a solo developer with AI tooling, and this plan does
not pretend otherwise. What *is* reachable, and what this plan targets, is a game that
**looks and feels far above a typical solo project**: handsome AI-generated period art,
atmospheric audio, tight writing, and a deduction loop that respects the player's
intelligence. We get there by nailing **one excellent case end-to-end (the vertical
slice)** and then expanding case-by-case — not by trying to boil the ocean up front.

**Delivery:** a browser game (HTML/JS) deployed through Higgsfield, the same build
wrapped into an installable Android APK with Capacitor. This is the path that actually
uses Higgsfield end-to-end; a Capacitor shell turns the web build into a real Android app.

---

## 2. Design pillars

1. **Fair-play deduction.** Every solution is reachable from clues the player can find.
   The validator (`src/logic/validate.ts`) enforces that a solution never rests on a
   red herring and that key clues genuinely implicate the culprit.
2. **The world does the talking.** Atmosphere over exposition. Period art and sound
   carry the mood; text stays lean.
3. **Thin UI, smart core.** All rules live in the pure logic core. The presentation
   layer only renders state and forwards moves. This is what keeps the game testable.
4. **Content is data.** New cases are authored as plain data files, not code. Shipping
   "more game" never means touching the engine.

---

## 3. Architecture

```
src/
  logic/            # PURE, fully unit-tested. No DOM, no Phaser, no I/O.
    types.ts        # domain model: Case, Clue, Suspect, Deduction, Move, GameState...
    engine.ts       # applyMove() reducer + phase rules + getAvailableMoves()
    deduction.ts    # scoreAccusation(), isDeductionSupported(), SCORING
    validate.ts     # validateCase() — content safety net
    index.ts        # public entry; bundled to dist/logic.js for Higgsfield (Phase 4)
  content/          # DATA, not logic.
    case-speckled-band.ts   # the vertical-slice case
    index.ts                # registry: CASES, getCase(), listCases()
  scenes/           # Phaser presentation (Phase 2). Thin: renders state, forwards Moves.
    controller.ts   # GameController — the only bridge to the core (unit-tested in Node)
    theme.ts, ui.ts # palette + reusable widgets (Button, list rows, ScrollArea)
    *Scene.ts       # Briefing / Investigation / Deduction / Accusation / Resolution
  main.ts           # Phase 2 entry: boots Phaser into #game, shares one controller
public/
  index.html        # game page; loads ../src/main.ts; Phaser mounts into #game
```

The dependency rule is one-directional: **presentation → logic → (nothing)**. Logic
never imports from `scenes/` or touches the DOM. That boundary is the whole reason the
core can be tested in milliseconds and reused as the deployable rules module.

---

## 4. Tech stack (chosen, lean, already installed)

| Concern              | Choice                | Why |
|----------------------|-----------------------|-----|
| Language             | TypeScript (strict)   | Types catch content/logic mistakes at author time. |
| Test runner          | Vitest + v8 coverage  | Fast, zero-config, watch-mode TDD. |
| Presentation         | Phaser 3              | Scene management, asset loading, animation for "game feel." |
| Web bundler/dev      | Vite                  | Instant dev server, simple production build. |
| Logic bundle         | esbuild               | One command to emit `dist/logic.js` for the deploy contract. |
| Android wrapper      | Capacitor             | Wraps the web build into an installable APK. |
| Art / audio          | Higgsfield (MCP)      | Period portraits, backgrounds, ambient sound, deploy art. |

**Guardrail:** do not add dependencies without a clear, written reason in the PR. The
stack above is deliberately small. If a feature seems to need a new library, first check
whether the pure core can express it instead.

---

## 5. Test-driven development is the method

Every change to `src/logic/**` and `src/content/**` follows red → green → refactor:

1. **Red.** Write a failing test that states the new behaviour (`npm run test:watch`).
2. **Green.** Write the least code that makes it pass.
3. **Refactor.** Clean up with the test as a safety net.

Quality gates that must stay green at all times: `npm test` (currently **38 passing**),
`npm run typecheck`, and logic coverage (see `vitest.config.ts`). The presentation layer
is tested more lightly (it should be thin — the `GameController` seam has a small suite
asserting it only forwards moves); the *rules* are tested exhaustively.

---

## 6. Roadmap by phase

The phase numbers match the markers already written into the source comments.

### Phase 0 — Logic core ✅ DONE
- Pure domain model, reducer, scoring, and the case validator.
- 31 unit tests green; strict typecheck clean.
- **Exit criteria (met):** the full game can be *played to completion in code* — see the
  `engine.test.ts` walk from briefing → investigation → deduction → accusation → resolved.

### Phase 1 — Content pipeline (under way)
- ✅ Case registry (`src/content/index.ts`) + validator + integrity test.
- ✅ Second case (*The Red-Headed League*) authored purely as data — added with **zero
  engine changes**, proving the content pipeline.
- ☐ Optional: richer deduction modelling (deductions that unlock from clue *combinations*).
- **Exit criteria:** ≥2 valid cases registered; `listCases()` drives a case-select list;
  adding a case touches only `content/`.

### Phase 2 — Playable web build (Phaser) ✅ DONE
- ✅ Five scenes mounting into `#game`: Briefing → Investigation (examine + notebook) →
  Deduction (assemble clues into statements) → Accusation → Resolution (`src/scenes/`).
- ✅ A thin `GameController` (`src/scenes/controller.ts`) is the only bridge: it forwards
  `Move`s to `applyMove()` and exposes state + an event log. It holds **no rules** and is
  unit-tested in Node (7 tests) without Phaser/DOM.
- ✅ Phaser scaled `FIT` to a 400×800 base, so the slice plays on a phone-sized viewport.
  Placeholder styling only — Phase 3 replaces it with generated art/audio.
- **Exit criteria (met):** `npm run dev` serves the Speckled Band case end-to-end in a
  browser; `npm test` (38), `npm run typecheck`, and `npm run build` are all green.

### Phase 3 — Look and sound (Higgsfield) ☐
- Generate period **portraits** for each suspect, **backgrounds** per location, a few UI
  framing pieces, and **ambient audio** (fireplace, night, tension sting).
- Asset *paths* are referenced from content (`Suspect.portrait`, etc.); the logic core
  stays asset-agnostic. Generating an asset never blocks logic work.
- Also produce the deploy **thumbnail (16:9)** and **favicon (1:1)** required at deploy time.
- **Exit criteria:** the vertical slice looks intentional and cohesive, not templated.

### Phase 4 — Ship it ☐
- `npm run build:logic` → `dist/logic.js`; `npm run build` → web bundle.
- **Reconcile the Higgsfield deploy contract first:** run `get_game_creation_instructions`
  (and read `references/build-game.md`) to confirm the exact interface `logic.js` must
  export, then adapt `src/logic/index.ts`. *Do not deploy before this step.*
- Zip (root: `logic.js` + `index.html` + assets) → `media_upload` → `media_confirm` →
  `deploy_game` (with thumbnail + favicon) → `publish_game`.
- Capacitor: `cap init` → `cap add android` → `cap copy` → build APK.
- **Exit criteria:** a public play URL and an installable APK, both running the slice.

---

## 7. The vertical slice in detail (Speckled Band)

- **Phases:** briefing → investigation → deduction → accusation → resolved.
- **Clues:** the false ventilator, the dummy bell-rope, the bolted bed, the saucer & leash,
  the night whistle, the stepfather's income — plus one red herring (the travelling band's
  spotted handkerchiefs).
- **Suspects:** Dr. Grimesby Roylott (culprit), the travelling band (red herring), the
  fiancé Percy Armitage.
- **Solution:** Roylott, using a trained swamp adder sent through the ventilator and down
  the bell-rope onto the fixed bed. Key clues: ventilator, bell-rope, bed, whistle, will.
- **Scoring** (`deduction.ts`): +100 correct culprit, +25 per key clue cited,
  −15 per red herring cited, floored at 0.

---

## 8. Risks & mitigations

| Risk | Mitigation |
|------|-----------|
| Scope creep toward "real AAA" | This plan fixes a vertical slice; everything else is post-slice backlog. |
| Higgsfield `logic.js` contract differs from our guess | `index.ts` is isolated; reconcile against `build-game.md` before first deploy (Phase 4). |
| Higgsfield MCP tools are approval-/network-gated | Asset-gen and deploy run in an approval-enabled, networked environment (e.g. Claude Code), never assumed available in plain chat. |
| AI art looks inconsistent across assets | Lock a single style prompt + palette in Phase 3; generate all assets from it. |
| Mobile performance | Keep scenes simple; prefer static art + light animation over heavy effects. |
| Rules leaking into the UI | Code review against the dependency rule; UI tests assert it only forwards moves. |

---

## 9. Definition of "full working model"

A player can, on an Android phone: open the app, read the briefing, explore the scene and
question suspects, assemble at least one sound deduction, accuse a suspect, and see a scored
resolution — with real generated art and sound — and the same build is live at a Higgsfield
URL. Reaching that for the Speckled Band case **is** the milestone; additional cases are the
natural next increments and require no engine changes.

---

## 10. Milestone checklist

- [x] Phase 0: tested logic core
- [x] Phase 1a: case registry + validator + integrity tests
- [x] Phase 1b: second case authored as data (zero engine changes)
- [x] Phase 2: Phaser playable slice in browser
- [ ] Phase 3: Higgsfield art + audio + deploy art
- [ ] Phase 4: logic.js reconciled, deployed to Higgsfield, APK built
