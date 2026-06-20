// Visual theme for the Phaser presentation layer.
//
// Pure presentation — no game rules here. The palette mirrors public/index.html so the
// canvas and the page frame read as one piece. Phaser wants numeric colours for Graphics
// fills/strokes and CSS strings for Text fills, so both forms are provided.

export const BASE_W = 400;
export const BASE_H = 800;
export const MARGIN = 20;
export const CONTENT_W = BASE_W - MARGIN * 2;

export const FONT = 'Georgia, "Times New Roman", serif';

/** Numeric colours for Graphics (fills, strokes). */
export const C = {
  bg: 0x14110d,
  panel: 0x1c1813,
  panelHi: 0x241f17,
  border: 0x3a3122,
  accent: 0xc9a24b,
  accentDown: 0xb08a2f,
  accentHi: 0xd8b15a,
} as const;

/** CSS colour strings for Text fills. */
export const T = {
  text: '#e8dcc0',
  muted: '#9d927b',
  accent: '#c9a24b',
  ink: '#14110d',
  good: '#7faf6b',
  bad: '#c46a5a',
} as const;
