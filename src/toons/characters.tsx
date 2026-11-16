// MedPeak Toons body cast (v5). Every character is a Blueprint (see blueprint.tsx) drawn in a
// 200x200 box centred on (0,0). Organs are drawn from their real anatomy (vessels, airways,
// lobes) and have NO legs: they live in one place. Only travellers (pill, white cell, platelet)
// get legs. One accessory shows a character's job (guard cap, medic helmet).
import React from 'react';
import {blob, circlePath, ellipsePath, lineOf, lobePts, Mark, Merge, Part, roundRect, spline, tone, Tube, useLine, type P} from './ink';
import {type Blueprint, type Character, makeCharacter} from './blueprint';

/** A darker shade of a colour for folds and creases (low contrast, never a hard line). */
const D = (c: string, k = 0.17) => tone(c, k);

/** The open end of a cut tube (vessel, airway): a dark oval with a rim. */
const TubeEnd: React.FC<{x: number; y: number; rx: number; ry: number; rot?: number; color: string}> = ({x, y, rx, ry, rot = 0, color}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <Part d={ellipsePath(0, 0, rx, ry)} fill={tone(color, 0.42)} line={lineOf(color)} flat />
  </g>
);
/** A thin detail line (seams, rings) in the house line weight. */
const Tick: React.FC<{d: string; color: string; k?: number}> = ({d, color, k = 0.62}) => {
  const w = useLine(k);
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;
};

// ============================================================ digestion
const STOMACH = spline([[-18, -52], [-28, -32], [-38, -10], [-54, 8], [-74, 18], [-88, 30], [-86, 46], [-70, 54], [-44, 58], [-10, 70], [28, 66], [60, 42], [74, 4], [66, -34], [46, -58], [20, -66], [-2, -60]]);
const stomach: Blueprint = {
  name: 'stomach', family: 'organ', role: 'The hard-working cook: mixes food with acid. Grumpy when overfed.',
  color: '#ff8f9c',
  face: {x: 12, y: -8, size: 1.12},
  arms: {l: [-40, 0], r: [70, 6]},
  rest: [168, 62],
  legs: null,
  ground: {y: 74, w: 58},
  back: ({color}) => (
    <>
      <Tube d="M-10 -48 C-11 -64 -15 -76 -13 -92" r={9.5} fill={tone(color, 0.06)} cap="butt" />
      <TubeEnd x={-13} y={-92} rx={9.5} ry={3.4} rot={-6} color={color} />
    </>
  ),
  body: ({color}) => (
    <Part d={STOMACH} fill={color} shine={[40, -44, 1.3]}>
      <Mark pts={[[-36, 52], [2, 62], [44, 46]]} w={3.4} color={D(color)} />
      <Mark pts={[[-16, 42], [14, 50], [42, 34]]} w={2.6} color={D(color)} />
      <Mark pts={[[50, -38], [64, -16], [64, 8]]} w={2.6} color={D(color)} />
      <Mark pts={[[-72, 21], [-79, 36], [-73, 51]]} w={2.6} color={D(color, 0.26)} />
    </Part>
  ),
};

