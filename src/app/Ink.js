export default class Ink {
  constructor(pointer) {
    this.pointer = pointer;
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.stamps = [];
    this.life = 2200;
    this.radius = 150;
    this.spacing = 10;
    this.last = null;
    this.scale = 0.25;
    this.resize();
  }

  resize() {
    this.canvas.width = Math.max(1, Math.round(window.innerWidth * this.scale));
    this.canvas.height = Math.max(1, Math.round(window.innerHeight * this.scale));
  }

  addStamp(x, y, now) {
    this.stamps.push({ x, y, born: now });
  }

  trace(now) {
    const { px, py } = this.pointer;

    if (!this.pointer.moved) return;

    if (!this.last) {
      this.last = { x: px, y: py };
      this.addStamp(px, py, now);
      return;
    }

    const dx = px - this.last.x;
    const dy = py - this.last.y;
    const dist = Math.hypot(dx, dy);

    if (dist < this.spacing) return;

    const steps = Math.floor(dist / this.spacing);

    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      this.addStamp(this.last.x + dx * t, this.last.y + dy * t, now);
    }

    this.last = { x: px, y: py };
  }

  update(now) {
    this.trace(now);
    this.stamps = this.stamps.filter((stamp) => now - stamp.born < this.life);

    const ctx = this.ctx;
    const s = this.scale;
    const r = this.radius * s;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.globalCompositeOperation = "lighter";

    for (const stamp of this.stamps) {
      const age = 1 - (now - stamp.born) / this.life;
      const x = stamp.x * s;
      const y = stamp.y * s;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, r);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${0.35 * age * age})`);
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
  }
}
