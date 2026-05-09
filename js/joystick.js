/* ============================================================
   POCKET TENNIS LEAGUE — Virtual Joystick
   ============================================================ */
'use strict';

class VirtualJoystick {
  constructor(scene, baseX, baseY) {
    this.scene     = scene;
    this.baseX     = baseX;
    this.baseY     = baseY;
    this.dx        = 0;
    this.dy        = 0;
    this.active    = false;
    this.pointerId = null;
    this.radius    = 56;

    this.base  = scene.add.image(baseX, baseY, 'joystick_base').setDepth(30).setAlpha(0.65);
    this.thumb = scene.add.image(baseX, baseY, 'joystick_thumb').setDepth(31).setAlpha(0.85);
  }

  handlePointer(pointer, down) {
    if (down) {
      if (this.pointerId !== null) return;
      const dx = pointer.x - this.baseX;
      const dy = pointer.y - this.baseY;
      if (Math.sqrt(dx * dx + dy * dy) < this.radius + 44) {
        this.active    = true;
        this.pointerId = pointer.id;
        this._update(pointer.x, pointer.y);
      }
    } else {
      if (pointer.id === this.pointerId) {
        this.active    = false;
        this.pointerId = null;
        this.dx = 0;
        this.dy = 0;
        this.thumb.setPosition(this.baseX, this.baseY);
      }
    }
  }

  handleMove(pointer) {
    if (pointer.id !== this.pointerId) return;
    this._update(pointer.x, pointer.y);
  }

  _update(px, py) {
    let dx   = px - this.baseX;
    let dy   = py - this.baseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > this.radius) {
      dx = (dx / dist) * this.radius;
      dy = (dy / dist) * this.radius;
    }
    this.dx = dx / this.radius;
    this.dy = dy / this.radius;
    this.thumb.setPosition(this.baseX + dx, this.baseY + dy);
  }

  /** Set joystick values directly (used by keyboard input). */
  setKeyboard(dx, dy) {
    this.dx = dx;
    this.dy = dy;
  }

  destroy() {
    this.base.destroy();
    this.thumb.destroy();
  }
}
