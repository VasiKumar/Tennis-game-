/* ============================================================
   POCKET TENNIS LEAGUE — Training Scene
   ============================================================ */
'use strict';

class TrainingScene extends Phaser.Scene {
  constructor() { super('TrainingScene'); }

  create() {
    const w = this.scale.width, h = this.scale.height;
    this.currentDrill  = 'menu';
    this.drillScore    = 0;
    this.hitsRemaining = 0;
    this.drillTimer    = 0;
    this.drillActive   = false;
    this.targets       = [];
    this.bounceParticles = [];

    // Court
    this.add.image(w / 2, h / 2, 'court_hard').setDepth(0);
    this.emitterGfx = this.add.graphics().setDepth(11);

    // Player & ball
    this.player = new Player(this, 1, COURT_MID_X, COURT_BOTTOM - 70, true);
    this.ball   = new TennisBall(this);

    // Keyboard
    this.keys = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.UP,
      down:  Phaser.Input.Keyboard.KeyCodes.DOWN,
      left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W, s: Phaser.Input.Keyboard.KeyCodes.S,
      a: Phaser.Input.Keyboard.KeyCodes.A, d: Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
    });

    this.input.on('pointerdown', (p) => {
      synth.resume();
      this.joy && this.joy.handlePointer(p, true);
    });
    this.input.on('pointerup',   (p) => { this.joy && this.joy.handlePointer(p, false); });
    this.input.on('pointermove', (p) => { this.joy && this.joy.handleMove(p); });

    this._buildMenu(w, h);
  }

  _buildMenu(w, h) {
    if (this.menuGroup) this.menuGroup.clear(true, true);
    this.menuGroup = this.add.group();

    const overlay = this.add.graphics().setDepth(20);
    overlay.fillStyle(0x000000, 0.72);
    overlay.fillRect(0, 0, w, h);
    this.menuGroup.add(overlay);

    const title = this.add.text(w / 2, 80, '🎯 TRAINING MODE', {
      fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#1a3aff', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(21);
    this.menuGroup.add(title);

    const drills = [
      { key: 'serve',    label: '🎾 SERVE PRACTICE',  desc: '10 serves, hit targets', color: 0x22aa55 },
      { key: 'target',   label: '🎯 TARGET SHOTS',    desc: 'Hit the targets',         color: 0x1a6bff },
      { key: 'reaction', label: '⚡ REACTION DRILLS', desc: 'React to fast balls',     color: 0xcc8800 },
    ];

    drills.forEach((d, i) => {
      const by = 185 + i * 112;
      const bg = this.add.graphics().setDepth(21);
      const draw = (a) => {
        bg.clear();
        bg.fillStyle(d.color, a);
        bg.fillRoundedRect(w / 2 - 144, by, 288, 82, 14);
        bg.lineStyle(2, 0xffffff, 0.18 * a);
        bg.strokeRoundedRect(w / 2 - 144, by, 288, 82, 14);
      };
      draw(0.88);
      this.menuGroup.add(bg);

      const lt = this.add.text(w / 2, by + 25, d.label, {
        fontSize: '18px', fontStyle: 'bold', color: '#ffffff',
        stroke: '#00000044', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(22);
      this.menuGroup.add(lt);

      const dt = this.add.text(w / 2, by + 54, d.desc, {
        fontSize: '12px', color: '#ffffffaa',
      }).setOrigin(0.5).setDepth(22);
      this.menuGroup.add(dt);

      const z = this.add.zone(w / 2, by + 41, 288, 82).setInteractive({ useHandCursor: true }).setDepth(23);
      z.on('pointerdown', () => { synth.menuTap(); this._startDrill(d.key, w, h); });
      z.on('pointerover', () => draw(0.72));
      z.on('pointerout',  () => draw(0.88));
      this.menuGroup.add(z);
    });

    // Back
    const bbg = this.add.graphics().setDepth(21);
    bbg.fillStyle(0x1a2244, 0.9);
    bbg.fillRoundedRect(w / 2 - 70, h - 76, 140, 44, 10);
    this.menuGroup.add(bbg);
    const bt = this.add.text(w / 2, h - 54, '← BACK', { fontSize: '15px', color: '#aabbff' }).setOrigin(0.5).setDepth(22);
    this.menuGroup.add(bt);
    const bz = this.add.zone(w / 2, h - 54, 140, 44).setInteractive({ useHandCursor: true }).setDepth(23);
    bz.on('pointerdown', () => { synth.menuTap(); this.scene.start('MenuScene'); });
    this.menuGroup.add(bz);
  }

  _startDrill(key, w, h) {
    this.menuGroup.clear(true, true);
    this.currentDrill  = key;
    this.drillScore    = 0;
    this.drillActive   = true;
    this.drillTimer    = 0;
    this.hitsRemaining = key === 'serve' ? 10 : key === 'target' ? 8 : 15;

    if (!this.joy) this.joy = new VirtualJoystick(this, 72, h - 112);

    this.drillScoreText = this.add.text(w / 2, 28, 'HITS: 0/' + this.hitsRemaining, {
      fontSize: '18px', fontStyle: 'bold', color: '#ffd700',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(20);
    this.drillTimerText = this.add.text(w - 18, 28, '0.0s', {
      fontSize: '14px', color: '#aabbcc',
    }).setOrigin(1, 0.5).setDepth(20);

    // Hit button
    const hg = this.add.graphics().setDepth(30);
    hg.fillStyle(0x1a6bff, 0.9);
    hg.fillCircle(w - 68, h - 110, 46);
    this.add.text(w - 68, h - 110, 'HIT', {
      fontSize: '13px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(31);
    const hz = this.add.zone(w - 68, h - 110, 92, 92).setInteractive().setDepth(32);
    hz.on('pointerdown', () => this._performHit());

    // Keyboard space
    this.input.keyboard.once('keydown-SPACE', () => this._performHit());

    // Back button
    const bg = this.add.graphics().setDepth(30);
    bg.fillStyle(0x1a2244, 0.7);
    bg.fillRoundedRect(10, 10, 74, 34, 7);
    this.add.text(47, 27, '← BACK', { fontSize: '11px', color: '#aabbff' }).setOrigin(0.5).setDepth(31);
    const bz = this.add.zone(47, 27, 74, 34).setInteractive().setDepth(32);
    bz.on('pointerdown', () => {
      this.drillActive = false;
      this.ball.hide();
      this._clearTargets();
      if (this.joy) { this.joy.destroy(); this.joy = null; }
      this._buildMenu(w, h);
    });

    if (key === 'target') this._placeTargets();
    this._launchBall();
  }

  _placeTargets() {
    this._clearTargets();
    for (let i = 0; i < 3; i++) {
      const tx  = Phaser.Math.Between(COURT_LEFT + 30, COURT_RIGHT - 30);
      const ty  = Phaser.Math.Between(COURT_TOP + 20, NET_Y - 20);
      const vp  = perspect(tx, ty);
      const img = this.add.image(vp.x, vp.y, 'target').setDepth(7).setAlpha(0.85).setScale(vp.scale);
      this.tweens.add({ targets: img, scaleX: img.scaleX * 1.2, scaleY: img.scaleY * 1.2, duration: 500, yoyo: true, repeat: -1 });
      this.targets.push({ x: tx, y: ty, img });
    }
  }

  _clearTargets() {
    this.targets.forEach(t => t.img.destroy());
    this.targets = [];
  }

  _launchBall() {
    const fx    = Phaser.Math.Between(COURT_LEFT + 30, COURT_RIGHT - 30);
    const speed = this.currentDrill === 'reaction' ? 420 + Math.random() * 160 : 260 + Math.random() * 100;
    this.ball.launch(fx, COURT_TOP + 50, COURT_MID_X, COURT_BOTTOM - 70, speed, 'topspin', 2);
  }

  _performHit() {
    if (!this.drillActive) return;
    const w = this.scale.width;
    let success = false;

    if (this.currentDrill === 'target') {
      const near = this.targets.find(t => Math.abs(this.ball.x - t.x) < 55 && Math.abs(this.ball.y - t.y) < 55);
      if (this.player.canReachBall(this.ball) || near) {
        success = true;
        if (near) {
          near.img.destroy();
          this.targets = this.targets.filter(t => t !== near);
        }
      }
    } else {
      success = this.player.canReachBall(this.ball) || this.ball.z < 110;
    }

    if (success) {
      this.drillScore++;
      this.hitsRemaining--;
      synth.ballHit(0.8);
      this.cameras.main.shake(50, 0.004);
      if (this.drillScoreText) {
        this.drillScoreText.setText('HITS: ' + this.drillScore + '/' + (this.drillScore + this.hitsRemaining));
      }
      const tx = Phaser.Math.Between(COURT_LEFT + 30, COURT_RIGHT - 30);
      const ty = Phaser.Math.Between(COURT_TOP + 20, NET_Y - 30);
      this.ball.launch(this.player.x, this.player.y, tx, ty, 280, 'topspin', 1);

      if (this.hitsRemaining <= 0) {
        this._endDrill(w, this.scale.height);
        return;
      }
      this.time.delayedCall(1500, () => {
        if (this.drillActive) {
          this._launchBall();
          if (this.currentDrill === 'target' && this.targets.length === 0) this._placeTargets();
        }
      });
    } else {
      const vp  = perspect(w / 2, NET_Y + 60);
      const lbl = this.add.text(vp.x, vp.y, 'MISS!', {
        fontSize: '20px', fontStyle: 'bold', color: '#ff3333', stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5).setDepth(22);
      this.tweens.add({ targets: lbl, alpha: 0, y: vp.y - 40, duration: 700, onComplete: () => lbl.destroy() });
    }
  }

  _endDrill(w, h) {
    this.drillActive = false;
    this.ball.hide();
    this._clearTargets();

    const overlay = this.add.graphics().setDepth(40);
    overlay.fillStyle(0x000000, 0.78);
    overlay.fillRect(0, 0, w, h);

    this.add.text(w / 2, h / 2 - 105, '🎯 DRILL COMPLETE!', {
      fontSize: '24px', fontStyle: 'bold', color: '#ffd700', stroke: '#aa7700', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(41);

    const total = this.drillScore + this.hitsRemaining;
    const pct   = Math.round((this.drillScore / Math.max(1, total)) * 100);
    const grade = pct >= 90 ? 'S+' : pct >= 75 ? 'A' : pct >= 60 ? 'B' : pct >= 40 ? 'C' : 'D';

    this.add.text(w / 2, h / 2 - 52, 'Score: ' + this.drillScore + '   Grade: ' + grade, {
      fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(41);
    this.add.text(w / 2, h / 2, 'Accuracy: ' + pct + '%', {
      fontSize: '16px', color: '#aabbcc',
    }).setOrigin(0.5).setDepth(41);

    synth.victory();

    const mkBtn = (y, label, color, action) => {
      const bg = this.add.graphics().setDepth(41);
      bg.fillStyle(color, 0.92); bg.fillRoundedRect(w / 2 - 112, y - 26, 224, 52, 12);
      this.add.text(w / 2, y, label, { fontSize: '17px', fontStyle: 'bold', color: '#ffffff' }).setOrigin(0.5).setDepth(42);
      this.add.zone(w / 2, y, 224, 52).setInteractive().setDepth(43).on('pointerdown', action);
    };
    mkBtn(h / 2 + 66,  '🔄 TRY AGAIN', 0x22aa55, () => {
      if (this.joy) { this.joy.destroy(); this.joy = null; }
      this._startDrill(this.currentDrill, w, h);
    });
    mkBtn(h / 2 + 136, '🏠 MENU', 0x1a3a6b, () => {
      if (this.joy) { this.joy.destroy(); this.joy = null; }
      this.scene.start('MenuScene');
    });
  }

  update(time, delta) {
    if (!this.drillActive) return;
    const dt = delta / 1000;
    this.drillTimer += dt;
    if (this.drillTimerText) this.drillTimerText.setText(this.drillTimer.toFixed(1) + 's');

    // Keyboard movement
    if (this.keys) {
      const kbDx = (this.keys.right.isDown || this.keys.d.isDown ? 1 : 0)
                 - (this.keys.left.isDown  || this.keys.a.isDown ? 1 : 0);
      const kbDy = (this.keys.down.isDown  || this.keys.s.isDown ? 1 : 0)
                 - (this.keys.up.isDown    || this.keys.w.isDown ? 1 : 0);
      if (!this.joy?.active && (kbDx !== 0 || kbDy !== 0)) {
        this.player.move(kbDx, kbDy, dt);
      }
    }
    if (this.joy?.active) this.player.move(this.joy.dx, this.joy.dy, dt);

    this.player.update(dt);
    this.ball.update(dt);

    // Particle update
    this.emitterGfx.clear();
    this.bounceParticles = this.bounceParticles.filter(p => {
      p.life -= dt;
      if (p.life <= 0) return false;
      p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 100 * dt;
      const a  = p.life / p.maxLife;
      const vp = perspect(p.x, p.y);
      this.emitterGfx.fillStyle(p.color, a);
      this.emitterGfx.fillCircle(vp.x, vp.y, p.r * a * vp.scale);
      return true;
    });

    if (this.ball.inPlay && this.ball.bounces >= 2) {
      this.ball.hide();
      if (this.drillActive) {
        this.time.delayedCall(800, () => { if (this.drillActive) this._launchBall(); });
      }
    }
  }
}
