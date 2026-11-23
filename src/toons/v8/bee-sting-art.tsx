/**
 * "What Happens When a Bee Stings You" (`bee-sting`), engine v9: this video's new drawings and its moments, for the owner's
 * look sheets and the shots.
 *   Stinger       the intruder with a face: a barbed lance in the skin, a wobbly venom sac above the surface with the face on
 *                 it, two tiny arms; `squeeze` pinches the sac (the tweezers would squeeze poison out: NHS)
 *   Lump          the swollen lump on the surface (NHS: "a small, swollen lump on the skin")
 *   BankCard      the card whose edge scrapes the stinger out sideways (NHS)
 *   GiantTweezers the kit's tweezers, huge, coming down from the air above the skin
 * Moments: the hook (the Stinger spears in), the swell, the tweezers, the card scrape, the lump close-up before/after, the clinic.
 */
import React from 'react';
import {Put, Scene} from './scene';
import {CLOTH, EDGE, EDGE_IN, Eyes, Highlight, INK, INLINE, Mouth, Shape, shade, smoothD, tint, TinyArm, V9, type Mood, type MouthKind} from './kit';
import {STAGES} from './anatomy';
import {MiniWorker} from './cells';
import {Tweezers} from './props';
import {castById, PersonAt} from './people-rig';
import {PaleClinicRoom} from './scenes-rooms';
import {FrameMove, matTranslate, useReport} from './play';

const Skin = STAGES.skinSection.Stage, Tissue = STAGES.tissue.Stage;
const SKIN_Y = 250;
/** Where the stinger went in (STAGE pixels: on the stage's own wound mark) and the skin colour of the stage. */
export const STING_AT: [number, number] = [540, 236];
/**
 * The skin stage has only a thin band of air above the surface (y 0-250): the Stinger's sac and face stand above the surface,
 * so the whole stage is moved DOWN by SKY and the air continues above it. The surface then sits at y 630 of the frame, the
 * Stinger's face at about y 450, the guards' faces above the caption band.
 */
export const SKY = 380;
const AIR = '#f1ebe0';
/** The skin stage lowered by SKY, the air above it, and anything placed in STAGE pixels inside (the log knows the move). */
export const SkinFrame: React.FC<{t: number; state: Record<string, number>; layer?: React.ReactNode; inside?: React.ReactNode; over?: React.ReactNode}> = ({t, state, layer, inside, over}) => (
  <>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: SKY + 40, background: AIR}} />
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `translateY(${SKY}px)`}}>
      <FrameMove m={matTranslate(0, SKY)}>
        <Skin t={t} state={state} layer={layer}>{inside}</Skin>
        {over}
      </FrameMove>
    </div>
  </>
);
const SKIN = '#e9b48f';

// ------------------------------------------------------------------ the Stinger
const SAC = '#f2c14e', SAC_DEEP = '#d99a2b', LANCE = '#4a3426';
export type StingerArms = 'rest' | 'rub' | 'cheer' | 'flail';
/**
 * Drawn with its origin at the skin entry point (0, 0): the lance points DOWN into the skin (barbs pointing back up), the sac
 * sits above the surface with the face on it. `squeeze` 0..1 pinches the sac's waist and pushes the venom level down the lance.
 */