const COIL = spline([[-48, -24], [0, -32], [48, -24], [54, 18], [42, 58], [0, 70], [-42, 58], [-54, 18]]);
const COLON = 'M-58 60 C-64 30 -64 -16 -58 -40 C-52 -62 -26 -64 0 -60 C26 -64 52 -62 58 -40 C64 -16 64 30 58 60';
const intestine: Blueprint = {
  name: 'intestine', family: 'organ', role: 'The long conveyor belt: soaks up food and water. Patient, a bit of a gossip.',
  color: '#ffb3aa', accents: [{label: 'colon', color: '#f08f86'}],
  face: {x: 0, y: 14, size: 1},
  arms: {l: [-68, 10], r: [68, 10], color: '#f08f86'},
  legs: null,
  ground: {y: 76, w: 62},
  back: () => <Tube d="M-58 62 C-60 74 -70 78 -74 70" r={3} fill="#f08f86" />,
  body: ({color}) => {
    const colon = '#f08f86';
    const ticks: [number, number, boolean][] = [[-61, 38, true], [-63, 14, true], [-63, -10, true], [-40, -59, false], [-20, -62, false], [0, -60, false], [20, -62, false], [40, -59, false], [63, -10, true], [63, 14, true], [61, 38, true]];
    return (
      <>
        <Part d={COIL} fill={color}>
          <Mark pts={[[-36, -12], [-24, -22], [-12, -12], [0, -22], [12, -12], [24, -22], [36, -12]]} w={2.4} color={D(color)} />
          <Mark pts={[[-34, 54], [-22, 44], [-10, 54], [2, 44], [14, 54], [26, 44], [36, 54]]} w={2.4} color={D(color)} />
          <Mark pts={[[-20, 64], [-8, 58], [4, 64], [16, 58]]} w={2} color={D(color)} />
        </Part>
        <Tube d={COLON} r={11} fill={colon} />
        {ticks.map(([x, y, side], i) => <Tick key={i} d={side ? `M${x - 6.5} ${y} H${x + 6.5}` : `M${x} ${y - 6.5} V${y + 6.5}`} color={D(colon, 0.26)} />)}
      </>
    );
  },
};

const LIVER = spline([[-88, -6], [-82, -40], [-44, -58], [8, -56], [54, -48], [86, -34], [92, -18], [72, 2], [32, 24], [-8, 46], [-48, 58], [-78, 42]]);
const liver: Blueprint = {
  name: 'liver', family: 'organ', role: 'The chemistry lab and cleaner: filters blood, handles sugar and alcohol. Calm, overworked.',
  color: '#c9584b', accents: [{label: 'gallbladder', color: '#7dbb5c'}],
  face: {x: -30, y: -6, size: 1.05},
  arms: {l: [-84, 6], r: [62, -4]},
  legs: null,
  ground: {y: 62, w: 66},
  back: () => <Part d={blob(10, 15, 'gb', 10, 0.04, -14, 50, 0.3)} fill="#7dbb5c" shine={[-18, 44, 0.5]} depth={3} />,
  body: ({color}) => (
    <Part d={LIVER} fill={color} shine={[-60, -38, 1.2]}>
      <Mark pts={[[12, -54], [6, -22], [-4, 10], [-10, 42]]} w={2.6} color={D(color, 0.24)} />
      <Mark pts={[[40, -40], [62, -30], [80, -24]]} w={2.2} color={D(color)} />
    </Part>
  ),
};

const KIDNEY = spline([[-8, -82], [28, -78], [50, -54], [48, -26], [34, -8], [32, 10], [46, 30], [50, 56], [28, 78], [-8, 84], [-40, 68], [-58, 32], [-60, -10], [-50, -52], [-32, -74]]);
const kidney: Blueprint = {
  name: 'kidney', family: 'organ', role: 'The water filter: cleans the blood and makes urine. Precise, a little fussy.',
  color: '#b84e62', accents: [{label: 'artery', color: '#ea5560'}, {label: 'vein', color: '#5f8fe6'}, {label: 'ureter', color: '#f2dcae'}],
  face: {x: -10, y: -6, size: 1},
  arms: {l: [-58, 12], r: [46, 42]},
  legs: null,
  ground: {y: 88, w: 46},
  back: () => (
    <>
      <Tube d="M30 14 C50 26 46 60 60 92" r={3.4} fill="#f2dcae" />
      <Tube d="M30 -6 C46 -10 60 -12 76 -18" r={4.4} fill="#ea5560" cap="butt" />
      <TubeEnd x={76} y={-18} rx={1.8} ry={4.4} rot={-12} color="#ea5560" />
      <Tube d="M32 6 C48 6 62 4 78 2" r={4.4} fill="#5f8fe6" cap="butt" />
      <TubeEnd x={78} y={2} rx={1.8} ry={4.4} rot={-4} color="#5f8fe6" />
    </>
  ),
  body: ({color}) => (
    <Part d={KIDNEY} fill={color} shine={[-34, -54, 1.1]}>
      <Mark pts={[[34, -24], [22, 2], [34, 26]]} w={4.4} color={D(color, 0.22)} />
    </Part>
  ),
};

