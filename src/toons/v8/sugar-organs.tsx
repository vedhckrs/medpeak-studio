/**
 * MedPeak Toons, look v8: the organ frames of "What Happens If You Quit Sugar for 30 Days" (`quit-sugar`).
 * The owner, 2026-11-22: "when big organ frame come i want full view of organs like ref video", then "need more
 * polished visual and details". As in the 20 reference Shorts, THE ORGAN IS THE STAGE: the whole organ fills the
 * 1080 x 1920 frame, its face is on its own wall (eyes about 170 px), tiny arms, and the organ itself changes
 * state as the story goes.
 *
 *   LiverFull   the whole liver under the diaphragm (muscle bands, the pale central tendon), its two lobes split by
 *               the pale ligament, the gallbladder and the three vessels at its gate (portal vein, artery, bile duct)
 *               running down out of frame, the stomach with its folds on the right, the colon's pouches and the
 *               small gut's loops below, thin vessels on the back wall.
 *     fat  0..1   1 = Day 1: pale, yellow-brown, big yellow fat patches; 0.5 = Day 10: the patches about half
 *                 the size, the colour back toward healthy red-brown ("liver fat nearly halved")
 *   MouthFull   the whole open mouth from the front: wet lips round the frame, the cheeks' inner walls, the hard
 *               palate with its ridges and centre seam, the soft palate arch with the uvula and two tonsils, the
 *               throat in depth; upper teeth (incisors, pointed canines, side teeth) on a scalloped gum, lower teeth,
 *               and the big tongue in front: a pale rim, a deep centre groove, a carpet of tiny papillae, raised
 *               taste buds, wet shine.
 *     view 'tooth'   closer on the upper front teeth: one big front tooth has the face (Tooth, the bouncer)
 *          'tongue'  the whole mouth: the tongue has the face
 *     bits 0..1      sugar crystals stuck along the gum line and between the teeth
 *     buds 0..1      the tongue's taste buds wake: they turn yellow and little rays pop
 *
 * Kit only: one outline colour (non-scaling, so a scaled organ keeps the same line as the cast), flat fills,
 * shade crescents (Shape; the crescent is scaled up on frame-size shapes so it reads), white shine strokes and
 * dots, the kit face. No gradients, no glow.
 */
import React from 'react';
import {CLOTH, EDGE, EDGE_IN, Eyes, FLESH, INLINE, Mouth, Shape, shade, tint, TinyArm, type V8Props} from './kit';
import {Put, Layer, Scene} from './scene';
import {f, open, rnd, tube, type P} from './scenes-body';
import {cloud, ORGAN_COL, smooth} from './organs-a';
import {Sweetie} from './sugar-cast';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** Mix two #rrggbb colours (k = 0 gives a, 1 gives b). */
const mix = (a: string, b: string, k: number) => {
  const h = (s: string, i: number) => parseInt(s.slice(1 + i * 2, 3 + i * 2), 16);
  return '#' + [0, 1, 2].map((i) => Math.round(h(a, i) + (h(b, i) - h(a, i)) * k).toString(16).padStart(2, '0')).join('');
};
/** A white shine stroke (wet surface). */
const Shine: React.FC<{d: string; w?: number; o?: number}> = ({d, w = 10, o = 0.85}) => <path d={d} stroke="#ffffff" strokeWidth={w} strokeLinecap="round" fill="none" opacity={o} />;
const Dot: React.FC<{x: number; y: number; r: number; o?: number}> = ({x, y, r, o = 0.9}) => <circle cx={x} cy={y} r={r} fill="#ffffff" opacity={o} />;
/** A tube drawn as a Shape (outline, shade crescent), with a highlight along one side. */
const TubeShape: React.FC<{pts: P[]; w: number[]; fill: string; ends?: [string, string]; shadow?: number; seed?: number; shine?: boolean}> = ({pts, w, fill, ends = ['cut', 'cut'], shadow = 3, seed = 1, shine = true}) => {
  const t = tube(pts, w, ends, 14, seed);
  const n = t.c.length;
  const hl = t.c.slice(1, n - 1).map((p, i): P => { const k = i + 1; return [p[0] + (t.L[k][0] - p[0]) * 0.55, p[1] + (t.L[k][1] - p[1]) * 0.55]; });
  return (
    <Shape d={t.d} fill={fill} shadow={shadow}>
      {shine && hl.length > 1 && <Shine d={open(hl)} w={Math.max(1.5, t.w[1] * 0.1)} o={0.55} />}
    </Shape>
  );
};

