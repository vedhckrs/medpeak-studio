/**
 * Engine v9 (format 6) sample sheets for the owner (decisions 10, 11, 14, 15, 25-27; blueprint Part 7 phases 2, 3, 6).
 * Every sheet shows the OLD look (left / top, exactly as the videos already out) beside the NEW one (inside <V9>), so the
 * change is judged side by side. Rendered by `node pipeline/toon-v8-sheets.mjs v9-` into out/toons/sheets-v8/.
 */
import React from 'react';
import {
  Acting, Board, BG, Caption, CLOTH, EDGE, Eyes, Fig, FLESH, INK, InkZoom, Mouth, Panel, Shape, shade, TinyArm, V9, type Mood,
} from './kit';
import {CAST, castById, HAND_KINDS_V9, HandAt, HeadAt, PersonAt, EXPRS_V9, type HandKind, type Expr} from './people-rig';
import {ORGANS_A} from './organs-a';
import {ORGANS_B} from './organs-b';
import {CELLS} from './cells';
import {GERMS} from './germs';

const FONT = "'Poppins', sans-serif";
const Tag: React.FC<{x: number; y: number; text: string; color?: string; size?: number}> = ({x, y, text, color = CLOTH.teal, size = 18}) => (
  <div style={{position: 'absolute', left: x, top: y, fontFamily: FONT, fontSize: size, fontWeight: 900, letterSpacing: 1.2, color}}>{text.toUpperCase()}</div>
);

// ------------------------------------------------------------------ close-ups: eyes in every mood, turn, blink
const MOODS: Mood[] = ['open', 'happy', 'sad', 'angry', 'sleepy', 'bored', 'scared', 'closed', 'wink', 'dizzy', 'pain', 'side', 'squint', 'shock'];
/** One pair of eyes on a skin-coloured patch (so the lid shows the face behind it). */
const EyePatch: React.FC<{x: number; y: number; size: number; mood?: Mood; look?: [number, number]; lid?: number; turn?: number; v9: boolean; fill?: string}> = ({x, y, size, mood = 'open', look, lid, turn, v9, fill = FLESH.salmon}) => (
  <V9 on={v9}>
    <Fig x={x} y={y} size={size}>
      <Shape d="M -80 -62 Q 0 -86 80 -62 Q 96 0 80 62 Q 0 86 -80 62 Q -96 0 -80 -62 Z" fill={fill} shadow={0} line="none" />
      <Acting lid={lid} turn={turn}><Eyes x={0} y={-4} r={30} mood={mood} look={look} /></Acting>
      <Mouth x={0} y={52} w={24} kind={mood === 'happy' ? 'smile' : mood === 'angry' ? 'grit' : mood === 'scared' || mood === 'shock' ? 'o' : 'flat'} />
    </Fig>
  </V9>
);
export const V9EyesSheet: React.FC = () => (
  <Board kicker="Engine v9 · decision 10 · close-ups 1" title="Organ eyes: every mood, old and new" note="Top: the eye in the videos already out (round, pupil in the middle half). Below: the v9 eye: upright ovals, the pupil reaches the rim, lids for pain, side-eye, squint and shock. Same eye for the whole cast.">
    <Panel x={40} y={160} w={1840} h={250} label="Now (look v8): round, pupils stay in the middle" />
    {MOODS.map((m, i) => <React.Fragment key={m}><EyePatch v9={false} x={110 + i * 131} y={290} size={150} mood={m} look={[0.9, 0.2]} /><Caption x={110 + i * 131} y={366} name={m} size={16} w={130} /></React.Fragment>)}
    <Panel x={40} y={420} w={1840} h={250} label="v9: ovals, pupils to the rim (all looking right), new lid moods" />
    {MOODS.map((m, i) => <React.Fragment key={m}><EyePatch v9 x={110 + i * 131} y={550} size={150} mood={m} look={[0.9, 0.2]} /><Caption x={110 + i * 131} y={626} name={m} size={16} w={130} /></React.Fragment>)}
    <Panel x={40} y={680} w={900} h={370} label="v9 turn: a three-quarter face, never a mirror" />
    {[-0.7, -0.35, 0, 0.35, 0.7].map((tn, i) => <React.Fragment key={tn}><EyePatch v9 x={130 + i * 170} y={850} size={180} turn={tn} look={[tn * 1.1, 0.1]} /><Caption x={130 + i * 170} y={950} name={`turn ${tn}`} note={tn === 0 ? 'straight' : tn > 0 ? 'face turns right' : 'face turns left'} size={16} w={160} /></React.Fragment>)}
    <Panel x={960} y={680} w={920} h={370} label="v9 blink: 0.2 s, open - half - shut - half - open" />
    {[0, 0.35, 0.7, 1, 0.5, 0].map((l, i) => <React.Fragment key={i}><EyePatch v9 x={1040 + i * 150} y={850} size={170} lid={l} look={[-0.6, 0.3]} /><Caption x={1040 + i * 150} y={950} name={`${Math.round(i * 40)} ms`} note={`lid ${l}`} size={16} w={140} /></React.Fragment>)}
  </Board>
);

