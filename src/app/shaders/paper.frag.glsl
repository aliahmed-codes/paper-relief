uniform vec2 uRes;
uniform float uDpr;
uniform float uTime;
uniform float uScroll;
uniform vec2 uHand;
uniform vec2 uPageSize;
uniform sampler2D uPage;
uniform sampler2D uInk;
uniform vec4 uRects[4];
uniform int uRectCount;
uniform float uGain;
uniform float uBoost;
uniform float uRelief;
uniform float uFolds;
uniform float uCrumples;
uniform float uLift;

out vec4 outColor;

const vec3 LIGHT = normalize(vec3(-1.0, 1.6, 1.0));
const vec3 GROUND = vec3(0.937, 0.902, 0.827);
const vec3 INK = vec3(0.078, 0.129, 0.239);
const vec3 VERMILION = vec3(0.902, 0.231, 0.180);
const vec3 MUSTARD = vec3(0.949, 0.694, 0.204);

const float DISTORTION = 0.25;
const float SWIRL = 0.8;
const int SWIRL_ITERATIONS = 10;
const float TWIST = 2.1;
const float REACH = 2.4;

vec2 spin(vec2 p, float a) {
  float s = sin(a);
  float c = cos(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

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

vec3 warp(vec2 doc, vec4 rect) {
  float unit = 520.0;
  vec2 uv = (doc - rect.xy) / unit;
  vec2 hand = (uHand - rect.xy) / unit;
  float t = uTime * 0.1;

  float near = exp(-pow(distance(uv, hand) * REACH, 2.0));
  uv = hand + spin(uv - hand, near * TWIST * 0.4);

  float n1 = valueNoise(uv * 1.6 + t);
  float n2 = valueNoise(uv * 3.1 - t * 1.3);
  uv += DISTORTION * (vec2(n1, n2) - 0.5);

  for (int i = 1; i < SWIRL_ITERATIONS; i++) {
    float fi = float(i);
    uv.x += SWIRL / fi * cos(t + fi * 1.5 * uv.y);
    uv.y += SWIRL / fi * cos(t + fi * uv.x);
  }

  float line = abs(fract(uv.y * 2.2 + uv.x * 0.35) - 0.5);
  float contour = 1.0 - smoothstep(0.05, 0.16, line);
  float fill = smoothstep(0.3, 0.7, valueNoise(uv * 1.5 - t));

  vec3 ink = mix(INK, VERMILION, fill * 0.55);
  return mix(ink, mix(GROUND, MUSTARD, fill), contour);
}

void main() {
  vec2 css = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y) / uDpr;
  vec2 doc = vec2(css.x, css.y + uScroll);

  float ink = texture(uInk, gl_FragCoord.xy / uRes).a;
  float near = clamp(ink * uGain + uBoost, 0.0, 1.0);

  float shade = 0.0;
  vec2 sampleAt = doc;

  if (near > 0.004) {
    vec2 p = doc / 800.0;
    float e = 1.5 / 800.0;
    float dx = height(p + vec2(e, 0.0)) - height(p - vec2(e, 0.0));
    float dy = height(p + vec2(0.0, e)) - height(p - vec2(0.0, e));

    vec3 normal = normalize(vec3(-dx, dy, 2.0 * e));
    normal = normalize(mix(vec3(0.0, 0.0, 1.0), normal, near));

    sampleAt = doc + normal.xy * uLift * 22.0 * vec2(1.0, -1.0);
    shade = (dot(normal, LIGHT) - LIGHT.z) * uRelief;
  }

  vec3 col = GROUND;

  for (int i = 0; i < 4; i++) {
    if (i >= uRectCount) break;
    vec4 r = uRects[i];
    vec2 inside = step(r.xy, sampleAt) * step(sampleAt, r.xy + r.zw);
    if (inside.x * inside.y > 0.5) col = warp(sampleAt, r);
  }

  vec2 tex = sampleAt / uPageSize;
  if (tex.x >= 0.0 && tex.x <= 1.0 && tex.y >= 0.0 && tex.y <= 1.0) {
    vec4 page = texture(uPage, tex);
    col = mix(col, page.rgb, page.a);
  }

  col *= 1.0 + shade;
  col += max(shade, 0.0) * 0.05;
  outColor = vec4(col, 1.0);
}
