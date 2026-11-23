import Pointer from "./Pointer";
import Ink from "./Ink";
import Ground from "./Ground";
import Relief from "./Relief";

class App {
  constructor() {
    this.pointer = new Pointer();
    this.ink = new Ink(this.pointer);
    this.ground = new Ground(document.getElementById("ground"));
    this.relief = new Relief(document.getElementById("relief"), this.ink);

    if (!this.ground.supported || !this.relief.supported) return;

    this.scroll = window.scrollY;
    this.speed = 0;

    window.addEventListener("resize", () => this.resize());
    requestAnimationFrame((now) => this.tick(now));
  }

  resize() {
    this.ground.resize();
    this.relief.resize();
    this.ink.resize();
  }

  tick(now) {
    const target = window.scrollY;
    this.speed += (target - this.scroll - this.speed) * 0.2;
    this.scroll = target;

    this.pointer.update();
    this.ink.update(now);
    this.ground.render(now / 1000, this.scroll, this.pointer);
    this.relief.render(this.scroll, this.speed);

    requestAnimationFrame((time) => this.tick(time));
  }
}

new App();
