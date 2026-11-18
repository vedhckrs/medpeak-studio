/**
 * MedPeak Toons - THE ARM (set `arm`), in the ink look the owner approved on 2026-11-17 ("Yes, this
 * look"; plans/reference-deep-study-2026-11-17.md). We are inside the forearm: muscle bundles fill the
 * frame, a nerve runs up between them beside an artery, fat and skin lie below, the air outside is at
 * the bottom. A dog's head comes in from outside and nips; saliva falls into the scratch; the rabies
 * virus (bullet-shaped, as it really is) climbs the nerve TO THE BRAIN; a calendar counts the weeks;
 * the vaccine's defenders line up as a wall across the nerve.
 *
 * Only what the sources say: dog bites and scratches carry the virus in saliva (WHO); it must travel to
 * the brain before it causes symptoms (CDC); that usually takes two to three months, sometimes a week
 * (WHO); treatment in time stops it before it reaches the central nervous system (WHO).
 *
 * Everything is placed by ONE layout (`armLayout`), so the staging check can measure it.
 */
import React from 'react';
import {AbsoluteFill, random} from 'remotion';
import {type P, spline} from './ink';
import {type ArmSpec, type Emotion} from './rig';
import {INK, InkEyes, Label, lump, ribbon, Tissue, wob} from './look-ink';
import {theme} from '../brand/theme';

type StageFace = {emotion: Emotion; talk: number; blink: number; look: {x: number; y: number}; arms: [ArmSpec, ArmSpec] | null; squash: number; lean: number; nod: number};
type Props = {t: number; state?: Record<string, number>; faces?: Record<string, StageFace>; label?: string};
const REST: StageFace = {emotion: 'neutral', talk: 0, blink: 0, look: {x: 0, y: 0}, arms: null, squash: 0, lean: 0, nod: 0};
const W = 1080;
const H = 1920;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const io = (t: number) => { const u = clamp01(t); return u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2; };

// ------------------------------------------------------------------ the shape of the stage
/** The skin's surface; below it is the air (and the caption line, which must stay clear of faces). */
export const SURFACE = 1700; // tissue fills the frame; only a strip of air is left (reference: anatomy edge to edge)
const FAT_TOP = 1420;
const DERM_TOP = 1590;
/** The reference's own colours, measured from its frames: warm salmon and coral, brick, cream. */
export const ARM_PAL = {muscle: '#e7867d', muscleDeep: '#cd6e68', gap: '#924142', fibre: '#c45554', lining: '#f6b3aa', artery: '#c45554', arteryDeep: '#924142', arteryLine: '#f48788', nerve: '#f6e3ce', nerveDeep: '#d9b98f', nerveFibre: '#e3c9a3', fat: '#f6dfa6', fatDeep: '#dcbf7a', fatBack: '#ebcf8c', skin: '#f2b8a8', skinDeep: '#e69d98', air: '#e1f7fb', shine: '#fff1ec'};
const SCRATCH: P = [452, SURFACE];
/** The nerve, from its endings in the skin up between the muscles and off the top. */
const NERVE: P[] = [[468, 1610], [472, 1480], [478, 1300], [520, 1160], [598, 1010], [628, 840], [586, 640], [520, 460], [512, 280], [560, 110], [610, -60]];
const ARTERY: P[] = [[735, 1400], [740, 1220], [770, 1020], [790, 800], [760, 560], [700, 340], [690, 120], [712, -60]];
const onPath = (pts: P[], k: number): P => {
  const lens = pts.slice(1).map((q, i) => Math.hypot(q[0] - pts[i][0], q[1] - pts[i][1]));
  let d = clamp01(k) * lens.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lens.length; i++) { if (d <= lens[i]) return [lerp(pts[i][0], pts[i + 1][0], d / lens[i]), lerp(pts[i][1], pts[i + 1][1], d / lens[i])]; d -= lens[i]; }
  return pts[pts.length - 1];
};
/** Where on the nerve `climb` puts the virus (0 = where the nerve leaves the skin, 1 = near the top). */
export const climbAt = (climb: number) => onPath(NERVE, 0.18 + clamp01(climb) * 0.66); // 0 = just above the fat, clear of the caption line
/** Which way the nerve runs at `climb` (degrees), so the virus leans along it. */
export const climbAngle = (climb: number) => { const [ax, ay] = climbAt(Math.max(0, climb - 0.02)); const [bx, by] = climbAt(Math.min(1, climb + 0.02)); return (Math.atan2(bx - ax, -(by - ay)) * 180) / Math.PI; };
export const WALL_AT = 0.56; // the defenders' wall; the virus gets no higher than about WALL_AT - 0.2
export const ARM_ROOM = {side: 150, up: 182, down: 158}; // the virus is drawn 1.15 times bigger (more reaches the caption line) [130, 158, 138]
export const ARM_SPOTS = {virus: {x: 478, y: 1300, faceW: 219, headH: 288, size: 530}}; // [190, 250, 460]
const DEF_N = 7;