const BLADDER = spline([[0, -66], [36, -58], [62, -28], [68, 10], [54, 48], [22, 68], [0, 70], [-22, 68], [-54, 48], [-68, 10], [-62, -28], [-36, -58]]);
const bladder: Blueprint = {
  name: 'bladder', family: 'organ', role: 'The water tank: holds urine until it is time. Anxious when full.',
  color: '#ffd685', accents: [{label: 'urine', color: '#ffb42e'}],
  face: {x: 0, y: -12, size: 1.08},
  arms: {l: [-66, 10], r: [66, 10]},
  legs: null,
  ground: {y: 88, w: 50},
  back: ({color}) => (
    <>
      <Tube d="M-34 -54 C-46 -70 -42 -86 -56 -96" r={3.4} fill="#f3dcae" />
      <Tube d="M34 -54 C46 -70 42 -86 56 -96" r={3.4} fill="#f3dcae" />
      <Tube d="M0 62 L0 84" r={5.4} fill={tone(color, 0.08)} />
    </>
  ),
  body: ({color, t}) => {
    const s = Math.sin(t * 2.2) * 3;
    return (
      <Part d={BLADDER} fill={color} shine={[-36, -44, 1.2]}>
        <path d={`M-80 ${22 + s} Q-40 ${14 - s} 0 ${21} T80 ${22 - s} V90 H-80 Z`} fill="#ffb42e" opacity={0.5} />
        <path d={`M-80 ${22 + s} Q-40 ${14 - s} 0 ${21} T80 ${22 - s}`} fill="none" stroke="#fff3c9" strokeWidth={2} opacity={0.8} />
      </Part>
    );
  },
};

// ============================================================ chest and head
const LUNG_L = spline([[3, -48], [-22, -66], [-52, -52], [-72, -12], [-80, 34], [-72, 72], [-48, 84], [-22, 74], [-6, 52], [3, 10]]);
const LUNG_R = spline([[-3, -48], [22, -66], [52, -52], [72, -12], [80, 34], [72, 72], [48, 84], [30, 76], [22, 56], [10, 44], [-3, 10]]);
const lungs: Blueprint = {
  name: 'lungs', family: 'organ', role: 'The air team: bring oxygen in, push carbon dioxide out. Cheerful, hates smoke.',
  color: '#ff9db4', accents: [{label: 'windpipe', color: '#e3eaf4'}],
  face: {x: 0, y: 2, size: 1.12},
  arms: {l: [-76, 20], r: [76, 20]},
  legs: null,
  ground: {y: 90, w: 66},
  back: () => (
    <>
      <Tube d="M0 -98 L0 -52" r={7.5} fill="#e3eaf4" cap="butt" />
      {[-90, -80, -70].map((y) => <Tick key={y} d={`M-7 ${y} Q0 ${y + 2.4} 7 ${y}`} color="#9fb0c8" />)}
      <TubeEnd x={0} y={-98} rx={7.5} ry={2.8} color="#e3eaf4" />
    </>
  ),
  body: ({color}) => (
    <>
      <Merge>
        <Part d={LUNG_L} fill={color} shine={[-50, -34, 1.1]}>
          <Mark pts={[[-78, 34], [-58, 44], [-34, 40]]} w={2.6} color={D(color)} />
          <Mark pts={[[-66, -26], [-50, -18], [-36, -22]]} w={2.2} color={D(color)} />
        </Part>
        <Part d={LUNG_R} fill={color}>
          <Mark pts={[[34, 40], [58, 44], [78, 34]]} w={2.6} color={D(color)} />
          <Mark pts={[[36, -22], [50, -18], [66, -26]]} w={2.2} color={D(color)} />
        </Part>
      </Merge>
      <Mark pts={[[0, 22], [1, 34], [4, 46]]} w={2.2} color={D(color, 0.24)} />
    </>
  ),
};

