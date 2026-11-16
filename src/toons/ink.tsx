// MedPeak Toons ink engine v2 (see skill/medpeak-health/references/toons-style.md).
// Organic shapes, line weight that follows the light, tapered marks, feathered cel shading with a
// rim light and gloss, hand-drawn line boil and paper grain. Light always comes from the top-left.
import React, {useId} from 'react';
import {random} from 'remotion';

export const INK = '#1d2b4f';

// ------------------------------------------------------------------ colour
const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
const rgb = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const hex = (r: number, g: number, b: number) => `#${[r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('')}`;
/** amt > 0 darkens (shadows lean warm-violet so they never go grey), amt < 0 lightens toward warm white. */
export const tone = (c: string, amt: number) => {
  const [r, g, b] = rgb(c);
  if (amt >= 0) return hex(r * (1 - amt) + 30 * amt, g * (1 - amt * 1.1), b * (1 - amt * 0.75) + 40 * amt);
  const a = -amt;
  return hex(r + (255 - r) * a, g + (250 - g) * a, b + (235 - b) * a);
};

// ------------------------------------------------------------------ shapes
type P = [number, number];
/** Smooth path through points (Catmull-Rom -> cubic Bezier). */
export const spline = (pts: P[], closed = true, tension = 0.5) => {
  const n = pts.length;
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const c1: P = [p1[0] + ((p2[0] - p0[0]) * tension) / 3, p1[1] + ((p2[1] - p0[1]) * tension) / 3];
    const c2: P = [p2[0] - ((p3[0] - p1[0]) * tension) / 3, p2[1] - ((p3[1] - p1[1]) * tension) / 3];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return closed ? d + ' Z' : d;
};

/** An organic oval: n points around an ellipse, each pushed in or out a little (seeded, so stable). */
export const blobPts = (rx: number, ry: number, seed: string, n = 12, irr = 0.07, cx = 0, cy = 0, rot = 0): P[] =>
  Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2 + rot;
    const k = 1 + (random(`${seed}${i}`) - 0.5) * 2 * irr;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k] as P;
  });
export const blob = (rx: number, ry: number, seed: string, n = 12, irr = 0.07, cx = 0, cy = 0, rot = 0) => spline(blobPts(rx, ry, seed, n, irr, cx, cy, rot));

/** A thin-thick-thin brush mark along points (for wrinkles, cracks, brows, hair strands). */
export const taperedPath = (pts: P[], width: number, start = 0.15, end = 0.15) => {
  // resample the spline densely so the width profile is smooth
  const dense: P[] = [];
  const n = pts.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    for (let s = 0; s < 1; s += 0.1) {
      const s2 = s * s, s3 = s2 * s;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * s + (2 * a - 5 * b + 4 * c - d) * s2 + (-a + 3 * b - 3 * c + d) * s3);
      dense.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  dense.push(pts[n - 1]);
  const m = dense.length;
  const left: P[] = [];
  const right: P[] = [];
  dense.forEach((p, i) => {
    const a = dense[Math.max(0, i - 1)], b = dense[Math.min(m - 1, i + 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0];
    const len = Math.hypot(nx, ny) || 1;
    nx /= len; ny /= len;
    const u = i / (m - 1);
    const w = (width / 2) * Math.min(1, u / start, (1 - u) / end, 1) ** 0.7;
    left.push([p[0] + nx * w, p[1] + ny * w]);
    right.push([p[0] - nx * w, p[1] - ny * w]);
  });
  const all = [...left, ...right.reverse()];
  return 'M' + all.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L') + ' Z';
};
export const Mark: React.FC<{pts: P[]; w?: number; color?: string; opacity?: number}> = ({pts, w = 4, color = INK, opacity = 1}) => (
  <path d={taperedPath(pts, w)} fill={color} opacity={opacity} />
);

// ------------------------------------------------------------------ painting
/**
 * A painted body: feathered core shadow (bottom-right), soft light zone (top-left), rim light on the
 * dark edge, gloss streak, then the outline: thin on the lit side, heavy on the shadow side.
 * Shapes are drawn around (0,0); children are details clipped inside the body.
 */
export const InkBody: React.FC<{
  d: string; color: string; line?: number; shadow?: number; gloss?: [number, number, number?] | null; rim?: boolean; children?: React.ReactNode;
}> = ({d, color, line = 3.4, shadow = 0.24, gloss = null, rim = true, children}) => {
  const id = useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <clipPath id={`b${id}`}><path d={d} /></clipPath>
        <filter id={`f${id}`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id={`g${id}`} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="10" /></filter>
        <clipPath id={`h${id}`}><rect x={-400} y={0} width={800} height={800} transform="rotate(-38)" /></clipPath>
      </defs>
      <path d={d} fill={tone(color, shadow)} />
      <g clipPath={`url(#b${id})`}>
        <path d={d} fill={color} transform="translate(-13 -15)" filter={`url(#f${id})`} />
        <path d={d} fill={tone(color, -0.22)} transform="translate(-34 -40) scale(0.86)" filter={`url(#g${id})`} opacity={0.55} />
        {children}
        {rim && <path d={d} fill="none" stroke={tone(color, -0.32)} strokeWidth={4} transform="translate(-4.5 -5)" opacity={0.7} />}
      </g>
      {gloss && <Gloss x={gloss[0]} y={gloss[1]} s={gloss[2] ?? 1} />}
      <path d={d} fill="none" stroke={INK} strokeWidth={line} strokeLinejoin="round" />
      <g clipPath={`url(#h${id})`}><path d={d} fill="none" stroke={INK} strokeWidth={line * 2} strokeLinejoin="round" /></g>
    </g>
  );
};

/** Glossy highlight: a tapered streak and two dots, like wet tissue or a shiny capsule. */
export const Gloss: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s}) rotate(-28)`} opacity={0.85}>
    <path d={taperedPath([[-16, 2], [-4, -3], [12, -2]], 8, 0.3, 0.3)} fill="#fff" />
    <circle cx={20} cy={0} r={2.6} fill="#fff" />
    <circle cx={26} cy={1} r={1.6} fill="#fff" />
  </g>
);

/** Soft contact shadow where a character touches the floor. */
export const Contact: React.FC<{y: number; w: number}> = ({y, w}) => {
  const id = useId().replace(/:/g, '');
  return (
    <g>
      <defs><filter id={`c${id}`} x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="4" /></filter></defs>
      <path d={blob(w, w * 0.14, `ct${w}`, 10, 0.05, 0, y)} fill={INK} opacity={0.22} filter={`url(#c${id})`} />
    </g>
  );
};

// ------------------------------------------------------------------ hand-drawn finish
/**
 * Line boil: wrap a character's <g> in this; the turbulence seed changes every 3 frames so outlines
 * shimmer like hand-drawn animation. `frame` is the composition frame.
 */
export const Boil: React.FC<{frame: number; amount?: number; children: React.ReactNode}> = ({frame, amount = 1.6, children}) => {
  const id = useId().replace(/:/g, '');
  const seed = Math.floor(frame / 3) % 4;
  return (
    <g>
      <defs>
        <filter id={`boil${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={seed + 1} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={amount} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#boil${id})`}>{children}</g>
    </g>
  );
};

/** Paper grain over the whole frame (very light, multiplies). */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.08}) => (
  <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity, pointerEvents: 'none'}}>
    <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={7} /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width="100%" height="100%" filter="url(#paper)" />
  </svg>
);
