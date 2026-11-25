/**
 * "What Happens When You Rub Your Eyes" (`rub-eyes`), engine v9: this video's new drawings and its moments, for the owner's
 * look sheets and the shots. The first video built for the opening rules O1-O5 (2026-11-25).
 *   EyeFull    the whole eye filling the frame in a side cut-away (the full-organ rule): the eyeball with its face on the
 *              white, the clear dome (cornea) at the front with the coloured iris and the lens behind it, the eyelids and
 *              lashes round the front, the optic nerve leaving at the back, the bony socket around it as soft tones.
 *     red 0..1     itchy redness: red vessels across the white, a pink flush
 *     squash 0..1  pressed from above: the ball flattens, the lid dents
 *     cone 0..1    the dome goes thin and bulges into a point (keratoconus, PubMed 31343437)
 *   Knuckles   the intruder: a giant fist seen knuckles-first with ONE face across it, a thumb on the side; Kid's skin.
 *   Germ       three small germs (the kit's Bacteria) riding the knuckles, then on the eye.
 * Kit only: one outline colour, flat fills, a shade crescent, white shine strokes, the kit face.
 */
import React from 'react';
import {Scene} from './scene';
import {EDGE, EDGE_IN, Eyes, Highlight, INLINE, Mouth, Shape, shade, smoothD, tint, V9, type Mood, type MouthKind} from './kit';
import {Bacteria} from './germs';
import {castById, PersonAt} from './people-rig';
import {DoctorAt} from './doctor-new';
import {PaleClinicRoom} from './scenes-rooms';
import {FrameMove, IDENTITY} from './play';

export const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} viewBox="0 0 1080 1920">{children}</svg>
);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const mix = (a: string, b: string, k: number) => {
  const h = (s: string, i: number) => parseInt(s.slice(1 + i * 2, 3 + i * 2), 16);
  return '#' + [0, 1, 2].map((i) => Math.round(h(a, i) + (h(b, i) - h(a, i)) * k).toString(16).padStart(2, '0')).join('');
};

export const EYE_COL = {
  // the reference look (2026-11-25, the owner: "too much lines unnecessary, not going like ref video visual"): muted rose
  // flesh in tone steps, a cream fat band, few lines
  flesh: ['#9c4f4c', '#ad5d58', '#bd6e66', '#c97f74', '#d69283', '#e2a796', '#ecc0ac', '#f3d6c2'],
  edge: '#5a2a28',
  white: '#f1d9cd', whiteRed: '#eab3a7', rim: '#d99b8a', iris: '#5d93c4', pupil: '#2b1a17', cornea: '#dff1f8',
  nerve: '#e9c27c', lid: '#c4766b', lash: '#3a2722',
};
/** The eyeball: centre and radius in frame pixels (the face on the white, clear of the caption band). */
export const BALL = {x: 470, y: 960, r: 440};
export const EYE_FACE: [number, number] = [360, 860];

/** The eye socket as flowing rings of flesh round the ball (the reference look): tone steps of one hue, a cream band,
 * a soft dark line on some edges, no outline anywhere else, no blobs. */
const FleshRings: React.FC<{cx: number; cy: number}> = ({cx, cy}) => {
  const ring = (R: number, ph: number) => {
    const pts = Array.from({length: 56}, (_, n): [number, number] => {
      const a = (n / 56) * Math.PI * 2;
      const w = 1 + 0.07 * Math.sin(3 * a + ph) + 0.04 * Math.sin(5 * a + 2 * ph) + 0.02 * Math.sin(9 * a + ph);
      return [cx + Math.cos(a) * R * w, cy + Math.sin(a) * R * 1.32 * w];
    });
    return smoothD(pts);
  };
  // many thin bands, deep rose-brown, one thin cream band (the reference look); a fine dark line on most band edges
  const rings = Array.from({length: 17}, (_, n) => 1750 - n * 72);
  const pal = ['#8e4644', '#9c4f4c', '#a85754', '#9c4f4c', '#b4615b', '#a85754', '#c06e65', '#b4615b', '#eac3a6', '#c06e65', '#b4615b', '#c97a6e', '#bd6e66', '#d08778', '#c97a6e', '#d6927f', '#cc8273'];
  return (
    <g>
      <rect x={-40} y={-40} width={1160} height={2000} fill={pal[0]} />
      {rings.map((R, n) => (
        <g key={n}>
          <path d={ring(R, n * 1.3)} fill={pal[n % pal.length]} />
          {n % 3 !== 2 && <path d={ring(R, n * 1.3)} fill="none" stroke={EYE_COL.edge} strokeWidth={3.5} opacity={0.55} />}
        </g>
      ))}
    </g>
  );
};
/** A still paper grain over the place (fixed seed: the same every frame, never a shimmer). */
const Grain: React.FC = () => (
  <g>
    <defs>
      <filter id="re-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} stitchTiles="stitch" />
        <feColorMatrix type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.08  0 0 0 0 0.07  0 0 0 0.55 0" />
      </filter>
    </defs>
    <rect x={0} y={0} width={1080} height={1920} filter="url(#re-grain)" opacity={0.35} />
  </g>
);

