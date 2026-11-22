/**
 * MedPeak Toons, look v8: the micro places of "What Happens If You Quit Sugar for 30 Days" (`quit-sugar`).
 * Each a full 1080 x 1920 frame in depth planes (far, middle, floating life, near framing). Calm: the planes
 * hold still (the acting kit's rule, 2026-11-21); motion comes from the story only.
 *
 *   MouthPlace        inside the mouth, microscopic: the tooth's enamel wall rises on the right over a band of
 *                     gum, the tongue's surface rolls along the bottom with its taste buds (mushroom-shaped
 *                     papillae, the real look of the ones that hold taste buds) among fine pointed ones.
 *     view  'tooth'   the tooth in front, big; the tongue low      (C: Tooth throws juice-Sweetie out)
 *           'tongue'  the tongue in front, big; the tooth far back (G: the tongue at Day 30)
 *     bits  0..1      sugar crystals stuck along the tooth at the gum line
 *     buds  0..1      the taste buds wake: their caps turn warm yellow, little rays pop
 *   LiverPlace        inside the liver, microscopic: a honeycomb of liver cells (hepatocytes), each with a
 *                     nucleus and round fat drops; narrow blood channels (sinusoids) with red cells between.
 *     fat   0..1      the fat drops' size: 1 = Day 1, about 0.5 = Day 10 (liver fat nearly halved)
 *
 * Drawn with the kit only: one outline colour, flat fills, one darker tone, no gradients, no blur, no glow.
 */
import React from 'react';
import {CLOTH, EDGE, EDGE_IN, FLESH, INLINE, OUTLINE, shade, tint} from './kit';
import {Layer, Put, Scene} from './scene';
import {f, lobe, open, rnd, type P} from './scenes-body';
import {Bits, Depth} from './micro3';
import {RedCell} from './cells';
import {Liver, Tooth} from './organs-a';
import {Tongue} from './organs-b';
import {Sweetie} from './sugar-cast';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const still = (d: number) => ({dx: 0, dy: 0, d});

/** Near framing: big soft dark shapes cut by the frame edge, no outline (out of focus). */
const Near: React.FC<{shapes: [number, number, number, number, number][]; col: string}> = ({shapes, col}) => (
  <>
    {shapes.map(([x, y, rx, ry, s], i) => (
      <g key={i}><path d={lobe(x, y, rx, ry, s, 9)} fill={col} /><path d={lobe(x + rx * 0.1, y + ry * 0.14, rx * 0.8, ry * 0.76, s + 1, 9)} fill={shade(col, 0.12)} /></g>
    ))}
  </>
);

// =================================================================== 1. inside the mouth
export const MOUTH = {cheek: '#f2b0ad', fold: '#e79591', gum: '#ec8b92', gum2: '#d9737d', enamel: '#fbf3e2', enamel2: '#efe2c8', tongue: FLESH.salmon, tongue2: shade(FLESH.salmon, 0.1), cap: '#f6b2b4', capLit: CLOTH.yellow, spit: '#e9f4fb'};

/** One taste-bud papilla: a mushroom (a stalk and a round cap), with the taste pore on top. */
const Papilla: React.FC<{x: number; y: number; s: number; lit: number}> = ({x, y, s, lit}) => {
  const cap = lit > 0.5 ? MOUTH.capLit : MOUTH.cap;
  return (
    <g transform={`translate(${f(x)} ${f(y)}) scale(${f(s)})`}>
      <path d="M -22 0 Q -18 -40 -26 -64 L 26 -64 Q 18 -40 22 0 Z" fill={MOUTH.tongue2} {...EDGE_IN} />
      <path d={lobe(0, -78, 52, 34, 7, 10)} fill={cap} {...EDGE} />
      <path d="M -30 -92 Q 0 -104 30 -92" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.7} />
      <ellipse cx={0} cy={-80} rx={9} ry={5} fill={shade(cap, 0.3)} />
      {/* awake: three short rays pop above the cap */}
      {lit > 0.5 && [[-34, -118, -46, -138], [0, -122, 0, -146], [34, -118, 46, -138]].map(([a, b, c, d], i) => (
        <path key={i} d={`M ${a} ${b} L ${c} ${d}`} stroke={CLOTH.yellow} strokeWidth={7} strokeLinecap="round" />
      ))}
    </g>
  );
};

