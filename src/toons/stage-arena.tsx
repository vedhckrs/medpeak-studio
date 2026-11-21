/**
 * MedPeak Toons - THE TOOTH ARENA (set `molar`): the top of a back tooth as a wide stage where
 * things HAPPEN (owner, 2026-11-17: "every video looks same, repeated template, icons and all").
 *
 * Instead of two faces and stickers, this stage has a crew: spit guards on duty, a gang of five
 * germs, a fight in a dust cloud, guards that fall asleep one by one, a night party with acid in
 * cups, a chalky patch that spreads, and a giant toothbrush that ploughs it all away.
 *
 * Everything is placed by ONE layout (`arenaLayout`), so the staging check can measure it.
 * It shows only what the sources say: spit clears sugar and acid and almost stops in sleep (Dawes
 * 2008), germs turn leftover food into acid and a white spot is early decay (NIDCR), brush last
 * thing at night (NHS).
 */
import React, {useId} from 'react';
import {AbsoluteFill, random} from 'remotion';
import {Canvas, H, W} from './camera';
import {blob, type P, Scaled, spline, stipplePath} from './ink';
import {Arm, type ArmSpec, type Emotion, Face} from './rig';
import {STYLE} from './style';
import {theme} from '../brand/theme';

type StageFace = {emotion: Emotion; talk: number; blink: number; look: {x: number; y: number}; arms: [ArmSpec, ArmSpec] | null; squash: number; lean: number; nod: number};
type Props = {t: number; state?: Record<string, number>; faces?: Record<string, StageFace>; label?: string};
const REST: StageFace = {emotion: 'neutral', talk: 0, blink: 0, look: {x: 0, y: 0}, arms: [112, 68], squash: 0, lean: 0, nod: 0};
const LW = STYLE.setLinePx;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const io = (t: number) => { const u = clamp01(t); return u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2; };
const wrap = (v: number, m: number) => ((v % m) + m) % m;
const star4 = (x: number, y: number, r: number) => `M${x} ${y - r} Q${x + r * 0.16} ${y - r * 0.16} ${x + r} ${y} Q${x + r * 0.16} ${y + r * 0.16} ${x} ${y + r} Q${x - r * 0.16} ${y + r * 0.16} ${x - r} ${y} Q${x - r * 0.16} ${y - r * 0.16} ${x} ${y - r} Z`;

// ------------------------------------------------------------------ the shape of the stage
/** How high the chewing surface is at x: two rounded cusps with a groove between them, falling away at the shoulders. */
export const surfaceY = (x: number) => { const d = Math.abs(Math.max(96, Math.min(984, x)) - 540); return d <= 290 ? 690 + 36 * Math.cos((d / 290) * Math.PI) : 654 + ((d - 290) / 140) ** 2 * 110; };
const TOP: P[] = Array.from({length: 23}, (_, i) => { const x = 96 + i * (888 / 22); return [x, surfaceY(x)] as P; });
const CROWN: P[] = [[66, 1620], [62, 1100], [70, 880], [84, 800], ...TOP, [996, 800], [1010, 880], [1018, 1100], [1014, 1620]];
const CROWN_IN: P[] = [[124, 1620], [120, 1100], [128, 900], [150, 836], ...TOP.slice(2, -2).map(([x, y]) => [x, y + 54] as P), [930, 836], [952, 900], [960, 1100], [956, 1620]];
export const ARENA = {face: [540, 1070] as P, K: 5.2, germK: 2.3, room: {side: 275, up: 235, down: 225}, germRoom: {side: 100, up: 104, down: 92}};
export const ARENA_SPOTS = {tooth: {x: ARENA.face[0], y: ARENA.face[1], faceW: 380, headH: 380, size: 700}, bacteria: {x: 1004, y: 900, faceW: 150, headH: 170, size: 320}};
export const ARENA_ARMS = {tooth: {k: ARENA.K, len: 22}, bacteria: {k: ARENA.germK, len: 24}};
const GUARD_X = [128, 254, 836, 958]; // the guards' posts, two at each shoulder: the middle belongs to the fight and the party
const GANG: {kind: 'rod' | 'spiky' | 'twins' | 'tiny'; x: number; col: string; line: string}[] = [
  {kind: 'rod', x: 480, col: '#b996f2', line: '#7a55c4'},
  {kind: 'spiky', x: 588, col: '#ffab57', line: '#c9731f'},
  {kind: 'twins', x: 700, col: '#74c8ff', line: '#2f83cc'},
  {kind: 'tiny', x: 792, col: '#ffe26b', line: '#c79d1f'},
];
const BOSS = {lurk: [1004, 900] as P, shoulder: 962, dance: 372, up: 74};
const ACID = '#b9e04a';
const ACID_LINE = '#6f9a1c';
const GERM = '#8bd469';

