// MedPeak Toons body cast (v6). Every character is a Blueprint (see blueprint.tsx) drawn in a
// 200x200 box centred on (0,0). Organs are drawn from their real anatomy (vessels, ducts, lobes,
// folds, cell interiors) and have NO legs: they live in one place. Only travellers (pill, white
// cell, platelet) get legs. One accessory shows a character's job (guard cap, medic helmet).
// Each surface names its material (flesh, cell, hard, cloth) so the paint engine textures it.
import React from 'react';
import {blob, Cast, circlePath, ellipsePath, Groove, lift, lineOf, lobePts, Mark, Merge, Part, roundRect, shade, spline, taperedPath, tone, Tube, useLine, Vein, type P} from './ink';
import {type Blueprint, type Character, makeCharacter} from './blueprint';

const ARTERY = '#dc3d4f';
const VEINC = '#5878d8';
const DUCT = '#f3dcae';

/** The open end of a cut tube (vessel, airway, gut): a rim, a dark opening and a deeper core. */
const TubeEnd: React.FC<{x: number; y: number; rx: number; ry: number; rot?: number; color: string}> = ({x, y, rx, ry, rot = 0, color}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <Part d={ellipsePath(0, 0, rx, ry)} fill={shade(color, 0.42)} line={lineOf(color)} flat />
    <path d={ellipsePath(rx * 0.08, ry * 0.2, rx * 0.66, ry * 0.6)} fill={shade(color, 0.66)} />
    <path d={`M${-rx * 0.7} ${-ry * 0.35} Q0 ${-ry * 1.05} ${rx * 0.7} ${-ry * 0.35}`} fill="none" stroke={lift(color, 0.5)} strokeWidth={0.9} strokeLinecap="round" opacity={0.8} />
  </g>
);
/** A thin detail line (seams, rings) in the house line weight. */
const Tick: React.FC<{d: string; color: string; k?: number; opacity?: number}> = ({d, color, k = 0.62, opacity}) => {
  const w = useLine(k);
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />;
};
/** A ring around a tube (muscle band, cartilage): a dark line with a light line under it. */
const Ring: React.FC<{d: string; color: string}> = ({d, color}) => (
  <g>
    <Tick d={d} color={lift(color, 0.5)} k={0.9} opacity={0.7} />
    <g transform="translate(0 -1.1)"><Tick d={d} color={shade(color, 0.3)} k={0.62} /></g>
  </g>
);
/** A four-point sparkle (clean enamel, glass). */
const Sparkle: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -7 Q0.9 -0.9 7 0 Q0.9 0.9 0 7 Q-0.9 0.9 -7 0 Q-0.9 -0.9 0 -7 Z" fill="#ffffff" opacity={0.95} />
);

// ============================================================ digestion
const STOMACH = spline([[-18, -52], [-28, -32], [-38, -10], [-54, 8], [-74, 18], [-88, 30], [-86, 46], [-70, 54], [-44, 58], [-10, 70], [28, 66], [60, 42], [74, 4], [66, -34], [46, -58], [20, -66], [-2, -60]]);
const stomach: Blueprint = {
  name: 'stomach', family: 'organ', role: 'The hard-working cook: mixes food with acid. Grumpy when overfed.',
  color: '#ff8f9c', accents: [{label: 'food pipe', color: '#f7a3a6'}, {label: 'artery', color: ARTERY}, {label: 'vein', color: VEINC}],
  face: {x: 12, y: -8, size: 1.12},
  arms: {l: [-40, 0], r: [70, 6]},
  rest: [168, 62],
  legs: null,
  ground: {y: 74, w: 58},
  back: ({color}) => {
    const pipe = '#f7a3a6';
    return (
      <>
        <Tube d="M-80 39 C-96 37 -105 46 -103 60" r={8.2} fill={lift(color, 0.16)} cap="butt" />
        <TubeEnd x={-103} y={60} rx={8.2} ry={3} rot={8} color={lift(color, 0.16)} />
        <Tube d="M-10 -48 C-11 -64 -15 -76 -13 -92" r={9.5} fill={pipe} cap="butt" />
        {[-62, -72, -82].map((y, i) => <Ring key={y} d={`M${-21 + i * -0.8} ${y} Q${-12 + i * -0.8} ${y + 3} ${-3 + i * -0.6} ${y}`} color={pipe} />)}
        <TubeEnd x={-13} y={-92} rx={9.5} ry={3.4} rot={-6} color={pipe} />
      </>
    );
  },
  body: ({color}) => (
    <Part d={STOMACH} fill={color} mat="flesh" shine={[40, -44, 1.3]}>
      <Groove pts={[[50, -40], [64, -18], [65, 6]]} color={color} />
      <Groove pts={[[38, -50], [54, -30], [56, -8]]} w={2} color={color} k={0.14} />
      <Groove pts={[[-64, 27], [-46, 36], [-26, 38]]} w={2.2} color={color} />
      <Groove pts={[[-76, 23], [-82, 38], [-76, 52]]} w={3} color={color} k={0.28} />
      <Vein pts={[[70, 14], [58, 40], [30, 58], [-6, 63], [-40, 53], [-66, 49]]} w={2.3} color={VEINC} opacity={0.6} />
      <Vein pts={[[68, 20], [54, 45], [28, 61], [-8, 66], [-42, 56], [-64, 52]]} w={2.3} color={ARTERY} opacity={0.82} />
      {([[[44, 52], [40, 42], [43, 33]], [[10, 64], [7, 54], [11, 46]], [[-24, 61], [-25, 51], [-21, 44]], [[-50, 54], [-52, 46], [-49, 40]]] as P[][]).map((pts, i) => <Vein key={i} pts={pts} w={1.4} color={ARTERY} opacity={0.7} />)}
    </Part>
  ),
};

