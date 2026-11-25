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
  place: '#f2b9a0', socket: '#e79f88', bone: '#f3dcc0', fat: '#f6d58e', muscle: '#d9737a',
  white: '#fbf3ee', whiteRed: '#f6c9c4', vessel: '#d8484f', iris: '#4f8fc7', irisDeep: '#2f5f95', pupil: '#2b1a17',
  lens: '#f3e7c8', cornea: '#d8f0fb', nerve: '#f2d06f', lid: '#e3a27f', lash: '#3a2722',
};
/** The eyeball: centre and radius in frame pixels (the face sits on the white, left of centre, clear of the caption band). */
export const BALL = {x: 460, y: 980, r: 450};
export const EYE_FACE: [number, number] = [340, 900];

/** The bony socket and the soft tissue round the eye: big tone-on-tone shapes, no outline (a quiet place). */
const SocketBack: React.FC<{c: string}> = ({c}) => (
  <g>
    <path d="M -40 -40 L 1120 -40 L 1120 380 Q 600 300 -40 420 Z" fill={tint(EYE_COL.bone, 0.1)} />
    <path d="M -40 1500 Q 560 1400 1120 1480 L 1120 1960 L -40 1960 Z" fill={tint(EYE_COL.bone, 0.05)} />
    {[[140, 520, 120, 70], [930, 560, 110, 80], [120, 1300, 130, 90], [600, 1440, 150, 60], [960, 1350, 100, 70], [330, 1620, 140, 60], [800, 1680, 150, 60]].map(([x, y, rx, ry], i) => (
      <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={i % 2 ? shade(c, 0.06) : tint(c, 0.1)} />
    ))}
    {/* the fat cushion behind the ball and the muscle bands holding it */}
    <ellipse cx={170} cy={900} rx={190} ry={300} fill={tint(EYE_COL.fat, 0.2)} />
    <path d="M 120 620 Q 300 600 420 560" stroke={tint(EYE_COL.muscle, 0.25)} strokeWidth={46} strokeLinecap="round" fill="none" />
    <path d="M 120 1180 Q 300 1200 420 1240" stroke={tint(EYE_COL.muscle, 0.25)} strokeWidth={46} strokeLinecap="round" fill="none" />
  </g>
);