// ------------------------------------------------------------------ close-ups: hands at rest, arm joins, the line at zoom
const ArmDemo: React.FC<{x: number; y: number; size: number; v9: boolean; hand: 'mitten' | 'fist' | 'open' | 'grip'}> = ({x, y, size, v9, hand}) => (
  <V9 on={v9}>
    <Fig x={x} y={y} size={size}>
      <Shape d="M -70 -50 Q -10 -80 40 -54 Q 66 -10 50 40 Q 0 76 -54 54 Q -86 0 -70 -50 Z" fill={FLESH.salmon} />
      <TinyArm from={[48, -6]} bend={[78, 4]} to={[82, -34]} fill={FLESH.salmon} hand={hand} rod={hand === 'grip' ? {len: 26, color: '#9aa3ad'} : undefined} />
      <Eyes x={-12} y={-18} r={13} look={[0.9, -0.3]} />
    </Fig>
  </V9>
);
const ZoomBox: React.FC<{x: number; y: number; z: number; fix: boolean}> = ({x, y, z, fix}) => {
  // a 300 x 300 window onto a stomach drawn at 240 px, pushed in z times by a CSS scale like the camera
  const inner = (
    <div style={{position: 'absolute', left: 0, top: 0, width: 300, height: 300, transformOrigin: '150px 150px', transform: `scale(${z})`}}>
      <Fig x={150} y={150} size={240}><StomachLike /></Fig>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 300, height: 300, overflow: 'hidden', background: '#fff', border: '2px solid #ece3d6', borderRadius: 12}}>
      {fix ? <InkZoom z={z} style={{width: 300, height: 300}}>{inner}</InkZoom> : inner}
    </div>
  );
};
const StomachLike: React.FC = () => {
  const S = ORGANS_A.stomach;
  return <V9><S mood="open" mouth="smile" look={[0.6, 0]} /></V9>;
};
export const V9HandsSheet: React.FC = () => {
  const doc = castById('doctor');
  const kinds: HandKind[] = ['relaxed', 'rest', 'knee', 'open', 'hold'];
  return (
    <Board kicker="Engine v9 · close-ups 2" title="Hands at rest, arm joins, and the line under the zoom" note="People: the resting hand closes, fingers together with a soft curl (the spread hand is only a gesture now); a new knee hand. Organs: the arm is one outlined shape with the SAME line as the body, growing out of it.">
      <Panel x={40} y={160} w={900} h={430} label="People hands: now (top) and v9 (below)" />
      {kinds.map((k, i) => <React.Fragment key={k}>
        <V9 on={false}><HandAt x={110 + i * 170} y={280} px={92} kind={k} skin={doc.skin} rot={k === 'relaxed' || k === 'rest' ? 90 : k === 'knee' ? 20 : -80} /></V9>
        <V9><HandAt x={110 + i * 170} y={450} px={92} kind={k} skin={doc.skin} rot={k === 'relaxed' || k === 'rest' ? 90 : k === 'knee' ? 20 : -80} /></V9>
        <Caption x={110 + i * 170} y={540} name={k === 'knee' ? 'knee (new)' : k} size={17} w={160} />
      </React.Fragment>)}
      <Panel x={960} y={160} w={920} h={430} label="Organ arms: now (top) and v9 (below)" />
      {(['mitten', 'fist', 'open', 'grip'] as const).map((h, i) => <React.Fragment key={h}>
        <ArmDemo v9={false} x={1060 + i * 215} y={280} size={190} hand={h === 'grip' ? 'fist' : h} />
        <ArmDemo v9 x={1060 + i * 215} y={450} size={190} hand={h} />
        <Caption x={1060 + i * 215} y={540} name={h === 'grip' ? 'grip (new)' : h} size={17} w={200} />
      </React.Fragment>)}
      <Panel x={40} y={600} w={1840} h={450} label="The line under the camera's zoom: the same stomach pushed in 2x" />
      <ZoomBox x={90} y={660} z={1} fix={false} /><Caption x={240} y={970} name="zoom 1" note="5.6 px line" size={18} />
      <ZoomBox x={430} y={660} z={2} fix={false} /><Caption x={580} y={970} name="zoom 2, now" note="the line doubles to 11 px" size={18} />
      <ZoomBox x={770} y={660} z={2} fix /><Caption x={920} y={970} name="zoom 2, v9" note="InkZoom: the line stays 5.6 px" size={18} />
      <div style={{position: 'absolute', left: 1130, top: 680, width: 700, fontFamily: FONT, fontSize: 22, fontWeight: 600, color: '#5d4e48', lineHeight: 1.45}}>
        The camera pushes in with a CSS zoom, and the outline used to grow with it (fasting at 11 s: 9-12 px). In v9 the camera
        tells the kit its zoom, and every kit line is divided by it, so the line on screen is the same 5.6 px in every shot.
        Videos already out are not touched: only a format-6 video turns this on.
      </div>
    </Board>
  );
};

