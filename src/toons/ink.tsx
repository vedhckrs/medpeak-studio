// MedPeak Toons ink engine v6 (see skill/medpeak-health/references/toons-style.md).
// "Volume paint": every shape gets a soft form gradient, a two-step crisp shadow, a bounce light
// on the shadow edge, a bright edge on the light side, a material texture and a gloss, inside a
// thin outline that is a darker shade of the fill. Shapes can be merged into one clean silhouette.
// Light is top-left. Everything is plain SVG geometry: no filters, nothing that shimmers.
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
const neutral = (s: number, l: number) => s < 0.14 || l > 0.9;
/**
 * The outline colour for a fill: a darker, calmer shade of the same hue (pink -> maroon,
 * yellow -> brown, green -> forest). Whites and greys get a soft slate. Never plain black.
 */
export const lineOf = (c: string, k = STYLE.lineDarkness): string => {
  const [h, s, l] = toHsl(c);
  if (s < 0.16 || l > 0.92) return fromHsl(0.645, 0.2, 0.4);
  return fromHsl(h, Math.min(0.58, s * 0.6 + 0.1), Math.max(0.11, l * (1 - k)));
};
/**
 * A painter's shadow: darker, a little richer, and the hue slides toward violet along the short
 * way round the colour wheel (pink -> rose, yellow -> orange, green -> teal). Whites get lavender.
 */
