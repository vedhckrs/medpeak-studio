// MedPeak Toons STAGES: body sets where the organ itself is the stage. The organ is drawn as a
// cutaway in place, filling the frame, with its own face on its wall; what happens to it is SHOWN
// (things fall in, stick, melt, hurt, get washed away) by a state the script changes over time.
// 100% code-drawn. Our own designs: learned from the format of the top Shorts, copied from nobody.
// To add a stage: draw it here, list its dials in STAGE_KEYS (director.ts) and add it to SETS.
import React, {useId} from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Canvas, H, W} from './camera';
import {blob, lift, lineOf, Part, type P, Scaled, shade, spline, stipplePath, taperedPath} from './ink';
import {Arm, type ArmSpec, type Emotion, Face} from './rig';
import type {RoomLook} from './director';
import {STYLE} from './style';
import {ARENA_ARMS, ARENA_SPOTS, arenaSpotsAt, arenaThings} from './stage-arena';
import {ARM_SPOTS, armSpotsAt, armThings} from './stage-arm';
import {MACRO_SPOTS, macroSpotsAt, macroThings} from './stage-macro';
import {theme} from '../brand/theme';

/** What the player hands a stage for each character the stage draws itself. */
export type StageFace = {emotion: Emotion; talk: number; blink: number; look: {x: number; y: number}; arms: [ArmSpec, ArmSpec] | null; squash: number; lean: number; nod: number};
/** `people` = where the people of the shot stand (boxes on screen), so a room can keep its small things clear of them. */
export type SetProps = {t: number; state?: Record<string, number>; faces?: Record<string, StageFace>; label?: string; look?: RoomLook; people?: {x0: number; y0: number; x1: number; y1: number}[]};
const REST: StageFace = {emotion: 'neutral', talk: 0, blink: 0, look: {x: 0, y: 0}, arms: [112, 68], squash: 0, lean: 0, nod: 0};

const FLESH = STYLE.fleshLine;
const LW = STYLE.setLinePx;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const io = (t: number) => { const u = clamp01(t); return u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2; };
const wrap = (v: number, m: number) => ((v % m) + m) % m;

const Tag: React.FC<{text: string; x?: number; y?: number}> = ({text, x = 700, y = 150}) => (
  <div style={{position: 'absolute', left: x, top: y, background: STYLE.label, color: '#fff', fontFamily: theme.font, fontWeight: 900, fontSize: 40, padding: '10px 28px', borderRadius: 40, border: '3px solid #0f6f66', letterSpacing: 1, boxShadow: '0 8px 0 rgba(29,43,79,0.25)'}}>{text}</div>
);

// ------------------------------------------------------------------ the food pipe
// A tube cut open lengthwise: muscle outside, a soft folded lining inside, the hollow in the middle.
const PIPE = {l: 350, r: 730, lining: 128, muscle: 96, face: [540, 1070] as P, pill: [548, 520] as P, pillRot: -40, pillK: 3.25};
const MED = '#7fe0d2'; // dissolved medicine: the capsule's teal, thinned
const MED_LINE = '#12907f';
const WATER = '#62baf7';

/** Where a stage's own characters are, for the camera (face centre, face width, "head" height, size). */
export const STAGE_SPOTS: Record<string, Record<string, {x: number; y: number; faceW: number; headH: number; size: number}>> = {
  foodpipe: {foodpipe: {x: PIPE.face[0], y: PIPE.face[1], faceW: 420, headH: 420, size: 700}, pill: {x: 606, y: 590, faceW: 240, headH: 290, size: 520}},
};

const Capsule: React.FC<{melt: number; f: StageFace}> = ({melt, f}) => {
  // local units, the capsule stands upright: the teal cap on top melts first, then the white body
  const cap = lerp(1, 0.3, io(melt / 0.8));
  const body = lerp(1, 0.6, io((melt - 0.55) / 0.45));
  const teal = '#19b8a6';
  const white = '#fffdf6';
  const capH = 72 * cap;
  const topD = `M-40 -6 V${-6 - Math.max(0, capH - 40)} A40 ${Math.min(40, capH)} 0 0 1 40 ${-6 - Math.max(0, capH - 40)} V-6 Z`;
  const botD = 'M-40 -6 H40 V38 A40 40 0 0 1 -40 38 Z';
  return (
    <g transform={`translate(0 ${(-70 * (1 - body)).toFixed(2)}) scale(${body})`}>
      {f.arms && ([0, 1] as const).map((i) => <Arm key={i} x={i ? 38 : -38} y={10} spec={f.arms![i]} color="#eef1f6" len={30} />)}
      <Part d={botD} fill={white} mat="hard" shadow={0.13} />
      <Part d={topD} fill={teal} mat="hard" shine={melt < 0.3 ? [-16, -50, 1] : null} />
      {melt > 0.05 && (
        <g opacity={clamp01(melt * 4)}>
          {[[-33, 30, 7.5], [-19, 15, 6.5], [-5, 8, 6], [9, 12, 6.5], [22, 9, 6], [34, 22, 6.5]].map(([x, len, w], i) => {
            const L = len * io(melt / 0.7);
            return (
              <g key={i}>
                <path d={`M${x - w} -8 V${-6 + L} A${w} ${w} 0 0 0 ${x + w} ${-6 + L} V-8 Z`} fill={teal} stroke={lineOf(teal)} strokeWidth={0.8} />
                <circle cx={x - 2.5} cy={-6 + L} r={1.8} fill="#ffffff" opacity={0.75} />
              </g>
            );
          })}
          {[[-18, -34, 5], [14, -22, 4], [-2, -52, 3.4]].map(([x, y, r], i) => melt > 0.25 + i * 0.15 && capH > 46 - i * 6 && <circle key={i} cx={x} cy={y} r={r} fill={lineOf(teal)} opacity={0.55} />)}
        </g>
      )}
      <path d="M-40 -6 H40" stroke={lineOf(teal)} strokeWidth={1.4} />
      <g transform="translate(0 28)"><Face emotion={f.emotion} talk={f.talk} blink={f.blink} look={f.look} size={0.86} skin={white} iris="#128f81" /></g>
    </g>
  );
};