const COIL = spline([[-48, -24], [0, -32], [48, -24], [54, 18], [42, 62], [0, 74], [-42, 62], [-54, 18]]);
// The small intestine: one long tube folded back and forth, so the U-turns show at both sides.
const COIL_ROWS = [-31, -10, 11, 32, 53];
const COIL_PATH = COIL_ROWS.map((y, i) => {
  const s = i % 2 === 0 ? 1 : -1;
  const turn = i < COIL_ROWS.length - 1 ? ` A10.5 10.5 0 0 ${s > 0 ? 1 : 0} ${35 * s} ${COIL_ROWS[i + 1]}` : '';
  return `${i === 0 ? `M${-35 * s} ${y}` : ''} Q0 ${y + 3.4} ${35 * s} ${y}${turn}`;
}).join('');
const HAUSTRA: [number, number, number, number][] = [
  ...Array.from({length: 6}, (_, i) => [-61, 50 - i * 17.5, 13.5, 10.5] as [number, number, number, number]),
  [-54, -52, 13.5, 12.5],
  ...Array.from({length: 5}, (_, i) => [-36 + i * 18, -60 + Math.sin((i / 4) * Math.PI) * 4, 10.5, 12.5] as [number, number, number, number]),
  [54, -52, 13.5, 12.5],
  ...Array.from({length: 6}, (_, i) => [61, -37.5 + i * 17.5, 13.5, 10.5] as [number, number, number, number]),
];
const intestine: Blueprint = {
  name: 'intestine', family: 'organ', role: 'The long conveyor belt: soaks up food and water. Patient, a bit of a gossip.',
  color: '#ffb3aa', accents: [{label: 'large intestine', color: '#ee8e88'}, {label: 'appendix', color: '#f6a59c'}],
  face: {x: 0, y: 12, size: 1},
  arms: {l: [-70, 10], r: [70, 10], color: '#ee8e88'},
  legs: null,
  ground: {y: 86, w: 62},
  back: () => (
    <>
      <Tube d="M-64 72 C-70 84 -82 86 -86 76" r={3.2} fill="#f6a59c" />
      <Tube d="M60 60 C62 78 42 86 26 76" r={9} fill="#ee8e88" cap="butt" />
      <TubeEnd x={26} y={76} rx={3.2} ry={9} rot={28} color="#ee8e88" />
    </>
  ),
  body: ({color}) => {
    const colon = '#ee8e88';
    return (
      <>
        <Part d={COIL} fill={shade(color, 0.3)} flat />
        <Tube d={COIL_PATH} r={8.8} fill={color} />
        {COIL_ROWS.map((y, i) => <Groove key={y} pts={[[-22 + (i % 2) * 8, y + 5.6], [0, y + 7.4], [22 - (i % 2) * 8, y + 5.6]]} w={1.3} color={color} k={0.2} />)}
        <ellipse cx={0} cy={14} rx={38} ry={27} fill={color} opacity={0.42} />
        <Merge>
          <Part d={ellipsePath(-60, 66, 15.5, 12.5)} fill={colon} mat="flesh" depth={5} />
          {HAUSTRA.map(([x, y, rx, ry], i) => <Part key={i} d={ellipsePath(x, y, rx, ry)} fill={colon} mat="flesh" tex={0.6} depth={4.5} />)}
        </Merge>
        <path d="M-63 54 V-36 Q-63 -62 -38 -62 Q0 -57 38 -62 Q63 -62 63 -36 V52" fill="none" stroke={lift(colon, 0.6)} strokeWidth={1.5} strokeLinecap="round" strokeDasharray="7 10.5" opacity={0.55} />
        {HAUSTRA.slice(0, -1).map(([x, y], i) => {
          const [nx, ny] = HAUSTRA[i + 1];
          const mx = (x + nx) / 2;
          const my = (y + ny) / 2;
          const vertical = Math.abs(ny - y) > Math.abs(nx - x);
          return <Tick key={i} d={vertical ? `M${mx - 8} ${my} Q${mx} ${my + 2} ${mx + 8} ${my}` : `M${mx} ${my - 8} Q${mx + 2} ${my} ${mx} ${my + 8}`} color={shade(colon, 0.32)} k={0.7} />;
        })}
      </>
    );
  },
};

const LIVER = spline([[-88, -6], [-82, -40], [-44, -58], [8, -56], [54, -48], [86, -34], [92, -18], [72, 2], [32, 24], [-8, 46], [-48, 58], [-78, 42]]);
const liver: Blueprint = {
  name: 'liver', family: 'organ', role: 'The chemistry lab and cleaner: filters blood, handles sugar and alcohol. Calm, overworked.',
  color: '#c4544a', accents: [{label: 'gallbladder', color: '#7dbb5c'}, {label: 'ligament', color: '#f6d2c2'}, {label: 'main vein', color: VEINC}],
  face: {x: -30, y: -6, size: 1.05},
  arms: {l: [-84, 6], r: [62, -4]},
  legs: null,
  ground: {y: 66, w: 66},
  back: () => (
    <>
      <Tube d="M-34 -52 L-36 -72" r={7.5} fill={VEINC} cap="butt" />
      <TubeEnd x={-36} y={-72} rx={7.5} ry={2.8} rot={-4} color={VEINC} />
      <Tube d="M-12 -54 L-10 -68" r={3.4} fill={ARTERY} cap="butt" />
      <TubeEnd x={-10} y={-68} rx={3.4} ry={1.5} rot={6} color={ARTERY} />
      <Tube d="M-2 36 C4 44 2 52 -6 56" r={2.2} fill="#8fc96c" />
      <Part d={blob(11, 16, 'gb', 10, 0.04, -16, 52, 0.3)} fill="#7dbb5c" mat="flesh" tex={0.5} shine={[-20, 45, 0.5]} depth={3.5} />
    </>
  ),
  body: ({color}) => (
    <Part d={LIVER} fill={color} mat="flesh" shine={[-60, -38, 1.2]}>
      <path d="M12 -62 L100 -44 L100 30 L-12 52 Z" fill={lift(color, 0.22)} opacity={0.34} />
      <Groove pts={[[16, -54], [10, -22], [0, 10], [-6, 42]]} w={3} color={color} k={0.3} />
      <Mark pts={[[11, -55], [5, -23], [-5, 9], [-11, 41]]} w={3} color="#f6d2c2" opacity={0.9} />
      <Mark pts={[[-72, 40], [-34, 49], [8, 35], [48, 13], [82, -8]]} w={1.8} color={lift(color, 0.6)} opacity={0.5} />
      <Groove pts={[[40, -40], [62, -30], [80, -24]]} w={2} color={color} k={0.16} />
      <Gl x={34} y={-34} />
    </Part>
  ),
};
/** A small second highlight for wet, glossy organs. */
function Gl({x, y}: {x: number; y: number}) {
  return <ellipse cx={x} cy={y} rx={9} ry={2.6} transform={`rotate(-14 ${x} ${y})`} fill="#ffffff" opacity={0.38} />;
}