/** Where everything on the arena is for a state: the guards, the gang, the boss, the brush, the acid. */
export const arenaLayout = (state: Record<string, number> = {}, t = 0) => {
  const st = (k: string) => clamp01(state[k] ?? 0);
  const [night, guards, sleep, sugar, wash, fight, party, acid, chalk, brush, shield] = ['night', 'guards', 'sleep', 'sugar', 'wash', 'fight', 'party', 'acid', 'chalk', 'brush', 'shield'].map(st);
  // ---- the brush ploughs along the surface from the left; whatever it reaches is knocked away
  const bx = lerp(-560, 1760, io(brush));
  const knock = (x: number) => (brush > 0 ? clamp01((bx + 372 - x) / 360) : 0); // from the moment the front of the brush head reaches it
  // ---- the fight: the gang rushes in (0 to 0.3), a dust cloud (0.3 to 0.72), the germs are thrown out (0.72 to 1)
  const rush = io(clamp01(fight / 0.3));
  const cloud = fight > 0.3 && fight < 0.72 ? Math.sin(Math.PI * clamp01((fight - 0.3) / 0.42)) ** 0.6 : 0;
  const inCloud = fight > 0.33 && fight < 0.7;
  const rout = clamp01((fight - 0.72) / 0.28);
  const fighting = fight > 0 && fight < 1;

  const guard = GUARD_X.map((gx, i) => {
    if (guards <= 0) return null;
    const on = clamp01(guards * 2.2 - i * 0.3);
    const side = i < 2 ? -1 : 1;
    // asleep, one after another: a yawn, then over they go, away from the middle
    const q = clamp01((sleep - i * 0.2) / 0.4);
    const yawn = clamp01(q / 0.4) * (1 - clamp01((q - 0.4) / 0.2));
    const fall = io(clamp01((q - 0.4) / 0.4));
    // the fight pulls them to the middle and lets them go again
    const meet = [452, 512, 612, 668][i];
    const x = fighting ? lerp(gx, meet, rout > 0 ? 1 - io(rout) : rush) : gx;
    const hop = brush > 0 ? Math.sin(clamp01(1 - Math.abs(bx - x) / 330) * Math.PI * 0.5) : 0; // they jump the brush like a skipping rope
    const cheer = fighting ? rout : fight >= 1 && sleep <= 0 && night < 0.3 ? 1 : 0; // they cheer when the germs are out, and stop when the evening is over
    const bounce = cheer > 0 && fall <= 0 ? Math.abs(Math.sin(t * 7 + i * 1.3)) * 16 * cheer : 0;
    return {i, x, y: surfaceY(x) - hop * 300 - bounce, on, side, yawn, fall, asleep: q >= 1, hidden: inCloud, cheer, air: hop > 0.05};
  }).filter((g): g is NonNullable<typeof g> => !!g && g.on > 0);

  const gang = GANG.map((g, j) => {
    const k = knock(g.x);
    if (fighting) {
      const from = 1180 + j * 70;
      const meet = 690 - j * 44;
      if (rout > 0) { // thrown out, one after another, spinning
        const r = clamp01((rout - j * 0.1) / 0.62);
        return {...g, j, x: lerp(meet, 1260 + j * 40, r), y: lerp(surfaceY(meet), 420 - j * 50, r) - Math.sin(Math.PI * r) * 360, rot: r * 620, hidden: r >= 1, dance: 0, cup: 0, hat: false, knock: 0};
      }
      const x = lerp(from, meet, rush);
      return {...g, j, x, y: surfaceY(x) - Math.abs(Math.sin(t * 11 + j)) * 14, rot: -8, hidden: inCloud, dance: 0, cup: 0, hat: false, knock: 0};
    }
    if (party <= 0) return null;
    const e = io(clamp01((party - j * 0.1) / 0.55));
    const x = lerp(1190 + j * 60, g.x, e);
    const hopY = e >= 1 ? Math.abs(Math.sin(t * 6.2 + j * 1.7)) * 30 : Math.abs(Math.sin(t * 9 + j)) * 10; // tiptoe in, then dance
    return {...g, j, x, y: surfaceY(x) - hopY, rot: e >= 1 ? Math.sin(t * 6.2 + j * 1.7) * 9 : -6, hidden: false, dance: e >= 1 ? 1 : 0, cup: e >= 1 ? acid : 0, hat: true, knock: k};
  }).filter((g): g is NonNullable<typeof g> => !!g && !g.hidden && g.knock < 1);

  // ---- the boss: he waits in the gap beside the tooth, climbs up for the party, and joins the fight
  const boss = (() => {
    if (fighting) {
      if (inCloud) return null;
      const r = clamp01(rout / 0.9);
      const x = rout > 0 ? lerp(640, BOSS.lurk[0], r) : lerp(BOSS.lurk[0], 640, rush);
      const y = rout > 0 ? lerp(surfaceY(640) - BOSS.up, BOSS.lurk[1], r) - Math.sin(Math.PI * r) * 340 : lerp(BOSS.lurk[1], surfaceY(640) - BOSS.up, clamp01(rush * 2.2));
      return knock(x) >= 1 ? null : {x, y, rot: rout > 0 ? r * 360 : 0, knock: knock(x), hat: false, hop: 0};
    }
    const p = io(party);
    if (p <= 0) return knock(BOSS.lurk[0]) >= 1 ? null : {x: BOSS.lurk[0], y: BOSS.lurk[1], rot: 0, knock: knock(BOSS.lurk[0]), hat: false, hop: 0};
    const climb = clamp01(p / 0.22);
    const walk = clamp01((p - 0.22) / 0.78);
    const x = climb < 1 ? lerp(BOSS.lurk[0], BOSS.shoulder, climb) : lerp(BOSS.shoulder, BOSS.dance, walk);
    const y = climb < 1 ? lerp(BOSS.lurk[1], surfaceY(BOSS.shoulder) - BOSS.up, climb) : surfaceY(x) - BOSS.up;
    return knock(x) >= 1 ? null : {x, y, rot: 0, knock: knock(x), hat: p > 0.3, hop: p >= 1 ? Math.abs(Math.sin(t * 6.2)) * 22 : 0};
  })();

  // ---- what is left on the tooth: dinner at bedtime, a little mess after the fight until the spit washes over it
  const front = lerp(40, 1090, wash);
  const snack = st('snack'); // a snack by day: a few crumbs land on the tooth (and the fight leaves a little mess of its own)
  const debris = [430, 548, 672].map((x, i) => { const on = fight >= 0.72 ? 1 : io(clamp01(snack * 1.5 - i * 0.2)); return {i, x, y: lerp(-70 - i * 40, surfaceY(x) - 10, on), show: on > 0 && !(wash > 0 && front > x + 30)}; });
  const bits = [318, 392, 456, 520, 586, 648, 716, 772, 838].map((x, i) => {
    const on = clamp01((sugar - i * 0.07) / 0.4);
    if (on <= 0) return null;
    const r = [22, 17, 26, 19, 24, 17, 22, 26, 18][i] * (1 - 0.45 * party);
    const k = knock(x);
    return k >= 1 ? null : {i, x, y: lerp(-80 - i * 46, surfaceY(x) - r * 0.6, on * on), r, knock: k};
  }).filter((b): b is NonNullable<typeof b> => !!b);
  // ---- acid: a pond in the groove and runs down both shoulders (outside the face's room), a chalky patch under each
  const pond = acid > 0.02 ? 718 - 34 * acid : null;
  const runs = [[150, 1], [930, 0.8]].map(([x, k], i) => ({i, x, y0: surfaceY(x) + 6, len: 330 * k * clamp01((acid - 0.45) / 0.55)})).filter((r) => r.len > 4);
  const patches = [[908, 884, 88, 96], [172, 884, 84, 92]].map(([x, y, rx, ry], i) => ({i, x, y, rx: rx * clamp01(chalk * 1.4 - i * 0.3), ry: ry * clamp01(chalk * 1.4 - i * 0.3)})).filter((p) => p.rx > 6);
  return {night, guards, sleep, sugar, wash, fight, party, acid, chalk, brush, shield, bx, knock, cloud, rout, fighting, guard, gang, boss, front, debris, bits, pond, runs, patches};
};