/** The food pipe: the pill falls in, sticks, melts and burns the lining; water washes it down. */
export const FoodPipeStage: React.FC<SetProps> = ({t, state = {}, faces = {}, label}) => {
  const st = (k: string) => clamp01(state[k] ?? 0);
  const drop = st('drop');
  const stick = st('stick');
  const melt = st('melt');
  const sore = st('sore');
  const pain = st('pain');
  const water = st('water');
  const slide = st('slide');
  const me = faces.foodpipe ?? REST;
  const pill = faces.pill ?? REST;
  const uid = useId().replace(/:/g, '');

  // ---- the walls: a slow squeeze travels down them (the food pipe pushes things along)
  const squeeze = (y: number) => Math.sin(y * 0.0042 - t * 1.1) * 7;
  const bump = (y: number, seed: string) => (random(`${seed}${Math.round(y / 130)}`) - 0.5) * 22;
  const ys = Array.from({length: 19}, (_, i) => -160 + i * 125);
  const dent = (y: number, cy: number) => Math.exp(-(((y - cy) / 150) ** 2)) * 30 * stick; // the pill pushes the wall out
  const xl = (y: number) => PIPE.l + bump(y, 'fl') + squeeze(y) - dent(y, 350);
  const xr = (y: number) => PIPE.r + bump(y, 'fr') - squeeze(y + 300) + dent(y, 700);
  const edgeL = ys.map((y) => [xl(y), y] as P);
  const edgeR = ys.map((y) => [xr(y), y] as P);
  const off = (pts: P[], dx: number) => pts.map(([x, y]) => [x + dx, y] as P);
  const band = (a: P[], b: P[]) => spline([...a, ...[...b].reverse()], true, 0.4);
  const lumen = band(edgeL, edgeR);

  // ---- the pill: falls in, lodges across the pipe, later rides the water down
  const fall = drop < 1 ? 1 - (1 - drop) ** 2 : 1;
  const ride = io(slide);
  const px = lerp(lerp(650, PIPE.pill[0], fall), 560, ride);
  const py = lerp(lerp(-420, PIPE.pill[1], fall), 2380, ride);
  const prot = lerp(lerp(35, PIPE.pillRot, fall), -8 + Math.sin(t * 6) * 5, ride);
  const hit = drop > 0.86 && drop < 1 ? Math.sin(((drop - 0.86) / 0.14) * Math.PI) : 0;
  const wobble = slide === 0 && melt < 0.9 ? Math.sin(t * 9) * 1.2 * (pill.emotion === 'scared' ? 1 : 0.3) : 0;
  const gone = melt > 0.97 && slide === 0;

  // ---- water: a wave comes down the pipe, passes in front of the face and runs on to the stomach
  const WAVE = 1150; // how long the body of water is
  const front = -200 + water * 3900;
  const tail = front - WAVE;
  const top = Math.max(tail, -200);
  const bot = Math.min(front, H + 200);
  const stream = (dx: number, w: number) => {
    const pts: P[] = [];
    const n = 14;
    const wAt = (y: number) => w * (tail > -200 ? clamp01((y - top) / 320) ** 0.7 : 1) * (0.72 + 0.28 * clamp01((front - y) / 200));
    for (let i = 0; i <= n; i++) { const y = top + (i / n) * (bot - top); pts.push([560 + dx - wAt(y) + Math.sin(y * 0.012 + t * 5) * 14, y]); }
    for (let i = n; i >= 0; i--) { const y = top + (i / n) * (bot - top); pts.push([560 + dx + wAt(y) + Math.sin(y * 0.012 + t * 5 + 1.4) * 14, y]); }
    return spline(pts, true, 0.4);
  };
  const flowing = water > 0 && top < H + 100 && bot - top > 40;
  const wet = clamp01((water - 0.45) * 4); // what the wave leaves behind

  const soreAt: P = [xl(360) + 62, 372];
  const healed = clamp01((sore - 0.85) / 0.15); // once the sore is fully open (the later scene), the medicine has soaked away
  const throb = pain * (0.6 + 0.4 * Math.sin(t * 9));
  const K = 6.2; // the food pipe's face: character units to pixels
  return (
    <AbsoluteFill style={{background: '#6a2c45'}}>
      <Canvas>
        <defs>
          <linearGradient id="fpBack" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8e3c52" /><stop offset="0.16" stopColor="#f2a39f" /><stop offset="0.5" stopColor="#fbc4b8" /><stop offset="0.86" stopColor="#ef9c9b" /><stop offset="1" stopColor="#7d3049" /></linearGradient>
          <linearGradient id="fpSideL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8a2f47" stopOpacity="0.55" /><stop offset="1" stopColor="#8a2f47" stopOpacity="0" /></linearGradient>
          <linearGradient id="fpSideR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#8a2f47" stopOpacity="0.55" /><stop offset="1" stopColor="#8a2f47" stopOpacity="0" /></linearGradient>
          <linearGradient id="fpLinL" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#d9697a" /><stop offset="1" stopColor="#f7a5a8" /></linearGradient>
          <linearGradient id="fpLinR" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#d9697a" /><stop offset="1" stopColor="#f7a5a8" /></linearGradient>
          <radialGradient id="fpSore"><stop offset="0" stopColor="#e2283c" stopOpacity="0.95" /><stop offset="0.5" stopColor="#e2283c" stopOpacity="0.5" /><stop offset="1" stopColor="#e2283c" stopOpacity="0" /></radialGradient>
          <linearGradient id="fpWater" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3f9fe6" /><stop offset="0.4" stopColor="#8fd3ff" /><stop offset="1" stopColor="#3f9fe6" /></linearGradient>
          <clipPath id={`fpLumen${uid}`}><path d={lumen} /></clipPath>
        </defs>

        {/* outside the pipe: the chest around it, kept dark and quiet */}
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#6a2c45" />
        {[[-40, 300, 320, 520], [1130, 900, 330, 600], [-60, 1500, 300, 520], [1150, 250, 280, 420]].map(([x, y, rx, ry], i) => <path key={i} d={blob(rx, ry, `fpo${i}`, 10, 0.1, x, y)} fill={i % 2 ? '#7a3550' : '#5c243c'} />)}

        {/* the muscle coat, then the lining */}
        {[['L', edgeL, -1], ['R', edgeR, 1]].map(([name, e, s]) => {
          const edge = e as P[];
          const k = s as number;
          const out1 = off(edge, k * PIPE.lining);
          const out2 = off(edge, k * (PIPE.lining + PIPE.muscle));
          return (
            <g key={name as string}>
              <path d={band(out1, out2)} fill="#b9495f" />
              {Array.from({length: 16}).map((_, i) => {
                const y = -100 + i * 130 + (k > 0 ? 60 : 0);
                const x = (k < 0 ? xl(y) : xr(y)) + k * (PIPE.lining + 22 + (i % 3) * 22);
                return <path key={i} d={taperedPath([[x, y], [x + k * 4, y + 60], [x, y + 120]], 7)} fill="#9c3850" opacity={0.75} />;
              })}
              <path d={spline(out2, false)} fill="none" stroke="#f0a7a4" strokeWidth={7} opacity={0.5} />
              <path d={spline(out2, false)} fill="none" stroke={FLESH} strokeWidth={LW} />
              <path d={band(edge, out1)} fill={`url(#fpLin${name})`} />
              {Array.from({length: 13}).map((_, i) => {
                const y = -60 + i * 160 + (k > 0 ? 80 : 0);
                const x0 = (k < 0 ? xl(y) : xr(y)) + k * 14;
                return (
                  <g key={i}>
                    <path d={taperedPath([[x0, y + 7], [x0 + k * 50, y + 16], [x0 + k * 100, y + 9]], 6)} fill="#ffc9c4" opacity={0.6} />
                    <path d={taperedPath([[x0, y], [x0 + k * 50, y + 9], [x0 + k * 104, y + 2]], 7)} fill="#cf5d70" />
                  </g>
                );
              })}
              <path d={stipplePath(k < 0 ? [PIPE.l - PIPE.lining, -100, PIPE.l, H + 100] : [PIPE.r, -100, PIPE.r + PIPE.lining, H + 100], `fps${name}`, 150, 0.2, [1.6, 3.6], k < 0)} fill="#c2506a" opacity={0.3} />
              <path d={spline(out1, false)} fill="none" stroke="#a23d55" strokeWidth={LW} opacity={0.8} />
            </g>
          );
        })}

        {/* the hollow: its back wall curves away, with soft rings */}
        <path d={lumen} fill="url(#fpBack)" />
        <g clipPath={`url(#fpLumen${uid})`}>
          {Array.from({length: 10}).map((_, i) => {
            const y = 60 + i * 205;
            return (
              <g key={i} opacity={0.6}>
                <path d={`M${PIPE.l - 30} ${y} Q540 ${y + 56} ${PIPE.r + 30} ${y}`} fill="none" stroke="#e88f93" strokeWidth={22} strokeLinecap="round" />
                <path d={`M${PIPE.l - 30} ${y + 17} Q540 ${y + 73} ${PIPE.r + 30} ${y + 17}`} fill="none" stroke="#ffd9cf" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
              </g>
            );
          })}
          <rect x={PIPE.l - 60} y={-200} width={150} height={H + 400} fill="url(#fpSideL)" />
          <rect x={PIPE.r - 90} y={-200} width={150} height={H + 400} fill="url(#fpSideR)" />
          <rect x={0} y={-200} width={W} height={H + 400} fill="#e2283c" opacity={0.16 * Math.max(sore * 0.5, throb)} />
        </g>

        {/* the sore: redness first, then an open sore where the pill sat */}
        {sore > 0.01 && (
          <g>
            <ellipse cx={soreAt[0]} cy={soreAt[1]} rx={(70 + 150 * sore) * (1 + throb * 0.08)} ry={(90 + 190 * sore) * (1 + throb * 0.08)} fill="url(#fpSore)" opacity={0.5 + 0.5 * sore} />
            <ellipse cx={xr(720) - 14} cy={730} rx={50 + 90 * sore} ry={70 + 120 * sore} fill="url(#fpSore)" opacity={0.6 * sore} />
            {sore > 0.45 && (() => {
              const k = io((sore - 0.45) / 0.55);
              return (
                <g transform={`translate(${soreAt[0] - 8} ${soreAt[1] + 10}) scale(${0.5 + 0.8 * k})`}>
                  <path d={blob(58, 84, 'ulc', 11, 0.16)} fill="#9c1a2c" stroke="#6d1020" strokeWidth={LW} />
                  <path d={blob(40, 62, 'ulc2', 10, 0.18, 3, 4)} fill="#c9364a" />
                  <path d={blob(22, 36, 'ulc3', 9, 0.2, 5, 8)} fill="#f6d9ae" opacity={0.92} />
                  <path d={blob(58, 84, 'ulc', 11, 0.16)} fill="none" stroke="#ffb7b0" strokeWidth={5} opacity={0.5} transform="translate(-5 -6)" />
                </g>
              );
            })()}
          </g>
        )}

        {/* dissolved medicine running down the wall */}
        {melt > 0.04 && slide < 0.4 && (
          <g opacity={(1 - slide * 2.5) * (1 - healed)}>
            {[[14, 0.0, 1], [44, 0.18, 0.7], [-6, 0.34, 0.5]].map(([dx, lag, k], i) => {
              const m = clamp01((melt - lag) / (1 - lag));
              if (m <= 0) return null;
              const x = xl(440) + 20 + dx;
              const y0 = 400 + i * 26;
              const y1 = y0 + m * 560 * k + Math.sin(t * 2 + i) * 6;
              return (
                <g key={i}>
                  <path d={`M${x - 9} ${y0} Q${x - 13} ${(y0 + y1) / 2} ${x - 11} ${y1} A11 11 0 0 0 ${x + 11} ${y1} Q${x + 13} ${(y0 + y1) / 2} ${x + 9} ${y0} Z`} fill={MED} stroke={MED_LINE} strokeWidth={2.4} opacity={0.96} />
                  <circle cx={x - 4} cy={y1 - 3} r={3.4} fill="#ffffff" opacity={0.9} />
                </g>
              );
            })}
            <path d={blob(34 + 30 * melt, 50 + 60 * melt, 'pud', 10, 0.14, xl(380) + 30, 380)} fill={MED} stroke={MED_LINE} strokeWidth={2.4} opacity={0.94} />
            {Array.from({length: 9}).map((_, i) => {
              const life = wrap(t * 0.9 + random(`fz${i}`), 1);
              return <circle key={i} cx={xl(380) + 10 + random(`fx${i}`) * 120} cy={400 - life * 90 - random(`fy${i}`) * 30} r={4 + random(`fr${i}`) * 6} fill="none" stroke="#e9fffb" strokeWidth={2.4} opacity={(1 - life) * clamp01(melt * 4)} />;
            })}
          </g>
        )}

        {/* the food pipe's own face and hands, on its back wall */}
        <g transform={`translate(${PIPE.face[0]} ${PIPE.face[1] + me.nod * 14}) rotate(${me.lean * 0.6})`}>
          <Scaled s={K}>
            <g transform={`scale(${1 + me.squash * 0.1} ${1 - me.squash * 0.1})`}>
              {me.arms && ([0, 1] as const).map((i) => <Arm key={i} x={i ? 22 : -22} y={26} spec={me.arms![i]} color="#f29ba1" len={22} />)}
              <Face emotion={me.emotion} talk={me.talk} blink={me.blink} look={me.look} size={1.06} skin="#f8b9b1" iris="#b23a5a" />
            </g>
          </Scaled>
        </g>

        {/* water: in front of the face (it runs through the hollow), behind the pill riding it */}
        {flowing && (
          <g clipPath={`url(#fpLumen${uid})`}>
            <path d={stream(0, 150)} fill="url(#fpWater)" opacity={0.86} />
            <path d={stream(-52, 20)} fill="#dff4ff" opacity={0.75} />
            <path d={stream(70, 12)} fill="#dff4ff" opacity={0.55} />
            {front < H + 100 && <path d={blob(190, 84, 'spl', 10, 0.2, 560, front)} fill="#c9ecff" opacity={0.95} />}
            {front < H + 100 && [[-170, -40, 16], [150, -60, 13], [-60, -96, 11], [84, -110, 9]].map(([dx, dy, r], i) => <circle key={i} cx={560 + dx} cy={front + dy + Math.sin(t * 9 + i) * 10} r={r} fill="#e6f6ff" opacity={0.9} />)}
            {Array.from({length: 12}).map((_, i) => {
              const y = wrap(random(`wy${i}`) * 2200 + t * 900, 2200) - 150;
              return y < front && y > top ? <circle key={i} cx={440 + random(`wx${i}`) * 240} cy={y} r={5 + random(`wr${i}`) * 8} fill="#ffffff" opacity={0.7} /> : null;
            })}
          </g>
        )}
        {wet > 0 && (
          <g clipPath={`url(#fpLumen${uid})`} opacity={wet}>
            {Array.from({length: 9}).map((_, i) => {
              const x = PIPE.l + 26 + random(`dx${i}`) * (PIPE.r - PIPE.l - 52);
              const y = wrap(random(`dy${i}`) * H + t * (26 + random(`ds${i}`) * 30), H + 120) - 60;
              const r = 7 + random(`dr${i}`) * 7;
              return (
                <g key={i}>
                  <path d={`M${x} ${y - r * 2.1} C${x + r * 1.1} ${y - r * 0.4} ${x + r} ${y + r} ${x} ${y + r} C${x - r} ${y + r} ${x - r * 1.1} ${y - r * 0.4} ${x} ${y - r * 2.1} Z`} fill={WATER} stroke="#2f86c9" strokeWidth={1.6} opacity={0.9} />
                  <circle cx={x - r * 0.3} cy={y + r * 0.1} r={r * 0.26} fill="#ffffff" opacity={0.9} />
                </g>
              );
            })}
          </g>
        )}

        {/* the pill */}
        {!gone && (
          <g transform={`translate(${(px + wobble - stick * 8).toFixed(1)} ${(py + pill.nod * 4).toFixed(1)}) rotate(${prot.toFixed(1)})`}>
            <Scaled s={PIPE.pillK}>
              <g transform={`scale(${1 + hit * 0.14} ${1 - hit * 0.14})`}><Capsule melt={slide > 0 ? 0 : melt} f={pill} /></g>
            </Scaled>
          </g>
        )}
        

        {/* wet glints sliding down the lining */}
        {Array.from({length: 6}).map((_, i) => {
          const left = i % 2 === 0;
          const y = wrap(random(`fg${i}`) * (H + 300) + t * (60 + random(`fgs${i}`) * 50), H + 300) - 150;
          const x = left ? xl(y) - 26 - random(`fgx${i}`) * 60 : xr(y) + 26 + random(`fgx${i}`) * 60;
          return <path key={i} d={taperedPath([[x, y - 44], [x + 2, y], [x, y + 44]], 7)} fill="#ffe4dc" opacity={0.55} />;
        })}
        <path d={spline(off(edgeL, 12), false)} fill="none" stroke="#ffd6cd" strokeWidth={7} opacity={0.6} />
        <path d={spline(edgeL, false)} fill="none" stroke={FLESH} strokeWidth={LW} />
        <path d={spline(edgeR, false)} fill="none" stroke={FLESH} strokeWidth={LW} />

        {/* pain marks */}
        {pain > 0.05 && [[-96, -196, -30], [96, -214, 20], [206, -40, 60]].map(([dx, dy, r], i) => (
          <path key={i} transform={`translate(${soreAt[0] + dx} ${soreAt[1] + dy}) rotate(${r}) scale(${1.5 + throb * 0.7})`} d="M0 -34 L10 -8 L26 -12 L8 34 L4 6 L-14 10 Z" fill="#ffd23c" stroke="#b9772a" strokeWidth={3} strokeLinejoin="round" opacity={pain} />
        ))}

        {/* light from above, dark toward the stomach */}
        <defs>
          <radialGradient id="fpLight" cx="0.5" cy="-0.05" r="0.6"><stop offset="0" stopColor="#fff3df" stopOpacity={(0.42 + 0.06 * Math.sin(t * 0.9)) * STYLE.glow} /><stop offset="1" stopColor="#fff3df" stopOpacity="0" /></radialGradient>
          <linearGradient id="fpDown" x1="0" y1="0" x2="0" y2="1"><stop offset="0.72" stopColor="#3d1226" stopOpacity="0" /><stop offset="1" stopColor="#3d1226" stopOpacity="0.5" /></linearGradient>
        </defs>
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#fpLight)" />
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#fpDown)" />
      </Canvas>
      <Tag text={label ?? 'FOOD PIPE'} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the tooth
// A molar cut in half, standing in its gum: white enamel outside, cream dentine inside, the pink
// pulp in the middle. Sugar lands on it, the germs eat it and make acid, the acid opens a hole.
const TOOTH = {face: [540, 884] as P, K: 4.5, germ: [712, 366] as P, germK: 2.25};
const ACID = '#b9e04a';
const ACID_LINE = '#6f9a1c';
const GERM = '#8bd469';
const ENAMEL = '#fffdf6';
const DENTINE = '#f7e3b4';
/** The outline of the crown (enamel), from the left of the neck over the two cusps to the right of the neck. */
const CROWN: P[] = [[288, 1204], [246, 1040], [226, 860], [240, 690], [286, 560], [352, 486], [430, 498], [540, 566], [650, 498], [728, 486], [794, 560], [840, 690], [854, 860], [834, 1040], [792, 1204]];
const CROWN_IN: P[] = [[340, 1204], [304, 1040], [290, 860], [302, 724], [340, 634], [392, 582], [452, 588], [540, 648], [628, 588], [688, 582], [740, 634], [778, 724], [790, 860], [776, 1040], [740, 1204]];
const ROOTS: P[] = [[288, 1196], [270, 1400], [292, 1640], [334, 1830], [376, 1640], [432, 1440], [540, 1336], [648, 1440], [704, 1640], [746, 1830], [788, 1640], [810, 1400], [792, 1196]];
/** The way the hole goes in: through the enamel on the right shoulder, then down into the dentine. */
const CAV: P[] = [[828, 598], [796, 640], [764, 686], [736, 728], [716, 762]];
const topY = (x: number) => { // how high the chewing surface is at x
  const pts: P[] = [[286, 560], [352, 486], [430, 498], [540, 566], [650, 498], [728, 486], [794, 560]];
  if (x <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) if (x <= pts[i][0]) { const k = (x - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]); return lerp(pts[i - 1][1], pts[i][1], k); }
  return pts[pts.length - 1][1];
};
const onPath = (pts: P[], k: number): P => { // the point a fraction k along a polyline
  const lens = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  let d = clamp01(k) * lens.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lens.length; i++) { if (d <= lens[i]) return [lerp(pts[i][0], pts[i + 1][0], d / lens[i]), lerp(pts[i][1], pts[i + 1][1], d / lens[i])]; d -= lens[i]; }
  return pts[pts.length - 1];
};
const star4 = (x: number, y: number, r: number) => `M${x} ${y - r} Q${x + r * 0.16} ${y - r * 0.16} ${x + r} ${y} Q${x + r * 0.16} ${y + r * 0.16} ${x} ${y + r} Q${x - r * 0.16} ${y + r * 0.16} ${x - r} ${y} Q${x - r * 0.16} ${y - r * 0.16} ${x} ${y - r} Z`;
STAGE_SPOTS.tooth = {tooth: {x: TOOTH.face[0], y: TOOTH.face[1], faceW: 330, headH: 330, size: 620}, bacteria: {x: TOOTH.germ[0], y: TOOTH.germ[1], faceW: 150, headH: 170, size: 320}};