const KIDNEY = spline([[-8, -82], [28, -78], [50, -54], [48, -26], [34, -8], [32, 10], [46, 30], [50, 56], [28, 78], [-8, 84], [-40, 68], [-58, 32], [-60, -10], [-50, -52], [-32, -74]]);
const kidney: Blueprint = {
  name: 'kidney', family: 'organ', role: 'The water filter: cleans the blood and makes urine. Precise, a little fussy.',
  color: '#b84e62', accents: [{label: 'artery', color: ARTERY}, {label: 'vein', color: VEINC}, {label: 'ureter', color: DUCT}, {label: 'adrenal gland', color: '#f2b33d'}],
  face: {x: -10, y: -6, size: 1},
  arms: {l: [-58, 12], r: [46, 42]},
  legs: null,
  ground: {y: 90, w: 46},
  back: () => (
    <>
      <Part d={spline([[-34, -78], [-22, -92], [0, -97], [22, -92], [32, -80], [16, -72], [-14, -70]])} fill="#f2b33d" mat="flesh" tex={0.6} depth={3} />
      <Tube d="M34 12 C52 24 46 60 60 92" r={3.6} fill={DUCT} />
      <Part d={spline([[26, -8], [44, -4], [50, 8], [42, 20], [26, 16]])} fill={DUCT} depth={3} />
      <Tube d="M30 -8 C46 -12 60 -16 78 -22" r={4.6} fill={ARTERY} cap="butt" />
      <TubeEnd x={78} y={-22} rx={1.9} ry={4.6} rot={-14} color={ARTERY} />
      <Tube d="M34 4 C50 4 64 0 82 -4" r={5} fill={VEINC} cap="butt" />
      <TubeEnd x={82} y={-4} rx={2} ry={5} rot={-8} color={VEINC} />
    </>
  ),
  body: ({color}) => (
    <Part d={KIDNEY} fill={color} mat="flesh" shine={[-34, -54, 1.1]}>
      <Groove pts={[[36, -26], [23, 2], [36, 28]]} w={4.6} color={color} k={0.3} />
      {([[[26, -4], [8, -20], [-8, -44], [-14, -62]], [[24, 2], [2, 4], [-22, 18], [-40, 34]], [[26, 8], [12, 30], [0, 54], [-4, 70]]] as P[][]).map((pts, i) => <Vein key={i} pts={pts} w={1.9} color={shade(color, 0.34)} opacity={0.5} />)}
      <Mark pts={[[-50, -40], [-56, -6], [-52, 30]]} w={1.8} color={lift(color, 0.6)} opacity={0.42} />
    </Part>
  ),
};

const BLADDER = spline([[0, -66], [36, -58], [62, -28], [68, 10], [54, 48], [22, 68], [0, 70], [-22, 68], [-54, 48], [-68, 10], [-62, -28], [-36, -58]]);
const BLADDER_IN = spline([[0, -55], [30, -48], [52, -24], [57, 9], [45, 41], [18, 58], [0, 60], [-18, 58], [-45, 41], [-57, 9], [-52, -24], [-30, -48]]);
const bladder: Blueprint = {
  name: 'bladder', family: 'organ', role: 'The water tank: holds urine until it is time. Anxious when full.',
  color: '#ffcf80', accents: [{label: 'urine', color: '#ffb42e'}, {label: 'ureters', color: DUCT}],
  face: {x: 0, y: -12, size: 1.08},
  arms: {l: [-66, 10], r: [66, 10]},
  legs: null,
  ground: {y: 90, w: 50},
  back: ({color}) => (
    <>
      <Tube d="M-34 -52 C-46 -70 -42 -86 -56 -96" r={3.6} fill={DUCT} />
      <Tube d="M34 -52 C46 -70 42 -86 56 -96" r={3.6} fill={DUCT} />
      <Tube d="M0 62 L0 86" r={6} fill={shade(color, 0.1)} cap="butt" />
      <TubeEnd x={0} y={86} rx={6} ry={2.2} color={shade(color, 0.1)} />
      <Ring d="M-7 70 Q0 73 7 70" color={shade(color, 0.1)} />
      <Ring d="M-7 77 Q0 80 7 77" color={shade(color, 0.1)} />
    </>
  ),
  body: ({color, t}) => {
    const s = Math.sin(t * 2.2) * 2.4;
    const level = 22;
    return (
      <Part d={BLADDER} fill={color} mat="flesh" tex={0.7} shine={[-40, -46, 1.2]}>
        <Part d={BLADDER_IN} fill={lift(color, 0.5)} line={null} shadow={0.08} depth={-5}>
          <path d={`M-80 ${level + s} Q-40 ${level - 8 - s} 0 ${level - 1} T80 ${level - s} V90 H-80 Z`} fill="#ffb42e" opacity={0.62} />
          <path d={`M-80 ${level + 9 + s} Q-40 ${level + 3 - s} 0 ${level + 9} T80 ${level + 9 - s} V90 H-80 Z`} fill="#f59a14" opacity={0.3} />
          <path d={`M-80 ${level + s} Q-40 ${level - 8 - s} 0 ${level - 1} T80 ${level - s}`} fill="none" stroke="#fff6d6" strokeWidth={2.2} opacity={0.9} />
          {[[-30, 0.3, 2.4], [22, 1.4, 1.8], [38, 2.6, 2.2], [-12, 3.3, 1.5]].map(([x, o, r], i) => {
            const life = (t * 0.35 + o) % 1;
            return <circle key={i} cx={x + Math.sin(t * 2 + i) * 2} cy={56 - life * 30} r={r} fill="none" stroke="#fff3c4" strokeWidth={0.9} opacity={0.9 - life * 0.6} />;
          })}
        </Part>
        <Groove pts={[[-40, -53], [-58, -30], [-63, -2]]} w={2} color={color} k={0.16} />
        <Groove pts={[[40, -53], [58, -30], [63, -2]]} w={2} color={color} k={0.16} />
      </Part>
    );
  },
};

// ============================================================ chest and head
const LUNG_L = spline([[3, -46], [-22, -66], [-52, -52], [-72, -12], [-80, 34], [-72, 72], [-48, 84], [-22, 74], [-6, 52], [3, 10]]);
const LUNG_R = spline([[-3, -46], [22, -66], [52, -52], [72, -12], [80, 34], [72, 72], [48, 84], [30, 76], [22, 56], [10, 44], [-3, 10]]);
const lungs: Blueprint = {
  name: 'lungs', family: 'organ', role: 'The air team: bring oxygen in, push carbon dioxide out. Cheerful, hates smoke.',
  color: '#ff9db4', accents: [{label: 'windpipe', color: '#dfe7f3'}, {label: 'airways', color: '#ffd0da'}],
  face: {x: 0, y: 2, size: 1.12},
  arms: {l: [-76, 20], r: [76, 20]},
  legs: null,
  ground: {y: 90, w: 66},
  back: () => {
    const pipe = '#dfe7f3';
    return (
      <>
        <Tube d="M0 -58 C-6 -50 -14 -46 -22 -42" r={5} fill={pipe} cap="butt" />
        <Tube d="M0 -58 C6 -50 14 -46 22 -42" r={5} fill={pipe} cap="butt" />
        <Tube d="M0 -98 L0 -56" r={7.8} fill={pipe} cap="butt" />
        {[-90, -81, -72, -63].map((y) => <Ring key={y} d={`M-7.6 ${y} Q0 ${y + 2.6} 7.6 ${y}`} color={pipe} />)}
        <TubeEnd x={0} y={-98} rx={7.8} ry={2.8} color={pipe} />
      </>
    );
  },
  body: ({color}) => {
    const air = lift(color, 0.62);
    const tree = (s: number) => (
      <g opacity={0.5}>
        <Mark pts={[[s * 8, -40], [s * 26, -22], [s * 44, 6], [s * 54, 40]]} w={3.4} color={air} start={0.02} end={0.7} />
        <Mark pts={[[s * 24, -24], [s * 46, -30], [s * 60, -22]]} w={2} color={air} start={0.02} end={0.7} />
        <Mark pts={[[s * 38, -4], [s * 58, 2], [s * 70, 16]]} w={2} color={air} start={0.02} end={0.7} />
        <Mark pts={[[s * 46, 14], [s * 36, 36], [s * 34, 58]]} w={2} color={air} start={0.02} end={0.7} />
        <Mark pts={[[s * 52, 34], [s * 64, 50], [s * 64, 64]]} w={1.6} color={air} start={0.02} end={0.7} />
      </g>
    );
    return (
        <Merge>
          <Part d={LUNG_L} fill={color} mat="flesh" shine={[-50, -34, 1.1]}>
            {tree(-1)}
            <Groove pts={[[-79, 30], [-56, 42], [-30, 38], [-8, 46]]} color={color} k={0.24} />
            <Groove pts={[[-70, -22], [-50, -14], [-30, -20], [-8, -14]]} w={2.2} color={color} k={0.2} />
          </Part>
          <Part d={LUNG_R} fill={color} mat="flesh">
            {tree(1)}
            <Groove pts={[[10, 38], [34, 36], [58, 42], [79, 30]]} color={color} k={0.24} />
          </Part>
        </Merge>
    );
  },
};

