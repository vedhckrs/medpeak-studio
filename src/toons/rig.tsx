// MedPeak Toons rig v6: the face, hands, arms and legs every character shares.
// Face: big eyes with a coloured, shaded iris, a dark pupil and two highlights, a stronger upper
// lash line, brush brows, shaped mouths with shaded teeth and tongue, soft gradient blush.
// Features are drawn in a deep shade of the character's own colour, never navy. Hands are one
// clean silhouette (palm, four fingers, thumb) in the character's own colour.
import React, {useId} from 'react';
import {circlePath, deepOf, ellipsePath, lift, lineOf, Merge, Part, roundRect, Scaled, shade, taperedPath, tone, Tube, useLine} from './ink';
import {STYLE} from './style';

export type Emotion = 'neutral' | 'happy' | 'angry' | 'scared' | 'smug' | 'sick' | 'sleepy' | 'shocked' | 'sad';
export const EMOTIONS: Emotion[] = ['neutral', 'happy', 'angry', 'scared', 'smug', 'sick', 'sleepy', 'shocked', 'sad'];
export const INK = STYLE.ink;
export const LINE = STYLE.line;
const PUPIL = '#241b2b';
const MOUTH_IN = '#5d1a2d';
const TONGUE = '#ff8597';
/** The colour of brows, lashes and mouth lines: a deep shade of the skin colour. */
export const featureOf = (skin: string) => tone(lineOf(skin), 0.3);

export type FaceProps = {
  emotion?: Emotion;
  talk?: number; // 0 = mouth closed, 1 = wide open (driven by the voice)
  blink?: number; // 0 = open, 1 = closed
  look?: {x: number; y: number}; // pupils, -1..1
  size?: number;
  skin?: string; // the colour the face sits on (eyelids use it)
  human?: boolean; // adds a small nose
  iris?: string; // eye colour; default = a deep shade of the skin colour
  lashes?: boolean; // outer eyelashes
  turn?: number; // -1..1: the head turns a little, so the features slide and the far eye narrows
};

type Pose = {lid: number; lidL?: number; lower?: number; brow: [number, number]; browY: number; pupil: number; mouth: string; blush?: number; tint?: string; extra?: 'sweat' | 'tear' | 'zz' | 'vein'};
// brow = tilt in degrees for [left, right]; positive = inner end down = angry
const POSES: Record<Emotion, Pose> = {
  neutral: {lid: 0.03, brow: [0, 0], browY: 0, pupil: 1, mouth: 'smile'},
  happy: {lid: 0, lower: 0.26, brow: [-10, -10], browY: -3, pupil: 1.05, mouth: 'grin', blush: 1},
  angry: {lid: 0.3, brow: [24, 24], browY: 5, pupil: 0.85, mouth: 'growl', extra: 'vein'},
  scared: {lid: 0, brow: [-20, -20], browY: -5, pupil: 0.58, mouth: 'wobble', extra: 'sweat'},
  smug: {lid: 0.42, lidL: 0.3, lower: 0.1, brow: [-12, 12], browY: -1, pupil: 1, mouth: 'smirk'},
  sick: {lid: 0.46, brow: [-12, -12], browY: 1, pupil: 0.9, mouth: 'wobble', tint: '#7fc65a', blush: 1},
  sleepy: {lid: 0.7, brow: [-4, -4], browY: 3, pupil: 1, mouth: 'o', extra: 'zz'},
  shocked: {lid: 0, brow: [-6, -6], browY: -8, pupil: 0.5, mouth: 'O'},
  sad: {lid: 0.18, brow: [-22, -22], browY: -1, pupil: 1.08, mouth: 'frown', extra: 'tear'},
};

