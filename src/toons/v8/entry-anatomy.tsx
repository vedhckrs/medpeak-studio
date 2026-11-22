/**
 * Engine v9 sheets of the anatomy stages (anatomy.tsx): one 16:9 board per stage with four states, and each stage at full
 * 1080 x 1920. `node pipeline/toon-v8-sheets.mjs v9-stage` (boards) and `--scenes v9-` (full stills).
 */
import React from 'react';
import {registerRoot, Still} from 'remotion';
import {Board, CLOTH, FONT, INK} from './kit';
import {STAGES, CoEgg, type StageName, type StageFace} from './anatomy';
import {PaleRoomFull} from './scenes-rooms';
import COLOUR from './anatomy-colour.json';

type State = {label: string; note: string; state: Record<string, number>; faces?: Record<string, StageFace>; extra?: React.ReactNode};
const BOARD: Record<StageName, {title: string; note: string; states: State[]}> = {
  chest: {
    title: 'Chest: both lungs in their place', note: 'Lungs with the windpipe and its rings, the bronchi, the heart between them, ribs behind, the diaphragm, the liver below. Dials: tar, mucus, airway, cough, pink, cilia.',
    states: [
      {label: 'Smoker', note: 'tar 0.85, grey, narrow airways, mucus, cilia asleep', state: {tar: 0.85, pink: 0, airway: 0.4, mucus: 0.8, cilia: 0}, faces: {lungR: {mood: 'sleepy', mouth: 'wavy', look: [0.6, 0.2]}, lungL: {mood: 'pain', mouth: 'frown', lookAt: [290, 640]}}},
      {label: 'The cough', note: 'cough 1: both lungs squeeze', state: {tar: 0.85, pink: 0, airway: 0.4, mucus: 0.8, cilia: 0, cough: 1}, faces: {lungR: {mood: 'shock', mouth: 'o', look: [0.8, -0.2]}, lungL: {mood: 'squint', mouth: 'o', lookAt: [290, 640]}}},
      {label: '3 days later', note: 'tar 0.45, pinker, airways open, cilia waking', state: {tar: 0.45, pink: 0.55, airway: 0.8, mucus: 0.5, cilia: 0.6}, faces: {lungR: {mood: 'open', mouth: 'smile', lookAt: [800, 650]}, lungL: {mood: 'happy', mouth: 'smile'}}},
      {label: 'Healthy', note: 'tar 0, pink, open, every cilium sweeping', state: {tar: 0, pink: 1, airway: 1, mucus: 0, cilia: 1}, faces: {lungR: {mood: 'happy', mouth: 'big'}, lungL: {mood: 'open', mouth: 'smile', lookAt: [290, 640]}}},
    ],
  },
  vesselInside: {
    title: 'Inside a blood vessel', note: 'The wall from inside (rim band, folds), a floor to stand on, a branch opening for the intruder, red cells flowing in ONE band (5% of the frame). Dials: flow, co, pink.',
    states: [
      {label: 'CO riders', note: 'co 1: every second cell carries carbon monoxide', state: {co: 1, pink: 0.2}, faces: {cell: {mood: 'angry', mouth: 'frown', look: [0.9, -0.4]}}},
      {label: 'Fewer riders', note: 'co 0.5', state: {co: 0.5, pink: 0.5}, faces: {cell: {mood: 'squint', mouth: 'flat', look: [0.9, -0.3]}}},
      {label: '8 hours later', note: 'co 0, pinker', state: {co: 0, pink: 0.8}, faces: {cell: {mood: 'open', mouth: 'smile', look: [0.6, -0.2]}}},
      {label: 'Clean', note: 'pink 1, flow 1', state: {co: 0, pink: 1}, faces: {cell: {mood: 'happy', mouth: 'big'}}, extra: <CoEgg x={760} y={1150} s={2.2} face={{mood: 'sad', mouth: 'frown', look: [-0.8, 0]}} />},
    ],
  },
  tissue: {
    title: 'Tissue: a floor for cells and germs', note: 'A ceiling band, a folded curtain wall, a floor with a lighter edge (characters stand on it, with contact shadows), faint far vessels as the one soft layer. Dials: damage, swelling.',
    states: [
      {label: 'Calm', note: 'damage 0', state: {}},
      {label: 'Damaged', note: 'damage 0.6', state: {damage: 0.6}},
      {label: 'Swollen', note: 'swelling 0.8', state: {swelling: 0.8}},
      {label: 'Both', note: 'damage 1, swelling 1', state: {damage: 1, swelling: 1}},
    ],
  },
  upperBelly: {
    title: 'Upper belly: the stomach in its place', note: 'The stomach with its wall band and a cut window, the liver behind, the food pipe and bile duct from the top, the gut below, the spleen edge. Dials: fill, contents, acid, gas, damage, cut.',
    states: [
      {label: 'Empty', note: 'fill 0.15', state: {fill: 0.15}, faces: {stomach: {mood: 'sad', mouth: 'frown', look: [-0.6, 0.6]}}},
      {label: 'Full', note: 'contents 1, fill 0.45', state: {fill: 0.45, contents: 1}, faces: {stomach: {mood: 'open', mouth: 'smile', look: [-0.3, 0.9]}}},
      {label: 'Acid', note: 'acid 1, fill 0.7', state: {fill: 0.7, contents: 0.5, acid: 1}, faces: {stomach: {mood: 'pain', mouth: 'wavy', look: [0, 0.9]}}},
      {label: 'Gas and sores', note: 'gas 1, damage 1', state: {fill: 0.5, acid: 0.6, gas: 1, damage: 1}, faces: {stomach: {mood: 'squint', mouth: 'o'}}},
    ],
  },
  throatSide: {
    title: 'Throat, side cut', note: 'Tongue (the hero), palate, teeth, epiglottis, windpipe with rings, food pipe behind it, the spine at the back. Dials: stuck, sore, swallow.',
    states: [
      {label: 'Rest', note: 'all 0', state: {}, faces: {tongue: {mood: 'open', mouth: 'smile', look: [-0.8, 0.2]}}},
      {label: 'Swallow', note: 'swallow 1: tongue up, flap shut', state: {swallow: 1}, faces: {tongue: {mood: 'squint', mouth: 'flat'}}},
      {label: 'Stuck pill', note: 'stuck 1', state: {stuck: 1}, faces: {tongue: {mood: 'shock', mouth: 'o', look: [-0.9, 0.6]}}},
      {label: 'Sore', note: 'sore 1', state: {sore: 1}, faces: {tongue: {mood: 'pain', mouth: 'wavy', look: [-0.9, 0.3]}}},
    ],
  },
  skullSide: {
    title: 'Brain in its skull, side cut', note: 'The skull shell with its marrow, the meninges, the skull floor the brain rests on, the cerebellum, the stem going down inside (no brain on a stick). Dials: fog, glow, sleep.',
    states: [
      {label: 'Rest', note: 'all 0', state: {}, faces: {brain: {mood: 'open', mouth: 'smile', look: [0.7, 0]}}},
      {label: 'Fog', note: 'fog 1', state: {fog: 1}, faces: {brain: {mood: 'bored', mouth: 'wavy'}}},
      {label: 'Bright', note: 'glow 1 (flat, no glow)', state: {glow: 1}, faces: {brain: {mood: 'happy', mouth: 'big'}}},
      {label: 'Sleep', note: 'sleep 1', state: {sleep: 1}, faces: {brain: {mood: 'sleepy', mouth: 'flat'}}},
    ],
  },
  skinSection: {
    title: 'Skin in section', note: 'Surface, dermis with folds, fat lobules, muscle, a vessel: for bites and stings. Dials: wound, swelling.',
    states: [
      {label: 'Whole', note: 'all 0', state: {}},
      {label: 'Bite', note: 'wound 0.5', state: {wound: 0.5}},
      {label: 'Open', note: 'wound 1', state: {wound: 1}},
      {label: 'Swollen', note: 'wound 1, swelling 1', state: {wound: 1, swelling: 1}},
    ],
  },
};

