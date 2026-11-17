/**
 * MedPeak Toons - THE ARM (set `arm`): a hand and forearm, cut open above the wrist, with one nerve
 * running from a small scratch on the back of the hand up to the top of the picture, where a sign
 * says TO THE BRAIN. Made for "What Happens If You Get Rabies" (clock shape: a race).
 *
 * What it shows is only what the sources say: dog bites and scratches carry the virus in saliva
 * (WHO); the virus must travel to the brain before it causes symptoms (CDC); that usually takes two
 * to three months, sometimes a week (WHO); a vaccine course in time stops it before it reaches the
 * central nervous system (WHO). Drawn in the clean 2D look: flat colour, dot eyes, no arms or legs on
 * body characters, no glow.
 *
 * Everything is placed by ONE layout (`armLayout`), so the staging check can measure it.
 */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Canvas, H, W} from './camera';
import {blob, type P, Scaled, spline} from './ink';
import {type ArmSpec, type Emotion, Face} from './rig';
import {STYLE} from './style';
import {theme} from '../brand/theme';

type StageFace = {emotion: Emotion; talk: number; blink: number; look: {x: number; y: number}; arms: [ArmSpec, ArmSpec] | null; squash: number; lean: number; nod: number};
type Props = {t: number; state?: Record<string, number>; faces?: Record<string, StageFace>; label?: string};
const REST: StageFace = {emotion: 'neutral', talk: 0, blink: 0, look: {x: 0, y: 0}, arms: null, squash: 0, lean: 0, nod: 0};
const LW = STYLE.setLinePx;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const io = (t: number) => { const u = clamp01(t); return u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2; };

// ------------------------------------------------------------------ the shape of the stage
const SCRATCH: P = [420, 1396]; // high enough that the virus's face stays above the caption line
/** The nerve, from the scratch to the top edge. */
const NERVE: P[] = [SCRATCH, [452, 1300], [530, 1180], [592, 1060], [600, 1000], [548, 880], [480, 720], [470, 560], [520, 400], [540, 240], [540, -80]];
const onPath = (pts: P[], k: number): P => {
  const lens = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  let d = clamp01(k) * lens.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lens.length; i++) { if (d <= lens[i]) return [lerp(pts[i][0], pts[i + 1][0], d / lens[i]), lerp(pts[i][1], pts[i + 1][1], d / lens[i])]; d -= lens[i]; }
  return pts[pts.length - 1];
};
/** Where on the nerve `climb` puts the virus (0 = at the scratch, 1 = near the top, under the sign). */
export const climbAt = (climb: number) => onPath(NERVE, 0.015 + clamp01(climb) * 0.78);
export const WALL_AT = 0.56; // the defenders' wall stands at this climb; the virus can get no higher than WALL_AT - 0.14
const VIRUS = {K: 2.05, body: 44};
export const ARM_ROOM = {side: 122, up: 128, down: 112};
export const ARM_SPOTS = {virus: {x: SCRATCH[0], y: SCRATCH[1] - 70, faceW: 190, headH: 200, size: 380}};
const DEF_N = 7;

