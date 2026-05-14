/* ============================================================
   POCKET TENNIS LEAGUE — Match Scene
   Full perspective court, touch + keyboard controls.
   ============================================================ */
'use strict';

class MatchScene extends Phaser.Scene {
  constructor() { super('MatchScene'); }

  init(data) {
    this.mode       = data.mode       || 'pvc';
    this.difficulty = data.difficulty || 'medium';
    this.courtType  = data.court      || this.registry.get('selectedCourt') || 'grass';
    this.leagueCode = data.leagueCode || null;
    this.p1name     = data.p1name     || 'Player 1';
    this.p2name     = data.p2name     || (this.mode === 'pvc' ? 'CPU' : 'Player 2');
  }

  create() {
    const w = this.scale.width, h = this.scale.height;
    this.isPaused          = false;
    this.gameOver          = false;
    this.rallyCount        = 0;
    this.servingPlayer     = 1;
    this.waitingForServe   = true;
    this.serveTimer        = 0;
    this.pointDelay        = 0;
    this.inPoint           = false;
    this.bounceParticles   = [];

    this.cameras.main.fadeIn(220, 0, 0, 0);

    // ── Court background (perspective texture) ──
    const courtKey = 'court_' + this.courtType;
    this.add.image(w / 2, h / 2, courtKey).setDepth(0);

    // ── Particles layer ──
    this.emitterGfx = this.add.graphics().setDepth(11);

    // ── Score ──
    this.score = new ScoreSystem();

    // ── Players ──
    this.player1 = new Player(this, 1, COURT_MID_X, COURT_BOTTOM - 80, true);
    this.player1.setName(this.p1name);
    this.player2 = new Player(this, 2, COURT_MID_X, COURT_TOP + 80, this.mode === 'hvh');
    this.player2.setName(this.p2name);

    // ── AI ──
    if (this.mode === 'pvc') this.ai = new AIController(this.difficulty);

    // ── Ball ──
    this.ball = new TennisBall(this);

    // ── Controls ──
    this._setupControls(w, h);

    // ── HUD ──
    this._createScoreUI(w);
    this._setupServe(1);

    // ── Pause button ──
    const pauseG = this.add.graphics().setDepth(20);
    pauseG.fillStyle(0x000000, 0.5);
    pauseG.fillRoundedRect(w - 52, 10, 42, 36, 8);
    this.add.text(w - 31, 28, '⏸', { fontSize: '18px' }).setOrigin(0.5).setDepth(21);
    this.add.zone(w - 31, 28, 42, 36).setInteractive().setDepth(22)
      .on('pointerdown', () => this._togglePause());

    // ── Match timer ──
    this.matchTimer = 0;
    this.timerText  = this.add.text(w / 2, 15, '00:00', {
      fontSize: '11px', color: '#7788aa',
    }).setOrigin(0.5).setDepth(20);
  }