export type EyeState = {red?: number; squash?: number; cone?: number; wet?: number};
export const EyeFull: React.FC<EyeState & {mood?: Mood; mouth?: MouthKind; look?: [number, number]; lid?: number; place?: string; children?: React.ReactNode}> = ({
  red = 0, squash = 0, cone = 0, mood = 'open', mouth = 'smile', look = [0.4, 0], lid, place = EYE_COL.place, children,
}) => {
  const r = clamp01(red), q = clamp01(squash), k = clamp01(cone);
  const {x, y} = BALL;
  const rx = BALL.r * (1 + 0.07 * q), ry = BALL.r * (1 - 0.12 * q);
  const cy = y + 0.12 * q * BALL.r; // pressed down from above
  const white = mix(EYE_COL.white, EYE_COL.whiteRed, r * 0.7);
  // the front (right) of the ball: the dome bulges out past the white; with `cone` it thins and comes to a point
  const fx = x + rx - 30;
  const domeOut = 120 + 80 * k, domeH = 250 - 60 * k;
  const dome = smoothD([[fx, cy - domeH], [fx + domeOut * 0.55, cy - domeH * 0.75], [fx + domeOut * (0.9 + 0.1 * k), cy - domeH * (0.3 - 0.25 * k)], [fx + domeOut, cy], [fx + domeOut * (0.9 + 0.1 * k), cy + domeH * (0.3 - 0.25 * k)], [fx + domeOut * 0.55, cy + domeH * 0.75], [fx, cy + domeH]]);
  const thick = 26 - 18 * k; // the dome's wall thins
  const vessels: [number, number][][] = [[[x - 300, cy - 120], [x - 200, cy - 70], [x - 120, cy - 110], [x - 40, cy - 60]], [[x - 280, cy + 160], [x - 170, cy + 120], [x - 90, cy + 170]], [[x + 40, cy - 260], [x + 120, cy - 200], [x + 200, cy - 230]], [[x + 60, cy + 250], [x + 150, cy + 200], [x + 230, cy + 240]], [[x - 120, cy - 290], [x - 40, cy - 240]]];
  return (
    <Scene bg={place}><V9>
      <Svg>
        <SocketBack c={place} />
        {/* the optic nerve leaving the back of the ball */}
        <Shape d={smoothD([[x - rx + 30, cy - 50], [x - rx - 140, cy - 60], [-60, cy - 80], [-60, cy + 70], [x - rx - 140, cy + 60], [x - rx + 30, cy + 50]])} fill={EYE_COL.nerve} shadow={1.5}>
          <path d={`M ${x - rx - 120} ${cy} L -40 ${cy - 6}`} {...INLINE} />
        </Shape>
        {/* the eyeball */}
        <Shape d={`M ${x - rx} ${cy} A ${rx} ${ry} 0 1 1 ${x + rx} ${cy} A ${rx} ${ry} 0 1 1 ${x - rx} ${cy} Z`} fill={white} shadow={3}>
          {/* the pink flush of itchy redness and its vessels, clear of the face */}
          {r > 0.01 && <ellipse cx={x + 60} cy={cy} rx={rx * 0.85} ry={ry * 0.8} fill="#f08a8a" opacity={0.18 * r} />}
          {r > 0.01 && vessels.map((pts, i) => <path key={i} d={`M ${pts.map((p) => p.join(' ')).join(' L ')}`} stroke={EYE_COL.vessel} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={Math.min(1, r * 1.3)} />)}
          <Highlight x={x - 160} y={cy - ry * 0.72} w={120} rot={-24} />
        </Shape>
        {/* the iris and the lens behind the dome, at the front */}
        <Shape d={`M ${fx - 40} ${cy - 210} Q ${fx + 10} ${cy} ${fx - 40} ${cy + 210} L ${fx - 70} ${cy + 200} Q ${fx - 30} ${cy} ${fx - 70} ${cy - 200} Z`} fill={EYE_COL.iris} shadow={0.8} line="in">
          <path d={`M ${fx - 44} ${cy - 60} Q ${fx - 34} ${cy} ${fx - 44} ${cy + 60}`} stroke={EYE_COL.pupil} strokeWidth={22} strokeLinecap="round" fill="none" />
        </Shape>
        <Shape d={`M ${fx - 140} ${cy} C ${fx - 140} ${cy - 120} ${fx - 70} ${cy - 150} ${fx - 60} ${cy} C ${fx - 70} ${cy + 150} ${fx - 140} ${cy + 120} ${fx - 140} ${cy} Z`} fill={EYE_COL.lens} shadow={0.6} line="in" />
        {/* the clear dome (cornea): a pale glassy wall over a clear space; thinner and pointed with `cone` */}
        <path d={dome} fill={tint(EYE_COL.cornea, 0.5)} opacity={0.75} />
        <path d={dome} fill="none" stroke={shade(EYE_COL.cornea, 0.22)} strokeWidth={thick} strokeLinejoin="round" opacity={0.8} />
        <path d={dome} {...EDGE} fill="none" />
        <path d={`M ${fx + domeOut * 0.4} ${cy - domeH * 0.62} Q ${fx + domeOut * 0.75} ${cy - domeH * 0.4} ${fx + domeOut * 0.85} ${cy - domeH * 0.12}`} stroke="#ffffff" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.9} />
        {/* the eyelids: a cap above and a cap below the dome, each from the ball's front quarter out to a rounded tip at the
            dome's edge (never across it), lashes at the tip; the upper cap dented when the knuckles press */}
        {([-1, 1] as const).map((sgn) => {
          const P = (deg: number, grow: number): [number, number] => [x + Math.cos((deg * Math.PI) / 180) * (rx + grow), cy + sgn * Math.sin((Math.abs(deg) * Math.PI) / 180) * (ry + grow)];
          const dent = sgn < 0 ? 50 * q : 0;
          const a: [number, number] = P(-78, 0);
          const tip: [number, number] = [fx + domeOut * 0.42, cy + sgn * (domeH + 6)];
          const out: [number, number] = P(-40, 190 - dent);
          const inn: [number, number] = P(-36, -4);
          const d = `M ${a[0]} ${a[1]} Q ${out[0]} ${out[1]} ${tip[0] + 22} ${tip[1] + sgn * 26} Q ${tip[0] + 10} ${tip[1] - sgn * 6} ${tip[0] - 14} ${tip[1] - sgn * 4} Q ${inn[0]} ${inn[1]} ${a[0]} ${a[1]} Z`;
          return (
            <g key={sgn}>
              <Shape d={d} fill={mix(EYE_COL.lid, '#e88b80', r * 0.5)} shadow={1.1} />
              {[0, 1, 2, 3].map((n) => <path key={n} d={`M ${tip[0] + 4 + n * 9} ${tip[1] + sgn * 4} q ${26 + n * 4} ${sgn * (14 + n * 5)} ${44 + n * 2} ${sgn * (34 + n * 6)}`} stroke={EYE_COL.lash} strokeWidth={7} strokeLinecap="round" fill="none" />)}
            </g>
          );
        })}
        {/* the face on the white of the eye */}
        <Eyes x={EYE_FACE[0]} y={EYE_FACE[1]} r={84} mood={mood} look={look} lid={lid} brows />
        <Mouth x={EYE_FACE[0]} y={EYE_FACE[1] + 150} w={90} kind={mouth} />
      </Svg>
      {children}
    </V9></Scene>
  );
};

