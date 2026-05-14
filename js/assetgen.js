/* ============================================================
   POCKET TENNIS LEAGUE — Asset Generator
   Generates all game textures procedurally via Phaser Graphics.
   ============================================================ */
'use strict';

class AssetGen {
  // ─── Generic helper ──────────────────────────────────────────
  static makeTexture(scene, key, fn, w, h) {
    if (scene.textures.exists(key)) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    fn(g, w, h);
    g.generateTexture(key, w, h);
    g.destroy();
  }

  // ─── Generate ALL assets ─────────────────────────────────────
  static generateAll(scene) {
    AssetGen._makeBall(scene);
    AssetGen._makeBallShadow(scene);
    AssetGen._makePlayerSprite(scene, 'player1', 0x1a6bff, 0x0a44cc, 0xfde8c8, 0xffffff);
    AssetGen._makePlayerSprite(scene, 'player2', 0xe03030, 0xaa1515, 0xfde8c8, 0xffffff);
    AssetGen._makePlayerShadow(scene);
    AssetGen._makeUI(scene);
    AssetGen._makeCourtGrass(scene);
    AssetGen._makeCourtClay(scene);
    AssetGen._makeCourtHard(scene);
    AssetGen._makeLogoBg(scene);
    AssetGen._makeRacket(scene);
    AssetGen._makeTarget(scene);
    AssetGen._makeParticle(scene);
  }

  // ─── Ball ────────────────────────────────────────────────────
  static _makeBall(scene) {
    AssetGen.makeTexture(scene, 'ball', (g) => {
      // Shadow/glow
      g.fillStyle(0xd4c200, 0.3);
      g.fillCircle(12, 12, 12);
      // Main ball
      g.fillStyle(0xf5e642, 1);
      g.fillCircle(11, 11, 10);
      // Highlight
      g.fillStyle(0xffffff, 0.55);
      g.fillEllipse(8, 7, 7, 5);
      // Seam curves
      g.lineStyle(1.5, 0xc8bb00, 0.8);
      g.beginPath(); g.arc(11, 11, 6, -0.6, 0.6, false); g.strokePath();
      g.beginPath(); g.arc(11, 11, 6, Math.PI - 0.6, Math.PI + 0.6, false); g.strokePath();
    }, 24, 24);
  }

  static _makeBallShadow(scene) {
    AssetGen.makeTexture(scene, 'ball_shadow', (g) => {
      g.fillStyle(0x000000, 0.4);
      g.fillEllipse(12, 5, 22, 8);
    }, 24, 10);
  }

  // ─── Player sprites ──────────────────────────────────────────
  // Draws a detailed tennis player viewed from a 3/4 front-facing angle.
  static _makePlayerSprite(scene, key, shirtColor, shirtShadow, skinColor, shortsColor) {
    AssetGen.makeTexture(scene, key, (g) => {
      AssetGen._drawDetailedPlayer(g, shirtColor, shirtShadow, skinColor, shortsColor);
    }, 52, 84);
  }

