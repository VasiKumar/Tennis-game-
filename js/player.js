/* ============================================================
   POCKET TENNIS LEAGUE — Player
   ============================================================ */
'use strict';

class Player {
  constructor(scene, id, x, y, isHuman = true) {
    this.scene   = scene;
    this.id      = id;
    this.isHuman = isHuman;
    this.x       = x;
    this.y       = y;
    this.vx      = 0;
    this.vy      = 0;
    this.speed   = 210;
    this.state   = 'idle';
    this.hitCooldown  = 0;
    this.serveCooldown = 0;
    this.name    = id === 1 ? 'Player 1' : 'Player 2';
    this.reachRange  = 62;
    this.isServing   = false;
    this.canHit      = true;

    // Perspective sprite (player 2 is flipped vertically to face inward)
    const texKey = id === 1 ? 'player1' : 'player2';
    this.shadow = scene.add.image(x, y + 24, 'player_shadow').setDepth(4);
    this.sprite = scene.add.image(x, y, texKey).setDepth(6);
    if (id === 2) this.sprite.setFlipY(true);

    // Hit flash overlay
    this.flashTimer = 0;
  }

  setName(n) { this.name = n; }

  getBounds() {
    return new Phaser.Geom.Rectangle(this.x - 22, this.y - 32, 44, 64);
  }

  canReachBall(ball) {
    const dx = ball.x - this.x;
    const dy = ball.y - this.y;
    return Math.sqrt(dx * dx + dy * dy) < this.reachRange && ball.z < 88;
  }

  move(dx, dy, dt) {
    this.vx = dx * this.speed;
    this.vy = dy * this.speed;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Clamp to player's half of the court
    const minY = this.id === 1 ? NET_Y + 8  : COURT_TOP  + 5;
    const maxY = this.id === 1 ? COURT_BOTTOM - 5 : NET_Y - 8;
    this.x = Phaser.Math.Clamp(this.x, COURT_LEFT  + 20, COURT_RIGHT - 20);
    this.y = Phaser.Math.Clamp(this.y, minY, maxY);
  }

  update(dt) {
    if (this.hitCooldown  > 0) this.hitCooldown  -= dt;
    if (this.serveCooldown > 0) this.serveCooldown -= dt;
    if (this.flashTimer   > 0) this.flashTimer   -= dt;

    // ── Perspective rendering ──
    const vp    = perspect(this.x, this.y);
    const bob   = Math.sin(this.scene.time.now / 280) * 1.8 * vp.scale;
    const depth = 6 + vp.t * 3; // near player renders on top

    this.sprite.setPosition(vp.x, vp.y + bob);
    this.sprite.setScale(vp.scale);
    this.sprite.setDepth(depth);

    this.shadow.setPosition(vp.x, vp.y + 26 * vp.scale);
    this.shadow.setScale(vp.scale);
    this.shadow.setDepth(depth - 2);

    // Flip horizontally based on movement direction
    if (this.vx !== 0) this.sprite.setFlipX(this.vx < 0);

    // Hit flash tint
    if (this.flashTimer > 0) {
      this.sprite.setTint(0xffffff);
    } else {
      this.sprite.clearTint();
    }
  }

  hit(ball, type = 'normal', targetX, targetY) {
    if (this.hitCooldown > 0) return false;
    if (!this.canReachBall(ball))  return false;
    this.hitCooldown = 0.5;

    const tx = targetX ?? Phaser.Math.Between(COURT_LEFT + 30, COURT_RIGHT - 30);
    const ty = targetY ?? (
      this.id === 1
        ? Phaser.Math.Between(COURT_TOP + 20, NET_Y - 20)
        : Phaser.Math.Between(NET_Y + 20, COURT_BOTTOM - 20)
    );

    const power = 285 + Math.random() * 120;
    ball.launch(this.x, this.y, tx, ty, power, type, this.id);

    // Visual hit flash
    this.flashTimer = 0.08;
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: this.sprite.scaleX * 1.35,
      scaleY: this.sprite.scaleY * 0.75,
      duration: 75,
      yoyo: true,
    });
    return true;
  }
}