// ------------------------------------------------------------------ the cast before / after
type FC = React.FC<{mood?: Mood; mouth?: never; look?: [number, number]}>;
const castRow = (list: Record<string, React.FC<any>>, names: string[]) => names.map((n) => [n, list[n]] as const).filter(([, C]) => !!C);
const CastBA: React.FC<{title: string; kicker: string; items: (readonly [string, React.FC<any>])[]; size?: number}> = ({title, kicker, items, size = 250}) => {
  const per = Math.min(10, items.length);
  const step = 1800 / per;
  const sz = Math.min(size, step * 0.92);
  return (
    <Board kicker={kicker} title={title} note="Top row: as in the videos already out. Bottom row: the same character in v9 (oval eyes with rim pupils, the body's own line on arms and legs, outlined hands, no teeth-grid mouth). Drawings, colours and sizes are unchanged.">
      <Panel x={40} y={160} w={1840} h={430} label="Now (look v8)" />
      <Panel x={40} y={600} w={1840} h={450} label="v9" />
      {items.slice(0, per).map(([n, C], i) => {
        const x = 60 + step * (i + 0.5);
        return (
          <React.Fragment key={n}>
            <V9 on={false}><Fig x={x} y={380} size={sz}><C /></Fig></V9>
            <V9><Fig x={x} y={820} size={sz}><C /></Fig></V9>
            <Caption x={x} y={1000} name={n.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase())} size={18} w={step} />
          </React.Fragment>
        );
      })}
    </Board>
  );
};
const ka = Object.keys(ORGANS_A), kb = Object.keys(ORGANS_B), kc = Object.keys(CELLS), kg = Object.keys(GERMS);
export const V9CastOrgansA: React.FC = () => <CastBA kicker="Engine v9 · cast before / after 1" title="Organs, set A" items={castRow(ORGANS_A, ka.slice(0, 7))} />;
export const V9CastOrgansA2: React.FC = () => <CastBA kicker="Engine v9 · cast before / after 2" title="Organs, set A (continued)" items={castRow(ORGANS_A, ka.slice(7))} />;
export const V9CastOrgansB: React.FC = () => <CastBA kicker="Engine v9 · cast before / after 3" title="Organs, set B" items={castRow(ORGANS_B, kb.slice(0, 7))} />;
export const V9CastOrgansB2: React.FC = () => <CastBA kicker="Engine v9 · cast before / after 4" title="Organs, set B (continued)" items={castRow(ORGANS_B, kb.slice(7))} />;
export const V9CastCells: React.FC = () => <CastBA kicker="Engine v9 · cast before / after 5" title="Cells and chemicals" items={castRow(CELLS, kc.slice(0, 8))} />;
export const V9CastCells2: React.FC = () => <CastBA kicker="Engine v9 · cast before / after 6" title="Cells and chemicals (continued)" items={castRow(CELLS, kc.slice(8))} />;
export const V9CastGerms: React.FC = () => <CastBA kicker="Engine v9 · cast before / after 7" title="Germs, medicines, intruders" items={castRow(GERMS, kg.slice(0, 8))} />;
export const V9CastGerms2: React.FC = () => <CastBA kicker="Engine v9 · cast before / after 8" title="Germs, medicines, intruders (continued)" items={castRow(GERMS, kg.slice(8))} />;

export const V9CastPeople: React.FC = () => {
  const ground1 = 572, ground2 = 1012, sc = 0.9;
  const xs = CAST.map((_, i) => 60 + 113 + i * 226);
  return (
    <Board kicker="Engine v9 · cast before / after 9" title="The 8 people: resting hands, eyes, and who they look at" note="Top: now (spread resting hands, eyes straight at us). Below: v9: fingers together at rest, oval eyes, each one looking at a neighbour.">
      <Panel x={40} y={150} w={1840} h={440} label="Now (look v8)" />
      <Panel x={40} y={600} w={1840} h={450} label="v9: hands closed at rest, looking at a neighbour" />
      {CAST.map((s, i) => {
        const nb = xs[i % 2 === 0 ? Math.min(CAST.length - 1, i + 1) : i - 1];
        return (
          <React.Fragment key={s.id}>
            <V9 on={false}><PersonAt spec={s} x={xs[i]} y={ground1} scale={sc} /></V9>
            <V9><PersonAt spec={s} x={xs[i]} y={ground2} scale={sc} view="three-quarter" facing={nb > xs[i] ? 'right' : 'left'} lookAt={[nb, ground2 - 300]} /></V9>
            <Caption x={xs[i]} y={ground2 + 6} name={s.name} size={18} w={210} />
          </React.Fragment>
        );
      })}
    </Board>
  );
};