/** Where the stage's two characters are (for graphics and the head check): the tooth stays, the boss germ moves. */
export const arenaSpotsAt = (state: Record<string, number> = {}) => {
  const L = arenaLayout(state, 0);
  return {tooth: ARENA_SPOTS.tooth, bacteria: L.boss && L.boss.knock < 0.3 ? {...ARENA_SPOTS.bacteria, x: L.boss.x, y: L.boss.y} : null};
};
/** For the staging check: each face's room, and what is drawn in front of the stage that could come into it. */
export const arenaThings = (state: Record<string, number> = {}, t = 0) => {
  const L = arenaLayout(state, t);
  const R = ARENA.room;
  const faces = [{who: 'tooth', dry: true, x0: ARENA.face[0] - R.side, y0: ARENA.face[1] - R.up, x1: ARENA.face[0] + R.side, y1: ARENA.face[1] + R.down}];
  // a character that has gone INTO the fight cloud is in the fight: the cloud is meant to cover it
  if (L.boss && L.boss.knock <= 0 && L.cloud <= 0.05) faces.push({who: 'bacteria', dry: true, x0: L.boss.x - ARENA.germRoom.side, y0: L.boss.y - ARENA.germRoom.up, x1: L.boss.x + ARENA.germRoom.side, y1: L.boss.y + ARENA.germRoom.down});
  const things: {id: string; only?: string; x0: number; y0: number; x1: number; y1: number}[] = [
    // on the tooth itself, so they matter for the tooth's face only (the boss germ walks in front of them)
    ...L.runs.map((r) => ({id: `acid run ${r.i + 1}`, only: 'tooth', x0: r.x - 20, y0: r.y0, x1: r.x + 20, y1: r.y0 + r.len + 14})),
    ...L.patches.map((p) => ({id: `chalky patch ${p.i + 1}`, only: 'tooth', x0: p.x - p.rx, y0: p.y - p.ry, x1: p.x + p.rx, y1: p.y + p.ry})),
    ...(L.brush > 0.005 && L.brush < 0.995 ? [{id: 'the brush', x0: L.bx - 270, y0: surfaceY(L.bx) - 300, x1: L.bx + 270, y1: surfaceY(L.bx) + 6}] : []),
    ...(L.cloud > 0.05 ? [{id: 'the fight cloud', x0: 560 - 370 * L.cloud, y0: 580 - 310 * L.cloud, x1: 560 + 370 * L.cloud, y1: 580 + 190 * L.cloud}] : []),
  ];
  return {faces, things};
};

// ------------------------------------------------------------------ the crew
const Eyes: React.FC<{x: number; y: number; gap: number; r: number; shut?: boolean; look?: number; dark?: string}> = ({x, y, gap, r, shut, look = 0, dark = '#1d2b4f'}) => (
  <g>
    {[-1, 1].map((sd) => shut
      ? <path key={sd} d={`M${x + sd * gap - r} ${y} Q${x + sd * gap} ${y + r * 0.7} ${x + sd * gap + r} ${y}`} fill="none" stroke={dark} strokeWidth={3} strokeLinecap="round" />
      : <g key={sd}><circle cx={x + sd * gap} cy={y} r={r} fill="#ffffff" stroke={dark} strokeWidth={1.6} /><circle cx={x + sd * gap + look * r * 0.35} cy={y + r * 0.1} r={r * 0.52} fill={dark} /><circle cx={x + sd * gap + look * r * 0.35 - r * 0.18} cy={y - r * 0.16} r={r * 0.17} fill="#ffffff" /></g>)}
  </g>
);

/** A spit guard: a drop of spit with a helmet and a shield that says what it is. Feet at (0, 0). */
const Guard: React.FC<{g: NonNullable<ReturnType<typeof arenaLayout>['guard'][number]>; t: number; night: number}> = ({g, t, night}) => {
  const lean = g.fall * 84 * g.side;
  const breathe = g.asleep ? 1 + Math.sin(t * 2.2 + g.i) * 0.03 : 1;
  const stretch = 1 + g.yawn * 0.08;
  const brave = g.cheer > 0.2 && g.fall <= 0;
  return (
    <g transform={`translate(${g.x.toFixed(1)} ${g.y.toFixed(1)})`}>
      {!g.air && <ellipse cx={lean * 0.7} cy={5} rx={46 + g.fall * 30} ry={8} fill="#1d1430" opacity={0.26} />}
      <g transform={`rotate(${lean.toFixed(1)}) scale(${(g.on * breathe * 1.16).toFixed(3)} ${(g.on * stretch * 1.16).toFixed(3)})`}>
        {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 17} cy={-2} rx={14} ry={8} fill="#2b6fb5" stroke="#1d4f86" strokeWidth={1.6} />)}
        <path d="M0 -130 C30 -98 46 -72 46 -47 A46 46 0 1 1 -46 -47 C-46 -72 -30 -98 0 -130 Z" fill={`url(#arDrop)`} stroke="#2f7fc9" strokeWidth={LW} />
        <path d="M-27 -58 C-27 -82 -14 -98 -3 -110" fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.75} />
        {/* the helmet and its crest */}
        <path d="M-33 -86 Q-30 -132 0 -138 Q30 -132 33 -86 Q0 -100 -33 -86 Z" fill="#e7edf6" stroke="#8e9db5" strokeWidth={2.2} />
        <path d="M-6 -136 Q0 -162 10 -150 Q6 -142 8 -134 Z" fill="#ff6b6b" stroke="#c23b3b" strokeWidth={1.8} />
        <path d="M-24 -98 Q0 -108 24 -98" fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" opacity={0.8} />
        <Eyes x={2} y={-62} gap={15} r={10} shut={g.fall > 0.2 || g.yawn > 0.5} look={g.side * -0.6} />
        {brave && <path d="M-26 -78 L-6 -71 M30 -78 L10 -71" stroke="#1d2b4f" strokeWidth={3.4} strokeLinecap="round" />}
        {g.yawn > 0.15 ? <ellipse cx={2} cy={-36} rx={7 + g.yawn * 5} ry={5 + g.yawn * 11} fill="#1d2b4f" /> : g.fall > 0.2 ? <path d="M-6 -36 Q2 -32 10 -36" fill="none" stroke="#1d2b4f" strokeWidth={3} strokeLinecap="round" /> : <path d={brave ? 'M-10 -40 Q2 -24 14 -40 Z' : 'M-9 -38 Q2 -28 13 -38'} fill={brave ? '#1d2b4f' : 'none'} stroke="#1d2b4f" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />}
        {/* the shield: it says what this little character is */}
        <g transform={`translate(${-g.side * 44} ${brave ? -74 - Math.abs(Math.sin(t * 7 + g.i)) * 10 : -46}) rotate(${-g.side * 6})`}>
          <circle r={33} fill="#f6faff" stroke="#2f7fc9" strokeWidth={5} />
          <circle r={24} fill="none" stroke="#bfe0ff" strokeWidth={2} />
          <text x={0} y={6} textAnchor="middle" fontFamily={theme.font} fontWeight={900} fontSize={17} fill="#1f5fa3" letterSpacing={0.5}>SPIT</text>
        </g>
        <path d={`M${g.side * 40} -52 q${g.side * 16} ${brave ? -26 : 8} ${g.side * 24} ${brave ? -44 : 14}`} fill="none" stroke="#4aa8f0" strokeWidth={9} strokeLinecap="round" />
      </g>
      {g.asleep && [0, 1, 2].map((z) => { const life = wrap(t * 0.5 + z * 0.33 + g.i * 0.21, 1); return <text key={z} x={g.side * (70 + life * 46)} y={-70 - life * 110} fontFamily={theme.font} fontWeight={900} fontSize={22 + life * 20} fill={night > 0.5 ? '#dfe9ff' : '#ffffff'} opacity={0.9 * Math.sin(Math.PI * life)}>z</text>; })}
    </g>
  );
};