const Eye: React.FC<{x: number; lid: number; lower: number; pupil: number; look: {x: number; y: number}; skin: string; fc: string; k: number; lw: number; iris: string; lashes: boolean; outer: number; soft?: boolean}> = ({x, lid, lower, pupil, look, skin, fc, k, lw, iris, lashes, outer, soft = false}) => {
  const id = useId().replace(/:/g, '');
  const rx = 12.5 * k;
  const ry = 15 * k;
  const d = ellipsePath(0, 0, rx, ry);
  const lash = lashes ? <path d={`M${outer * rx * 0.74} ${-ry * 0.5} l${outer * 3.4} -3.2 M${outer * rx * 0.92} ${-ry * 0.2} l${outer * 3.8} -1.6`} fill="none" stroke={fc} strokeWidth={lw * 1.3} strokeLinecap="round" /> : null;
  if (lid > 0.88) {
    // closed: one soft curved lash line
    return (
      <g transform={`translate(${x} 0)`}>
        <path d={`M${-rx * 0.86} 1.5 Q0 7.5 ${rx * 0.86} 1.5`} fill="none" stroke={fc} strokeWidth={lw * 1.5} strokeLinecap="round" />
        {lashes && <path d={`M${outer * rx * 0.8} 2.4 l${outer * 3.2} 2 M${outer * rx * 0.5} 4.6 l${outer * 2} 3`} fill="none" stroke={fc} strokeWidth={lw * 1.2} strokeLinecap="round" />}
      </g>
    );
  }
  const lidY = -ry + ry * 2 * Math.min(1, lid);
  if (STYLE.eye === 'dot' || STYLE.eye === 'ring') {
    // clean 2D eye: white, one dark pupil, one small catchlight. No iris, no gradients.
    const r = 5.4 * (0.62 + 0.38 * pupil) * STYLE.pupilScale;
    const dx = look.x * (rx - r) * 0.9;
    const dy = look.y * 4.2 + 1.6;
    return (
      <g transform={`translate(${x} 0)`}>
        <defs><clipPath id={`e${id}`}><path d={d} /></clipPath></defs>
        <path d={d} fill="#ffffff" />
        <g clipPath={`url(#e${id})`}>
          <circle cx={dx} cy={dy} r={r} fill={PUPIL} />
          {STYLE.eye === 'dot' && <circle cx={dx + r * 0.34} cy={dy - r * 0.36} r={r * 0.3} fill="#ffffff" />}
          {lid > 0.02 && (
            <>
              <rect x={-rx - 1} y={-ry - 1} width={rx * 2 + 2} height={lidY + ry + 1} fill={skin} />
              <path d={`M${-rx} ${lidY} Q0 ${lidY + 1.4} ${rx} ${lidY}`} fill="none" stroke={fc} strokeWidth={lw * 1.5} />
            </>
          )}
          {lower > 0.02 && <ellipse cx={0} cy={2 * ry * (1 - lower)} rx={rx * 1.5} ry={ry} fill={skin} stroke={fc} strokeWidth={lw} />}
        </g>
        <path d={d} fill="none" stroke={fc} strokeWidth={lw * 1.15} />
        {lash}
      </g>
    );
  }
  const R = 8.3 * (0.6 + 0.4 * pupil) * STYLE.pupilScale; // the iris shrinks with fear and surprise
  const pr = 4.5 * pupil ** 1.15 * STYLE.pupilScale;
  const px = look.x * (rx - R) * 0.92;
  const py = look.y * 4.2 + 1.3;
  return (
    <g transform={`translate(${x} 0)`}>
      <defs>
        <clipPath id={`e${id}`}><path d={d} /></clipPath>
        <radialGradient id={`i${id}`} cx="0.5" cy="0.74" r="0.66">
          <stop offset="0" stopColor={lift(iris, 0.5)} />
          <stop offset="0.55" stopColor={iris} />
          <stop offset="1" stopColor={shade(iris, 0.45)} />
        </radialGradient>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c3cbe6" stopOpacity="0.75" />
          <stop offset="0.42" stopColor="#c3cbe6" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={d} fill="#ffffff" />
      <g clipPath={`url(#e${id})`}>
        <path d={d} fill={`url(#s${id})`} />
        <circle cx={px} cy={py} r={R} fill={`url(#i${id})`} stroke={shade(iris, 0.55)} strokeWidth={0.9} />
        <circle cx={px} cy={py} r={pr} fill={PUPIL} />
        <ellipse cx={px} cy={py - R * 0.62} rx={R * 0.98} ry={R * 0.46} fill={shade(iris, 0.6)} opacity={0.34} />
        <circle cx={px + R * 0.36} cy={py - R * 0.4} r={R * 0.3} fill="#ffffff" />
        <circle cx={px - R * 0.42} cy={py + R * 0.42} r={R * 0.13} fill="#ffffff" opacity={0.9} />
        {lid > 0.02 && (
          <>
            <rect x={-rx - 1} y={-ry - 1} width={rx * 2 + 2} height={lidY + ry + 1} fill={skin} />
            <rect x={-rx - 1} y={-ry - 1} width={rx * 2 + 2} height={lidY + ry + 1} fill={shade(skin, 0.16)} opacity={0.55} />
            <path d={`M${-rx} ${lidY} Q0 ${lidY + 1.4} ${rx} ${lidY}`} fill="none" stroke={fc} strokeWidth={lw * 1.7} />
          </>
        )}
        {lower > 0.02 && <ellipse cx={0} cy={2 * ry * (1 - lower)} rx={rx * 1.5} ry={ry} fill={skin} stroke={fc} strokeWidth={lw} />}
      </g>
      <path d={d} fill="none" stroke={soft ? shade(skin, 0.4) : fc} strokeWidth={soft ? lw * 0.6 : lw} opacity={soft ? 0.3 : 1} />
      {(soft || lid <= 0.02) && lid < 0.5 && <path d={`M${-0.94 * rx} ${-0.34 * ry} A${rx} ${ry} 0 0 1 ${0.94 * rx} ${-0.34 * ry}`} fill="none" stroke={fc} strokeWidth={lw * (soft ? 2.1 : 1.7)} strokeLinecap="round" />}
      {lash}
    </g>
  );
};