export const Stinger: React.FC<{mood?: Mood; mouth?: MouthKind; look?: [number, number]; lid?: number; squeeze?: number; arms?: StingerArms; depth?: number}> = ({
  mood = 'wink', mouth = 'smile', look = [0, 0.3], lid, squeeze = 0, arms = 'rest', depth = 1,
}) => {
  const len = 380 * depth;
  const pinch = 1 - 0.32 * squeeze;
  // the sac: a soft pear, wider at the top, its waist pinched by `squeeze`
  const sac = smoothD([[0, -12], [56 * pinch, -40], [92, -104], [104, -168], [70, -222], [0, -236], [-70, -222], [-104, -168], [-92, -104], [-56 * pinch, -40]]);
  const barbs = Array.from({length: 7}, (_, i) => 40 + i * ((len - 70) / 7));
  const armAt = (side: 1 | -1): {to: [number, number]; bend: [number, number]} => {
    if (arms === 'cheer') return {to: [side * 150, -250], bend: [side * 128, -170]};
    if (arms === 'rub') return {to: [side * 22, -78], bend: [side * 118, -92]};
    if (arms === 'flail') return {to: [side * 170, side > 0 ? -120 : -210], bend: [side * 140, -150]};
    return {to: [side * 128, -64], bend: [side * 122, -110]};
  };
  return (
    <g>
      {/* the lance, into the skin: a tapering dark spike with barbs pointing back up */}
      <path d={`M -15 0 L 15 0 L 3 ${len} L -3 ${len} Z`} fill={LANCE} {...EDGE} />
      {barbs.map((y, i) => {
        const w = 15 - (12 * y) / len;
        return <g key={i}>
          <path d={`M ${-w} ${y} L ${-w - 16} ${y - 22} L ${-w} ${y - 14} Z`} fill={LANCE} {...EDGE_IN} />
          <path d={`M ${w} ${y} L ${w + 16} ${y - 22} L ${w} ${y - 14} Z`} fill={LANCE} {...EDGE_IN} />
        </g>;
      })}
      {/* the poison pushed down the lance when the sac is squeezed */}
      {squeeze > 0.05 && <path d={`M -6 4 L 6 4 L 3 ${40 + 220 * squeeze} L -3 ${40 + 220 * squeeze} Z`} fill={SAC_DEEP} opacity={0.85} />}
      {/* the arms behind the sac */}
      {([-1, 1] as const).map((side) => { const a = armAt(side); return <TinyArm key={side} from={[side * 78, -120]} to={a.to} bend={a.bend} fill={SAC} w={11} hand="mitten" />; })}
      {/* the sac with the venom inside (a darker level) and the face */}
      <Shape d={sac} fill={SAC} shadow={1.2}>
        <path d={smoothD([[0, -16], [52 * pinch, -42], [84, -96], [94, -132 + 30 * squeeze], [0, -140 + 30 * squeeze], [-94, -132 + 30 * squeeze], [-84, -96], [-52 * pinch, -42]])} fill={SAC_DEEP} opacity={0.55} />
        <path d="M -60 -150 Q 0 -168 60 -150" {...INLINE} />
        <Highlight x={-54} y={-196} w={34} rot={-40} />
      </Shape>
      <Eyes x={0} y={-176} r={30} gap={6} mood={mood} look={look} lid={lid} />
      <Mouth x={2} y={-122} w={34} kind={mouth} />
      <StingerReport look={look} />
    </g>
  );
};
/** The Stinger's face and eyes for the layout log (in its own units; the enclosing FrameMove places them). */
const StingerReport: React.FC<{look: [number, number]}> = ({look}) => {
  const report = useReport();
  report({kind: 'face', who: 'stinger', box: {x0: -100, y0: -236, x1: 100, y1: -96}, dir: look});
  report({kind: 'eye', who: 'stinger', box: {x0: -70, y0: -206, x1: 70, y1: -146}});
  return null;
};

