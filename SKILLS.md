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

## 6. Generate (and compress) an art or audio asset (Phase 3)

**When:** giving the slice its look and sound. No special tooling or network host — art is
generated in any image tool (we used Gemini Nano Banana), audio in any audio tool.

1. Lock the house style **once** (`STYLE.md`): a single style/era/palette prompt fragment
   reused for every asset, so portraits and backgrounds feel like one game.
2. Generate from the per-asset prompts in `ARTWORK.md` (it lists exact subject, aspect
   ratio, path, and filename for each). Generate full-resolution — step 4 shrinks it.
3. Save each file at its listed path under `static/...` (served at `/assets/...`) and, if
   it is a new kind of asset, reference its **path** from the relevant content field
   (`Suspect.portrait`, `art.scenery.<phase>`, `art.ambience.{loop,sting}`, `art.cover`).
4. **Compress for shipping:** `npm run optimize:assets`. This downscales each image to its
   spec size and palette-compresses the PNGs (sharp) and transcodes the MP3s (ffmpeg),
   **in place, keeping filenames** — turning ~tens of MB into a few MB. *Prereq:* `sharp`
   comes from `npm install`; the audio step needs a system **`ffmpeg`** on `PATH` (without
   it, images still optimize and the script just warns and skips the audio).
5. **Done:** the asset renders/plays in `npm run dev`; `npm test` stays green (the
   `assets.test.ts` integrity check confirms every referenced file exists); no asset path
   appears inside `src/logic`.

Also generate the **16:9 cover** (`static/assets/cover.png`) and **1:1 favicon**
(`static/favicon.png`) — used as the store/social thumbnail and the app/browser icon.

---

## 7. Deploy the web build for free (Phase 4)

**When:** shipping the web build. No third-party game host, no `logic.js` — `dist/` is a
plain static site. Vite's relative `base: './'` (see `vite.config.ts`) makes the same
`dist/` work under a GitHub Pages sub-path, at a domain root, and in the Capacitor WebView.

**Option A — GitHub Pages (automated, recommended)**

1. The workflow `.github/workflows/deploy.yml` builds and publishes `dist/` on every push
   to `main`. Enable it **once**: repo **Settings → Pages → Build and deployment → Source:
   GitHub Actions**.
2. `git push origin main`. Watch the run under the repo's **Actions** tab.
3. **Done:** the site is live at `https://<user>.github.io/<repo>/` (for this repo,
   `https://rajdeepsah.github.io/SherlockHolmes/`).

**Option B — Netlify (manual, even simpler)**

1. `npm run build`.
2. Drag the `dist/` folder onto <https://app.netlify.com/drop>. No account config needed.
3. **Done:** Netlify returns a public URL serving the slice.

Either way: assets are referenced by **relative** paths, so don't hard-code a leading `/`.
Sanity-check before shipping with `npm run preview` (serves the built `dist/` locally).

---

## 8. Wrap as an Android APK (Capacitor)

**When:** you want an installable Android build of the web game.

Already configured: `capacitor.config.ts` (`appId: com.rajdeepsah.speckledband`,
`webDir: 'dist'`) and the `@capacitor/*` deps. `cap init` is **not** needed again. The
generated `android/` folder is git-ignored — it's a build artifact regenerated from the
config + `dist/`.

```bash
npm run build            # produce dist/ (the source of truth)
npx cap add android      # first time only — scaffolds android/
npm run android:sync     # rebuild dist/ and copy it into android/ (run after every change)
npm run android:open     # open android/ in Android Studio → Build > Build APK / Bundle
```

**Requires** a local **JDK 17 + Android SDK** (installed with Android Studio) to compile —
that's the one step a headless sandbox can't do. From Android Studio you can also run it on
a device/emulator, and sign a release APK/AAB for distribution.

---

## 9. Pre-commit quality gate

Run before every commit / PR:

```bash
npm run typecheck && npm test
```
Both must pass. Confirm: coverage on the logic core not reduced, no unjustified new
dependency, golden rules upheld.
