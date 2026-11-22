/**
 * MedPeak Toons, look v8: the organ frames of "What Happens If You Quit Sugar for 30 Days" (`quit-sugar`).
 * The owner, 2026-11-22: "when big organ frame come i want full view of organs like ref video". As in the
 * 20 reference Shorts, THE ORGAN IS THE STAGE: the whole organ fills the 1080 x 1920 frame, its face is on its
 * own wall (eyes about 170 px), tiny arms, and the scene itself changes state as the story goes.
 *
 *   LiverFull   the whole liver across the frame under the diaphragm, the stomach peeking
 *               in on the right, the gut coiled below. The same outline as the cast's `Liver`, scaled up.
 *     fat  0..1   1 = Day 1: pale, yellow-brown, big yellow fat patches; 0.5 = Day 10: the patches about half
 *                 the size, the colour back toward healthy red-brown ("liver fat nearly halved")
 *   MouthFull   the whole open mouth from the front: lips at the frame edges, the palate and the hanging uvula,
 *               a row of upper teeth on the gum, the lower teeth, and the big tongue in front.
 *     view 'tooth'   closer on the upper front teeth: one big front tooth has the face (Tooth, the bouncer)
 *          'tongue'  the whole mouth: the tongue has the face
 *     bits 0..1      sugar crystals stuck along the gum line and between the teeth
 *     buds 0..1      the tongue's taste buds wake: they turn yellow and little rays pop
 *
 * Kit only: one outline colour (non-scaling, so a scaled organ keeps the same line as the cast), flat fills,
 * one shade crescent, the kit face. No gradients, no glow.
 */
import React from 'react';
import {CLOTH, EDGE, EDGE_IN, Eyes, FLESH, INLINE, Mouth, Shape, shade, tint, TinyArm, type V8Props} from './kit';
import {Put, Layer, Scene} from './scene';
import {f, rnd} from './scenes-body';
import {ORGAN_COL, smooth} from './organs-a';
import {Sweetie} from './sugar-cast';

type P = [number, number];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** Mix two #rrggbb colours (k = 0 gives a, 1 gives b). */
const mix = (a: string, b: string, k: number) => {
  const h = (s: string, i: number) => parseInt(s.slice(1 + i * 2, 3 + i * 2), 16);
  return '#' + [0, 1, 2].map((i) => Math.round(h(a, i) + (h(b, i) - h(a, i)) * k).toString(16).padStart(2, '0')).join('');
};

// =================================================================== 1. the whole liver
export const LIVER_FULL = {cavity: '#f2c0b2', cavity2: '#e9a998', diaphragm: '#d8737a', rib: '#f4ead6', fatty: '#c99169', healthy: ORGAN_COL.liver, fat: '#f3d68a', gut: FLESH.coral, stomach: FLESH.salmon};
// the cast Liver's outline (organs-a), so the big liver is the same character
const LIVER_BODY: P[] = [[-84, -12], [-80, -40], [-60, -57], [-26, -64], [10, -62], [44, -54], [72, -42], [90, -29], [86, -18], [62, -5], [36, 9], [12, 23], [-14, 41], [-40, 53], [-63, 49], [-79, 27]];
// fat patches on the liver's face, in its own units, kept clear of the eyes and the mouth (around -36, -26)
const FAT: [number, number, number][] = [[28, -40, 11], [54, -28, 8], [8, -12, 10], [-14, 22, 9], [-62, 30, 7], [36, -14, 6], [-6, -46, 7], [70, -36, 5], [-40, 38, 6]];