/** Where everything on the arm is for a state. */
export const armLayout = (state: Record<string, number> = {}, t = 0) => {
  const st = (k: string) => clamp01(state[k] ?? 0);
  const [bite, climb, days, vaccine, wall, wash] = ['bite', 'climb', 'days', 'vaccine', 'wall', 'wash'].map(st);
  // ---- the dog: its muzzle comes in from the left, gives a nip and goes again
  const come = io(clamp01(bite / 0.42));
  const go = io(clamp01((bite - 0.62) / 0.38));
  const nip = bite > 0.42 && bite < 0.62 ? Math.sin(((bite - 0.42) / 0.2) * Math.PI) : 0;
  const dog = bite > 0 && bite < 1 ? {x: lerp(-560, 330, come) - go * 900 + nip * 40, y: 1320 - nip * 10, open: nip} : null;
  const scratched = state.bite === undefined ? true : bite > 0.5;
  // saliva drops fall into the scratch after the nip; the virus rides in on them
  const drops = [0, 1, 2].map((i) => { const u = clamp01((bite - 0.6 - i * 0.05) / 0.2); return u > 0 && u < 1 ? {i, x: SCRATCH[0] - 30 + i * 30, y: lerp(1250, SCRATCH[1] - 6, u * u), r: 12 - i * 2} : null; }).filter((d): d is NonNullable<typeof d> => !!d);
  const show = state.bite === undefined ? 1 : io(clamp01((bite - 0.82) / 0.18));
  const [vx, vy] = climbAt(climb);
  const virus = show > 0.02 ? {x: vx, y: vy - 70 + Math.sin(t * 2.6) * 4, k: show} : null;
  // ---- the defenders: they come from both sides and line up across the nerve
  const [wx, wy] = climbAt(WALL_AT);
  const defenders = Array.from({length: DEF_N}).map((_, i) => {
    const on = clamp01(vaccine * 1.6 - i * 0.09);
    if (on <= 0) return null;
    const side = i % 2 ? 1 : -1;
    const from: P = [side < 0 ? -80 - i * 20 : W + 80 + i * 20, wy - 260 + i * 70];
    const free: P = [wx + side * (190 + (i % 3) * 60), wy - 190 + (i % 4) * 40];
    const slot: P = [wx + (i - (DEF_N - 1) / 2) * 84, wy - Math.abs(i - (DEF_N - 1) / 2) * 6];
    const k = io(on);
    const p0: P = [lerp(from[0], free[0], k), lerp(from[1], free[1], k)];
    const p: P = [lerp(p0[0], slot[0], io(wall)), lerp(p0[1], slot[1], io(wall))];
    return {i, x: p[0] + Math.sin(t * 2 + i) * (1 - wall) * 6, y: p[1] + Math.cos(t * 1.7 + i) * 5, r: 40, on: k};
  }).filter((d): d is NonNullable<typeof d> => !!d);
  // ---- the calendar: how long the virus has been on the road
  const cal = state.days === undefined || vaccine > 0 ? null : {x: 872, y: 760, text: days < 0.08 ? 'DAY 1' : days < 0.35 ? 'WEEK 2' : days < 0.7 ? 'WEEK 6' : 'WEEK 10'};
  const foam = wash > 0 ? Array.from({length: 9}).map((_, i) => ({i, x: SCRATCH[0] + Math.cos(i * 0.7 + t) * (40 + (i % 3) * 22), y: SCRATCH[1] + Math.sin(i * 1.3 + t * 0.8) * 26, r: (12 + (i % 4) * 5) * wash})) : [];
  return {bite, climb, days, vaccine, wall, wash, dog, scratched, drops, virus, defenders, wallAt: [wx, wy] as P, cal, foam};
};

/** For the head check: where the virus's face is, or null when it is not in the picture. */
export const armSpotsAt = (state: Record<string, number> = {}) => {
  const L = armLayout(state, 0);
  return {virus: L.virus && L.virus.k > 0.5 ? {...ARM_SPOTS.virus, x: L.virus.x, y: L.virus.y} : null};
};
/** For the staging check: the virus's face room, and every loose thing that could come into it. */
export const armThings = (state: Record<string, number> = {}, t = 0) => {
  const L = armLayout(state, t);
  const R = ARM_ROOM;
  const faces = L.virus && L.virus.k > 0.5 ? [{who: 'virus', x0: L.virus.x - R.side, y0: L.virus.y - R.up, x1: L.virus.x + R.side, y1: L.virus.y + R.down}] : [];
  const things = [
    ...(L.dog ? [{id: 'the dog', x0: L.dog.x - 500, y0: L.dog.y - 340, x1: L.dog.x + 80, y1: L.dog.y + 150}] : []),
    ...L.defenders.map((d) => ({id: `defender ${d.i + 1}`, x0: d.x - d.r - 8, y0: d.y - d.r - 24, x1: d.x + d.r + 8, y1: d.y + d.r})),
    ...(L.cal ? [{id: 'the calendar', x0: L.cal.x - 92, y0: L.cal.y - 92, x1: L.cal.x + 92, y1: L.cal.y + 92}] : []),
    {id: 'the sign', x0: 600, y0: 220, x1: 960, y1: 420},
  ];
  return {faces, things};
};

// ------------------------------------------------------------------ the stage
const Eyes: React.FC<{x: number; y: number; gap: number; r: number}> = ({x, y, gap, r}) => (
  <g>{[-1, 1].map((sd) => <g key={sd}><circle cx={x + sd * gap} cy={y} r={r} fill="#ffffff" stroke="#1d2b4f" strokeWidth={1.6} /><circle cx={x + sd * gap} cy={y + r * 0.12} r={r * 0.56} fill="#1d2b4f" /><circle cx={x + sd * gap - r * 0.2} cy={y - r * 0.14} r={r * 0.18} fill="#ffffff" /></g>)}</g>
);

