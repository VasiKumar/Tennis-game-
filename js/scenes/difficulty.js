/* ============================================================
   POCKET TENNIS LEAGUE — Difficulty Select Scene
   ============================================================ */
'use strict';

class DifficultyScene extends Phaser.Scene {
  constructor() { super('DifficultyScene'); }

  create() {
    const w = this.scale.width, h = this.scale.height;
    this.add.image(w / 2, h / 2, 'logo_bg');
    this.add.image(w / 2, h / 2, 'court_grass').setAlpha(0.09);

    this.add.text(w / 2, 72, '🎾', { fontSize: '38px' }).setOrigin(0.5);
    this.add.text(w / 2, 124, 'CHOOSE DIFFICULTY', {
      fontSize: '22px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#1a3aff', strokeThickness: 3,
    }).setOrigin(0.5);

    const diffs = [
      { key: 'easy',    label: '😊 EASY',    color: 0x22aa55, desc: 'Perfect for beginners'   },
      { key: 'medium',  label: '😐 MEDIUM',  color: 0xccaa00, desc: 'Balanced challenge'      },
      { key: 'hard',    label: '😤 HARD',    color: 0xcc5500, desc: 'Fast & unpredictable'    },
      { key: 'extreme', label: '💀 EXTREME', color: 0xcc1133, desc: 'No mercy mode'           },
    ];

    const selectedCourt = this.registry.get('selectedCourt') || 'grass';

    diffs.forEach((d, i) => {
      const by = 210 + i * 108;
      const bg = this.add.graphics().setDepth(2);
      const draw = (alpha) => {
        bg.clear();
        bg.fillStyle(d.color, alpha);
        bg.fillRoundedRect(w / 2 - 145, by - 38, 290, 72, 14);
        bg.fillStyle(0xffffff, 0.08 * alpha);
        bg.fillRoundedRect(w / 2 - 140, by - 34, 280, 28, 8);
        bg.lineStyle(2, 0xffffff, 0.2 * alpha);
        bg.strokeRoundedRect(w / 2 - 145, by - 38, 290, 72, 14);
      };
      draw(0.88);
      this.add.text(w / 2, by - 14, d.label, {
        fontSize: '20px', fontStyle: 'bold', color: '#ffffff',
        stroke: '#00000066', strokeThickness: 2,
      }).setOrigin(0.5).setDepth(3);
      this.add.text(w / 2, by + 16, d.desc, {
        fontSize: '12px', color: '#ffffffbb',
      }).setOrigin(0.5).setDepth(3);

      const zone = this.add.zone(w / 2, by, 290, 72).setInteractive({ useHandCursor: true }).setDepth(5);
      zone.on('pointerdown', () => {
        synth.resume(); synth.menuTap();
        this.cameras.main.shake(60, 0.005);
        const sc = this.scene;
        setTimeout(() => sc.start('MatchScene', { mode: 'pvc', difficulty: d.key, court: selectedCourt }), 100);
      });
      zone.on('pointerover', () => draw(0.7));
      zone.on('pointerout',  () => draw(0.88));
    });

    // Back button
    this._makeBackBtn(w, h);
  }

  _makeBackBtn(w, h) {
    const bg = this.add.graphics().setDepth(2);
    bg.fillStyle(0x1a2244, 0.9);
    bg.fillRoundedRect(w / 2 - 65, h - 78, 130, 44, 10);
    this.add.text(w / 2, h - 56, '← BACK', {
      fontSize: '15px', color: '#aabbff',
    }).setOrigin(0.5).setDepth(3);
    const z = this.add.zone(w / 2, h - 56, 130, 44).setInteractive({ useHandCursor: true }).setDepth(5);
    z.on('pointerdown', () => { synth.menuTap(); this.scene.start('MenuScene'); });
    z.on('pointerover', () => { bg.setAlpha(0.7); });
    z.on('pointerout',  () => { bg.setAlpha(1); });
  }
}