// ------------------------------------------------------------------ the Knuckles
export type KnuckleArms = 'press' | 'wave' | 'rub';
/** A fist seen knuckles-first, ONE face across the back of the hand; origin at the middle of the knuckle row; about 420 wide. */
export const Knuckles: React.FC<{mood?: Mood; mouth?: MouthKind; look?: [number, number]; lid?: number; skin?: string}> = ({mood = 'wink', mouth = 'big', look = [0, 0.3], lid, skin = '#d6a07a'}) => {
  const back = smoothD([[-210, -10], [-220, -160], [-170, -300], [-40, -340], [110, -330], [210, -260], [230, -120], [220, -10]]);
  return (
    <g>
      {/* the wrist going up and out of frame */}
      <Shape d="M -150 -300 L -170 -700 L 150 -700 L 170 -300 Z" fill={shade(skin, 0.04)} shadow={1} />
      {/* the back of the hand with the face */}
      <Shape d={back} fill={skin} shadow={1.4}>
        <Highlight x={-120} y={-270} w={70} rot={-14} />
      </Shape>
      {/* the four knuckle bumps along the bottom, each a finger bent under */}
      {[-165, -55, 55, 165].map((kx, i) => (
        <Shape key={i} d={smoothD([[kx - 58, -40], [kx - 50, 30], [kx, 62], [kx + 50, 30], [kx + 58, -40], [kx, -60]])} fill={tint(skin, 0.06)} shadow={0.8}>
          <path d={`M ${kx - 24} 18 Q ${kx} 30 ${kx + 24} 18`} {...INLINE} />
        </Shape>
      ))}
      {/* the thumb along the side */}
      <Shape d={smoothD([[200, -220], [270, -170], [290, -60], [250, 0], [210, -40], [214, -150]])} fill={skin} shadow={0.8} />
      <Eyes x={0} y={-200} r={46} mood={mood} look={look} lid={lid} brows />
      <Mouth x={0} y={-104} w={62} kind={mouth} />
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