const HEART = spline([[0, -34], [20, -58], [52, -62], [78, -42], [82, -8], [64, 28], [36, 58], [6, 84], [-6, 82], [-34, 56], [-64, 24], [-80, -12], [-74, -46], [-50, -62], [-22, -56]]);
const heart: Blueprint = {
  name: 'heart', family: 'organ', role: 'The pump that never rests: sends blood everywhere. Loyal, dramatic under stress.',
  color: '#f25f70', accents: [{label: 'aorta', color: '#e9434f'}, {label: 'pulmonary artery', color: '#6f93ee'}],
  face: {x: 0, y: -6, size: 1.12},
  arms: {l: [-78, 2], r: [80, 0]},
  legs: null,
  ground: {y: 90, w: 44},
  back: () => (
    <>
      <Tube d="M-6 -40 C-10 -62 -26 -74 -46 -74" r={8} fill="#6f93ee" cap="butt" />
      <TubeEnd x={-46} y={-74} rx={3} ry={8} color="#6f93ee" />
      {[['M16 -86 L13 -99'], ['M28 -90 L28 -103'], ['M40 -85 L44 -97']].map(([d]) => <Tube key={d} d={d} r={3} fill="#e9434f" />)}
      <Tube d="M8 -40 C6 -76 30 -94 46 -78 C52 -70 52 -60 50 -48" r={9} fill="#e9434f" />
    </>
  ),
  body: ({color}) => (
    <Part d={HEART} fill={color} shine={[-52, -40, 1.2]}>
      <Mark pts={[[46, -54], [62, -24], [56, 8]]} w={2.4} color={D(color, 0.2)} />
      <Mark pts={[[-52, -50], [-66, -18], [-54, 14]]} w={2.4} color={D(color, 0.2)} />
    </Part>
  ),
};

const BRAIN = spline(lobePts(82, 58, 9, 0.1, 0, -8, -Math.PI / 2), true, 0.6);
const brain: Blueprint = {
  name: 'brain', family: 'organ', role: 'The control room: gives the orders, takes every call. Smart, easily distracted.',
  color: '#ffb3c7', accents: [{label: 'cerebellum', color: '#f59ab2'}],
  face: {x: 0, y: 2, size: 1.1},
  arms: {l: [-82, 8], r: [82, 8]},
  legs: null,
  ground: {y: 90, w: 50},
  back: ({color}) => (
    <>
      <Tube d="M14 40 C12 58 10 72 12 86" r={7} fill={tone(color, 0.1)} />
      <Part d={blob(27, 19, 'cb', 10, 0.05, 46, 44)} fill="#f59ab2" depth={4}>
        {[36, 44, 52].map((y) => <Mark key={y} pts={[[24, y], [46, y + 3], [68, y - 1]]} w={1.8} color={D('#f59ab2', 0.2)} />)}
      </Part>
    </>
  ),
  body: ({color}) => (
    <Part d={BRAIN} fill={color} shine={[-46, -46, 1.2]}>
      <Mark pts={[[0, -66], [-3, -52], [1, -40]]} w={2.6} color={D(color, 0.22)} />
      <Mark pts={[[-62, -30], [-48, -46], [-32, -38], [-36, -24]]} w={2.6} color={D(color)} />
      <Mark pts={[[30, -52], [46, -42], [42, -28]]} w={2.6} color={D(color)} />
      <Mark pts={[[60, -8], [72, -22], [64, -36]]} w={2.4} color={D(color)} />
      <Mark pts={[[-74, 2], [-60, 14], [-64, 30]]} w={2.4} color={D(color)} />
      <Mark pts={[[-30, 40], [-12, 46], [8, 42]]} w={2.2} color={D(color)} />
    </Part>
  ),
};

