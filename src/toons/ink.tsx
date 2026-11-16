// MedPeak Toons ink engine v5 (see skill/medpeak-health/references/toons-style.md).
// Thin outlines in a darker shade of each fill, crisp cel shadow, soft top light, one gloss mark.
// Shapes can be merged into one clean silhouette (no lines at the joins). Light is top-left.
import React, {createContext, useContext, useId} from 'react';
import {random} from 'remotion';
import {STYLE} from './style';

export const INK = STYLE.ink;
export type P = [number, number];

// ------------------------------------------------------------------ colour
const clamp255 = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
const rgb = (c: string): number[] => {
  const h = c.length === 4 ? `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}` : c;
  return [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
};
const hex = (r: number, g: number, b: number) => `#${[r, g, b].map((v) => clamp255(v).toString(16).padStart(2, '0')).join('')}`;
/** amt > 0 darkens (shadows lean warm-violet so they never go grey), amt < 0 lightens toward warm white. */
export const tone = (c: string, amt: number) => {
  const [r, g, b] = rgb(c);
  if (amt >= 0) return hex(r * (1 - amt) + 30 * amt, g * (1 - amt * 1.1), b * (1 - amt * 0.75) + 40 * amt);
  const a = -amt;
  return hex(r + (255 - r) * a, g + (250 - g) * a, b + (235 - b) * a);
};
const toHsl = (c: string): [number, number, number] => {
  const [r, g, b] = rgb(c).map((v) => v / 255);
  const mx = Math.max(r, g, b);
  const mn = Math.min(r, g, b);
  const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn;
  const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  const h = mx === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6 : mx === g ? ((b - r) / d + 2) / 6 : ((r - g) / d + 4) / 6;
  return [h, s, l];
};
const fromHsl = (h: number, s: number, l: number) => {
  const f = (n: number) => {
    const k = (n + h * 12) % 12;
    const a = s * Math.min(l, 1 - l);
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
  };
  return hex(f(0) * 255, f(8) * 255, f(4) * 255);
};
/**
 * The outline colour for a fill: a darker, calmer shade of the same hue (pink -> maroon,
 * yellow -> brown, green -> forest). Whites and greys get a soft slate. Never plain black.
 */
export const lineOf = (c: string, k = STYLE.lineDarkness): string => {
  const [h, s, l] = toHsl(c);
  if (s < 0.16 || l > 0.92) return fromHsl(0.645, 0.2, 0.4);
  return fromHsl(h, Math.min(0.58, s * 0.6 + 0.1), Math.max(0.11, l * (1 - k)));
};

// ------------------------------------------------------------------ line width that stays thin
/** How many screen pixels one character unit covers right now (set by Slot, Camera and Scaled). */
export const ScaleCtx = createContext(1);
/** Outline width in local units: STYLE.line, but never more than STYLE.maxLinePx on screen. */
export const useLine = (k = 1) => {
  const s = useContext(ScaleCtx);
  return Math.min(STYLE.line, STYLE.maxLinePx / s) * k;
};
/** A scaled group that tells its children about the scale, so their outlines stay the same weight. */
export const Scaled: React.FC<{s: number; transform?: string; children: React.ReactNode}> = ({s, transform, children}) => {
  const parent = useContext(ScaleCtx);
  return (
    <ScaleCtx.Provider value={parent * s}>
      <g transform={transform ?? `scale(${s})`}>{children}</g>
    </ScaleCtx.Provider>
  );
};

// ------------------------------------------------------------------ shapes
/** Smooth closed or open path through points (Catmull-Rom -> cubic Bezier). */
export const spline = (pts: P[], closed = true, tension = 0.5) => {
  const n = pts.length;
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1: P = [p1[0] + ((p2[0] - p0[0]) * tension) / 3, p1[1] + ((p2[1] - p0[1]) * tension) / 3];
    const c2: P = [p2[0] - ((p3[0] - p1[0]) * tension) / 3, p2[1] - ((p3[1] - p1[1]) * tension) / 3];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return closed ? d + ' Z' : d;
};
export const blobPts = (rx: number, ry: number, seed: string, n = 12, irr = 0.07, cx = 0, cy = 0, rot = 0): P[] =>
  Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2 + rot;
    const k = 1 + (random(`${seed}${i}`) - 0.5) * 2 * irr;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k] as P;
  });
