/**
 * MedPeak Toons, look v8: the ACTING KIT (2026-11-21, after the owner's review of the creatine video: "the animation weak,
 * the character weak, the visual weak"; plans/creatine-review-2026-11-21.md).
 *
 * The rule behind it: the picture HOLDS STILL, and when something moves it is one big, clear action with a shape:
 *   anticipation (a small move the other way) -> action (fast) -> overshoot -> settle -> HOLD (nothing moves).
 * The viral Shorts hold still in 63% of frames; ours held still in 4% because everything swayed all the time.
 *
 * Everything here is a pure function of time (seconds), like the rest of the v8 player: no state, no randomness.
 */
import React from 'react';
import {INK, OUT} from './kit';
import {active, type LineNow, type ShotNow} from './play';

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth = (k: number) => k * k * (3 - 2 * k);
/** Fast out, soft landing. */
export const easeOut = (k: number) => 1 - Math.pow(1 - clamp01(k), 3);
/** Goes past the target and comes back (a "back" ease): `amount` 1.7 is the classic overshoot. */
export const easeBack = (k: number, amount = 1.7) => { const x = clamp01(k) - 1; return 1 + (amount + 1) * x * x * x + amount * x * x; };

export type Key = [t: number, value: number, dur?: number, kind?: 'ease' | 'back' | 'out' | 'snap'];
/**
 * A value that moves between KEY POSES and holds between them. Each key starts at its time and arrives after `dur`
 * seconds with its own curve: 'ease' (slow in, slow out), 'out' (fast start), 'back' (overshoot), 'snap' (6 frames).
 * Between keys the value is constant: a hold, which is what makes an action read.
 */
export const keyed = (t: number, start: number, keys: Key[]) => keys.reduce((v, [t0, to, d = 0.35, kind = 'ease']) => {
  const dur = kind === 'snap' ? 0.1 : d;
  const k = clamp01((t - t0) / dur);
  const e = kind === 'back' ? easeBack(k) : kind === 'out' || kind === 'snap' ? easeOut(k) : smooth(k);
  return lerp(v, to, e);
}, start);

/**
 * The TAKE: a big reaction to a shock, starting at t0.
 *   0.00-0.08  anticipation: a quick dip (crouch)
 *   0.08-0.22  the jump: up and back
 *   0.22-0.55  overshoot and settle into the new pose
 * Returns a vertical offset (px, negative = up), a lean (deg) and a 0..1 "shock" for the face.
 */
export const take = (t: number, t0: number, size = 1) => {
  const u = t - t0;
  if (u < 0) return {dy: 0, lean: 0, shock: 0};
  const dip = u < 0.08 ? Math.sin((u / 0.08) * Math.PI * 0.5) * 18 : 0;
  const jump = u >= 0.08 && u < 0.55 ? -Math.sin(clamp01((u - 0.08) / 0.47) * Math.PI) * 70 : 0;
  const lean = keyed(u, 0, [[0.08, -9, 0.14, 'out'], [0.22, -5, 0.3, 'back']]);
  return {dy: (dip + jump) * size, lean, shock: clamp01((u - 0.05) / 0.1)};
};

// ------------------------------------------------------------------ the impact policy (engine v9, decision 18)
/**
 * 'v8': the impacts as the videos already out were made (every shot file's own bursts and shakes).
 * 'v9' (format 6, and the before/after sample): far fewer impacts. A shake or a burst is drawn only when its call says
 * `keep` (the one shake and the two bursts a video the script allows), a shake is at most 12 px for 0.25 s and a burst
 * at most 120 px across its radius. The player (video.tsx) sets the policy before it draws each frame.
 */
export type ImpactMode = 'v8' | 'v9';
let IMPACTS: ImpactMode = 'v8';
export const setImpacts = (m: ImpactMode) => { IMPACTS = m; };
export const impactMode = () => IMPACTS;
export const SHAKE_MAX = {amp: 12, dur: 0.25};
export const BURST_MAX_R = 120;

