uniform vec2 uRes;
uniform float uScroll;
uniform sampler2D uInk;
uniform float uGain;
uniform float uBoost;
uniform float uRelief;
uniform float uFolds;
uniform float uCrumples;

out vec4 outColor;

const vec3 LIGHT = normalize(vec3(1.0, 2.0, 1.0));

float planes(vec2 p, float sharpness) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  float acc = 0.0;
  float total = 0.0;

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 g = vec2(float(x), float(y));
      vec2 point = g + hash22(cell + g) - f;
      vec2 dir = hash22(cell + g + 7.0) * 2.0 - 1.0;
      float w = exp(-dot(point, point) * sharpness);
      acc += w * dot(-point, dir);
      total += w;
    }
  }

  return acc / max(total, 1e-4);
}

float height(vec2 p) {
  float folds = planes(p * 2.4, 16.0);
  float crumples = planes(p * 7.0, 12.0) * planes(p * 3.7 + 11.0, 10.0);
  return folds * uFolds + crumples * uCrumples;
}

void main() {
  vec2 screen = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 uv = vec2(screen.x, screen.y + uScroll) / uRes.y;

  float ink = texture(uInk, gl_FragCoord.xy / uRes).a;
  float near = clamp(ink * uGain + uBoost, 0.0, 1.0);

  if (near < 0.004) {
    outColor = vec4(0.5, 0.5, 0.5, 1.0);
    return;
  }

  float e = 1.5 / uRes.y;
  float dx = height(uv + vec2(e, 0.0)) - height(uv - vec2(e, 0.0));
  float dy = height(uv + vec2(0.0, e)) - height(uv - vec2(0.0, e));

  vec3 normal = normalize(vec3(-dx, dy, 2.0 * e));
  normal = normalize(mix(vec3(0.0, 0.0, 1.0), normal, near));

  float shade = (dot(normal, LIGHT) - LIGHT.z) * uRelief;
  float gray = 0.5 + 0.5 * tanh(shade);
  outColor = vec4(vec3(gray), 1.0);
}