  static _drawDetailedPlayer(g, shirtColor, shirtShadow, skinColor, shortsColor) {
    // ── Shoes ──
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(8,  72, 14, 9, 3);
    g.fillRoundedRect(26, 72, 14, 9, 3);
    g.fillStyle(0x333333, 1);
    g.fillRect(7, 77, 16, 4);
    g.fillRect(25, 77, 16, 4);

    // ── Socks ──
    g.fillStyle(0xeeeeee, 1);
    g.fillRect(10, 68, 10, 8);
    g.fillRect(28, 68, 10, 8);

    // ── Legs ──
    g.fillStyle(skinColor, 1);
    g.fillRoundedRect(10, 52, 10, 22, 2);
    g.fillRoundedRect(28, 54, 10, 20, 2);
    // Leg shadow
    g.fillStyle(0x000000, 0.1);
    g.fillRect(16, 52, 4, 22);
    g.fillRect(34, 54, 4, 20);

    // ── Shorts ──
    g.fillStyle(shortsColor, 1);
    g.fillRoundedRect(8, 44, 32, 16, 5);
    // Shorts side stripe
    g.fillStyle(shirtColor, 0.6);
    g.fillRect(8,  44, 4, 16);
    g.fillRect(36, 44, 4, 16);
    // Shorts highlight
    g.fillStyle(0xffffff, 0.12);
    g.fillRoundedRect(12, 45, 12, 6, 3);

    // ── Left arm (non-racket) ──
    g.fillStyle(skinColor, 1);
    g.fillRoundedRect(1, 24, 9, 18, 3);
    // Sleeve
    g.fillStyle(shirtColor, 0.8);
    g.fillRoundedRect(1, 24, 9, 8, 3);

    // ── Shirt body ──
    g.fillStyle(shirtColor, 1);
    g.fillRoundedRect(9, 20, 30, 28, 6);
    // Shirt shadow underside
    g.fillStyle(shirtShadow, 0.4);
    g.fillRoundedRect(9, 38, 30, 10, 4);
    // Shirt collar
    g.fillStyle(0xffffff, 0.35);
    g.fillRoundedRect(17, 20, 14, 5, 2);
    // Shirt chest stripe / logo area
    g.fillStyle(0xffffff, 0.18);
    g.fillRoundedRect(13, 27, 20, 3, 1);

    // ── Right arm (racket arm) ──
    g.fillStyle(skinColor, 1);
    g.fillRoundedRect(40, 22, 10, 20, 3);
    // Sleeve
    g.fillStyle(shirtColor, 0.8);
    g.fillRoundedRect(40, 22, 10, 8, 3);

    // ── Racket ──
    // Handle
    g.fillStyle(0x8B4513, 1);
    g.fillRoundedRect(46, 38, 6, 20, 2);
    g.fillStyle(0x5a2800, 0.5);
    g.fillRect(46, 42, 6, 8);
    // Frame (ellipse)
    g.lineStyle(4, 0xcccccc, 1);
    g.strokeEllipse(48, 24, 18, 26);
    g.lineStyle(3, 0xdddddd, 0.8);
    g.strokeEllipse(48, 24, 18, 26);
    // String grid
    g.lineStyle(0.8, 0xcccccc, 0.65);
    for (let sy = 14; sy <= 34; sy += 4) {
      const hw = 7.5 * Math.sqrt(Math.max(0, 1 - Math.pow((sy - 24) / 13, 2)));
      g.beginPath(); g.moveTo(48 - hw, sy); g.lineTo(48 + hw, sy); g.strokePath();
    }
    for (let sx2 = 40; sx2 <= 56; sx2 += 4) {
      g.beginPath(); g.moveTo(sx2, 12); g.lineTo(sx2, 36); g.strokePath();
    }

    // ── Head ──
    g.fillStyle(skinColor, 1);
    g.fillCircle(22, 12, 12);
    // Ears
    g.fillStyle(skinColor, 0.85);
    g.fillCircle(10, 14, 5);
    g.fillCircle(34, 14, 5);

    // ── Hair ──
    g.fillStyle(0x3a2000, 1);
    g.fillEllipse(22, 5, 22, 13);
    g.fillRect(11, 6, 5, 10);
    g.fillRect(28, 6, 5, 10);
    // Hair highlight
    g.fillStyle(0x6b4400, 0.45);
    g.fillEllipse(18, 3, 12, 7);

    // ── Face ──
    // Eyes (whites)
    g.fillStyle(0xffffff, 1);
    g.fillEllipse(16, 13, 8, 6);
    g.fillEllipse(28, 13, 8, 6);
    // Irises
    g.fillStyle(0x336699, 1);
    g.fillCircle(17, 13, 3);
    g.fillCircle(29, 13, 3);
    // Pupils
    g.fillStyle(0x111111, 1);
    g.fillCircle(17, 13, 1.8);
    g.fillCircle(29, 13, 1.8);
    // Eye highlights
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(18, 12, 0.8);
    g.fillCircle(30, 12, 0.8);
    // Eyebrows
    g.fillStyle(0x3a2000, 1);
    g.fillRoundedRect(13, 8, 7, 2, 1);
    g.fillRoundedRect(25, 8, 7, 2, 1);
    // Nose
    g.fillStyle(skinColor, 0.6);
    g.fillEllipse(22, 17, 5, 4);
    g.fillStyle(0x0000000, 0.2);
    g.fillCircle(20, 17, 1.5);
    g.fillCircle(24, 17, 1.5);
    // Mouth
    g.lineStyle(1.5, 0x994433, 0.75);
    g.beginPath(); g.arc(22, 20, 4, 0.1, Math.PI - 0.1); g.strokePath();
  }

