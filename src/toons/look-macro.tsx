/**
 * MedPeak Toons - MACRO SHOTS (owner, 2026-11-18: "when virus enter into body I want macro shot ... each video
 * 2 to 3 macro shots ... macro shot is my hero visual: start (hook 1), mid and last"). A macro is its own
 * detailed drawing of one tiny place, in the ink look and the reference palette, not a zoom on the wide shot.
 *
 * The three for rabies (look sheet, not approved yet):
 *   entry  - a saliva drop in the scratch, viruses inside it, the hero virus slipping in toward a nerve ending
 *   inside - inside one nerve fibre: the sheath in segments, the virus riding the fibre's inner tracks
 *   caught - the defenders' Y-shaped catchers gripping the virus by its spikes
 * Facts: saliva carries the virus into bites and scratches (WHO); it must reach the brain to cause symptoms
 * (CDC); treatment stops it before it reaches the central nervous system (WHO). The inner tracks are the
 * fibre's transport lines; we draw them, we do not name them.
 */
import React, {useId} from 'react';
import {AbsoluteFill, random} from 'remotion';
import {type P, spline} from './ink';
import {INK, InkEyes, lump, Tissue, wob} from './look-ink';

const W = 1080;
const H = 1920;
export const MACRO_PAL = {air: '#e1f7fb', skinTop: '#f6d0c2', skinCell: '#f2b8a8', skinCellDeep: '#e69d98', nucleus: '#cd6e68', dermis: '#e7867d', dermisDeep: '#cd6e68', collagen: '#f6b3aa', gap: '#924142', nerve: '#f6e3ce', nerveDeep: '#d9b98f', sheath: '#fbefd9', sheathDeep: '#e3c9a3', axon: '#fdf6ea', track: '#e3c9a3', saliva: '#dff2fa', salivaLine: '#9fc9dc', virus: '#9db57a', virusDeep: '#7f9a62', virusLight: '#c2d6a2', defender: '#e4ecf2', catcher: '#2b1a17'};

