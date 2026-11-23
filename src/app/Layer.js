import vertexSource from "./shaders/vertex.glsl?raw";
import commonSource from "./shaders/common.glsl?raw";

export default class Layer {
  constructor(canvas, fragmentSource) {
    this.canvas = canvas;
    this.gl = canvas.getContext("webgl2", { antialias: false, alpha: false });
    this.uniforms = {};
    this.maxDpr = 1.5;
    this.supported = Boolean(this.gl);

    if (!this.supported) return;

    this.program = this.createProgram(fragmentSource);
    this.vao = this.gl.createVertexArray();
    this.resize();
  }

  createShader(type, source) {
    const gl = this.gl;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader));
    }

    return shader;
  }

  createProgram(fragmentSource) {
    const gl = this.gl;
    const fragment = `#version 300 es\nprecision highp float;\n${commonSource}\n${fragmentSource}`;
    const program = gl.createProgram();

    gl.attachShader(program, this.createShader(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, this.createShader(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program));
    }

    return program;
  }

  location(name) {
    if (!(name in this.uniforms)) {
      this.uniforms[name] = this.gl.getUniformLocation(this.program, name);
    }

    return this.uniforms[name];
  }

  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr);
    this.width = Math.round(window.innerWidth * dpr);
    this.height = Math.round(window.innerHeight * dpr);
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.gl.viewport(0, 0, this.width, this.height);
  }

  draw() {
    const gl = this.gl;
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.uniform2f(this.location("uRes"), this.width, this.height);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}