  // ── Controls setup ──────────────────────────────────────────
  _setupControls(w, h) {
    const isHvH = this.mode === 'hvh';
    this.joy1 = new VirtualJoystick(this, 72, h - 112);
    this._createActionButtons(w, h, 1);
    if (isHvH) {
      this.joy2 = new VirtualJoystick(this, 72, 115);
      this._createActionButtons(w, h, 2);
    }

    // ── Keyboard ──
    this.keys = this.input.keyboard.addKeys({
      up:    Phaser.Input.Keyboard.KeyCodes.UP,
      down:  Phaser.Input.Keyboard.KeyCodes.DOWN,
      left:  Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w:     Phaser.Input.Keyboard.KeyCodes.W,
      s:     Phaser.Input.Keyboard.KeyCodes.S,
      a:     Phaser.Input.Keyboard.KeyCodes.A,
      d:     Phaser.Input.Keyboard.KeyCodes.D,
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
      z:     Phaser.Input.Keyboard.KeyCodes.Z,
      x:     Phaser.Input.Keyboard.KeyCodes.X,
      c:     Phaser.Input.Keyboard.KeyCodes.C,
      esc:   Phaser.Input.Keyboard.KeyCodes.ESC,
    });

    // ── Touch / pointer ──
    this.pendingShot  = 'normal';
    this.hitPressed   = false;
    this.swipeStart   = null;
    this.actionPointers = {};

    this.input.on('pointerdown', (p) => {
      synth.resume();
      this.swipeStart = { x: p.x, y: p.y };
      this.joy1.handlePointer(p, true);
      if (isHvH && this.joy2) this.joy2.handlePointer(p, true);
      if (this.waitingForServe && this.servingPlayer === 1 && p.y >= h * 0.45) this._doServe(1);
      if (isHvH && this.waitingForServe && this.servingPlayer === 2 && p.y <= h * 0.55) this._doServe(2);
    });
    this.input.on('pointerup', (p) => {
      this.joy1.handlePointer(p, false);
      if (isHvH && this.joy2) this.joy2.handlePointer(p, false);
      if (this.swipeStart) {
        const dx   = p.x - this.swipeStart.x;
        const dy   = p.y - this.swipeStart.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 38) {
          this.pendingShot = dy < -28 ? 'lob' : dy > 28 ? 'slice' : 'topspin';
        }
        this.swipeStart = null;
      }
    });
    this.input.on('pointermove', (p) => {
      this.joy1.handleMove(p);
      if (isHvH && this.joy2) this.joy2.handleMove(p);
    });
  }

  _createActionButtons(w, h, playerNum) {
    const isP2  = playerNum === 2;
    const baseY = isP2 ? 148 : h - 112;
    const rx    = w - 68;

    const buttons = [
      { key: 'hit',   tex: 'btn_hit',   x: rx,      y: baseY,       label: 'HIT',  sz: 84 },
      { key: 'lob',   tex: 'btn_lob',   x: rx - 66, y: baseY - 52,  label: 'LOB',  sz: 64 },
      { key: 'spin',  tex: 'btn_spin',  x: rx + 4,  y: baseY - 62,  label: 'SPIN', sz: 64 },
      { key: 'smash', tex: 'btn_smash', x: rx - 66, y: baseY + 52,  label: 'SMSH', sz: 64 },
    ];

    buttons.forEach(b => {
      this.add.image(b.x, b.y, b.tex).setDepth(30).setAlpha(0.8);
      this.add.text(b.x, b.y, b.label, {
        fontSize: b.key === 'hit' ? '12px' : '10px',
        fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5).setDepth(31);

      const zone = this.add.zone(b.x, b.y, b.sz, b.sz).setInteractive().setDepth(32);
      zone.on('pointerdown', () => {
        synth.menuTap();
        if (playerNum === 1) {
          if (b.key === 'hit')   { this._tryHit(1); }
          if (b.key === 'lob')   { this.pendingShot = 'lob';     this._tryHit(1); }
          if (b.key === 'spin')  { this.pendingShot = 'topspin'; this._tryHit(1); }
          if (b.key === 'smash') { this.pendingShot = 'smash';   this._tryHit(1); }
          if (this.waitingForServe && this.servingPlayer === 1) this._doServe(1);
        } else {
          if (b.key === 'hit')   { this._tryHit(2); }
          if (b.key === 'lob')   { this.pendingShot = 'lob';     this._tryHit(2); }
          if (b.key === 'spin')  { this.pendingShot = 'topspin'; this._tryHit(2); }
          if (b.key === 'smash') { this.pendingShot = 'smash';   this._tryHit(2); }
          if (this.waitingForServe && this.servingPlayer === 2) this._doServe(2);
        }
      });
    });
  }

  // ── Score HUD ───────────────────────────────────────────────
  _createScoreUI(w) {
    const h = this.scale.height;
    this.add.image(w / 2, 32, 'score_panel').setDepth(19);

    // Player indicators
    this.add.text(12, 10, '🔵', { fontSize: '14px' }).setDepth(20);
    this.p1NameText = this.add.text(32, 10, this.player1.name.substring(0, 11), {
      fontSize: '11px', fontStyle: 'bold', color: '#88ccff',
    }).setDepth(20);
    this.add.text(12, 36, '🔴', { fontSize: '14px' }).setDepth(20);
    this.p2NameText = this.add.text(32, 36, this.player2.name.substring(0, 11), {
      fontSize: '11px', fontStyle: 'bold', color: '#ff8888',
    }).setDepth(20);

    // Points (center)
    this.scoreText = this.add.text(w / 2, 28, '0  —  0', {
      fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(20);

    // Games / sets (right)
    this.gameText = this.add.text(w - 82, 18, 'G 0-0', {
      fontSize: '11px', color: '#aabbcc',
    }).setOrigin(0.5).setDepth(20);
    this.setText = this.add.text(w - 82, 42, 'S 0-0', {
      fontSize: '11px', color: '#aabbcc',
    }).setOrigin(0.5).setDepth(20);

    // Rally counter (near net line)
    const netVP = perspect(COURT_MID_X, NET_Y);
    this.rallyText = this.add.text(w / 2, netVP.y - 20, '', {
      fontSize: '13px', fontStyle: 'bold', color: '#ffd70099',
      stroke: '#00000044', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(12).setVisible(false);

    // Shot speed readout
    this.speedText = this.add.text(w / 2, netVP.y + 18, '', {
      fontSize: '10px', color: '#88aaffaa',
    }).setOrigin(0.5).setDepth(12);

    // Point announcement (center screen)
    this.pointText = this.add.text(w / 2, h * 0.45, '', {
      fontSize: '28px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(25).setAlpha(0);

    // Serve prompt
    this.serveText = this.add.text(w / 2, h * 0.6, 'TAP / SPACE TO SERVE', {
      fontSize: '16px', fontStyle: 'bold', color: '#ffd700',
      stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(25);
    this.tweens.add({ targets: this.serveText, alpha: 0.2, duration: 560, yoyo: true, repeat: -1 });

    // Keyboard hint strip
    this.add.text(w / 2, h - 10, 'Arrows/WASD=Move  Space/Enter=Hit  Z=Lob  X=Spin  C=Smash', {
      fontSize: '9px', color: '#33557788',
    }).setOrigin(0.5).setDepth(20);
  }

  _updateScoreUI() {
    const s = this.score;
    this.scoreText.setText(s.displayPoints(1) + '  —  ' + s.displayPoints(2));
    this.gameText.setText('G ' + s.displayGames(1) + '-' + s.displayGames(2));
    this.setText.setText('S ' + s.displaySets(1) + '-' + s.displaySets(2));
  }

  // ── Serve & hit logic ────────────────────────────────────────
  _setupServe(player) {
    this.waitingForServe = true;
    this.servingPlayer   = player;
    this.inPoint         = false;
    this.ball.hide();
    this.rallyCount      = 0;

    const p = player === 1 ? this.player1 : this.player2;
    p.x = COURT_MID_X;
    p.y = player === 1 ? COURT_BOTTOM - 70 : COURT_TOP + 70;

    this.serveText.setText('P' + player + ' — TAP / SPACE TO SERVE');
    this.serveText.setVisible(true);
  }

  _doServe(player) {
    if (!this.waitingForServe) return;
    this.waitingForServe = false;
    this.serveText.setVisible(false);
    this.inPoint = true;

    const p  = player === 1 ? this.player1 : this.player2;
    const tx = Phaser.Math.Between(COURT_LEFT + 40, COURT_RIGHT - 40);
    const ty = player === 1
      ? Phaser.Math.Between(COURT_TOP + 30, NET_Y - 30)
      : Phaser.Math.Between(NET_Y + 30, COURT_BOTTOM - 30);

    synth.serve();
    this.ball.launch(p.x, p.y, tx, ty, 320, 'topspin', player);
    this.cameras.main.shake(100, 0.006);
  }

  _tryHit(player) {
    if (this.waitingForServe) {
      if (this.servingPlayer === player) this._doServe(player);
      return;
    }
    if (!this.ball.inPlay) return;
    const p = player === 1 ? this.player1 : this.player2;
    if (this.ball.lastHitter === player) return;
    if (p.hitCooldown > 0) return;

    const shotType   = this.pendingShot || 'normal';
    this.pendingShot = 'normal';

    const tx = Phaser.Math.Between(COURT_LEFT + 30, COURT_RIGHT - 30);
    const ty = player === 1
      ? Phaser.Math.Between(COURT_TOP + 20, NET_Y - 20)
      : Phaser.Math.Between(NET_Y + 20, COURT_BOTTOM - 20);

    if (p.hit(this.ball, shotType, tx, ty)) {
      this.rallyCount++;
      if (this.rallyText) {
        const fire = this.rallyCount >= 10 ? ' 🔥🔥' : this.rallyCount >= 5 ? ' 🔥' : '';
        this.rallyText.setVisible(this.rallyCount > 2);
        this.rallyText.setText('RALLY: ' + this.rallyCount + fire);
      }

      const shotLabels = {
        normal: 'HIT!', topspin: 'TOPSPIN!', slice: 'SLICE!',
        lob: 'LOB!', smash: 'SMASH! 💥', drop: 'DROP!',
      };
      const vp = perspect(p.x, p.y);
      const lbl = this.add.text(vp.x, vp.y - 35, shotLabels[shotType] || 'HIT!', {
        fontSize: shotType === 'smash' ? '20px' : '14px',
        fontStyle: 'bold',
        color: shotType === 'smash' ? '#ff4444' : shotType === 'lob' ? '#44ff88' : '#ffffff',
        stroke: '#000000', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(15);
      this.tweens.add({
        targets: lbl, y: vp.y - 75, alpha: 0, duration: 700, ease: 'Cubic.Out',
        onComplete: () => lbl.destroy(),
      });

      if (shotType === 'smash') {
        this.cameras.main.zoomTo(1.18, 140);
        this.time.delayedCall(320, () => this.cameras.main.zoomTo(1, 200));
        this.cameras.main.shake(160, 0.012);
      }
      synth.crowd(Math.min(0.3 + this.rallyCount * 0.06, 1));
    }
  }

  // ── Ball-out detection ───────────────────────────────────────
  _checkBallOut() {
    const ball = this.ball;
    if (!ball.inPlay) return;

    // Net collision
    if (ball.z < 28 && ball.z >= 0 &&
        Math.abs(ball.y - NET_Y) < 16 &&
        ball.x > COURT_LEFT && ball.x < COURT_RIGHT) {
      synth.netHit();
      this.cameras.main.shake(80, 0.006);
      this._announcePoint(ball.lastHitter === 1 ? 2 : 1, '🔴 NET!');
      return;
    }

    if (ball.bounces > 0) {
      const bouncer = ball.bouncePlayer;
      if (!bouncer) return;

      if (ball.x < COURT_LEFT - 2 || ball.x > COURT_RIGHT + 2 ||
          ball.y < COURT_TOP  - 2 || ball.y > COURT_BOTTOM + 2) {
        this._announcePoint(bouncer === 1 ? 2 : 1, '🔴 OUT!');
        return;
      }
      if (bouncer === ball.lastHitter) {
        this._announcePoint(ball.lastHitter === 1 ? 2 : 1, '🔴 FAULT!');
        return;
      }
      if (ball.bounces >= 2) {
        this._announcePoint(bouncer === 1 ? 2 : 1, '✅ WINNER!');
        return;
      }
    }

    if (ball.isOutOfBounds() && ball.bounces === 0) {
      this._announcePoint(ball.lastHitter === 1 ? 2 : 1, '🔴 LONG!');
    }
  }

  _announcePoint(winner, reason) {
    if (!this.inPoint) return;
    this.inPoint    = false;
    this.rallyCount = 0;
    this.ball.hide();
    if (this.rallyText) this.rallyText.setVisible(false);

    this.score.pointWon(winner);
    this._updateScoreUI();
    synth.point();
    synth.crowd(0.8);

    const winName = winner === 1 ? this.player1.name : this.player2.name;
    this.pointText.setText('✅ ' + winName + '\n' + reason);
    this.tweens.killTweensOf(this.pointText);
    this.pointText.setAlpha(1).setScale(0.5);
    this.tweens.add({ targets: this.pointText, scaleX: 1, scaleY: 1, duration: 240, ease: 'Back.Out' });
    this.tweens.add({ targets: this.pointText, alpha: 0, duration: 380, delay: 1200 });

    if (this.score.matchOver) {
      this.time.delayedCall(1600, () => this._endMatch());
    } else {
      this.time.delayedCall(1600, () => this._setupServe(winner));
    }
  }

  _endMatch() {
    synth.victory();
    const winner  = this.score.winner;
    const winName = winner === 1 ? this.player1.name : this.player2.name;

    // Celebration burst
    for (let i = 0; i < 45; i++) {
      this.time.delayedCall(i * 35, () => {
        this.bounceParticles.push({
          x: Phaser.Math.Between(50, this.scale.width - 50),
          y: Phaser.Math.Between(120, 680),
          vx: (Math.random() - 0.5) * 160,
          vy: -110 - Math.random() * 220,
          life: 1.6, maxLife: 1.6,
          r: 4 + Math.random() * 7,
          color: [0xffd700, 0xff3366, 0x33ffaa, 0x3366ff][Math.floor(Math.random() * 4)],
        });
      });
    }

    this.time.delayedCall(2200, () => {
      this.scene.start('ResultScene', {
        winner: winName, winnerId: winner, score: this.score,
        mode: this.mode, leagueCode: this.leagueCode,
        p1name: this.player1.name, p2name: this.player2.name,
        court: this.courtType,
      });
    });
  }

  // ── Pause overlay ────────────────────────────────────────────
  _togglePause() {
    this.isPaused = !this.isPaused;
    if (this.isPaused) this._showPauseMenu();
    else               this._hidePauseMenu();
  }

  _showPauseMenu() {
    const w = this.scale.width, h = this.scale.height;
    this.pauseGroup = this.add.group();

    const overlay = this.add.graphics().setDepth(40);
    overlay.fillStyle(0x000000, 0.72);
    overlay.fillRect(0, 0, w, h);
    this.pauseGroup.add(overlay);

    const panel = this.add.graphics().setDepth(41);
    panel.fillStyle(0x050d1a, 0.96);
    panel.fillRoundedRect(w / 2 - 135, h / 2 - 130, 270, 260, 18);
    panel.lineStyle(2, 0x2244aa, 0.7);
    panel.strokeRoundedRect(w / 2 - 135, h / 2 - 130, 270, 260, 18);
    this.pauseGroup.add(panel);

    this._pauseBtn(w / 2, h / 2 - 90, '⏸ PAUSED', null, 0x0, true);

    const addBtn = (y, label, color, action) => {
      const bg = this.add.graphics().setDepth(42);
      bg.fillStyle(color, 1);
      bg.fillRoundedRect(w / 2 - 95, y - 23, 190, 46, 10);
      this.pauseGroup.add(bg);
      const t = this.add.text(w / 2, y, label, {
        fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5).setDepth(43);
      this.pauseGroup.add(t);
      const z = this.add.zone(w / 2, y, 190, 46).setInteractive().setDepth(44);
      z.on('pointerdown', action);
      this.pauseGroup.add(z);
    };

    addBtn(h / 2 - 44, '▶ RESUME', 0x1a6bff, () => this._togglePause());
    addBtn(h / 2 + 14, '🔄 RETRY',  0x225533, () => {
      this.scene.restart({ mode: this.mode, difficulty: this.difficulty, court: this.courtType });
    });
    addBtn(h / 2 + 72, '🏠 MENU',   0xaa2233, () => this.scene.start('MenuScene'));
  }

  _pauseBtn(x, y, label, action, color, isTitle) {
    const t = this.add.text(x, y, label, {
      fontSize: isTitle ? '22px' : '16px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(43);
    this.pauseGroup.add(t);
  }

  _hidePauseMenu() {
    if (this.pauseGroup) { this.pauseGroup.clear(true, true); this.pauseGroup = null; }
  }

  // ── Particles ────────────────────────────────────────────────
  emitBounce(x, y) {
    for (let i = 0; i < 6; i++) {
      this.bounceParticles.push({
        x, y,
        vx: (Math.random() - 0.5) * 85,
        vy: -45 - Math.random() * 65,
        life: 0.5, maxLife: 0.5,
        r: 2 + Math.random() * 3,
        color: this.courtType === 'clay' ? 0xc04828 : 0xf5e642,
      });
    }
  }

  _updateParticles(dt) {
    this.emitterGfx.clear();
    this.bounceParticles = this.bounceParticles.filter(p => {
      p.life -= dt;
      if (p.life <= 0) return false;
      p.x  += p.vx * dt;
      p.y  += p.vy * dt;
      p.vy += 130 * dt;
      const a  = p.life / p.maxLife;
      // Use perspective for the particle position
      const vp = perspect(p.x, p.y);
      this.emitterGfx.fillStyle(p.color, a * 0.85);
      this.emitterGfx.fillCircle(vp.x, vp.y, p.r * a * vp.scale);
      return true;
    });
  }

  // ── Update loop ──────────────────────────────────────────────
  update(time, delta) {
    if (this.isPaused || this.gameOver) return;
    const dt = delta / 1000;

    // Match timer
    this.matchTimer += dt;
    const mm = Math.floor(this.matchTimer / 60);
    const ss = Math.floor(this.matchTimer % 60);
    this.timerText.setText(String(mm).padStart(2, '0') + ':' + String(ss).padStart(2, '0'));

    // ── Keyboard ──
    if (this.keys) {
      const kbDx = (this.keys.right.isDown || this.keys.d.isDown ? 1 : 0)
                 - (this.keys.left.isDown  || this.keys.a.isDown ? 1 : 0);
      const kbDy = (this.keys.down.isDown  || this.keys.s.isDown ? 1 : 0)
                 - (this.keys.up.isDown    || this.keys.w.isDown ? 1 : 0);

      // Apply keyboard if joystick idle
      if (!this.joy1.active && (kbDx !== 0 || kbDy !== 0)) {
        this.player1.move(kbDx, kbDy, dt);
      }

      // Hit / serve with Space or Enter
      if (Phaser.Input.Keyboard.JustDown(this.keys.space) ||
          Phaser.Input.Keyboard.JustDown(this.keys.enter)) {
        if (this.waitingForServe && this.servingPlayer === 1) {
          this._doServe(1);
        } else {
          this._tryHit(1);
        }
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.z)) {
        this.pendingShot = 'lob';     this._tryHit(1);
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.x)) {
        this.pendingShot = 'topspin'; this._tryHit(1);
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.c)) {
        this.pendingShot = 'smash';   this._tryHit(1);
      }
      if (Phaser.Input.Keyboard.JustDown(this.keys.esc)) {
        this._togglePause();
      }
    }

    // ── AI ──
    if (this.mode === 'pvc') {
      if (!this.waitingForServe && this.ball.inPlay) {
        this.ai.update(this.player2, this.ball, dt, time);
      }
      if (this.waitingForServe && this.servingPlayer === 2) {
        this.serveTimer += dt;
        if (this.serveTimer > 1.2) { this.serveTimer = 0; this._doServe(2); }
      } else {
        this.serveTimer = 0;
      }
    }

    // ── Joystick movement ──
    if (this.joy1.active) this.player1.move(this.joy1.dx, this.joy1.dy, dt);
    if (this.mode === 'hvh' && this.joy2 && this.joy2.active) {
      this.player2.move(this.joy2.dx, this.joy2.dy, dt);
    }

    // Soft auto-assist (nudge P1 gently toward ball if idle)
    if (this.ball.inPlay && !this.waitingForServe && this.joy1 && !this.joy1.active) {
      const p1 = this.player1;
      if (this.ball.lastHitter !== 1 && this.ball.y > NET_Y + 5) {
        const dx   = this.ball.x - p1.x;
        const dy   = this.ball.y - p1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 95 && dist > 12) p1.move(dx / dist * 0.30, dy / dist * 0.30, dt);
      }
    }

    this.player1.update(dt);
    this.player2.update(dt);
    this.ball.update(dt);

    // Ball speed readout
    if (this.speedText && this.ball.inPlay) {
      const spd = Math.round(Math.sqrt(this.ball.vx ** 2 + this.ball.vy ** 2) * 0.036);
      this.speedText.setText(spd > 22 ? spd + ' km/h' : '');
    }

    this._updateParticles(dt);
    this._checkBallOut();
  }
}