/** An organic oval (seeded, so it is the same every frame). */
export const blob = (rx: number, ry: number, seed: string, n = 12, irr = 0.07, cx = 0, cy = 0, rot = 0) => spline(blobPts(rx, ry, seed, n, irr, cx, cy, rot));
/** Points for a bumpy outline (brain, cloud): peaks and valleys alternate around an ellipse. */
export const scallopPts = (rx: number, ry: number, bumps: number, depth = 0.1, cx = 0, cy = 0, rot = 0): P[] =>
  Array.from({length: bumps * 2}, (_, i) => {
    const a = (i / (bumps * 2)) * Math.PI * 2 + rot;
    const k = i % 2 === 0 ? 1 : 1 - depth;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k] as P;
  });
/** Points for soft rounded lobes with pinched valleys between them (brain, cloud, popcorn). */
export const lobePts = (rx: number, ry: number, lobes: number, depth = 0.1, cx = 0, cy = 0, rot = 0): P[] => {
  const out: P[] = [];
  const step = (Math.PI * 2) / lobes;
  for (let i = 0; i < lobes; i++) {
    for (const [u, k] of [[0.2, 1], [0.5, 1.035], [0.8, 1], [1, 1 - depth]] as [number, number][]) {
      const a = rot + (i + u) * step;
      out.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
    }
  }
  return out;
};
export const circlePath = (cx: number, cy: number, r: number) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`;
export const ellipsePath = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`;
export const roundRect = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y} H${x + w - r} A${r} ${r} 0 0 1 ${x + w} ${y + r} V${y + h - r} A${r} ${r} 0 0 1 ${x + w - r} ${y + h} H${x + r} A${r} ${r} 0 0 1 ${x} ${y + h - r} V${y + r} A${r} ${r} 0 0 1 ${x + r} ${y} Z`;

/** A thin-thick-thin brush mark along points (folds, wrinkles, brows, hair strands). */
export const taperedPath = (pts: P[], width: number, start = 0.15, end = 0.15) => {
  const dense: P[] = [];
  const n = pts.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    for (let s = 0; s < 1; s += 0.1) {
      const s2 = s * s;
      const s3 = s2 * s;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * s + (2 * a - 5 * b + 4 * c - d) * s2 + (-a + 3 * b - 3 * c + d) * s3);
      dense.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  dense.push(pts[n - 1]);
  const m = dense.length;
  const left: P[] = [];
  const right: P[] = [];
  dense.forEach((p, i) => {
    const a = dense[Math.max(0, i - 1)];
    const b = dense[Math.min(m - 1, i + 1)];
    let nx = -(b[1] - a[1]);
    let ny = b[0] - a[0];
    const len = Math.hypot(nx, ny) || 1;
    nx /= len;
    ny /= len;
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
type Pass = 'both' | 'stroke' | 'fill';
const PassCtx = createContext<Pass>('both');
/**
 * Merge: every Part and Tube inside becomes ONE silhouette with one outline and no lines where
 * the shapes join (hands, hair curls, trousers, lungs). It draws all outlines first, then all fills.
 */
export const Merge: React.FC<{children: React.ReactNode}> = ({children}) => (
  <>
    <PassCtx.Provider value="stroke">{children}</PassCtx.Provider>
    <PassCtx.Provider value="fill">{children}</PassCtx.Provider>
  </>
);

export type PartProps = {
  d: string;
  fill: string;
  line?: string | null; // outline colour; default = a darker shade of the fill; null = no outline
  w?: number; // outline width; default = the thin house line
  shadow?: number; // cel shadow darkness
  depth?: number; // cel shadow width (negative = shadow on the top-left, for dents)
  flat?: boolean; // no shading at all
  shine?: [number, number, number?, number?] | null; // gloss mark: x, y, scale, rotation
  opacity?: number;
  children?: React.ReactNode; // details, clipped inside the shape
};
/** One painted shape: flat colour, a crisp shadow edge bottom-right, soft top light, thin coloured outline. */
export const Part: React.FC<PartProps> = ({d, fill, line, w, shadow = STYLE.shadow, depth = STYLE.shadowDepth, flat = false, shine = null, opacity, children}) => {
  const pass = useContext(PassCtx);
  const lw = useLine();
  const width = w ?? lw;
  const id = useId().replace(/:/g, '');
  const lc = line === undefined ? lineOf(fill) : line;
  if (pass === 'stroke') return lc ? <path d={d} fill={lc} stroke={lc} strokeWidth={width * 2} strokeLinejoin="round" /> : null;
  return (
    <g opacity={opacity}>
      <defs>
        <clipPath id={`p${id}`}><path d={d} /></clipPath>
        <linearGradient id={`l${id}`} x1="0" y1="0" x2="0.85" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity={STYLE.topLight} />
          <stop offset="0.5" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={d} fill={flat ? fill : tone(fill, shadow)} />
      <g clipPath={`url(#p${id})`}>
        {!flat && <path d={d} fill={fill} transform={`translate(${-depth * 0.7} ${-depth})`} />}
        {!flat && <path d={d} fill={`url(#l${id})`} />}
        <PassCtx.Provider value="both">{children}</PassCtx.Provider>
      </g>
      {shine && <Gloss x={shine[0]} y={shine[1]} s={shine[2] ?? 1} rot={shine[3] ?? -32} />}
      {pass === 'both' && lc && <path d={d} fill="none" stroke={lc} strokeWidth={width} strokeLinejoin="round" />}
    </g>
  );
};

