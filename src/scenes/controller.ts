// GameController — the thin seam between the pure logic core and the Phaser UI.
//
// It holds NO rules. Every decision is delegated to `applyMove` in the logic core;
// this class only stores the current `GameState`, keeps an event log for the UI to
// render, and notifies subscribers when the state changes. Because it imports nothing
// from Phaser or the DOM, it is unit-tested in plain Node (see controller.test.ts) and
// keeps the scenes honest: a scene forwards a `Move` and re-renders, nothing more.

import type { Case, GameState, Move, MoveResult, GameEvent } from '../logic/types';
import { applyMove, createInitialState, getAvailableMoves, isGameOver } from '../logic/engine';

export class GameController {
  readonly theCase: Case;
  private _state: GameState;
  private _log: GameEvent[] = [];
  private readonly listeners = new Set<() => void>();

  constructor(theCase: Case) {
    this.theCase = theCase;
    this._state = createInitialState(theCase);
  }

  get state(): GameState {
    return this._state;
  }

  /** Append-only event feed across all moves, for the UI to render. */
  get log(): readonly GameEvent[] {
    return this._log;
  }

  get isOver(): boolean {
    return isGameOver(this._state);
  }

  /** What the core says is legal right now — used to drive available UI actions. */
  availableMoves(): Move[] {
    return getAvailableMoves(this.theCase, this._state);
  }

  /**
   * Forward a move to the pure reducer, adopt the returned state, and record its
   * events. The controller never inspects the move to decide an outcome — that is
   * entirely the core's job. Returns the full result so a scene can react to events.
   */
  dispatch(move: Move): MoveResult {
    const result = applyMove(this.theCase, this._state, move);
    this._state = result.state;
    this._log = [...this._log, ...result.events];
    this.emit();
    return result;
  }

  /** Restart the case from its initial state (e.g. "Play again"). */
  reset(): void {
    this._state = createInitialState(this.theCase);
    this._log = [];
    this.emit();
  }

  /** Subscribe to state changes; returns an unsubscribe function. */
  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  private emit(): void {
    for (const fn of this.listeners) fn();
  }
}
