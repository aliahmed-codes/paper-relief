import Layer from "./Layer";
import fragment from "./shaders/relief.frag.glsl?raw";

export default class Relief extends Layer {
  constructor(canvas, ink) {
    super(canvas, fragment);
    this.ink = ink;
    this.settings = {
      relief: 0.6,
      gain: 2.4,
      folds: 0.65,
      crumples: 0.61,
    };
    this.boost = 0;

    if (this.supported) this.createTexture();
  }

  createTexture() {
    const gl = this.gl;
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  }

  uploadInk() {
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.ink.canvas);
  }

  render(scroll, speed) {
    const gl = this.gl;
    const { relief, gain, folds, crumples } = this.settings;

    this.boost += (Math.min(Math.abs(speed) * 0.0012, 0.6) - this.boost) * 0.12;

    gl.useProgram(this.program);
    this.uploadInk();
    gl.uniform1i(this.location("uInk"), 0);
    gl.uniform1f(this.location("uScroll"), scroll);
    gl.uniform1f(this.location("uGain"), gain);
    gl.uniform1f(this.location("uBoost"), this.boost);
    gl.uniform1f(this.location("uRelief"), relief);
    gl.uniform1f(this.location("uFolds"), folds);
    gl.uniform1f(this.location("uCrumples"), crumples);
    this.draw();
  }
}
