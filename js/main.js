/* ============================================================
   POCKET TENNIS LEAGUE — Phaser Game Configuration
   ============================================================ */
'use strict';

const config = {
  // Canvas renderer — broadest mobile browser compatibility
  type: Phaser.CANVAS,

  backgroundColor: '#07101e',
  parent: 'game-container',

  scale: {
    mode:       Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width:  W,
    height: H,
  },

  physics: {
    default: 'arcade',
    arcade:  { gravity: { y: 0 }, debug: false },
  },

  scene: [
    BootScene,
    MenuScene,
    DifficultyScene,
    MatchScene,
    ResultScene,
    LeagueScene,
    TrainingScene,
  ],

  render: {
    antialias:    false,
    pixelArt:     false,
    roundPixels:  true,
  },

  input: {
    touch:          true,
    mouse:          true,
    // 3 simultaneous touch points: L-joystick + R-button + spare for HvH
    activePointers: 3,
  },

  // Keep the game loop alive when the app loses focus (iOS audio unlock, home button).
  // Without this, Phaser pauses and scene-transition timers never fire.
  disableVisibilityChange: true,
};

const game = new Phaser.Game(config);
