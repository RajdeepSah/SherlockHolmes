# ARTWORK.md — asset manifest for the Speckled Band slice

The single checklist for every art asset the current slice needs, built for **manual**
generation. `STYLE.md` holds the locked house look (palette, era, the style fragment and
negative prompt) — this file does **not** restate it; each prompt below adds only the
asset-specific content. The loaders are already wired to the exact paths and filenames
here, so generated files are **drop-in: no code changes needed**.

> Until the files exist, the game runs on its procedural fallback (gaslit gradient +
> brass monograms) and the browser console shows harmless 404s for the missing assets.
> Both vanish the moment you drop a correctly-named file into the listed folder.

---

## How to use this file

For each entry below:

1. **Copy the prompt** — and prepend the *style fragment* from `STYLE.md` (+ its negative
   prompt). If the entry lists a **Reference**, also attach that earlier image in Gemini.
2. **Generate** in the **Gemini Nano Banana** app (images only; audio/video are deferred).
3. **Download** the result.
4. **Rename** it to the entry's exact **Filename**.
5. **Drop** it into the entry's **Path** folder (under `static/…`, served at `/assets/…`).
6. **Check the box** `[ ] → [x]` and reload the game — the asset appears automatically.

Generate in listed order: **anchor portrait → other portraits → anchor scene → other
scenes → cover/favicon**. Later assets reference earlier ones for a consistent look.

---

## ▶ Pilot first (validate the look before bulk-generating)

Do these three, drop them in, eyeball them in the running game, and only then generate the
rest. They prove the character look, the scene look, and that **reference images keep
characters consistent**.

1. `C1` — Roylott portrait (the character anchor)
2. `S1` — Briefing backdrop (the scene anchor)
3. `C2` — Travelling-band portrait *using `C1` as a reference* (confirms consistency)

---

## 1. Characters (portraits) — generate first; they anchor everything

> Common to all portraits: **Type** image · **Tool** Gemini Nano Banana ·
> **Format** PNG, **1024×1024 (1:1)**, opaque (dark vignette background, no cut-out) ·
> head-and-shoulders, three-quarter view, single warm key light, deep shadow behind.
> **Integration:** `Suspect.portrait` in `src/content/case-speckled-band.ts` (already set);
> shown as the suspect's avatar in the Investigation and Accusation lists. Falls back to a
> brass monogram of the name's initial if absent.

### [ ] `C1` — Dr. Grimesby Roylott  *(ANCHOR — generate first, no reference)*
- **Prompt:** Head-and-shoulders portrait of Dr. Grimesby Roylott, a tall fierce English
  doctor in his fifties, deep-set glaring eyes under heavy brows, thick greying beard,
  skin darkened and lined by years of practice in India, high stiff collar and dark frock
  coat; an air of barely-contained violence.
- **Reference:** none (this is the style anchor for the other two portraits).
- **Path:** `static/assets/portraits/` · **Filename:** `roylott.png`

### [ ] `C2` — The travelling band (Romani man)
- **Prompt:** Head-and-shoulders portrait of a weather-worn travelling Romani man, wary
  watchful eyes, a brightly **spotted neckerchief** at his throat, coarse jacket, dusk
  campfire glow on one cheek; dignified, guarded.
- **Reference:** `C1` (match its illustration style, brushwork, and lighting).
- **Path:** `static/assets/portraits/` · **Filename:** `band.png`

### [ ] `C3` — Percy Armitage (the fiancé)
- **Prompt:** Head-and-shoulders portrait of Percy Armitage, a young earnest English
  gentleman in his late twenties, neat moustache, clear hopeful eyes shadowed by worry,
  well-kept collar and cravat; gentle, anxious.
- **Reference:** `C1` (match style and lighting).
- **Path:** `static/assets/portraits/` · **Filename:** `fiance.png`

---

## 2. Scenes (phase backdrops) — no people; mood and depth only