export const shade = (c: string, amt: number): string => {
  const [h, s, l] = toHsl(c);
  if (neutral(s, l)) return fromHsl(0.69, 0.22 + amt * 0.3, Math.max(0.1, l - amt * 0.62));
  let dh = 0.76 - h;
  if (dh > 0.5) dh -= 1;
  if (dh < -0.5) dh += 1;
  return fromHsl((h + dh * Math.min(0.2, amt * 0.42) + 1) % 1, Math.min(1, s * (1 + amt * 0.2) + amt * 0.05), l * (1 - amt * 0.95));
};
/** A painter's light: lighter and a touch warmer (toward yellow), never chalky. */
export const lift = (c: string, amt: number): string => {
  const [h, s, l] = toHsl(c);
  if (neutral(s, l)) return fromHsl(0.12, 0.6, Math.min(0.995, l + (1 - l) * amt));
  let dh = 0.13 - h;
  if (dh > 0.5) dh -= 1;
  if (dh < -0.5) dh += 1;
  return fromHsl((h + dh * amt * 0.22 + 1) % 1, Math.min(1, s * (1 - amt * 0.15)), l + (1 - l) * amt);
};
/** A deep, saturated version of a colour (iris, inner mouth, deep accents). */
export const deepOf = (c: string, l = 0.3): string => {
  const [h, s, li] = toHsl(c);
  if (neutral(s, li)) return fromHsl(0.56, 0.5, l);
  return fromHsl(h, Math.min(0.75, s * 0.8 + 0.2), l);
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
const n1 = (v: number) => Number(v.toFixed(2));
export const circlePath = (cx: number, cy: number, r: number) => `M${n1(cx - r)} ${n1(cy)} A${r} ${r} 0 1 0 ${n1(cx + r)} ${n1(cy)} A${r} ${r} 0 1 0 ${n1(cx - r)} ${n1(cy)} Z`;
export const ellipsePath = (cx: number, cy: number, rx: number, ry: number) => `M${n1(cx - rx)} ${n1(cy)} A${rx} ${ry} 0 1 0 ${n1(cx + rx)} ${n1(cy)} A${rx} ${ry} 0 1 0 ${n1(cx - rx)} ${n1(cy)} Z`;
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
export const Mark: React.FC<{pts: P[]; w?: number; color?: string; opacity?: number; start?: number; end?: number}> = ({pts, w = 4, color = INK, opacity = 1, start, end}) => (
  <path d={taperedPath(pts, w, start, end)} fill={color} opacity={opacity} />
);
/** A fold or groove: a dark tapered mark with a thin light edge on its lower-right side (it looks cut in). */
export const Groove: React.FC<{pts: P[]; w?: number; color: string; k?: number}> = ({pts, w = 2.6, color, k = 0.2}) => (
  <g>
    <path d={taperedPath(pts.map(([x, y]) => [x + w * 0.42, y + w * 0.5] as P), w * 0.7)} fill={lift(color, 0.3)} opacity={0.55} />
    <path d={taperedPath(pts, w)} fill={shade(color, k)} />
  </g>
);
/** A surface vessel: thick where it starts, hair-thin where it ends, with a tiny highlight. */
export const Vein: React.FC<{pts: P[]; w?: number; color: string; opacity?: number}> = ({pts, w = 2.4, color, opacity = 0.85}) => (
  <g opacity={opacity}>
    <path d={taperedPath(pts, w, 0.02, 0.75)} fill={color} />
    <path d={taperedPath(pts.map(([x, y]) => [x - w * 0.16, y - w * 0.2] as P), w * 0.28, 0.02, 0.75)} fill="#ffffff" opacity={0.4} />
  </g>
);

// ------------------------------------------------------------------ path boxes and textures
const boxCache = new Map<string, [number, number, number, number]>();
/** A good-enough bounding box of a path (absolute and relative commands), cached per path. */
export const pathBox = (d: string): [number, number, number, number] => {
  const hit = boxCache.get(d);
  if (hit) return hit;
  const tok = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? [];
  let i = 0;
  let x = 0;
  let y = 0;
  let sx = 0;
  let sy = 0;
  let cmd = 'M';
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  const add = (px: number, py: number) => { x0 = Math.min(x0, px); y0 = Math.min(y0, py); x1 = Math.max(x1, px); y1 = Math.max(y1, py); };
  const num = () => Number(tok[i++]);
  let guard = 0;
  while (i < tok.length && guard++ < 5000) {
    if (/[a-zA-Z]/.test(tok[i])) cmd = tok[i++];
    const rel = cmd === cmd.toLowerCase();
    const C = cmd.toUpperCase();
    const pt = (): P => { const px = num(); const py = num(); return rel ? [x + px, y + py] : [px, py]; };
    if (C === 'Z') { x = sx; y = sy; continue; }
    if (C === 'H') { const v = num(); x = rel ? x + v : v; add(x, y); continue; }
    if (C === 'V') { const v = num(); y = rel ? y + v : v; add(x, y); continue; }
    if (C === 'A') {
      const rx = num(); const ry = num(); num(); num(); num();
      const [ex, ey] = pt();
      const mx = (x + ex) / 2; const my = (y + ey) / 2;
      const half = Math.hypot(ex - x, ey - y) / 2;
      const k = Math.min(1, half / Math.max(rx, ry, 0.001));
      add(mx - rx * k, my - ry * k); add(mx + rx * k, my + ry * k); add(ex, ey);
      x = ex; y = ey; continue;
    }
    const pairs = C === 'C' ? 3 : C === 'S' || C === 'Q' ? 2 : 1;
    let last: P = [x, y];
    for (let k = 0; k < pairs; k++) { last = pt(); add(last[0], last[1]); }
    [x, y] = last;
    if (C === 'M') { sx = x; sy = y; cmd = rel ? 'l' : 'L'; }
  }
  const box: [number, number, number, number] = Number.isFinite(x0) ? [x0, y0, x1, y1] : [0, 0, 0, 0];
  boxCache.set(d, box);
  return box;
};
const dot = (x: number, y: number, r: number) => `M${(x - r).toFixed(1)} ${y.toFixed(1)}a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(2 * r).toFixed(2)} 0a${r.toFixed(2)} ${r.toFixed(2)} 0 1 0 ${(-2 * r).toFixed(2)} 0Z`;
const texCache = new Map<string, string>();
/**
 * Stipple: many tiny dots as ONE path, thick toward the shadow side (lower right) and fading out
 * toward the light. `from` = where the dots begin (0 = everywhere, 0.6 = only the far shadow side).
 */
export const stipplePath = (box: [number, number, number, number], seed: string, n: number, from = 0.38, r: [number, number] = [0.45, 1.05], flip = false) => {
  const key = `${seed}|${box.join(',')}|${n}|${from}|${r.join(',')}|${flip}`;
  const hit = texCache.get(key);
  if (hit !== undefined) return hit;
  const [x0, y0, x1, y1] = box;
  let d = '';
  let made = 0;
  for (let i = 0; made < n && i < n * 8; i++) {
    const u = random(`${seed}u${i}`);
    const v = random(`${seed}v${i}`);
    let k = u * 0.44 + v * 0.56;
    if (flip) k = 1 - k;
    const p = Math.max(0, Math.min(1, (k - from) / (1 - from))) ** 1.5;
    if (random(`${seed}a${i}`) > p) continue;
    d += dot(x0 + u * (x1 - x0), y0 + v * (y1 - y0), r[0] + random(`${seed}r${i}`) * (r[1] - r[0]));
    made++;
  }
  texCache.set(key, d);
  return d;
};
/** Short parallel strokes as one path (cloth weave, knit, hair): thick toward the shadow side. */
export const hatchPath = (box: [number, number, number, number], seed: string, n: number, len = 3.4, angle = 62, from = 0.35) => {
  const key = `h${seed}|${box.join(',')}|${n}|${len}|${angle}|${from}`;
  const hit = texCache.get(key);
  if (hit !== undefined) return hit;
  const [x0, y0, x1, y1] = box;
  const a = (angle * Math.PI) / 180;
  const dx = Math.cos(a) * len * 0.5;
  const dy = Math.sin(a) * len * 0.5;
  let d = '';
  let made = 0;
  for (let i = 0; made < n && i < n * 8; i++) {
    const u = random(`${seed}hu${i}`);
    const v = random(`${seed}hv${i}`);
    const p = Math.max(0, Math.min(1, (u * 0.44 + v * 0.56 - from) / (1 - from))) ** 1.3;
    if (random(`${seed}ha${i}`) > p) continue;
    const x = x0 + u * (x1 - x0);
    const y = y0 + v * (y1 - y0);
    d += `M${(x - dx).toFixed(1)} ${(y - dy).toFixed(1)}L${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}`;
    made++;
  }
  texCache.set(key, d);
  return d;
};

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

/**
 * What a surface is made of. It decides the texture and the kind of highlight:
 *  flesh  organs: soft mottling and a stippled shadow (wet, alive)
 *  cell   cells and germs: a translucent double wall and a few granules
 *  hard   teeth, bone, plastic, metal: clean, with a long window reflection
 *  cloth  clothes: a fine weave in the shadow
 *  skin   people: clean with a warm bounce light
 *  hair   hair: clean, strands are drawn by hand
 *  matte  everything else: clean
 */
export type Material = 'flesh' | 'cell' | 'hard' | 'cloth' | 'skin' | 'hair' | 'matte';

export type PartProps = {
  d: string;
  fill: string;
  line?: string | null; // outline colour; default = a darker shade of the fill; null = no outline
  w?: number; // outline width; default = the thin house line
  shadow?: number; // core shadow darkness
  depth?: number; // core shadow width (negative = shadow on the top-left, for dents)
  flat?: boolean; // no shading at all
  mat?: Material; // surface material (texture + highlight)
  tex?: number; // texture strength for this part (0 = none, 1 = normal)
  shine?: [number, number, number?, number?] | null; // gloss mark: x, y, scale, rotation
  opacity?: number;
  children?: React.ReactNode; // details, clipped inside the shape
};
/** One painted shape with volume: form gradient, two-step shadow, bounce and edge light, texture, outline. */
export const Part: React.FC<PartProps> = ({d, fill, line, w, shadow = STYLE.shadow, depth = STYLE.shadowDepth, flat = false, mat = 'matte', tex = 1, shine = null, opacity, children}) => {
  const pass = useContext(PassCtx);
  const lw = useLine();
  const width = w ?? lw;
  const id = useId().replace(/:/g, '');
  const lc = line === undefined ? lineOf(fill) : line;
  if (pass === 'stroke') return lc ? <path d={d} fill={lc} stroke={lc} strokeWidth={width * 2} strokeLinejoin="round" /> : null;
  const box = pathBox(d);
  const bw = box[2] - box[0];
  const bh = box[3] - box[1];
  const small = Math.min(bw, bh) < 11; // tiny parts keep a simple two-tone paint
  const area = bw * bh;
  const k = STYLE.texture * tex;
  const seed = `${d.length}${d.slice(1, 28)}`;
  const dp = Math.sign(depth) * Math.min(Math.abs(depth), Math.min(bw, bh) * 0.24);
  const mid = shade(fill, shadow);
  const deep = shade(fill, Math.min(0.6, shadow + (STYLE.shadowDeep - STYLE.shadow) * (shadow / STYLE.shadow)));
  const bounce = lift(fill, 0.42);
  let texture: React.ReactNode = null;
  if (!flat && !small && k > 0) {
    if (mat === 'flesh') {
      texture = (
        <>
          {[0, 1, 2, 3, 4].map((i) => {
            const rx = bw * (0.1 + random(`${seed}mr${i}`) * 0.1);
            return <path key={i} d={blob(rx, rx * (0.6 + random(`${seed}mq${i}`) * 0.5), `${seed}m${i}`, 8, 0.16, box[0] + bw * (0.12 + random(`${seed}mx${i}`) * 0.76), box[1] + bh * (0.12 + random(`${seed}my${i}`) * 0.76))} fill={i % 2 ? lift(fill, 0.3) : shade(fill, 0.16)} opacity={0.13 * k} />;
          })}
          <path d={stipplePath(box, seed, Math.round(Math.min(150, area / 46)), 0.4)} fill={shade(fill, 0.4)} opacity={0.3 * k} />
          <path d={stipplePath(box, `${seed}l`, Math.round(Math.min(40, area / 190)), 0.5, [0.4, 0.8], true)} fill="#ffffff" opacity={0.3 * k} />
        </>
      );
    } else if (mat === 'cell') {
      texture = (
        <>
          <path d={d} fill="none" stroke={lift(fill, 0.55)} strokeWidth={Math.min(bw, bh) * 0.13} opacity={0.4 * k} />
          <path d={stipplePath(box, seed, Math.round(Math.min(46, area / 230)), 0.18, [0.8, 1.9])} fill={shade(fill, 0.26)} opacity={0.26 * k} />
        </>
      );
    } else if (mat === 'cloth') {
      texture = <path d={hatchPath(box, seed, Math.round(Math.min(120, area / 26)), 2.6, 58, 0.3)} fill="none" stroke={shade(fill, 0.34)} strokeWidth={0.34} strokeLinecap="round" opacity={0.42 * k} />;
    } else if (mat === 'hard') {
      texture = (
        <>
          <rect x={box[0] + bw * 0.12} y={box[1] - 2} width={bw * 0.2} height={bh + 4} fill={`url(#w${id})`} opacity={0.75 * k} />
          <rect x={box[0] + bw * 0.74} y={box[1] - 2} width={bw * 0.06} height={bh + 4} fill="#ffffff" opacity={0.2 * k} />
        </>
      );
    }
  }
  return (
    <g opacity={opacity}>
      <defs>
        <clipPath id={`p${id}`}><path d={d} /></clipPath>
        {!flat && (
          <>
            <radialGradient id={`f${id}`} cx="0.3" cy="0.22" r="0.98">
              <stop offset="0" stopColor={lift(fill, 0.7)} stopOpacity={STYLE.topLight} />
              <stop offset="0.4" stopColor={fill} stopOpacity="0" />
              <stop offset="1" stopColor={shade(fill, 0.5)} stopOpacity={small ? STYLE.form * 0.5 : STYLE.form} />
            </radialGradient>
            <linearGradient id={`r${id}`} x1="0.2" y1="0.1" x2="0.86" y2="0.96">
              <stop offset="0.52" stopColor={bounce} stopOpacity="0" />
              <stop offset="1" stopColor={bounce} stopOpacity={STYLE.rim} />
            </linearGradient>
            <linearGradient id={`e${id}`} x1="0.12" y1="0.04" x2="0.8" y2="0.9">
              <stop offset="0" stopColor="#ffffff" stopOpacity={STYLE.edge} />
              <stop offset="0.4" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`w${id}`} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#ffffff" stopOpacity="0" />
              <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.5" />
              <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </>
        )}
      </defs>
      <path d={d} fill={flat ? fill : small ? mid : deep} />
      <g clipPath={`url(#p${id})`}>
        {!flat && !small && <path d={d} fill={mid} transform={`translate(${(-dp * 0.2).toFixed(2)} ${(-dp * 0.3).toFixed(2)})`} />}
        {!flat && <path d={d} fill={fill} transform={`translate(${(-dp * 0.7).toFixed(2)} ${(-dp).toFixed(2)})`} />}
        {!flat && <path d={d} fill={`url(#f${id})`} />}
        {texture}
        {!flat && !small && dp > 0 && (
          <>
            <path d={d} fill="none" stroke={`url(#r${id})`} strokeWidth={2.6} />
            <path d={d} fill="none" stroke={`url(#e${id})`} strokeWidth={2.4} />
          </>
        )}
        <PassCtx.Provider value="both">{children}</PassCtx.Provider>
      </g>
      {shine && <Gloss x={shine[0]} y={shine[1]} s={shine[2] ?? 1} rot={shine[3] ?? -32} hard={mat === 'hard'} />}
      {pass === 'both' && lc && <path d={d} fill="none" stroke={lc} strokeWidth={width} strokeLinejoin="round" />}
    </g>
  );
};