/** A tube along a path (arms, legs, vessels, airways, fingers) with the same paint as Part. */
export const Tube: React.FC<{d: string; r: number; fill: string; line?: string | null; w?: number; cap?: 'round' | 'butt'; flat?: boolean}> = ({d, r, fill, line, w, cap = 'round', flat = false}) => {
  const pass = useContext(PassCtx);
  const lw = useLine();
  const width = w ?? lw;
  const lc = line === undefined ? lineOf(fill) : line;
  const common = {fill: 'none', strokeLinecap: cap, strokeLinejoin: 'round' as const};
  const outline = lc ? <path d={d} {...common} stroke={lc} strokeWidth={r * 2 + width * 2} /> : null;
  if (pass === 'stroke') return outline;
  return (
    <g>
      {pass === 'both' && outline}
      <path d={d} {...common} stroke={flat ? fill : tone(fill, STYLE.shadow)} strokeWidth={r * 2} />
      {!flat && <path d={d} {...common} stroke={fill} strokeWidth={r * 1.2} transform={`translate(${-r * 0.24} ${-r * 0.3})`} />}
    </g>
  );
};

/** Gloss: one short streak and a dot, top-left. */
export const Gloss: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = -32}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={STYLE.gloss}>
    <path d="M-8 0 Q0 -2.6 8 0" fill="none" stroke="#ffffff" strokeWidth={3.6} strokeLinecap="round" />
    <circle cx={13.5} cy={1.2} r={1.8} fill="#ffffff" />
  </g>
);

/** Contact shadow where a character meets the floor. */
export const Contact: React.FC<{y: number; w: number}> = ({y, w}) => <path d={ellipsePath(0, y, w, w * 0.13)} fill={INK} opacity={0.14} />;

/** Kept for old sets: a Part with the old prop names. */
export const InkBody: React.FC<{d: string; color: string; line?: number; shadow?: number; children?: React.ReactNode}> = ({d, color, line, shadow, children}) => (
  <Part d={d} fill={color} w={line} shadow={shadow}>{children}</Part>
);

/** Line wobble. Off by default (STYLE.boil = 0): it read as a "burning screen". */
export const Boil: React.FC<{frame: number; amount?: number; children: React.ReactNode}> = ({frame, amount = STYLE.boil, children}) => {
  const id = useId().replace(/:/g, '');
  if (amount <= 0) return <>{children}</>;
  return (
    <g>
      <defs>
        <filter id={`boil${id}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={(Math.floor(frame / 3) % 4) + 1} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={amount} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g filter={`url(#boil${id})`}>{children}</g>
    </g>
  );
};

/** Paper grain over the whole frame (very light, multiplies). */
export const Grain: React.FC<{opacity?: number}> = ({opacity = STYLE.grain}) => (
  <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity, pointerEvents: 'none'}}>
    <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={3} seed={7} /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width="100%" height="100%" filter="url(#paper)" />
  </svg>
);
