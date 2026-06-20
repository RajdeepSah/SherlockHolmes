// Reusable Phaser UI widgets — buttons, list rows, headings, and a scroll area.
//
// Pure presentation. Nothing here knows a game rule; widgets take labels and callbacks.
// Built for a tall phone viewport (see theme BASE_W/BASE_H) with Scale.FIT, so all
// coordinates are in the fixed base resolution regardless of the device size.

import Phaser from 'phaser';
import { C, T, FONT } from './theme';

const RADIUS = 10;

function paintBox(
  g: Phaser.GameObjects.Graphics,
  w: number,
  h: number,
  fill: number,
  stroke: number,
  radius = RADIUS,
): void {
  g.clear();
  g.fillStyle(fill, 1);
  g.fillRoundedRect(0, 0, w, h, radius);
  g.lineStyle(1, stroke, 1);
  g.strokeRoundedRect(0, 0, w, h, radius);
}

export interface ButtonOpts {
  width?: number;
  height?: number;
  primary?: boolean;
  fontSize?: number;
}

/** A centred, tappable button. Position by its centre point. */
export class Button extends Phaser.GameObjects.Container {
  private readonly g: Phaser.GameObjects.Graphics;
  private readonly txt: Phaser.GameObjects.Text;
  private readonly boxW: number;
  private readonly boxH: number;
  private readonly primary: boolean;
  private enabledFlag = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    opts: ButtonOpts = {},
  ) {
    super(scene, x, y);
    this.boxW = opts.width ?? 260;
    this.boxH = opts.height ?? 50;
    this.primary = opts.primary ?? false;

    this.g = scene.add.graphics();
    this.txt = scene.add
      .text(0, 0, label, {
        fontFamily: FONT,
        fontSize: `${opts.fontSize ?? 18}px`,
        color: this.primary ? T.ink : T.text,
      })
      .setOrigin(0.5);
    // Graphics draw from (0,0); shift so the box is centred on the container origin.
    this.g.setPosition(-this.boxW / 2, -this.boxH / 2);
    this.add([this.g, this.txt]);
    this.paint(false, false);

    this.setSize(this.boxW, this.boxH);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-this.boxW / 2, -this.boxH / 2, this.boxW, this.boxH),
      Phaser.Geom.Rectangle.Contains,
    );
    this.on('pointerover', () => this.paint(true, false));
    this.on('pointerout', () => this.paint(false, false));
    this.on('pointerdown', () => this.paint(true, true));
    this.on('pointerup', () => {
      this.paint(true, false);
      if (this.enabledFlag) onClick();
    });
    scene.add.existing(this);
  }

  private paint(hover: boolean, down: boolean): void {
    let fill: number;
    let stroke: number;
    if (!this.enabledFlag) {
      fill = C.panel;
      stroke = C.border;
    } else if (this.primary) {
      fill = down ? C.accentDown : hover ? C.accentHi : C.accent;
      stroke = C.accent;
    } else {
      fill = hover || down ? C.panelHi : C.panel;
      stroke = hover ? C.accent : C.border;
    }
    paintBox(this.g, this.boxW, this.boxH, fill, stroke);
  }

  setEnabled(v: boolean): this {
    this.enabledFlag = v;
    this.txt.setAlpha(v ? 1 : 0.45);
    this.paint(false, false);
    return this;
  }

  setLabel(s: string): this {
    this.txt.setText(s);
    return this;
  }
}

export interface ListItemOpts {
  width: number;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  selected?: boolean;
  /** 'check' = done marker, 'toggle' = radio/checkbox dot, 'none' = no marker. */
  marker?: 'check' | 'toggle' | 'none';
  disabled?: boolean;
}

export interface ListItem {
  container: Phaser.GameObjects.Container;
  height: number;
}

/**
 * A left-aligned card row with an optional marker, wrapping title, and wrapping
 * subtitle. Height grows to fit the text so long clue descriptions never clip.
 * Draws from local (0,0) top-left — convenient for stacking inside a ScrollArea.
 */