const TOOTH = spline([[-50, -58], [-28, -72], [-8, -62], [0, -58], [8, -62], [28, -72], [50, -58], [62, -30], [56, 8], [48, 40], [40, 74], [30, 90], [20, 84], [14, 56], [0, 46], [-14, 56], [-20, 84], [-30, 90], [-40, 74], [-48, 40], [-56, 8], [-62, -30]]);
const tooth: Blueprint = {
  name: 'tooth', family: 'organ', role: 'The chopper: tough outside, sensitive inside. Terrified of sugar and acid.',
  color: '#fffdf6',
  face: {x: 0, y: -14, size: 1.08},
  arms: {l: [-56, 2], r: [56, 2]},
  legs: null,
  ground: {y: 92, w: 40},
  body: ({color}) => <Part d={TOOTH} fill={color} shadow={0.12} shine={[-32, -52, 1.1]} />,
};

const bone: Blueprint = {
  name: 'bone', family: 'skeleton', role: 'The frame: holds everything up and makes blood inside. Sturdy, old-fashioned.',
  color: '#fbf5e6',
  face: {x: 0, y: -4, size: 0.9},
  arms: {l: [-30, 4], r: [30, 4]},
  legs: null,
  ground: {y: 94, w: 40},
  body: ({color}) => (
    <Merge>
      <Part d={circlePath(-21, -70, 23)} fill={color} shadow={0.12} depth={5} />
      <Part d={circlePath(21, -70, 23)} fill={color} shadow={0.12} depth={5} />
      <Part d={circlePath(-21, 70, 23)} fill={color} shadow={0.12} depth={5} />
      <Part d={circlePath(21, 70, 23)} fill={color} shadow={0.12} depth={5} />
      <Part d={roundRect(-32, -66, 64, 132, 16)} fill={color} shadow={0.12} shine={[-12, -44, 0.9]} />
    </Merge>
  ),
};

// ============================================================ medicine and waste
const PILL_TOP = 'M-40 -6 V-38 A40 40 0 0 1 40 -38 V-6 Z';
const PILL_BOTTOM = 'M-40 -6 H40 V38 A40 40 0 0 1 -40 38 Z';
const pill: Blueprint = {
  name: 'pill', family: 'medicine', role: 'The helper on a mission: travels to where it is needed. Eager, sometimes lost.',
  color: '#19b8a6', accents: [{label: 'body', color: '#fffdf6'}],
  face: {x: 0, y: 28, size: 0.86, skin: '#fffdf6'},
  arms: {l: [-40, 6], r: [40, 6], color: '#eef1f6'},
  legs: {y: 70, gap: 15, len: 18, color: '#eef1f6', shoe: '#128f81'},
  ground: {y: 96, w: 40},
  body: ({color}) => (
    <>
      <Merge>
        <Part d={PILL_BOTTOM} fill="#fffdf6" shadow={0.12} />
        <Part d={PILL_TOP} fill={color} shine={[-16, -56, 1.1]} />
      </Merge>
      <Tick d="M-40 -6 H40" color={lineOf(color)} k={0.8} />
      <path d="M-34 -2.6 H34" stroke="#ffffff" strokeWidth={2.2} strokeLinecap="round" opacity={0.7} />
    </>
  ),
};