/** One small germ of the gang: a blob with two dot eyes and a grin. */
const Minion: React.FC<{x: number; y: number; r: number; seed: string; t: number}> = ({x, y, r, seed, t}) => {
  const bob = Math.sin(t * 5 + random(seed) * 6) * 3;
  return (
    <g transform={`translate(${x} ${y + bob})`}>
      <path d={blob(r, r * 0.88, seed, 9, 0.12)} fill={GERM} stroke="#3f8a2c" strokeWidth={LW} />
      <path d={blob(r * 0.62, r * 0.5, `${seed}h`, 8, 0.1, -r * 0.16, -r * 0.24)} fill="#c9f0a8" opacity={0.6} />
      <circle cx={-r * 0.3} cy={-r * 0.12} r={r * 0.14} fill="#1f4d1c" />
      <circle cx={r * 0.26} cy={-r * 0.12} r={r * 0.14} fill="#1f4d1c" />
      <path d={`M${-r * 0.3} ${r * 0.22} Q0 ${r * 0.52} ${r * 0.3} ${r * 0.22}`} fill="none" stroke="#1f4d1c" strokeWidth={LW} strokeLinecap="round" />
    </g>
  );
};

/** The tooth: sugar lands, the germs feast and make acid, a hole opens; spit, a brush and fluoride fight back. */
export const ToothStage: React.FC<SetProps> = ({t, state = {}, faces = {}, label}) => {
  const st = (k: string) => clamp01(state[k] ?? 0);
  const sugar = st('sugar');
  const feast = st('feast');
  const acid = st('acid');
  const hole = st('hole');
  const pain = st('pain');
  const saliva = st('saliva');
  const mend = st('mend');
  const brush = st('brush');
  const shield = st('shield');
  const night = st('night');
  const me = faces.tooth ?? REST;
  const germ = faces.bacteria ?? REST;
  const uid = useId().replace(/:/g, '');
  const throb = pain * (0.6 + 0.4 * Math.sin(t * 9));
  const crown = `${spline(CROWN, false, 0.45)} Z`;
  const crownIn = `${spline(CROWN_IN, false, 0.45)} Z`;
  const roots = `${spline(ROOTS, false, 0.4)} Z`;
  const depth = hole * (1 - mend * 0.85); // spit and fluoride put minerals back while the hole is still small
  const sour = acid * (1 - saliva);

  // ---- the brush sweeps the chewing surface from left to right and knocks the germs off
  const bx = lerp(-320, 1420, io(brush));
  const knock = (gx: number) => (brush > 0 ? clamp01((bx - gx + 70) / 300) : 0);
  const fly = (gx: number): string => { const k = knock(gx); return `translate(${(k * 300).toFixed(1)} ${(-k * 460 + k * k * 620).toFixed(1)}) rotate(${(k * 220).toFixed(1)})`; };
  const gang: [number, number, number][] = [[392, 0, 34], [470, 0, 28], [560, 0, 38], [626, 0, 26], [316, 0, 26], [806, 60, 30], [262, 150, 24]];
  const gk = knock(TOOTH.germ[0]);

  // ---- sugar: crystals and candy bits rain down and land in the groove
  const bits: {x: number; col: string; r: number}[] = [{x: 430, col: '#ffffff', r: 27}, {x: 508, col: '#ff8fb3', r: 33}, {x: 572, col: '#ffffff', r: 25}, {x: 630, col: '#8fd9ff', r: 28}, {x: 470, col: '#ffe08a', r: 22}, {x: 540, col: '#ffffff', r: 28}, {x: 598, col: '#ff8fb3', r: 22}, {x: 392, col: '#8fd9ff', r: 20}, {x: 664, col: '#ffffff', r: 20}];

  // ---- the hole: a rough tunnel of decay along CAV
  const steps = Math.max(1, Math.round(depth * 12));
  const tunnel = depth > 0.03 ? Array.from({length: steps + 1}, (_, i) => { const k = i / steps; const p = onPath(CAV, k * depth); return {p, r: lerp(60, 34, k) * Math.min(1, 0.5 + depth * 1.4), k}; }) : [];

  return (
    <AbsoluteFill style={{background: '#4b1c2e'}}>
      <Canvas>
        <defs>
          <radialGradient id="tsBack" cx="0.5" cy="0.2" r="0.9"><stop offset="0" stopColor="#8a3350" /><stop offset="0.6" stopColor="#5b2238" /><stop offset="1" stopColor="#3a1424" /></radialGradient>
          <linearGradient id="tsEnamel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="0.6" stopColor={ENAMEL} /><stop offset="1" stopColor="#e6dfcf" /></linearGradient>
          <linearGradient id="tsDentine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fcedc6" /><stop offset="1" stopColor="#ecd099" /></linearGradient>
          <linearGradient id="tsGum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f58f9f" /><stop offset="0.5" stopColor="#e8707f" /><stop offset="1" stopColor="#c25062" /></linearGradient>
          <linearGradient id="tsBone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6dfc4" /><stop offset="1" stopColor="#e3c19b" /></linearGradient>
          <radialGradient id={`tsPulp${uid}`}><stop offset="0" stopColor={pain > 0.05 ? '#ff5a6a' : '#ff9aa6'} /><stop offset="1" stopColor={pain > 0.05 ? '#d93348' : '#ef6f80'} /></radialGradient>
          <radialGradient id="tsHole" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stopColor="#3a1d14" /><stop offset="1" stopColor="#6b4326" /></radialGradient>
          <radialGradient id="tsSore"><stop offset="0" stopColor="#e2283c" stopOpacity="0.85" /><stop offset="1" stopColor="#e2283c" stopOpacity="0" /></radialGradient>
          <clipPath id="tsCrown"><path d={crown} /></clipPath>
        </defs>

        {/* the mouth behind: dark, warm, quiet */}
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#tsBack)" />
        {[[120, 260, 300, 200], [960, 300, 320, 220], [540, 120, 420, 150]].map(([x, y, rx, ry], i) => <path key={i} d={blob(rx, ry, `tsb${i}`, 10, 0.1, x, y)} fill="#7a2c46" opacity={0.45} />)}

        {/* night: the mouth is closed and dark, a moon and stars for bedtime */}
        {night > 0.01 && (
          <g opacity={night}>
            <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#141a45" opacity={0.74} />
            {[[150, 520, 15], [96, 780, 11], [1004, 600, 14], [960, 860, 10], [70, 1040, 12], [1010, 1080, 11], [520, 236, 12]].map(([x, y, r], i) => <path key={i} d={star4(x, y, r * (0.75 + 0.25 * Math.sin(t * 2.2 + i * 1.9)))} fill="#fff6c9" opacity={0.9} />)}
            <g transform="translate(948 300)">
              <circle r={92} fill="#fff3b0" opacity={0.16} />
              <path d="M22 -62 A66 66 0 1 0 62 30 A52 52 0 1 1 22 -62 Z" fill="#fff3b0" stroke="#d9c46a" strokeWidth={3} />
            </g>
          </g>
        )}

        {/* the jaw: bone below, gum over it */}
        <path d={`M-300 1392 Q200 1352 540 1396 Q880 1352 1380 1392 V${H + 300} H-300 Z`} fill="url(#tsBone)" />
        <path d={stipplePath([-100, 1420, W + 100, H + 100], 'tsbone', 190, 0.1, [3, 8])} fill="#cfa77c" opacity={0.42} />
        <path d={`M-300 1392 Q200 1352 540 1396 Q880 1352 1380 1392`} fill="none" stroke="#b98a5f" strokeWidth={LW} opacity={0.7} />

        {/* the neighbours, whole and healthy */}
        {[-1, 1].map((sd) => (
          <g key={sd} transform={`translate(${540 + sd * 568} 0)`}>
            <path d={spline([[-150, 1260], [-176, 1000], [-160, 720], [-96, 600], [0, 628], [96, 600], [160, 720], [176, 1000], [150, 1260]], false, 0.45) + ' Z'} fill="url(#tsEnamel)" stroke="#b9ae97" strokeWidth={LW} />
            <path d={`M${-sd * 120} 700 Q${-sd * 150} 900 ${-sd * 124} 1140`} fill="none" stroke="#ffffff" strokeWidth={16} strokeLinecap="round" opacity={0.7} />
          </g>
        ))}

        {/* the roots in their sockets */}
        <rect x={284} y={1186} width={512} height={230} fill="#f6dfc4" />
        <path d={roots} fill="url(#tsDentine)" stroke="#b08a52" strokeWidth={LW} />
        {/* the crown: enamel, then the dentine inside it */}
        <path d={crown} fill="url(#tsEnamel)" stroke="#a89f8a" strokeWidth={LW} />
        <path d={crownIn} fill="url(#tsDentine)" stroke="#d6b77a" strokeWidth={2.2} />
        <path d={stipplePath([300, 600, 780, 1200], 'tsdent', 120, 0.1, [2, 4.4])} fill="#dcb877" opacity={0.3} clipPath="url(#tsCrown)" />
        {/* the pulp: the living middle, with its canals down the roots */}
        <g>
          <path d="M468 1150 C456 1096 482 1068 502 1090 C520 1110 560 1110 578 1090 C598 1068 624 1096 612 1150 C606 1200 590 1236 586 1280 C600 1420 668 1640 742 1806 C728 1812 722 1806 716 1794 C650 1650 584 1470 552 1330 C546 1318 534 1318 528 1330 C496 1470 430 1650 364 1794 C358 1806 352 1812 338 1806 C412 1640 480 1420 494 1280 C490 1236 474 1200 468 1150 Z" fill={`url(#tsPulp${uid})`} stroke="#b9485c" strokeWidth={2.4} />
          <path d="M516 1140 C512 1260 470 1480 372 1760" fill="none" stroke="#e2283c" strokeWidth={3} strokeLinecap="round" opacity={0.75} />
          <path d="M564 1140 C568 1260 610 1480 708 1760" fill="none" stroke="#4b7fd1" strokeWidth={3} strokeLinecap="round" opacity={0.75} />
          {pain > 0.05 && <ellipse cx={540} cy={1160} rx={130 * (1 + throb * 0.1)} ry={96 * (1 + throb * 0.1)} fill="url(#tsSore)" opacity={0.75 * pain} />}
        </g>
        {/* enamel shine */}
        <path d="M262 900 Q250 720 310 590" fill="none" stroke="#ffffff" strokeWidth={15} strokeLinecap="round" opacity={0.9} />
        <path d="M352 520 Q392 500 424 512" fill="none" stroke="#ffffff" strokeWidth={10} strokeLinecap="round" opacity={0.8} />
        {/* fluoride: a teal coat on the enamel */}
        {shield > 0.01 && (
          <g opacity={shield}>
            <path d={spline(CROWN, false, 0.45)} fill="none" stroke="#2ec4b6" strokeWidth={22} strokeLinecap="round" opacity={0.34} />
            <path d={spline(CROWN, false, 0.45)} fill="none" stroke="#7ff0e2" strokeWidth={8} strokeLinecap="round" opacity={0.9} />
            {[[214, 640], [300, 470], [540, 500], [790, 462], [872, 720], [868, 1000], [206, 980]].map(([x, y], i) => <path key={i} d={star4(x, y, (22 + (i % 3) * 8) * (0.7 + 0.3 * Math.sin(t * 4 + i * 1.7)))} fill="#ffffff" stroke="#2ec4b6" strokeWidth={2} />)}
          </g>
        )}
        {/* the gum: cut through at the tooth, rising between the teeth, lapping over the neighbours */}
        {[-1, 1].map((sd) => (
          <g key={sd} transform={sd < 0 ? undefined : `translate(${W} 0) scale(-1 1)`}>
            <path d="M-300 1150 C-200 1106 -120 1150 -40 1214 C40 1262 120 1246 172 1176 C198 1124 240 1112 268 1150 C292 1176 300 1210 296 1250 C290 1310 292 1356 300 1396 Q150 1360 -300 1396 Z" fill="url(#tsGum)" stroke={FLESH} strokeWidth={LW} />
            <path d="M-260 1160 C-190 1130 -120 1166 -44 1230 C38 1282 126 1262 176 1194 C200 1150 236 1140 258 1166" fill="none" stroke="#ffc9cf" strokeWidth={9} strokeLinecap="round" opacity={0.75} />
            <path d="M-300 1360 Q120 1322 296 1372" fill="none" stroke="#b9485c" strokeWidth={10} strokeLinecap="round" opacity={0.22} />
          </g>
        ))}

        {/* the tooth's own face and hands */}
        <g transform={`translate(${TOOTH.face[0]} ${TOOTH.face[1] + me.nod * 12}) rotate(${me.lean * 0.5})`}>
          <Scaled s={TOOTH.K}>
            <g transform={`scale(${1 + me.squash * 0.08} ${1 - me.squash * 0.08})`}>
              {me.arms && ([0, 1] as const).map((i) => <Arm key={i} x={i ? 30 : -30} y={30} spec={me.arms![i]} color="#efd9a6" len={22} />)}
              <Face emotion={me.emotion} talk={me.talk} blink={me.blink} look={me.look} size={1.04} skin={DENTINE} iris="#2f86b0" />
            </g>
          </Scaled>
        </g>

        {/* sugar */}
        {sugar > 0 && bits.map((b, i) => {
          const p = clamp01((sugar - i * 0.06) / 0.46);
          if (p <= 0) return null;
          const land = topY(b.x) - b.r * 0.7 - (i > 4 ? 40 : 0);
          const y = lerp(-140 - i * 60, land, p * p) - Math.sin(clamp01((p - 0.86) / 0.14) * Math.PI) * 16;
          const eat = clamp01(1 - feast * (1.15 + i * 0.05));
          if (eat <= 0.02) return null;
          return (
            <g key={i} transform={`translate(${b.x} ${y.toFixed(1)}) rotate(${(i * 37 + (1 - p) * 220).toFixed(0)}) scale(${eat.toFixed(2)})`}>
              <rect x={-b.r} y={-b.r} width={b.r * 2} height={b.r * 2} rx={b.r * 0.28} fill={b.col} stroke={b.col === '#ffffff' ? '#b9c6d8' : '#a85a78'} strokeWidth={2.4} />
              <path d={`M${-b.r * 0.6} ${-b.r * 0.5} H${b.r * 0.2}`} stroke="#ffffff" strokeWidth={b.r * 0.22} strokeLinecap="round" opacity={0.9} />
            </g>
          );
        })}

        {/* acid: a sour puddle where the germs spit, running down the tooth */}
        {sour > 0.02 && (
          <g opacity={clamp01(sour * 2.2)}>
            <path d={blob(62 + 54 * acid, 30 + 22 * acid, 'tsacid', 10, 0.16, 800, 586, -34)} fill={ACID} stroke={ACID_LINE} strokeWidth={LW} opacity={0.95} />
            {[[846, 0.0, 1], [870, 0.25, 0.7], [826, 0.45, 0.5]].map(([x, lag, k], i) => {
              const m = clamp01((acid - lag) / (1 - lag));
              if (m <= 0) return null;
              const y0 = 640 + i * 30;
              const y1 = y0 + m * 330 * k + Math.sin(t * 2 + i) * 6;
              return <path key={i} d={`M${x - 10} ${y0} Q${x - 14} ${(y0 + y1) / 2} ${x - 12} ${y1} A12 12 0 0 0 ${x + 12} ${y1} Q${x + 14} ${(y0 + y1) / 2} ${x + 10} ${y0} Z`} fill={ACID} stroke={ACID_LINE} strokeWidth={2.4} />;
            })}
            {Array.from({length: 8}).map((_, i) => { const life = wrap(t * 1.1 + random(`tz${i}`), 1); return <circle key={i} cx={740 + random(`tx${i}`) * 130} cy={560 - life * 80 - random(`ty${i}`) * 20} r={4 + random(`tr${i}`) * 6} fill="none" stroke="#efffb0" strokeWidth={2.4} opacity={1 - life} />; })}
          </g>
        )}

        {/* a white spot first, then the hole */}
        {hole > 0.01 && depth < 0.16 && <path d={blob(58, 40, 'tsspot', 9, 0.12, 812, 624, -34)} fill="#f4f1e6" stroke="#b9b29c" strokeWidth={3} strokeDasharray="9 7" opacity={clamp01(hole * 12) * (1 - mend * 0.8)} />}
        {tunnel.length > 0 && (
          <g clipPath="url(#tsCrown)">
            {tunnel.map((c, i) => <path key={`o${i}`} d={blob(c.r + 5, c.r + 5, `tsc${i}`, 9, 0.18, c.p[0], c.p[1])} fill="#2c160f" />)}
            {tunnel.map((c, i) => <path key={`f${i}`} d={blob(c.r, c.r, `tsc${i}`, 9, 0.18, c.p[0], c.p[1])} fill="url(#tsHole)" />)}
            {tunnel.filter((_, i) => i % 2 === 0).map((c, i) => <circle key={`s${i}`} cx={c.p[0] - c.r * 0.3} cy={c.p[1] + c.r * 0.2} r={c.r * 0.16} fill="#8a5a36" opacity={0.7} />)}
          </g>
        )}
        {mend > 0.02 && (
          <g opacity={clamp01(mend * 3) * clamp01((1 - mend) * 5 + 0.25)}>
            {[0, 1, 2, 3, 4].map((i) => { const a = i * 1.26 + t * 1.4; const d = 120 * (1 - mend) + 26; return <path key={i} d={star4(812 + Math.cos(a) * d, 620 + Math.sin(a) * d * 0.8, 15)} fill="#ffffff" stroke="#62baf7" strokeWidth={2} />; })}
          </g>
        )}

        {/* spit: a wash over the tooth that thins the acid and brings minerals */}
        {saliva > 0.01 && (
          <g opacity={0.9}>
            <path d={spline(CROWN.slice(3, 12), false, 0.45)} fill="none" stroke="#8fd3ff" strokeWidth={46} strokeLinecap="round" pathLength={1} strokeDasharray={`${saliva.toFixed(3)} 1`} opacity={0.62} />
            <path d={spline(CROWN.slice(3, 12), false, 0.45)} fill="none" stroke="#e6f6ff" strokeWidth={10} strokeLinecap="round" pathLength={1} strokeDasharray={`${saliva.toFixed(3)} 1`} opacity={0.9} transform="translate(0 -12)" />
            {Array.from({length: 7}).map((_, i) => {
              const k = (i + 0.5) / 7;
              if (k > saliva) return null;
              const x = lerp(250, 830, k);
              const y = topY(x) + 60 + wrap(t * 50 + i * 40, 200);
              return <path key={i} d={`M${x} ${y - 18} C${x + 10} ${y - 4} ${x + 9} ${y + 9} ${x} ${y + 9} C${x - 9} ${y + 9} ${x - 10} ${y - 4} ${x} ${y - 18} Z`} fill={WATER} stroke="#2f86c9" strokeWidth={1.8} opacity={0.85} />;
            })}
          </g>
        )}

        {/* the gang */}
        {gang.map(([x, dy, r], i) => {
          const on = clamp01((feast - i * 0.12) * 6);
          if (on <= 0) return null;
          const k = knock(x);
          if (k >= 1) return null;
          return <g key={i} transform={fly(x)} opacity={1 - k * k}><g transform={`translate(${x} ${topY(x) - r * 0.7 + dy}) scale(${on.toFixed(2)}) translate(${-x} ${-(topY(x) - r * 0.7 + dy)})`}><Minion x={x} y={topY(x) - r * 0.7 + dy} r={r} seed={`tsm${i}`} t={t} /></g></g>;
        })}
        {gk < 1 && (
          <g transform={fly(TOOTH.germ[0])} opacity={1 - gk * gk}>
            <g transform={`translate(${TOOTH.germ[0]} ${TOOTH.germ[1] + germ.nod * 6 + Math.sin(t * 3) * 3}) rotate(${germ.lean * 0.8})`}>
              <Scaled s={TOOTH.germK * (1 + feast * 0.12)}>
                <g transform={`scale(${1 + germ.squash * 0.1} ${1 - germ.squash * 0.1})`}>
                  {[[-40, 20, -62, 44], [40, 22, 64, 40], [-8, 44, -14, 66]].map(([x1, y1, x2, y2], i) => <path key={i} d={`M${x1} ${y1} Q${(x1 + x2) / 2 + Math.sin(t * 6 + i) * 6} ${(y1 + y2) / 2 + 8} ${x2} ${y2}`} fill="none" stroke="#3f8a2c" strokeWidth={2.2} strokeLinecap="round" />)}
                  {germ.arms && ([0, 1] as const).map((i) => <Arm key={i} x={i ? 40 : -40} y={12} spec={germ.arms![i]} color={GERM} len={24} />)}
                  <Part d={blob(46, 42, 'tsgerm', 11, 0.1)} fill={GERM} mat="cell" />
                  <g transform="translate(0 -2)"><Face emotion={germ.emotion} talk={germ.talk} blink={germ.blink} look={germ.look} size={0.92} skin={GERM} iris="#2f7d32" /></g>
                </g>
              </Scaled>
            </g>
          </g>
        )}

        {/* the brush: bristles down on the chewing surface, foam behind it */}
        {brush > 0.005 && brush < 0.995 && (
          <g>
            {Array.from({length: 16}).map((_, i) => {
              const x = 250 + i * 38;
              if (x > bx - 40) return null;
              const fade = 1 - clamp01((bx - x - 420) / 300);
              return <circle key={i} cx={x + Math.sin(t * 7 + i) * 4} cy={topY(x) - 14 - random(`tf${i}`) * 26} r={12 + random(`tfr${i}`) * 14} fill="#ffffff" stroke="#bfe3ff" strokeWidth={2} opacity={0.9 * fade} />;
            })}
            <g transform={`translate(${bx.toFixed(1)} ${(topY(Math.max(286, Math.min(794, bx))) - 96 + Math.sin(t * 34) * 7).toFixed(1)}) rotate(-8)`}>
              <path d="M-150 -34 H150 Q176 -34 176 -8 Q176 14 150 14 H-150 Q-176 14 -176 -8 Q-176 -34 -150 -34 Z" fill="#25a89c" stroke="#126e65" strokeWidth={LW} />
              <path d="M150 -30 Q420 -60 760 -260" fill="none" stroke="#126e65" strokeWidth={54 + LW * 2} strokeLinecap="round" />
              <path d="M150 -30 Q420 -60 760 -260" fill="none" stroke="#2ec4b6" strokeWidth={54} strokeLinecap="round" />
              <path d="M190 -44 Q420 -74 700 -234" fill="none" stroke="#9af0e6" strokeWidth={10} strokeLinecap="round" opacity={0.8} />
              {Array.from({length: 11}).map((_, i) => <rect key={i} x={-160 + i * 29} y={12} width={22} height={76} rx={9} fill="#ffffff" stroke="#9fb3c8" strokeWidth={2.2} />)}
              <path d="M-150 16 H150" stroke="#126e65" strokeWidth={3} opacity={0.5} />
              <path d={blob(150, 30, 'tspaste', 10, 0.14, 0, 92)} fill="#8fe3ff" stroke="#3aa9d6" strokeWidth={2.4} opacity={0.95} />
              <path d="M-110 88 Q0 74 110 90" fill="none" stroke="#ff6f9a" strokeWidth={7} strokeLinecap="round" opacity={0.9} />
            </g>
          </g>
        )}

        {/* pain marks */}
        {pain > 0.05 && [[-110, -120, -30], [70, -170, 18], [150, -30, 58]].map(([dx, dy, r], i) => (
          <path key={i} transform={`translate(${760 + dx} ${760 + dy}) rotate(${r}) scale(${1.5 + throb * 0.7})`} d="M0 -34 L10 -8 L26 -12 L8 34 L4 6 L-14 10 Z" fill="#ffd23c" stroke="#b9772a" strokeWidth={3} strokeLinejoin="round" opacity={pain} />
        ))}

        <defs>
          <radialGradient id="tsLight" cx="0.5" cy="-0.05" r="0.7"><stop offset="0" stopColor="#fff3df" stopOpacity={(0.34 + 0.05 * Math.sin(t * 0.9)) * STYLE.glow} /><stop offset="1" stopColor="#fff3df" stopOpacity="0" /></radialGradient>
          <linearGradient id="tsDown" x1="0" y1="0" x2="0" y2="1"><stop offset="0.78" stopColor="#3d1226" stopOpacity="0" /><stop offset="1" stopColor="#3d1226" stopOpacity="0.4" /></linearGradient>
        </defs>
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#tsLight)" opacity={1 - night * 0.7} />
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#tsDown)" />
        {night > 0.01 && <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#1b2a6b" opacity={0.2 * night} style={{mixBlendMode: 'multiply'}} />}
      </Canvas>
      <Tag text={label ?? 'TOOTH'} x={60} y={150} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ the stomach
// The stomach cut open, with the end of the food pipe and the valve between them. The whole organ
// tips over when the person lies down; the acid stays level, so it runs to the valve and up the pipe.
const TUM = {pivot: [560, 1040] as P, face: [668, 930] as P, K: 4.3, pipeFace: [470, 505] as P, pipeK: 2.35, lie: -88};
const ST_OUT: P[] = [[354, 700], [342, 830], [310, 966], [256, 1080], [192, 1150], [110, 1160], [-80, 1170], [-80, 1372], [120, 1380], [212, 1400], [330, 1452], [500, 1470], [682, 1420], [828, 1290], [898, 1100], [900, 900], [850, 740], [732, 640], [610, 622], [586, 650], [586, 700]];
const ST_IN: P[] = [[390, 720], [380, 840], [350, 980], [292, 1108], [214, 1190], [110, 1200], [-80, 1210], [-80, 1332], [120, 1340], [226, 1360], [340, 1410], [500, 1428], [664, 1380], [794, 1262], [856, 1090], [858, 906], [812, 766], [712, 680], [620, 664], [574, 690], [550, 720]];
const JUICE = '#dfe45a';
const JUICE_LINE = '#9aa22c';
STAGE_SPOTS.tummy = {stomach: {x: TUM.face[0], y: TUM.face[1], faceW: 300, headH: 300, size: 600}, foodpipe: {x: TUM.pipeFace[0], y: TUM.pipeFace[1], faceW: 160, headH: 160, size: 330}};
/** The area of a polygon below the horizontal line y (scanlines), and the line that leaves `want` of it below. */
const areaBelow = (poly: P[], y: number, maxY: number) => {
  let a = 0;
  for (let yy = y + 3; yy < maxY; yy += 6) {
    const xs: number[] = [];
    for (let i = 0; i < poly.length; i++) {
      const [x1, y1] = poly[i];
      const [x2, y2] = poly[(i + 1) % poly.length];
      if ((y1 <= yy && y2 > yy) || (y2 <= yy && y1 > yy)) xs.push(x1 + ((yy - y1) / (y2 - y1)) * (x2 - x1));
    }
    xs.sort((p, q) => p - q);
    for (let i = 0; i + 1 < xs.length; i += 2) a += (xs[i + 1] - xs[i]) * 6;
  }
  return a;
};
const levelFor = (poly: P[], frac: number) => {
  const ys = poly.map((p) => p[1]);
  const lo0 = Math.min(...ys);
  const hi0 = Math.max(...ys);
  const want = areaBelow(poly, lo0, hi0) * frac;
  let lo = lo0;
  let hi = hi0;
  for (let i = 0; i < 14; i++) { const mid = (lo + hi) / 2; if (areaBelow(poly, mid, hi0) > want) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
};
const spanAt = (poly: P[], y: number): [number, number] | null => { // the widest stretch of the polygon on the line y
  const xs: number[] = [];
  for (let i = 0; i < poly.length; i++) {
    const [x1, y1] = poly[i];
    const [x2, y2] = poly[(i + 1) % poly.length];
    if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) xs.push(x1 + ((y - y1) / (y2 - y1)) * (x2 - x1));
  }
  xs.sort((p, q) => p - q);
  let best: [number, number] | null = null;
  for (let i = 0; i + 1 < xs.length; i += 2) if (!best || xs[i + 1] - xs[i] > best[1] - best[0]) best = [xs[i], xs[i + 1]];
  return best;
};

/**
 * The room a stage face needs around it, in screen pixels from its centre. Nothing of the stage's
 * contents (the juice's surface, food, bubbles) may come inside it (owner, 2026-11-17, on the
 * stomach with juice at its mouth, food beside its eyes and bubbles on its brow: "too much cluttered").
 */
export const FACE_ROOM = {side: 215, up: 205, down: 190, hands: 125};
/** The same for the food pipe's small face on the stomach stage. */
export const PIPE_ROOM = {side: 104, up: 100, down: 96};
const BITS: {col: string; line: string; r: number}[] = [{col: '#d9a05b', line: '#8f6230', r: 30}, {col: '#7ac96b', line: '#3f8a3a', r: 24}, {col: '#e2574c', line: '#96302a', r: 23}, {col: '#ffd166', line: '#b98a1e', r: 21}, {col: '#7a4a32', line: '#4a2a1a', r: 26}];
const GUM = {r: 40, col: '#ff8fc4', line: '#c2578e'};
// pairs of wall points across the lower stomach (upper wall, lower wall, strength), from the exit inward: a hunger squeeze travels along them
const SQUEEZE: [number, number, number][] = [[5, 8, 1], [4, 9, 1], [3, 10, 0.9], [2, 11, 0.5]];
const insidePoly = (poly: P[], [x, y]: P) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, yi] = poly[i]; const [xj, yj] = poly[j]; if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c; } return c; };
/** Where everything in the stomach is for a state: how the organ lies, its wall, the juice's level, each piece of food, the gum, each bubble of air, the faces. */
export const tummyLayout = (state: Record<string, number> = {}, t = 0) => {
  const st = (k: string) => clamp01(state[k] ?? 0);
  const [food, full, air, gum, pass, squeeze, burp] = [st('food'), st('full'), st('air'), st('gum'), st('pass'), st('squeeze'), st('burp')];
  const tilt = io(st('tilt'));
  // the organ tips over about its middle and slides right, so the pipe stays in the picture
  const deg = TUM.lie * tilt;
  const th = (deg * Math.PI) / 180;
  const shift: P = [220 * tilt, 50 * tilt];
  const toWorld = ([x, y]: P): P => {
    const dx = x - TUM.pivot[0];
    const dy = y - TUM.pivot[1];
    return [TUM.pivot[0] + shift[0] + dx * Math.cos(th) - dy * Math.sin(th), TUM.pivot[1] + shift[1] + dx * Math.sin(th) + dy * Math.cos(th)];
  };
  const meAt = toWorld(TUM.face);
  const pipeAt = toWorld(TUM.pipeFace);
  // a hunger squeeze: a ring of muscle tightens and travels along the lower stomach toward the exit
  const beat = wrap(t * 0.55, 1);
  const ring = 3.7 - beat * 5.2;
  const pinch = SQUEEZE.map(([, , k], j) => squeeze * k * 40 * Math.exp(-((j - ring) ** 2) / 0.7));
  const bend = (pts: P[]): P[] => {
    if (squeeze <= 0) return pts;
    const out = pts.map((q) => [q[0], q[1]] as P);
    SQUEEZE.forEach(([a, b], j) => {
      const d = Math.hypot(ST_IN[b][0] - ST_IN[a][0], ST_IN[b][1] - ST_IN[a][1]);
      const [ux, uy] = [(ST_IN[b][0] - ST_IN[a][0]) / d, (ST_IN[b][1] - ST_IN[a][1]) / d];
      out[a] = [pts[a][0] + ux * pinch[j], pts[a][1] + uy * pinch[j]];
      out[b] = [pts[b][0] - ux * pinch[j], pts[b][1] - uy * pinch[j]];
    });
    return out;
  };
  const inPts = bend(ST_IN);
  const outPts = bend(ST_OUT);
  const polyW = inPts.map(toWorld);
  const maxY = Math.max(...polyW.map((q) => q[1]));
  // the juice keeps its level whatever way the stomach lies, and never rises into the face's room
  const level = Math.min(maxY - 40, Math.max(levelFor(polyW, 0.08 + full * 0.52), meAt[1] + FACE_ROOM.down + 42));
  const span = spanAt(polyW, level + 26) ?? [300, 800];
  const slosh = 1 + squeeze * 1.2 * (1 - full); // an empty stomach sloshes more
  const wave = (x: number, k = 1) => level + Math.sin(x * 0.02 + t * 2.4) * 7 * k * slosh + Math.sin(x * 0.047 - t * 1.7) * 4 * k * slosh;
  // the food floats on the surface, under the face's room, but not where the hands hang
  const keep: [number, number] = [meAt[0] - FACE_ROOM.hands, meAt[0] + FACE_ROOM.hands];
  const clearOf = ([a, b]: [number, number], pad: number): [number, number][] => ([[a + pad, Math.min(keep[0], b - pad)], [Math.max(keep[1], a + pad), b - pad]] as [number, number][]).filter(([x0, x1]) => x1 - x0 > 8);
  const along = (segs: [number, number][], u: number) => { const total = segs.reduce((n, [x0, x1]) => n + x1 - x0, 0); let d = u * total; for (const [x0, x1] of segs) { if (d <= x1 - x0) return x0 + d; d -= x1 - x0; } return null; };
  const cardia = toWorld([470, 716]);
  // only where it is seen: at a low level the surface runs on into the exit, out of the picture (a piece there was cut in half by the frame's edge)
  const floats = clearOf([Math.max(span[0], 26), Math.min(span[1], W - 26)], 30);
  // a story with gum keeps a place for it beside the hands, where it is seen; the food floats to its left, so nothing jumps when it lands
  const gumX = state.gum !== undefined ? Math.max(span[0] + 60, keep[0] - 150) : null;
  const foodFloats = gumX === null ? floats : floats.map(([a, b]) => (a < gumX ? [a, Math.min(b, gumX - GUM.r - 46)] : [a, b]) as [number, number]).filter(([a, b]) => b - a > 8);
  const slotX = (n: number) => along(foodFloats, (n + 0.5) / BITS.length);
  const inRoom = (x: number, y: number, r: number) => Math.abs(x - meAt[0]) < FACE_ROOM.side + r && y > meAt[1] - FACE_ROOM.up - r && y < meAt[1] + FACE_ROOM.down + r;
  // `pass`: what is in the stomach moves on through the exit at the lower left, passing below the hands
  const exit: P[] = [toWorld([250, 1292]), toWorld([70, 1274]), toWorld([-230, 1270])];
  const leave = (rest: P, u: number): P => {
    if (u <= 0) return rest;
    const dip = Math.min(maxY - 36, meAt[1] + FACE_ROOM.down + 110);
    const pts: P[] = [rest, ...(rest[0] > keep[0] && rest[1] < dip ? [[meAt[0], dip] as P] : []), ...exit];
    return onPath(pts, io(u));
  };
  // How many pieces there are depends on where the food dial RESTS (`food:to` from the director, or its
  // value when nothing is changing): a piece is there or it is not. While the dial moves, the new pieces
  // fall in one after another and land when the change ends; a piece never hangs in mid-fall.
  const fFrom = clamp01(state['food:from'] ?? state.food ?? 0);
  const fTo = clamp01(state['food:to'] ?? state.food ?? 0);
  const has = (v: number, i: number) => v >= i * 0.16 + 0.15;
  const prog = Math.abs(fTo - fFrom) < 1e-6 ? 1 : clamp01((food - fFrom) / (fTo - fFrom));
  const nFresh = BITS.filter((_, i) => has(fTo, i) && !has(fFrom, i)).length;
  let fresh = 0;
  const bits = BITS.map((b, i) => {
    const [was, will] = [has(fFrom, i), has(fTo, i)];
    const x = slotX(i);
    if ((!was && !will) || x === null) return null;
    const on = !was && will ? clamp01(prog * (1 + 0.5 * (nFresh - 1)) - fresh++ * 0.5) : 1;
    const size = was && !will ? 1 - prog : 1; // the food is going (a rewind): it shrinks away where it floats
    if (on <= 0 || size <= 0.03) return null;
    const r = b.r * size;
    const rest: P = [x, wave(x) + r * 0.2 + Math.sin(t * 2 + i) * 5];
    const from: P = [cardia[0], cardia[1] - 140];
    const [x1, y1] = on >= 1 ? leave(rest, clamp01(pass * 1.7 - i * 0.14)) : [lerp(from[0], rest[0], on), lerp(from[1], rest[1], on * on)];
    // on its way down a piece may cross the face's room (the stomach lying on its side): it is not drawn there
    const hid = Math.abs(x1 - meAt[0]) < FACE_ROOM.side + r && y1 > meAt[1] - FACE_ROOM.up - r && y1 < meAt[1] + FACE_ROOM.down + r * 0.74;
    return hid || x1 < -r - 20 ? null : {...b, r, i, on, x: x1, y: y1, settled: on >= 1};
  }).filter((b): b is NonNullable<typeof b> => !!b);
  // swallowed gum: it comes down along the wall, floats with the food, and leaves through the exit like everything else
  const gumAt = (() => {
    const x = gumX;
    if (gum <= 0 || x === null) return null;
    const rest: P = [x, wave(x) + GUM.r * 0.25 + Math.sin(t * 1.7) * 4];
    const [p0, p1] = [toWorld([430, 752]), toWorld([398, 940])]; // down between the wall and the face's room
    const u = gum;
    const [gx, gy] = u >= 1 ? leave(rest, clamp01((pass - 0.06) / 0.94)) : [(1 - u) ** 2 * p0[0] + 2 * u * (1 - u) * p1[0] + u * u * rest[0], (1 - u) ** 2 * p0[1] + 2 * u * (1 - u) * p1[1] + u * u * rest[1]];
    const r = GUM.r * (0.58 + 0.42 * clamp01((u - 0.8) / 0.2)); // seen from the side as it falls, whole once it lands
    return inRoom(gx, gy, r) || gx < -r - 20 ? null : {x: gx, y: gy, r, settled: u >= 1};
  })();
  // swallowed air: big bubbles rising through the juice (the hollow above it belongs to the face)
  const bubbles = Array.from({length: 8}).map((_, i) => {
    const size = clamp01((air - i * 0.06) / 0.3);
    if (size <= 0) return null;
    const r = (16 + random(`tar${i}`) * 20) * (0.6 + 0.4 * air) * size;
    const life = wrap(t * (0.16 + random(`tas${i}`) * 0.1) + random(`tal${i}`), 1);
    const y = lerp(maxY - r - 14, level + r + 10, life);
    const sp = spanAt(polyW, y);
    if (!sp || sp[1] - sp[0] < r * 2 + 40) return null;
    const x = lerp(sp[0] + r + 16, sp[1] - r - 16, random(`tax${i}`)) + Math.sin(t * 0.9 + i) * 6;
    return {i, x, y, r, fade: Math.min(1, life / 0.12, (1 - life) / 0.12)};
  }).filter((b): b is NonNullable<typeof b> => !!b);
  // a burp: the air leaves up the food pipe, three bubbles one after another. Behind the pipe's face they are not drawn.
  const burps = [0, 1, 2].map((i) => {
    const u = clamp01(burp * 1.5 - i * 0.22);
    if (u <= 0 || u >= 1) return null;
    const r = 46 - i * 8;
    const o: P = [470 + Math.sin(u * 9 + i * 2) * 20, lerp(648, -220, u)]; // it starts just above the valve, clear of the stomach's face
    const [x, y] = toWorld(o);
    const gap = Math.max(Math.abs(x - pipeAt[0]) - PIPE_ROOM.side - r, y < pipeAt[1] ? pipeAt[1] - PIPE_ROOM.up - r - y : y - pipeAt[1] - PIPE_ROOM.down - r);
    return gap <= 0 ? null : {i, x, y, r, ox: o[0], oy: o[1], fade: Math.min(1, gap / 36, u / 0.06)};
  }).filter((b): b is NonNullable<typeof b> => !!b);
  return {food, full, air, gum, pass, squeeze, burp, beat, tilt, deg, shift, toWorld, meAt, pipeAt, inPts, outPts, polyW, maxY, level, span, wave, bits, gumAt, bubbles, burps, cardia};
};
/** For the staging check: the boxes of a stage's faces and of the loose things on it, for a state. null = this stage is not measured yet. */
export const stageThings = (set: string, state: Record<string, number> = {}, t = 0): {faces: {who: string; x0: number; y0: number; x1: number; y1: number; dry?: boolean}[]; things: {id: string; only?: string; x0: number; y0: number; x1: number; y1: number}[]; surface?: number} | null => {
  if (set === 'molar') return arenaThings(state, t);
  if (set === 'arm') return armThings(state, t);
  if (set === 'macro') return macroThings(state);
  if (set !== 'tummy') return null;
  const T = tummyLayout(state, t);
  const face = {who: 'stomach', x0: T.meAt[0] - FACE_ROOM.side, y0: T.meAt[1] - FACE_ROOM.up, x1: T.meAt[0] + FACE_ROOM.side, y1: T.meAt[1] + FACE_ROOM.down};
  const pipe = {who: 'foodpipe', dry: true, x0: T.pipeAt[0] - PIPE_ROOM.side, y0: T.pipeAt[1] - PIPE_ROOM.up, x1: T.pipeAt[0] + PIPE_ROOM.side, y1: T.pipeAt[1] + PIPE_ROOM.down};
  // what floats in the juice is drawn only inside the stomach: a piece still above the valve is not in the picture
  const seen = (x: number, y: number) => insidePoly(T.polyW, [x, y]);
  return {
    faces: [face, pipe],
    things: [
      ...T.bits.filter((b) => seen(b.x, b.y)).map((b) => ({id: `food ${b.i + 1}`, x0: b.x - b.r, y0: b.y - b.r * 0.74, x1: b.x + b.r, y1: b.y + b.r * 0.74})),
      ...T.bubbles.map((b) => ({id: `air bubble ${b.i + 1}`, x0: b.x - b.r, y0: b.y - b.r, x1: b.x + b.r, y1: b.y + b.r})),
      ...(T.gumAt && seen(T.gumAt.x, T.gumAt.y) ? [{id: 'the gum', x0: T.gumAt.x - T.gumAt.r, y0: T.gumAt.y - T.gumAt.r * 0.8, x1: T.gumAt.x + T.gumAt.r, y1: T.gumAt.y + T.gumAt.r * 0.8}] : []),
      ...T.burps.map((b) => ({id: `burp bubble ${b.i + 1}`, x0: b.x - b.r, y0: b.y - b.r, x1: b.x + b.r, y1: b.y + b.r})),
    ],
    surface: T.level,
  };
};

