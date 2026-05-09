/* ============================================================
   POCKET TENNIS LEAGUE — Synthesised Audio
   ============================================================ */
'use strict';

class AudioSynth {
  constructor() {
    this.ctx     = null;
    this.enabled = true;
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      this.enabled = false;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  _play(freq, type, dur, vol = 0.3, detune = 0, attack = 0.01, decay = 0.1) {
    if (!this.enabled || !this.ctx) return;
    try {
      const osc  = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      osc.detune.setValueAtTime(detune, this.ctx.currentTime);
      gain.gain.setValueAtTime(0, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + attack);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + dur);
    } catch (e) { /* ignore */ }
  }

  ballHit(power = 1) {
    this._play(300 + power * 200, 'triangle', 0.12, 0.4, 0, 0.005, 0.1);
    this._play(150, 'sine', 0.08, 0.2, 0, 0.005, 0.06);
  }

  bounce() {
    this._play(180, 'sine',     0.18, 0.25, 0, 0.005, 0.15);
    this._play(90,  'triangle', 0.12, 0.15, 0, 0.005, 0.10);
  }

  serve() {
    this._play(400, 'triangle', 0.15, 0.5, 0, 0.005, 0.12);
    this._play(200, 'sine',     0.10, 0.3, 0, 0.005, 0.08);
  }

  netHit() {
    this._play(80, 'sawtooth', 0.2, 0.3, 0, 0.005, 0.15);
  }

  point() {
    [440, 550, 660, 880].forEach((f, i) => {
      setTimeout(() => this._play(f, 'sine', 0.3, 0.35, 0, 0.01, 0.25), i * 100);
    });
  }

  menuTap() {
    this._play(660, 'sine', 0.1, 0.2, 0, 0.005, 0.08);
  }

  victory() {
    const melody = [523, 659, 784, 1047, 784, 1047, 1319];
    melody.forEach((f, i) => setTimeout(() => this._play(f, 'sine', 0.35, 0.4, 0, 0.01, 0.3), i * 130));
  }

  crowd(intensity = 0.5) {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => {
        this._play(
          100 + Math.random() * 300, 'sine',
          0.4 + Math.random() * 0.3,
          intensity * 0.08 * Math.random(),
          Math.random() * 200 - 100, 0.05, 0.3
        );
      }, i * 50);
    }
  }
}

const synth = new AudioSynth();