// ------------------------------------------------------------------ the lump, the card, the tweezers
/** The swollen lump: the surface bulges up around the sting. k 0..1. */
export const Lump: React.FC<{x?: number; k: number; w?: number}> = ({x = STING_AT[0], k, w = 520}) => {
  if (k <= 0.01) return null;
  const h = 92 * k;
  return (
    <g>
      <path d={`M ${x - w / 2} ${SKIN_Y + 6} Q ${x - w * 0.28} ${SKIN_Y - h} ${x} ${SKIN_Y - h * 1.05} Q ${x + w * 0.28} ${SKIN_Y - h} ${x + w / 2} ${SKIN_Y + 6} Z`} fill={SKIN} {...EDGE} />
      <path d={`M ${x - w * 0.3} ${SKIN_Y - h * 0.55} Q ${x - w * 0.15} ${SKIN_Y - h * 0.9} ${x} ${SKIN_Y - h * 0.95}`} stroke={tint(SKIN, 0.45)} strokeWidth={8} fill="none" strokeLinecap="round" />
    </g>
  );
};
/** A bank card seen at an angle, its long edge leading. */
export const BankCard: React.FC = () => (
  <g>
    <Shape d="M -150 -94 L 150 -94 Q 166 -94 166 -78 L 166 78 Q 166 94 150 94 L -150 94 Q -166 94 -166 78 L -166 -78 Q -166 -94 -150 -94 Z" fill={tint(CLOTH.sky, 0.1)} shadow={1}>
      <rect x={-166} y={-52} width={332} height={30} fill={shade(CLOTH.sky, 0.35)} />
      <rect x={-118} y={4} width={52} height={40} rx={8} fill={CLOTH.yellow} {...EDGE_IN} />
      <path d="M -40 56 H 120 M -40 72 H 60" {...INLINE} />
    </Shape>
  </g>
);
/** Giant tweezers coming straight down from above, the tips at (0, 0), `open` 0..1 (1: the prongs apart, 0: pinched). */
export const GiantTweezers: React.FC<{open?: number}> = ({open = 1}) => {
  const g = 40 + 90 * open; // half the gap at the tips
  const prong = (side: 1 | -1) => `M ${side * 18} -620 Q ${side * (g + 34)} -260 ${side * g} -10 Q ${side * (g - 4)} 6 ${side * (g - 18)} -2 Q ${side * (g + 10)} -260 ${side * 2} -620 Z`;
  return (
    <g>
      <Shape d={prong(-1)} fill={CLOTH.grey} shadow={1}><Highlight x={-g - 10} y={-300} w={60} rot={-80} /></Shape>
      <Shape d={prong(1)} fill={CLOTH.grey} shadow={1} />
      <Shape d="M -30 -660 L 30 -660 L 26 -600 L -26 -600 Z" fill={shade(CLOTH.grey, 0.2)} shadow={0.6} />
      <Shape d={`M ${-g - 26} -330 L ${-g - 6} -330 L ${-g - 10} -230 L ${-g - 30} -230 Z`} fill={CLOTH.teal} shadow={0.3} line="in" />
      <Shape d={`M ${g + 26} -330 L ${g + 6} -330 L ${g + 10} -230 L ${g + 30} -230 Z`} fill={CLOTH.teal} shadow={0.3} line="in" />
    </g>
  );
};
void Tweezers;

// ------------------------------------------------------------------ the guard crew
/** The skin's guards, standing in the dermis either side of the lance (clear of the Stinger's face and the caption band). */
const GUARDS: [number, number, number][] = [[190, 600, 230], [820, 600, 250], [990, 590, 210]]; // STAGE pixels: in the dermis above the vessel
export const GuardCrew: React.FC<{lead?: {mood?: Mood; mouth?: MouthKind}; alarm?: number; look?: [number, number]}> = ({lead, alarm = 0, look = [-0.4, -0.3]}) => (
  <>
    {GUARDS.map(([x, y, s], i) => (
      <Put key={i} x={x} y={y - alarm * 18} size={s}>
        <MiniWorker job="guard" band={i === 1 ? 'GUARD' : undefined} pose={i === 1 ? (alarm > 0.5 ? 'up' : 'hold') : 'rest'}
          mood={i === 1 && lead?.mood ? lead.mood : alarm > 0.5 ? 'shock' : 'open'} mouth={i === 1 && lead?.mouth ? lead.mouth : alarm > 0.5 ? 'o' : 'smile'} look={i === 0 ? [0.5, -0.3] : look} />
      </Put>
    ))}
  </>
);

// ------------------------------------------------------------------ the moments (look sheets)
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} viewBox="0 0 1080 1920">{children}</svg>
);
const StingerAt: React.FC<React.ComponentProps<typeof Stinger> & {x?: number; y?: number; rot?: number; scale?: number}> = ({x = STING_AT[0], y = STING_AT[1], rot = 0, scale = 1, ...p}) => (
  <FrameMove m={[1, 0, 0, 1, 0, 0]}><Svg><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}><Stinger {...p} /></g></Svg></FrameMove>
);