export const ArmStage: React.FC<Props> = ({t, state = {}, faces = {}, label}) => {
  const L = armLayout(state, t);
  const me = faces.virus ?? REST;
  const nerve = spline(NERVE, false, 0.45);
  return (
    <AbsoluteFill style={{background: '#3b1d33'}}>
      <Canvas>
        {/* outside the arm: plain and dark */}
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#3b1d33" />
        {/* the forearm, cut open: skin, a thin fat layer, muscle */}
        <path d="M150 -100 V1300 Q540 1330 930 1300 V-100 Z" fill="#f1c7a0" stroke="#b07a55" strokeWidth={LW} />
        <path d="M182 -100 V1288 Q540 1314 898 1288 V-100 Z" fill="#ffe2a6" />
        <path d="M200 -100 V1276 Q540 1300 880 1276 V-100 Z" fill="#e9737f" stroke={STYLE.fleshLine} strokeWidth={2.4} />
        {/* muscle bundles: long soft stripes */}
        {[260, 330, 400, 640, 700].map((x, i) => <path key={i} d={`M${x} -100 C${x + 20} 400 ${x - 16} 900 ${x + 10} 1270`} fill="none" stroke="#d4596a" strokeWidth={5} strokeLinecap="round" opacity={0.55} />)}
        {/* the two forearm bones */}
        {[[742, 46], [822, 40]].map(([x, w], i) => <rect key={i} x={x} y={-120} width={w} height={1380} rx={w / 2} fill="#f7ecd2" stroke="#c9b48a" strokeWidth={LW} />)}
        {/* the back of the hand, skin outside, the cut edge above it */}
        <path d="M150 1270 Q540 1340 930 1270 L960 1560 Q540 1610 120 1560 Z" fill="#f1c7a0" stroke="#b07a55" strokeWidth={LW} />
        {[[230, 70], [400, 82], [570, 82], [740, 74]].map(([x, w], i) => <rect key={i} x={x} y={1520} width={w} height={520} rx={w / 2} fill="#f1c7a0" stroke="#b07a55" strokeWidth={LW} />)}
        {[[265, 1700], [441, 1710], [611, 1710], [777, 1702]].map(([x, y], i) => <path key={i} d={`M${x - 16} ${y} Q${x} ${y - 10} ${x + 16} ${y}`} fill="none" stroke="#c9946a" strokeWidth={3} strokeLinecap="round" />)}

        {/* the nerve: a pale cord, drawn like a little road */}
        <path d={nerve} fill="none" stroke="#c9a94a" strokeWidth={70} strokeLinecap="round" />
        <path d={nerve} fill="none" stroke="#fff1b0" strokeWidth={62} strokeLinecap="round" />
        <path d={nerve} fill="none" stroke="#e2c86a" strokeWidth={4} strokeDasharray="22 22" strokeLinecap="round" />
        {/* the sign at the top */}
        <g transform="translate(780 300)">
          <rect x={-6} y={0} width={12} height={130} fill="#8a6a46" />
          <path d="M-150 -70 H150 L176 -36 L150 -2 H-150 Z" fill="#fff8ec" stroke="#2a2440" strokeWidth={LW} />
          <text x={0} y={-24} textAnchor="middle" fontFamily={theme.font} fontWeight={900} fontSize={36} fill="#2a2440">TO THE BRAIN</text>
          <path d="M-210 -10 L-210 -78 M-236 -52 L-210 -80 L-184 -52" fill="none" stroke="#fff8ec" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* the scratch: three short pink lines, no blood */}
        {L.scratched && [-18, 0, 18].map((d, i) => <path key={i} d={`M${SCRATCH[0] - 34 + d} ${SCRATCH[1] - 10 + i * 4} l58 -8`} stroke="#d9606f" strokeWidth={6} strokeLinecap="round" />)}
        {L.foam.map((f) => <circle key={f.i} cx={f.x} cy={f.y} r={f.r} fill="#ffffff" stroke="#bfe3ff" strokeWidth={2} />)}
        {L.drops.map((d) => <path key={d.i} d={`M${d.x} ${d.y - d.r * 1.8} C${d.x + d.r} ${d.y - d.r * 0.4} ${d.x + d.r} ${d.y + d.r} ${d.x} ${d.y + d.r} C${d.x - d.r} ${d.y + d.r} ${d.x - d.r} ${d.y - d.r * 0.4} ${d.x} ${d.y - d.r * 1.8} Z`} fill="#d8f1ff" stroke="#7fb8d9" strokeWidth={2} />)}

        {/* the calendar: how long the virus has been on the road */}
        {L.cal && (
          <g transform={`translate(${L.cal.x} ${L.cal.y})`}>
            <rect x={-86} y={-86} width={172} height={172} rx={18} fill="#fff8ec" stroke="#2a2440" strokeWidth={LW} />
            <rect x={-86} y={-86} width={172} height={48} rx={18} fill="#ef5b6a" />
            <rect x={-86} y={-56} width={172} height={18} fill="#ef5b6a" />
            {[-46, 46].map((x) => <rect key={x} x={x - 7} y={-102} width={14} height={34} rx={7} fill="#2a2440" />)}
            <text x={0} y={34} textAnchor="middle" fontFamily={theme.font} fontWeight={900} fontSize={38} fill="#2a2440">{L.cal.text}</text>
          </g>
        )}

        {/* the defenders the vaccine calls up: round, plain, each with its Y-shaped catchers */}
        {L.defenders.map((d) => (
          <g key={d.i} transform={`translate(${d.x.toFixed(1)} ${d.y.toFixed(1)}) scale(${d.on.toFixed(3)})`}>
            {[-0.7, 0, 0.7].map((a, j) => { const ax = Math.sin(a) * d.r; const ay = -Math.cos(a) * d.r; return <path key={j} d={`M${ax} ${ay} l${Math.sin(a) * 14} ${-Math.cos(a) * 14} m0 0 l${Math.sin(a - 0.5) * 10} ${-Math.cos(a - 0.5) * 10} m${-Math.sin(a - 0.5) * 10} ${Math.cos(a - 0.5) * 10} l${Math.sin(a + 0.5) * 10} ${-Math.cos(a + 0.5) * 10}`} fill="none" stroke="#2f7fc9" strokeWidth={5} strokeLinecap="round" />; })}
            <circle r={d.r} fill="#a9dcff" stroke="#2f7fc9" strokeWidth={LW} />
            <Eyes x={0} y={-4} gap={11} r={8} />
            <path d={L.wall > 0.9 ? 'M-10 12 Q0 20 10 12' : 'M-8 13 Q0 17 8 13'} fill="none" stroke="#1d2b4f" strokeWidth={3} strokeLinecap="round" />
          </g>
        ))}

        {/* the virus: a ball with knobbed spikes and its own face */}
        {L.virus && (
          <g transform={`translate(${L.virus.x.toFixed(1)} ${(L.virus.y + me.nod * 6).toFixed(1)}) rotate(${(me.lean * 0.8).toFixed(1)}) scale(${L.virus.k.toFixed(3)})`}>
            <Scaled s={VIRUS.K}>
              <g transform={`scale(${1 + me.squash * 0.1} ${1 - me.squash * 0.1})`}>
                {Array.from({length: 12}).map((_, i) => { const a = (i / 12) * Math.PI * 2; return <g key={i}><path d={`M${Math.cos(a) * 40} ${Math.sin(a) * 40} L${Math.cos(a) * 58} ${Math.sin(a) * 58}`} stroke="#7a3fa8" strokeWidth={4} strokeLinecap="round" /><circle cx={Math.cos(a) * 60} cy={Math.sin(a) * 60} r={6} fill="#c27ae8" stroke="#7a3fa8" strokeWidth={1.6} /></g>; })}
                <path d={blob(VIRUS.body, VIRUS.body * 0.96, 'armvirus', 11, 0.05)} fill="#b56ad9" stroke="#7a3fa8" strokeWidth={1.8} />
                <g transform="translate(0 -2)"><Face emotion={me.emotion} talk={me.talk} blink={me.blink} look={me.look} size={0.9} skin="#b56ad9" iris="#4a1d6b" /></g>
              </g>
            </Scaled>
          </g>
        )}

        {/* the dog: only its friendly muzzle comes into the picture */}
        {L.dog && (
          <g transform={`translate(${L.dog.x.toFixed(1)} ${L.dog.y.toFixed(1)}) scale(1.35)`}>
            <path d="M-360 -150 Q-120 -190 -20 -70 Q20 -20 -10 30 Q-60 90 -200 100 Q-330 110 -380 60 Z" fill="#d79a5e" stroke="#8a5a2e" strokeWidth={LW} />
            <path d="M-330 -150 Q-300 -260 -220 -190 Q-230 -140 -270 -120 Z" fill="#a8703e" stroke="#8a5a2e" strokeWidth={LW} />
            <ellipse cx={-6} cy={-58} rx={30} ry={24} fill="#2a2440" />
            <circle cx={-170} cy={-96} r={20} fill="#ffffff" stroke="#2a2440" strokeWidth={2} />
            <circle cx={-164} cy={-92} r={11} fill="#2a2440" />
            <circle cx={-168} cy={-97} r={4} fill="#ffffff" />
            <path d={`M-150 ${30 + L.dog.open * 6} Q-80 ${44 + L.dog.open * 34} -20 ${22 + L.dog.open * 10}`} fill="none" stroke="#5a3a1e" strokeWidth={5} strokeLinecap="round" />
          </g>
        )}
      </Canvas>
      <div style={{position: 'absolute', left: 60, top: 150, background: STYLE.label, color: '#fff', fontFamily: theme.font, fontWeight: 900, fontSize: 40, padding: '10px 28px', borderRadius: 40, border: '3px solid #0f6f66', letterSpacing: 1, boxShadow: '0 8px 0 rgba(29,43,79,0.25)'}}>{label ?? 'YOUR ARM'}</div>
    </AbsoluteFill>
  );
};