/** The stomach: dinner drops in, it fills, the person lies down, the valve gives, acid climbs the food pipe. */
export const TummyStage: React.FC<SetProps> = ({t, state = {}, faces = {}, label}) => {
  const st = (k: string) => clamp01(state[k] ?? 0);
  const food = st('food');
  const full = st('full');
  const tilt = io(st('tilt'));
  const valve = st('valve');
  const leak = st('leak');
  const burn = st('burn');
  const air = st('air');
  const squeeze = st('squeeze');
  const me = faces.stomach ?? REST;
  const pipe = faces.foodpipe ?? REST;
  const uid = useId().replace(/:/g, '');
  const throb = burn * (0.6 + 0.4 * Math.sin(t * 9));

  const T = tummyLayout(state, t);
  const {deg, shift, polyW, maxY, level, span, wave, meAt, pipeAt} = T;
  const organT = `translate(${shift[0].toFixed(1)} ${shift[1].toFixed(1)}) rotate(${deg.toFixed(2)} ${TUM.pivot[0]} ${TUM.pivot[1]})`;
  const inner = spline(T.inPts, true, 0.42);
  const outer = spline(T.outPts, true, 0.42);
  const swell = 1 + full * 0.035 + air * (0.085 + Math.sin(t * 2.6) * 0.008) + Math.sin(t * 1.6) * 0.004; // a full stomach is stretched, swallowed air bloats it; it also churns a little
  const surface = Array.from({length: 30}, (_, i) => { const x = -200 + i * 52; return `${i ? 'L' : 'M'}${x} ${wave(x).toFixed(1)}`; }).join(' ');

  // ---- the valve: two lips of muscle; `valve` opens them
  const gap = lerp(6, 104, valve);
  const lipW = (160 - gap) / 2;
  const front = 716 - leak * 600; // how far up the pipe the acid has come (organ coordinates)

  return (
    <AbsoluteFill style={{background: '#532038'}}>
      <Canvas>
        <defs>
          <radialGradient id="tmBack" cx="0.5" cy="0.35" r="0.9"><stop offset="0" stopColor="#7b3350" /><stop offset="0.6" stopColor="#5a2540" /><stop offset="1" stopColor="#3b1529" /></radialGradient>
          <linearGradient id="tmWall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ff9aa6" /><stop offset="1" stopColor="#e86f82" /></linearGradient>
          <linearGradient id="tmIn" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffd3cb" /><stop offset="1" stopColor="#f6a39f" /></linearGradient>
          <linearGradient id="tmJuice" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#eef07a" /><stop offset="1" stopColor="#c7cf3c" /></linearGradient>
          <linearGradient id="tmPipeIn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ef9c9b" /><stop offset="0.5" stopColor="#fbc4b8" /><stop offset="1" stopColor="#ef9c9b" /></linearGradient>
          <radialGradient id="tmSore"><stop offset="0" stopColor="#e2283c" stopOpacity="0.9" /><stop offset="1" stopColor="#e2283c" stopOpacity="0" /></radialGradient>
          <clipPath id={`tmIn${uid}`}><path d={inner} transform={organT} /></clipPath>
          <clipPath id="tmLumen"><rect x={390} y={-900} width={160} height={1640} /></clipPath>
        </defs>

        {/* the belly around it: dark and quiet */}
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#tmBack)" />
        {[[80, 520, 320, 260], [1040, 1620, 360, 300], [120, 1700, 340, 240], [1010, 420, 260, 300]].map(([x, y, rx, ry], i) => <path key={i} d={blob(rx, ry, `tmb${i}`, 10, 0.1, x, y)} fill={i % 2 ? '#6c2c48' : '#4a1b33'} opacity={0.7} />)}

        <g transform={organT}>
          {/* the food pipe: muscle, lining, the hollow */}
          <rect x={354} y={-900} width={232} height={1640} fill="#b9495f" stroke={FLESH} strokeWidth={LW} />
          {Array.from({length: 14}).map((_, i) => <path key={i} d={taperedPath([[360, -860 + i * 116], [366, -800 + i * 116], [360, -740 + i * 116]], 7)} fill="#9c3850" opacity={0.7} />)}
          {Array.from({length: 14}).map((_, i) => <path key={`r${i}`} d={taperedPath([[580, -800 + i * 116], [574, -740 + i * 116], [580, -680 + i * 116]], 7)} fill="#9c3850" opacity={0.7} />)}
          <rect x={372} y={-900} width={196} height={1640} fill="#e88f93" />
          <rect x={390} y={-900} width={160} height={1640} fill="url(#tmPipeIn)" />
          {Array.from({length: 9}).map((_, i) => <path key={`g${i}`} d={`M390 ${-820 + i * 180} Q470 ${-790 + i * 180} 550 ${-820 + i * 180}`} fill="none" stroke="#e88f93" strokeWidth={12} strokeLinecap="round" opacity={0.55} />)}
          <path d="M390 -900 V720 M550 -900 V720" fill="none" stroke={FLESH} strokeWidth={LW} />

          {/* the stomach wall and the hollow inside */}
          <g transform={`translate(${TUM.pivot[0]} ${TUM.pivot[1]}) scale(${swell.toFixed(4)}) translate(${-TUM.pivot[0]} ${-TUM.pivot[1]})`}>
            <path d={outer} fill="url(#tmWall)" stroke={FLESH} strokeWidth={LW} />
            <path d={spline(T.outPts.slice(9, 18), false, 0.42)} fill="none" stroke="#ffc2c8" strokeWidth={10} strokeLinecap="round" opacity={0.55} transform="translate(-14 -12)" />
            <path d={inner} fill="url(#tmIn)" stroke="#c9566a" strokeWidth={2.6} />
            {[[430, 800, 520, 960, 470, 1130], [560, 760, 640, 1120, 520, 1290], [700, 800, 790, 1060, 660, 1300], [340, 1090, 420, 1240, 330, 1330], [150, 1230, 60, 1270, -40, 1262]].map(([x1, y1, x2, y2, x3, y3], i) => (
              <g key={i}>
                <path d={taperedPath([[x1 + 9, y1 + 8], [x2 + 9, y2 + 8], [x3 + 9, y3 + 8]], 13)} fill="#ffe2dc" opacity={0.6} />
                <path d={taperedPath([[x1, y1], [x2, y2], [x3, y3]], 15)} fill="#ee8f95" opacity={0.85} />
              </g>
            ))}
          </g>

          {/* acid that has come up the pipe */}
          {leak > 0.01 && (
            <g clipPath="url(#tmLumen)">
              <path d={`M390 730 V${front + 30} Q${430} ${front - 26 + Math.sin(t * 6) * 8} 470 ${front + 4} Q510 ${front - 22 + Math.cos(t * 5) * 8} 550 ${front + 26} V730 Z`} fill="url(#tmJuice)" stroke={JUICE_LINE} strokeWidth={LW} opacity={0.93} />
              {Array.from({length: 8}).map((_, i) => { const y = 716 - wrap(random(`tl${i}`) * 600 + t * 70, Math.max(40, 716 - front)); return <circle key={i} cx={410 + random(`tlx${i}`) * 120} cy={y} r={5 + random(`tlr${i}`) * 7} fill="none" stroke="#fbffc4" strokeWidth={2.4} opacity={0.8} />; })}
              {burn > 0.02 && <rect x={390} y={front - 120} width={160} height={716 - front + 120} fill="#e2283c" opacity={0.22 * burn + 0.08 * throb} />}
            </g>
          )}

          {/* a burp: air going up the pipe (not drawn behind the pipe's face) */}
          {T.burps.length > 0 && (
            <g clipPath="url(#tmLumen)">
              {T.burps.map((b) => (
                <g key={`bp${b.i}`} opacity={b.fade}>
                  <circle cx={b.ox} cy={b.oy} r={b.r} fill="#ffffff" opacity={0.42} />
                  <circle cx={b.ox} cy={b.oy} r={b.r} fill="none" stroke="#ffffff" strokeWidth={3.6} opacity={0.95} />
                  <path d={`M${(b.ox - b.r * 0.5).toFixed(1)} ${(b.oy - b.r * 0.2).toFixed(1)} Q${(b.ox - b.r * 0.4).toFixed(1)} ${(b.oy - b.r * 0.62).toFixed(1)} ${b.ox.toFixed(1)} ${(b.oy - b.r * 0.66).toFixed(1)}`} fill="none" stroke="#ffffff" strokeWidth={3.4} strokeLinecap="round" opacity={0.9} />
                </g>
              ))}
            </g>
          )}

          {/* the valve: a ring of muscle between the pipe and the stomach */}
          <g>
            <path d={`M390 668 C${390 + lipW * 0.5} 672 ${390 + lipW} 694 ${390 + lipW} 716 C${390 + lipW} 742 ${390 + lipW * 0.5} 760 390 764 Z`} fill="#d9566e" stroke={FLESH} strokeWidth={LW} />
            <path d={`M550 668 C${550 - lipW * 0.5} 672 ${550 - lipW} 694 ${550 - lipW} 716 C${550 - lipW} 742 ${550 - lipW * 0.5} 760 550 764 Z`} fill="#d9566e" stroke={FLESH} strokeWidth={LW} />
            <path d={`M398 690 Q${390 + lipW * 0.6} 694 ${390 + lipW * 0.8} 712`} fill="none" stroke="#ffb3bd" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
            <path d={`M542 690 Q${550 - lipW * 0.6} 694 ${550 - lipW * 0.8} 712`} fill="none" stroke="#ffb3bd" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
          </g>
        </g>

        {/* the juice and the dinner in it: always level with the ground */}
        <g clipPath={`url(#tmIn${uid})`}>
          <path d={`${surface} L${W + 400} ${maxY + 200} L-300 ${maxY + 200} Z`} fill="url(#tmJuice)" opacity={0.9} />
          <path d={surface} fill="none" stroke="#fbffc4" strokeWidth={9} strokeLinecap="round" opacity={0.85} />
          <path d={surface} fill="none" stroke={JUICE_LINE} strokeWidth={2.6} />
          {Array.from({length: 12}).map((_, i) => {
            const life = wrap(t * 0.5 + random(`tj${i}`), 1);
            const x = span[0] + random(`tjx${i}`) * (span[1] - span[0]);
            return <circle key={i} cx={x} cy={maxY - life * (maxY - level)} r={5 + random(`tjr${i}`) * 9} fill="none" stroke="#fbffc4" strokeWidth={2.6} opacity={0.75 * (1 - life)} />;
          })}
          {/* swallowed air: big bubbles rising through the juice, below the face */}
          {T.bubbles.map((b) => (
            <g key={`air${b.i}`} opacity={b.fade}>
              <circle cx={b.x} cy={b.y} r={b.r} fill="#ffffff" opacity={0.4} />
              <circle cx={b.x} cy={b.y} r={b.r} fill="none" stroke="#ffffff" strokeWidth={3.6} opacity={0.95} />
              <path d={`M${(b.x - b.r * 0.5).toFixed(1)} ${(b.y - b.r * 0.2).toFixed(1)} Q${(b.x - b.r * 0.4).toFixed(1)} ${(b.y - b.r * 0.62).toFixed(1)} ${b.x.toFixed(1)} ${(b.y - b.r * 0.66).toFixed(1)}`} fill="none" stroke="#ffffff" strokeWidth={3.4} strokeLinecap="round" opacity={0.9} />
            </g>
          ))}
          {/* the food: it floats on the juice to the sides of the face, never in front of it */}
          {T.bits.map((b) => (
            <g key={b.i} transform={`translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) rotate(${(b.i * 51 + t * 14 * (b.i % 2 ? 1 : -1)).toFixed(0)})`}>
              <path d={blob(b.r, b.r * 0.74, `tbit${b.i}`, 8, 0.16)} fill={b.col} stroke={b.line} strokeWidth={LW} />
              <path d={`M${-b.r * 0.5} ${-b.r * 0.22} Q0 ${-b.r * 0.5} ${b.r * 0.4} ${-b.r * 0.2}`} fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" opacity={0.55} />
            </g>
          ))}
          {/* swallowed gum: a chewed pink wad with tooth dents, whole */}
          {T.gumAt && (
            <g transform={`translate(${T.gumAt.x.toFixed(1)} ${T.gumAt.y.toFixed(1)}) rotate(${(Math.sin(t * 1.3) * 9 - 12).toFixed(1)}) scale(${(T.gumAt.r / GUM.r).toFixed(3)})`}>
              <path d={blob(GUM.r, GUM.r * 0.8, 'tgum', 9, 0.2)} fill={GUM.col} stroke={GUM.line} strokeWidth={LW} />
              <path d={blob(GUM.r * 0.62, GUM.r * 0.46, 'tgum2', 8, 0.16, 6, 8)} fill="#f571ad" opacity={0.55} />
              <path d={`M${-GUM.r * 0.3} ${GUM.r * 0.1} q9 9 18 0 M${GUM.r * 0.12} ${GUM.r * 0.28} q8 8 16 0 M${-GUM.r * 0.02} ${-GUM.r * 0.12} q8 7 16 0`} fill="none" stroke={GUM.line} strokeWidth={3} strokeLinecap="round" opacity={0.7} />
              <path d={`M${-GUM.r * 0.6} ${-GUM.r * 0.2} Q${-GUM.r * 0.36} ${-GUM.r * 0.62} ${GUM.r * 0.14} ${-GUM.r * 0.56}`} fill="none" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.8} />
            </g>
          )}
        </g>

        {/* the burn where acid touches the food pipe */}
        {burn > 0.03 && <ellipse cx={pipeAt[0]} cy={pipeAt[1]} rx={190 * (1 + throb * 0.08)} ry={150 * (1 + throb * 0.08)} fill="url(#tmSore)" opacity={0.6 * burn} />}

        {/* the two faces stay upright while their organ tips */}
        <g transform={`translate(${pipeAt[0].toFixed(1)} ${(pipeAt[1] + pipe.nod * 6).toFixed(1)}) rotate(${pipe.lean * 0.6})`}>
          <Scaled s={TUM.pipeK}>
            <g transform={`scale(${1 + pipe.squash * 0.1} ${1 - pipe.squash * 0.1})`}>
              {pipe.arms && ([0, 1] as const).map((i) => <Arm key={i} x={i ? 26 : -26} y={24} spec={pipe.arms![i]} color="#f29ba1" len={20} />)}
              <Face emotion={pipe.emotion} talk={pipe.talk} blink={pipe.blink} look={pipe.look} size={1.02} skin="#f8b9b1" iris="#b23a5a" />
            </g>
          </Scaled>
        </g>
        <g transform={`translate(${meAt[0].toFixed(1)} ${(meAt[1] + me.nod * 12).toFixed(1)}) rotate(${me.lean * 0.6})`}>
          <Scaled s={TUM.K}>
            <g transform={`scale(${1 + me.squash * 0.1} ${1 - me.squash * 0.1})`}>
              {me.arms && ([0, 1] as const).map((i) => <Arm key={i} x={i ? 30 : -30} y={28} spec={me.arms![i]} color="#ff8f9c" len={22} />)}
              <Face emotion={me.emotion} talk={me.talk} blink={me.blink} look={me.look} size={1.06} skin="#ffc1bb" iris="#a8324d" />
            </g>
          </Scaled>
        </g>

        {/* pain marks by the food pipe's face */}
        {burn > 0.05 && [[-120, -130, -30], [110, -150, 20], [170, 10, 60]].map(([dx, dy, r], i) => (
          <path key={i} transform={`translate(${pipeAt[0] + dx} ${pipeAt[1] + dy}) rotate(${r}) scale(${1.4 + throb * 0.7})`} d="M0 -34 L10 -8 L26 -12 L8 34 L4 6 L-14 10 Z" fill="#ffd23c" stroke="#b9772a" strokeWidth={3} strokeLinejoin="round" opacity={burn} />
        ))}

        {/* bloated: the wall strains, like a balloon (drawn outside the stomach, away from the face) */}
        {air > 0.25 && [[930, 1010, -62], [958, 1150, -84], [900, 1300, -118], [150, 1100, 196], [250, 1010, 214]].map(([x, y, r], i) => {
          const [wx, wy] = T.toWorld([x, y]);
          const k = clamp01((air - 0.25) / 0.4) * (0.8 + 0.2 * Math.sin(t * 5 + i));
          return <path key={`st${i}`} transform={`translate(${wx.toFixed(1)} ${wy.toFixed(1)}) rotate(${r + deg})`} d="M-26 0 Q0 -14 26 0" fill="none" stroke="#ffd9de" strokeWidth={7} strokeLinecap="round" opacity={0.85 * k} />;
        })}

        {/* a growl: sound rings leaving the wall as each squeeze passes (drawn outside the stomach, away from the faces) */}
        {squeeze > 0.05 && [[196, 1096, 205], [920, 1230, -18]].map(([x, y, a], s) => {
          const [wx, wy] = T.toWorld([x, y]);
          return [0, 1, 2].map((i) => {
            const k = wrap(T.beat + s * 0.5 - i * 0.16, 1);
            const r = 54 + i * 40 + k * 40;
            return <path key={`rg${s}${i}`} transform={`translate(${wx.toFixed(1)} ${wy.toFixed(1)}) rotate(${a + deg})`} d={`M${(Math.cos(-0.6) * r).toFixed(1)} ${(Math.sin(-0.6) * r).toFixed(1)} A${r.toFixed(1)} ${r.toFixed(1)} 0 0 1 ${(Math.cos(0.6) * r).toFixed(1)} ${(Math.sin(0.6) * r).toFixed(1)}`} fill="none" stroke="#ffe9a8" strokeWidth={12 - i * 2} strokeLinecap="round" opacity={squeeze * Math.sin(Math.PI * k) * (1 - i * 0.15)} />;
          });
        })}

        {/* what the person is doing: a small sign that tips over with the stomach. Only in a story about lying down. */}
        {state.tilt !== undefined && <g transform="translate(910 330)">
          <circle r={104} fill="#1d2b4f" opacity={0.3} transform="translate(5 8)" />
          <circle r={104} fill="#fff8ec" stroke="#2ec4b6" strokeWidth={7} />
          <path d="M-74 66 H74" stroke="#b9ae97" strokeWidth={7} strokeLinecap="round" />
          <g transform={`rotate(${(deg * 0.98).toFixed(1)} 0 48)`}>
            <circle cx={0} cy={-52} r={20} fill="#1d2b4f" />
            <path d="M0 -26 V22 M0 -12 L-20 10 M0 -12 L20 10 M0 22 L-14 60 M0 22 L14 60" fill="none" stroke="#1d2b4f" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>}

        <defs>
          <radialGradient id="tmLight" cx="0.5" cy="-0.05" r="0.7"><stop offset="0" stopColor="#fff3df" stopOpacity={(0.32 + 0.05 * Math.sin(t * 0.9)) * STYLE.glow} /><stop offset="1" stopColor="#fff3df" stopOpacity="0" /></radialGradient>
          <linearGradient id="tmDown" x1="0" y1="0" x2="0" y2="1"><stop offset="0.78" stopColor="#3d1226" stopOpacity="0" /><stop offset="1" stopColor="#3d1226" stopOpacity="0.42" /></linearGradient>
        </defs>
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#tmLight)" />
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#tmDown)" />
      </Canvas>
      <Tag text={label ?? 'STOMACH'} x={60} y={150} />
    </AbsoluteFill>
  );
};

