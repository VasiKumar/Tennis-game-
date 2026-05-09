/* ============================================================
   POCKET TENNIS LEAGUE — League Scene
   ============================================================ */
'use strict';

class LeagueScene extends Phaser.Scene {
  constructor() { super('LeagueScene'); }

  create() {
    const w = this.scale.width, h = this.scale.height;
    this.add.image(w / 2, h / 2, 'logo_bg');
    this.add.image(w / 2, h / 2, 'court_hard').setAlpha(0.07);
    this._buildMainView(w, h);
  }

  _buildMainView(w, h) {
    if (this.viewGroup) this.viewGroup.clear(true, true);
    this.viewGroup = this.add.group();

    const title = this.add.text(w / 2, 65, '🏆 LEAGUE MODE', {
      fontSize: '24px', fontStyle: 'bold', color: '#ffd700',
      stroke: '#aa7700', strokeThickness: 3,
    }).setOrigin(0.5).setDepth(3);
    this.viewGroup.add(title);

    this._addBtn(w / 2, 148, 0x22aa55, '➕ CREATE LEAGUE', () => this._showCreateLeague(w, h));
    this._addBtn(w / 2, 222, 0x1a6bff, '🔗 JOIN LEAGUE',   () => this._showJoinLeague(w, h));

    this._buildLeagueList(w, h, 290);

    this._addBtn(w / 2, h - 54, 0x1a2244, '← BACK', () => { synth.menuTap(); this.scene.start('MenuScene'); });
  }

