import { toCanvas } from "html-to-image";

export default class PageCapture {
  constructor(element) {
    this.element = element;
    this.canvas = null;
    this.width = 0;
    this.height = 0;
    this.rects = [];
  }

  async run() {
    await document.fonts.ready;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    this.canvas = await toCanvas(this.element, { pixelRatio: dpr });
    this.width = this.element.offsetWidth;
    this.height = this.element.offsetHeight;
    this.measure();
  }

  measure() {
    const origin = this.element.getBoundingClientRect().top + window.scrollY;
    const nodes = [...this.element.querySelectorAll("[data-warp]")].slice(0, 4);

    this.rects = nodes.map((node) => {
      const box = node.getBoundingClientRect();
      return [box.left, box.top + window.scrollY - origin, box.width, box.height];
    });
  }
}