/** A shake of the screen that dies away: px offsets at time t for a hit at t0. Under the v9 policy only a `keep` shake moves (12 px, 0.25 s at most). */
export const shake = (t: number, t0: number, amp = 18, dur = 0.35, keep = false): [number, number] => {
  if (IMPACTS === 'v9') {
    if (!keep) return [0, 0];
    amp = Math.min(amp, SHAKE_MAX.amp); dur = Math.min(dur, SHAKE_MAX.dur);
  }
  const u = t - t0;
  if (u < 0 || u > dur) return [0, 0];
  const k = 1 - u / dur;
  return [Math.sin(u * 71) * amp * k, Math.cos(u * 53) * amp * 0.6 * k];
};

/** A hop for a body character: anticipation squash, up, land with a squash. Returns dy (px) and sq (Put's squash). */
export const hop = (t: number, t0: number, height = 90, air = 0.34) => {
  const u = t - t0;
  if (u < -0.08 || u > air + 0.14) return {dy: 0, sq: 0};
  if (u < 0) return {dy: 0, sq: 0.14 * Math.sin(((u + 0.08) / 0.08) * Math.PI * 0.5)}; // crouch
  if (u < air) { const k = u / air; return {dy: -4 * height * k * (1 - k), sq: -0.12 * Math.sin(k * Math.PI)}; } // stretched in the air
  return {dy: 0, sq: 0.16 * Math.sin(((u - air) / 0.14) * Math.PI)}; // squash on landing
};

/** A point along an arc from a to b, `h` px above the straight line at the middle. */
export const arc = (a: [number, number], b: [number, number], h: number, k: number): [number, number] => {
  const u = clamp01(k);
  return [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - Math.sin(u * Math.PI) * h];
};

/**
 * The impact burst: a white star with the ink outline and short lines flying out, at (x, y) in frame or screen pixels,
 * for `dur` seconds from t0. Drawn in the kit's style (flat, outlined, no glow).
 */
export const Burst: React.FC<{t: number; t0: number; x: number; y: number; r?: number; dur?: number; col?: string; keep?: boolean}> = ({t, t0, x, y, r: r0 = 120, dur = 0.32, col = '#ffffff', keep = false}) => {
  if (IMPACTS === 'v9' && !keep) return null; // v9: only the (at most two) bursts the script keeps
  const r = IMPACTS === 'v9' ? Math.min(r0, BURST_MAX_R) : r0;
  const u = (t - t0) / dur;
  if (u < 0 || u > 1) return null;
  const k = u < 0.35 ? easeOut(u / 0.35) * 1.15 : lerp(1.15, 0.6, (u - 0.35) / 0.65);
  const o = u < 0.7 ? 1 : 1 - (u - 0.7) / 0.3;
  const n = 9;
  const star = Array.from({length: n * 2}, (_, i) => {
    const a = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2;
    const rr = (i % 2 ? 0.45 : 1) * r * k;
    return `${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`;
  }).join(' ');
  const fly = easeOut(u);
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}} width={1080} height={1920} viewBox="0 0 1080 1920" opacity={o}>
      {Array.from({length: 8}, (_, i) => {
        const a = (i / 8) * Math.PI * 2 + 0.2;
        const r0 = r * (0.9 + fly * 0.9), r1 = r0 + r * 0.45 * (1 - fly * 0.5);
        return <path key={i} d={`M ${x + Math.cos(a) * r0} ${y + Math.sin(a) * r0} L ${x + Math.cos(a) * r1} ${y + Math.sin(a) * r1}`} stroke={INK} strokeWidth={9} strokeLinecap="round" />;
      })}
      <polygon points={star} fill={col} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </svg>
  );
};