// =================================================================== 1. the whole liver
export const LIVER_FULL = {
  cavity: '#f2c4b5', cavity2: '#e8ab9b', vesselR: '#d6646a', vesselB: '#8a90c4',
  muscle: '#d8737a', muscle2: '#c8636c', tendon: '#eab3b2',
  fatty: '#c99169', healthy: ORGAN_COL.liver, fat: '#f3d68a', lig: '#f1d6c4',
  gut: FLESH.coral, colon: '#e3888c', stomach: FLESH.salmon,
  portal: '#7f86c0', artery: '#d65a5e', bile: '#8fae5f',
};
// the cast Liver's outline (organs-a), so the big liver is the same character
const LIVER_BODY: P[] = [[-84, -12], [-80, -40], [-60, -57], [-26, -64], [10, -62], [44, -54], [72, -42], [90, -29], [86, -18], [62, -5], [36, 9], [12, 23], [-14, 41], [-40, 53], [-63, 49], [-79, 27]];
// fat patches, in the liver's own units, kept clear of the eyes and the mouth (around -36, -26)
const FAT: [number, number, number][] = [[28, -40, 11], [54, -28, 8], [8, -12, 10], [-14, 22, 9], [-62, 30, 7], [36, -14, 6], [-6, -46, 7], [70, -36, 5], [-40, 38, 6]];
// a faint speckle of lobules over the surface
const SPECK: P[] = Array.from({length: 70}, (_, i): P => [-80 + rnd(i, 71) * 168, -60 + rnd(i, 72) * 108]);