/** One of the gang: four germs that look nothing like each other. Feet at (0, 0). `cup` tips the acid out. */
const Germ: React.FC<{g: NonNullable<ReturnType<typeof arenaLayout>['gang'][number]>; t: number}> = ({g, t}) => {
  const k = g.knock;
  const fly = k > 0 ? `translate(${(k * 420).toFixed(1)} ${(-k * 620 + k * k * 820).toFixed(1)}) rotate(${(k * 300).toFixed(0)})` : undefined;
  const tip = clamp01(g.cup * 1.6 - g.j * 0.12);
  const eye = '#2a2440';
  const body = () => {
    if (g.kind === 'rod') return (
      <g>
        <rect x={-37} y={-152} width={74} height={150} rx={37} fill={g.col} stroke={g.line} strokeWidth={LW} />
        <path d="M-20 -128 Q-24 -80 -18 -40" fill="none" stroke="#ffffff" strokeWidth={9} strokeLinecap="round" opacity={0.5} />
        <Eyes x={2} y={-104} gap={14} r={10} look={-0.5} dark={eye} />
        <path d="M-14 -76 Q2 -56 18 -76 Z" fill={eye} />
      </g>
    );
    if (g.kind === 'spiky') return (
      <g>
        {Array.from({length: 11}).map((_, i) => { const a = (i / 11) * Math.PI * 2 + 0.3; return <path key={i} d={`M${(Math.cos(a - 0.2) * 46).toFixed(1)} ${(-58 + Math.sin(a - 0.2) * 46).toFixed(1)} L${(Math.cos(a) * 70).toFixed(1)} ${(-58 + Math.sin(a) * 70).toFixed(1)} L${(Math.cos(a + 0.2) * 46).toFixed(1)} ${(-58 + Math.sin(a + 0.2) * 46).toFixed(1)} Z`} fill={g.col} stroke={g.line} strokeWidth={2.4} strokeLinejoin="round" />; })}
        <circle cx={0} cy={-58} r={50} fill={g.col} stroke={g.line} strokeWidth={LW} />
        <path d="M-30 -74 Q-26 -94 -8 -100" fill="none" stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.55} />
        <Eyes x={2} y={-64} gap={17} r={11} look={-0.5} dark={eye} />
        <path d="M-18 -42 Q2 -22 22 -42 Z" fill={eye} />
      </g>
    );
    if (g.kind === 'twins') return (
      <g>
        {[-1, 1].map((sd) => (
          <g key={sd} transform={`translate(${sd * 31} ${sd > 0 ? -4 : 0})`}>
            <circle cx={0} cy={-42} r={40} fill={g.col} stroke={g.line} strokeWidth={LW} />
            <path d="M-22 -54 Q-18 -70 -6 -74" fill="none" stroke="#ffffff" strokeWidth={7} strokeLinecap="round" opacity={0.55} />
            <Eyes x={0} y={-48} gap={11} r={8} look={-sd * 0.5} dark={eye} />
            <path d="M-10 -30 Q0 -18 10 -30" fill="none" stroke={eye} strokeWidth={3} strokeLinecap="round" />
          </g>
        ))}
      </g>
    );
    return (
      <g>
        <circle cx={0} cy={-34} r={32} fill={g.col} stroke={g.line} strokeWidth={LW} />
        <path d="M-17 -44 Q-14 -56 -4 -60" fill="none" stroke="#ffffff" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
        <Eyes x={1} y={-40} gap={10} r={8} look={-0.5} dark={eye} />
        <path d="M-13 -24 Q1 -6 15 -24 Z" fill={eye} />
      </g>
    );
  };
  const top = g.kind === 'rod' ? -152 : g.kind === 'spiky' ? -112 : g.kind === 'twins' ? -84 : -68;
  const side = g.kind === 'twins' ? 76 : g.kind === 'spiky' ? 62 : g.kind === 'rod' ? 44 : 38;
  return (
    <g transform={fly} opacity={1 - k * k}>
      <g transform={`translate(${g.x.toFixed(1)} ${g.y.toFixed(1)})`}>
        <ellipse cx={0} cy={5 + (surfaceY(g.x) - g.y)} rx={side} ry={8} fill="#1d1430" opacity={0.24} />
        <g transform={`rotate(${g.rot.toFixed(1)} 0 -50)`}>
          {[-1, 1].map((sd) => <path key={sd} d={`M${sd * 14} -6 q${sd * 4} 6 ${sd * 12} 6`} fill="none" stroke={g.line} strokeWidth={6} strokeLinecap="round" />)}
          {body()}
          {g.hat && (
            <g transform={`translate(${g.kind === 'twins' ? -31 : 0} ${top}) rotate(-12)`}>
              <path d="M-22 4 L0 -52 L22 4 Z" fill="#ff5fa2" stroke="#c22d6f" strokeWidth={2.4} strokeLinejoin="round" />
              <path d="M-13 -18 L13 -18 M-18 -4 L18 -4" stroke="#ffe45f" strokeWidth={5} />
              <circle cx={0} cy={-54} r={8} fill="#ffe45f" stroke="#c79d1f" strokeWidth={2} />
            </g>
          )}
          {/* the cup: it tips, and what pours out is acid */}
          {g.dance > 0 && (
            <g transform={`translate(${side + 6} -58) rotate(${(tip * 112).toFixed(0)})`}>
              <path d={`M${-side * 0.2 - 8} 12 q10 -6 ${side * 0.2 + 2} -2`} fill="none" stroke={g.line} strokeWidth={7} strokeLinecap="round" />
              <path d="M-15 -20 H15 L10 14 H-10 Z" fill="#fdf6e6" stroke="#b9a37a" strokeWidth={2.4} strokeLinejoin="round" />
              <path d="M-13 -12 H13 L11 2 H-11 Z" fill={ACID} opacity={1 - tip * 0.8} />
            </g>
          )}
        </g>
        {tip > 0.3 && <path d={`M${side + 26} -62 Q${side + 44} ${-20} ${side + 30 + Math.sin(t * 9 + g.j) * 4} ${surfaceY(g.x + side + 30) - g.y}`} fill="none" stroke={ACID} strokeWidth={9 * clamp01((tip - 0.3) * 3)} strokeLinecap="round" opacity={0.9} />}
      </g>
    </g>
  );
};

