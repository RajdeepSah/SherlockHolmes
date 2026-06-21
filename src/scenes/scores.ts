// Best-score persistence — a presentation-layer convenience, not a game rule.
//
// The authoritative score is computed by the pure core at accusation time; this just
// remembers the highest score seen per case in the browser's localStorage so the menu
// can show it. Everything is guarded so it is a harmless no-op where storage is absent
// (private mode, SSR, tests) — it must never throw into the render path.

const KEY = 'sherlock.bestScores.v1';

function storage(): Storage | undefined {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : undefined;
  } catch {
    return undefined;
  }
}

function readAll(): Record<string, number> {
  const s = storage();
  if (!s) return {};
  try {
    const raw = s.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, number>) : {};
  } catch {
    return {};
  }
}

/** The best score recorded for a case, or undefined if none yet. */
export function getBestScore(caseId: string): number | undefined {
  const v = readAll()[caseId];
  return typeof v === 'number' ? v : undefined;
}

/** Record a score if it beats the stored best. Returns the (possibly new) best. */
export function recordScore(caseId: string, score: number): number {
  const all = readAll();
  const prev = typeof all[caseId] === 'number' ? all[caseId]! : -Infinity;
  const best = Math.max(prev, score);
  const s = storage();
  if (s) {
    try {
      s.setItem(KEY, JSON.stringify({ ...all, [caseId]: best }));
    } catch {
      /* storage full or blocked — ignore, scores are non-essential */
    }
  }
  return best;
}