export function makeListItem(scene: Phaser.Scene, opts: ListItemOpts): ListItem {
  const pad = 12;
  const sel = opts.selected ?? false;
  const c = scene.add.container(0, 0);

  let textX = pad;
  let marker: Phaser.GameObjects.Text | undefined;
  if (opts.marker && opts.marker !== 'none') {
    const glyph = opts.marker === 'check' ? (sel ? '✓' : '·') : sel ? '◉' : '○';
    marker = scene.add
      .text(pad, 0, glyph, {
        fontFamily: FONT,
        fontSize: '18px',
        color: sel ? T.accent : T.muted,
      })
      .setOrigin(0, 0);
    textX = pad + 24;
  }
  const innerW = opts.width - textX - pad;

  const title = scene.add.text(textX, pad, opts.title, {
    fontFamily: FONT,
    fontSize: '16px',
    color: sel ? T.accent : T.text,
    wordWrap: { width: innerW },
  });
  let bottom = pad + title.height;
  let subtitle: Phaser.GameObjects.Text | undefined;
  if (opts.subtitle) {
    subtitle = scene.add.text(textX, bottom + 4, opts.subtitle, {
      fontFamily: FONT,
      fontSize: '12.5px',
      color: T.muted,
      lineSpacing: 2,
      wordWrap: { width: innerW },
    });
    bottom = subtitle.y + subtitle.height;
  }
  const h = Math.max(46, bottom + pad);
  if (marker) marker.setY(Math.round(h / 2 - 11));

  const g = scene.add.graphics();
  paintBox(g, opts.width, h, sel ? C.panelHi : C.panel, sel ? C.accent : C.border, 8);
  c.add(g); // behind
  c.add(title);
  if (marker) c.add(marker);
  if (subtitle) c.add(subtitle);
  c.bringToTop(title);

  if (opts.onClick && !opts.disabled) {
    c.setSize(opts.width, h);
    c.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, opts.width, h),
      Phaser.Geom.Rectangle.Contains,
    );
    c.on('pointerover', () =>
      paintBox(g, opts.width, h, C.panelHi, C.accent, 8),
    );
    c.on('pointerout', () =>
      paintBox(g, opts.width, h, sel ? C.panelHi : C.panel, sel ? C.accent : C.border, 8),
    );
    c.on('pointerup', opts.onClick);
  }
  if (opts.disabled) c.setAlpha(0.55);

  return { container: c, height: h };
}

/** A small uppercase section heading. */
export function heading(scene: Phaser.Scene, x: number, y: number, label: string): Phaser.GameObjects.Text {
  return scene.add.text(x, y, label.toUpperCase(), {
    fontFamily: FONT,
    fontSize: '12px',
    color: T.muted,
    letterSpacing: 2,
  } as Phaser.Types.GameObjects.Text.TextStyle);
}

/**
 * A vertically scrollable, masked region. Children are added in local coordinates
 * (top-left origin) via `add(child, localY)`; call `setContentHeight` after laying
 * out so drag/wheel clamps correctly. Drag with a pointer or use the mouse wheel.
 */
export class ScrollArea {
  readonly view: Phaser.GameObjects.Container;
  private readonly maskG: Phaser.GameObjects.Graphics;
  private contentHeight = 0;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly x: number,
    private readonly y: number,
    private readonly w: number,
    private readonly h: number,
  ) {
    this.view = scene.add.container(x, y);
    this.maskG = scene.make.graphics({});
    this.maskG.fillStyle(0xffffff, 1);
    this.maskG.fillRect(x, y, w, h);
    this.view.setMask(this.maskG.createGeometryMask());

    scene.input.on('wheel', this.onWheel, this);
    scene.input.on('pointermove', this.onDrag, this);
    // Input listeners live on the scene's own InputPlugin and are torn down with the
    // scene, but the mask Graphics is global — clean it up explicitly.
    scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.maskG.destroy());
  }

  /** Add a child at a local y offset (x is left-aligned within the area). */
  add(child: Phaser.GameObjects.GameObject & { x: number; y: number }, localY: number): void {
    child.y = localY;
    this.view.add(child);
  }

  clear(): void {
    this.view.removeAll(true);
    this.view.y = this.y;
    this.contentHeight = 0;
  }

  setContentHeight(height: number): void {
    this.contentHeight = height;
    this.clamp();
  }

  private within(p: Phaser.Input.Pointer): boolean {
    return p.x >= this.x && p.x <= this.x + this.w && p.y >= this.y && p.y <= this.y + this.h;
  }

  private clamp(): void {
    const maxScroll = Math.max(0, this.contentHeight - this.h);
    const minY = this.y - maxScroll;
    if (this.view.y < minY) this.view.y = minY;
    if (this.view.y > this.y) this.view.y = this.y;
  }

  private onWheel(p: Phaser.Input.Pointer, _over: unknown, _dx: number, dy: number): void {
    if (!this.within(p)) return;
    this.view.y -= dy * 0.5;
    this.clamp();
  }

  private onDrag(p: Phaser.Input.Pointer): void {
    if (!p.isDown || !this.within(p)) return;
    this.view.y += p.position.y - p.prevPosition.y;
    this.clamp();
  }
}