/** Where everything on the arm is for a state. */
export const armLayout = (state: Record<string, number> = {}, t = 0) => {
  const st = (k: string) => clamp01(state[k] ?? 0);
  const [bite, climb, days, vaccine, wall, wash, dizzy] = ['bite', 'climb', 'days', 'vaccine', 'wall', 'wash', 'dizzy'].map(st);
  // the dog: its head comes up from the lower right until its nose touches the skin, nips, goes again
  const come = io(clamp01(bite / 0.42));
  const go = io(clamp01((bite - 0.62) / 0.38));
  const nip = bite > 0.42 && bite < 0.62 ? Math.sin(((bite - 0.42) / 0.2) * Math.PI) : 0;
  const dog = bite > 0 && bite < 1 ? {dx: lerp(620, -150, come) + go * 850, dy: lerp(560, -170, come) + go * 770 - nip * 40, open: nip} /* it lunges well into the frame and snaps (owner, 2026-11-18: the bite was never shown) [0, 0, 14] */ : null;
  const scratched = state.bite === undefined ? true : bite > 0.5;
  const drops = [0, 1].map((i) => { const u = clamp01((bite - 0.56 - i * 0.06) / 0.2); return u > 0 && u < 1 ? {i, x: SCRATCH[0] - 22 + i * 40, y: lerp(SURFACE + 90, SURFACE - 6, u), r: 13 - i * 2} : null; }).filter((d): d is NonNullable<typeof d> => !!d);
  const show = state.bite === undefined ? 1 : io(clamp01((bite - 0.8) / 0.2));
  const [vx, vy] = climbAt(climb);
  // it rides up inside the nerve, leaning along it; a little rocking step tied to how far it has climbed (so it only rocks while it moves)
  const hop = Math.sin(climb * 120);
  const virus = show > 0.02 ? {x: vx, y: vy, k: show, hop, lean: climbAngle(climb)} : null;
  // the defenders: they come in from both sides and line up across the nerve
  const [wx, wy] = climbAt(WALL_AT);
  const defenders = Array.from({length: DEF_N}).map((_, i) => {
    const on = clamp01(vaccine * 1.6 - i * 0.09);
    if (on <= 0) return null;
    const side = i % 2 ? 1 : -1;
    const from: P = [side < 0 ? -90 - i * 20 : W + 90 + i * 20, wy - 220 + i * 60];
    const free: P = [wx + side * (200 + (i % 3) * 60), wy - 180 + (i % 4) * 40];
    const slot: P = [wx + (i - (DEF_N - 1) / 2) * 92, wy - Math.abs(i - (DEF_N - 1) / 2) * 8];
    const k = io(on);
    const p0: P = [lerp(from[0], free[0], k), lerp(from[1], free[1], k)];
    const moving = (k > 0 && k < 1) || (wall > 0 && wall < 1);
    const step = moving ? Math.abs(Math.sin(t * 7 + i * 1.3)) * 12 : 0; // little marching steps while they move
    const push = wall >= 1 ? Math.sin(t * 2.4 + i * 0.5) * 3 : 0; // in the wall they lean and hold
    const blink = (t * 0.37 + i * 0.21) % 1 < 0.04;
    return {i, x: lerp(p0[0], slot[0], io(wall)) + push, y: lerp(p0[1], slot[1], io(wall)) - step, r: 44, on: k, blink};
  }).filter((d): d is NonNullable<typeof d> => !!d);
  const cal = state.days === undefined || vaccine > 0 ? null : {x: 905, y: 330, n: days < 0.08 ? 1 : days < 0.35 ? 2 : days < 0.7 ? 6 : 10, unit: days < 0.08 ? 'DAY' : 'WEEK'};
  const foam = wash > 0 ? Array.from({length: 9}).map((_, i) => ({i, x: SCRATCH[0] + Math.cos(i * 0.7 + t) * (40 + (i % 3) * 22), y: SURFACE + 20 + Math.abs(Math.sin(i * 1.3 + t * 0.8)) * 30, r: (12 + (i % 4) * 5) * wash})) : [];
  // the nip shakes the skin and the fat a little; the drops land with a ring
  const shake = nip * Math.sin(t * 46) * 16; // [7]
  const splash = [0.74, 0.86].map((at, i) => ({i, k: clamp01((bite - at) / 0.12)})).filter((r) => r.k > 0 && r.k < 1);
  return {bite, climb, days, vaccine, wall, wash, dizzy, dog, scratched, drops, virus, defenders, wallAt: [wx, wy] as P, cal, foam, shake, splash};
};