  static _makePlayerShadow(scene) {
    AssetGen.makeTexture(scene, 'player_shadow', (g) => {
      g.fillStyle(0x000000, 0.28);
      g.fillEllipse(18, 6, 36, 11);
    }, 36, 12);
  }

  // ─── UI Elements ─────────────────────────────────────────────
  static _makeUI(scene) {
    // Primary button
    AssetGen.makeTexture(scene, 'btn_primary', (g) => {
      g.fillStyle(0x1a6bff, 1);
      g.fillRoundedRect(0, 0, 220, 54, 14);
      g.lineStyle(2, 0x88aaff, 0.6);
      g.strokeRoundedRect(1, 1, 218, 52, 14);
      // Shine
      g.fillStyle(0xffffff, 0.1);
      g.fillRoundedRect(6, 4, 208, 20, 8);
    }, 220, 54);

    // Secondary button
    AssetGen.makeTexture(scene, 'btn_secondary', (g) => {
      g.fillStyle(0x1a2244, 1);
      g.fillRoundedRect(0, 0, 220, 54, 14);
      g.lineStyle(2, 0x4455aa, 0.7);
      g.strokeRoundedRect(1, 1, 218, 52, 14);
    }, 220, 54);

    // Hit button (large circle)
    AssetGen.makeTexture(scene, 'btn_hit', (g) => {
      g.fillStyle(0x1a6bff, 1);
      g.fillCircle(42, 42, 42);
      g.fillStyle(0xffffff, 0.12);
      g.fillEllipse(42, 28, 50, 28);
      g.lineStyle(3, 0x88aaff, 0.7);
      g.strokeCircle(42, 42, 40);
    }, 84, 84);

    // Lob button
    AssetGen.makeTexture(scene, 'btn_lob', (g) => {
      g.fillStyle(0x1a9b4f, 1);
      g.fillCircle(32, 32, 32);
      g.fillStyle(0xffffff, 0.1);
      g.fillEllipse(32, 20, 38, 20);
      g.lineStyle(2, 0x55ff99, 0.7);
      g.strokeCircle(32, 32, 30);
    }, 64, 64);

    // Spin button
    AssetGen.makeTexture(scene, 'btn_spin', (g) => {
      g.fillStyle(0xaa5500, 1);
      g.fillCircle(32, 32, 32);
      g.fillStyle(0xffffff, 0.1);
      g.fillEllipse(32, 20, 38, 20);
      g.lineStyle(2, 0xff9944, 0.7);
      g.strokeCircle(32, 32, 30);
    }, 64, 64);

    // Smash button
    AssetGen.makeTexture(scene, 'btn_smash', (g) => {
      g.fillStyle(0x990011, 1);
      g.fillCircle(32, 32, 32);
      g.fillStyle(0xffffff, 0.1);
      g.fillEllipse(32, 20, 38, 20);
      g.lineStyle(2, 0xff4455, 0.7);
      g.strokeCircle(32, 32, 30);
    }, 64, 64);

    // Joystick base
    AssetGen.makeTexture(scene, 'joystick_base', (g) => {
      g.fillStyle(0x000000, 0.3);
      g.fillCircle(58, 58, 58);
      g.fillStyle(0xffffff, 0.08);
      g.fillCircle(58, 58, 58);
      g.lineStyle(2, 0xffffff, 0.22);
      g.strokeCircle(58, 58, 56);
      // Inner ring
      g.lineStyle(1, 0xffffff, 0.1);
      g.strokeCircle(58, 58, 35);
    }, 116, 116);

    // Joystick thumb
    AssetGen.makeTexture(scene, 'joystick_thumb', (g) => {
      g.fillStyle(0x4488ff, 0.55);
      g.fillCircle(30, 30, 30);
      g.fillStyle(0xffffff, 0.3);
      g.fillEllipse(30, 18, 30, 18);
      g.lineStyle(2, 0xaaccff, 0.65);
      g.strokeCircle(30, 30, 28);
    }, 60, 60);

    // Score panel
    AssetGen.makeTexture(scene, 'score_panel', (g) => {
      g.fillStyle(0x020b18, 0.92);
      g.fillRoundedRect(0, 0, 380, 65, 0);
      g.fillStyle(0x1a3a6b, 0.4);
      g.fillRect(0, 63, 380, 2);
    }, 380, 65);

    // General panel
    AssetGen.makeTexture(scene, 'panel', (g) => {
      g.fillStyle(0x050d1a, 0.94);
      g.fillRoundedRect(0, 0, 340, 520, 20);
      g.lineStyle(2, 0x2244aa, 0.5);
      g.strokeRoundedRect(1, 1, 338, 518, 20);
    }, 340, 520);

    // Particle
    AssetGen.makeTexture(scene, 'particle', (g) => {
      g.fillStyle(0xffffff, 1);
      g.fillCircle(5, 5, 5);
    }, 10, 10);
  }