/** Speed lines behind a fast mover, pointing back along its direction (frame or screen pixels). */
export const SpeedLines: React.FC<{x: number; y: number; dir: [number, number]; len?: number; o?: number}> = ({x, y, dir, len = 160, o = 1}) => {
  const L = Math.hypot(dir[0], dir[1]) || 1;
  const [dx, dy] = [dir[0] / L, dir[1] / L];
  const [nx, ny] = [-dy, dx];
  if (o <= 0.01) return null;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}} width={1080} height={1920} viewBox="0 0 1080 1920" opacity={o}>
      {[-1, -0.35, 0.35, 1].map((s, i) => {
        const ox = x + nx * s * 60 - dx * 40, oy = y + ny * s * 60 - dy * 40;
        const l = len * (i % 2 ? 0.7 : 1);
        return <path key={i} d={`M ${ox} ${oy} L ${ox - dx * l} ${oy - dy * l}`} stroke={INK} strokeWidth={7} strokeLinecap="round" opacity={0.85} />;
      })}
    </svg>
  );
};

/**
 * The stamp: a big tilted card that BANGS onto the screen (comes in large, overshoots small, settles), holds, then leaves
 * with its line. For a number the script says (the hook's "+2 KG"). Laid on the screen, after the camera.
 */
export const Stamp: React.FC<{t: number; t0: number; t1: number; x: number; y: number; text: string; size?: number; rot?: number; bg?: string; fg?: string}> = ({t, t0, t1, x, y, text, size = 150, rot = -8, bg = '#ffd23f', fg = INK}) => {
  const u = t - t0;
  if (u < 0 || t > t1 + 0.2) return null;
  const k = u < 0.12 ? lerp(2.2, 0.92, easeOut(u / 0.12)) : u < 0.3 ? lerp(0.92, 1, smooth((u - 0.12) / 0.18)) : 1;
  const o = clamp01(u / 0.05) * clamp01((t1 + 0.2 - t) / 0.2);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${k.toFixed(3)})`, opacity: o,
      background: bg, border: `9px solid ${INK}`, borderRadius: 26, padding: `${size * 0.08}px ${size * 0.3}px`, boxShadow: `0 14px 0 ${INK}`,
      fontFamily: "'Poppins', 'Inter', sans-serif", fontWeight: 900, fontSize: size, lineHeight: 1, color: fg, whiteSpace: 'nowrap', letterSpacing: 2}}>{text}</div>
  );
};

// ================================================================== engine v9 (format 6): motion and time
// plans/engine-upgrade-2026-11-23/05-blueprint.md Part 4.8. The rule: HOLD, then ONE action (0.3-0.8 s), then hold
// again for 1.5 s or more. Things come INTO a held frame (enter, along, fill, reveal); the camera does not move.
// Everything is a pure function of time in seconds, like the rest of the player.

export type P2 = [number, number];
export type Side = 'top' | 'bottom' | 'left' | 'right';
/** The least hold after an action before the next action in the same place (seconds). */
export const HOLD_AFTER = 1.5;
/** An action's length is kept between these (seconds). */
export const ACTION = {min: 0.3, max: 0.8};
const actionDur = (d: number) => Math.max(ACTION.min, Math.min(ACTION.max, d));
const smoothStep = (k: number) => k * k * (3 - 2 * k);

/** Ease-out with a small overshoot: at most 4% past the target. */
export const easeOutSoft = (k: number) => easeBack(k, 0.9);
/** Which way is "outside the frame" for each side. */
const OFF: Record<Side, P2> = {top: [0, -1], bottom: [0, 1], left: [-1, 0], right: [1, 0]};

/**
 * A thing slides IN from outside the frame: returns {dx, dy} (frame px) to add to its resting place, from `dist` px
 * away at t0 to 0 at t0 + dur (kept to 0.3-0.8 s), ease-out with at most 4% overshoot, then 0 (it holds). `k` is the progress 0..1.
 */
export const enter = (t: number, t0: number, from: Side, dur = 0.5, dist = 1300) => {
  const k = clamp01((t - t0) / actionDur(dur));
  const e = t < t0 ? 0 : easeOutSoft(k);
  const [ox, oy] = OFF[from];
  return {dx: ox * dist * (1 - e), dy: oy * dist * (1 - e), k, done: k >= 1};
};
/** A thing slides OUT of the frame (ease-in: it starts slowly and leaves fast): {dx, dy} from 0 to `dist` px toward that edge. */
export const leave = (t: number, t0: number, to: Side, dur = 0.5, dist = 1300) => {
  const k = clamp01((t - t0) / actionDur(dur));
  const e = k * k * k;
  const [ox, oy] = OFF[to];
  return {dx: ox * dist * e, dy: oy * dist * e, k, gone: k >= 1};
};
/**
 * Travel along a path of points (frame px), a smooth curve through them (Catmull-Rom), eased in and out over `dur`.
 * Returns the point and the direction of travel in degrees. Before t0 it waits at the first point, after it rests at the last.
 */
export const along = (path: P2[], t: number, t0: number, dur = 0.6): {x: number; y: number; angle: number; k: number} => {
  const k = clamp01((t - t0) / Math.max(0.05, dur));
  const e = smoothStep(k);
  if (path.length < 2) return {x: path[0]?.[0] ?? 0, y: path[0]?.[1] ?? 0, angle: 0, k};
  const at = (u: number): P2 => {
    const n = path.length - 1, x = Math.min(n - 1e-9, Math.max(0, u * n)), i = Math.floor(x), l = x - i;
    const p0 = path[Math.max(0, i - 1)], p1 = path[i], p2 = path[i + 1], p3 = path[Math.min(n, i + 2)];
    const cr = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * l + (2 * a - 5 * b + 4 * c - d) * l * l + (-a + 3 * b - 3 * c + d) * l * l * l);
    return [cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])];
  };
  const [x, y] = at(e);
  const [x2, y2] = at(Math.min(1, e + 0.01));
  const [x1, y1] = at(Math.max(0, e - 0.01));
  return {x, y, angle: (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI, k};
};
/** A level that FILLS (a liquid, a mask): 0 before t0, 1 after t0 + dur, ease-out (fast start, soft stop). */
export const fill = (t: number, t0: number, dur = 0.6) => easeOut(clamp01((t - t0) / Math.max(0.05, dur)));
/**
 * A WIPE across a shape (spreading damage, a scan beam, a rope drawing on): `k` 0..1 eased, and `rect(x0, y0, x1, y1)` gives
 * the part of that box shown so far as [x, y, w, h] for an SVG clipPath rect, growing from the `dir` side.
 */
export const reveal = (t: number, t0: number, dur = 0.8, dir: Side = 'left') => {
  const k = smoothStep(clamp01((t - t0) / Math.max(0.05, dur)));
  const rect = (x0: number, y0: number, x1: number, y1: number): [number, number, number, number] => {
    const w = x1 - x0, h = y1 - y0;
    if (dir === 'left') return [x0, y0, w * k, h];
    if (dir === 'right') return [x1 - w * k, y0, w * k, h];
    if (dir === 'top') return [x0, y0, w, h * k];
    return [x0, y1 - h * k, w, h * k];
  };
  return {k, rect};
};

// ------------------------------------------------------------------ the shared dive (decision 21)
/** No frame of a dive zooms more than this from the frame before (at 60 frames a second). */
export const DIVE_MAX_STEP = 0.06;
/**
 * The zoom of a dive at progress u (0..1): even on a LOG scale (`Z = from * (to / from) ** e`), so the zoom speed feels the
 * same all the way in. The ease is a blend of straight and smoothstep, as soft as the length allows: its steepest slope is
 * chosen so that no frame zooms more than DIVE_MAX_STEP (the old dives zoomed 10x in their last 8 frames).
 */
export const diveZoom = (u: number, from: number, to: number, dur: number) => {
  const frames = Math.max(1, dur * 60);
  const span = Math.log(to / from);
  // steepest allowed slope of e(u); the blend (1 - a) u + a smoothstep(u) has slope 1 + a / 2 at its middle
  const allowed = (Math.log(1 + DIVE_MAX_STEP) * 0.97 * frames) / Math.max(1e-6, Math.abs(span));
  const a = Math.max(0, Math.min(1, 2 * (allowed - 1)));
  const k = clamp01(u);
  const e = (1 - a) * k + a * smoothStep(k);
  return from * Math.exp(span * e);
};
/** The shortest dive (seconds) that keeps every frame within DIVE_MAX_STEP, for a zoom from `from` to `to`. */
export const diveMinDur = (from: number, to: number) => Math.abs(Math.log(to / from)) / Math.log(1 + DIVE_MAX_STEP) / 0.97 / 60;
/** The dive's real length: `dur` kept to 0.8-1 s, and never shorter than the 6%-a-frame limit allows. */
export const diveDur = (dur = 0.9, zTo = 10) => Math.max(Math.min(1, Math.max(0.8, dur)), diveMinDur(1, zTo));

/**
 * The ONE shared dive into the body (replaces the copies in creatine.tsx and quit-sugar.tsx ShotA).
 * The `outside` picture (the person, frame pixels) zooms in about the `at` point (log-even, 0.8-1 s), with a round opening
 * at `at` that grows with it and shows the `inside` picture (already in its final framing, held still). The rim is the
 * kit's outline with skin and flesh bands, flat. Before t0 only the outside shows; after the dive only the inside.
 * `zTo` is how far the outside zooms (10 reads as "into the body").
 */
export const Dive: React.FC<{t: number; t0: number; dur?: number; at: P2; zTo?: number; outside: React.ReactNode; inside: React.ReactNode; skin?: string; flesh?: string}> = ({t, t0, dur = 0.9, at, zTo = 10, outside, inside, skin = '#f0c39d', flesh = '#c9505a'}) => {
  const d = diveDur(dur, zTo);
  const u = clamp01((t - t0) / d);
  if (u <= 0) return <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>{outside}</div>;
  if (u >= 1) return <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>{inside}</div>;
  const Z = diveZoom(u, 1, zTo, d);
  const [px, py] = at;
  // the opening, in the outside picture's own units: it opens over the first fifth, then grows with the zoom; it covers the
  // whole screen when the zoom ends (screen radius r * Z reaches the corner farthest from `at`)
  const far = Math.max(...[[0, 0], [1080, 0], [0, 1920], [1080, 1920]].map(([x, y]) => Math.hypot(x - px, y - py)));
  const r = ((far * 1.06) / zTo) * smoothStep(clamp01(u / 0.2));
  const R = r * Z; // on screen
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0}}>{inside}</div>
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${px}px ${py}px`, transform: `scale(${Z.toFixed(5)})`,
        WebkitMaskImage: `radial-gradient(circle at ${px}px ${py}px, transparent ${r.toFixed(2)}px, black ${(r + 1 / Z).toFixed(2)}px)`}}>{outside}</div>
      {R > 3 && (
        <svg style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}} width={1080} height={1920} viewBox="0 0 1080 1920">
          <circle cx={px} cy={py} r={R + 30} fill="none" stroke={skin} strokeWidth={26} />
          <circle cx={px} cy={py} r={R + 8} fill="none" stroke={flesh} strokeWidth={14} />
          {[R + 43, R + 16, R].map((rr, i) => <circle key={i} cx={px} cy={py} r={rr} fill="none" stroke={INK} strokeWidth={OUT} />)}
        </svg>
      )}
    </div>
  );
};