/** For the head check: where the virus's face is, or null when it is not in the picture. */
export const armSpotsAt = (state: Record<string, number> = {}) => {
  const L = armLayout(state, 0);
  return {virus: L.virus && L.virus.k > 0.5 ? {...ARM_SPOTS.virus, x: L.virus.x, y: L.virus.y} : null};
};
/** For the staging check: the virus's face room, and every loose thing that could come into it. */
export const armThings = (state: Record<string, number> = {}, t = 0): {faces: {who: string; x0: number; y0: number; x1: number; y1: number}[]; things: {id: string; text?: boolean; x0: number; y0: number; x1: number; y1: number}[]} => {
  const L = armLayout(state, t);
  const R = ARM_ROOM;
  const faces = L.virus && L.virus.k > 0.5 ? [{who: 'virus', x0: L.virus.x - R.side, y0: L.virus.y - R.up, x1: L.virus.x + R.side, y1: L.virus.y + R.down}] : [];
  const things = [
    ...(L.dog ? [{id: 'the dog', x0: 560 + L.dog.dx, y0: SURFACE + L.dog.dy, x1: W, y1: H}] : []),
    ...L.defenders.map((d) => ({id: `defender ${d.i + 1}`, x0: d.x - d.r - 10, y0: d.y - d.r - 26, x1: d.x + d.r + 10, y1: d.y + d.r})),
    ...(L.cal ? [{id: 'calendar', text: true, x0: L.cal.x - 100, y0: L.cal.y - 110, x1: L.cal.x + 100, y1: L.cal.y + 100}] : []),
    {id: 'sign', text: true, x0: 600, y0: 60, x1: 1060, y1: 200},
  ];
  return {faces, things};
};

// ------------------------------------------------------------------ the stage
const BUNDLES: {seed: string; pts: P[]}[] = [
  {seed: 'm1', pts: [[-60, -80], [250, -80], [262, 260], [250, 600], [276, 900], [252, FAT_TOP + 10], [-60, FAT_TOP + 10]]},
  {seed: 'm2', pts: [[290, -80], [500, -80], [470, 240], [430, 560], [494, 860], [440, FAT_TOP - 10], [300, FAT_TOP + 10], [296, 780], [306, 420]]},
  {seed: 'm3', pts: [[560, 160], [640, 60], [670, 320], [700, 560], [690, 820], [640, 1000], [560, FAT_TOP - 20], [600, 880], [660, 660], [602, 460]]},
  {seed: 'm4', pts: [[840, -80], [1140, -80], [1140, FAT_TOP + 10], [830, FAT_TOP + 10], [880, 880], [850, 540], [880, 240]]},
];
const FAT = Array.from({length: 22}).map((_, i) => ({i, x: -20 + (i % 11) * 108 + (Math.floor(i / 11) % 2) * 54, y: FAT_TOP + 50 + Math.floor(i / 11) * 82, rx: 58 + random(`fr${i}`) * 18, ry: 38 + random(`fy${i}`) * 10}));