const Mouth: React.FC<{shape: string; talk: number; fc: string; lw: number}> = ({shape, talk, fc, lw}) => {
  const id = useId().replace(/:/g, '');
  const open = Math.max(0, Math.min(1, talk));
  const st = {fill: 'none', stroke: fc, strokeWidth: lw * 1.15, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const cavity = (d: string, teeth: boolean, tongueY: number, tongueR: [number, number], teethY = -4) => (
    <g>
      <defs><clipPath id={`m${id}`}><path d={d} /></clipPath></defs>
      <path d={d} fill={MOUTH_IN} />
      <g clipPath={`url(#m${id})`}>
        <rect x={-16} y={teethY - 4} width={32} height={7} fill="#2c0914" opacity={0.5} />
        <ellipse cx={0} cy={tongueY} rx={tongueR[0]} ry={tongueR[1]} fill={TONGUE} />
        <ellipse cx={-tongueR[0] * 0.25} cy={tongueY - tongueR[1] * 0.45} rx={tongueR[0] * 0.42} ry={tongueR[1] * 0.26} fill="#ffb6c1" opacity={0.75} />
        {teeth && (
          <>
            <rect x={-14} y={teethY} width={28} height={4.8} rx={1.6} fill="#ffffff" />
            <rect x={-14} y={teethY + 3.5} width={28} height={1.3} fill="#c9cfe6" opacity={0.75} />
          </>
        )}
      </g>
      <path d={d} {...st} />
    </g>
  );
  if (open > 0.06) {
    const down = shape === 'frown' || shape === 'wobble' || shape === 'growl';
    const w = 7.5 + open * 3;
    const h = 2.5 + open * 9.5;
    const top = down ? 1.2 : -1.2;
    const d = `M${-w} ${top} Q0 ${top + (down ? 1.5 : -2)} ${w} ${top} Q${w * 0.95} ${h} 0 ${h + 1.2} Q${-w * 0.95} ${h} ${-w} ${top} Z`;
    return cavity(d, open > 0.4, h + 1.5, [w * 0.6, h * 0.45], top - 2.4);
  }
  switch (shape) {
    case 'grin': return cavity('M-10.5 -1.8 Q0 0.6 10.5 -1.8 Q9.8 10 0 11 Q-9.8 10 -10.5 -1.8 Z', true, 11.5, [6.5, 4.2], -3.6);
    case 'growl': return (
      <g>
        <path d={roundRect(-9.5, -3.6, 19, 8, 3.2)} fill="#ffffff" />
        <path d="M-9.5 0.4 H9.5 M-3.2 -3.6 V4.4 M3.2 -3.6 V4.4" {...st} strokeWidth={lw * 0.7} />
        <path d={roundRect(-9.5, -3.6, 19, 8, 3.2)} {...st} />
      </g>
    );
    case 'wobble': return <path d="M-9 1.5 q3 -4.2 6 0 q3 4.2 6 0 q3 -4.2 6 0" {...st} />;
    case 'smirk': return <path d="M-8 1.2 Q2 3.6 9.5 -3.4" {...st} />;
    case 'o': return (<g><ellipse cx={0} cy={1.5} rx={3} ry={3.6} fill={MOUTH_IN} /><ellipse cx={0} cy={1.5} rx={3} ry={3.6} {...st} /></g>);
    case 'O': return cavity(ellipsePath(0, 3.5, 6.4, 8.4), false, 10.5, [4.4, 3.6]);
    case 'frown': return <path d="M-7.5 3.6 Q0 -3 7.5 3.6" {...st} />;
    default: return <path d="M-7.5 -0.6 Q0 6 7.5 -0.6" {...st} />;
  }
};

const Drop: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M0 -6 C3.4 -1.5 4.4 1 4.4 2.8 A4.4 4.4 0 0 1 -4.4 2.8 C-4.4 1 -3.4 -1.5 0 -6 Z" fill="#a8e0ff" stroke="#4a98cf" strokeWidth={0.8} />
    <circle cx={-1.5} cy={2.4} r={1.1} fill="#ffffff" />
  </g>
);