  // ─── Court Textures (perspective 3/4 view) ───────────────────
  // Each court texture is a full-canvas (W×H) image with:
  //   • Stadium background (audience, lights)
  //   • Perspective court surface (gradient stripes)
  //   • Court marking lines
  //   • Net posts

  static _drawStadiumBg(g) {
    // Dark sky / stadium ceiling
    g.fillStyle(0x07101e, 1);
    g.fillRect(0, 0, W, H);

    // Stadium lights (upper corners)
    const lightColor = 0xffffee;
    const addLight = (lx, ly) => {
      g.fillStyle(lightColor, 0.07);
      g.fillCircle(lx, ly, 45);
      g.fillStyle(lightColor, 0.12);
      g.fillCircle(lx, ly, 28);
      g.fillStyle(lightColor, 0.65);
      g.fillCircle(lx, ly, 12);
    };
    addLight(30, 70); addLight(W - 30, 70);
    addLight(70, 95); addLight(W - 70, 95);

    // Audience stands (rows above far baseline)
    const audienceColors = [
      0x2255aa, 0xaa2233, 0x22aa55, 0xaaaa22,
      0x882299, 0x229988, 0xff6633, 0x3399ff,
      0xcc4411, 0x1144cc, 0x44cc11, 0xcc1144,
    ];
    for (let row = 0; row < 6; row++) {
      const ry    = 105 + row * 18;
      const alpha = 0.75 - row * 0.06;
      const step  = 16 - row;
      // Seat background
      g.fillStyle(0x1a1a2e, 0.8);
      g.fillRect(0, ry - 4, W, step + 8);
      // Audience figures
      for (let ax = 0; ax < W; ax += step) {
        const col = audienceColors[(Math.floor(ax / step) + row) % audienceColors.length];
        const bob = Math.sin((ax + row) * 0.5) * 2;
        g.fillStyle(col, alpha);
        g.fillEllipse(ax + step / 2, ry + 6 + bob, step - 2, step + 2);
        g.fillStyle(0xf5d5a0, alpha * 0.95);
        g.fillCircle(ax + step / 2, ry - 1 + bob, (step - 4) * 0.38);
      }
    }

    // Scoreboard above court (between audience and far baseline)
    const sbX = W / 2 - 60, sbY = 75, sbW = 120, sbH = 28;
    g.fillStyle(0x111122, 1);
    g.fillRoundedRect(sbX, sbY, sbW, sbH, 4);
    g.lineStyle(1.5, 0x334488, 0.8);
    g.strokeRoundedRect(sbX, sbY, sbW, sbH, 4);
    g.fillStyle(0x22dd44, 0.8);
    g.fillRect(sbX + 4, sbY + 4, 18, 20);
    g.fillRect(sbX + 26, sbY + 4, 18, 20);
    g.fillStyle(0xffd700, 0.5);
    g.fillRect(sbX + 50, sbY + 6, 16, 16);
    g.fillRect(sbX + 70, sbY + 6, 16, 16);
    g.fillRect(sbX + 92, sbY + 4, 22, 20);

    // Ground area below near baseline (player 1's sideline behind)
    g.fillStyle(0x0d1520, 1);
    g.fillRect(0, PERSP.NEAR_Y + 1, W, H - PERSP.NEAR_Y);
  }

