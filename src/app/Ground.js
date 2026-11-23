import Layer from "./Layer";
import fragment from "./shaders/ground.frag.glsl?raw";

export default class Ground extends Layer {
  constructor(canvas) {
    super(canvas, fragment);
    this.maxDpr = 1;
    this.back = [0.937, 0.914, 0.867];
    this.colorA = [0.9, 0.42, 0.27];
    this.colorB = [0.96, 0.78, 0.6];
    if (this.supported) this.resize();
  }

  render(time, scroll, pointer) {
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.uniform1f(this.location("uTime"), time);
    gl.uniform1f(this.location("uScroll"), scroll);
    gl.uniform2f(this.location("uHand"), pointer.x, pointer.y);
    gl.uniform3fv(this.location("uBack"), this.back);
    gl.uniform3fv(this.location("uColorA"), this.colorA);
    gl.uniform3fv(this.location("uColorB"), this.colorB);
    this.draw();
  }
}
