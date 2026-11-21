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
import {INK} from './kit';

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

/** A shake of the screen that dies away: px offsets at time t for a hit at t0. */
export const shake = (t: number, t0: number, amp = 18, dur = 0.35): [number, number] => {
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
export const Burst: React.FC<{t: number; t0: number; x: number; y: number; r?: number; dur?: number; col?: string}> = ({t, t0, x, y, r = 120, dur = 0.32, col = '#ffffff'}) => {
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