  // Draw perspective court surface + lines. Returns the Graphics object.
  static _drawPerspectiveCourt(scene, surfaceColor, stripeA, stripeB, lineColor, courtKey) {
    if (scene.textures.exists(courtKey)) return;
    const g = scene.make.graphics({ x: 0, y: 0, add: false });

    AssetGen._drawStadiumBg(g);

    // Court surface — drawn as thin horizontal trapezoid slices for depth gradient
    const sliceCount = 80;
    const gyStep = (COURT_BOTTOM - COURT_TOP) / sliceCount;
    for (let i = 0; i < sliceCount; i++) {
      const gy0 = COURT_TOP + i * gyStep;
      const gy1 = gy0 + gyStep;
      const t0  = i / sliceCount;
      const t1  = (i + 1) / sliceCount;
      // Two shades alternating for depth stripes (visible on grass / clay)
      const stripe    = Math.floor(i / 6) % 2;
      const baseColor = stripe === 0 ? stripeA : stripeB;

      const p0L = perspect(COURT_LEFT,  gy0);
      const p0R = perspect(COURT_RIGHT, gy0);
      const p1L = perspect(COURT_LEFT,  gy1);
      const p1R = perspect(COURT_RIGHT, gy1);

      g.fillStyle(baseColor, 1);
      g.beginPath();
      g.moveTo(p0L.x, p0L.y);
      g.lineTo(p0R.x, p0R.y);
      g.lineTo(p1R.x, p1R.y);
      g.lineTo(p1L.x, p1L.y);
      g.closePath();
      g.fillPath();

      // Subtle brightness gradient (darker far, brighter near)
      g.fillStyle(0xffffff, 0.025 * t1);
      g.beginPath();
      g.moveTo(p0L.x, p0L.y); g.lineTo(p0R.x, p0R.y);
      g.lineTo(p1R.x, p1R.y); g.lineTo(p1L.x, p1L.y);
      g.closePath(); g.fillPath();
    }

    // ── Court lines ──
    const lw = 2.5;
    g.lineStyle(lw, lineColor, 0.95);

    // Baselines
    perspectLine(g, COURT_LEFT, COURT_TOP,    COURT_RIGHT, COURT_TOP);
    perspectLine(g, COURT_LEFT, COURT_BOTTOM, COURT_RIGHT, COURT_BOTTOM);

    // Sidelines
    perspectLine(g, COURT_LEFT,  COURT_TOP, COURT_LEFT,  COURT_BOTTOM);
    perspectLine(g, COURT_RIGHT, COURT_TOP, COURT_RIGHT, COURT_BOTTOM);

    // Net line (in game space it sits at NET_Y)
    g.lineStyle(lw, lineColor, 0.85);
    perspectLine(g, COURT_LEFT, NET_Y, COURT_RIGHT, NET_Y);

    // Center service line (full length)
    g.lineStyle(lw - 0.5, lineColor, 0.75);
    perspectLine(g, COURT_MID_X, COURT_TOP, COURT_MID_X, COURT_BOTTOM);

    // Service lines
    const svcPad = (NET_Y - COURT_TOP) * 0.55;
    const svcT   = COURT_TOP + svcPad;
    const svcB   = COURT_BOTTOM - svcPad;
    perspectLine(g, COURT_LEFT, svcT, COURT_RIGHT, svcT);
    perspectLine(g, COURT_LEFT, svcB, COURT_RIGHT, svcB);

    // Doubles alleys
    g.lineStyle(1.5, lineColor, 0.45);
    const alleyW = 22;
    perspectLine(g, COURT_LEFT  + alleyW, COURT_TOP, COURT_LEFT  + alleyW, COURT_BOTTOM);
    perspectLine(g, COURT_RIGHT - alleyW, COURT_TOP, COURT_RIGHT - alleyW, COURT_BOTTOM);

    // Center marks on baselines
    g.lineStyle(lw, lineColor, 0.85);
    const cmLen = 5;
    perspectLine(g, COURT_MID_X - cmLen, COURT_TOP,    COURT_MID_X + cmLen, COURT_TOP);
    perspectLine(g, COURT_MID_X - cmLen, COURT_BOTTOM, COURT_MID_X + cmLen, COURT_BOTTOM);

    // ── Net posts ──
    const netL = perspect(COURT_LEFT,  NET_Y);
    const netR = perspect(COURT_RIGHT, NET_Y);
    const postH = 16;
    g.fillStyle(0xdddddd, 1);
    g.fillRect(netL.x - 3, netL.y - postH, 6, postH + 4);
    g.fillRect(netR.x - 3, netR.y - postH, 6, postH + 4);
    g.fillStyle(0xbbbbbb, 1);
    g.fillRect(netL.x - 3, netL.y - postH, 6, 3);
    g.fillRect(netR.x - 3, netR.y - postH, 6, 3);

    // ── Net ──
    const netTop  = netL.y - 14;
    const netBot  = netL.y;
    g.lineStyle(1.5, 0xffffff, 0.85);
    g.beginPath(); g.moveTo(netL.x, netTop); g.lineTo(netR.x, netTop); g.strokePath();
    g.beginPath(); g.moveTo(netL.x, netBot); g.lineTo(netR.x, netBot); g.strokePath();
    // Net vertical strings
    g.lineStyle(0.8, 0xffffff, 0.35);
    const netSegments = 20;
    for (let ni = 0; ni <= netSegments; ni++) {
      const fx = ni / netSegments;
      const nx = netL.x + fx * (netR.x - netL.x);
      const ny = netL.y + fx * (netR.y - netL.y);
      g.beginPath(); g.moveTo(nx, netTop); g.lineTo(nx, ny); g.strokePath();
    }
    // Net horizontal strings
    g.lineStyle(0.6, 0xffffff, 0.2);
    for (let nh = 1; nh < 4; nh++) {
      const fh = nh / 4;
      g.beginPath();
      g.moveTo(netL.x, netTop + fh * (netBot - netTop));
      g.lineTo(netR.x, netTop + fh * (netBot - netTop));
      g.strokePath();
    }
    // Center strap
    const cnetX = (netL.x + netR.x) / 2;
    const cnetY = (netL.y + netR.y) / 2;
    g.lineStyle(2, 0xffffff, 0.6);
    g.beginPath(); g.moveTo(cnetX, netTop + 2); g.lineTo(cnetX, cnetY); g.strokePath();

    g.generateTexture(courtKey, W, H);
    g.destroy();
  }