/** A tube along a path (arms, legs, vessels, airways, fingers): round, lit from the top-left. `soft` = cloth and skin (no wet highlight). */
export const Tube: React.FC<{d: string; r: number; fill: string; line?: string | null; w?: number; cap?: 'round' | 'butt'; flat?: boolean; shadow?: number; soft?: boolean}> = ({d, r, fill, line, w, cap = 'round', flat = false, shadow = STYLE.shadow, soft = false}) => {
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
      <path d={d} {...common} stroke={flat ? fill : shade(fill, shadow + (soft ? 0 : 0.07))} strokeWidth={r * 2} />
      {!flat && <path d={d} {...common} stroke={fill} strokeWidth={r * (soft ? 1.5 : 1.3)} transform={`translate(${(-r * 0.2).toFixed(2)} ${(-r * 0.27).toFixed(2)})`} />}
      {!flat && !soft && r >= 2.6 && <path d={d} {...common} stroke={lift(fill, 0.6)} strokeWidth={r * 0.34} transform={`translate(${(-r * 0.38).toFixed(2)} ${(-r * 0.46).toFixed(2)})`} opacity={0.7} />}
    </g>
  );
};

/** Gloss: a soft halo, one bright streak and a dot, top-left. `hard` = a sharper, longer streak. */
export const Gloss: React.FC<{x: number; y: number; s?: number; rot?: number; hard?: boolean}> = ({x, y, s = 1, rot = -32, hard = false}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} opacity={STYLE.gloss}>
    <ellipse cx={2.5} cy={1.2} rx={hard ? 15 : 13} ry={hard ? 4.2 : 5.6} fill="#ffffff" opacity={0.24} />
    <path d={hard ? 'M-11 0 Q0 -3 11 0' : 'M-8 0 Q0 -2.6 8 0'} fill="none" stroke="#ffffff" strokeWidth={3.3} strokeLinecap="round" />
    <circle cx={hard ? 17 : 13.5} cy={1.2} r={1.7} fill="#ffffff" />
  </g>
);

