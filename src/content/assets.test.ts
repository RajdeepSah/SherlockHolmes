// Content asset integrity: every art/audio path a case *declares* must resolve to a real
// file under static/ (served at /assets/...). This is the regression guard behind "the
// game still loads its assets" after the Phase 4 compression — a path typo or a renamed
// file fails here instead of silently dropping the slice to its procedural fallback.
//
// It does NOT require a case to have art: missing fields are fine (the UI degrades to a
// gaslit gradient + brass monograms). It only checks that what IS referenced exists.

import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { CASES } from './index';
import type { Case } from '../logic/types';

const STATIC = resolve(dirname(fileURLToPath(import.meta.url)), '../../static');

/** Collect every asset path a case references, in `assets/...` runtime form. */
function declaredAssetPaths(c: Case): string[] {
  const paths: string[] = [];
  for (const s of c.suspects) if (s.portrait) paths.push(s.portrait);
  const art = c.art;
  if (art?.scenery) for (const p of Object.values(art.scenery)) if (p) paths.push(p);
  if (art?.ambience?.loop) paths.push(art.ambience.loop);
  if (art?.ambience?.sting) paths.push(art.ambience.sting);
  if (art?.cover) paths.push(art.cover);
  return paths;
}

describe('content asset paths resolve to real files', () => {
  for (const c of CASES) {
    const paths = declaredAssetPaths(c);
    // A case with no declared art has nothing to verify (procedural fallback covers it).
    it.skipIf(paths.length === 0)(`"${c.id}" references only files that exist`, () => {
      const missing = paths.filter((p) => !existsSync(join(STATIC, p)));
      expect(missing).toEqual([]);
    });
  }

  it('the Speckled Band slice wires its full art + audio set', () => {
    const speckled = CASES.find((c) => c.id === 'speckled-band')!;
    // 3 portraits + 5 backdrops + loop + sting + cover = 11 declared assets.
    expect(declaredAssetPaths(speckled)).toHaveLength(11);
    expect(speckled.art?.ambience?.loop).toBe('assets/audio/ambience-loop.mp3');
    expect(speckled.art?.ambience?.sting).toBe('assets/audio/ambience-sting.mp3');
  });
});