  static _makeCourtGrass(scene) {
    AssetGen._drawPerspectiveCourt(scene,
      0x2a7025, 0x2d7a27, 0x25661f,  // surface, stripeA, stripeB
      0xffffff, 'court_grass'
    );
  }

  static _makeCourtClay(scene) {
    AssetGen._drawPerspectiveCourt(scene,
      0xb84020, 0xc44828, 0xac3a18,
      0xffeedd, 'court_clay'
    );
  }

  static _makeCourtHard(scene) {
    AssetGen._drawPerspectiveCourt(scene,
      0x2d5580, 0x2a5080, 0x315d8a,
      0xffffff, 'court_hard'
    );
  }

  // ─── Menu background ─────────────────────────────────────────
  static _makeLogoBg(scene) {
    AssetGen.makeTexture(scene, 'logo_bg', (g) => {
      // Deep blue-black gradient (simulated with bands)
      for (let y = 0; y < H; y += 4) {
        const t = y / H;
        const r = Math.round(0x07 + 0x03 * t);
        const b = Math.round(0x1e + 0x08 * t);
        g.fillStyle((r << 16) | b, 1);
        g.fillRect(0, y, W, 4);
      }
      // Subtle radial glow at center
      for (let i = 0; i < 12; i++) {
        const alpha = 0.025 - i * 0.002;
        if (alpha <= 0) break;
        g.fillStyle(0x1a44ff, alpha);
        g.fillCircle(W / 2, H / 2, 80 + i * 30);
      }
      // Fine grid lines
      g.lineStyle(1, 0x1a3aff, 0.06);
      for (let gx = 0; gx < W; gx += 30) {
        g.beginPath(); g.moveTo(gx, 0); g.lineTo(gx, H); g.strokePath();
      }
      for (let gy = 0; gy < H; gy += 30) {
        g.beginPath(); g.moveTo(0, gy); g.lineTo(W, gy); g.strokePath();
      }
    }, W, H);
  }