/** The fine pointed papillae that carpet the tongue between the taste buds. */
const Spikes: React.FC<{y0: number; y1: number; n: number; s: number; seed: number}> = ({y0, y1, n, s, seed}) => (
  <>
    {Array.from({length: n}, (_, i) => {
      const x = rnd(i, seed) * 1140 - 30, y = y0 + rnd(i, seed + 1) * (y1 - y0);
      const h = (18 + rnd(i, seed + 2) * 14) * s, w = 9 * s;
      return <path key={i} d={`M ${f(x - w)} ${f(y)} Q ${f(x - w * 0.3)} ${f(y - h * 0.7)} ${f(x + w * 0.4)} ${f(y - h)} Q ${f(x + w * 0.4)} ${f(y - h * 0.5)} ${f(x + w)} ${f(y)} Z`} fill={MOUTH.tongue2} />;
    })}
  </>
);

export const MouthPlace: React.FC<{t: number; view?: 'tooth' | 'tongue'; bits?: number; buds?: number}> = ({t, view = 'tooth', bits = 0, buds = 0}) => {
  const near = view === 'tooth';
  // the tooth: an enamel wall on the right. Big and close in the tooth view, small and far in the tongue view.
  const tx = near ? 470 : 760, ty = near ? 180 : 420, tw = near ? 700 : 380, gumY = near ? 1240 : 900;
  // the tongue's top edge: low in the tooth view, high in the tongue view
  const tongueY = near ? 1500 : 1000;
  const b = clamp01(bits), lit = clamp01(buds);
  const buds5: [number, number, number][] = near
    ? [[150, tongueY + 120, 0.9], [420, tongueY + 160, 0.8], [700, tongueY + 130, 0.85], [960, tongueY + 170, 0.8]]
    : [[170, tongueY + 300, 1.7], [540, tongueY + 220, 1.4], [890, tongueY + 330, 1.7], [330, tongueY + 650, 2.2], [790, tongueY + 700, 2.3]];
  return (
    <Scene bg={MOUTH.cheek}>
      {/* far: the cheek's soft folds and a little saliva */}
      <Depth {...still(0)}>
        <Layer>
          {[[160, 300, 240, 160, 901], [620, 140, 260, 120, 902], [240, 820, 220, 150, 903]].map(([x, y, rx, ry, s], i) => (
            <path key={i} d={lobe(x, y, rx, ry, s, 9)} fill={MOUTH.fold} {...EDGE_IN} />
          ))}
          <Bits t={t} n={10} seed={911} col={MOUTH.spit} size={12} />
        </Layer>
      </Depth>
      {/* middle: the tooth on its gum */}
      <Depth {...still(0.4)}>
        <Layer>
          <path d={`M ${tx} ${gumY + 40} L ${tx + 10} ${ty + 160} Q ${tx + 20} ${ty} ${tx + 180} ${ty - 10} Q ${tx + tw * 0.55} ${ty - 40} ${tx + tw} ${ty + 20} L ${tx + tw} ${gumY + 40} Z`} {...OUTLINE} fill={MOUTH.enamel} />
          {/* the shade on the far side, and the fine growth lines of enamel */}
          <path d={`M ${tx + tw * 0.72} ${ty + 6} Q ${tx + tw * 0.8} ${(ty + gumY) / 2} ${tx + tw * 0.74} ${gumY} L ${tx + tw} ${gumY} L ${tx + tw} ${ty + 20} Z`} fill={MOUTH.enamel2} />
          {[0.3, 0.45, 0.6, 0.75].map((k, i) => {
            const y = ty + (gumY - ty) * k;
            return <path key={i} d={open([[tx + 30, y], [tx + tw * 0.35, y - 12], [tx + tw * 0.7, y + 4]])} {...INLINE} opacity={0.5} />;
          })}
          <path d={`M ${tx + 60} ${ty + 120} Q ${tx + 70} ${ty + 260} ${tx + 56} ${ty + 400}`} stroke="#ffffff" strokeWidth={near ? 16 : 9} strokeLinecap="round" fill="none" />
          {/* the gum: a soft pink band along the tooth's base */}
          <path d={`M -20 ${gumY - 20} Q 240 ${gumY - 60} ${tx} ${gumY - 10} Q ${tx + tw * 0.5} ${gumY - 50} 1100 ${gumY - 20} L 1100 ${gumY + 180} L -20 ${gumY + 180} Z`} {...OUTLINE} fill={MOUTH.gum} />
          <path d={`M -20 ${gumY + 60} Q 400 ${gumY + 30} 1100 ${gumY + 70}`} stroke={MOUTH.gum2} strokeWidth={22} fill="none" />
          {/* sugar crystals stuck along the gum line */}
          {Array.from({length: Math.round(b * 14)}, (_, i) => {
            const x = tx + 40 + rnd(i, 921) * (tw - 120), y = gumY - 40 - rnd(i, 922) * 90;
            const s = (near ? 22 : 12) * (0.7 + rnd(i, 923) * 0.6);
            return <rect key={i} x={f(x - s / 2)} y={f(y - s / 2)} width={f(s)} height={f(s)} rx={3} fill="#ffffff" {...EDGE_IN} transform={`rotate(${f(rnd(i, 924) * 40 - 20)} ${f(x)} ${f(y)})`} />;
          })}
        </Layer>
      </Depth>
      {/* near middle: the tongue's surface with its taste buds */}
      <Depth {...still(0.7)}>
        <Layer>
          <path d={`M -40 ${tongueY + 60} Q 300 ${tongueY - 40} 560 ${tongueY} Q 840 ${tongueY + 40} 1120 ${tongueY - 20} L 1120 1960 L -40 1960 Z`} {...OUTLINE} fill={MOUTH.tongue} />
          <path d={`M -40 ${tongueY + 140} Q 520 ${tongueY + 60} 1120 ${tongueY + 100}`} {...INLINE} opacity={0.4} />
          <Spikes y0={tongueY + 60} y1={1940} n={near ? 60 : 90} s={near ? 1 : 1.8} seed={931} />
          {buds5.map(([x, y, s], i) => <Papilla key={i} x={x} y={y} s={s} lit={lit > (i + 1) / (buds5.length + 1) ? 1 : 0} />)}
        </Layer>
      </Depth>
      <Depth {...still(1)}>
        <Layer>
          <Near shapes={[[-70, 160, 200, 260, 941], [1150, 640, 170, 280, 942]]} col={shade(MOUTH.fold, 0.25)} />
        </Layer>
      </Depth>
    </Scene>
  );
};

