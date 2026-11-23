uniform vec2 uRes;
uniform float uTime;
uniform float uScroll;
uniform vec2 uHand;
uniform vec3 uBack;
uniform vec3 uColorA;
uniform vec3 uColorB;

out vec4 outColor;

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

void main() {
  float shift = uScroll * 0.35;
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y + shift);
  vec2 uv = frag / uRes.y;
  float t = uTime * 0.12;

  vec2 hand = vec2(uHand.x * uRes.x, uHand.y * uRes.y + shift) / uRes.y;
  float near = exp(-pow(distance(uv, hand) * REACH, 2.0));
  uv = hand + spin(uv - hand, near * TWIST * 0.35);

  float n1 = valueNoise(uv * 1.6 + t);
  float n2 = valueNoise(uv * 3.1 - t * 1.3);
  uv += DISTORTION * (vec2(n1, n2) - 0.5);

  for (int i = 1; i < SWIRL_ITERATIONS; i++) {
    float fi = float(i);
    uv.x += SWIRL / fi * cos(t + fi * 1.5 * uv.y);
    uv.y += SWIRL / fi * cos(t + fi * uv.x);
  }

  float fy = fract(uv.y * 1.2);
  float shape = smoothstep(0.0, 0.55, fy) * (1.0 - smoothstep(0.45, 1.0, fy));
  float mixer = smoothstep(0.2, 0.8, valueNoise(uv * 2.0));

  vec3 stripe = mix(uColorA, uColorB, mixer);
  vec3 col = mix(uBack, stripe, shape * 0.85);
  outColor = vec4(col, 1.0);
}