// ------------------------------------------------------------------ fight cloud and face marks (decision 18)
const hash = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
/**
 * The FIGHT CLOUD: a boiling white dust cloud that hides a scuffle (1-2 s): 6-9 lobes in the kit's white with the ink
 * line, re-drawn every 3 frames (a boil, not a wobble), small bits flying off the edge, a fist poking out now and then.
 * Flat: no glow, no blur. (x, y) its centre and r its radius in frame or screen pixels.
 */
export const FightCloud: React.FC<{t: number; t0: number; dur?: number; x: number; y: number; r?: number; seed?: number; col?: string; limb?: string}> = ({t, t0, dur = 1.5, x, y, r = 220, seed = 0, col = '#ffffff', limb = '#f2b8a0'}) => {
  const len = Math.max(1, Math.min(2, dur));
  const u = (t - t0) / len;
  if (u < 0 || u > 1) return null;
  const grow = u < 0.1 ? easeOutSoft(u / 0.1) : u > 0.85 ? 1 - smoothStep((u - 0.85) / 0.15) : 1;
  if (grow <= 0.01) return null;
  const tick = Math.floor((t - t0) * 20); // a new boil every 3 frames at 60 fps
  const n = 6 + Math.floor(hash(seed * 7 + 1) * 4); // 6-9 lobes
  const R = r * grow;
  const lobes = Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2 + hash(tick * 13 + i + seed) * 0.35;
    const d = R * (0.55 + hash(tick * 7 + i * 3 + seed) * 0.12);
    return {cx: x + Math.cos(a) * d, cy: y + Math.sin(a) * d * 0.82, rr: R * (0.38 + hash(tick * 5 + i * 11 + seed) * 0.1)};
  });
  const bits = Array.from({length: 5}, (_, i) => {
    const a = hash(i * 17 + seed) * Math.PI * 2, life = ((t - t0) * 2.2 + hash(i * 3 + seed)) % 1;
    return {bx: x + Math.cos(a) * R * (0.9 + life * 0.6), by: y + Math.sin(a) * R * (0.75 + life * 0.5), br: R * 0.07 * (1 - life)};
  });
  const poke = hash(tick * 3 + seed) > 0.55; // a fist out for this boil
  const pa = hash(tick * 9 + seed + 4) * Math.PI * 2;
  const [ax, ay] = [x + Math.cos(pa) * R * 0.6, y + Math.sin(pa) * R * 0.5];
  const [lx, ly] = [x + Math.cos(pa) * R * 0.98, y + Math.sin(pa) * R * 0.82];
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}} width={1080} height={1920} viewBox="0 0 1080 1920">
      {poke && (
        <g>
          <path d={`M ${ax} ${ay} L ${lx} ${ly}`} stroke={INK} strokeWidth={R * 0.13 + OUT * 2} strokeLinecap="round" />
          <path d={`M ${ax} ${ay} L ${lx} ${ly}`} stroke={limb} strokeWidth={R * 0.13} strokeLinecap="round" />
          <circle cx={lx} cy={ly} r={R * 0.1} fill={limb} stroke={INK} strokeWidth={OUT} />
        </g>
      )}
      {/* the ink under all the lobes, then the white on top: one cloud with one outline */}
      {lobes.map((l, i) => <circle key={'o' + i} cx={l.cx} cy={l.cy} r={l.rr + OUT / 2} fill={INK} />)}
      <ellipse cx={x} cy={y} rx={R * 0.62 + OUT / 2} ry={R * 0.52 + OUT / 2} fill={INK} />
      {lobes.map((l, i) => <circle key={'w' + i} cx={l.cx} cy={l.cy} r={l.rr - OUT / 2} fill={col} />)}
      <ellipse cx={x} cy={y} rx={R * 0.62 - OUT / 2} ry={R * 0.52 - OUT / 2} fill={col} />
      {bits.map((b, i) => b.br > 1 && <circle key={'b' + i} cx={b.bx} cy={b.by} r={b.br} fill={col} stroke={INK} strokeWidth={OUT * 0.6} />)}
    </svg>
  );
};