const POOP_B = spline([[-72, 62], [-62, 42], [-22, 34], [22, 34], [62, 42], [72, 62], [60, 82], [0, 90], [-60, 82]]);
const POOP_M = spline([[-52, 28], [-44, 8], [0, 2], [44, 8], [52, 28], [40, 44], [0, 48], [-40, 44]]);
const POOP_T = spline([[-34, -4], [-26, -22], [0, -28], [26, -22], [34, -4], [22, 8], [0, 10], [-22, 8]]);
const POOP_TIP = spline([[-12, -22], [-8, -46], [6, -64], [26, -70], [18, -58], [20, -42], [16, -24]]);
const poop: Blueprint = {
  name: 'poop', family: 'waste', role: 'The leftovers on the way out: blunt, proud, refuses to be rushed.',
  color: '#a06a45',
  face: {x: 0, y: 56, size: 0.98},
  arms: {l: [-64, 60], r: [64, 60]},
  legs: null,
  ground: {y: 92, w: 68},
  body: ({color}) => (
    <>
      <Part d={POOP_B} fill={color} shine={[-48, 46, 0.9]} />
      <Part d={POOP_M} fill={tone(color, -0.06)} shine={[-34, 12, 0.8]} depth={5} />
      <Part d={POOP_TIP} fill={tone(color, -0.14)} depth={3} />
      <Part d={POOP_T} fill={tone(color, -0.1)} shine={[-20, -18, 0.7]} depth={4} />
    </>
  ),
};

// ============================================================ blood and immune cells
const RED = spline([[-84, 0], [-74, -36], [-40, -56], [0, -60], [40, -56], [74, -36], [84, 0], [74, 36], [40, 56], [0, 60], [-40, 56], [-74, 36]]);
const redcell: Blueprint = {
  name: 'redcell', family: 'cell', role: 'The delivery driver: carries oxygen all day. Friendly, always in a hurry.',
  color: '#e94b50',
  face: {x: 0, y: 2, size: 1.05},
  arms: {l: [-80, 8], r: [80, 8]},
  legs: null,
  ground: {y: 74, w: 58},
  body: ({color}) => (
    <Part d={RED} fill={color} shine={[-56, -36, 1.1]}>
      <Part d={ellipsePath(0, 3, 52, 31)} fill={tone(color, 0.09)} line={null} depth={-6} shadow={0.14} />
    </Part>
  ),
};

const WHITE = spline([[-72, -28], [-42, -62], [0, -70], [42, -62], [72, -28], [80, 10], [64, 48], [30, 70], [-8, 74], [-46, 64], [-76, 36], [-84, 2]]);
const whitecell: Blueprint = {
  name: 'whitecell', family: 'cell', role: 'The body\'s security guard: patrols the blood and stops germs. Strict but kind.',
  color: '#eef1ff', accents: [{label: 'guard cap', color: '#1fb5a3'}, {label: 'nucleus', color: '#b7a4f0'}, {label: 'badge', color: '#ffc93c'}],
  face: {x: 0, y: -2, size: 1.08},
  arms: {l: [-78, 18], r: [78, 18], len: 36},
  legs: {y: 64, gap: 24, len: 20, color: '#dfe4f7', shoe: '#17907f'},
  ground: {y: 94, w: 60},
  body: ({color}) => (
    <Part d={WHITE} fill={color} shadow={0.11} shine={[-52, -22, 1.1]}>
      <path d={blob(20, 15, 'n1', 9, 0.08, 42, 44)} fill="#b7a4f0" opacity={0.42} />
      <path d={blob(15, 12, 'n2', 9, 0.08, 60, 24)} fill="#b7a4f0" opacity={0.42} />
      <path d={blob(13, 11, 'n3', 9, 0.08, 22, 58)} fill="#b7a4f0" opacity={0.42} />
      {[[-56, 30], [-44, 48], [-62, 8], [-24, 58]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3.4} fill="#cfc6f7" />)}
    </Part>
  ),
  front: () => (
    <>
      <Part d="M-42 -50 C-44 -90 44 -90 42 -50 Z" fill="#1fb5a3" shine={[-18, -76, 0.9]} />
      <Part d={roundRect(-45, -57, 90, 11, 5)} fill="#17907f" depth={3} />
      <Part d="M-34 -47 Q0 -32 34 -47 Q0 -53 -34 -47 Z" fill="#126f63" depth={2} />
      <Part d="M-6.5 -79 H6.5 V-71 Q6.5 -64.5 0 -62 Q-6.5 -64.5 -6.5 -71 Z" fill="#ffc93c" depth={2} />
    </>
  ),
};

