/* ============================================================
   POCKET TENNIS LEAGUE — Boot Scene
   ============================================================ */
'use strict';

class BootScene extends Phaser.Scene {
  constructor() { super('BootScene'); }

  preload() {}

  create() {
    const w = this.scale.width, h = this.scale.height;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x07101e, 1);
    bg.fillRect(0, 0, w, h);

    // Grid lines
    const grid = this.add.graphics();
    grid.lineStyle(1, 0x1a3aff, 0.08);
    for (let x = 0; x < w; x += 30) {
      grid.beginPath(); grid.moveTo(x, 0); grid.lineTo(x, h); grid.strokePath();
    }
    for (let y = 0; y < h; y += 30) {
      grid.beginPath(); grid.moveTo(0, y); grid.lineTo(w, y); grid.strokePath();
    }

    // Logo
    this.add.text(w / 2, h / 2 - 100, '🎾', { fontSize: '72px' }).setOrigin(0.5);
    this.add.text(w / 2, h / 2 - 25, 'POCKET TENNIS', {
      fontSize: '28px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#1a3aff', strokeThickness: 4,
    }).setOrigin(0.5);
    this.add.text(w / 2, h / 2 + 12, 'LEAGUE', {
      fontSize: '22px', fontStyle: 'bold', color: '#ffd700',
      stroke: '#aa7700', strokeThickness: 3,
    }).setOrigin(0.5);

    // Progress bar background
    const barBg = this.add.graphics();
    barBg.fillStyle(0x1a2244, 1);
    barBg.fillRoundedRect(w / 2 - 130, h / 2 + 55, 260, 16, 8);

    const barFill = this.add.graphics();
    const loadText = this.add.text(w / 2, h / 2 + 88, 'Loading assets…', {
      fontSize: '12px', color: '#4466aa',
    }).setOrigin(0.5);

    const setBar = (frac) => {
      barFill.clear();
      barFill.fillStyle(0x1a6bff, 1);
      barFill.fillRoundedRect(w / 2 - 130, h / 2 + 55, 260 * frac, 16, 8);
    };

    setBar(0);

    // Generate all textures (single step, but wrapped in a timer so
    // the browser has a chance to paint the splash first).
    this.time.delayedCall(80, () => {
      setBar(0.3);
      AssetGen.generateAll(this);
      setBar(1.0);
      loadText.setText('Tap anywhere to start!');
      const tapHint = this.add.text(w / 2, h / 2 + 125, 'TAP TO PLAY', {
        fontSize: '15px', fontStyle: 'bold', color: '#ffd700',
        stroke: '#000', strokeThickness: 3,
      }).setOrigin(0.5);
      this.tweens.add({
        targets: tapHint, alpha: 0.2, duration: 540, yoyo: true, repeat: -1,
      });

      // Also show keyboard hint on desktop
      const kbHint = this.add.text(w / 2, h / 2 + 155, 'Keyboard: Arrows/WASD · Space=Hit · Z=Lob · X=Spin · C=Smash', {
        fontSize: '10px', color: '#336699',
      }).setOrigin(0.5);

      this.input.once('pointerdown', () => {
        synth.init();
        synth.resume();
        this.cameras.main.fade(280, 0, 0, 0);
        const sc = this.scene;
        setTimeout(() => sc.start('MenuScene'), 300);
      });
    });
  }
}