export const LiverFull: React.FC<V8Props & {t: number; fat?: number}> = ({fat = 1, mood = 'sleepy', mouth = 'smile', look = [0, 0.2]}) => {
  const k = clamp01(fat);
  const fatty = clamp01((k - 0.4) / 0.6); // how far the colour leans to the pale, fatty liver
  const body = mix(LIVER_FULL.healthy, LIVER_FULL.fatty, fatty);
  const S = 6.2; // the cast liver, about 6 times bigger, filling the width
  return (
    <Scene bg={LIVER_FULL.cavity}>
      <Layer>
        {/* the cavity wall: a few soft folds */}
        {[[200, 1450, 240], [880, 1400, 200]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.5} fill={LIVER_FULL.cavity2} />)}
        {/* the diaphragm: a muscle dome across the top, with its fibre lines */}
        <path d="M -40 -40 L 1120 -40 L 1120 520 Q 540 360 -40 520 Z" {...EDGE} fill={LIVER_FULL.diaphragm} />
        {[-1, -0.6, -0.2, 0.2, 0.6, 1].map((u, i) => <path key={i} d={`M ${f(540 + u * 560)} 0 Q ${f(540 + u * 420)} 220 ${f(540 + u * 520)} ${f(470 - (1 - Math.abs(u)) * 70)}`} {...INLINE} opacity={0.6} />)}
        {/* the gut below: coils running off the bottom */}
        {[[160, 1640, 190, 120], [480, 1720, 210, 130], [820, 1650, 200, 120], [300, 1880, 220, 120], [700, 1900, 230, 130], [1040, 1860, 160, 120]].map(([x, y, rx, ry], i) => (
          <g key={i}>
            <ellipse cx={x} cy={y} rx={rx} ry={ry} {...EDGE} fill={LIVER_FULL.gut} />
            <path d={`M ${x - rx * 0.6} ${y} Q ${x} ${y - ry * 0.5} ${x + rx * 0.6} ${y}`} {...INLINE} />
          </g>
        ))}
        {/* the stomach peeking in on the right, under the liver's tip */}
        <path d="M 1120 1080 Q 900 1060 820 1220 Q 780 1380 940 1460 Q 1060 1500 1120 1440 Z" {...EDGE} fill={LIVER_FULL.stomach} />
        <path d="M 880 1260 Q 960 1300 1060 1270" {...INLINE} />
      </Layer>
      {/* the liver itself, its face on its wall */}
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={`translate(540 960) scale(${S})`}>
          <TinyArm from={[-74, 32]} bend={[-90, 46]} to={[-78, 64]} fill={body} hand="mitten" />
          <Shape d={smooth([[-26, 36], [-10, 34], [-4, 50], [-12, 62], [-24, 58]])} fill={ORGAN_COL.gall} shadow={0.5} />
          <Shape d={smooth(LIVER_BODY)} fill={body}>
            <path d="M 16 -62 Q 10 -24 2 26" {...INLINE} />
            <path d="M 30 -4 Q 52 -14 72 -26" {...INLINE} />
            {FAT.map(([x, y, r], i) => {
              const rr = r * (0.25 + 0.75 * k);
              return (
                <g key={i}>
                  <path d={smooth(Array.from({length: 7}, (_, j): P => {
                    const a = (j / 7) * Math.PI * 2, q = 1 + (rnd(j, i + 40) - 0.5) * 0.3;
                    return [x + Math.cos(a) * rr * q, y + Math.sin(a) * rr * 0.8 * q];
                  }))} fill={LIVER_FULL.fat} {...EDGE_IN} />
                  <circle cx={x - rr * 0.35} cy={y - rr * 0.3} r={rr * 0.22} fill="#ffffff" opacity={0.8} />
                </g>
              );
            })}
          </Shape>
          <TinyArm from={[22, 18]} bend={[34, 38]} to={[22, 54]} fill={body} hand="mitten" />
          <Eyes x={-36} y={-28} r={14} mood={mood} look={look} brows />
          <Mouth x={-36} y={-2} w={14} kind={mouth} />
        </g>
      </svg>
    </Scene>
  );
};

// =================================================================== 2. the whole open mouth
export const MOUTH_FULL = {inside: '#5a1f2a', throat: '#2f1017', palate: '#e88f95', palate2: '#d97880', uvula: '#e07d86', gum: '#ec8b92', lip: '#d9737b', tongue: FLESH.salmon, bud: shade(FLESH.salmon, 0.16), lit: CLOTH.yellow, tooth: ORGAN_COL.tooth};
/** The gum line: the upper teeth hang from it; it curves down toward the sides. */
const gumY = (x: number) => 330 + ((x - 540) / 540) ** 2 * 170;
const UPPER: {x: number; w: number; h: number}[] = [
  {x: 70, w: 150, h: 200}, {x: 225, w: 165, h: 230}, {x: 418, w: 230, h: 300}, {x: 662, w: 230, h: 300}, {x: 855, w: 165, h: 230}, {x: 1010, w: 150, h: 200},
];
const LOWER: {x: number; w: number}[] = [{x: 110, w: 140}, {x: 255, w: 150}, {x: 405, w: 150}, {x: 675, w: 150}, {x: 825, w: 150}, {x: 970, w: 140}];
const toothPath = (x: number, top: number, w: number, h: number) => {
  const l = x - w / 2, r = x + w / 2, b = top + h;
  return `M ${f(l)} ${f(top)} L ${f(r)} ${f(top)} L ${f(r - 4)} ${f(b - 46)} Q ${f(r - 10)} ${f(b)} ${f(x + w * 0.2)} ${f(b - 2)} Q ${f(x)} ${f(b + 6)} ${f(x - w * 0.2)} ${f(b - 2)} Q ${f(l + 10)} ${f(b)} ${f(l + 4)} ${f(b - 46)} Z`;
};
// the taste buds on the tongue (frame coordinates), kept off the face
const BUDS: P[] = [[300, 1130], [780, 1130], [250, 1330], [830, 1330], [330, 1560], [750, 1560], [540, 1660], [420, 1760], [660, 1760], [220, 1700], [860, 1700], [540, 1080]];