/** One sweat drop beside a face (frame or screen pixels), sliding down a little over its `life` (0..1). */
export const Sweat: React.FC<{x: number; y: number; size?: number; life?: number; col?: string}> = ({x, y, size = 40, life = 0, col = '#bfe3f2'}) => {
  const k = clamp01(life);
  const s = size / 18;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}} width={1080} height={1920} viewBox="0 0 1080 1920" opacity={1 - k * 0.5}>
      <path transform={`translate(${x} ${y + k * size * 0.8}) scale(${s})`} d="M 0 -9 C 3 -4 6 0 6 3 A 6 6 0 0 1 -6 3 C -6 0 -3 -4 0 -9 Z" fill={col} stroke={INK} strokeWidth={OUT / s} strokeLinejoin="round" />
    </svg>
  );
};
/** Small face marks: `lines` (three short strain lines), `bump` (a round lump), `anger` (the four-arc vein). */
export const Marks: React.FC<{kind: 'lines' | 'bump' | 'anger'; x: number; y: number; size?: number; rot?: number; col?: string}> = ({kind, x, y, size = 60, rot = 0, col = '#f08a8a'}) => {
  const s = size / 60;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible', pointerEvents: 'none'}} width={1080} height={1920} viewBox="0 0 1080 1920">
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
        {kind === 'lines' && [-18, 0, 18].map((a, i) => <path key={i} d={`M ${a * 0.9} -6 L ${a * 1.5} -28`} stroke={INK} strokeWidth={OUT / s} strokeLinecap="round" transform={`rotate(${a})`} />)}
        {kind === 'bump' && <path d="M -26 6 C -24 -26 24 -26 26 6 Z" fill={col} stroke={INK} strokeWidth={OUT / s} strokeLinejoin="round" />}
        {kind === 'anger' && [0, 90, 180, 270].map((a) => <path key={a} d="M 6 -22 Q 6 -6 22 -6" fill="none" stroke="#e0463c" strokeWidth={(OUT * 1.4) / s} strokeLinecap="round" transform={`rotate(${a})`} />)}
      </g>
    </svg>
  );
};

