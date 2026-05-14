/* ============================================================
   POCKET TENNIS LEAGUE — AI Controller
   ============================================================ */
'use strict';

class AIController {
  constructor(difficulty = 'medium') {
    this.difficulty = difficulty;
    this.errorX     = 0;
    this.errorY     = 0;
    this.nextErrorTime = 0;

    const cfg = {
      easy:    { speed: 0.45, error: 55, hitRange: 80, delay: 0.4  },
      medium:  { speed: 0.70, error: 30, hitRange: 65, delay: 0.20 },
      hard:    { speed: 0.88, error: 14, hitRange: 55, delay: 0.08 },
      extreme: { speed: 1.00, error: 4,  hitRange: 45, delay: 0.00 },
    };
    this.cfg = cfg[difficulty] || cfg.medium;
  }

  /** Predict where the ball will cross near the AI's side. */
  predict(ball) {
    if (ball.vy >= 0) return { x: ball.x, y: ball.y };
    const t = (NET_Y - ball.y) / -ball.vy;
    return { x: ball.x + ball.vx * t, y: ball.y + ball.vy * t };
  }

  update(player, ball, dt, time) {
    // Refresh position error periodically
    if (time > this.nextErrorTime) {
      this.errorX = (Math.random() - 0.5) * this.cfg.error;
      this.errorY = (Math.random() - 0.5) * this.cfg.error * 0.5;
      this.nextErrorTime = time + 700 + Math.random() * 1400;
    }

    let targetX, targetY;
    if (ball.inPlay && ball.y < NET_Y + 100 && ball.lastHitter !== player.id) {
      const pred = this.predict(ball);
      targetX = pred.x + this.errorX;
      targetY = COURT_TOP + 70 + this.errorY;
    } else {
      targetX = COURT_MID_X + this.errorX * 0.3;
      targetY = COURT_TOP + 70;
    }

    targetX = Phaser.Math.Clamp(targetX, COURT_LEFT + 22, COURT_RIGHT - 22);
    targetY = Phaser.Math.Clamp(targetY, COURT_TOP + 10, NET_Y - 12);

    const dx   = targetX - player.x;
    const dy   = targetY - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 10) {
      player.move((dx / dist) * this.cfg.speed, (dy / dist) * this.cfg.speed, dt);
    } else {
      player.move(0, 0, dt);
    }

    // Try to return the ball
    if (ball.inPlay && ball.lastHitter !== player.id && player.canReachBall(ball)) {
      const r = Math.random();
      let type;
      if      (this.difficulty === 'easy')   type = r < 0.7 ? 'normal' : 'topspin';
      else if (this.difficulty === 'medium') type = ['normal', 'topspin', 'slice'][Math.floor(r * 3)];
      else                                   type = ['normal', 'topspin', 'slice', 'lob', 'smash'][Math.floor(r * 5)];

      let tx, ty;
      if (this.difficulty === 'extreme') {
        tx = Math.random() > 0.5 ? COURT_LEFT + 25 : COURT_RIGHT - 25;
        ty = COURT_BOTTOM - 30;
      } else {
        tx = Phaser.Math.Between(COURT_LEFT + 35, COURT_RIGHT - 35) + this.errorX;
        ty = Phaser.Math.Between(NET_Y + 25, COURT_BOTTOM - 25) + this.errorY;
      }
      player.hit(ball, type, tx, ty);
    }
  }
}