/** Contact shadow where a character meets the floor: dark in the middle, fading out. */
export const Contact: React.FC<{y: number; w: number}> = ({y, w}) => {
  const id = useId().replace(/:/g, '');
  return (
    <g>
      <defs>
        <radialGradient id={`c${id}`}>
          <stop offset="0" stopColor={INK} stopOpacity="0.3" />
          <stop offset="0.55" stopColor={INK} stopOpacity="0.14" />
          <stop offset="1" stopColor={INK} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx={0} cy={y} rx={w * 1.15} ry={w * 0.17} fill={`url(#c${id})`} />
    </g>
  );
};

/**
 * A shadow that one shape throws onto another (a hat on a head, a collar on a shirt):
 * the caster's shape, moved down-right, darkening only where it lands `on` the other shape.
 */
export const Cast: React.FC<{d: string; on: string; color: string; dx?: number; dy?: number; k?: number}> = ({d, on, color, dx = 2.2, dy = 3.4, k = 0.34}) => {
  const id = useId().replace(/:/g, '');
  return (
    <g>
      <defs><clipPath id={`k${id}`}><path d={on} /></clipPath></defs>
      <g clipPath={`url(#k${id})`}><path d={d} fill={shade(color, k)} opacity={0.62} transform={`translate(${dx} ${dy})`} /></g>
    </g>
  );
};

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