  // ─── Racket deco ─────────────────────────────────────────────
  static _makeRacket(scene) {
    AssetGen.makeTexture(scene, 'racket', (g) => {
      // Handle
      g.fillStyle(0x8B4513, 1);
      g.fillRoundedRect(14, 38, 8, 20, 3);
      g.fillStyle(0x5a2800, 0.5);
      g.fillRect(14, 44, 8, 8);
      // Frame
      g.lineStyle(5, 0xbbbbbb, 1);
      g.strokeEllipse(18, 26, 24, 32);
      g.lineStyle(4, 0xdddddd, 0.9);
      g.strokeEllipse(18, 26, 24, 32);
      // Strings
      g.lineStyle(0.8, 0xdddddd, 0.6);
      for (let sx = 8; sx <= 28; sx += 4) {
        g.beginPath(); g.moveTo(sx, 12); g.lineTo(sx, 40); g.strokePath();
      }
      for (let sy = 12; sy <= 40; sy += 4) {
        g.beginPath(); g.moveTo(8, sy); g.lineTo(28, sy); g.strokePath();
      }
    }, 36, 58);
  }

  // ─── Training target ─────────────────────────────────────────
  static _makeTarget(scene) {
    AssetGen.makeTexture(scene, 'target', (g) => {
      g.lineStyle(3, 0xff3333, 0.9); g.strokeCircle(22, 22, 22);
      g.lineStyle(2, 0xff3333, 0.65); g.strokeCircle(22, 22, 14);
      g.lineStyle(2, 0xff5555, 0.45); g.strokeCircle(22, 22, 7);
      g.fillStyle(0xff3333, 0.8); g.fillCircle(22, 22, 2);
    }, 44, 44);
  }

  // ─── Particle ────────────────────────────────────────────────
  static _makeParticle(scene) {
    AssetGen.makeTexture(scene, 'particle', (g) => {
      g.fillStyle(0xffffff, 1);
      g.fillCircle(5, 5, 5);
    }, 10, 10);
  }
}