// ------------------------------------------------------------------ the stage
export const ToothArenaStage: React.FC<Props> = ({t, state = {}, faces = {}, label}) => {
  const L = arenaLayout(state, t);
  const {night, party, acid, shield, brush, bx} = L;
  const me = faces.tooth ?? REST;
  const germ = faces.bacteria ?? REST;
  const uid = useId().replace(/:/g, '');
  const crown = `${spline(CROWN, false, 0.4)} Z`;
  const crownIn = `${spline(CROWN_IN, false, 0.4)} Z`;
  const top = spline(TOP, false, 0.4);
  const beat = Math.abs(Math.sin(t * 6.2));
  const mix = (a: string, b: string, k: number) => { const h = (s: string, i: number) => parseInt(s.slice(1 + i * 2, 3 + i * 2), 16); return `rgb(${[0, 1, 2].map((i) => Math.round(lerp(h(a, i), h(b, i), k))).join(',')})`; };

  return (
    <AbsoluteFill style={{background: '#3a1630'}}>
      <Canvas>
        <defs>
          <radialGradient id={`arBack${uid}`} cx="0.5" cy="0.34" r="0.95"><stop offset="0" stopColor={mix('#b0506a', '#34408f', night)} /><stop offset="0.55" stopColor={mix('#6c2742', '#1c2260', night)} /><stop offset="1" stopColor={mix('#3d1428', '#0d1036', night)} /></radialGradient>
          <linearGradient id="arEnamel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="0.55" stopColor="#fffdf6" /><stop offset="1" stopColor="#e2dccc" /></linearGradient>
          <linearGradient id="arDentine" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fdf0cc" /><stop offset="1" stopColor="#ecd099" /></linearGradient>
          <linearGradient id="arGum" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f892a2" /><stop offset="0.5" stopColor="#e8707f" /><stop offset="1" stopColor="#b9475a" /></linearGradient>
          <linearGradient id="arUpper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={mix('#d9c9c4', '#8f95c9', night)} /><stop offset="1" stopColor={mix('#f3e9df', '#b9c0ea', night)} /></linearGradient>
          <linearGradient id="arDrop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b9e6ff" /><stop offset="1" stopColor="#4aa8f0" /></linearGradient>
          <linearGradient id="arAcid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d6f36a" /><stop offset="1" stopColor="#9cc832" /></linearGradient>
          <clipPath id="arCrown"><path d={crown} /></clipPath>
          <clipPath id="arAbove"><path d={`${top} L984 -400 L96 -400 Z`} /></clipPath>
        </defs>

        {/* the mouth behind: warm in the evening, deep blue at night */}
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill={`url(#arBack${uid})`} />
        {[[160, 560, 300, 150], [930, 540, 320, 160], [540, 470, 380, 120]].map(([x, y, rx, ry], i) => <path key={i} d={blob(rx, ry, `arb${i}`, 10, 0.1, x, y)} fill={mix('#8a3350', '#27308a', night)} opacity={0.35} />)}
        {/* the upper teeth: the roof of this little world */}
        <path d="M-300 -300 H1380 V96 Q540 150 -300 96 Z" fill="url(#arGum)" opacity={0.9} />
        {[[-40, 300, 320], [380, 346, 320], [800, 300, 320]].map(([x, y, w], i) => <path key={i} d={`M${x} 60 V${y - 70} Q${x} ${y} ${x + w * 0.24} ${y} Q${x + w * 0.5} ${y - 34} ${x + w * 0.76} ${y} Q${x + w} ${y} ${x + w} ${y - 70} V60 Z`} fill="url(#arUpper)" stroke={mix('#b9a79f', '#6c73b0', night)} strokeWidth={LW} opacity={0.92} />)}
        {night > 0.02 && (
          <g opacity={night}>
            {[[70, 430, 13], [250, 560, 10], [1010, 470, 12], [860, 420, 9], [720, 560, 8], [330, 420, 9]].map(([x, y, r], i) => <path key={i} d={star4(x, y, r * (0.7 + 0.3 * Math.sin(t * 2.2 + i * 1.9)))} fill="#fff6c9" opacity={0.9} />)}
            <g transform="translate(150 470)"><circle r={74} fill="#fff3b0" opacity={0.14} /><path d="M18 -50 A54 54 0 1 0 50 24 A42 42 0 1 1 18 -50 Z" fill="#fff3b0" stroke="#d9c46a" strokeWidth={3} /></g>
          </g>
        )}
        {/* the party: a mirror ball from the roof, coloured light on the floor, music in the air */}
        {party > 0.05 && (
          <g opacity={clamp01(party * 1.6)}>
            {[['#ff5fa2', 0], ['#5fd4ff', 2.1], ['#ffe45f', 4.2]].map(([c, ph], i) => { const x = 540 + Math.sin(t * 1.3 + Number(ph)) * 330; return <path key={i} d={`M532 446 L548 446 L${x + 130} ${surfaceY(x) + 6} L${x - 130} ${surfaceY(x) + 6} Z`} fill={String(c)} opacity={0.2 + 0.07 * beat} />; })}
            <path d={`M540 346 V${396 + (1 - clamp01(party * 2)) * -60}`} stroke="#cfd6ea" strokeWidth={4} />
            <g transform={`translate(540 ${446 - (1 - clamp01(party * 2)) * 60}) rotate(${(t * 40) % 360})`}>
              <circle r={50} fill="#dfe6f7" stroke="#8e9db5" strokeWidth={LW} />
              {[-30, -10, 10, 30].map((y) => <path key={y} d={`M${-Math.sqrt(2500 - y * y)} ${y} H${Math.sqrt(2500 - y * y)}`} stroke="#a9b6d2" strokeWidth={2} />)}
              {[-30, -10, 10, 30].map((x) => <path key={`v${x}`} d={`M${x} ${-Math.sqrt(2500 - x * x)} V${Math.sqrt(2500 - x * x)}`} stroke="#a9b6d2" strokeWidth={2} />)}
              <path d={star4(-18, -20, 14)} fill="#ffffff" />
            </g>
            {[0, 1, 2, 3, 4].map((i) => { const life = wrap(t * 0.42 + i * 0.2, 1); const x = 430 + i * 96 + Math.sin(t * 2 + i) * 16; const y = 600 - life * 170; return <g key={i} transform={`translate(${x} ${y}) rotate(${Math.sin(t * 3 + i) * 14})`} opacity={Math.sin(Math.PI * life) * 0.95}><ellipse cx={-8} cy={10} rx={11} ry={8} fill="#ffffff" /><path d="M2 10 V-26 Q16 -24 20 -12" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" /></g>; })}
          </g>
        )}

        {/* the neighbours and the gum the tooth sits in */}
        {[-1, 1].map((sd) => <path key={sd} transform={sd < 0 ? undefined : `translate(${W} 0) scale(-1 1)`} d="M-260 1700 V820 Q-250 690 -150 668 Q-50 654 14 720 Q40 760 40 880 V1700 Z" fill="url(#arEnamel)" stroke="#a89f8a" strokeWidth={LW} />)}
        <path d={crown} fill="url(#arEnamel)" stroke="#a89f8a" strokeWidth={LW} />
        <path d={crownIn} fill="url(#arDentine)" stroke="#d6b77a" strokeWidth={2.2} />
        <path d={stipplePath([140, 860, 940, 1500], 'ardent', 150, 0.1, [2, 4.4])} fill="#dcb877" opacity={0.28} clipPath="url(#arCrown)" />
        <path d="M92 1040 Q84 900 104 812" fill="none" stroke="#ffffff" strokeWidth={15} strokeLinecap="round" opacity={0.85} />
        <path d={spline(TOP.slice(3, 9), false, 0.4)} fill="none" stroke="#ffffff" strokeWidth={9} strokeLinecap="round" opacity={0.8} transform="translate(0 12)" />

        {/* a chalky patch: the enamel has lost minerals */}
        {L.patches.map((p) => (
          <g key={p.i} clipPath="url(#arCrown)">
            <path d={blob(p.rx, p.ry, `arch${p.i}`, 10, 0.14, p.x, p.y)} fill="#d9d2bd" stroke="#8f8770" strokeWidth={3.4} strokeDasharray="12 8" />
            <path d={blob(p.rx * 0.62, p.ry * 0.6, `arch2${p.i}`, 9, 0.16, p.x - 6, p.y - 8)} fill="#eee9da" opacity={0.75} />
            <path d={stipplePath([p.x - p.rx, p.y - p.ry, p.x + p.rx, p.y + p.ry], `arcs${p.i}`, 60, 0.1, [2.4, 6])} fill="#a39a82" opacity={0.75} />
            {p.rx > 50 && <path d={`M${p.x - 34} ${p.y - 40} l22 26 l-14 18 l26 24 l-10 20`} fill="none" stroke="#7d755f" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />}
          </g>
        ))}
        {/* fluoride: a bright coat along the top */}
        {shield > 0.01 && (
          <g opacity={shield}>
            <path d={top} fill="none" stroke="#2ec4b6" strokeWidth={24} strokeLinecap="round" opacity={0.3} />
            <path d={top} fill="none" stroke="#7ff0e2" strokeWidth={9} strokeLinecap="round" opacity={0.9} />
            {[[120, 700], [300, 606], [540, 668], [780, 606], [960, 700], [70, 960], [1010, 960]].map(([x, y], i) => <path key={i} d={star4(x, y, (22 + (i % 3) * 9) * (0.7 + 0.3 * Math.sin(t * 4 + i * 1.7)))} fill="#ffffff" stroke="#2ec4b6" strokeWidth={2} />)}
          </g>
        )}
        {/* acid running down the shoulders, outside the face's room */}
        {L.runs.map((r) => <path key={r.i} d={`M${r.x - 13} ${r.y0} Q${r.x - 17} ${r.y0 + r.len / 2} ${r.x - 14} ${r.y0 + r.len} A14 14 0 0 0 ${r.x + 14} ${r.y0 + r.len} Q${r.x + 17} ${r.y0 + r.len / 2} ${r.x + 13} ${r.y0} Z`} fill="url(#arAcid)" stroke={ACID_LINE} strokeWidth={2.4} />)}

        {/* the gum, in front of the tooth's foot */}
        <path d="M-300 1300 C-160 1190 -20 1170 60 1196 C150 1228 210 1360 330 1440 C440 1500 640 1500 750 1440 C870 1360 930 1228 1020 1196 C1100 1170 1240 1190 1380 1300 V2300 H-300 Z" fill="url(#arGum)" stroke={STYLE.fleshLine} strokeWidth={LW} />
        <path d="M-200 1260 C-100 1200 -10 1190 54 1214 C140 1250 204 1378 326 1456 C440 1516 640 1516 754 1456 C876 1378 940 1250 1026 1214" fill="none" stroke="#ffc9cf" strokeWidth={10} strokeLinecap="round" opacity={0.7} />
        <path d={stipplePath([-40, 1300, W + 40, H + 40], 'argum', 260, 0.1, [3, 9])} fill="#c9566a" opacity={0.22} />
        {[[200, 1640, 220, 60], [760, 1720, 260, 70], [520, 1840, 300, 60]].map(([x, y, rx, ry], i) => <path key={i} d={blob(rx, ry, `argl${i}`, 9, 0.12, x, y)} fill="#ffb0ba" opacity={0.22} />)}
        <path d="M-300 1560 Q260 1500 540 1580 Q820 1500 1380 1560" fill="none" stroke="#c9566a" strokeWidth={9} strokeLinecap="round" opacity={0.2} />

        {/* the tooth's own face and hands */}
        <g transform={`translate(${ARENA.face[0]} ${ARENA.face[1] + me.nod * 12}) rotate(${me.lean * 0.5})`}>
          <Scaled s={ARENA.K}>
            <g transform={`scale(${1 + me.squash * 0.08} ${1 - me.squash * 0.08})`}>
              {me.arms && ([0, 1] as const).map((i) => <Arm key={i} x={i ? 30 : -30} y={30} spec={me.arms![i]} color="#efd9a6" len={22} />)}
              <Face emotion={me.emotion} talk={me.talk} blink={me.blink} look={me.look} size={1.04} skin="#f7e3b4" iris="#2f86b0" />
            </g>
          </Scaled>
        </g>

        {/* ---- everything that happens on top of the tooth */}
        {L.pond !== null && ((pond: number) => (
          <g clipPath="url(#arAbove)">
            <path d={`M96 ${pond + Math.sin(t * 3) * 3} ${Array.from({length: 16}, (_, i) => `L${96 + i * 59.2} ${(pond + Math.sin(i * 0.9 + t * 3) * 3).toFixed(1)}`).join(' ')} L984 900 L96 900 Z`} fill="url(#arAcid)" stroke={ACID_LINE} strokeWidth={2.4} opacity={0.94} />
            {Array.from({length: 9}).map((_, i) => { const life = wrap(t * 0.9 + random(`arz${i}`), 1); return <circle key={i} cx={420 + random(`arx${i}`) * 240} cy={pond - life * 70} r={4 + random(`arr${i}`) * 6} fill="none" stroke="#efffb0" strokeWidth={2.4} opacity={(1 - life) * clamp01(acid * 2)} />; })}
          </g>
        ))(L.pond)}
        {L.debris.filter((d) => d.show).map((d) => <path key={d.i} d={blob(26, 9, `ard${d.i}`, 8, 0.2, d.x, d.y)} fill={d.i % 2 ? '#d9a05b' : ACID} stroke={d.i % 2 ? '#8f6230' : ACID_LINE} strokeWidth={2.2} />)}
        {L.bits.map((b) => (
          <g key={b.i} transform={b.knock > 0 ? `translate(${(b.knock * 380).toFixed(1)} ${(-b.knock * 560 + b.knock * b.knock * 760).toFixed(1)})` : undefined} opacity={1 - b.knock * b.knock}>
            <path d={blob(b.r, b.r * 0.72, `arbit${b.i}`, 8, 0.18, b.x, b.y, b.i * 31)} fill={['#d9a05b', '#ffffff', '#e2574c', '#7ac96b', '#ffd166', '#f2c9a0', '#d9a05b', '#ffffff', '#e2574c'][b.i]} stroke={['#8f6230', '#b9c6d8', '#96302a', '#3f8a3a', '#b98a1e', '#b58a5c', '#8f6230', '#b9c6d8', '#96302a'][b.i]} strokeWidth={2.2} />
          </g>
        ))}
        {/* the spit washing over the top */}
        {L.wash > 0.01 && L.wash < 0.99 && (
          <g clipPath="url(#arAbove)" opacity={Math.min(1, (1 - L.wash) * 8)}>
            {TOP.filter(([x]) => x < L.front).length > 2 && <path d={spline(TOP.filter(([x]) => x < L.front), false, 0.4)} fill="none" stroke="#bfe6ff" strokeWidth={16} strokeLinecap="round" opacity={0.7} transform="translate(0 -6)" />}
            <g transform={`translate(${L.front.toFixed(1)} ${surfaceY(L.front).toFixed(1)})`}>
              <path d="M-210 8 C-170 -40 -110 -100 -30 -112 C28 -120 70 -92 66 -56 C63 -34 40 -26 28 -40 C34 -60 12 -70 -4 -56 C-26 -36 -12 -4 26 8 Z" fill="url(#arDrop)" stroke="#2f7fc9" strokeWidth={LW} opacity={0.96} />
              <path d="M-150 -18 C-110 -66 -60 -92 -16 -94" fill="none" stroke="#ffffff" strokeWidth={9} strokeLinecap="round" opacity={0.7} />
              {[[-10, -118, 10], [34, -122, 8], [62, -96, 7], [-56, -104, 8]].map(([x, y, r], i) => <circle key={i} cx={x + Math.sin(t * 9 + i) * 4} cy={y} r={r} fill="#ffffff" stroke="#bfe3ff" strokeWidth={2} />)}
            </g>
          </g>
        )}
        {L.guard.filter((g) => !g.hidden).map((g) => <Guard key={g.i} g={g} t={t} night={night} />)}
        {L.gang.map((g) => <Germ key={g.j} g={g} t={t} />)}
        {/* the boss germ: the one who talks */}
        {L.boss && (
          <g transform={L.boss.knock > 0 ? `translate(${(L.boss.knock * 420).toFixed(1)} ${(-L.boss.knock * 620 + L.boss.knock ** 2 * 820).toFixed(1)}) rotate(${(L.boss.knock * 300).toFixed(0)})` : undefined} opacity={1 - L.boss.knock ** 2}>
            <g transform={`translate(${L.boss.x.toFixed(1)} ${(L.boss.y - L.boss.hop + germ.nod * 6).toFixed(1)}) rotate(${(L.boss.rot + germ.lean * 0.8).toFixed(1)})`}>
              <Scaled s={ARENA.germK}>
                <g transform={`scale(${1 + germ.squash * 0.1} ${1 - germ.squash * 0.1})`}>
                  {[[-40, 20, -62, 44], [40, 22, 64, 40], [-8, 44, -14, 66]].map(([x1, y1, x2, y2], i) => <path key={i} d={`M${x1} ${y1} Q${(x1 + x2) / 2 + Math.sin(t * 6 + i) * 6} ${(y1 + y2) / 2 + 8} ${x2} ${y2}`} fill="none" stroke="#3f8a2c" strokeWidth={2.2} strokeLinecap="round" />)}
                  {germ.arms && ([0, 1] as const).map((i) => <Arm key={i} x={i ? 40 : -40} y={12} spec={germ.arms![i]} color={GERM} len={24} />)}
                  <path d={blob(46, 42, 'argerm', 11, 0.1)} fill={GERM} stroke="#3f8a2c" strokeWidth={1.6} />
                  <path d={blob(28, 20, 'argermh', 8, 0.1, -10, -16)} fill="#c9f0a8" opacity={0.6} />
                  <g transform="translate(0 -2)"><Face emotion={germ.emotion} talk={germ.talk} blink={germ.blink} look={germ.look} size={0.92} skin={GERM} iris="#2f7d32" /></g>
                  {L.boss.hat && <g transform="translate(4 -40) rotate(10)"><path d="M-14 4 L0 -34 L14 4 Z" fill="#ff5fa2" stroke="#c22d6f" strokeWidth={1.4} strokeLinejoin="round" /><circle cx={0} cy={-36} r={5} fill="#ffe45f" /></g>}
                </g>
              </Scaled>
            </g>
          </g>
        )}
        {/* the fight: one big cloud, and only bits of the two sides to be seen in it */}
        {L.cloud > 0.03 && (
          <g transform={`translate(560 580) scale(${(L.cloud * 1.5).toFixed(3)})`}>
            {Array.from({length: 11}).map((_, i) => { const a = (i / 11) * Math.PI * 2 + t * 1.4; const d = 120 + Math.sin(t * 7 + i * 2.3) * 26; return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d * 0.62} r={78 + Math.sin(t * 9 + i) * 12} fill="#f6efe8" stroke="#bfae9f" strokeWidth={LW} />; })}
            <circle r={150} fill="#f6efe8" />
            {[[-150, -120, 30], [170, -90, 26], [-40, -170, 22], [120, 70, 24], [-170, 40, 20]].map(([x, y, r], i) => <path key={i} d={star4(x + Math.sin(t * 13 + i) * 14, y + Math.cos(t * 11 + i) * 12, r * (0.6 + 0.4 * Math.abs(Math.sin(t * 10 + i))))} fill="#ffd23c" stroke="#b9772a" strokeWidth={3} />)}
            {/* a shield, a crest, a green foot, a purple arm: who is winning is anybody's guess */}
            <g transform={`translate(${-120 + Math.sin(t * 12) * 30} ${-40 + Math.cos(t * 10) * 26}) rotate(${Math.sin(t * 9) * 40})`}><circle r={30} fill="#f6faff" stroke="#2f7fc9" strokeWidth={5} /></g>
            <path transform={`translate(${60 + Math.cos(t * 11) * 34} ${-110 + Math.sin(t * 13) * 20}) rotate(${Math.sin(t * 8) * 50})`} d="M-6 0 Q0 -30 12 -14 Q8 -6 10 2 Z" fill="#ff6b6b" stroke="#c23b3b" strokeWidth={2} />
            <path transform={`translate(${130 + Math.sin(t * 9) * 26} ${30 + Math.cos(t * 12) * 24}) rotate(${t * 300})`} d="M0 0 q20 -6 34 8 q-6 12 -20 10 Z" fill={GERM} stroke="#3f8a2c" strokeWidth={2.4} />
            <path transform={`translate(${-60 + Math.cos(t * 10) * 30} ${80 + Math.sin(t * 14) * 14}) rotate(${-t * 260})`} d="M0 0 q26 -4 40 6" fill="none" stroke="#b996f2" strokeWidth={12} strokeLinecap="round" />
            {[[-200, -30, 200], [210, 20, -20], [0, -200, 100]].map(([x, y, r], i) => <path key={`m${i}`} transform={`translate(${x} ${y}) rotate(${r})`} d="M-30 0 H30 M-20 -18 H16" stroke="#bfae9f" strokeWidth={7} strokeLinecap="round" opacity={0.5 + 0.5 * Math.sin(t * 16 + i)} />)}
          </g>
        )}
        {/* the brush from outside: as big as a snow plough */}
        {brush > 0.005 && brush < 0.995 && (
          <g>
            {Array.from({length: 22}).map((_, i) => { const x = 96 + i * 42; if (x > bx - 80) return null; const fade = 1 - clamp01((bx - x - 620) / 380); return <circle key={i} cx={x + Math.sin(t * 7 + i) * 5} cy={surfaceY(x) - 18 - random(`arf${i}`) * 34} r={16 + random(`arfr${i}`) * 18} fill="#ffffff" stroke="#bfe3ff" strokeWidth={2} opacity={0.92 * fade} />; })}
            <g transform={`translate(${bx.toFixed(1)} ${(surfaceY(bx) - 150 + Math.sin(t * 34) * 8).toFixed(1)}) rotate(-7) scale(1.5)`}>
              <path d="M-150 -34 H150 Q176 -34 176 -8 Q176 14 150 14 H-150 Q-176 14 -176 -8 Q-176 -34 -150 -34 Z" fill="#25a89c" stroke="#126e65" strokeWidth={LW} />
              <path d="M150 -30 Q420 -60 760 -300" fill="none" stroke="#126e65" strokeWidth={56 + LW * 2} strokeLinecap="round" />
              <path d="M150 -30 Q420 -60 760 -300" fill="none" stroke="#2ec4b6" strokeWidth={56} strokeLinecap="round" />
              <path d="M190 -44 Q420 -74 700 -268" fill="none" stroke="#9af0e6" strokeWidth={10} strokeLinecap="round" opacity={0.8} />
              {Array.from({length: 11}).map((_, i) => <rect key={i} x={-160 + i * 29} y={12} width={22} height={78} rx={9} fill="#ffffff" stroke="#9fb3c8" strokeWidth={2.2} />)}
              <path d={blob(150, 30, 'arpaste', 10, 0.14, 0, 94)} fill="#8fe3ff" stroke="#3aa9d6" strokeWidth={2.4} opacity={0.95} />
              <path d="M-110 90 Q0 76 110 92" fill="none" stroke="#ff6f9a" strokeWidth={7} strokeLinecap="round" opacity={0.9} />
            </g>
          </g>
        )}

        <defs>
          <radialGradient id="arLight" cx="0.5" cy="-0.05" r="0.7"><stop offset="0" stopColor="#fff3df" stopOpacity={(0.3 + 0.05 * Math.sin(t * 0.9)) * STYLE.glow} /><stop offset="1" stopColor="#fff3df" stopOpacity="0" /></radialGradient>
          <linearGradient id="arDown" x1="0" y1="0" x2="0" y2="1"><stop offset="0.8" stopColor="#3d1226" stopOpacity="0" /><stop offset="1" stopColor="#3d1226" stopOpacity="0.4" /></linearGradient>
        </defs>
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#arLight)" opacity={1 - night * 0.75} />
        <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#arDown)" />
        {night > 0.01 && <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#1b2a6b" opacity={0.17 * night * (1 - 0.5 * party)} style={{mixBlendMode: 'multiply'}} />}
      </Canvas>
      <div style={{position: 'absolute', left: 60, top: 150, background: STYLE.label, color: '#fff', fontFamily: theme.font, fontWeight: 900, fontSize: 40, padding: '10px 28px', borderRadius: 40, border: '3px solid #0f6f66', letterSpacing: 1, boxShadow: '0 8px 0 rgba(29,43,79,0.25)'}}>{label ?? 'TOOTH'}</div>
    </AbsoluteFill>
  );
};