const HEART = spline([[0, -34], [20, -58], [52, -62], [78, -42], [82, -8], [64, 28], [36, 58], [6, 84], [-6, 82], [-34, 56], [-64, 24], [-80, -12], [-74, -46], [-50, -62], [-22, -56]]);
const heart: Blueprint = {
  name: 'heart', family: 'organ', role: 'The pump that never rests: sends blood everywhere. Loyal, dramatic under stress.',
  color: '#ef5a6b', accents: [{label: 'aorta', color: '#e9434f'}, {label: 'veins', color: '#6f93ee'}, {label: 'coronary artery', color: '#b3202f'}, {label: 'fat', color: '#ffdc9c'}],
  face: {x: -2, y: -4, size: 1.12},
  arms: {l: [-78, 2], r: [80, 0]},
  legs: null,
  ground: {y: 90, w: 44},
  back: () => (
    <>
      <Tube d="M-44 -44 L-48 -88" r={7.2} fill="#6f93ee" cap="butt" />
      <TubeEnd x={-48} y={-88} rx={7.2} ry={2.6} rot={-5} color="#6f93ee" />
      {[['M16 -86 L13 -100'], ['M28 -90 L28 -104'], ['M40 -85 L44 -98']].map(([d]) => <Tube key={d} d={d} r={3.1} fill="#e9434f" />)}
      <Tube d="M8 -40 C6 -76 30 -94 46 -78 C52 -70 52 -60 50 -48" r={9} fill="#e9434f" />
      <Tube d="M-10 -42 C-12 -58 -22 -66 -30 -74" r={7} fill="#7d9df0" cap="butt" />
      <TubeEnd x={-30} y={-74} rx={7} ry={2.6} rot={-38} color="#7d9df0" />
    </>
  ),
  body: ({color}) => (
    <Part d={HEART} fill={color} mat="flesh" shine={[-52, -40, 1.2]}>
      <path d={blob(13, 7, 'f1', 9, 0.14, 18, -46, 0.3)} fill="#ffdc9c" opacity={0.8} />
      <path d={blob(10, 5.5, 'f2', 9, 0.14, -30, -50, -0.2)} fill="#ffdc9c" opacity={0.7} />
      <Groove pts={[[-66, -40], [-40, -46], [-10, -40], [20, -46], [56, -52]]} w={2.2} color={color} k={0.2} />
      <Vein pts={[[30, -52], [50, -30], [52, 0], [40, 32], [16, 62], [4, 78]]} w={2.8} color={VEINC} opacity={0.5} />
      <Vein pts={[[24, -50], [46, -30], [48, 2], [36, 32], [12, 62], [2, 76]]} w={3.2} color="#b3202f" />
      {([[[46, -26], [60, -12], [66, 6]], [[48, 2], [60, 16], [58, 30]], [[40, 26], [26, 30], [16, 42]]] as P[][]).map((pts, i) => <Vein key={i} pts={pts} w={1.7} color="#b3202f" opacity={0.85} />)}
      <Vein pts={[[-18, -46], [-44, -40], [-64, -18], [-66, 6], [-52, 28]]} w={2.6} color="#b3202f" opacity={0.9} />
      <Vein pts={[[-62, -12], [-50, 0], [-48, 14]]} w={1.5} color="#b3202f" opacity={0.8} />
    </Part>
  ),
};

const BRAIN = spline(lobePts(82, 58, 9, 0.1, 0, -8, -Math.PI / 2), true, 0.6);
const brain: Blueprint = {
  name: 'brain', family: 'organ', role: 'The control room: gives the orders, takes every call. Smart, easily distracted.',
  color: '#ffb3c7', accents: [{label: 'cerebellum', color: '#f59ab2'}, {label: 'brain stem', color: '#f2c3b4'}],
  face: {x: 0, y: 4, size: 1.08},
  arms: {l: [-82, 8], r: [82, 8]},
  legs: null,
  ground: {y: 90, w: 50},
  back: () => (
    <>
      <Tube d="M14 40 C12 58 10 72 12 86" r={7.4} fill="#f2c3b4" cap="butt" />
      <TubeEnd x={12} y={86} rx={7.4} ry={2.6} color="#f2c3b4" />
      <Part d={blob(28, 20, 'cb', 10, 0.05, 46, 44)} fill="#f59ab2" mat="flesh" tex={0.5} depth={4}>
        {[31, 36.5, 42, 47.5, 53, 58].map((y) => <Groove key={y} pts={[[20, y + 2], [46, y + 4], [72, y - 1]]} w={1.5} color="#f59ab2" k={0.26} />)}
      </Part>
    </>
  ),
  body: ({color}) => {
    const folds: P[][] = [
      [[2, -66], [-4, -54], [2, -44], [-2, -36]],
      [[-22, -62], [-28, -50], [-18, -42], [-24, -34]],
      [[-44, -52], [-40, -42], [-50, -34], [-42, -26]],
      [[-64, -34], [-54, -28], [-62, -18], [-56, -8]],
      [[-76, -10], [-66, -2], [-72, 10], [-64, 20]],
      [[-70, 26], [-58, 28], [-52, 38], [-40, 40]],
      [[24, -62], [30, -50], [20, -42], [28, -34]],
      [[46, -52], [42, -42], [52, -34], [44, -26]],
      [[64, -36], [56, -28], [66, -18], [58, -8]],
      [[78, -10], [68, -2], [74, 10], [66, 20]],
      [[-30, 42], [-14, 46], [0, 42], [12, 46]],
      [[-12, -58], [-10, -48], [-14, -40]],
      [[12, -58], [12, -48], [8, -40]],
      [[-56, -46], [-62, -42], [-58, -34]],
      [[56, -46], [60, -40], [56, -34]],
    ];
    return (
      <Part d={BRAIN} fill={color} mat="flesh" shine={[-46, -46, 1.2]}>
        {folds.map((pts, i) => <Groove key={i} pts={pts} w={i < 11 ? 2.5 : 1.9} color={color} k={i === 0 ? 0.3 : 0.22} />)}
      </Part>
    );
  },
};

