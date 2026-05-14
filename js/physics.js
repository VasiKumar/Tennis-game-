/* ============================================================
   POCKET TENNIS LEAGUE — Ball Physics
   ============================================================ */
'use strict';

const STANDARD_NET_CLEARANCE_Z = 42;
const SMASH_NET_CLEARANCE_Z = 32;

class TennisBall {
  constructor(scene) {
    this.scene = scene;
    this.x  = COURT_MID_X;
    this.y  = NET_Y - 40;
    this.vx = 0;
    this.vy = 0;
    this.vz = 0;   // vertical velocity (up/down arc)
    this.z  = 0;   // height above ground
    this.spin       = 0;       // +ve = topspin, -ve = backspin
    this.bounces    = 0;
    this.inPlay     = false;
    this.lastHitter = null;    // 1 or 2
    this.bouncePlayer = null;  // side that last saw a bounce
    this.trail      = [];

    this.sprite = scene.add.image(this.x, this.y, 'ball').setDepth(10);
    this.shadow = scene.add.image(this.x, this.y + 8, 'ball_shadow').setDepth(5);
    this.sprite.setVisible(false);
    this.shadow.setVisible(false);

    this.trailGfx = scene.add.graphics().setDepth(9);
  }

  launch(fromX, fromY, toX, toY, speed, type = 'normal', shooter = 1) {
    this.x          = fromX;
    this.y          = fromY;
    this.z          = 5;
    this.bounces    = 0;
    this.inPlay     = true;
    this.lastHitter = shooter;
    this.bouncePlayer = null;
    this.trail      = [];
    this.sprite.setVisible(true);
    this.shadow.setVisible(true);

    const dx   = toX - fromX;
    const dy   = toY - fromY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const t    = dist / speed;

    this.vx = dx / t;
    this.vy = dy / t;

    switch (type) {
      case 'lob':
        this.vz   = 450;
        this.spin = -0.15;
        break;
      case 'topspin':
        this.vz   = 230;
        this.spin = 0.25;
        break;
      case 'slice':
        this.vz   = 190;
        this.spin = -0.20;
        break;
      case 'smash':
        this.vz   = 80;
        this.spin = 0.30;
        this.vx  *= 1.4;
        this.vy  *= 1.4;
        break;
      case 'drop':
        this.vz   = 270;
        this.vx  *= 0.5;
        this.vy  *= 0.5;
        this.spin = -0.30;
        break;
      default:
        this.vz   = 210;
        this.spin = 0.10;
    }

    // Ensure shots that cross the net arc high enough to avoid constant net clips.
    if (Math.sign(fromY - NET_Y) !== Math.sign(toY - NET_Y) && this.vy !== 0) {
      const tNet = (NET_Y - fromY) / this.vy;
      if (tNet > 0 && Number.isFinite(tNet)) {
        const clearZ = type === 'smash' ? SMASH_NET_CLEARANCE_Z : STANDARD_NET_CLEARANCE_Z;
        const minVzAtNet = (clearZ - this.z + 0.5 * GRAVITY * tNet * tNet) / tNet;
        if (this.vz < minVzAtNet) this.vz = minVzAtNet;
      }
    }

    synth.ballHit(speed / 400);
  }

  update(dt) {
    if (!this.inPlay) return;

    // ── Physics step ──
    this.vz -= GRAVITY * dt;
    this.x  += this.vx * dt;
    this.y  += this.vy * dt;
    this.z  += this.vz * dt;
    // Spin deflects horizontal motion
    this.vx += this.spin * this.vy * dt * 0.5;

    // ── Bounce off ground ──
    if (this.z <= 0) {
      this.z = 0;
      if (Math.abs(this.vz) > 30) {
        this.vz = -this.vz * BOUNCE_DAMP;
        this.vx *= (0.85 + this.spin * 0.1);
        this.vy *= (0.85 + this.spin * 0.1);
        this.bounces++;
        synth.bounce();
        this.scene.cameras.main.shake(60, 0.003);
        this.bouncePlayer = this.y > NET_Y ? 1 : 2;
        if (this.scene.emitBounce) this.scene.emitBounce(this.x, this.y);
      } else {
        this.vz = 0;
      }
    }

    // ── Trail ──
    this.trail.push({ x: this.x, y: this.y - this.z * 0.3, alpha: 0.7 });
    if (this.trail.length > 14) this.trail.shift();

    // ── Perspective rendering ──
    const vp    = perspect(this.x, this.y);
    const visY  = vp.y - this.z * 0.25 * vp.scale;
    const bscale = vp.scale * (0.8 + this.z * 0.004);
    this.sprite.setPosition(vp.x, visY);
    this.sprite.setScale(Math.min(bscale, 1.6));
    this.sprite.setDepth(10 + vp.t * 2);

    this.shadow.setPosition(vp.x, vp.y + 3);
    this.shadow.setScale(vp.scale);
    this.shadow.setAlpha(Math.max(0.08, 0.4 - this.z * 0.003));

    // ── Draw trail ──
    this.trailGfx.clear();
    this.trail.forEach((p, i) => {
      const tfrac = i / this.trail.length;
      const tp    = perspect(p.x, p.y);
      const r     = 5 * tfrac * tp.scale;
      this.trailGfx.fillStyle(0xffee44, tfrac * 0.45);
      this.trailGfx.fillCircle(tp.x, tp.y, r);
    });
  }

  hide() {
    this.inPlay = false;
    this.sprite.setVisible(false);
    this.shadow.setVisible(false);
    this.trailGfx.clear();
    this.trail = [];
  }

  isOutOfBounds() {
    return this.x < COURT_LEFT - 22 || this.x > COURT_RIGHT + 22 ||
           this.y < COURT_TOP  - 35 || this.y > COURT_BOTTOM + 35;
  }

  crossedNet() {
    return (this.lastHitter === 1 && this.y < NET_Y && this.vy < 0) ||
           (this.lastHitter === 2 && this.y > NET_Y && this.vy > 0);
  }
}
