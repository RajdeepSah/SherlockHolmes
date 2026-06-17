# SKILLS.md — playbooks for building on this game

Copy-pasteable recipes for the tasks you'll repeat. Each one says **when** to use it, the
**steps**, the **test** to add, and **done** criteria. They assume the golden rules in
`CLAUDE.md` and the roadmap in `PLAN.md`.

---

## 1. Add a new case

**When:** you want more game. This is the most common task and touches only `content/`.

1. Copy `src/content/case-speckled-band.ts` to `src/content/case-<slug>.ts`.
2. Rewrite the data: `id`, `title`, `source`, `briefing`, `scene`, `suspects`, `clues`,
   `solution`. Keep it fair — every key clue must implicate the culprit and must not be a
   red herring. Give the case at least one red herring; that's where the fun is.
3. Register it in `src/content/index.ts`: import it and add it to `CASES`.
4. **Test:** none needed for the data itself — the registry's "every registered case is
   structurally valid" test now covers it via `validateCase`. Add bespoke tests only for
   anything unusual about the case.
5. **Done:** `npm test` green (the integrity test now exercises your case),
   `listCases()` includes it.

Good public-domain next cases: *The Red-Headed League*, *The Blue Carbuncle*,
*A Scandal in Bohemia*, *The Boscombe Valley Mystery*.

---

## 2. Add or change a clue / suspect

**When:** tuning an existing case.

1. Edit the case's data file. If you add a clue that the solution should depend on, add its
   id to `solution.keyClueIds`. If it should mislead, set `redHerring: true`.
2. Make sure every `implicates` id is a real suspect id.
3. **Test:** the validator catches structural mistakes automatically. Add a scoring test if
   the change affects how an accusation scores.
4. **Done:** `npm test` + `npm run typecheck` green.

---

## 3. Add a new rule, scoring tweak, or game phase behaviour

**When:** changing *how the game plays* (not content).

1. Open `src/logic/` (`engine.ts` for moves/phases, `deduction.ts` for scoring).
2. **Red:** add a failing test in the matching `*.test.ts` describing the new behaviour.
   Run `npm run test:watch`.
3. **Green:** implement the minimum change.
4. **Refactor**; keep all tests green. Coverage on the logic core must not drop.
5. **Done:** suite green, typecheck clean, rule lives entirely in the core (UI unchanged).

---

## 4. Add a new `Move` type

**When:** the player needs a new kind of action (e.g. `useMagnifier`, `reviewNotes`).

1. Add the variant to the `Move` union in `src/logic/types.ts`.
2. Handle it with a new `case` in `applyMove` (`engine.ts`). The `never` exhaustiveness
   guard will fail to compile until you do — that's the point.
3. Expose it from `getAvailableMoves` for the phase(s) where it's legal.
4. **Test:** add cases in `engine.test.ts` for the happy path and at least one rejection.
5. **Done:** suite + typecheck green.

---

## 5. Run the web game locally (Phase 2)

**When:** building or testing the Phaser presentation layer.

```bash
npm run dev      # Vite dev server; open the printed URL, resize to a phone viewport
```
Scenes mount into `#game` in `public/index.html`. The scene calls `applyMove()` and renders
`MoveResult.events`. Keep rules out of the scene (see `CLAUDE.md` anti-patterns).

---

## 6. Generate an art or audio asset (Phase 3, Higgsfield)

**When:** giving the slice its look and sound. **Requires** an approval-enabled, networked
environment (the Higgsfield MCP tools); see the note in `CLAUDE.md`.

1. Lock the house style **once**: a single style/era/palette prompt fragment reused for
   every asset, so portraits and backgrounds feel like one game.
2. `models_explore(type:'image')` to pick a model and see its aspect ratios/params.
3. `generate_image` with the style fragment + the specific subject (e.g. "a stern Victorian
   doctor, oil-portrait lighting"). For audio, `generate_audio` (ambient loop / sting).
4. Save the resulting asset into `public/assets/...` and reference its **path** from the
   relevant content field (`Suspect.portrait`, a per-location background map, etc.).
5. **Done:** asset renders in the running web build; no asset path appears inside
   `src/logic`.

Also generate the deploy art here: a **16:9 thumbnail** and a **1:1 square favicon**
(`deploy_game` requires both).

---

## 7. Bundle `logic.js` and deploy to Higgsfield (Phase 4)

**When:** shipping a web build. **Requires** the Higgsfield MCP tools (approval + network).

1. **Reconcile the contract first.** Run `get_game_creation_instructions`, read
   `references/build-game.md`, and confirm exactly what `logic.js` must export. Adapt
   `src/logic/index.ts` to match. *Do not skip this.*
2. `npm run build` (web bundle) and `npm run build:logic` (→ `dist/logic.js`).
3. Assemble a zip whose **root** contains `logic.js` and `index.html`, with everything else
   as assets, per the contract.
4. `media_upload` the `.zip` → PUT the bytes to the returned URL → `media_confirm` (type
   `file`) → take the permanent URL.
5. `deploy_game` with that URL plus the 16:9 thumbnail and 1:1 favicon. Keep the returned
   `game_id`.
6. `publish_game` with the `game_id` to list it.
7. **To update later:** deploy again **with the same `game_id`** — never omit it, or you'll
   create a second game at a new URL.
8. **Done:** the play URL runs the slice.

---

## 8. Wrap as an Android APK (Capacitor)

**When:** you want an installable Android build of the web game.

```bash
npx cap init "The Speckled Band" com.example.speckledband --web-dir=dist
npm run build
npx cap add android
npx cap copy
npx cap open android      # build/run the APK from Android Studio
```
The web build is the source of truth; Capacitor just hosts it in a native shell.

---

## 9. Pre-commit quality gate

Run before every commit / PR:

```bash
npm run typecheck && npm test
```
Both must pass. Confirm: coverage on the logic core not reduced, no unjustified new
dependency, golden rules upheld.