export const Face: React.FC<FaceProps> = ({emotion = 'neutral', talk = 0, blink = 0, look = {x: 0, y: 0}, size = 1, skin = '#ff9aa2', human = false, iris, lashes = false, turn = 0}) => {
  const id = useId().replace(/:/g, '');
  const p = POSES[emotion];
  const es = STYLE.eyeScale;
  const gap = STYLE.eyeGap;
  const fc = featureOf(skin);
  const eyeColor = iris ?? deepOf(skin, 0.33);
  const lw = (useLine() / size) * (human ? 0.62 : 1); // outline width inside scale(size); people's small faces get finer lines
  const lwe = lw / es; // ...and inside the eye group
  const lidR = Math.max(p.lid, blink);
  const lidL = Math.max(p.lidL ?? p.lid, blink);
  const lower = blink > 0.5 ? 0 : p.lower ?? 0;
  const mouthY = 15 * es + (human ? 12.5 : 9);
  const blushA = (0.34 + (p.blush ?? 0) * 0.4) * STYLE.blush;
  const tx = turn * 5.5; // a small head turn slides the features and narrows the far eye
  const kL = 1 - Math.max(0, -turn) * 0.14;
  const kR = 1.04 - Math.max(0, turn) * 0.14;
  return (
    <g transform={`translate(${tx} 0) scale(${size})`}>
      <defs>
        <radialGradient id={`b${id}`}>
          <stop offset="0" stopColor={p.tint ?? '#ff3d6e'} stopOpacity={blushA} />
          <stop offset="1" stopColor={p.tint ?? '#ff3d6e'} stopOpacity="0" />
        </radialGradient>
      </defs>
      {blushA > 0 && [-1, 1].map((s) => <ellipse key={s} cx={s * (gap + 14) * es} cy={13.5 * es} rx={10.5} ry={6.4} fill={`url(#b${id})`} />)}
      <g transform={`scale(${es})`}>
        <Eye x={-gap} lid={lidL} lower={lower} pupil={p.pupil} look={look} skin={skin} fc={fc} k={kL} lw={lwe} iris={eyeColor} lashes={lashes} outer={-1} soft={human} />
        <Eye x={gap} lid={lidR} lower={lower} pupil={p.pupil} look={look} skin={skin} fc={fc} k={kR} lw={lwe} iris={eyeColor} lashes={lashes} outer={1} soft={human} />
        {[[-1, p.brow[0]], [1, -p.brow[1]]].map(([side, rot]) => (
          <g key={side} transform={`translate(${side * gap} ${-23 + p.browY}) rotate(${rot})`}>
            <path d={taperedPath(side < 0 ? [[-9, 1.5], [-1, -1.6], [9, 0]] : [[-9, 0], [1, -1.6], [9, 1.5]], 4.4, side < 0 ? 0.45 : 0.15, side < 0 ? 0.15 : 0.45)} fill={fc} />
          </g>
        ))}
      </g>
      {human && (
        <g transform={`translate(${turn * 2.6} 0)`}>
          <path d={`M-1.4 ${15 * es * 0.42} Q${3.6 + turn * 2} ${15 * es * 0.78} -0.8 ${15 * es * 0.94} Q-3.4 ${15 * es * 0.98} -4.4 ${15 * es * 0.82}`} fill="none" stroke={shade(skin, 0.36)} strokeWidth={lw * 1.05} strokeLinecap="round" strokeLinejoin="round" />
          <ellipse cx={0.4} cy={15 * es * 0.66} rx={1.5} ry={2.4} fill="#ffffff" opacity={0.42} />
        </g>
      )}
      <g transform={`translate(${turn * 1.6} ${mouthY})`}><Mouth shape={p.mouth} talk={talk} fc={fc} lw={lw} /></g>
      {p.extra === 'sweat' && <Drop x={(gap + 12.5) * es + 7} y={-13 * es} s={1.15} />}
      {p.extra === 'tear' && <Drop x={-(gap + 4) * es} y={17 * es + 5} />}
      {p.extra === 'zz' && <text x={(gap + 13) * es} y={-20 * es} fontSize={15} fontWeight={900} fill={fc} fontFamily="sans-serif">z<tspan fontSize={11} dy={-8}>z</tspan></text>}
      {p.extra === 'vein' && (
        <g transform={`translate(${(gap + 12) * es + 5} ${-25 * es})`}>
          <path d="M-4.6 -1.6 Q-1.6 -1.6 -1.6 -4.6 M1.6 -4.6 Q1.6 -1.6 4.6 -1.6 M4.6 1.6 Q1.6 1.6 1.6 4.6 M-1.6 4.6 Q-1.6 1.6 -4.6 1.6" fill="none" stroke="#e23b4a" strokeWidth={1.7} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};

// ------------------------------------------------------------------ hands
export type HandPose = 'relaxed' | 'open' | 'fist' | 'point' | 'thumb';
export const HAND_POSES: HandPose[] = ['relaxed', 'open', 'fist', 'point', 'thumb'];
// A cartoon hand: wrist at (0,0), fingers toward +x, thumb on the -y side. One clean silhouette:
// a rounded palm, four fingers that read at their tips, a thumb. Lines are [x1, y1, x2, y2].
type Seg4 = [number, number, number, number];
type HandShape = {palm: [number, number, number, number, number]; f: Seg4[]; th: Seg4; seams: Seg4[]};
const PALM: HandShape['palm'] = [0.4, -5.9, 11, 11.8, 5];
const KNUCKLES: Seg4[] = [[10.6, -2.7, 13.5, -2.7], [10.9, 0, 13.9, 0], [10.6, 2.6, 13.4, 2.6]];
const CURLED: Seg4[] = [[9.6, -4, 12.2, -4], [9.8, -1.35, 12.9, -1.35], [9.8, 1.3, 12.9, 1.3], [9.6, 3.9, 12.2, 3.9]];
const HANDS: Record<HandPose, HandShape> = {
  // relaxed: an open hand with four clear fingers, a little spread (it was a square fist with knuckle lines: owner, 2026-11-18)
  relaxed: {palm: [0.4, -5.3, 10.6, 10.6, 4.8], f: [[9.4, -3.9, 18.2, -5.6], [9.8, -1.3, 20.4, -1.9], [9.8, 1.3, 19.8, 1.9], [9.4, 3.8, 17, 5.2]], th: [3.6, -4.4, 9.6, -9.2], seams: []},
  open: {palm: PALM, f: [[9.2, -4.2, 15.6, -7.4], [9.9, -1.5, 18, -2.9], [9.9, 1.4, 17.8, 2.3], [9.2, 4.2, 15.2, 6.7]], th: [3, -4.6, 6.2, -11.8], seams: []},
  fist: {palm: [0.6, -6.2, 11.2, 12.4, 5.4], f: CURLED, th: [5.4, -6.1, 11.2, -5.5], seams: KNUCKLES},
  point: {palm: PALM, f: [[9.6, -4, 20.4, -4.6], CURLED[1], CURLED[2], CURLED[3]], th: [3.8, -4.8, 8.6, -8.6], seams: [KNUCKLES[1], KNUCKLES[2]]},
  thumb: {palm: [0.6, -6.2, 11.2, 12.4, 5.4], f: CURLED, th: [4.6, -5, 6, -14.2], seams: KNUCKLES},
};
/** A hand in one clean silhouette. `flip` puts the thumb on the other side. */
export const Hand: React.FC<{pose?: HandPose; fill: string; line?: string; s?: number; flip?: boolean}> = ({pose = 'relaxed', fill, line, s = 1, flip = false}) => {
  const h = HANDS[pose];
  const lc = line ?? lineOf(fill);
  return (
    <Scaled s={s} transform={`scale(${s} ${flip ? -s : s})`}>
      <HandShapes h={h} fill={fill} lc={lc} />
    </Scaled>
  );
};
const HandShapes: React.FC<{h: HandShape; fill: string; lc: string}> = ({h, fill, lc}) => {
  const lw = useLine();
  const [px, py, pw, ph, pr] = h.palm;
  return (
    <g>
      <Merge>
        <Tube d={`M${h.th[0]} ${h.th[1]} L${h.th[2]} ${h.th[3]}`} r={2.15} fill={fill} line={lc} flat />
        {h.f.map((f, i) => <Tube key={i} d={`M${f[0]} ${f[1]} L${f[2]} ${f[3]}`} r={1.9} fill={fill} line={lc} flat />)}
        <Part d={roundRect(px, py, pw, ph, pr)} fill={fill} line={lc} flat />
      </Merge>
      {h.seams.map((m, i) => <path key={i} d={`M${m[0]} ${m[1]} L${m[2]} ${m[3]}`} fill="none" stroke={lc} strokeWidth={lw * 0.5} strokeLinecap="round" opacity={0.85} />)}
      <path d={`M${px + 1.6} ${py + ph - 2.6} Q${px + pw * 0.5} ${py + ph + 0.4} ${px + pw - 0.6} ${py + ph - 2.2} Q${px + pw * 0.5} ${py + ph - 1.6} ${px + 1.6} ${py + ph - 2.6} Z`} fill={shade(fill, 0.22)} opacity={0.7} />
      <path d={`M${px + 2.6} ${py + 2.2} Q${px + pw * 0.5} ${py + 0.9} ${px + pw - 2.6} ${py + 1.9}`} fill="none" stroke={lift(fill, 0.55)} strokeWidth={lw * 0.7} strokeLinecap="round" opacity={0.8} />
    </g>
  );
};

// ------------------------------------------------------------------ arms and legs
/**
 * An arm pose: just an angle in degrees (0 = right, 90 = down, 180 = left, -90 = up) or the full spec.
 * People have real joints: `u` = where the upper arm points, `f` = where the forearm points (same
 * degrees); `ul` / `fl` shorten a segment that points toward the viewer (a hand on the chin).
 */
export type ArmSpec = number | {a: number; len?: number; bend?: number; hand?: HandPose; front?: boolean; u?: number; f?: number; ul?: number; fl?: number};
export const armOf = (s: ArmSpec) => (typeof s === 'number' ? {a: s} : s);

/** A soft, slightly bent arm from a shoulder point, ending in a hand (body characters; people have jointed arms in humans.tsx). */
export const Arm: React.FC<{
  x: number; y: number; spec: ArmSpec; color: string; handColor?: string; r?: number; len?: number;
  sleeve?: {color: string; r: number; to: number} | null; handScale?: number;
}> = ({x, y, spec, color, handColor, r = 3.2, len = 34, sleeve = null, handScale = 1}) => {
  const sp = armOf(spec);
  const L = sp.len ?? len;
  const a = (sp.a * Math.PI) / 180;
  const hx = x + Math.cos(a) * L;
  const hy = y + Math.sin(a) * L;
  // the elbow sags down; for an arm hanging straight down it points outward
  let nx = -Math.sin(a);
  let ny = Math.cos(a);
  if (Math.abs(ny) < 0.25) { nx = x >= 0 ? 1 : -1; ny = 0; } else if (ny < 0) { nx = -nx; ny = -ny; }
  const b = sp.bend ?? L * 0.14;
  const cx = (x + hx) / 2 + nx * b;
  const cy = (y + hy) / 2 + ny * b;
  const d = `M${x} ${y} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${hx.toFixed(1)} ${hy.toFixed(1)}`;
  const ang = (Math.atan2(hy - cy, hx - cx) * 180) / Math.PI;
  const flip = Math.cos((ang * Math.PI) / 180) < 0;
  let sleeveD: string | null = null;
  if (sleeve) {
    const t = sleeve.to;
    const q0x = x + (cx - x) * t;
    const q0y = y + (cy - y) * t;
    const q1x = cx + (hx - cx) * t;
    const q1y = cy + (hy - cy) * t;
    sleeveD = `M${x} ${y} Q${q0x.toFixed(1)} ${q0y.toFixed(1)} ${(q0x + (q1x - q0x) * t).toFixed(1)} ${(q0y + (q1y - q0y) * t).toFixed(1)}`;
  }
  return (
    <g>
      <Tube d={d} r={r} fill={color} />
      {sleeve && sleeveD && <Tube d={sleeveD} r={sleeve.r} fill={sleeve.color} />}
      <g transform={`translate(${hx.toFixed(1)} ${hy.toFixed(1)}) rotate(${ang.toFixed(1)}) translate(-2.5 0)`}>
        <Hand pose={sp.hand ?? 'relaxed'} fill={handColor ?? color} s={handScale} flip={flip} />
      </g>
    </g>
  );
};

/** A small sneaker, toe toward +x, sole on y = 3.2: upper, toe cap, laces, heel tab, white sole. */
const SHOE = 'M-5.4 0.4 C-6 -5.4 -2 -7 1.6 -6.4 C5 -5.8 6.4 -3.8 8.8 -3 C12 -2 13 0.6 12.4 3.2 L-4.8 3.2 C-5.8 2.6 -5.5 1.4 -5.4 0.4 Z';
export const Shoe: React.FC<{color: string}> = ({color}) => (
  <Part d={SHOE} fill={color} mat="hard" tex={0} depth={2}>
    <path d="M6.6 -4.4 C10.6 -3.4 13.6 -1 13 3.4 H5.4 C5.2 0.4 5.6 -2.4 6.6 -4.4 Z" fill={lift(color, 0.4)} opacity={0.8} />
    <rect x={-7} y={1.2} width={21} height={3.2} fill={lift(color, 0.75)} />
    <path d="M-7 1.2 H14" stroke={shade(color, 0.4)} strokeWidth={0.5} />
    <path d="M1.4 -5 L3.4 -2.6 M3.6 -4.6 L5.4 -2.2" stroke={lift(color, 0.8)} strokeWidth={0.8} strokeLinecap="round" />
    <path d="M-5.6 -1.6 H-3.6 V-5.4" fill="none" stroke={shade(color, 0.34)} strokeWidth={0.7} />
  </Part>
);

/** One short leg with a shoe. `step` (-1..1) swings it for a walk; `side` is -1 (left) or 1 (right). */
export const Leg: React.FC<{x: number; y: number; len?: number; r?: number; color: string; shoe: string; step?: number; side: -1 | 1}> = ({x, y, len = 20, r = 3.2, color, shoe, step = 0, side}) => {
  const sw = step * side;
  const fx = x + sw * 7;
  const fy = y + len - Math.max(0, sw) * 5;
  const d = `M${x} ${y} Q${(x + sw * 3).toFixed(1)} ${(y + len * 0.55).toFixed(1)} ${fx.toFixed(1)} ${fy.toFixed(1)}`;
  return (
    <g>
      <Tube d={d} r={r} fill={color} />
      <g transform={`translate(${fx.toFixed(1)} ${fy.toFixed(1)}) scale(${side} 1)`}><Shoe color={shoe} /></g>
    </g>
  );
};

/** Natural blinking: closed for ~4 frames every 2.5-4.5 s, offset per character `seed`. */
export const blinkAt = (frame: number, fps: number, seed = 0) => {
  const period = Math.round(fps * (2.5 + ((seed * 7919) % 20) / 10));
  const t = (frame + seed * 37) % period;
  return t < 2 ? t / 2 : t < 4 ? 1 : t < 6 ? (6 - t) / 2 : 0;
};