// =================================================================== 2. inside the liver
// light, pink tissue so the dark-red Liver character reads in front of it
export const LIVER = {tissue: '#e7aa98', cell: '#f3c3b0', cell2: '#e8ad9a', far: '#e2a08e', farFat: '#efd2a2', nucleus: '#8a5a8f', fat: '#f7e3a0', chan: '#c2626a'};

/** One liver cell: a soft hexagon with a nucleus and its fat drops (sized by fat). */
const LiverCell: React.FC<{x: number; y: number; r: number; fat: number; seed: number; far?: boolean}> = ({x, y, r, fat, seed, far}) => {
  const pts: P[] = Array.from({length: 6}, (_, i) => {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
    const k = 1 + (rnd(i, seed) - 0.5) * 0.08;
    return [x + Math.cos(a) * r * k, y + Math.sin(a) * r * 0.92 * k];
  });
  const d = `M ${pts.map(([a, b]) => `${f(a)} ${f(b)}`).join(' L ')} Z`;
  const drops: [number, number, number][] = [[-0.38, -0.3, 0.3], [0.36, 0.28, 0.26], [0.34, -0.4, 0.18], [-0.3, 0.42, 0.16]];
  return (
    <g>
      {far ? <path d={d} fill={LIVER.far} stroke={shade(LIVER.far, 0.2)} strokeWidth={3} strokeLinejoin="round" /> : <path d={d} {...EDGE} fill={LIVER.cell} />}
      {!far && <path d={`M ${f(pts[3][0] + 14)} ${f(pts[3][1])} L ${f(pts[4][0] + 6)} ${f(pts[4][1] + 10)} L ${f(pts[5][0] - 6)} ${f(pts[5][1] + 10)}`} stroke={LIVER.cell2} strokeWidth={r * 0.14} strokeLinecap="round" fill="none" />}
      <circle cx={x + r * 0.05} cy={y - r * 0.02} r={r * (far ? 0.16 : 0.2)} fill={far ? tint(LIVER.nucleus, 0.45) : LIVER.nucleus} {...(far ? {} : EDGE_IN)} />
      {drops.map(([dx, dy, s], i) => {
        const rr = r * s * Math.max(0.15, fat);
        return rr > 2 ? (
          <g key={i}>
            <circle cx={f(x + dx * r)} cy={f(y + dy * r)} r={f(rr)} fill={far ? LIVER.farFat : LIVER.fat} {...(far ? {} : EDGE_IN)} />
            {!far && <circle cx={f(x + dx * r - rr * 0.35)} cy={f(y + dy * r - rr * 0.35)} r={f(rr * 0.22)} fill="#ffffff" />}
          </g>
        ) : null;
      })}
    </g>
  );
};

