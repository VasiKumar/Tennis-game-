/* ============================================================
   POCKET TENNIS LEAGUE — Result Scene
   ============================================================ */
'use strict';

class ResultScene extends Phaser.Scene {
  constructor() { super('ResultScene'); }

  init(data) {
    this.winnerName = data.winner   || 'Player';
    this.winnerId   = data.winnerId || 1;
    this.score      = data.score;
    this.mode       = data.mode;
    this.leagueCode = data.leagueCode;
    this.p1name     = data.p1name   || 'Player 1';
    this.p2name     = data.p2name   || 'Player 2';
    this.court      = data.court    || 'grass';
  }

  create() {
    const w = this.scale.width, h = this.scale.height;

    if (this.leagueCode && this.mode !== 'pvc') {
      LeagueManager.recordResult(
        this.leagueCode, this.winnerName,
        this.winnerId === 1 ? this.p2name : this.p1name
      );
    }

    this.add.image(w / 2, h / 2, 'court_' + this.court).setAlpha(0.18);
    this.add.image(w / 2, h / 2, 'logo_bg').setAlpha(0.88);

    // Confetti
    this.confetti = Array.from({ length: 40 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h - h,
      vx: (Math.random() - 0.5) * 100,
      vy: 60 + Math.random() * 130,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 180,
      color: [0xffd700, 0xff3366, 0x33ffaa, 0x3366ff, 0xff8833][Math.floor(Math.random() * 5)],
      cw: 6 + Math.random() * 9,
      ch: 4 + Math.random() * 6,
    }));
    this.confGfx = this.add.graphics().setDepth(2);

    // Trophy
    const trophy = this.add.text(w / 2, 115, '🏆', { fontSize: '76px' }).setOrigin(0.5).setDepth(3);
    this.tweens.add({ targets: trophy, y: 110, duration: 820, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    this.add.text(w / 2, 210, 'MATCH WINNER!', {
      fontSize: '24px', fontStyle: 'bold', color: '#ffd700',
      stroke: '#aa7700', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(3);

    this.add.text(w / 2, 255, this.winnerName, {
      fontSize: '32px', fontStyle: 'bold', color: '#ffffff',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(3);

    // Score
    if (this.score) {
      const s = this.score;
      this.add.text(w / 2, 308, s.displaySets(1) + ' — ' + s.displaySets(2) + ' SETS', {
        fontSize: '16px', color: '#aabbcc',
      }).setOrigin(0.5).setDepth(3);
      this.add.text(w / 2, 332, s.displayGames(1) + ' — ' + s.displayGames(2) + ' GAMES (FINAL SET)', {
        fontSize: '13px', color: '#778899',
      }).setOrigin(0.5).setDepth(3);
    }

    this.add.text(w / 2, 370, (this.winnerId === 1 ? '🔵 ' : '🔴 ') + this.winnerName + ' WINS!', {
      fontSize: '18px', fontStyle: 'bold',
      color: this.winnerId === 1 ? '#88ccff' : '#ff8888',
    }).setOrigin(0.5).setDepth(3);

    // Buttons
    const btns = [
      { label: '🔄 PLAY AGAIN', y: h - 235, color: 0x1a6bff, action: () =>
        this.scene.start('MatchScene', { mode: this.mode, court: this.court, p1name: this.p1name, p2name: this.p2name }) },
      { label: '🏠 MAIN MENU',  y: h - 163, color: 0x1a3a6b, action: () => this.scene.start('MenuScene') },
      { label: '🏆 LEAGUE',     y: h - 91,  color: 0xcc8800, action: () => this.scene.start('LeagueScene') },
    ];

    btns.forEach(b => {
      const bg = this.add.graphics().setDepth(3);
      const draw = (a) => {
        bg.clear();
        bg.fillStyle(b.color, a);
        bg.fillRoundedRect(w / 2 - 115, b.y - 26, 230, 52, 12);
        bg.lineStyle(1.5, 0x4477cc, 0.5 * a);
        bg.strokeRoundedRect(w / 2 - 115, b.y - 26, 230, 52, 12);
      };
      draw(0.92);
      this.add.text(w / 2, b.y, b.label, {
        fontSize: '17px', fontStyle: 'bold', color: '#ffffff',
      }).setOrigin(0.5).setDepth(4);
      const z = this.add.zone(w / 2, b.y, 230, 52).setInteractive({ useHandCursor: true }).setDepth(5);
      z.on('pointerdown', () => { synth.menuTap(); b.action(); });
      z.on('pointerover', () => draw(0.7));
      z.on('pointerout',  () => draw(0.92));
    });

    synth.victory();
  }

  update(t, dt) {
    this.confGfx.clear();
    this.confetti.forEach(c => {
      c.x   += c.vx  * dt / 1000;
      c.y   += c.vy  * dt / 1000;
      c.rot += c.rotV * dt / 1000;
      if (c.y > this.scale.height + 20) c.y = -20;
      this.confGfx.fillStyle(c.color, 0.85);
      this.confGfx.fillRect(c.x - c.cw / 2, c.y - c.ch / 2, c.cw, c.ch);
    });
  }
}