export type EyeState = {red?: number; squash?: number; cone?: number};
export const EyeFull: React.FC<EyeState & {mood?: Mood; mouth?: MouthKind; look?: [number, number]; lid?: number; children?: React.ReactNode}> = ({
  red = 0, squash = 0, cone = 0, mood = 'open', mouth = 'smile', look = [0.4, 0], lid, children,
}) => {
  const r = clamp01(red), q = clamp01(squash), k = clamp01(cone);
  const {x, y} = BALL;
  const rx = BALL.r * (1 + 0.06 * q), ry = BALL.r * (1 - 0.1 * q);
  const cy = y + 0.1 * q * BALL.r;
  const ell = (ax: number, ay: number) => `M ${x - ax} ${cy} A ${ax} ${ay} 0 1 1 ${x + ax} ${cy} A ${ax} ${ay} 0 1 1 ${x - ax} ${cy} Z`;
  // the clear dome at the front: one glassy shape, thinner and pointed with `cone`
  const fx = x + rx - 40, out = 110 + 90 * k, h = 260 - 70 * k;
  const dome = smoothD([[fx, cy - h], [fx + out * 0.62, cy - h * 0.72], [fx + out * (0.93 + 0.07 * k), cy - h * (0.3 - 0.27 * k)], [fx + out, cy], [fx + out * (0.93 + 0.07 * k), cy + h * (0.3 - 0.27 * k)], [fx + out * 0.62, cy + h * 0.72], [fx, cy + h]]);
  const lidFill = mix(EYE_COL.lid, '#d9706a', r * 0.6);
  const lidD = (sgn: -1 | 1) => {
    const P = (deg: number, grow: number): [number, number] => [x + Math.cos((deg * Math.PI) / 180) * (rx + grow), cy + sgn * Math.sin((Math.abs(deg) * Math.PI) / 180) * (ry + grow)];
    const dent = sgn < 0 ? 60 * q : 0;
    const a = P(-80, -2), o = P(-40, 200 - dent), inn = P(-36, -6);
    const tip: [number, number] = [fx + out * 0.45, cy + sgn * (h + 10)];
    return {d: `M ${a[0]} ${a[1]} Q ${o[0]} ${o[1]} ${tip[0] + 26} ${tip[1] + sgn * 24} Q ${tip[0] + 8} ${tip[1] - sgn * 8} ${tip[0] - 16} ${tip[1] - sgn * 4} Q ${inn[0]} ${inn[1]} ${a[0]} ${a[1]} Z`, tip};
  };
  return (
    <Scene bg={EYE_COL.flesh[0]}><V9>
      <Svg>
        <FleshRings cx={x + 40} cy={cy} />
        <Grain />
        {/* the optic nerve leaving the back: one soft cord, no inner line */}
        <path d={`M ${x - rx + 40} ${cy - 46} C ${x - rx - 120} ${cy - 50} ${-20} ${cy - 90} ${-60} ${cy - 70} L ${-60} ${cy + 80} C ${-20} ${cy + 96} ${x - rx - 120} ${cy + 50} ${x - rx + 40} ${cy + 46} Z`} fill={EYE_COL.nerve} {...EDGE} />
        {/* the iris: one blue band behind the dome */}
        <path d={`M ${fx - 34} ${cy - 220} Q ${fx + 16} ${cy} ${fx - 34} ${cy + 220} L ${fx - 74} ${cy + 206} Q ${fx - 28} ${cy} ${fx - 74} ${cy - 206} Z`} fill={EYE_COL.iris} />
        {/* the ball: a lighter rim (its wall) round one flat inside, the outline only on the outside */}
        <path d={ell(rx, ry)} fill={EYE_COL.rim} {...EDGE} />
        <path d={ell(rx - 30, ry - 30)} fill={mix(EYE_COL.white, EYE_COL.whiteRed, r)} />
        {/* itchy redness: a soft pink flush, no vein lines */}
        {r > 0.01 && <ellipse cx={x + 120} cy={cy + 40} rx={rx * 0.6} ry={ry * 0.55} fill="#ec8f8a" opacity={0.22 * r} />}
        <path d={`M ${x - rx * 0.62} ${cy - ry * 0.55} Q ${x - rx * 0.35} ${cy - ry * 0.8} ${x - rx * 0.05} ${cy - ry * 0.84}`} stroke="#ffffff" strokeWidth={16} strokeLinecap="round" fill="none" opacity={0.55} />
        {/* the clear dome */}
        <path d={dome} fill={EYE_COL.cornea} opacity={0.85} {...EDGE} />
        <path d={`M ${fx + out * 0.42} ${cy - h * 0.6} Q ${fx + out * 0.74} ${cy - h * 0.38} ${fx + out * 0.82} ${cy - h * 0.1}`} stroke="#ffffff" strokeWidth={12} strokeLinecap="round" fill="none" />
        {/* the lids: flesh caps above and below the dome, three lashes each */}
        {([-1, 1] as const).map((sgn) => {
          const L = lidD(sgn);
          return (
            <g key={sgn}>
              <path d={L.d} fill={lidFill} {...EDGE} />
              {[0, 1, 2].map((n) => <path key={n} d={`M ${L.tip[0] + 6 + n * 12} ${L.tip[1] + sgn * 4} q ${26} ${sgn * (18 + n * 6)} ${46} ${sgn * (38 + n * 8)}`} stroke={EYE_COL.lash} strokeWidth={9} strokeLinecap="round" fill="none" />)}
            </g>
          );
        })}
        {/* the face: big eyes (the reference size) */}
        <Eyes x={EYE_FACE[0]} y={EYE_FACE[1]} r={100} mood={mood} look={look} lid={lid} brows />
        <Mouth x={EYE_FACE[0]} y={EYE_FACE[1] + 170} w={100} kind={mouth} />
      </Svg>
      {children}
    </V9></Scene>
  );
};