// ------------------------------------------------------------------ acting while talking (the face talks, the body holds)
/**
 * 1 while `who` speaks (eased 0.2 s either side), else 0: a format-6 shot multiplies every BODY move by (1 - still) so
 * only the mouth and the pupils move while a character talks; a listener holds anyway.
 */
export const still = (s: ShotNow, who: string) => active(s, who, 0.2);
/** A line with the script's `key` word (the player passes it in; LineNow in play.tsx does not name it yet). */
export type KeyedLine = LineNow & {key?: string};
const bareWord = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, '');
/**
 * 0..1 around the KEY word of `who`'s current line (the script's `key`, else its last word): rises over 0.15 s just before the
 * word, holds while it is said (at least `hold` s), falls over 0.3 s after. One gesture a line: use it to blend the line's one
 * gesture (an arm up on "FEED", a point on "YOU"). 0 when `who` is not the one speaking.
 */
export const onKey = (s: ShotNow, who: string, hold = 0.35) => {
  const l = s.cur as KeyedLine | null;
  if (!l || l.who !== who || !l.words.length) return 0;
  const key = bareWord(l.key ?? l.words[l.words.length - 1].w);
  const w = l.words.find((x) => bareWord(x.w) === key) ?? l.words.find((x) => key && bareWord(x.w).includes(key)) ?? l.words[l.words.length - 1];
  const a = l.from + w.start, b = l.from + Math.max(w.end, w.start + hold);
  const k = Math.min(clamp01((s.t - (a - 0.15)) / 0.15), 1 - clamp01((s.t - b) / 0.3));
  return smoothStep(k);
};

/**
 * A pose CHOICE that cannot flip for a moment (the one-frame pops of 04-details.md M1: `k > 0.4 ? flexed : hanging` on a
 * value that dips for one frame). `valueAt` is the moving value as a function of time; the choice switches up at `up` and
 * down at `down` (hysteresis, walked from 3 x `look` seconds before t), and a switch that would last less than `look` is
 * ignored (when the states `look` before and `look` after agree, they win). Pure: the same t always gives the same answer.
 */
export const latched = (t: number, valueAt: (t: number) => number, up = 0.45, down = 0.35, look = 0.1) => {
  const step = 1 / 120;
  const from = t - look * 3;
  const n = Math.round((look * 4) / step);
  const on: boolean[] = [];
  let state = valueAt(from) >= (up + down) / 2;
  for (let i = 0; i <= n; i++) {
    const v = valueAt(from + i * step);
    if (state && v < down) state = false;
    else if (!state && v > up) state = true;
    on.push(state);
  }
  const at = (u: number) => on[Math.max(0, Math.min(n, Math.round((u - from) / step)))];
  const before = at(t - look), after = at(t + look);
  return before === after ? before : at(t);
};