/** A1: the hook: the Stinger has just speared in and grins at the lens; the guards jump. */
export const MomentHook: React.FC = () => (
  <Scene bg="#000"><V9>
    <SkinFrame t={1} state={{wound: 0.5, swelling: 0.2}} inside={<GuardCrew alarm={1} look={[-0.5, -0.4]} />}
      over={<StingerAt mood="wink" mouth="big" look={[0, 0.35]} arms="cheer" />} />
  </V9></Scene>
);
/** A3: the guard leader calls "swell it up": the lump rises (the Stinger rides up on it), redness under it. */
export const MomentSwell: React.FC = () => (
  <Scene bg="#000"><V9>
    <SkinFrame t={2} state={{wound: 0.5, swelling: 0.9}} layer={<Lump k={0.8} />} inside={<GuardCrew alarm={1} lead={{mood: 'angry', mouth: 'big'}} look={[-0.6, -0.5]} />}
      over={<StingerAt y={STING_AT[1] - 74} mood="shock" mouth="o" look={[0.5, 0.5]} arms="rest" />} />
  </V9></Scene>
);
/** B1-B3: giant tweezers come down round the sac; the Stinger cheers ("squeeze me!"), the guards shout no. */
export const MomentTweezers: React.FC = () => (
  <Scene bg="#000"><V9>
    <SkinFrame t={3} state={{wound: 0.5, swelling: 0.9}} layer={<Lump k={0.8} />} inside={<GuardCrew alarm={1} lead={{mood: 'shock', mouth: 'big'}} look={[-0.6, -0.6]} />}
      over={<>
        <StingerAt y={STING_AT[1] - 74} mood="happy" mouth="big" look={[0, -0.6]} arms="cheer" squeeze={0.35} />
        <Svg><g transform={`translate(${STING_AT[0]} ${STING_AT[1] - 74 - 60})`}><GiantTweezers open={0.85} /></g></Svg>
      </>} />
  </V9></Scene>
);
/** B4-B5: the card edge sweeps in sideways along the surface and flicks the Stinger out. */
export const MomentCard: React.FC = () => (
  <Scene bg="#000"><V9>
    <SkinFrame t={4} state={{wound: 0.4, swelling: 0.8}} layer={<Lump k={0.75} />} inside={<GuardCrew alarm={0.3} lead={{mood: 'happy', mouth: 'big'}} look={[0.6, -0.6]} />}
      over={<>
        <Svg><g transform={`translate(360 ${SKIN_Y - 150}) rotate(-6)`}><BankCard /></g></Svg>
        <StingerAt x={800} y={-40} rot={58} scale={0.9} mood="shock" mouth="o" look={[-0.4, 0]} arms="flail" />
      </>} />
  </V9></Scene>
);
/** C1 and C2: the lump close up (the tissue under it), the crew resting; 2 DAYS LATER the redness smaller. */
export const MomentLump: React.FC<{later?: boolean}> = ({later}) => (
  <Scene bg="#000"><V9>
    <Tissue t={5} state={{damage: 0, swelling: later ? 0.35 : 1}}>
      {[[300, 1180, 300], [540, 1220, 340], [790, 1180, 300]].map(([x, y, s], i) => (
        <Put key={i} x={x} y={y} size={s}>
          <MiniWorker job="guard" band={i === 1 ? 'GUARD' : undefined} pose="rest" mood={later ? 'open' : i === 1 ? 'side' : 'closed'} mouth={later ? 'smile' : 'flat'} look={[0, -0.4]} />
        </Put>
      ))}
    </Tissue>
  </V9></Scene>
);
export const MomentLumpLater: React.FC = () => <MomentLump later />;
/** D: the clinic: Mom, Kid showing the small red lump on his hand, Dr. Mira. */
export const MomentClinic: React.FC = () => {
  const mira = castById('doctor'), mom = castById('mom'), kid = castById('kid');
  return (
    <Scene bg="#f1ede4"><V9>
      <PaleClinicRoom wall="mint" items={['door', 'chart']} />
      <PersonAt spec={mom} pose="worried" view="three-quarter" facing="right" expr="worried" lookAt={[520, 1040]} x={210} y={2050} scale={3.4} />
      <PersonAt spec={mira} pose="clipboard" view="three-quarter" facing="left" expr="neutral" lookAt={[480, 1020]} x={850} y={2050} scale={3.4} />
      <PersonAt spec={kid} pose="showArm" view="three-quarter" facing="right" expr="worried" lookAt={[800, 720]} x={470} y={2050} scale={3.4}
        mark={[{kind: 'sore', at: 'handL'}]} />
    </V9></Scene>
  );
};
void INK;
