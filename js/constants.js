/* ============================================================
   POCKET TENNIS LEAGUE — Game Constants & Perspective System
   ============================================================ */
'use strict';

// ─── CANVAS / GAME SIZE ──────────────────────────────────────
const W = 390, H = 844;

// ─── GAME-SPACE COURT BOUNDS ─────────────────────────────────
// All physics, AI, and collision detection uses these coordinates.
const COURT_TOP    = 160;
const COURT_BOTTOM = 680;
const COURT_LEFT   = 30;
const COURT_RIGHT  = 360;
const NET_Y        = (COURT_TOP + COURT_BOTTOM) / 2;  // 420
const COURT_MID_X  = (COURT_LEFT + COURT_RIGHT) / 2;  // 195

// ─── PHYSICS ─────────────────────────────────────────────────
const GRAVITY     = 900;
const BOUNCE_DAMP = 0.62;
const BALL_RADIUS = 8;

// ─── PERSPECTIVE PROJECTION ───────────────────────────────────
// The court is displayed as a 3/4-view trapezoid (like classic
// sports games). Game-space coordinates are projected to screen
// space using this linear perspective transform.
//
//   Far end (player 2's baseline) → top of court on screen, narrow
//   Near end (player 1's baseline) → bottom of court on screen, wide
//
// Screen-space corners of the perspective court trapezoid:
const PERSP = Object.freeze({
  FAR_Y:      200,   // Screen Y of far baseline  (player 2 end)
  NEAR_Y:     730,   // Screen Y of near baseline (player 1 end)
  FAR_L:      100,   // Screen X, far-left corner
  FAR_R:      290,   // Screen X, far-right corner
  NEAR_L:     14,    // Screen X, near-left corner
  NEAR_R:     376,   // Screen X, near-right corner
  SCALE_FAR:  0.40,  // Sprite scale at far baseline
  SCALE_NEAR: 1.00,  // Sprite scale at near baseline
});

/**
 * Project game-space (gx, gy) to perspective screen-space.
 *
 * @param {number} gx  X in game space (COURT_LEFT … COURT_RIGHT)
 * @param {number} gy  Y in game space (COURT_TOP … COURT_BOTTOM)
 * @returns {{ x:number, y:number, t:number, scale:number }}
 *   t=0 → far/player-2 end;  t=1 → near/player-1 end
 */
function perspect(gx, gy) {
  const t  = Math.max(0, Math.min(1, (gy - COURT_TOP) / (COURT_BOTTOM - COURT_TOP)));
  const sy = PERSP.FAR_Y  + t * (PERSP.NEAR_Y  - PERSP.FAR_Y);
  const lx = PERSP.FAR_L  + t * (PERSP.NEAR_L  - PERSP.FAR_L);
  const rx = PERSP.FAR_R  + t * (PERSP.NEAR_R  - PERSP.FAR_R);
  const gxNorm = (gx - COURT_LEFT) / (COURT_RIGHT - COURT_LEFT);
  const sx     = lx + gxNorm * (rx - lx);
  const scale  = PERSP.SCALE_FAR + (PERSP.SCALE_NEAR - PERSP.SCALE_FAR) * t;
  return { x: sx, y: sy, t, scale };
}

/**
 * Draw a perspective-projected line between two game-space points.
 * @param {Phaser.GameObjects.Graphics} g
 */
function perspectLine(g, gx1, gy1, gx2, gy2) {
  const p1 = perspect(gx1, gy1);
  const p2 = perspect(gx2, gy2);
  g.beginPath();
  g.moveTo(p1.x, p1.y);
  g.lineTo(p2.x, p2.y);
  g.strokePath();
}

// ─── COLOR PALETTE ───────────────────────────────────────────
const COLORS = {
  grass:     0x2d7a27,
  clay:      0xc04a1a,
  hard:      0x3a6ea5,
  white:     0xffffff,
  yellow:    0xf5e642,
  black:     0x000000,
  navy:      0x0a1628,
  gold:      0xffd700,
  red:       0xff3333,
  green:     0x33ff77,
  blue:      0x33aaff,
  purple:    0xaa44ff,
  orange:    0xff8833,
  darkgray:  0x222222,
  lightgray: 0xcccccc,
};