/** The rabies virus close up: a bullet with a knobbed coat; `face` for the hero. */
export const MacroVirus: React.FC<{x: number; y: number; s: number; rot?: number; face?: 'smug' | 'shock' | 'sad' | 'evil' | null; talk?: number; blink?: number; t?: number; seed?: string}> = ({x, y, s, rot = 0, face = null, talk = 0, blink = 0, t = 0, seed = 'v'}) => {
  const knobs = Array.from({length: 26}).map((_, i) => {
    const a = (i / 26) * Math.PI * 2;
    const wig = Math.sin(t * 5 + i * 1.7 + random(`${seed}k${i}`) * 6) * 2.5; // the spikes twitch
    return {a, px: Math.cos(a) * 60, py: Math.sin(a) * 82 - 6, wig};
  });
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      {knobs.map((k, i) => (
        <g key={i}>
          <path d={`M${k.px * 0.88} ${k.py * 0.88} L${k.px * 1.16 + k.wig} ${k.py * 1.16}`} stroke={INK.line} strokeWidth={5} />
          <circle cx={k.px * 1.2 + k.wig} cy={k.py * 1.2} r={8} fill={MACRO_PAL.virusDeep} stroke={INK.line} strokeWidth={3} />
        </g>
      ))}
      <path d="M-56 66 L-56 -26 Q-56 -92 0 -96 Q56 -92 56 -26 L56 66 Z" fill={MACRO_PAL.virusDeep} stroke={INK.line} strokeWidth={8} strokeLinejoin="round" />
      <path d="M-56 66 L-56 -26 Q-56 -92 0 -96 Q48 -92 52 -30 L52 60 Z" fill={MACRO_PAL.virus} />
      {/* the coat's coil, seen through: the inside of a real rabies particle is a tight helix */}
      {[-50, -30, -10, 10, 30, 50].map((yy, i) => <path key={i} d={`M-44 ${yy} Q0 ${yy + 10} 44 ${yy}`} fill="none" stroke={MACRO_PAL.virusDeep} strokeWidth={4} opacity={0.6} />)}
      <path d="M-40 52 L-40 -22 Q-40 -76 -4 -80" fill="none" stroke={MACRO_PAL.virusLight} strokeWidth={10} strokeLinecap="round" />
      <path d="M-56 66 L-56 -26 Q-56 -92 0 -96 Q56 -92 56 -26 L56 66 Z" fill="none" stroke={INK.line} strokeWidth={8} strokeLinejoin="round" />
      {face && (
        <g>
          <InkEyes x={0} y={-28} r={21} look={face === 'shock' ? [0, -0.6] : face === 'evil' ? [0, 0.2] : [0.4, -0.3]} lid={blink > 0.5 ? 0.95 : face === 'smug' ? 0.4 : face === 'evil' ? 0.3 : face === 'sad' ? 0.25 : 0} />
          {face === 'smug' && <path d="M-36 -62 L-12 -58 M36 -62 L12 -58" stroke={INK.line} strokeWidth={6} strokeLinecap="round" />}
          {/* evil (the hook: owner 2026-11-18, "the virus looks friendly"): hard slanted brows and a wide grin full of teeth */}
          {face === 'evil' && <path d="M-42 -70 L-8 -50 M42 -70 L8 -50" stroke={INK.line} strokeWidth={9} strokeLinecap="round" />}
          {face === 'evil' ? (
            <g>
              <path d={`M-30 12 Q0 ${22 + talk * 6} 30 12 Q24 ${40 + talk * 14} 0 ${42 + talk * 16} Q-24 ${40 + talk * 14} -30 12 Z`} fill="#fff6dc" stroke={INK.line} strokeWidth={5} strokeLinejoin="round" />
              <path d="M-18 16 V34 M-6 19 V38 M6 19 V38 M18 16 V34" stroke={INK.line} strokeWidth={3} />
            </g>
          ) : talk > 0.15 ? <ellipse cx={2} cy={24} rx={12} ry={5 + talk * 13} fill={INK.line} /> : face === 'smug' ? <path d="M-16 20 Q2 34 20 16" fill="none" stroke={INK.line} strokeWidth={5} strokeLinecap="round" /> : face === 'shock' ? <ellipse cx={2} cy={24} rx={11} ry={15} fill={INK.line} /> : <path d="M-16 30 Q2 18 20 30" fill="none" stroke={INK.line} strokeWidth={5} strokeLinecap="round" />}
        </g>
      )}
    </g>
  );
};

/** One skin cell: a plump rounded box with its nucleus. */
const Cell: React.FC<{x: number; y: number; rx: number; ry: number; seed: string; flat?: boolean}> = ({x, y, rx, ry, seed, flat = false}) => (
  <g>
    <Tissue d={spline(lump(x, y, rx, ry, seed, 12, flat ? 0.05 : 0.09), true, 0.6)} fill={flat ? MACRO_PAL.skinTop : MACRO_PAL.skinCell} deep={MACRO_PAL.skinCellDeep} band={16} line={INK.wIn + 1} form={flat ? 4 : 9} />
    {!flat && <path d={spline(lump(x + rx * 0.1, y, rx * 0.32, ry * 0.36, `${seed}n`, 9, 0.12), true, 0.6)} fill={MACRO_PAL.nucleus} stroke={INK.line} strokeWidth={3} />}
  </g>
);