// ------------------------------------------------------------------ the Knuckles
export type KnuckleArms = 'press' | 'wave' | 'rub';
/** A fist seen knuckles-first, ONE face across the back of the hand; origin at the middle of the knuckle row; about 420 wide. */
export const Knuckles: React.FC<{mood?: Mood; mouth?: MouthKind; look?: [number, number]; lid?: number; skin?: string}> = ({mood = 'wink', mouth = 'big', look = [0, 0.3], lid, skin = '#d6a07a'}) => {
  // a fist seen from the front (the reference look: one silhouette, only the three short finger gaps that make it a fist):
  // the wrist going up out of frame, the broad back of the hand, four big round knuckles along the bottom, the thumb at the side
  const bumps = [-165, -55, 55, 165];
  const edge = bumps.flatMap((bx, n): [number, number][] => [[bx - 56, 10], [bx - 40, 54], [bx, 70], [bx + 40, 54], ...(n < 3 ? [[bx + 56, 14] as [number, number]] : [])]);
  const fist = smoothD([[-120, -760], [-140, -400], [-230, -300], [-236, -120], [-226, 0], ...edge, [232, 0], [280, -40], [300, -150], [262, -250], [214, -290], [140, -400], [120, -760]]);
  return (
    <g>
      <path d={fist} fill={skin} {...EDGE} />
      {bumps.slice(0, 3).map((bx, n) => <path key={n} d={`M ${bx + 55} 14 L ${bx + 55} -34`} stroke={shade(skin, 0.35)} strokeWidth={6} strokeLinecap="round" />)}
      <path d="M -196 -150 Q -180 -240 -110 -268" stroke="#ffffff" strokeWidth={12} strokeLinecap="round" fill="none" opacity={0.5} />
      <Eyes x={0} y={-176} r={56} mood={mood} look={look} lid={lid} brows />
      <Mouth x={0} y={-66} w={70} kind={mouth} />
    </g>
  );
};
export const KnucklesAt: React.FC<React.ComponentProps<typeof Knuckles> & {x: number; y: number; scale?: number; rot?: number}> = ({x, y, scale = 1, rot = 0, ...p}) => (
  // name-only frame: the log reads the drawing's own transform (the Booze/Stinger fix, 2026-11-25)
  <FrameMove m={IDENTITY} who="knuckles"><Svg><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}><Knuckles {...p} /></g></Svg></FrameMove>
);
/** A small germ (the kit's Bacteria) at frame pixels. */
export const GermAt: React.FC<{x: number; y: number; s?: number; rot?: number; mood?: Mood}> = ({x, y, s = 0.5, rot = 0, mood = 'wink'}) => (
  <FrameMove m={IDENTITY} who="germ"><Svg><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}><Bacteria mood={mood} look={[-0.4, 0.3]} /></g></Svg></FrameMove>
);