export const LiverPlace: React.FC<{t: number; fat?: number}> = ({t, fat = 1}) => {
  const k = clamp01(fat);
  const grid = (r: number, dx: number, dy: number, ox: number, oy: number) => {
    const out: [number, number][] = [];
    for (let row = -1; row * dy < 2000; row++) for (let col = -1; col * dx < 1200; col++) out.push([ox + col * dx + (row % 2 ? dx / 2 : 0), oy + row * dy]);
    return out;
  };
  return (
    <Scene bg={LIVER.tissue}>
      <Depth {...still(0)}>
        <Layer>
          {grid(80, 168, 150, 30, 40).map(([x, y], i) => <LiverCell key={i} x={x} y={y} r={80} fat={k} seed={i + 300} far />)}
        </Layer>
      </Depth>
      <Depth {...still(0.5)}>
        <Layer>
          {/* the blood channels (sinusoids) run between rows of cells; red cells drift along them */}
          {[520, 1060, 1600].map((y, i) => (
            <g key={i}>
              <path d={open([[-40, y + 20], [300, y - 30], [700, y + 30], [1120, y - 10]])} stroke={LIVER.chan} strokeWidth={70} strokeLinecap="round" fill="none" />
            </g>
          ))}
          {[[260, 498, 0.0], [610, 1052, 0.4], [880, 1598, 0.8], [400, 1610, 0.2]].map(([x, y, p], i) => (
            <g key={i} transform={`translate(${f(x + ((t * 60 + p * 300) % 160))} ${y}) rotate(${i * 30}) scale(0.45)`}><RedCell mood="closed" mouth="flat" /></g>
          ))}
        </Layer>
      </Depth>
      <Depth {...still(0.7)}>
        <Layer>
          {[[200, 260], [760, 290], [480, 790], [1000, 800], [150, 1330], [700, 1340], [420, 1860], [960, 1880], [-40, 800]].map(([x, y], i) => (
            <LiverCell key={i} x={x} y={y} r={170} fat={k} seed={i + 500} />
          ))}
        </Layer>
      </Depth>
      <Depth {...still(1)}>
        <Layer>
          <Near shapes={[[-90, 1700, 240, 260, 951], [1160, 260, 200, 300, 952]]} col={shade(LIVER.tissue, 0.3)} />
        </Layer>
      </Depth>
    </Scene>
  );
};

// ------------------------------------------------------------------ the moments for the sheet
/** C, Day 7: Tooth throws juice-Sweetie out; sugar crystals along the gum line. */
export const MomentTooth: React.FC = () => (
  <>
    <MouthPlace t={1} view="tooth" bits={1} />
    <Put x={760} y={720} size={430}><Tooth mood="angry" mouth="grit" look={[-0.7, 0.1]} /></Put>
    <Put x={260} y={1060} size={330} rot={-14}><Sweetie wear="juice" mood="scared" mouth="o" arms="droop" look={[0.6, -0.3]} /></Put>
  </>
);
/** G, Day 30: the tongue, its buds dark ("not yet"). */
export const MomentTongueDark: React.FC = () => (
  <>
    <MouthPlace t={2} view="tongue" buds={0} />
    <Put x={540} y={760} size={420}><Tongue mood="open" mouth="flat" look={[0, 0.4]} /></Put>
  </>
);
/** G, month three: the buds wake up, sweet tastes sweeter. */
export const MomentTongueLit: React.FC = () => (
  <>
    <MouthPlace t={3} view="tongue" buds={1} />
    <Put x={540} y={760} size={420}><Tongue mood="happy" mouth="big" look={[0, -0.4]} /></Put>
  </>
);
/** D, Day 1: the liver cells full of fat drops; Liver tired. */
export const MomentLiverFull: React.FC = () => (
  <>
    <LiverPlace t={1} fat={1} />
    <Put x={540} y={1080} size={440}><Liver mood="sleepy" mouth="wavy" look={[0, 0.3]} /></Put>
  </>
);
/** D, Day 10: the fat drops nearly halved; Liver proud. */
export const MomentLiverHalf: React.FC = () => (
  <>
    <LiverPlace t={1} fat={0.52} />
    <Put x={540} y={1080} size={440}><Liver mood="happy" mouth="big" look={[0, -0.3]} /></Put>
  </>
);