> Common to all backdrops: **Type** image · **Tool** Gemini Nano Banana ·
> **Format** PNG, **portrait ~9:16 (e.g. 1024×1792)**, opaque · empty of people · composed
> with the lit subject low/centre so heading text reads clearly over the top third.
> **Integration:** `Case.art.scenery.<phase>` (already set); drawn full-bleed by
> `applyBackdrop` with a dark scrim. Falls back to the procedural gradient if absent.

### [ ] `S1` — Briefing  *(ANCHOR SCENE — generate first)*
- **Prompt:** The 221B Baker Street sitting room before dawn, embers dying in the grate,
  a cluttered side table, tall curtained window with the faintest grey light; hushed,
  expectant, empty.
- **Reference:** none (style anchor for the other scenes).
- **Path:** `static/assets/bg/` · **Filename:** `briefing.png`

### [ ] `S2` — Investigation
- **Prompt:** A crumbling Surrey manor bedroom at Stoke Moran by candlelight: an iron bed
  clamped to the floor, a useless bell-rope hanging beside it, a small dark ventilator
  high on the wall above; cold, oppressive, full of wrong details.
- **Reference:** `S1` (match palette and rendering).
- **Path:** `static/assets/bg/` · **Filename:** `investigation.png`

### [ ] `S3` — Deduction
- **Prompt:** A writing desk under a single oil lamp, strewn with handwritten notes, a
  magnifying glass and an open notebook; concentration, late-night quiet.
- **Reference:** `S1`.
- **Path:** `static/assets/bg/` · **Filename:** `deduction.png`

### [ ] `S4` — Accusation
- **Prompt:** A dim Victorian drawing room, one empty high-backed chair caught in a shaft
  of warm light, the rest in shadow; the charged hush before a confrontation.
- **Reference:** `S1`.
- **Path:** `static/assets/bg/` · **Filename:** `accusation.png`

### [ ] `S5` — Resolution
- **Prompt:** Pale dawn light pouring through tall windows across the quiet grounds of an
  English country manor; stillness after the storm, release.
- **Reference:** `S1`.
- **Path:** `static/assets/bg/` · **Filename:** `resolved.png`

---

## 3. Marketing & app icons

### [ ] `COVER` — title cover / deploy thumbnail
- **Type** image · **Tool** Gemini Nano Banana · **Format** PNG, **1280×720 (16:9)**, opaque.
- **Prompt:** A brooding key-art composition for "The Speckled Band": a coiled snake-shadow
  twisting down a tarnished brass bell-pull against soot-black, dramatic single light;
  leave the upper area uncluttered for a title. No text.
- **Reference:** `S1` (palette) and/or `C1` (mood).
- **Path:** `static/assets/` · **Filename:** `cover.png`
- **Integration:** `Case.art.cover` (already set). Used as the Phase 4 `deploy_game`
  thumbnail; **not loaded in-game**, so it produces no console 404.

### [ ] `FAVICON` — app/browser icon
- **Type** image · **Tool** Gemini Nano Banana · **Format** PNG, **512×512 (1:1)**, opaque.
- **Prompt:** A single brass magnifying glass, three-quarter view, catching one warm
  highlight, centred on soot-black; iconic, simple, readable when small. No text.
- **Reference:** none.
- **Path:** `static/` · **Filename:** `favicon.png`
- **Integration:** linked from `public/index.html` (`<link rel="icon" href="/favicon.png">`,
  already added) and reused as the Phase 4 `deploy_game` 1:1 favicon.

---

## 4. Deferred — audio (do not generate yet)

Listed for completeness; generate in a later pass (not via Gemini). When ready, save to the
paths below and add the `art.ambience` block from `STYLE.md` to the case — the `Ambience`
helper already consumes these keys.

- [ ] `A1` — **Ambient loop** · audio · ~30s seamless: low night wind, a distant clock,
  faint fire crackle · `static/assets/audio/` · `ambience-loop.mp3`
- [ ] `A2` — **Tension sting** · audio · ~2s one-shot for the verdict ·
  `static/assets/audio/` · `ambience-sting.mp3`

---

## 5. Deferred — video

None required for the slice. (Placeholder section so the manifest stays the single source.)
