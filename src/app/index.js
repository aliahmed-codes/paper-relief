import Pointer from "./Pointer";
import Ink from "./Ink";
import Stage from "./Stage";
import PageCapture from "./PageCapture";

class App {
  constructor() {
    this.root = document.documentElement;
    this.page = document.querySelector(".page");
    this.pointer = new Pointer();
    this.ink = new Ink(this.pointer);
    this.stage = new Stage(document.getElementById("stage"), this.ink);
    this.capture = new PageCapture(this.page);
    this.scroll = window.scrollY;
    this.speed = 0;
    this.ready = false;

    if (!this.stage.supported) return;

    this.start();
  }

  async start() {
    try {
      await this.capture.run();
    } catch (error) {
      return;
    }

    if (!this.stage.fits(this.capture.canvas)) return;

    this.stage.setPage(this.capture);
    this.root.classList.add("gl");
    this.ready = true;

    window.addEventListener("resize", () => this.resize());
    requestAnimationFrame((now) => this.tick(now));
  }

  resize() {
    this.stage.resize();
    this.ink.resize();

    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.refresh(), 250);
  }

  async refresh() {
    this.root.classList.remove("gl");
    await this.capture.run();

    if (this.stage.fits(this.capture.canvas)) {
      this.stage.setPage(this.capture);
      this.root.classList.add("gl");
    }
  }

  tick(now) {
    const target = window.scrollY;
    this.scroll += (target - this.scroll) * 0.1;
    this.speed = target - this.scroll;

    this.pointer.update();
    this.ink.update(now);
    this.stage.render(now / 1000, this.scroll, this.speed, this.pointer);

    requestAnimationFrame((time) => this.tick(time));
  }
}

new App();