const PLATE = spline([[-56, -4], [-40, -26], [-48, -46], [-24, -38], [0, -44], [18, -56], [30, -36], [52, -30], [48, -6], [62, 10], [42, 26], [34, 46], [10, 36], [-12, 48], [-30, 34], [-54, 36], [-46, 14]]);
const platelet: Blueprint = {
  name: 'platelet', family: 'cell', role: 'The first-aid crew: rushes to cuts and plugs the leak. Tiny, brave, noisy.',
  color: '#ffb24a', accents: [{label: 'medic helmet', color: '#fffdf6'}, {label: 'cross', color: '#ea4a55'}],
  face: {x: 0, y: 6, size: 0.86},
  arms: {l: [-50, 14], r: [50, 14], len: 26},
  legs: {y: 38, gap: 15, len: 16, shoe: '#b96a1c'},
  ground: {y: 64, w: 42},
  body: ({color}) => (
    <Part d={PLATE} fill={color} depth={5}>
      {[[-34, 20], [30, 22], [-4, 34]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={3.6} fill={D(color, 0.2)} />)}
    </Part>
  ),
  front: () => (
    <>
      <Part d="M-30 -27 C-30 -62 30 -62 30 -27 Z" fill="#fffdf6" shadow={0.12} shine={[-12, -50, 0.7]} depth={4} />
      <Part d={roundRect(-35, -31, 70, 7.5, 3.6)} fill="#e6eaf2" depth={2} />
      <path d="M-3 -54 h6 v5.5 h5.5 v6 h-5.5 v5.5 h-6 v-5.5 h-5.5 v-6 h5.5 Z" fill="#ea4a55" />
    </>
  ),
};

// ============================================================ germs
const virus: Blueprint = {
  name: 'virus', family: 'germ', role: 'The sneaky intruder: breaks into cells to copy itself. Smug until caught.',
  color: '#9b5cf0', accents: [{label: 'spikes', color: '#ff5c9d'}],
  face: {x: 0, y: 0, size: 1.02},
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
            <Tube d={`M${(cx * 54).toFixed(1)} ${(sy * 54).toFixed(1)} L${(cx * 75).toFixed(1)} ${(sy * 75).toFixed(1)}`} r={2.8} fill={tone(color, 0.1)} cap="butt" />
            <Part d={circlePath(cx * 80, sy * 80, 7)} fill="#ff5c9d" depth={2.4} />
          </g>
        );
      })}
    </>
  ),
  body: ({color}) => (
    <Part d={blob(62, 62, 'virus', 14, 0.035)} fill={color} shine={[-34, -38, 1.1]}>
      {[[-34, 34, 7], [38, -30, 6], [34, 38, 7], [-44, -6, 4.5], [8, 50, 4]].map(([x, y, r], i) => <path key={i} d={blob(r, r * 0.85, `cr${i}`, 8, 0.1, x, y)} fill={D(color, 0.2)} />)}
    </Part>
  ),
};

const bacteria: Blueprint = {
  name: 'bacteria', family: 'germ', role: 'The troublemaker: multiplies wherever food is left. Mischievous, loves sugar.',
  color: '#8bd469',
  face: {x: 0, y: -2, size: 1.02},
  arms: {l: [-52, 30], r: [52, 30], len: 26},
  legs: null,
  ground: {y: 60, w: 58},
  back: ({color, t}) => {
    const s = Math.sin(t * 6) * 10;
    return (
      <>
        <Tube d={`M68 2 Q82 ${14 + s} 94 2 T120 ${2 - s * 0.4}`} r={1.9} fill={lineOf(color)} line={null} flat />
        {Array.from({length: 18}).map((_, i) => {
          const a = (i / 18) * Math.PI * 2 + 0.17;
          const p0: P = [Math.cos(a) * 62, Math.sin(a) * 36];
          const p1: P = [Math.cos(a) * 84, Math.sin(a) * 55];
          return <Mark key={i} pts={[p0, [(p0[0] + p1[0]) / 2 + 2, (p0[1] + p1[1]) / 2], p1]} w={2.4} color={lineOf(color)} />;
        })}
      </>
    );
  },
  body: ({color}) => (
    <Part d={roundRect(-72, -44, 144, 88, 44)} fill={color} shine={[-46, -26, 1.1]}>
      {[[-50, 20, 6], [44, 24, 6], [52, -22, 4], [-16, 34, 4.5], [18, -32, 3.6]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={D(color, 0.2)} />)}
    </Part>
  ),
};