// ------------------------------------------------------------------ people faces: lid acting and marks
export const V9PeopleFaces: React.FC = () => {
  const sam = castById('patient');
  const ex: Expr[] = EXPRS_V9;
  return (
    <Board kicker="Engine v9 · close-ups 3" title="People: lid acting and the symptom on the body" note="The rig shares the kit eye, so people get the same lids: pain, side-eye, squint (new) next to the old seven. The patient shows the symptom on his body (decision 14): drawn in the kit line, no blood, visible in every patient shot after it happens.">
      <Panel x={40} y={160} w={1840} h={330} label="Sam's expressions in v9 (the last three are new)" />
      {ex.map((e, i) => <React.Fragment key={e}><V9><HeadAt spec={sam} x={130 + i * 180} y={330} px={62} expr={e} view={i % 2 ? 'three-quarter' : 'front'} /></V9><Caption x={130 + i * 180} y={448} name={e} size={17} w={170} /></React.Fragment>)}
      <Panel x={40} y={500} w={1840} h={550} label="Symptom marks: fang bite on the ankle (trouser rolls up), red cheek, a sore, a bandage" />
      <V9><PersonAt spec={sam} x={250} y={1000} scale={1.05} view="three-quarter" mark={[{kind: 'fang', at: 'ankleR'}]} expr="pain" /></V9>
      <Caption x={250} y={1005} name="fang, right ankle" size={16} w={240} />
      <V9><PersonAt spec={castById('kid')} x={590} y={1000} scale={1.5} mark={[{kind: 'redCheek', at: 'cheekL'}, {kind: 'redCheek', at: 'cheekR'}]} expr="worried" /></V9>
      <Caption x={590} y={1005} name="red cheeks" size={16} w={240} />
      <V9><PersonAt spec={castById('mom')} x={930} y={1000} scale={1.05} pose="showArm" view="three-quarter" mark={[{kind: 'sore', at: 'forearmL'}]} /></V9>
      <Caption x={930} y={1005} name="a sore, left forearm" size={16} w={240} />
      <V9><PersonAt spec={castById('grandpa')} x={1270} y={1000} scale={1.05} view="three-quarter" mark={[{kind: 'bandage', at: 'handR'}, {kind: 'bandage', at: 'cheekR'}]} /></V9>
      <Caption x={1270} y={1005} name="bandage: hand, cheek plaster" size={16} w={260} />
      <V9><HeadAt spec={sam} x={1640} y={720} px={120} expr="pain" view="three-quarter" mark={[{kind: 'redCheek', at: 'cheekR'}]} /></V9>
      <Caption x={1640} y={930} name="close: pain + red cheek" size={16} w={260} />
    </Board>
  );
};

// ------------------------------------------------------------------ Dad's stubble A / B (decision 15)
export const V9Stubble: React.FC = () => {
  const dad = castById('dad');
  const noStub = {...dad, extras: {...dad.extras, stubble: 'none' as const}};
  return (
    <Board kicker="Engine v9 · decision 15" title="Dad's stubble: now, option A (none), option B (soft jaw band)" note="Now: one flat band from cheek to cheek, which read as a mask or a second chin on the quit-sugar cover. A: no stubble (men told apart by hair and clothes, like the references). B: a soft band that follows the jaw, at most 5% darker, its inner edge broken into short dashes, never on the upper lip.">
      {[['Now (look v8)', dad, false], ['A: no stubble', noStub, true], ['B: soft jaw band', dad, true]].map(([label, spec, v9], i) => (
        <React.Fragment key={i}>
          <Panel x={40 + i * 620} y={160} w={600} h={890} label={label as string} />
          <V9 on={v9 as boolean}>
            <HeadAt spec={spec as typeof dad} x={190 + i * 620} y={420} px={96} expr="neutral" />
            <HeadAt spec={spec as typeof dad} x={480 + i * 620} y={420} px={96} expr="talking" view="three-quarter" />
            <PersonAt spec={spec as typeof dad} x={340 + i * 620} y={1030} scale={1.0} view="three-quarter" />
          </V9>
        </React.Fragment>
      ))}
    </Board>
  );
};
void BG; void INK; void EDGE; void shade; void HAND_KINDS_V9;
export type {FC};