export const MouthFull: React.FC<{t: number; view?: 'tooth' | 'tongue'; bits?: number; buds?: number; tooth?: V8Props; tongue?: V8Props}> = ({view = 'tongue', bits = 0, buds = 0, tooth = {mood: 'angry', mouth: 'grit'}, tongue = {mood: 'open', mouth: 'smile'}}) => {
  const b = clamp01(bits), lit = clamp01(buds);
  const zoom = view === 'tooth' ? 'translate(540 760) scale(1.75) translate(-540 -493)' : '';
  const T = UPPER[2]; // the face tooth: the left front tooth
  const tTop = gumY(T.x) - 8;
  return (
    <Scene bg={MOUTH_FULL.inside}>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={zoom}>
          {/* the throat at the back, the palate above, the uvula hanging in the middle */}
          <ellipse cx={540} cy={860} rx={250} ry={300} fill={MOUTH_FULL.throat} />
          <path d={`M -60 -60 H 1140 V ${gumY(1080) + 160} Q 540 640 -60 ${gumY(0) + 160} Z`} {...EDGE} fill={MOUTH_FULL.palate} />
          {[0, 1, 2].map((i) => <path key={i} d={`M ${300 - i * 40} ${470 + i * 50} Q 540 ${420 + i * 50} ${780 + i * 40} ${470 + i * 50}`} stroke={MOUTH_FULL.palate2} strokeWidth={10} strokeLinecap="round" fill="none" />)}
          {/* the soft palate: an arch over the throat at the back, the uvula hanging from its middle */}
          <path d="M 250 900 C 260 700 400 620 540 620 C 680 620 820 700 830 900 L 770 900 C 760 750 660 690 540 690 C 420 690 320 750 310 900 Z" {...EDGE} fill={MOUTH_FULL.uvula} />
          <path d="M 540 680 C 504 712 498 790 516 840 C 526 866 554 866 564 840 C 582 790 576 712 540 680 Z" {...EDGE} fill={MOUTH_FULL.uvula} />
          {/* the upper gum and the upper teeth hanging from it */}
          <path d={`M -60 ${gumY(-60) - 90} Q 540 ${gumY(540) - 150} 1140 ${gumY(1140) - 90} L 1140 ${gumY(1140) + 10} Q 540 ${gumY(540) - 50} -60 ${gumY(-60) + 10} Z`} {...EDGE} fill={MOUTH_FULL.gum} />
          {UPPER.map((u, i) => (
            <g key={i}>
              <Shape d={toothPath(u.x, gumY(u.x) - 8, u.w, u.h)} fill={MOUTH_FULL.tooth} shadeBy={0.08}>
                <path d={`M ${f(u.x - u.w * 0.28)} ${f(gumY(u.x) + 30)} Q ${f(u.x - u.w * 0.32)} ${f(gumY(u.x) + u.h * 0.45)} ${f(u.x - u.w * 0.26)} ${f(gumY(u.x) + u.h * 0.7)}`} stroke="#ffffff" strokeWidth={10} strokeLinecap="round" fill="none" />
              </Shape>
            </g>
          ))}
          {/* sugar crystals stuck at the gum line and between the teeth */}
          {Array.from({length: Math.round(b * 18)}, (_, i) => {
            const x = 60 + rnd(i, 61) * 960, y = gumY(x) + 6 + rnd(i, 62) * 50, s = 18 + rnd(i, 63) * 14;
            return <rect key={i} x={f(x - s / 2)} y={f(y - s / 2)} width={f(s)} height={f(s)} rx={4} fill="#ffffff" {...EDGE_IN} transform={`rotate(${f(rnd(i, 64) * 50 - 25)} ${f(x)} ${f(y)})`} />;
          })}
          {/* the face tooth: Tooth, the bouncer (only in the tooth view) */}
          {view === 'tooth' && (
            <g transform={`translate(${T.x} ${tTop + T.h * 0.5}) scale(2.6)`}>
              <TinyArm from={[-40, 10]} bend={[-66, 8]} to={[-64, -20]} fill={MOUTH_FULL.tooth} hand="fist" />
              <TinyArm from={[40, 10]} bend={[66, 8]} to={[64, -20]} fill={MOUTH_FULL.tooth} hand="fist" />
              <Eyes x={0} y={-12} r={13} mood={tooth.mood} look={tooth.look ?? [0, 0]} brows />
              <Mouth x={0} y={18} w={13} kind={tooth.mouth ?? 'grit'} />
            </g>
          )}
          {/* the lower teeth, low behind the tongue, and the lower gum */}
          {LOWER.map((u, i) => {
            const top = 1520 - ((u.x - 540) / 540) ** 2 * -60;
            return <Shape key={i} d={`M ${f(u.x - u.w / 2)} ${f(top + 160)} L ${f(u.x - u.w / 2 + 4)} ${f(top + 30)} Q ${f(u.x)} ${f(top - 14)} ${f(u.x + u.w / 2 - 4)} ${f(top + 30)} L ${f(u.x + u.w / 2)} ${f(top + 160)} Z`} fill={MOUTH_FULL.tooth} shadeBy={0.08} />;
          })}
          <path d="M -60 1680 Q 540 1640 1140 1680 L 1140 2000 L -60 2000 Z" {...EDGE} fill={MOUTH_FULL.gum} />
          {/* the tongue, big, in front */}
          <Shape d="M 150 1960 C 110 1560 150 1110 540 1030 C 930 1110 970 1560 930 1960 Z" fill={MOUTH_FULL.tongue} shadeBy={0.1}>
            <path d="M 540 1460 C 534 1600 546 1760 540 1960" {...INLINE} />
            {BUDS.map(([x, y], i) => {
              const on = lit > (i + 1) / (BUDS.length + 1);
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r={20} fill={on ? MOUTH_FULL.lit : MOUTH_FULL.bud} {...(on ? EDGE_IN : {})} />
                  {on && [[-1, -1], [0, -1.25], [1, -1]].map(([dx, dy], j) => (
                    <path key={j} d={`M ${f(x + dx * 30)} ${f(y + dy * 30)} L ${f(x + dx * 48)} ${f(y + dy * 50)}`} stroke={CLOTH.yellow} strokeWidth={9} strokeLinecap="round" />
                  ))}
                </g>
              );
            })}
          </Shape>
          {view === 'tongue' && (
            <g transform="translate(540 1330) scale(6.4)">
              <TinyArm from={[-50, 6]} bend={[-68, 0]} to={[-62, -26]} fill={MOUTH_FULL.tongue} hand="open" />
              <TinyArm from={[50, 6]} bend={[68, 0]} to={[62, -26]} fill={MOUTH_FULL.tongue} hand="open" />
              <Eyes x={0} y={-18} r={13} mood={tongue.mood} look={tongue.look ?? [0, 0]} brows={tongue.mood === 'sad'} />
              <Mouth x={0} y={10} w={14} kind={tongue.mouth ?? 'smile'} />
            </g>
          )}
          {/* the lips round the frame's edges */}
          <path d="M -80 -80 H 1160 V 2000 H -80 Z M 540 30 C 1000 30 1100 500 1100 960 C 1100 1500 1000 1890 540 1890 C 80 1890 -20 1500 -20 960 C -20 500 80 30 540 30 Z" fillRule="evenodd" fill={MOUTH_FULL.lip} {...EDGE} />
        </g>
      </svg>
    </Scene>
  );
};

// ------------------------------------------------------------------ the moments for the sheet
/** C, Day 7: the front tooth throws juice-Sweetie out; sugar crystals at the gum line. */
export const MomentToothFull: React.FC = () => (
  <>
    <MouthFull t={1} view="tooth" bits={1} tooth={{mood: 'angry', mouth: 'grit', look: [0.6, 0.4]}} />
    <Put x={820} y={1420} size={420} rot={18}><Sweetie wear="juice" mood="scared" mouth="o" arms="droop" look={[-0.6, -0.4]} /></Put>
  </>
);
export const MomentTongueDarkFull: React.FC = () => <MouthFull t={2} view="tongue" buds={0} tongue={{mood: 'open', mouth: 'flat', look: [0, -0.2]}} />;
export const MomentTongueLitFull: React.FC = () => <MouthFull t={3} view="tongue" buds={1} tongue={{mood: 'happy', mouth: 'big', look: [0, -0.3]}} />;
export const MomentLiverDay1: React.FC = () => <LiverFull t={1} fat={1} mood="sleepy" mouth="wavy" look={[0.2, 0.3]} />;
export const MomentLiverDay10: React.FC = () => <LiverFull t={1} fat={0.5} mood="happy" mouth="big" look={[0.2, -0.3]} />;