const TOOTH = spline([[-50, -58], [-28, -72], [-8, -62], [0, -58], [8, -62], [28, -72], [50, -58], [62, -30], [56, 8], [48, 40], [40, 74], [30, 90], [20, 84], [14, 56], [0, 46], [-14, 56], [-20, 84], [-30, 90], [-40, 74], [-48, 40], [-56, 8], [-62, -30]]);
const tooth: Blueprint = {
  name: 'tooth', family: 'organ', role: 'The chopper: tough outside, sensitive inside. Terrified of sugar and acid.',
  color: '#fffdf6', accents: [{label: 'root', color: '#f6e7c4'}, {label: 'eyes', color: '#2f86b0'}],
  face: {x: 0, y: -16, size: 1.06, eye: '#2f86b0'},
  arms: {l: [-56, 2], r: [56, 2]},
  legs: null,
  ground: {y: 92, w: 40},
  body: ({color}) => (
    <>
      <Part d={TOOTH} fill={color} mat="hard" shadow={0.13} shine={[-34, -54, 1.1]}>
        <path d="M-70 36 Q-30 26 0 34 Q30 26 70 36 V100 H-70 Z" fill="#f6e7c4" opacity={0.85} />
        <path d="M-70 36 Q-30 26 0 34 Q30 26 70 36" fill="none" stroke="#dcc79a" strokeWidth={1.2} opacity={0.9} />
        <Groove pts={[[-14, -64], [0, -56], [14, -64]]} w={2} color="#e9e4d6" k={0.2} />
        <Groove pts={[[0, -56], [0, -47]]} w={1.6} color="#e9e4d6" k={0.2} />
        <Mark pts={[[-30, 60], [-31, 74], [-29, 84]]} w={1.4} color="#d9c08c" opacity={0.7} />
        <Mark pts={[[30, 60], [31, 74], [29, 84]]} w={1.4} color="#d9c08c" opacity={0.7} />
      </Part>
      <Sparkle x={44} y={-44} s={0.9} />
      <Sparkle x={52} y={-30} s={0.45} />
    </>
  ),
};

const BONE = 'M-22 -58 C-36 -52 -46 -64 -42 -78 C-38 -92 -18 -96 -8 -84 C-3 -78 3 -78 8 -84 C18 -96 38 -92 42 -78 C46 -64 36 -52 22 -58 C17 -30 17 30 22 58 C36 52 46 64 42 78 C38 92 18 96 8 84 C3 78 -3 78 -8 84 C-18 96 -38 92 -42 78 C-46 64 -36 52 -22 58 C-17 30 -17 -30 -22 -58 Z';
const bone: Blueprint = {
  name: 'bone', family: 'skeleton', role: 'The frame: holds everything up and makes blood inside. Sturdy, old-fashioned.',
  color: '#fbf3df', accents: [{label: 'joint cartilage', color: '#d8ecf2'}, {label: 'eyes', color: '#7a5330'}],
  face: {x: 0, y: -6, size: 0.8, eye: '#7a5330'},
  arms: {l: [-19, 12], r: [19, 12]},
  legs: null,
  ground: {y: 96, w: 40},
  body: ({color}) => (
    <Part d={BONE} fill={color} mat="hard" shadow={0.14} shine={[-28, -80, 0.8]}>
      <path d="M-50 -100 H50 V-76 Q24 -88 8 -80 Q0 -74 -8 -80 Q-24 -88 -50 -76 Z" fill="#d8ecf2" opacity={0.85} />
      <path d="M-50 100 H50 V76 Q24 88 8 80 Q0 74 -8 80 Q-24 88 -50 76 Z" fill="#d8ecf2" opacity={0.85} />
      <Tick d="M-23 -52 Q0 -46 23 -52" color="#cdbb93" k={0.6} />
      <Tick d="M-23 52 Q0 46 23 52" color="#cdbb93" k={0.6} />
      {[-34, -20, 34, 20].map((x, i) => [(i < 2 ? -1 : 1)].map((s) => <circle key={`${x}${s}`} cx={x} cy={(i % 2 ? 66 : 72) * (i < 2 ? -1 : 1)} r={1.3} fill="#cdbb93" opacity={0.8} />))}
      <Mark pts={[[9, 24], [10, 34], [8, 44]]} w={1.3} color="#cdbb93" opacity={0.8} />
      <ellipse cx={-9} cy={36} rx={1.4} ry={2.2} fill="#b7a274" opacity={0.75} />
    </Part>
  ),
};

// ============================================================ medicine and waste
const PILL_TOP = 'M-40 -6 V-38 A40 40 0 0 1 40 -38 V-6 Z';
const PILL_BOTTOM = 'M-40 -6 H40 V38 A40 40 0 0 1 -40 38 Z';
const pill: Blueprint = {
  name: 'pill', family: 'medicine', role: 'The helper on a mission: travels to where it is needed. Eager, sometimes lost.',
  color: '#19b8a6', accents: [{label: 'body', color: '#fffdf6'}, {label: 'eyes', color: '#128f81'}],
  face: {x: 0, y: 28, size: 0.86, skin: '#fffdf6', eye: '#128f81'},
  arms: {l: [-40, 6], r: [40, 6], color: '#eef1f6'},
  legs: {y: 70, gap: 15, len: 18, color: '#eef1f6', shoe: '#128f81'},
  ground: {y: 96, w: 40},
  body: ({color}) => (
    <>
      <Merge>
        <Part d={PILL_BOTTOM} fill="#fffdf6" mat="hard" shadow={0.13} />
        <Part d={PILL_TOP} fill={color} mat="hard" shine={[-18, -58, 1.1]}>
          <g transform="translate(14 -42)" opacity={0.9}>
            <path d="M-2.4 -8 h4.8 v5.6 h5.6 v4.8 h-5.6 v5.6 h-4.8 v-5.6 h-5.6 v-4.8 h5.6 Z" fill={shade(color, 0.26)} />
            <path d="M-2.4 -8 h4.8 v5.6 h5.6 v4.8 h-5.6 v5.6 h-4.8 v-5.6 h-5.6 v-4.8 h5.6 Z" fill={lift(color, 0.4)} transform="translate(-0.9 -1)" opacity={0.75} />
          </g>
        </Part>
      </Merge>
      <path d="M-40 -6 H40 V0 H-40 Z" fill="#9aa3c2" opacity={0.3} />
      <Tick d="M-40 -6 H40" color={lineOf(color)} k={0.8} />
      <path d="M-36 -9.4 H36" stroke={lift(color, 0.7)} strokeWidth={1.5} strokeLinecap="round" opacity={0.8} />
    </>
  ),
};

