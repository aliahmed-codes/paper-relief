export default class Pointer {
  constructor() {
    this.x = 0.5;
    this.y = 0.5;
    this.px = window.innerWidth / 2;
    this.py = window.innerHeight / 2;
    this.moved = false;
    this.clicks = [];

    window.addEventListener("pointermove", (event) => {
      this.px = event.clientX;
      this.py = event.clientY;
      this.moved = true;
    });

    window.addEventListener("pointerdown", (event) => {
      this.clicks.push({ x: event.clientX, y: event.clientY });
    });
  }

  update() {
    this.x += (this.px / window.innerWidth - this.x) * 0.08;
    this.y += (this.py / window.innerHeight - this.y) * 0.08;
  }
}