const Virus: React.FC<{f: StageFace; k: number}> = ({f, k}) => {
  const bullet = `M-52 64 L-52 -24 Q-52 -88 0 -92 Q52 -88 52 -24 L52 64 Z`;
  const mood = f.emotion;
  const mouth = f.talk > 0.15 ? <ellipse cx={2} cy={22} rx={9} ry={4 + f.talk * 9} fill={INK.line} /> : mood === 'sad' || mood === 'scared' ? <path d="M-12 26 Q2 16 16 26" fill="none" stroke={INK.line} strokeWidth={INK.wIn} strokeLinecap="round" /> : <path d="M-12 18 Q2 28 16 16" fill="none" stroke={INK.line} strokeWidth={INK.wIn} strokeLinecap="round" />;
  const brow = mood === 'angry' ? <path d="M-34 -62 L-10 -52 M38 -62 L14 -52" stroke={INK.line} strokeWidth={5} strokeLinecap="round" /> : mood === 'smug' ? <path d="M-34 -56 L-10 -58" stroke={INK.line} strokeWidth={5} strokeLinecap="round" /> : null;
  return (
    <g transform={`scale(${(k * 1.5).toFixed(3)}) rotate(${(-6 + f.lean * 0.6).toFixed(1)}) scale(${1 + f.squash * 0.08} ${1 - f.squash * 0.08})`}>
      {Array.from({length: 18}).map((_, i) => { const a = (i / 18) * Math.PI * 2; const px = Math.cos(a) * 60; const py = Math.sin(a) * 80 - 6; return <g key={i}><path d={`M${px * 0.86} ${py * 0.86} L${px * 1.12} ${py * 1.12}`} stroke={INK.line} strokeWidth={4} /><circle cx={px * 1.16} cy={py * 1.16} r={7} fill="#7f9a62" stroke={INK.line} strokeWidth={3} /></g>; })}
      <path d={bullet} fill="#9db57a" stroke={INK.line} strokeWidth={INK.w} strokeLinejoin="round" />
      <path d="M-40 54 L-40 -20 Q-40 -72 0 -76" fill="none" stroke="#b9cf95" strokeWidth={9} strokeLinecap="round" opacity={0.8} />
      <InkEyes x={0} y={-24} r={19} look={[f.look.x * 0.7, -0.4 + f.look.y * 0.5]} lid={f.blink > 0.5 ? 0.9 : mood === 'smug' ? 0.35 : 0} />
      {brow}
      {mouth}
    </g>
  );
};