export const LiverFull: React.FC<V8Props & {t: number; fat?: number; lift?: number}> = ({fat = 1, mood = 'sleepy', mouth = 'smile', look = [0, 0.2], lift = 0}) => {
  const k = clamp01(fat);
  const fatty = clamp01((k - 0.4) / 0.6); // how far the colour leans to the pale, fatty liver
  const body = mix(LIVER_FULL.healthy, LIVER_FULL.fatty, fatty);
  const S = 6.2; // the cast liver, about 6 times bigger, filling the width
  const face = (x: number, y: number) => Math.abs(x + 36) < 30 && y > -46 && y < 8;
  return (
    <Scene bg={LIVER_FULL.cavity}>
      <Layer>
        {/* the back wall: soft folds and thin vessels */}
        {[[180, 1260, 260, 110], [900, 1180, 220, 90], [560, 1500, 320, 90]].map(([x, y, rx, ry], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={LIVER_FULL.cavity2} />)}
        {([[[40, 1100], [160, 1180], [230, 1320]], [[1060, 1000], [960, 1100], [930, 1250]], [[300, 1420], [420, 1480], [560, 1470]]] as P[][]).map((pts, i) => (
          <g key={i}>
            <path d={open(pts)} stroke={i % 2 ? LIVER_FULL.vesselB : LIVER_FULL.vesselR} strokeWidth={9} strokeLinecap="round" fill="none" />
            <path d={open([pts[1], [(pts[1][0] + pts[2][0]) / 2 + 40, (pts[1][1] + pts[2][1]) / 2 - 30]])} stroke={i % 2 ? LIVER_FULL.vesselB : LIVER_FULL.vesselR} strokeWidth={5} strokeLinecap="round" fill="none" />
          </g>
        ))}

        {/* the diaphragm: a muscle dome across the top, banded fibres, the pale tendon in its middle */}
        <Shape d="M -40 -40 L 1120 -40 L 1120 540 Q 540 380 -40 540 Z" fill={LIVER_FULL.muscle} shadow={4}>
          {Array.from({length: 11}, (_, i) => {
            const u = -1 + i * 0.2;
            return <path key={i} d={`M ${f(540 + u * 600)} -40 Q ${f(540 + u * 440)} 240 ${f(540 + u * 540)} ${f(520 - (1 - Math.abs(u)) * 90)}`} stroke={i % 2 ? LIVER_FULL.muscle2 : tint(LIVER_FULL.muscle, 0.12)} strokeWidth={i % 2 ? 26 : 8} fill="none" />;
          })}
          <path d="M 400 -40 C 410 70 470 130 540 130 C 610 130 670 70 680 -40 Z" fill={LIVER_FULL.tendon} />
          <path d="M 400 -40 C 410 70 470 130 540 130 C 610 130 670 70 680 -40" {...INLINE} />
          <Shine d="M 450 20 Q 480 90 540 104" w={12} o={0.7} />
          <Shine d="M 120 380 Q 300 330 420 330" w={10} o={0.5} />
        </Shape>

        {/* the three vessels at the liver's gate (portal vein, artery, bile duct), running down behind the colon */}
        <TubeShape pts={[[528, 1110], [520, 1300], [500, 1520]]} w={[66, 70, 74]} fill={LIVER_FULL.portal} seed={11} />
        <TubeShape pts={[[600, 1090], [612, 1300], [630, 1520]]} w={[34, 36, 38]} fill={LIVER_FULL.artery} seed={12} />
        <TubeShape pts={[[410, 1220], [396, 1360], [380, 1520]]} w={[28, 30, 32]} fill={LIVER_FULL.bile} seed={13} />

        {/* below: the small gut's loops, then the colon's pouched band across */}
        {([[60, 1700, 190, 80, -12], [400, 1690, 200, 84, 8], [760, 1700, 200, 82, -6], [1060, 1720, 170, 80, 14], [-20, 1880, 200, 84, 6], [300, 1870, 200, 84, -10], [640, 1880, 210, 86, 6], [980, 1890, 200, 84, -8]] as [number, number, number, number, number][]).map(([x, y, rx, ry, r], i) => (
          <g key={i} transform={`rotate(${r} ${x} ${y})`}>
            <Shape d={`M ${x - rx} ${y} C ${x - rx} ${y - ry * 1.1} ${x + rx} ${y - ry * 1.1} ${x + rx} ${y} C ${x + rx} ${y + ry * 1.1} ${x - rx} ${y + ry * 1.1} ${x - rx} ${y} Z`} fill={LIVER_FULL.gut} shadow={3}>
              <path d={`M ${x - rx * 0.55} ${y + ry * 0.1} Q ${x} ${y - ry * 0.35} ${x + rx * 0.55} ${y + ry * 0.1}`} {...INLINE} />
              <Shine d={`M ${x - rx * 0.6} ${y - ry * 0.5} Q ${x - rx * 0.2} ${y - ry * 0.78} ${x + rx * 0.2} ${y - ry * 0.74}`} w={9} o={0.6} />
            </Shape>
          </g>
        ))}
        <Shape d="M -60 1460 Q 540 1400 1140 1470 L 1140 1610 Q 540 1540 -60 1600 Z" fill={LIVER_FULL.colon} shadow={3}>
          {[80, 240, 400, 560, 720, 880, 1040].map((x, i) => <path key={i} d={`M ${x} 1440 Q ${x + 22} 1520 ${x} 1600`} {...INLINE} />)}
          <Shine d="M 120 1490 Q 300 1460 470 1468" w={10} o={0.55} />
        </Shape>

        {/* the stomach on the right, under the liver's tip, with its folds */}
        <Shape d="M 1140 1000 Q 900 990 820 1150 Q 770 1330 930 1420 Q 1070 1470 1140 1400 Z" fill={LIVER_FULL.stomach} shadow={3}>
          <path d="M 870 1200 Q 960 1240 1080 1210 M 860 1290 Q 960 1330 1100 1300 M 900 1370 Q 1000 1390 1110 1360" {...INLINE} />
          <Shine d="M 880 1100 Q 950 1060 1040 1060" w={12} o={0.6} />
        </Shape>

      </Layer>

      {/* the liver itself, its face on its wall */}
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={`translate(540 ${960 + lift}) scale(${S})`}>
          <TinyArm from={[-74, 32]} bend={[-90, 46]} to={[-78, 64]} fill={body} hand="mitten" />
          {/* the gallbladder, tucked under, with its own shine */}
          <Shape d={smooth([[-26, 36], [-10, 34], [-4, 50], [-12, 62], [-24, 58]])} fill={ORGAN_COL.gall} shadow={0.5}>
            <Shine d="M -20 42 Q -14 40 -10 44" w={2} o={0.7} />
          </Shape>
          <Shape d={smooth(LIVER_BODY)} fill={body}>
            {/* lobule speckle */}
            {SPECK.filter(([x, y]) => !face(x, y)).map(([x, y], i) => <circle key={i} cx={f(x)} cy={f(y)} r={0.9} fill={shade(body, 0.1)} />)}
            {/* the ligament between the two lobes: a pale band, then the fold line */}
            <path d="M 18 -64 Q 12 -24 4 28" stroke={LIVER_FULL.lig} strokeWidth={4.5} strokeLinecap="round" fill="none" />
            <path d="M 16 -62 Q 10 -24 2 26" {...INLINE} />
            <path d="M 30 -4 Q 52 -14 72 -26" {...INLINE} />
            {/* the darker lower rim: the underside turning away */}
            <path d="M -86 4 Q -80 36 -54 52 Q -20 48 12 26 Q 40 10 90 -20" stroke={shade(body, 0.16)} strokeWidth={8} fill="none" />
            {/* fat patches: each a soft blob with a darker rim crescent and a shine */}
            {FAT.map(([x, y, r], i) => {
              const rr = r * (0.25 + 0.75 * k);
              const pts = Array.from({length: 7}, (_, j): P => {
                const a = (j / 7) * Math.PI * 2, q = 1 + (rnd(j, i + 40) - 0.5) * 0.3;
                return [x + Math.cos(a) * rr * q, y + Math.sin(a) * rr * 0.8 * q];
              });
              return (
                <g key={i}>
                  <path d={smooth(pts)} fill={shade(LIVER_FULL.fat, 0.14)} {...EDGE_IN} />
                  <path d={smooth(pts.map(([px, py]): P => [x + (px - x) * 0.8 - rr * 0.1, y + (py - y) * 0.8 - rr * 0.12]))} fill={LIVER_FULL.fat} />
                  <circle cx={x - rr * 0.38} cy={y - rr * 0.32} r={rr * 0.2} fill="#ffffff" opacity={0.9} />
                </g>
              );
            })}
            {/* the wet shine along the top edge and on the big lobe */}
            <Shine d="M -70 -42 Q -50 -56 -22 -60" w={2.6} o={0.75} />
            <Shine d="M 30 -56 Q 56 -50 76 -38" w={2.2} o={0.6} />
            <Dot x={-14} y={-55} r={1.6} />
            <Dot x={82} y={-31} r={1.2} />
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
export const MOUTH_FULL = {
  inside: '#7d3340', throat: '#3a141d', throat2: '#5e2531', cheek: '#d06c78', cheek2: '#bd5c69',
  palate: '#e88f95', palate2: '#d97880', soft: '#e07d86', tonsil: '#e9969b', uvula: '#e07d86',
  gum: '#ec8b92', lip: '#d9737b', lip2: '#c55f69',
  tongue: FLESH.salmon, rim: tint(FLESH.salmon, 0.22), papilla: shade(FLESH.salmon, 0.09), bud: tint(FLESH.salmon, 0.14), lit: CLOTH.yellow,
  tooth: ORGAN_COL.tooth, edge: '#e3e8ee',
};
/** The gum line: the upper teeth hang from it; it curves down toward the sides. */
const gumY = (x: number) => 330 + ((x - 540) / 540) ** 2 * 170;
type T = {x: number; w: number; h: number; kind: 'incisor' | 'canine' | 'side'};
const UPPER: T[] = [
  {x: 70, w: 150, h: 200, kind: 'side'}, {x: 225, w: 165, h: 250, kind: 'canine'}, {x: 420, w: 242, h: 300, kind: 'incisor'},
  {x: 660, w: 242, h: 300, kind: 'incisor'}, {x: 855, w: 165, h: 250, kind: 'canine'}, {x: 1010, w: 150, h: 200, kind: 'side'},
];
const LOWER: {x: number; w: number}[] = [{x: 110, w: 140}, {x: 255, w: 150}, {x: 405, w: 150}, {x: 675, w: 150}, {x: 825, w: 150}, {x: 970, w: 140}];
const toothPath = (u: T, top: number, h = u.h) => {
  const {x, w} = u;
  const l = x - w / 2, r = x + w / 2, b = top + h;
  if (u.kind === 'canine') return `M ${f(l)} ${f(top)} L ${f(r)} ${f(top)} L ${f(r - 6)} ${f(b - 80)} Q ${f(x + w * 0.22)} ${f(b - 12)} ${f(x)} ${f(b)} Q ${f(x - w * 0.22)} ${f(b - 12)} ${f(l + 6)} ${f(b - 80)} Z`;
  return `M ${f(l)} ${f(top)} L ${f(r)} ${f(top)} L ${f(r - 4)} ${f(b - 46)} Q ${f(r - 10)} ${f(b)} ${f(x + w * 0.2)} ${f(b - 2)} Q ${f(x)} ${f(b + 6)} ${f(x - w * 0.2)} ${f(b - 2)} Q ${f(l + 10)} ${f(b)} ${f(l + 4)} ${f(b - 46)} Z`;
};
// the tongue's outline and its taste buds (frame coordinates), the buds kept off the face
const TONGUE = 'M 150 1960 C 110 1560 150 1110 540 1030 C 930 1110 970 1560 930 1960 Z';
const BUDS: P[] = [[300, 1130], [780, 1130], [250, 1330], [830, 1330], [330, 1560], [750, 1560], [540, 1660], [420, 1760], [660, 1760], [220, 1700], [860, 1700], [540, 1080]];
const PAPILLAE: P[] = Array.from({length: 190}, (_, i): P => [170 + rnd(i, 81) * 740, 1080 + rnd(i, 82) * 860]);
const LIPS_IN = 'M 540 30 C 1000 30 1100 500 1100 960 C 1100 1500 1000 1890 540 1890 C 80 1890 -20 1500 -20 960 C -20 500 80 30 540 30 Z';

export const MouthFull: React.FC<{t: number; view?: 'tooth' | 'tongue'; bits?: number; buds?: number; tooth?: V8Props; tongue?: V8Props}> = ({view = 'tongue', bits = 0, buds = 0, tooth = {mood: 'angry', mouth: 'grit'}, tongue = {mood: 'open', mouth: 'smile'}}) => {
  const b = clamp01(bits), lit = clamp01(buds);
  const zoom = view === 'tooth' ? 'translate(540 760) scale(1.75) translate(-540 -493)' : '';
  const FT = UPPER[2]; // the face tooth: the left front tooth
  const tTop = gumY(FT.x) - 8;
  const faceZone = (x: number, y: number) => view === 'tongue' && Math.abs(x - 540) < 240 && y > 1170 && y < 1470;
  return (
    <Scene bg={MOUTH_FULL.inside}>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={zoom}>
          {/* the cheeks' inner walls at the sides, with soft folds */}
          {[-1, 1].map((s) => (
            <g key={s}>
              <path d={s < 0 ? 'M -60 300 Q 160 700 170 1100 Q 160 1500 -60 1800 Z' : 'M 1140 300 Q 920 700 910 1100 Q 920 1500 1140 1800 Z'} fill={MOUTH_FULL.cheek} />
              {[800, 1000, 1200].map((y) => <path key={y} d={`M ${s < 0 ? -40 : 1120} ${y} Q ${s < 0 ? 80 : 1000} ${y + 30} ${s < 0 ? 140 : 940} ${y + 90}`} stroke={MOUTH_FULL.cheek2} strokeWidth={14} strokeLinecap="round" fill="none" />)}
            </g>
          ))}
          {/* the throat in depth: two dark rings, the back wall with small bumps */}
          <ellipse cx={540} cy={880} rx={260} ry={310} fill={MOUTH_FULL.throat2} />
          <ellipse cx={540} cy={920} rx={190} ry={230} fill={MOUTH_FULL.throat} />
          {[[470, 860], [600, 900], [530, 980], [460, 1020], [620, 1010]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={22} ry={16} fill={MOUTH_FULL.throat2} />)}
          {/* the tonsils, one each side of the arch */}
          {[-1, 1].map((s) => (
            <Shape key={s} d={`M ${540 + s * 205} 760 Q ${540 + s * 270} 840 ${540 + s * 250} 960 Q ${540 + s * 200} 1000 ${540 + s * 180} 920 Q ${540 + s * 170} 820 ${540 + s * 205} 760 Z`} fill={MOUTH_FULL.tonsil} shadow={2}>
              <path d={`M ${540 + s * 215} 830 q ${s * 18} 10 ${s * 22} 30 M ${540 + s * 205} 900 q ${s * 18} 6 ${s * 26} 22`} {...INLINE} />
            </Shape>
          ))}
          {/* the hard palate above: ridges and the centre seam */}
          <Shape d={`M -60 -60 H 1140 V ${gumY(1080) + 160} Q 540 640 -60 ${gumY(0) + 160} Z`} fill={MOUTH_FULL.palate} shadow={4}>
            {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${320 - i * 40} ${440 + i * 44} Q 430 ${410 + i * 44} 520 ${438 + i * 44} M 560 ${438 + i * 44} Q 650 ${410 + i * 44} ${760 + i * 40} ${440 + i * 44}`} stroke={MOUTH_FULL.palate2} strokeWidth={12} strokeLinecap="round" fill="none" />)}
            <path d="M 540 400 V 610" {...INLINE} />
            <Shine d="M 300 560 Q 420 520 520 520" w={10} o={0.5} />
          </Shape>
          {/* the soft palate arch over the throat, the uvula hanging from its middle */}
          <Shape d="M 250 900 C 260 700 400 620 540 620 C 680 620 820 700 830 900 L 770 900 C 760 750 660 690 540 690 C 420 690 320 750 310 900 Z" fill={MOUTH_FULL.soft} shadow={2} />
          <Shape d="M 540 680 C 504 712 498 790 516 840 C 526 866 554 866 564 840 C 582 790 576 712 540 680 Z" fill={MOUTH_FULL.uvula} shadow={2}>
            <Shine d="M 528 730 Q 524 770 530 810" w={7} o={0.7} />
          </Shape>
          {/* the upper gum */}
          <Shape d={`M -60 ${gumY(-60) - 100} Q 540 ${gumY(540) - 160} 1140 ${gumY(1140) - 100} L 1140 ${gumY(1140) + 20} Q 540 ${gumY(540) - 40} -60 ${gumY(-60) + 20} Z`} fill={MOUTH_FULL.gum} shadow={3}>
            <Shine d={`M 120 ${gumY(120) - 60} Q 540 ${gumY(540) - 110} 960 ${gumY(960) - 60}`} w={9} o={0.45} />
          </Shape>
          {/* the upper teeth: a clear biting edge, a shine stroke and a shine dot on each */}
          {UPPER.map((u, i) => {
            const top = gumY(u.x) - 8;
            return (
              <Shape key={i} d={toothPath(u, top)} fill={MOUTH_FULL.tooth} shadow={3} shadeBy={0.07}>
                <path d={toothPath(u, top + u.h * 0.84, u.h * 0.2)} fill={MOUTH_FULL.edge} />
                <Shine d={`M ${f(u.x - u.w * 0.28)} ${f(top + 36)} Q ${f(u.x - u.w * 0.32)} ${f(top + u.h * 0.42)} ${f(u.x - u.w * 0.26)} ${f(top + u.h * 0.66)}`} w={u.w * 0.07} o={0.95} />
                <Dot x={u.x + u.w * 0.24} y={top + 40} r={u.w * 0.04} />
              </Shape>
            );
          })}
          {/* the gum's scallops: a pink point between each pair of teeth */}
          {UPPER.slice(0, -1).map((u, i) => {
            const x = (u.x + u.w / 2 + UPPER[i + 1].x - UPPER[i + 1].w / 2) / 2, y = gumY(x) - 10;
            return <path key={i} d={`M ${f(x - 22)} ${f(y - 16)} Q ${f(x)} ${f(y + 36)} ${f(x + 22)} ${f(y - 16)} Z`} fill={MOUTH_FULL.gum} />;
          })}
          {/* sugar crystals stuck at the gum line and between the teeth */}
          {Array.from({length: Math.round(b * 18)}, (_, i) => {
            const x = 60 + rnd(i, 61) * 960, y = gumY(x) + 6 + rnd(i, 62) * 50, s = 18 + rnd(i, 63) * 14;
            return (
              <g key={i} transform={`rotate(${f(rnd(i, 64) * 50 - 25)} ${f(x)} ${f(y)})`}>
                <rect x={f(x - s / 2)} y={f(y - s / 2)} width={f(s)} height={f(s)} rx={4} fill="#ffffff" {...EDGE_IN} />
                <rect x={f(x - s / 2 + 3)} y={f(y - s / 2 + 3)} width={f(s * 0.35)} height={f(s * 0.35)} rx={2} fill={tint(CLOTH.sky, 0.6)} />
              </g>
            );
          })}
          {/* the face tooth: Tooth, the bouncer (only in the tooth view) */}
          {view === 'tooth' && (
            <g transform={`translate(${FT.x} ${tTop + FT.h * 0.5}) scale(2.6)`}>
              <TinyArm from={[-40, 10]} bend={[-66, 8]} to={[-64, -20]} fill={MOUTH_FULL.tooth} hand="fist" />
              <TinyArm from={[40, 10]} bend={[66, 8]} to={[64, -20]} fill={MOUTH_FULL.tooth} hand="fist" />
              <Eyes x={0} y={-12} r={13} mood={tooth.mood} look={tooth.look ?? [0, 0]} brows />
              <Mouth x={0} y={18} w={13} kind={tooth.mouth ?? 'grit'} />
            </g>
          )}
          {/* the lower teeth, low behind the tongue, and the lower gum */}
          {LOWER.map((u, i) => {
            const top = 1520 + ((u.x - 540) / 540) ** 2 * 60;
            return (
              <Shape key={i} d={`M ${f(u.x - u.w / 2)} ${f(top + 170)} L ${f(u.x - u.w / 2 + 4)} ${f(top + 30)} Q ${f(u.x)} ${f(top - 14)} ${f(u.x + u.w / 2 - 4)} ${f(top + 30)} L ${f(u.x + u.w / 2)} ${f(top + 170)} Z`} fill={MOUTH_FULL.tooth} shadow={2} shadeBy={0.07}>
                <Shine d={`M ${f(u.x - u.w * 0.25)} ${f(top + 40)} L ${f(u.x - u.w * 0.27)} ${f(top + 110)}`} w={8} o={0.9} />
              </Shape>
            );
          })}
          <Shape d="M -60 1690 Q 540 1650 1140 1690 L 1140 2000 L -60 2000 Z" fill={MOUTH_FULL.gum} shadow={3} />
          {/* the tongue, big, in front */}
          <Shape d={TONGUE} fill={MOUTH_FULL.tongue} shadow={5} shadeBy={0.1}>
            <path d={TONGUE} fill="none" stroke={MOUTH_FULL.rim} strokeWidth={46} />
            {PAPILLAE.filter(([x, y]) => !faceZone(x, y)).map(([x, y], i) => <circle key={i} cx={f(x)} cy={f(y)} r={f(4 + rnd(i, 83) * 3)} fill={MOUTH_FULL.papilla} />)}
            <path d="M 540 1470 C 532 1600 548 1760 540 1960" stroke={shade(MOUTH_FULL.tongue, 0.16)} strokeWidth={22} strokeLinecap="round" fill="none" />
            <path d="M 540 1470 C 532 1600 548 1760 540 1960" {...INLINE} />
            {BUDS.map(([x, y], i) => {
              const on = lit > (i + 1) / (BUDS.length + 1);
              const c = on ? MOUTH_FULL.lit : MOUTH_FULL.bud;
              return (
                <g key={i}>
                  <circle cx={x} cy={y + 5} r={24} fill={shade(c, 0.18)} />
                  <circle cx={x} cy={y} r={22} fill={c} {...EDGE_IN} />
                  <circle cx={x - 7} cy={y - 7} r={5} fill="#ffffff" opacity={0.85} />
                  {on && [[-1, -1], [0, -1.25], [1, -1]].map(([dx, dy], j) => (
                    <path key={j} d={`M ${f(x + dx * 32)} ${f(y + dy * 32)} L ${f(x + dx * 52)} ${f(y + dy * 54)}`} stroke={CLOTH.yellow} strokeWidth={9} strokeLinecap="round" />
                  ))}
                </g>
              );
            })}
            <Shine d="M 300 1140 Q 400 1080 520 1070" w={16} o={0.8} />
            <Shine d="M 230 1300 Q 220 1420 240 1540" w={10} o={0.5} />
            <Dot x={620} y={1080} r={9} />
          </Shape>
          {view === 'tongue' && (
            <g transform="translate(540 1330) scale(6.4)">
              <TinyArm from={[-50, 6]} bend={[-68, 0]} to={[-62, -26]} fill={MOUTH_FULL.tongue} hand="open" />
              <TinyArm from={[50, 6]} bend={[68, 0]} to={[62, -26]} fill={MOUTH_FULL.tongue} hand="open" />
              <Eyes x={0} y={-18} r={13} mood={tongue.mood} look={tongue.look ?? [0, 0]} brows={tongue.mood === 'sad'} />
              <Mouth x={0} y={10} w={14} kind={tongue.mouth ?? 'smile'} />
            </g>
          )}
          {/* the lips round the frame's edges: a darker wet inner band and a shine on each lip */}
          <path d={`M -80 -80 H 1160 V 2000 H -80 Z ${LIPS_IN}`} fillRule="evenodd" fill={MOUTH_FULL.lip} />
          <path d={LIPS_IN} fill="none" stroke={MOUTH_FULL.lip2} strokeWidth={34} />
          <path d={LIPS_IN} fill="none" {...EDGE} />
          <Shine d="M 330 14 Q 540 -4 750 14" w={10} o={0.7} />
          <Shine d="M 360 1906 Q 540 1920 720 1906" w={10} o={0.7} />
        </g>
      </svg>
    </Scene>
  );
};

// =================================================================== 3. the whole brain (B: Day 3)
export const BRAIN_FULL = {space: '#f3cdbf', space2: '#e9b4a5', bone: '#f6ead3', bone2: '#e8d6b4', marrow: '#e9c9a0', mening: '#e79aa4', brain: ORGAN_COL.brain, stem: ORGAN_COL.stem, vesselR: '#d6646a', vesselB: '#8a90c4'};
// the cast Brain's outline (organs-a), so the big brain is the same character
const CEREBRUM: P[] = [[-80, 12], [-85, -14], [-75, -38], [-58, -56], [-34, -69], [-8, -75], [18, -73], [44, -65], [66, -49], [80, -26], [84, 0], [76, 22], [56, 30], [32, 32], [10, 38], [-14, 42], [-36, 40], [-56, 32]];
const CEREBELLUM: P[] = [[30, 22], [56, 18], [76, 26], [78, 42], [62, 55], [40, 53], [27, 40]];
// the folds (gyri): short curving grooves, kept off the face (around -21, -20)
const FOLDS: string[] = [
  'M -56 28 Q -24 12 14 16 Q 30 16 44 8', 'M 14 -74 Q 4 -52 10 -38 Q 16 -24 6 -10', 'M -70 -26 q 10 -9 20 0', 'M -44 -58 q 6 10 18 4', 'M 40 -54 q 4 12 16 10',
  'M 64 -22 q -10 6 -6 18', 'M -66 4 q 8 -8 18 -4', 'M 30 -22 q 10 -2 14 8', 'M 26 -60 q 8 8 2 18', 'M 52 -36 q 10 4 8 16', 'M 70 -6 q -8 8 0 16',
  'M 36 0 q 8 6 18 2', 'M -12 -64 q -4 10 4 18', 'M -30 -66 q 2 8 -6 14', 'M -76 -8 q 8 4 6 14', 'M -6 28 q 8 -6 16 0', 'M -36 30 q 6 -6 14 -2',
];
export const BrainFull: React.FC<V8Props & {t: number}> = ({mood = 'bored', mouth = 'flat', look = [0.6, 0]}) => {
  const S = 6.8;
  return (
    <Scene bg={BRAIN_FULL.space}>
      <Layer>
        {/* the skull round the top and sides: a thick band of bone with its spongy middle, the pink lining inside it */}
        <path d="M -60 1500 L -60 300 Q -40 -60 540 -60 Q 1120 -60 1140 300 L 1140 1500 L 1050 1500 L 1050 320 Q 1030 40 540 40 Q 50 40 30 320 L 30 1500 Z" {...EDGE} fill={BRAIN_FULL.bone} />
        <path d="M -10 1500 L -10 310 Q 10 0 540 -10 Q 1070 0 1090 310 L 1090 1500" fill="none" stroke={BRAIN_FULL.bone2} strokeWidth={26} />
        {Array.from({length: 26}, (_, i) => { const a = Math.PI * (0.04 + i * 0.035); return <circle key={i} cx={f(540 - Math.cos(a) * 520)} cy={f(330 - Math.sin(a) * 330)} r={6 + (i % 3) * 2} fill={BRAIN_FULL.marrow} />; })}
        <path d="M 30 1500 L 30 320 Q 50 40 540 40 Q 1030 40 1050 320 L 1050 1500" fill="none" stroke={BRAIN_FULL.mening} strokeWidth={22} />
        <path d="M 52 1500 L 52 326 Q 72 62 540 62 Q 1008 62 1028 326 L 1028 1500" {...INLINE} />
        <path d="M 0 1500 Q 540 1440 1080 1500 L 1080 1920 L 0 1920 Z" fill={BRAIN_FULL.space2} opacity={0.6} />
      </Layer>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={`translate(540 830) scale(${S})`}>
          <TubeShape pts={[[12, 26], [12, 60], [10, 100], [8, 140]]} w={[22, 20, 18, 17]} fill={BRAIN_FULL.stem} shadow={0.6} seed={21} />
          <Shape d={smooth(CEREBELLUM)} fill={BRAIN_FULL.brain}>
            {[30, 36, 42, 48].map((y, i) => <path key={i} d={`M ${30 + i} ${y} Q 54 ${y - 4} ${76 - i * 2} ${y + 2}`} {...INLINE} />)}
          </Shape>
          <Shape d={cloud(CEREBRUM, 0.24)} fill={BRAIN_FULL.brain}>
            {/* the folds, with a pale ridge beside each groove */}
            {FOLDS.map((d, i) => <path key={'r' + i} d={d} stroke={tint(BRAIN_FULL.brain, 0.35)} strokeWidth={2.6} fill="none" transform="translate(-1.2 -1.2)" />)}
            {FOLDS.map((d, i) => <path key={'g' + i} d={d} {...INLINE} />)}
            {/* thin vessels on the surface */}
            <path d="M -82 14 Q -72 20 -60 22 Q -50 24 -44 30" stroke={BRAIN_FULL.vesselR} strokeWidth={1.4} fill="none" />
            <path d="M 60 -58 Q 54 -46 60 -36 Q 64 -28 58 -18" stroke={BRAIN_FULL.vesselB} strokeWidth={1.4} fill="none" />
            <path d="M 20 24 Q 30 20 40 22" stroke={BRAIN_FULL.vesselR} strokeWidth={1.2} fill="none" />
            {/* wet shine */}
            <Shine d="M -64 -44 Q -44 -64 -14 -70" w={2.6} o={0.75} />
            <Shine d="M 34 -66 Q 54 -60 66 -48" w={2} o={0.6} />
            <Dot x={-4} y={-70} r={1.6} />
          </Shape>
          <TinyArm from={[-62, 26]} bend={[-84, 44]} to={[-72, 62]} fill={BRAIN_FULL.brain} hand="mitten" />
          <TinyArm from={[-20, 38]} bend={[-14, 58]} to={[-28, 70]} fill={BRAIN_FULL.brain} hand="mitten" />
          <Eyes x={-22} y={-32} r={14} mood={mood} look={look} brows />
          <Mouth x={-20} y={-6} w={14} kind={mouth} />
        </g>
        {/* the spine: the cord runs down through each vertebra (a wing of bone either side of it) */}
        {[1560, 1700, 1840].map((y, i) => (
          <g key={i}>
            {[-1, 1].map((sd) => (
              <Shape key={sd} d={`M ${618 + sd * 0 - (sd < 0 ? 78 : 0)} ${y} ${sd < 0 ? `Q 470 ${y - 24} 400 ${y + 6} L 396 ${y + 96} Q 470 ${y + 120} 540 ${y + 104} Z` : `L 618 ${y} Q 690 ${y - 24} 760 ${y + 6} L 764 ${y + 96} Q 690 ${y + 120} 618 ${y + 104} Z`}`} fill={BRAIN_FULL.bone} shadow={3}>
                <Shine d={`M ${sd < 0 ? 420 : 640} ${y + 22} q 40 -12 80 -6`} w={8} o={0.6} />
              </Shape>
            ))}
          </g>
        ))}
      </svg>
    </Scene>
  );
};
export const MomentBrainDay3: React.FC = () => (
  <>
    <BrainFull t={1} mood="bored" mouth="flat" look={[0.7, 0.2]} />
    <Put x={900} y={420} size={300} rot={-8}><Sweetie mood="wink" mouth="big" arms="point" look={[-0.6, 0.3]} /></Put>
  </>
);

// ------------------------------------------------------------------ the moments for the sheet
/** C, Day 7: the front tooth throws juice-Sweetie out; sugar crystals at the gum line. */
export const MomentToothFull: React.FC = () => (
  <>
    <MouthFull t={1} view="tooth" bits={1} tooth={{mood: 'angry', mouth: 'grit', look: [0.6, 0.4]}} />
    <Put x={820} y={1420} size={420} rot={18}><Sweetie wear="juice" mood="scared" mouth="o" arms="droop" look={[-0.6, -0.4]} /></Put>
  </>
);
export const MomentTongueDarkFull: React.FC = () => <MouthFull t={2} view="tongue" buds={0} tongue={{mood: 'open', mouth: 'o', look: [0, -0.2]}} />;
export const MomentTongueLitFull: React.FC = () => <MouthFull t={3} view="tongue" buds={1} tongue={{mood: 'happy', mouth: 'big', look: [0, -0.3]}} />;
export const MomentLiverDay1: React.FC = () => <LiverFull t={1} fat={1} mood="sleepy" mouth="wavy" look={[0.2, 0.3]} />;
export const MomentLiverDay10: React.FC = () => <LiverFull t={1} fat={0.5} mood="happy" mouth="big" look={[0.2, -0.3]} />;