  _addBtn(x, y, color, label, action) {
    const bg = this.add.graphics().setDepth(3);
    bg.fillStyle(color, 0.92);
    bg.fillRoundedRect(x - 132, y - 26, 264, 52, 12);
    const t = this.add.text(x, y, label, {
      fontSize: '17px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(4);
    const z = this.add.zone(x, y, 264, 52).setInteractive({ useHandCursor: true }).setDepth(5);
    z.on('pointerdown', action);
    z.on('pointerover', () => bg.setAlpha(0.7));
    z.on('pointerout',  () => bg.setAlpha(1));
    if (this.viewGroup) { this.viewGroup.add(bg); this.viewGroup.add(t); this.viewGroup.add(z); }
    return { bg, t, z };
  }

  _buildLeagueList(w, h, startY) {
    const leagues = LeagueManager.getLeagues();
    const keys    = Object.keys(leagues);

    if (keys.length === 0) {
      const t = this.add.text(w / 2, startY + 32, 'No leagues yet.\nCreate or join one!', {
        fontSize: '14px', color: '#445588', align: 'center',
      }).setOrigin(0.5).setDepth(3);
      this.viewGroup.add(t);
      return;
    }

    const hdr = this.add.text(w / 2, startY, 'YOUR LEAGUES', {
      fontSize: '13px', color: '#8899bb',
    }).setOrigin(0.5).setDepth(3);
    this.viewGroup.add(hdr);

    keys.slice(0, 5).forEach((code, i) => {
      const league = leagues[code];
      const by = startY + 36 + i * 72;
      const row = this.add.graphics().setDepth(3);
      row.fillStyle(0x0a1a30, 0.9);
      row.fillRoundedRect(w / 2 - 158, by, 316, 60, 10);
      row.lineStyle(1.5, 0x224488, 0.5);
      row.strokeRoundedRect(w / 2 - 158, by, 316, 60, 10);
      this.viewGroup.add(row);

      const nt = this.add.text(w / 2 - 142, by + 10, league.name || 'League', {
        fontSize: '14px', fontStyle: 'bold', color: '#ffffff',
      }).setDepth(4);
      this.viewGroup.add(nt);

      const ct = this.add.text(w / 2 - 142, by + 32, 'Code: ' + code + '  •  ' + (league.players?.length || 0) + ' players', {
        fontSize: '11px', color: '#8899bb',
      }).setDepth(4);
      this.viewGroup.add(ct);

      const vbg = this.add.graphics().setDepth(4);
      vbg.fillStyle(0x1a3a6b, 1);
      vbg.fillRoundedRect(w / 2 + 78, by + 14, 68, 30, 6);
      this.viewGroup.add(vbg);
      const vt = this.add.text(w / 2 + 112, by + 29, 'VIEW', {
        fontSize: '11px', fontStyle: 'bold', color: '#88ccff',
      }).setOrigin(0.5).setDepth(5);
      this.viewGroup.add(vt);
      const vz = this.add.zone(w / 2 + 112, by + 29, 68, 30).setInteractive({ useHandCursor: true }).setDepth(6);
      vz.on('pointerdown', () => this._showLeagueDetail(w, h, code));
      this.viewGroup.add(vz);
    });
  }

  _showCreateLeague(w, h) {
    const name   = prompt('League Name:',  'My League') || 'My League';
    const player = prompt('Your Name:',    'Player')    || 'Player';
    const code   = LeagueManager.createLeague(name, player);
    alert('League created!\nCode: ' + code + '\n\nShare this code with friends!');
    this._buildMainView(w, h);
  }

  _showJoinLeague(w, h) {
    const code   = (prompt('Enter League Code:', '') || '').toUpperCase().trim();
    if (!code) return;
    const player  = prompt('Your Name:', 'Player') || 'Player';
    const league  = LeagueManager.joinLeague(code, player);
    if (league) {
      alert('Joined league: ' + league.name + '!');
      this._buildMainView(w, h);
    } else {
      alert('League code not found!');
    }
  }

  _showLeagueDetail(w, h, code) {
    const league = LeagueManager.getLeague(code);
    if (!league) return;

    this.viewGroup.clear(true, true);
    this.detailGroup = this.add.group();

    const title = this.add.text(w / 2, 52, league.name, {
      fontSize: '20px', fontStyle: 'bold', color: '#ffd700',
      stroke: '#aa7700', strokeThickness: 2,
    }).setOrigin(0.5).setDepth(3);
    this.detailGroup.add(title);

    this.add.text(w / 2, 82, 'Code: ' + code, {
      fontSize: '13px', color: '#8899bb',
    }).setOrigin(0.5).setDepth(3);

    const sorted = [...(league.players || [])].sort((a, b) => b.points - a.points);
    const hdrBg  = this.add.graphics().setDepth(3);
    hdrBg.fillStyle(0x1a3a6b, 0.8);
    hdrBg.fillRoundedRect(w / 2 - 158, 102, 316, 36, 8);
    this.detailGroup.add(hdrBg);

    const cols  = ['#', 'PLAYER', 'W', 'L', 'PTS'];
    const colsX = [32, 100, 230, 270, 320];
    cols.forEach((c, i) => {
      const ct = this.add.text(colsX[i], 120, c, {
        fontSize: '11px', fontStyle: 'bold', color: '#88aacc',
      }).setOrigin(0.5).setDepth(4);
      this.detailGroup.add(ct);
    });

    sorted.forEach((p, i) => {
      const py = 146 + i * 50;
      const rb = this.add.graphics().setDepth(3);
      rb.fillStyle(i % 2 === 0 ? 0x0a1828 : 0x0d2035, 0.85);
      rb.fillRoundedRect(w / 2 - 158, py, 316, 44, 6);
      if (i === 0) { rb.lineStyle(1.5, 0xffd700, 0.5); rb.strokeRoundedRect(w / 2 - 158, py, 316, 44, 6); }
      this.detailGroup.add(rb);

      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1) + '.';
      [medal, p.name.substring(0, 10), p.wins, p.losses, p.points].forEach((v, j) => {
        const vt = this.add.text(colsX[j], py + 22, String(v), {
          fontSize: j === 1 ? '13px' : '14px',
          fontStyle: j === 1 ? 'normal' : 'bold',
          color: i === 0 ? '#ffd700' : '#ffffff',
        }).setOrigin(0.5).setDepth(4);
        this.detailGroup.add(vt);
      });
    });

    // Play match
    const playY = h - 148;
    const pbg = this.add.graphics().setDepth(3);
    pbg.fillStyle(0x22aa55, 0.9);
    pbg.fillRoundedRect(w / 2 - 122, playY, 244, 50, 12);
    this.detailGroup.add(pbg);
    const pt = this.add.text(w / 2, playY + 25, '⚡ PLAY LEAGUE MATCH', {
      fontSize: '16px', fontStyle: 'bold', color: '#ffffff',
    }).setOrigin(0.5).setDepth(4);
    this.detailGroup.add(pt);
    const pz = this.add.zone(w / 2, playY + 25, 244, 50).setInteractive({ useHandCursor: true }).setDepth(5);
    pz.on('pointerdown', () => {
      synth.menuTap();
      const p1name = sorted[0]?.name || 'Player 1';
      this.scene.start('MatchScene', { mode: 'hvh', court: 'hard', leagueCode: code, p1name, p2name: 'Opponent' });
    });
    this.detailGroup.add(pz);

    // Back
    const bbg = this.add.graphics().setDepth(3);
    bbg.fillStyle(0x1a2244, 0.9);
    bbg.fillRoundedRect(w / 2 - 68, h - 76, 136, 44, 10);
    this.detailGroup.add(bbg);
    const bt = this.add.text(w / 2, h - 54, '← BACK', { fontSize: '15px', color: '#aabbff' }).setOrigin(0.5).setDepth(4);
    this.detailGroup.add(bt);
    const bz = this.add.zone(w / 2, h - 54, 136, 44).setInteractive({ useHandCursor: true }).setDepth(5);
    bz.on('pointerdown', () => { this.detailGroup.clear(true, true); this._buildMainView(w, h); });
    this.detailGroup.add(bz);
  }
}