export const ArmStage: React.FC<Props> = ({t, state = {}, faces = {}, label}) => {
  const L = armLayout(state, t);
  const me = faces.virus ?? REST;
  const nerveD = spline(wob(ribbon(NERVE, 54, 86), 'nv', 2.5), true, 0.5);
  const arteryD = spline(wob(ribbon(ARTERY, 50, 64), 'ar', 2.5), true, 0.5);
  // Life comes in moments, not all the time (the reference holds still in 63% of frames): a heartbeat
  // swell once every 1.6 s, a muscle tightening every 6 s, a nerve signal every 5 s.
  const ph = (t / 2) % 1;
  const beat = ph < 0.22 ? Math.sin((ph / 0.22) * Math.PI) : 0;
  // the blood flows all the time (owner, 2026-11-18: "this line not moving, continue inside line"), a little faster on each beat
  const flow = t * 70 + (Math.floor(t / 2) + Math.min(1, ph / 0.22)) * 30;
  const flex = (i: number) => { const q = ((t + i * 1.9) / 6) % 1; return q < 0.25 ? Math.sin((q / 0.25) * Math.PI) : 0; };
  const sig = (t / 1.8) % 1; // a nerve signal every 1.8 s, taking 0.9 s to run up (owner, 2026-11-18: "animation of nerve") [every 5 s]
  return (
    <AbsoluteFill style={{background: ARM_PAL.air}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', left: 0, top: 0}}>
        <rect x={0} y={0} width={W} height={H} fill={ARM_PAL.air} />
        {/* deep tissue between the muscles, the muscle bundles with their fibres */}
        <rect x={-40} y={-80} width={W + 80} height={FAT_TOP + 140} fill={ARM_PAL.gap} />
        {/* the muscles: each bundle tightens and relaxes slowly, a few pixels, on its own rhythm */}
        {BUNDLES.map((b, i) => { const c = flex(i); return (
          <g key={b.seed} transform={`translate(${(c * 3).toFixed(2)} 0) scale(${(1 + c * 0.004).toFixed(4)} 1)`}>
            <Tissue d={spline(wob(b.pts, b.seed, 8), true, 0.55)} fill={ARM_PAL.muscle} deep={ARM_PAL.muscleDeep} lining={ARM_PAL.lining} band={58} form={30} shine={{x0: b.pts[0][0] + 40, x1: b.pts[1][0] - 60, y0: 120, y1: FAT_TOP - 160, n: 3, seed: b.seed}} />
          </g>
        ); })}
        {[[60, 0], [150, 0.4], [360, 0.2], [420, 0.6], [640, 0.1], [930, 0.3], [1010, 0.5]].map(([x, s], i) => { const c = flex(Math.min(3, Math.floor(x / 280))) * 3; return <path key={i} d={spline(wob([[x + c, -40], [x + 12 + c, 260], [x - 8 + c, 560], [x + 10 + c, 860], [x + c, FAT_TOP - 20]], `fb${i}`, 10), false, 0.5)} fill="none" stroke={ARM_PAL.fibre} strokeWidth={4} strokeLinecap="round" opacity={0.5 + s * 0.2} />; })}
        {/* fine capillaries on the muscle */}
        {[[[120, 380], [170, 420], [150, 480], [200, 520]], [[930, 300], [880, 360], [920, 420]], [[960, 820], [1000, 880], [960, 940], [1010, 990]]].map((pts, i) => <path key={`cap${i}`} d={spline(pts as P[], false, 0.5)} fill="none" stroke={ARM_PAL.gap} strokeWidth={4} strokeLinecap="round" opacity={0.7} />)}
        {/* the artery: it swells with every heartbeat and the blood flows inside it */}
        <path d={arteryD} fill={ARM_PAL.gap} opacity={0.55} transform="translate(12 14)" />
        <path d={nerveD} fill={ARM_PAL.gap} opacity={0.55} transform="translate(12 14)" />
        <g transform={`translate(${ARTERY[3][0]} ${ARTERY[3][1]}) scale(${(1 + beat * 0.03).toFixed(4)} 1) translate(${-ARTERY[3][0]} ${-ARTERY[3][1]})`}>
          <Tissue d={arteryD} fill={ARM_PAL.artery} deep={ARM_PAL.arteryDeep} lining={ARM_PAL.arteryLine} band={22} form={10} />
          <path d={spline(ARTERY, false, 0.5)} fill="none" stroke={ARM_PAL.arteryLine} strokeWidth={6} strokeLinecap="round" strokeDasharray="26 54" strokeDashoffset={flow.toFixed(1)} opacity={0.8} />
        </g>
        {/* the nerve with its fibre bundles, and now and then a signal running up it */}
        <Tissue d={nerveD} fill={ARM_PAL.nerve} deep={ARM_PAL.nerveDeep} lining="#fffaf0" band={26} form={12} />
        {[-14, 0, 14].map((o, i) => <path key={i} d={spline(NERVE.map(([x, y], j) => [x + o * (1 - (j / NERVE.length) * 0.4), y] as P), false, 0.5)} fill="none" stroke={ARM_PAL.nerveFibre} strokeWidth={3} opacity={0.9} />)}
        <defs><clipPath id="armNerveClip"><path d={nerveD} /></clipPath></defs>
        <g clipPath="url(#armNerveClip)">
          {/* a signal: a soft bright pulse that runs up inside the nerve, now and then */}
          {sig < 0.5 && (() => { const [px, py] = onPath(NERVE, sig / 0.5); return <g opacity={Math.sin((sig / 0.5) * Math.PI)}><ellipse cx={px} cy={py} rx={60} ry={90} fill="#fffaf0" opacity={0.8} /><ellipse cx={px} cy={py} rx={26} ry={44} fill="#ffe27a" /></g>; })()}
          {/* where the virus is, the nerve swells sickly green around it */}
          {L.virus && <ellipse cx={L.virus.x} cy={L.virus.y} rx={80} ry={140} fill="#b9cf95" opacity={0.55 * L.virus.k} transform={`rotate(${(L.virus.lean ?? 0).toFixed(1)} ${L.virus.x.toFixed(1)} ${L.virus.y.toFixed(1)})`} />}
        </g>
        {/* where the virus has been: the nerve it has climbed turns sickly */}
        {L.virus && L.climb > 0.01 && <path d={spline(Array.from({length: 24}, (_, i) => climbAt((L.climb * i) / 23)), false, 0.5)} fill="none" stroke="#9db57a" strokeWidth={34} strokeLinecap="round" opacity={0.45} clipPath="url(#armNerveClip)" />}
        {/* a few fine strands of connective tissue in front */}
        {[[[380, 180], [520, 230], [700, 200]], [[300, 900], [470, 960], [620, 940]]].map((pts, i) => <path key={`str${i}`} d={spline(pts as P[], false, 0.5)} fill="none" stroke={ARM_PAL.shine} strokeWidth={5} strokeLinecap="round" opacity={0.7} />)}
        <g transform={`translate(0 ${L.shake.toFixed(2)})`}>
        {/* fat lobules */}
        <path d={`M-40 ${FAT_TOP} Q540 ${FAT_TOP - 22} 1120 ${FAT_TOP} L1120 ${DERM_TOP + 10} L-40 ${DERM_TOP + 10} Z`} fill={ARM_PAL.fatBack} />
        {FAT.map((f) => <Tissue key={f.i} d={spline(lump(f.x, f.y, f.rx, f.ry, `fl${f.i}`, 12, 0.12), true, 0.6)} fill={ARM_PAL.fat} deep={ARM_PAL.fatDeep} band={18} line={INK.wIn} form={6} />)}
        <path d={`M-40 ${FAT_TOP} Q540 ${FAT_TOP - 22} 1120 ${FAT_TOP}`} fill="none" stroke={INK.line} strokeWidth={INK.w} />
        {/* skin */}
        <Tissue d={spline(wob([[-60, DERM_TOP], [300, DERM_TOP - 12], [700, DERM_TOP + 4], [1140, DERM_TOP - 8], [1140, SURFACE + 2], [700, SURFACE + 8], [300, SURFACE - 2], [-60, SURFACE + 6]], 'derm', 4), true, 0.4)} fill={ARM_PAL.skin} deep={ARM_PAL.skinDeep} band={22} />
        {[[[468, 1610], [456, 1650], [442, 1692]], [[468, 1610], [490, 1650], [508, 1690]]].map((pts, i) => <path key={i} d={spline(pts as P[], false, 0.5)} fill="none" stroke="#e8cf86" strokeWidth={6} strokeLinecap="round" />)}
        {L.scratched && <path transform={`translate(${SCRATCH[0]} ${SURFACE}) scale(1.9) translate(${-SCRATCH[0]} ${-SURFACE})`} d={`M${SCRATCH[0] - 46} ${SURFACE + 2} L${SCRATCH[0] - 10} ${SURFACE - 30} L${SCRATCH[0] + 8} ${SURFACE - 6} L${SCRATCH[0] + 30} ${SURFACE - 26} L${SCRATCH[0] + 50} ${SURFACE + 4} Z`} fill="#e2858a" stroke={INK.line} strokeWidth={INK.wIn} strokeLinejoin="round" />}
        {L.foam.map((f) => <circle key={f.i} cx={f.x} cy={f.y} r={f.r} fill="#ffffff" stroke={INK.line} strokeWidth={3} />)}
        {L.splash.map((r) => <ellipse key={r.i} cx={SCRATCH[0]} cy={SURFACE - 4} rx={20 + r.k * 60} ry={6 + r.k * 14} fill="none" stroke="#9fd0e6" strokeWidth={4} opacity={1 - r.k} />)}
        </g>

        {/* labels and the calendar, like an anatomy chart */}
        {/* shown only while the virus is climbing (it sat on screen for the whole scene: owner, 2026-11-18) */}
        <g transform="translate(830 130)" opacity={L.climb > 0.005 && L.wall < 0.5 ? 1 : 0}>
          <Label x={0} y={0} text="TO THE BRAIN" size={36} />
          <path d="M-200 -12 L-200 -88 M-224 -62 L-200 -90 L-176 -62" fill="none" stroke={INK.line} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {L.cal && (
          <g transform={`translate(${L.cal.x} ${L.cal.y}) rotate(4)`}>
            <rect x={-86} y={-90} width={172} height={180} fill="#fffaf0" stroke={INK.line} strokeWidth={INK.w} />
            <rect x={-86} y={-90} width={172} height={50} fill="#e45b55" stroke={INK.line} strokeWidth={INK.w} />
            {[-44, 44].map((x) => <rect key={x} x={x - 8} y={-108} width={16} height={36} rx={8} fill={INK.line} />)}
            <text x={0} y={-56} textAnchor="middle" fontFamily={theme.font} fontWeight={900} fontSize={26} fill="#ffffff">{L.cal.unit}</text>
            <text x={0} y={52} textAnchor="middle" fontFamily={theme.font} fontWeight={900} fontSize={96} fill={INK.line}>{L.cal.n}</text>
          </g>
        )}

        {/* the defenders the vaccine calls up: round, plain, Y-shaped catchers, eyes only */}
        {L.defenders.map((d) => (
          <g key={d.i} transform={`translate(${d.x.toFixed(1)} ${d.y.toFixed(1)}) scale(${d.on.toFixed(3)})`}>
            {[-0.7, 0, 0.7].map((a, j) => { const ax = Math.sin(a) * d.r; const ay = -Math.cos(a) * d.r; const bx = ax + Math.sin(a) * 18; const by = ay - Math.cos(a) * 18; const tip = (b: number) => `${(bx + Math.sin(a + b) * 12).toFixed(1)} ${(by - Math.cos(a + b) * 12).toFixed(1)}`; return <path key={j} d={`M${ax.toFixed(1)} ${ay.toFixed(1)} L${bx.toFixed(1)} ${by.toFixed(1)} L${tip(-0.6)} M${bx.toFixed(1)} ${by.toFixed(1)} L${tip(0.6)}`} fill="none" stroke={INK.line} strokeWidth={5} strokeLinecap="round" />; })}
            <path d={spline(lump(0, 0, d.r, d.r * 0.94, `def${d.i}`, 12, 0.05), true, 0.6)} fill="#e4ecf2" stroke={INK.line} strokeWidth={INK.w - 1} />
            <InkEyes x={0} y={-4} r={12} look={[0, -0.6]} lid={d.blink ? 0.9 : 0} />
            <path d={L.wall > 0.9 ? 'M-9 16 Q0 24 9 16' : 'M-7 17 Q0 20 7 17'} fill="none" stroke={INK.line} strokeWidth={3.5} strokeLinecap="round" />
          </g>
        ))}

        {/* the virus */}
        {L.virus && (
          <g transform={`translate(${L.virus.x.toFixed(1)} ${(L.virus.y + me.nod * 6).toFixed(1)})`}>
            <g transform={`rotate(${((L.virus.lean ?? 0) * 0.6 + L.virus.hop * 6).toFixed(1)})`}><Virus f={me} k={L.virus.k} /></g>
            {L.dizzy > 0.05 && [0, 1, 2].map((i) => { const a = t * 4 + (i * Math.PI * 2) / 3; return <path key={i} transform={`translate(${(Math.cos(a) * 80).toFixed(1)} ${(-170 + Math.sin(a) * 20).toFixed(1)}) scale(${(L.dizzy * 1.8).toFixed(2)})`} d="M0 -16 L5 -5 L16 -4 L7 3 L10 15 L0 8 L-10 15 L-7 3 L-16 -4 L-5 -5 Z" fill="#ffd23c" stroke={INK.line} strokeWidth={3} strokeLinejoin="round" />; })}
          </g>
        )}

        {/* saliva and the dog, from outside */}
        {L.drops.map((d) => <path key={d.i} d={`M${d.x} ${d.y - d.r * 1.8} C${d.x + d.r} ${d.y - d.r * 0.4} ${d.x + d.r} ${d.y + d.r} ${d.x} ${d.y + d.r} C${d.x - d.r} ${d.y + d.r} ${d.x - d.r} ${d.y - d.r * 0.4} ${d.x} ${d.y - d.r * 1.8} Z`} fill="#eef8fc" stroke={INK.line} strokeWidth={3} />)}
        {L.dog && (
          <g transform={`translate(${L.dog.dx.toFixed(1)} ${(L.dog.dy + SURFACE - 1500).toFixed(1)})`}>
            <path d={spline(wob([[1010, 1555], [1050, 1470], [1110, 1470], [1120, 1600], [1060, 1610]], 'ear', 4), true, 0.6)} fill="#9c6438" stroke={INK.line} strokeWidth={INK.w} strokeLinejoin="round" />
            <path d={spline(wob([[592, 1606], [660, 1560], [780, 1546], [930, 1570], [1140, 1600], [1140, 2100], [780, 2100], [660, 1820], [610, 1710]], 'dog', 5), true, 0.5)} fill="#c98c55" stroke={INK.line} strokeWidth={INK.w} strokeLinejoin="round" />
            <path d={spline(wob([[640, 1660], [700, 1700], [780, 1720], [860, 1716]], 'muz', 3), false, 0.5)} fill="none" stroke="#9c6438" strokeWidth={5} strokeLinecap="round" />
            <path d={spline(wob([[574, 1590], [600, 1566], [640, 1570], [652, 1604], [624, 1630], [588, 1624]], 'nose', 2), true, 0.6)} fill={INK.line} />
            {/* a snarling mouth: open, dark inside, fangs showing; it opens wider as it snaps (it was a closed smile) */}
            <path d={`M612 1664 Q700 ${1690 - L.dog.open * 6} 812 1716 Q760 ${1790 + L.dog.open * 70} 640 ${1760 + L.dog.open * 60} Z`} fill="#4a1420" stroke={INK.line} strokeWidth={INK.wIn} strokeLinejoin="round" />
            {[[636, 1672, 30], [672, 1680, 22], [704, 1688, 20], [738, 1697, 22], [776, 1708, 30]].map(([x, y, h], i) => <path key={i} d={`M${x - 11} ${y} L${x} ${y + h + (L.dog?.open ?? 0) * 10} L${x + 11} ${y + 3} Z`} fill="#fff6dc" stroke={INK.line} strokeWidth={4} strokeLinejoin="round" />)}
            <InkEyes x={880} y={1640} r={28} gap={0} look={[-0.6, 0.3]} lid={0.3} />
            <path d="M836 1592 L916 1622" stroke={INK.line} strokeWidth={12} strokeLinecap="round" />
            {[[690, 1660], [720, 1684], [750, 1664]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill="#7d5130" />)}
          </g>
        )}
      </svg>
    </AbsoluteFill>
  );
};