// ============================================================ reproduction
const egg: Blueprint = {
  name: 'egg', family: 'cell', role: 'The egg cell: waits patiently once a month. Calm, a little picky.',
  color: '#ffd8c6', accents: [{label: 'outer layer', color: '#fff1e6'}, {label: 'helper cells', color: '#ffe7ab'}, {label: 'bow', color: '#ff7bac'}],
  face: {x: 0, y: -2, size: 1.08},
  arms: {l: [-64, 20], r: [64, 20]},
  legs: null,
  ground: {y: 98, w: 56},
  back: () => <>{Array.from({length: 14}).map((_, i) => { const a = (i / 14) * Math.PI * 2; return <Part key={i} d={circlePath(Math.cos(a) * 84, Math.sin(a) * 84, 9.5)} fill="#ffe7ab" depth={3} />; })}</>,
  body: ({color}) => (
    <>
      <Part d={circlePath(0, 0, 77)} fill="#fff1e6" shadow={0.1} />
      <Part d={circlePath(0, 0, 65)} fill={color} shine={[-32, -36, 1.1]}>
        <path d={blob(15, 13, 'nuc', 9, 0.08, 26, 34)} fill={D(color, 0.14)} />
      </Part>
    </>
  ),
  front: () => (
    <>
      <Part d="M-3 -67 L-22 -80 L-22 -54 Z" fill="#ff7bac" depth={2} />
      <Part d="M3 -67 L22 -80 L22 -54 Z" fill="#ff7bac" depth={2} />
      <Part d={circlePath(0, -67, 6.5)} fill="#ff7bac" depth={2} />
    </>
  ),
};

const SPERM = spline([[-74, 0], [-64, -24], [-36, -34], [-6, -28], [10, 0], [-6, 28], [-36, 34], [-64, 24]]);
const sperm: Blueprint = {
  name: 'sperm', family: 'cell', role: 'The swimmer: one of millions in a race. Determined, competitive.',
  color: '#f3f6ff', accents: [{label: 'cap', color: '#bfe9e4'}, {label: 'midpiece', color: '#d5def8'}],
  face: {x: -30, y: 0, size: 0.78},
  arms: null,
  legs: null,
  ground: {y: 56, w: 46},
  back: ({t}) => {
    const s = Math.sin(t * 9) * 9;
    return (
      <>
        <Tube d={`M34 0 Q48 ${10 + s} 60 0 T86 ${-s * 0.6} T108 ${s * 0.5}`} r={2.4} fill="#dfe6fb" />
        <Tube d="M6 0 L36 0" r={7} fill="#d5def8" />
      </>
    );
  },
  body: ({color}) => (
    <Part d={SPERM} fill={color} shadow={0.11} shine={[-48, -18, 0.9]} depth={5}>
      <path d="M-80 -40 H-52 Q-46 0 -52 40 H-80 Z" fill="#bfe9e4" opacity={0.9} />
    </Part>
  ),
};

export const BLUEPRINTS = {stomach, intestine, liver, kidney, bladder, lungs, heart, brain, tooth, bone, pill, poop, redcell, whitecell, platelet, virus, bacteria, egg, sperm};
export type CastName = keyof typeof BLUEPRINTS;
export const CAST = Object.fromEntries(Object.entries(BLUEPRINTS).map(([k, bp]) => [k, makeCharacter(bp)])) as Record<CastName, Character>;