// ------------------------------------------------------------------ the moments (look sheets)
const KID = castById('kid');
/** Where the knuckles press: on the upper lid above the dome. */
export const PRESS: [number, number] = [700, 470];
export const MomentHook: React.FC = () => (
  <EyeFull red={0.8} squash={0.7} mood="pain" mouth="grit" look={[0.4, -0.7]} lid={0.4}>
    <KnucklesAt x={PRESS[0]} y={PRESS[1] + 75} scale={0.95} rot={-8} mood="wink" mouth="big" look={[0, 0.4]} skin={KID.skin} />
  </EyeFull>
);
export const MomentGerms: React.FC = () => (
  <EyeFull red={0.85} squash={0.4} mood="shock" mouth="o" look={[0.6, -0.5]}>
    <KnucklesAt x={PRESS[0] + 20} y={PRESS[1] - 60} scale={0.95} rot={-8} mood="happy" mouth="smile" look={[-0.4, 0.5]} skin={KID.skin} />
    <GermAt x={900} y={700} s={0.55} rot={10} />
    <GermAt x={990} y={820} s={0.45} rot={-14} />
    <GermAt x={860} y={1080} s={0.5} rot={6} />
  </EyeFull>
);
export const MomentCone: React.FC = () => (
  <EyeFull red={0.6} squash={0} cone={1} mood="shock" mouth="o" look={[0.9, 0.1]}>
    <KnucklesAt x={PRESS[0] + 40} y={PRESS[1] - 140} scale={0.95} rot={-8} mood="side" mouth="smile" look={[-0.5, 0.4]} skin={KID.skin} />
  </EyeFull>
);
export const MomentCalm: React.FC = () => <EyeFull red={0.15} squash={0} cone={0} mood="happy" mouth="big" look={[0.3, -0.2]} />;
export const MomentClinic: React.FC = () => (
  <Scene bg="#f1ede4"><V9>
    <PaleClinicRoom wall="grey" items={['door', 'frame']} />
    <PersonAt spec={KID} pose="worried" view="three-quarter" facing="right" expr="worried" lookAt={[800, 720]} x={300} y={1760} scale={3.15} />
    <DoctorAt view="three-quarter" facing="left" expr="neutral" lookAt={[300, 1080]} x={815} y={2050} scale={3.4} />
  </V9></Scene>
);
export const KnucklesSheet: React.FC = () => (
  <Scene bg="#f7ece4"><V9>
    <KnucklesAt x={300} y={1000} scale={0.8} mood="wink" mouth="big" look={[0, 0.3]} skin={KID.skin} />
    <KnucklesAt x={800} y={1000} scale={0.8} mood="happy" mouth="smile" look={[-0.4, 0.3]} skin={KID.skin} />
    <KnucklesAt x={300} y={1700} scale={0.8} mood="side" mouth="smile" look={[0.5, 0]} skin={KID.skin} />
    <KnucklesAt x={800} y={1700} scale={0.8} mood="shock" mouth="o" look={[0, -0.4]} skin={KID.skin} />
  </V9></Scene>
);
void EDGE_IN;
