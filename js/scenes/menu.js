/* ============================================================
   POCKET TENNIS LEAGUE — Menu Scene
   ============================================================ */
'use strict';

class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  create() {
    const w = this.scale.width, h = this.scale.height;
    this.cameras.main.fadeIn(400, 0, 0, 0);

    // Background
    this.add.image(w / 2, h / 2, 'logo_bg');

    // Faint court preview
    this.add.image(w / 2, h / 2 + 60, 'court_grass').setAlpha(0.09).setDepth(0);

    // Floating particles
    this.particles = Array.from({ length: 20 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vy: -(0.4 + Math.random() * 0.8),
      alpha: 0.08 + Math.random() * 0.35,
      r: 1.2 + Math.random() * 3,
    }));
    this.particleGfx = this.add.graphics().setDepth(1);

    // Logo card
    const logoCard = this.add.graphics().setDepth(2);
    logoCard.fillStyle(0x07101e, 0.88);
    logoCard.fillRoundedRect(w / 2 - 165, 55, 330, 135, 18);
    logoCard.lineStyle(2, 0x2255cc, 0.55);
    logoCard.strokeRoundedRect(w / 2 - 165, 55, 330, 135, 18);

    this.add.text(w / 2, 88, '🎾', { fontSize: '46px' }).setOrigin(0.5).setDepth(3);
    this.add.text(w / 2, 136, 'POCKET TENNIS', {
      fontSize: '26px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#1a3aff', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(3);
    this.add.text(w / 2, 164, 'LEAGUE', {
      fontSize: '20px', fontStyle: 'bold', color: '#ffd700',
      stroke: '#aa7700', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(3);

    // Menu buttons
    const btns = [
      { label: '⚡ VS COMPUTER',  color: 0x1a6bff, action: () => this.scene.start('DifficultyScene') },
      { label: '👥 VS PLAYER',    color: 0x22aa55, action: () => this.scene.start('MatchScene', { mode: 'hvh', court: this.selectedCourt, difficulty: 'medium' }) },
      { label: '🏆 LEAGUE MODE',  color: 0xcc8800, action: () => this.scene.start('LeagueScene') },
      { label: '🎯 TRAINING',     color: 0x9933cc, action: () => this.scene.start('TrainingScene') },
    ];

    btns.forEach((b, i) => {
      const by = 235 + i * 70;
      this._makeBtn(w / 2, by, b.label, b.color, b.action);
    });

    // Court selector
    this.selectedCourt = 'grass';
    const courts = [
      { key: 'grass', label: 'GRASS', color: 0x22aa44 },
      { key: 'clay',  label: 'CLAY',  color: 0xcc4418 },
      { key: 'hard',  label: 'HARD',  color: 0x2a5090 },
    ];

    this.add.text(w / 2, h - 92, 'COURT SELECT', {
      fontSize: '10px', color: '#7788aa',
    }).setOrigin(0.5).setDepth(3);

    this.courtBtns = [];
    courts.forEach((c, i) => {
      const cx = w / 2 - 70 + i * 70;
      const cbg = this.add.graphics().setDepth(3);
      const ctxt = this.add.text(cx, h - 66, c.label, {
        fontSize: '10px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5).setDepth(4);
      const cz = this.add.zone(cx, h - 66, 62, 28).setInteractive({ useHandCursor: true }).setDepth(5);
      this.courtBtns.push({ c, cbg, ctxt, cx, selected: i === 0 });
      cz.on('pointerdown', () => {
        synth.menuTap();
        this.selectedCourt = c.key;
        this.registry.set('selectedCourt', c.key);
        this.courtBtns.forEach(btn => {
          const sel = btn.c.key === c.key;
          btn.selected = sel;
          btn.cbg.clear();
          btn.cbg.fillStyle(btn.c.color, sel ? 1 : 0.45);
          btn.cbg.fillRoundedRect(btn.cx - 28, h - 80, 56, 28, 6);
          if (sel) { btn.cbg.lineStyle(2, 0xffffff, 0.7); btn.cbg.strokeRoundedRect(btn.cx - 28, h - 80, 56, 28, 6); }
          btn.ctxt.setAlpha(sel ? 1 : 0.6);
        });
      });
      // Initial draw
      cbg.fillStyle(c.color, i === 0 ? 1 : 0.45);
      cbg.fillRoundedRect(cx - 28, h - 80, 56, 28, 6);
      if (i === 0) { cbg.lineStyle(2, 0xffffff, 0.7); cbg.strokeRoundedRect(cx - 28, h - 80, 56, 28, 6); }
    });

    this.registry.set('selectedCourt', 'grass');

    // Animated ball
    this.ballGfx   = this.add.graphics().setDepth(5);
    this.ballAngle = 0;

    // Decorative rackets
    this.add.image(55, h - 130, 'racket').setDepth(2).setAlpha(0.22).setAngle(-32);
    this.add.image(w - 55, h - 130, 'racket').setDepth(2).setAlpha(0.22).setAngle(32).setFlipX(true);

    this.input.on('pointerdown', () => { synth.resume(); });
  }

  _makeBtn(x, y, label, color, action) {
    const bg = this.add.graphics().setDepth(3);
    const draw = (alpha) => {
      bg.clear();
      bg.fillStyle(color, alpha);
      bg.fillRoundedRect(x - 115, y - 26, 230, 52, 14);
      bg.fillStyle(0xffffff, 0.08 * alpha);
      bg.fillRoundedRect(x - 110, y - 22, 220, 22, 8);
      bg.lineStyle(1.5, 0xffffff, 0.2 * alpha);
      bg.strokeRoundedRect(x - 115, y - 26, 230, 52, 14);
    };
    draw(0.9);
    this.add.text(x, y, label, {
      fontSize: '17px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#00000088', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(4);
    const zone = this.add.zone(x, y, 230, 52).setInteractive({ useHandCursor: true }).setDepth(5);
    zone.on('pointerdown', () => {
      synth.resume(); synth.menuTap();
      this.cameras.main.shake(70, 0.005);
      setTimeout(() => action(), 110);
    });
    zone.on('pointerover', () => draw(0.7));
    zone.on('pointerout',  () => draw(0.9));
  }

  update() {
    // Floating particles
    this.particleGfx.clear();
    this.particles.forEach(p => {
      p.y += p.vy;
      if (p.y < -8) p.y = this.scale.height + 8;
      this.particleGfx.fillStyle(0x3366ff, p.alpha);
      this.particleGfx.fillCircle(p.x, p.y, p.r);
    });

    // Orbiting decorative ball
    this.ballAngle += 0.018;
    const bx = this.scale.width / 2 + Math.cos(this.ballAngle) * 140;
    const by = 530 + Math.sin(this.ballAngle * 2) * 22;
    this.ballGfx.clear();
    this.ballGfx.fillStyle(0xf5e642, 0.12);
    this.ballGfx.fillCircle(bx, by, 13);
    this.ballGfx.lineStyle(1, 0xf5e642, 0.38);
    this.ballGfx.strokeCircle(bx, by, 13);
  }
}