const K = 0.42;
const Mini: React.FC<{name: StageName; st: State; x: number; y: number; t?: number}> = ({name, st, x, y, t = 2}) => {
  const S = STAGES[name].Stage;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 1080 * K, height: 1920 * K, overflow: 'hidden', borderRadius: 10, boxShadow: `0 0 0 3px ${INK}`}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${K})`, transformOrigin: '0 0'}}>
        <S t={t} state={st.state} faces={st.faces} layer={st.extra} />
      </div>
    </div>
  );
};
const colourLine = (name: StageName) => {
  const c = (COLOUR as Record<string, {warm: number; other: number; flat: number}>)[name];
  return c ? `Colour check on the full still: warm ${c.warm}% (pass 60%+), other family ${c.other}% (pass 8% or less), largest flat non-tissue field ${c.flat}% (pass 12% or less)` : 'Colour check: not measured yet';
};
const StageBoard: React.FC<{name: StageName}> = ({name}) => {
  const b = BOARD[name];
  const def = STAGES[name];
  return (
    <Board kicker={`Engine v9 · anatomy stage · ${name}`} title={b.title} note={b.note}>
      {b.states.map((st, i) => (
        <React.Fragment key={i}>
          <Mini name={name} st={st} x={44 + i * 462} y={158} />
          <div style={{position: 'absolute', left: 44 + i * 462, top: 158 + 1920 * K + 8, width: 1080 * K, fontFamily: FONT}}>
            <div style={{fontSize: 20, fontWeight: 900, color: INK}}>{i + 1}. {st.label}</div>
            <div style={{fontSize: 14, fontWeight: 600, color: '#7a6a62'}}>{st.note}</div>
          </div>
        </React.Fragment>
      ))}
      <div style={{position: 'absolute', left: 1890, top: 160, width: 0}} />
      <div style={{position: 'absolute', right: 56, top: 92, fontFamily: FONT, fontSize: 14, fontWeight: 700, color: CLOTH.teal, textAlign: 'right', width: 700}}>
        neighbours: {def.neighbours.join(', ')} · dials: {Object.keys(def.dials).join(', ')}
      </div>
      <div style={{position: 'absolute', left: 40, top: 1052, fontFamily: FONT, fontSize: 13, fontWeight: 700, color: '#8a7a72'}}>{colourLine(name)}</div>
    </Board>
  );
};

const FULL: Record<StageName, number> = {chest: 0, vesselInside: 0, tissue: 1, upperBelly: 1, throatSide: 0, skullSide: 0, skinSection: 1};
const Full: React.FC<{name: StageName}> = ({name}) => {
  const st = BOARD[name].states[FULL[name]];
  const S = STAGES[name].Stage;
  return <S t={2} state={st.state} faces={st.faces} layer={st.extra} />;
};
const mk = (n: StageName) => { const C: React.FC = () => <StageBoard name={n} />; const F: React.FC = () => <Full name={n} />; return [C, F] as const; };
const [BChest, FChest] = mk('chest'), [BVessel, FVessel] = mk('vesselInside'), [BTissue, FTissue] = mk('tissue'), [BBelly, FBelly] = mk('upperBelly');
const [BThroat, FThroat] = mk('throatSide'), [BSkull, FSkull] = mk('skullSide'), [BSkin, FSkin] = mk('skinSection');

registerRoot(() => (
  <>
    {([['Chest', BChest, FChest], ['Vessel', BVessel, FVessel], ['Tissue', BTissue, FTissue], ['Belly', BBelly, FBelly], ['Throat', BThroat, FThroat], ['Skull', BSkull, FSkull], ['Skin', BSkin, FSkin]] as const).map(([n, B, Fu]) => (
      <React.Fragment key={n}>
        <Still id={`AnatBoard${n}`} component={B} width={1920} height={1080} />
        <Still id={`AnatFull${n}`} component={Fu} width={1080} height={1920} />
      </React.Fragment>
    ))}
    <Still id="AnatFullRoom" component={PaleRoomFull} width={1080} height={1920} />
  </>
));
