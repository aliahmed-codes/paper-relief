import Layer from "./Layer";
import fragment from "./shaders/paper.frag.glsl?raw";

export default class Stage extends Layer {
  constructor(canvas, ink) {
    super(canvas, fragment);
    this.ink = ink;
    this.settings = {
      relief: 0.4,
      gain: 1.8,
      folds: 0.65,
      crumples: 0.61,
      lift: 0.3,
    };
    this.boost = 0;
    this.pageSize = [1, 1];
    this.rects = new Float32Array(16);
    this.rectCount = 0;

    if (this.supported) {
      this.pageTexture = this.createTexture();
      this.inkTexture = this.createTexture();
    }
  }

  createTexture() {
    const gl = this.gl;
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return texture;
  }

  fits(canvas) {
    const max = this.gl.getParameter(this.gl.MAX_TEXTURE_SIZE);
    return canvas.width <= max && canvas.height <= max;
  }

  setPage(capture) {
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.pageTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, capture.canvas);

    this.pageSize = [capture.width, capture.height];
    this.rects.fill(0);
    capture.rects.forEach((rect, i) => this.rects.set(rect, i * 4));
    this.rectCount = capture.rects.length;
  }

  uploadInk() {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.inkTexture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.ink.canvas);
  }

  render(time, scroll, speed, pointer) {
    const gl = this.gl;
    const { relief, gain, folds, crumples, lift } = this.settings;
    const dpr = this.width / window.innerWidth;

    this.boost += (Math.min(Math.abs(speed) * 0.0006, 0.22) - this.boost) * 0.12;

    gl.useProgram(this.program);
    this.uploadInk();

    gl.uniform1i(this.location("uPage"), 0);
    gl.uniform1i(this.location("uInk"), 1);
    gl.uniform1f(this.location("uDpr"), dpr);
    gl.uniform1f(this.location("uTime"), time);
    gl.uniform1f(this.location("uScroll"), scroll);
    gl.uniform2f(this.location("uHand"), pointer.x * window.innerWidth, pointer.y * window.innerHeight + scroll);
    gl.uniform2fv(this.location("uPageSize"), this.pageSize);
    gl.uniform4fv(this.location("uRects"), this.rects);
    gl.uniform1i(this.location("uRectCount"), this.rectCount);
    gl.uniform1f(this.location("uGain"), gain);
    gl.uniform1f(this.location("uBoost"), this.boost);
    gl.uniform1f(this.location("uRelief"), relief);
    gl.uniform1f(this.location("uFolds"), folds);
    gl.uniform1f(this.location("uCrumples"), crumples);
    gl.uniform1f(this.location("uLift"), lift);
    this.draw();
  }
}