const POOP_B = spline([[-72, 62], [-62, 42], [-22, 34], [22, 34], [62, 42], [72, 62], [60, 82], [0, 90], [-60, 82]]);
const POOP_M = spline([[-52, 28], [-44, 8], [0, 2], [44, 8], [52, 28], [40, 44], [0, 48], [-40, 44]]);
const POOP_T = spline([[-34, -4], [-26, -22], [0, -28], [26, -22], [34, -4], [22, 8], [0, 10], [-22, 8]]);
const POOP_TIP = spline([[-12, -22], [-8, -46], [6, -64], [26, -70], [18, -58], [20, -42], [16, -24]]);
const poop: Blueprint = {
  name: 'poop', family: 'waste', role: 'The leftovers on the way out: blunt, proud, refuses to be rushed.',
  color: '#a06a45', accents: [{label: 'top coil', color: '#b98258'}],
  face: {x: 0, y: 56, size: 0.98},
  arms: {l: [-64, 60], r: [64, 60]},
  legs: null,
  ground: {y: 92, w: 68},
  body: ({color}) => {
    const m = lift(color, 0.1);
    const t = lift(color, 0.18);
    return (
      <>
        <Part d={POOP_B} fill={color} mat="flesh" shine={[-48, 46, 0.9]} />
        <Cast d={POOP_M} on={POOP_B} color={color} dx={1} dy={5} />
        <Part d={POOP_M} fill={m} mat="flesh" shine={[-34, 12, 0.8]} depth={5} />
        <Cast d={POOP_T} on={POOP_M} color={m} dx={1} dy={4.5} />
        <Part d={POOP_TIP} fill={lift(color, 0.26)} mat="flesh" tex={0.6} depth={3} />
        <Part d={POOP_T} fill={t} mat="flesh" shine={[-20, -18, 0.7]} depth={4} />
      </>
    );
  },
};

// ============================================================ blood and immune cells
const RED = spline([[-84, 0], [-74, -36], [-40, -56], [0, -60], [40, -56], [74, -36], [84, 0], [74, 36], [40, 56], [0, 60], [-40, 56], [-74, 36]]);
const redcell: Blueprint = {
  name: 'redcell', family: 'cell', role: 'The delivery driver: carries oxygen all day. Friendly, always in a hurry.',
  color: '#e94b50', accents: [{label: 'dimple', color: '#c93540'}],
  face: {x: 0, y: 2, size: 1.05},
  arms: {l: [-80, 8], r: [80, 8]},
  legs: null,
  ground: {y: 74, w: 58},
  body: ({color}) => (
    <Part d={RED} fill={color} shine={[-56, -38, 1.1]}>
      <Part d={ellipsePath(0, 3, 54, 33)} fill={shade(color, 0.12)} line={null} depth={-7} shadow={0.2} />
      <path d="M-46 22 Q0 44 46 22" fill="none" stroke={lift(color, 0.45)} strokeWidth={2.4} strokeLinecap="round" opacity={0.55} />
      <path d="M-70 -18 Q-52 -46 -14 -53" fill="none" stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" opacity={0.4} />
    </Part>
  ),
};

const WHITE = spline([[-72, -28], [-42, -62], [0, -70], [42, -62], [72, -28], [80, 10], [64, 48], [30, 70], [-8, 74], [-46, 64], [-76, 36], [-84, 2]]);
const CAP_DOME = 'M-42 -50 C-44 -90 44 -90 42 -50 Z';
const whitecell: Blueprint = {
  name: 'whitecell', family: 'cell', role: 'The body\'s security guard: patrols the blood and stops germs. Strict but kind.',
  color: '#eef1ff', accents: [{label: 'guard cap', color: '#1fb5a3'}, {label: 'nucleus', color: '#a48fe8'}, {label: 'badge', color: '#ffc93c'}],
  face: {x: 0, y: -2, size: 1.08, eye: '#6a55c9'},
  arms: {l: [-78, 18], r: [78, 18], len: 36},
  legs: {y: 64, gap: 24, len: 20, color: '#dfe4f7', shoe: '#17907f'},
  ground: {y: 94, w: 60},
  body: ({color}) => {
    const nuc = '#a48fe8';
    return (
      <Part d={WHITE} fill={color} mat="cell" shadow={0.12} shine={[-54, -20, 1.1]}>
        <g opacity={0.6}>
          <path d="M40 46 Q52 36 58 26 M36 50 Q28 56 24 58" fill="none" stroke={nuc} strokeWidth={5} strokeLinecap="round" />
          <path d={blob(19, 14, 'n1', 9, 0.08, 42, 46)} fill={nuc} />
          <path d={blob(14, 11.5, 'n2', 9, 0.08, 60, 24)} fill={nuc} />
          <path d={blob(12.5, 10.5, 'n3', 9, 0.08, 22, 60)} fill={nuc} />
          <path d={blob(9, 5, 'n4', 8, 0.1, 37, 41, -0.4)} fill="#d9d0fb" opacity={0.8} />
          <path d={blob(6, 3.5, 'n5', 8, 0.1, 57, 20, -0.4)} fill="#d9d0fb" opacity={0.8} />
        </g>
        {[[-56, 30, 3.2], [-44, 48, 2.6], [-62, 8, 2.4], [-24, 60, 2.8], [-66, -14, 2], [-34, 34, 1.8], [64, -8, 2.2], [4, 66, 2]].map(([x, y, r], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r={r} fill="#c3b8f4" />
            <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.35} fill="#ffffff" opacity={0.8} />
          </g>
        ))}
        <Cast d={roundRect(-47, -57, 94, 14, 6)} on={WHITE} color={color} dx={1} dy={5} k={0.3} />
      </Part>
    );
  },
  front: () => (
    <>
      <Part d={CAP_DOME} fill="#1fb5a3" mat="cloth" shine={[-18, -76, 0.9]}>
        <Tick d="M-22 -84 Q-24 -66 -22 -52 M22 -84 Q24 -66 22 -52" color="#148a7c" k={0.5} opacity={0.7} />
      </Part>
      <Part d={roundRect(-45, -57, 90, 11, 5)} fill="#17907f" depth={3}>
        <path d="M-45 -53.4 H45" stroke="#7fe3d6" strokeWidth={0.9} strokeDasharray="2.2 2.2" opacity={0.8} />
      </Part>
      <Part d="M-34 -47 Q0 -32 34 -47 Q0 -53 -34 -47 Z" fill="#126f63" mat="hard" depth={2} />
      <Part d="M-7.5 -80 H7.5 V-71 Q7.5 -63.5 0 -60.5 Q-7.5 -63.5 -7.5 -71 Z" fill="#ffc93c" mat="hard" depth={2} />
      <path d="M0 -77 l1.5 3.3 3.6 0.4 -2.7 2.4 0.8 3.5 -3.2 -1.9 -3.2 1.9 0.8 -3.5 -2.7 -2.4 3.6 -0.4 Z" fill="#fff6d0" />
    </>
  ),
};