/** How big each stage character's arms are on screen (pixels per arm unit, arm length in units): the motion check measures their hands with it. */
export const STAGE_ARMS: Record<string, Record<string, {k: number; len: number}>> = {
  foodpipe: {foodpipe: {k: 6.2, len: 22}, pill: {k: 3.25, len: 30}},
  tooth: {tooth: {k: 4.5, len: 22}, bacteria: {k: 2.25, len: 24}},
  tummy: {stomach: {k: 4.3, len: 22}, foodpipe: {k: 2.35, len: 20}},
  molar: ARENA_ARMS,
};
STAGE_SPOTS.molar = ARENA_SPOTS;
STAGE_SPOTS.arm = ARM_SPOTS;
STAGE_SPOTS.macro = MACRO_SPOTS;

// ------------------------------------------------------------------ where the stage's characters are, for a state
/**
 * A stage's own characters move with its state (the pill falls and rides away, the stomach tips, the
 * germ is brushed off). This gives each one's spot for a state, or null when it is not in the picture.
 * The staging check uses it so that no graphic is put over a face.
 */
export const stageSpotsAt = (set: string, state: Record<string, number> = {}): Record<string, {x: number; y: number; faceW: number; headH: number; size: number} | null> => {
  const st = (k: string) => clamp01(state[k] ?? 0);
  const base = STAGE_SPOTS[set] ?? {};
  if (set === 'foodpipe') {
    const drop = st('drop');
    const fall = drop < 1 ? 1 - (1 - drop) ** 2 : 1;
    const ride = io(st('slide'));
    const px = lerp(lerp(650, PIPE.pill[0], fall), 560, ride);
    const py = lerp(lerp(-420, PIPE.pill[1], fall), 2380, ride);
    const gone = (st('melt') > 0.97 && st('slide') === 0) || py > H + 40 || py < -60;
    return {foodpipe: base.foodpipe, pill: gone ? null : {...base.pill, x: px + 58 * (1 - ride), y: py + 70}};
  }
  if (set === 'tooth') return {tooth: base.tooth, bacteria: st('brush') > 0.55 ? null : base.bacteria};
  if (set === 'molar') return arenaSpotsAt(state);
  if (set === 'arm') return armSpotsAt(state);
  if (set === 'macro') return macroSpotsAt(state);
  if (set === 'tummy') {
    const k = io(st('tilt'));
    const th = (TUM.lie * k * Math.PI) / 180;
    const at = ([x, y]: P): P => [TUM.pivot[0] + 220 * k + (x - TUM.pivot[0]) * Math.cos(th) - (y - TUM.pivot[1]) * Math.sin(th), TUM.pivot[1] + 50 * k + (x - TUM.pivot[0]) * Math.sin(th) + (y - TUM.pivot[1]) * Math.cos(th)];
    const [sx, sy] = at(TUM.face);
    const [fx, fy] = at(TUM.pipeFace);
    return {stomach: {...base.stomach, x: sx, y: sy}, foodpipe: {...base.foodpipe, x: fx, y: fy}};
  }
  return base;
};
void shade;
void lift;
