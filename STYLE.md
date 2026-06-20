# STYLE.md — the locked house style (Phase 3)

One style, generated once, reused for every asset so portraits, backgrounds, and UI feel
like a single game (PLAN.md §8 risk: "AI art looks inconsistent"). Do **not** improvise
per asset — paste the **style fragment** below in front of each subject prompt.

> **Status:** the **10 images are generated and in place** (manually via Gemini Nano
> Banana — see `ARTWORK.md` for per-asset prompts and the live checklist). **Audio is
> still pending** (`art.ambience`, deferred). The Higgsfield route remains unused (account
> at 0 credits, free plan); it isn't needed for the images. The presentation layer renders
> the real art where present and the procedural fallback (warm gaslit gradient + brass
> monograms) for anything missing.

---

## The style fragment (prepend to every image prompt)

> *Late-Victorian England, 1883. Oil-painting illustration, painterly brushwork, warm
> gaslight chiaroscuro, deep shadow with a single warm key light. Muted palette of soot
> black (#14110d), aged parchment (#e8dcc0), and tarnished brass (#c9a24b). Subdued,
> atmospheric, period-accurate, restrained — no modern objects, no text, no watermark.*

**Negative prompt (every image):** *modern clothing, plastic, photographic, neon,
lens flare, text, letters, signature, watermark, frame border, cartoon, anime, lowres.*

**Palette (locked):** soot `#14110d` · panel `#1c1813` · border `#3a3122` ·
parchment `#e8dcc0` · muted `#9d927b` · brass `#c9a24b`.

---

## Shot list

Generate each, save to the path shown under `static/` (served at `/assets/...`).
The scene plumbing keys off these exact paths via `src/scenes/assets.ts`.

### Suspect portraits — 1:1, head-and-shoulders, dark vignette background
| File | Subject (after the style fragment) |
|------|------------------------------------|
| `static/assets/portraits/roylott.png` | a tall, fierce Victorian doctor, deep-set eyes, greying beard, weathered by years in India, simmering temper |
| `static/assets/portraits/band.png` | a weather-worn travelling Romani man in a spotted neckerchief, wary, camped at dusk |
| `static/assets/portraits/fiance.png` | a young, earnest English gentleman, neat moustache, anxious but hopeful |

### Phase backdrops — 9:16 (portrait), atmospheric, no people, room for UI text
| File | Subject |
|------|---------|
| `static/assets/bg/briefing.png` | 221B Baker Street sitting room before dawn, embers in the grate |
| `static/assets/bg/investigation.png` | a crumbling Surrey manor bedroom at Stoke Moran, bolted bed, dummy bell-rope, faint ventilator |
| `static/assets/bg/deduction.png` | a desk strewn with notes and a magnifying glass under lamplight |
| `static/assets/bg/accusation.png` | a dim drawing room, a single chair lit, the moment of confrontation |
| `static/assets/bg/resolved.png` | dawn light through tall windows over the quiet manor grounds |

### Ambient audio
| File | Brief |
|------|-------|
| `static/assets/audio/ambience-loop.mp3` | seamless loop: low night wind, distant clock, faint fire crackle (~30s) |
| `static/assets/audio/ambience-sting.mp3` | short tension sting for the verdict (~2s) |

### Deploy art (also used in-game as the cover; required by `deploy_game`, Phase 4)
| File | Ratio | Subject |
|------|-------|---------|
| `static/assets/cover.png` | 16:9 | the speckled band motif — a coiled shadow and a brass bell-pull, the game title space left clear |
| `static/favicon.png` | 1:1 | a single brass magnifying glass on soot black |

---

## Wiring it into content

> **Already wired:** the portraits, `art.scenery`, and `art.cover` are present in
> `src/content/case-speckled-band.ts`. The only piece still to add is the `art.ambience`
> block (one line below) once the audio files are generated. Reference block:

```ts
suspects: [
  { id: 'roylott', name: '…', blurb: '…', portrait: 'assets/portraits/roylott.png' },
  { id: 'band',    name: '…', blurb: '…', portrait: 'assets/portraits/band.png' },
  { id: 'fiance',  name: '…', blurb: '…', portrait: 'assets/portraits/fiance.png' },
],
// …
art: {
  scenery: {
    briefing:      'assets/bg/briefing.png',
    investigation: 'assets/bg/investigation.png',
    deduction:     'assets/bg/deduction.png',
    accusation:    'assets/bg/accusation.png',
    resolved:      'assets/bg/resolved.png',
  },
  ambience: { loop: 'assets/audio/ambience-loop.mp3', sting: 'assets/audio/ambience-sting.mp3' },
  cover: 'assets/cover.png',
},
```

`BootScene` loads whatever is present; `applyBackdrop`, the avatar helper, and `Ambience`
already consume these keys and fall back gracefully for anything still missing.
