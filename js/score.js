/* ============================================================
   POCKET TENNIS LEAGUE — Score System
   ============================================================ */
'use strict';

const TENNIS_POINTS = ['0', '15', '30', '40'];

class ScoreSystem {
  constructor() { this.reset(); }

  reset() {
    this.points     = [0, 0];
    this.games      = [0, 0];
    this.sets       = [0, 0];
    this.deuce      = false;
    this.advantage  = null;   // 1 or 2
    this.currentSet = 1;
    this.setsToWin  = 2;
    this.matchOver  = false;
    this.winner     = null;
  }

  pointWon(player) {
    const p = player - 1;
    const o = 1 - p;

    if (this.deuce) {
      if (this.advantage === player) {
        this._gameWon(player);
        this.deuce = false;
        this.advantage = null;
      } else if (this.advantage === null) {
        this.advantage = player;
      } else {
        this.advantage = null; // back to deuce
      }
    } else {
      this.points[p]++;
      if (this.points[p] >= 4) {
        if (this.points[o] >= 3) {
          this.deuce     = true;
          this.points    = [3, 3];
          this.advantage = null;
        } else {
          this._gameWon(player);
        }
      }
    }
  }

  _gameWon(player) {
    this.points    = [0, 0];
    this.deuce     = false;
    this.advantage = null;
    const p = player - 1, o = 1 - p;
    this.games[p]++;
    if (this.games[p] >= 6 && this.games[p] - this.games[o] >= 2) {
      this._setWon(player);
    } else if (this.games[p] === 7) {
      this._setWon(player);
    }
  }

  _setWon(player) {
    this.games = [0, 0];
    const p    = player - 1;
    this.sets[p]++;
    this.currentSet++;
    if (this.sets[p] >= this.setsToWin) {
      this.matchOver = true;
      this.winner    = player;
    }
  }

  displayPoints(player) {
    const p = player - 1;
    if (this.deuce) {
      return this.advantage === player ? 'AD' : (this.advantage ? '—' : 'DUC');
    }
    return TENNIS_POINTS[this.points[p]] ?? '0';
  }

  displayGames(player) { return this.games[player - 1]; }
  displaySets(player)  { return this.sets[player - 1];  }
}