const PLATE = spline([[-56, -4], [-40, -26], [-48, -46], [-24, -38], [0, -44], [18, -56], [30, -36], [52, -30], [48, -6], [62, 10], [42, 26], [34, 46], [10, 36], [-12, 48], [-30, 34], [-54, 36], [-46, 14]]);
const HELMET = 'M-30 -27 C-30 -62 30 -62 30 -27 Z';
const platelet: Blueprint = {
  name: 'platelet', family: 'cell', role: 'The first-aid crew: rushes to cuts and plugs the leak. Tiny, brave, noisy.',
  color: '#ffb24a', accents: [{label: 'medic helmet', color: '#fffdf6'}, {label: 'cross', color: '#ea4a55'}],
  face: {x: 0, y: 6, size: 0.86, eye: '#7a4416'},
  arms: {l: [-50, 14], r: [50, 14], len: 26},
  legs: {y: 38, gap: 15, len: 16, shoe: '#b96a1c'},
  ground: {y: 64, w: 42},
  body: ({color}) => (
    <Part d={PLATE} fill={color} mat="cell" depth={5}>
      {[[-34, 20, 3.4], [30, 22, 3.6], [-4, 36, 3], [40, 4, 2.4], [-40, -6, 2.4], [14, 30, 2]].map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill={shade(color, 0.26)} />
          <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.34} fill="#ffe7b8" opacity={0.9} />
        </g>
      ))}
      <Cast d={roundRect(-37, -31, 74, 10, 4)} on={PLATE} color={color} dx={1} dy={4.5} k={0.3} />
    </Part>
  ),
  front: () => (
    <>
      <Part d={HELMET} fill="#fffdf6" mat="hard" shadow={0.13} shine={[-14, -50, 0.7]} depth={4} />
      <Part d={roundRect(-35, -31, 70, 7.5, 3.6)} fill="#e3e8f3" mat="hard" depth={2} />
      <circle cx={0} cy={-45} r={9.6} fill="#ffffff" stroke="#d5dbea" strokeWidth={0.8} />
      <path d="M-2.6 -52.5 h5.2 v4.9 h4.9 v5.2 h-4.9 v4.9 h-5.2 v-4.9 h-4.9 v-5.2 h4.9 Z" fill="#ea4a55" />
    </>
  ),
};

// ============================================================ germs
const VIRUS = blob(62, 62, 'virus', 14, 0.035);
const virus: Blueprint = {
  name: 'virus', family: 'germ', role: 'The sneaky intruder: breaks into cells to copy itself. Smug until caught.',
  color: '#9b5cf0', accents: [{label: 'spikes', color: '#ff5c9d'}, {label: 'genes', color: '#5a2bb0'}],
  face: {x: 0, y: 0, size: 1.02, eye: '#c2185b'},
  arms: {l: [-56, 26], r: [56, 26], len: 30},
  legs: null,
  ground: {y: 96, w: 44},
  back: ({color, t}) => (
    <>
      {Array.from({length: 12}).map((_, i) => {
        const a = (i / 12) * Math.PI * 2 + t * 0.25;
        const cx = Math.cos(a);
        const sy = Math.sin(a);
        return (
          <g key={i}>
            <Tube d={`M${(cx * 54).toFixed(1)} ${(sy * 54).toFixed(1)} L${(cx * 75).toFixed(1)} ${(sy * 75).toFixed(1)}`} r={3} fill={shade(color, 0.12)} cap="butt" />
            <Part d={circlePath(cx * 81, sy * 81, 7.6)} fill="#ff5c9d" depth={2.6}>
              <circle cx={cx * 81 - 2.4} cy={sy * 81 - 2.6} r={2} fill="#ffffff" opacity={0.7} />
            </Part>
          </g>
        );
      })}
      {Array.from({length: 12}).map((_, i) => {
        const a = ((i + 0.5) / 12) * Math.PI * 2 + t * 0.25;
        return <Part key={i} d={circlePath(Math.cos(a) * 63, Math.sin(a) * 63, 3.4)} fill={lift(color, 0.25)} flat />;
      })}
    </>
  ),
  body: ({color}) => (
    <Part d={VIRUS} fill={color} mat="cell" shine={[-34, -38, 1.1]}>
      <path d="M12 44 C22 34 34 46 42 36 C50 26 36 18 44 8 M4 52 C16 58 26 50 34 56" fill="none" stroke="#5a2bb0" strokeWidth={3.4} strokeLinecap="round" opacity={0.42} />
      <path d="M12 44 C22 34 34 46 42 36 C50 26 36 18 44 8" fill="none" stroke="#c9a6ff" strokeWidth={0.9} strokeLinecap="round" opacity={0.6} transform="translate(-1 -1.2)" />
      {[[-40, 30, 5], [-48, -4, 3.6], [-22, 48, 3.2], [40, -34, 4.4], [50, -12, 2.6]].map(([x, y, r], i) => (
        <g key={i}>
          <path d={blob(r, r * 0.85, `cr${i}`, 8, 0.1, x, y)} fill={shade(color, 0.26)} />
          <path d={blob(r * 0.5, r * 0.36, `ch${i}`, 8, 0.1, x - r * 0.2, y - r * 0.3)} fill={lift(color, 0.5)} opacity={0.6} />
        </g>
      ))}
    </Part>
  ),
};

const BACT = roundRect(-72, -44, 144, 88, 44);
const bacteria: Blueprint = {
  name: 'bacteria', family: 'germ', role: 'The troublemaker: multiplies wherever food is left. Mischievous, loves sugar.',
  color: '#8bd469', accents: [{label: 'slime coat', color: '#c9f0a8'}, {label: 'genes', color: '#3f8a2c'}],
  face: {x: -4, y: -2, size: 1.02, eye: '#2f7d32'},
  arms: {l: [-52, 30], r: [52, 30], len: 26},
  legs: null,
  ground: {y: 62, w: 58},
  back: ({color, t}) => {
    const s = Math.sin(t * 6) * 10;
    const whip: P[] = [[70, 4], [84, 14 + s], [98, 2], [110, -8 - s * 0.5], [124, 2 - s * 0.4]];
    return (
      <>
        <path d={taperedPath(whip, 4.6, 0.02, 0.8)} fill={lineOf(color)} />
        {Array.from({length: 26}).map((_, i) => {
          const a = (i / 26) * Math.PI * 2 + 0.12;
          const p0: P = [Math.cos(a) * 66, Math.sin(a) * 40];
          const p1: P = [Math.cos(a) * (84 + (i % 3) * 3), Math.sin(a) * (55 + (i % 2) * 3)];
          return <Mark key={i} pts={[p0, [(p0[0] + p1[0]) / 2 + 2, (p0[1] + p1[1]) / 2], p1]} w={2} color={lineOf(color)} start={0.02} end={0.8} />;
        })}
        <Part d={roundRect(-78, -50, 156, 100, 50)} fill="#c9f0a8" line={lineOf(color, 0.4)} flat opacity={0.55} />
      </>
    );
  },
  body: ({color}) => (
    <Part d={BACT} fill={color} mat="cell" shine={[-46, -26, 1.1]}>
      <path d="M26 20 C34 10 46 22 52 12 C58 2 44 -2 50 -12 M22 28 C32 34 42 26 50 30" fill="none" stroke="#3f8a2c" strokeWidth={3.2} strokeLinecap="round" opacity={0.4} />
      <circle cx={-46} cy={22} r={7} fill="none" stroke="#3f8a2c" strokeWidth={2.2} opacity={0.4} />
      {[[-22, 32, 2.6], [8, 34, 2], [58, -24, 2.6], [-58, -4, 2.2], [40, 36, 1.8], [-34, -32, 1.8]].map(([x, y, r], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={r} fill={shade(color, 0.28)} />
          <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.36} fill="#eaffd6" opacity={0.85} />
        </g>
      ))}
    </Part>
  ),
};