/** ENTRY: the scratch fills the frame; a drop of saliva sits over it and the hero slides down out of it, into the cut. */
export const MacroEntry: React.FC<{t?: number; slide?: number; face?: MacroFace}> = ({t: clock = 1, slide = 0.6, face = DEFAULT_FACE}) => {
  const t = burst(clock); // the close-up moves in beats and holds between them (look check: the body lives in moments)
  const id = useId().replace(/:/g, '');
  // the V of the scratch, wide at the surface (y 640), narrowing down to a nerve ending
  const V: P[] = [[250, 640], [420, 880], [500, 1180], [530, 1440], [550, 1440], [580, 1180], [660, 880], [830, 640]];
  const inV = (x: number, y: number, pad: number) => { if (y < 600) return false; const k = Math.min(1, (y - 640) / 800); const half = 290 * (1 - k) + 12; return Math.abs(x - 540) < half + pad; };
  const cells: {x: number; y: number; rx: number; ry: number; flat: boolean}[] = [];
  for (let row = 0; row < 11; row++) {
    const y = 680 + row * 116;
    const flat = row < 2;
    for (let i = 0; i < 7; i++) {
      const x = -60 + i * 190 + (row % 2) * 95;
      if (inV(x, y, flat ? 110 : 96)) continue;
      cells.push({x, y, rx: flat ? 100 : 86, ry: flat ? 38 : 52, flat});
    }
  }
  // `slide`: 0 = the hero still inside the drop, 1 = deep in the cut. It never comes below y 1000, clear of the caption line.
  const hy = entryHeroY(slide) + Math.sin(t * 1.4) * 6;
  return (
    <AbsoluteFill style={{background: MACRO_PAL.air}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <defs>
          <radialGradient id={`dr${id}`} cx="0.35" cy="0.3" r="0.8"><stop offset="0" stopColor="#ffffff" /><stop offset="0.6" stopColor={MACRO_PAL.saliva} /><stop offset="1" stopColor="#c6e6f2" /></radialGradient>
        </defs>
        <rect x={0} y={0} width={W} height={H} fill={MACRO_PAL.air} />
        {/* inside the skin: the deeper tissue, with its fibres */}
        <Tissue d={spline(wob([[-60, 620], [1140, 620], [1140, 1980], [-60, 1980]], 'dm', 4), true, 0.4)} fill={MACRO_PAL.dermis} deep={MACRO_PAL.dermisDeep} band={50} form={0} />
        {Array.from({length: 11}).map((_, i) => <path key={i} d={spline(wob([[-40, 1080 + i * 80], [300, 1060 + i * 80], [700, 1100 + i * 80], [1120, 1070 + i * 80]], `cf${i}`, 16), false, 0.6)} fill="none" stroke={MACRO_PAL.collagen} strokeWidth={8} strokeLinecap="round" opacity={0.6} />)}
        {/* the skin cells in layers */}
        {cells.map((c, i) => <Cell key={i} x={c.x} y={c.y} rx={c.rx} ry={c.ry} flat={c.flat} seed={`sc${i}`} />)}
        {/* the cut itself: a dark V through the layers */}
        <Tissue d={spline(V, true, 0.35)} fill={MACRO_PAL.gap} deep="#6e2a2c" band={30} form={0} />
        {/* the nerve ending at the bottom of the cut */}
        <Tissue d={spline(wob([[500, 1990], [580, 1990], [574, 1700], [592, 1540], [640, 1450], [596, 1440], [556, 1510], [520, 1450], [476, 1462], [516, 1560], [506, 1720]], 'ne', 3), true, 0.5)} fill={MACRO_PAL.nerve} deep={MACRO_PAL.nerveDeep} band={18} form={8} />
        {/* the drop of saliva sitting over the cut, more viruses inside */}
        <g transform={`translate(0 ${(Math.sin(t * 1.6) * 6).toFixed(1)})`}>
          <path d={spline(wob([[170, 470], [260, 300], [420, 210], [600, 200], [780, 260], [900, 420], [880, 580], [720, 660], [540, 700], [360, 660], [200, 600]], 'drop', 5), true, 0.55)} fill={`url(#dr${id})`} stroke={INK.line} strokeWidth={INK.w} strokeLinejoin="round" opacity={0.93} />
          <path d="M280 340 Q360 260 470 250" fill="none" stroke="#ffffff" strokeWidth={16} strokeLinecap="round" />
          {[[330, 470, 0.5, -25], [760, 420, 0.46, 22], [600, 330, 0.4, 8], [460, 560, 0.42, -10]].map(([x, y, s, r], i) => <MacroVirus key={i} x={x} y={y + Math.sin(t * 2 + i) * 6} s={s} rot={r} t={t} seed={`dv${i}`} />)}
        </g>
        {/* the hero: out of the drop, sliding down into the cut, grinning; speed strokes above it */}
        {[[-60, -230], [0, -260], [60, -230]].map(([dx, dy], i) => <path key={i} d={`M${540 + dx} ${hy + dy} l0 ${-60 - Math.sin(t * 7 + i) * 12}`} stroke={INK.line} strokeWidth={7} strokeLinecap="round" opacity={0.7} />)}
        <MacroVirus x={540} y={hy} s={1.55} rot={Math.sin(t * 2) * 3} face={face.face} talk={face.talk} blink={face.blink} t={t} seed="hero" />
      </svg>
    </AbsoluteFill>
  );
};

/** INSIDE: one nerve fibre, its sheath in segments, the virus riding the inner tracks upward. */
export const MacroInside: React.FC<{t?: number; speed?: number; face?: MacroFace}> = ({t: clock = 1, speed = 1, face = DEFAULT_FACE}) => {
  const t = burst(clock); // the close-up moves in beats and holds between them (look check: the body lives in moments)
  const ride = (t * 60 * speed) % 240; // the tracks scroll down past the virus: it travels up (`speed` 0 = it stops)
  return (
    <AbsoluteFill style={{background: MACRO_PAL.gap}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <rect x={0} y={0} width={W} height={H} fill={MACRO_PAL.gap} />
        {/* neighbouring fibres behind, darker */}
        {[[-60, 160], [930, 230]].map(([x, w], i) => <Tissue key={i} d={spline(wob([[x, -80], [x + w, -80], [x + w + 20, 2000], [x + 20, 2000]], `nb${i}`, 6), true, 0.4)} fill="#c97f72" deep="#a3584e" band={30} form={14} />)}
        {/* the sheath: cream segments with narrow gaps, running off the top and bottom */}
        {Array.from({length: 6}).map((_, i) => {
          const y0 = -120 + i * 380 - (ride % 380) * 0; // the sheath stays; the tracks move
          return <Tissue key={i} d={spline(wob([[200, y0 + 20], [880, y0 + 20], [900, y0 + 180], [880, y0 + 340], [200, y0 + 340], [180, y0 + 180]], `sh${i}`, 5), true, 0.5)} fill={MACRO_PAL.sheath} deep={MACRO_PAL.sheathDeep} band={44} form={22} shine={{x0: 240, x1: 820, y0: y0 + 60, y1: y0 + 300, n: 2, seed: `shs${i}`}} />;
        })}
        {/* the inner fibre, cut open down its length */}
        <Tissue d={spline(wob([[330, -80], [750, -80], [760, 2000], [320, 2000]], 'ax', 4), true, 0.4)} fill={MACRO_PAL.axon} deep={MACRO_PAL.track} band={36} form={10} />
        {/* the tracks it rides on, scrolling */}
        {[400, 470, 610, 680].map((x, i) => (
          <g key={i}>
            <path d={`M${x} -80 V2000`} stroke={MACRO_PAL.track} strokeWidth={10} />
            {Array.from({length: 12}).map((_, j) => <path key={j} d={`M${x - 14} ${-80 + j * 180 + ride * 0.75} h28`} stroke={MACRO_PAL.nerveDeep} strokeWidth={6} strokeLinecap="round" />)}
          </g>
        ))}
        {/* small cargo riding the tracks too, for scale */}
        {[[420, 300], [660, 1500], [460, 1700]].map(([x, y], i) => <circle key={i} cx={x} cy={(y + ride * 1.5) % 2000} r={22} fill="#f3d6a6" stroke={INK.line} strokeWidth={4} />)}
        {/* the hero, riding up, with speed strokes under it */}
        {speed > 0.2 && [[-40, 150], [0, 180], [40, 150]].map(([dx, dy], i) => <path key={i} d={`M${540 + dx} ${980 + dy} l0 ${70 + Math.sin(t * 9 + i) * 14}`} stroke={INK.line} strokeWidth={7} strokeLinecap="round" opacity={0.75 * Math.min(1, speed)} />)}
        <MacroVirus x={540} y={900} s={1.6} rot={0} face={face.face} talk={face.talk} blink={face.blink} t={t} seed="ride" />
      </svg>
    </AbsoluteFill>
  );
};

/** CAUGHT: the defenders' Y-shaped catchers gripping the virus by its spikes. */
export const MacroCaught: React.FC<{t?: number; grip?: number; face?: MacroFace}> = ({t: clock = 1, grip = 1, face = {...DEFAULT_FACE, face: 'shock'}}) => {
  const t = burst(clock); // the close-up moves in beats and holds between them (look check: the body lives in moments)
  const catchers = [[-120, -170, -35], [120, -170, 35], [-160, 0, -80], [160, 10, 80], [-110, 170, -140], [120, 170, 140], [0, -230, 0]];
  return (
    <AbsoluteFill style={{background: MACRO_PAL.axon}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <rect x={0} y={0} width={W} height={H} fill={MACRO_PAL.axon} />
        {/* the fibre's tracks behind, still */}
        {[300, 420, 660, 780].map((x, i) => <path key={i} d={`M${x} -80 V2000`} stroke={MACRO_PAL.track} strokeWidth={12} />)}
        {/* the defenders around it, big and round, eyes only */}
        {[[200, 520, 120], [880, 560, 110], [180, 1250, 110], [900, 1240, 120], [540, 1720, 100]] /* the lower three keep clear of the caption box (y 1460 to 1600) [1380, 1360, 1640] */.map(([x, y, r], i) => (
          <g key={i} transform={`translate(${x} ${y + Math.sin(t * 2.2 + i) * 6})`}>
            <Tissue d={spline(lump(0, 0, r, r * 0.95, `cd${i}`, 12, 0.05), true, 0.6)} fill={MACRO_PAL.defender} deep="#b8c8d6" band={22} form={14} />
            <InkEyes x={0} y={-r * 0.12} r={r * 0.26} look={[(540 - x) / 900, (980 - y) / 900]} />
            <path d={`M${-r * 0.2} ${r * 0.35} Q0 ${r * 0.5} ${r * 0.2} ${r * 0.35}`} fill="none" stroke={INK.line} strokeWidth={5} strokeLinecap="round" />
          </g>
        ))}
        {/* the catchers: Y shapes, gripping the spikes */}
        {catchers.map(([dx, dy, a], i) => {
          const far = 1.05 + (1 - grip) * 2.2; // `grip` 0 = the catchers far out, 1 = gripping the spikes
          const x = 540 + dx * far;
          const y = 980 + dy * far;
          const pull = Math.sin(t * 3 + i) * 4;
          return (
            <g key={i} transform={`translate(${(x + Math.sin((a * Math.PI) / 180) * pull).toFixed(1)} ${(y - Math.cos((a * Math.PI) / 180) * pull).toFixed(1)}) rotate(${a})`}>
              <path d="M0 -120 L0 -20 M0 -20 L-34 30 M0 -20 L34 30" fill="none" stroke={INK.line} strokeWidth={20} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M0 -120 L0 -20 M0 -20 L-34 30 M0 -20 L34 30" fill="none" stroke="#9fc4e8" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          );
        })}
        <MacroVirus x={540} y={980} s={1.9} rot={Math.sin(t * 3) * 4 * grip} face={face.face} talk={face.talk} blink={face.blink} t={t} seed="caught" />
      </svg>
    </AbsoluteFill>
  );
};

/** Time that runs only in beats: 0.5 s of movement (eased) every 1.5 s, still in between. The reference
 * holds still in 63% of its frames; a close-up that never stops moving failed the look check (2026-11-18). */
export const burst = (t: number, period = 1.5, active = 0.5) => {
  const n = Math.floor(t / period);
  const f = Math.min(1, (t - n * period) / active);
  return (n + f * f * (3 - 2 * f)) * active;
};
export const MACROS = {entry: MacroEntry, inside: MacroInside, caught: MacroCaught};
export type MacroFace = {face: 'smug' | 'shock' | 'sad' | 'evil'; talk: number; blink: number};
const DEFAULT_FACE: MacroFace = {face: 'smug', talk: 0, blink: 0};
/** Where the entry hero is for a slide value (the staging check reads this too). */
export const entryHeroY = (slide: number) => 560 + Math.max(0, Math.min(1, slide)) * 400;
export const MacroLook: React.FC<{shot?: keyof typeof MACROS; t?: number}> = ({shot = 'entry', t = 1.3}) => {
  const C = MACROS[shot];
  return <C t={t} />;
};