// ============================================================ reproduction
const egg: Blueprint = {
  name: 'egg', family: 'cell', role: 'The egg cell: waits patiently once a month. Calm, a little picky.',
  color: '#ffd8c6', accents: [{label: 'outer layer', color: '#fff1e6'}, {label: 'helper cells', color: '#ffe3a1'}, {label: 'bow', color: '#ff7bac'}],
  face: {x: 0, y: -2, size: 1.08, eye: '#8a4a34', lashes: true},
  arms: {l: [-64, 20], r: [64, 20]},
  legs: null,
  ground: {y: 98, w: 56},
  back: () => (
    <>
      {Array.from({length: 14}).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const x = Math.cos(a) * 85;
        const y = Math.sin(a) * 85;
        return (
          <Part key={i} d={circlePath(x, y, 9.8)} fill="#ffe3a1" depth={3}>
            <circle cx={x + 1.6} cy={y + 1.8} r={3.2} fill="#f0b95a" opacity={0.75} />
          </Part>
        );
      })}
    </>
  ),
  body: ({color}) => (
    <>
      <Part d={circlePath(0, 0, 77)} fill="#fff1e6" mat="cell" tex={0.6} shadow={0.1} />
      <Part d={circlePath(60, -34, 6.5)} fill="#ffe9da" depth={2} />
      <Part d={circlePath(0, 0, 65)} fill={color} mat="cell" shine={[-34, -38, 1.1]}>
        <path d={blob(16, 14, 'nuc', 9, 0.08, 28, 36)} fill={lift(color, 0.5)} opacity={0.75} />
        <path d={blob(16, 14, 'nuc', 9, 0.08, 28, 36)} fill="none" stroke={shade(color, 0.3)} strokeWidth={1} opacity={0.6} />
        <circle cx={31} cy={39} r={4.4} fill={shade(color, 0.34)} opacity={0.75} />
      </Part>
    </>
  ),
  front: () => (
    <>
      <Part d="M-3 -67 C-10 -78 -20 -84 -25 -80 C-28 -72 -27 -60 -23 -55 C-16 -56 -8 -61 -3 -67 Z" fill="#ff7bac" mat="cloth" depth={2}>
        <Mark pts={[[-6, -67], [-14, -70], [-22, -72]]} w={1.3} color="#d94f86" opacity={0.8} />
        <Mark pts={[[-6, -66], [-14, -62], [-21, -59]]} w={1.3} color="#d94f86" opacity={0.8} />
      </Part>
      <Part d="M3 -67 C10 -78 20 -84 25 -80 C28 -72 27 -60 23 -55 C16 -56 8 -61 3 -67 Z" fill="#ff7bac" mat="cloth" depth={2}>
        <Mark pts={[[6, -67], [14, -70], [22, -72]]} w={1.3} color="#d94f86" opacity={0.8} />
        <Mark pts={[[6, -66], [14, -62], [21, -59]]} w={1.3} color="#d94f86" opacity={0.8} />
      </Part>
      <Part d={roundRect(-5.5, -73, 11, 12, 4)} fill="#ff93bc" depth={2} />
    </>
  ),
};

const SPERM = spline([[-74, 0], [-64, -24], [-36, -34], [-6, -28], [10, 0], [-6, 28], [-36, 34], [-64, 24]]);
const sperm: Blueprint = {
  name: 'sperm', family: 'cell', role: 'The swimmer: one of millions in a race. Determined, competitive.',
  color: '#f3f6ff', accents: [{label: 'cap', color: '#a9e4dc'}, {label: 'engine', color: '#cfd9f7'}, {label: 'eyes', color: '#3f6fbf'}],
  face: {x: -28, y: 0, size: 0.78, eye: '#3f6fbf'},
  arms: null,
  legs: null,
  ground: {y: 56, w: 46},
  back: ({t}) => {
    const s = Math.sin(t * 9) * 9;
    const tail: P[] = [[34, 0], [48, 9 + s], [62, 0], [76, -8 - s * 0.6], [90, 0], [102, 6 + s * 0.5], [114, 0]];
    return (
      <>
        <path d={taperedPath(tail, 7.4, 0.01, 0.85)} fill={lineOf('#dfe6fb')} />
        <path d={taperedPath(tail, 4.6, 0.01, 0.85)} fill="#e7ecfc" />
        <Tube d="M6 0 L36 0" r={7.2} fill="#cfd9f7" />
        {[12, 18, 24, 30].map((x) => <Tick key={x} d={`M${x - 2.4} -6.4 L${x + 2.4} 6.4`} color="#8f9fd6" k={0.6} opacity={0.8} />)}
      </>
    );
  },
  body: ({color}) => (
    <Part d={SPERM} fill={color} mat="cell" tex={0.5} shadow={0.12} shine={[-50, -19, 0.9]} depth={5}>
      <path d="M-80 -40 H-50 Q-43 0 -50 40 H-80 Z" fill="#a9e4dc" opacity={0.85} />
      <path d="M-50 -40 Q-43 0 -50 40" fill="none" stroke="#5fc2b6" strokeWidth={1.1} opacity={0.9} />
    </Part>
  ),
};

export const BLUEPRINTS = {stomach, intestine, liver, kidney, bladder, lungs, heart, brain, tooth, bone, pill, poop, redcell, whitecell, platelet, virus, bacteria, egg, sperm};
export type CastName = keyof typeof BLUEPRINTS;
export const CAST = Object.fromEntries(Object.entries(BLUEPRINTS).map(([k, bp]) => [k, makeCharacter(bp)])) as Record<CastName, Character>;
// `tone` stays exported from ink for older call sites; body characters use shade/lift (hue-shifted paint).
void tone;
