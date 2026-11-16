// MedPeak Toons boards and demos (v5):
//   ToonCast       every character on one page
//   ToonSheet      the model sheet for ONE character (hero, colours, expressions, poses, hands)
//   ToonBlueprint  the house rules every new character follows
//   ToonEmotions   one character in all 9 emotions
//   ToonSets       all sets
//   ToonCamera     the shot sizes and lenses, on one page
//   ToonScenes     18 s of staged shots        ToonActing   12 s acted scene with cuts
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../brand/theme';
import type {Act, Blueprint, CharProps} from './blueprint';
import {BLUEPRINTS, CAST, type CastName} from './characters';
import {headY, PEOPLE, SPECS, type PersonName, makeHuman} from './humans';
import {circlePath, Grain, lineOf, Part, tone} from './ink';
import {clamp01, E, key, settle, speak} from './motion';
import {POSES, type PoseName} from './poses';
import {FoodPipeStage, ToothStage, TummyStage, type SetProps, type StageFace} from './stages';
import {peopleBoxes, ShotStill, type ToonActor} from './Player';
import {LENSES, type LensName, type MoveName, SHOTS, type ShotName} from './camera';
import {type ArmSpec, blinkAt, EMOTIONS, type Emotion, Face, Hand, HAND_POSES, type HandPose} from './rig';
import {BloodSet, DEFAULT_ROOMS, FORES, GutSet, MouthSet, OfficeSet, SETS, StomachSet, ThroatSet, WordCaption, type SetName} from './scenes';
import {Room, RoomFore, ROOM_FLOOR} from './rooms';
import {Prop} from './props';
import {roomTone, type RoomLook} from './director';
import {Camera, Hold, Slot, Stand} from './stage';
import {STYLE} from './style';

const ALL: Record<string, React.FC<CharProps>> = {...CAST, ...PEOPLE};
const INK = STYLE.ink;
const PAPER = 'linear-gradient(#fbf7f0, #f6efe4)';
export const ORDER: string[] = ['stomach', 'intestine', 'liver', 'kidney', 'bladder', 'lungs', 'heart', 'brain', 'tooth', 'bone', 'pill', 'poop', 'redcell', 'whitecell', 'platelet', 'egg', 'sperm', 'virus', 'bacteria', 'doctor', 'patient', 'mom', 'kid', 'grandpa', 'baby'];
const groundOf = (n: string) => (n in BLUEPRINTS ? BLUEPRINTS[n as CastName].ground.y : 96);
const T: React.FC<{x: number; y: number; w?: number; size?: number; weight?: number; color?: string; align?: 'left' | 'center' | 'right'; spacing?: number; children: React.ReactNode}> = ({x, y, w = 400, size = 24, weight = 700, color = INK, align = 'left', spacing = 0, children}) => (
  <div style={{position: 'absolute', left: align === 'center' ? x - w / 2 : align === 'right' ? x - w : x, top: y, width: w, textAlign: align, fontFamily: theme.font, fontSize: size, fontWeight: weight, color, letterSpacing: spacing, lineHeight: 1.25}}>{children}</div>
);
const Chip: React.FC<{x: number; y: number; color: string; label: string; w?: number}> = ({x, y, color, label, w = 150}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, fontFamily: theme.font}}>
    <div style={{width: 64, height: 40, borderRadius: 10, background: color, border: `2.5px solid ${lineOf(color)}`}} />
    <div style={{fontSize: 17, fontWeight: 800, color: INK, marginTop: 6}}>{label}</div>
    <div style={{fontSize: 15, fontWeight: 600, color: '#8a8498'}}>{color.toUpperCase()}</div>
  </div>
);

/** Every character, 5 across. */
export const CastBoard: React.FC = () => {
  const poses: PoseName[] = ['rest', 'wave', 'explain', 'fists', 'thumb', 'point', 'hips', 'present'];
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <T x={540} y={46} w={1000} size={56} weight={900} align="center">MedPeak Toons · cast of {ORDER.length}</T>
      <T x={540} y={118} w={1000} size={24} weight={600} color="#8a8498" align="center">organs · medicine · cells · germs · people</T>
      {ORDER.map((n, i) => {
        const C = ALL[n];
        const x = 118 + (i % 5) * 211;
        const y = 330 + Math.floor(i / 5) * 320;
        const e = EMOTIONS[(i * 2) % EMOTIONS.length];
        return (
          <React.Fragment key={n}>
            <Slot x={x} y={n in SPECS ? y - 6 : y} size={n in SPECS ? 232 : 196}><C emotion={e} arms={POSES[poses[i % poses.length]][n in SPECS ? 'person' : 'body']} t={0.6} look={{x: i % 2 ? -0.5 : 0.5, y: 0}} talk={e === 'happy' ? 0.6 : 0} act={n in SPECS ? {shift: i % 2 ? 0.7 : -0.7, tilt: i % 2 ? 3 : -3} : undefined} /></Slot>
            <T x={x} y={y + 112} w={210} size={23} weight={800} align="center">{n}</T>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/** One character in all 9 emotions. */
export const EmotionBoard: React.FC<{who?: string}> = ({who = 'stomach'}) => {
  const C = ALL[who];
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <T x={540} y={60} w={1000} size={60} weight={900} align="center">{who}: 9 emotions</T>
      {EMOTIONS.map((e, i) => {
        const x = 200 + (i % 3) * 340;
        const y = 440 + Math.floor(i / 3) * 520;
        return (
          <React.Fragment key={e}>
            <Slot x={x} y={y} size={300}><C emotion={e} talk={e === 'happy' ? 0.7 : 0} /></Slot>
            <T x={x} y={y + 176} w={300} size={36} weight={800} align="center">{e}</T>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/** All sets in a grid. */
export const SetBoard: React.FC<{t?: number}> = ({t = 1.2}) => (
  <AbsoluteFill style={{background: '#fff'}}>
    {(Object.keys(SETS) as SetName[]).map((n, i) => {
      const S = SETS[n];
      const F = FORES[n];
      return (
        <div key={n} style={{position: 'absolute', left: (i % 3) * 360, top: Math.floor(i / 3) * 640, width: 1080, height: 1920, transform: 'scale(0.3333)', transformOrigin: 'top left', overflow: 'hidden', outline: '12px solid #fff'}}>
          <S t={t} />
          {F && <F t={t} />}
        </div>
      );
    })}
  </AbsoluteFill>
);

const HandChip: React.FC<{x: number; y: number; pose: HandPose; color: string; size?: number}> = ({x, y, pose, color, size = 120}) => (
  <>
    <Slot x={x} y={y} size={size}><g transform="translate(-50 14)"><Hand pose={pose} fill={color} s={5.4} /></g></Slot>
    <T x={x} y={y + size * 0.42} w={160} size={18} weight={800} align="center">{pose}</T>
  </>
);

/** MODEL SHEET: one page that defines one character (1920x1080). */
export const ModelSheet: React.FC<{who?: string}> = ({who = 'stomach'}) => {
  const C = ALL[who];
  const bp: Blueprint | undefined = who in BLUEPRINTS ? BLUEPRINTS[who as CastName] : undefined;
  const sp = who in SPECS ? SPECS[who] : undefined;
  const main = bp ? bp.color : sp!.skin;
  const fit = sp ? Math.max(0.6, (96 - headY(sp) + 30 * (sp.head ?? 1) * (sp.height ?? 1)) / 190) : 1; // small people are drawn bigger so they fill the sheet
  const chips: {label: string; color: string}[] = bp
    ? [{label: 'body', color: bp.color}, {label: 'outline', color: lineOf(bp.color)}, {label: 'shadow', color: tone(bp.color, STYLE.shadow)}, ...(bp.accents ?? [])]
    : [{label: 'skin', color: sp!.skin}, {label: 'hair', color: sp!.hair.color}, {label: 'top', color: sp!.top.color}, ...(sp!.top.under ? [{label: 'under', color: sp!.top.under}] : []), {label: 'bottom', color: sp!.bottom.color}, {label: 'shoes', color: sp!.shoes}];
  const kind = sp ? 'person' : 'body';
  const poses: {label: string; emotion: Emotion; arms: [ArmSpec, ArmSpec]; talk?: number; act?: Act}[] = [
    {label: 'wave', emotion: 'happy', arms: POSES.wave[kind], talk: 0.6, act: {tilt: 5, shift: 0.6}},
    {label: 'point', emotion: 'angry', arms: POSES.point[kind], talk: 0.5, act: {lean: 5, turn: 0.5}},
    {label: sp ? 'hands on hips' : 'thumbs up', emotion: 'smug', arms: sp ? POSES.hips[kind] : POSES.thumb[kind], act: {shift: -0.8, tilt: -4}},
    {label: 'panic', emotion: 'scared', arms: POSES.panic[kind], talk: 0.8, act: {lean: -4, bob: 3}},
  ];
  const rules = bp
    ? [`Family: ${bp.family}`, `Face: size ${bp.face.size} at (${bp.face.x}, ${bp.face.y})`, bp.legs ? 'Legs: yes (a traveller)' : 'Legs: none (stays in place)', bp.arms ? 'Arms: thin, in the body colour, clean hands' : 'Arms: none', `Stands on y = ${bp.ground.y}`]
    : ['Family: person', `Height: ${sp!.height === undefined || sp!.height >= 0.9 ? '3.6 heads (adult)' : (sp!.legs ?? 1) > 0.6 ? '2.9 heads (kid)' : '2.2 heads (toddler)'}`, `Hair: ${sp!.hair.style}`, `Top: ${sp!.top.kind} · Bottom: ${sp!.bottom.kind}`, 'Hands: palm, four fingers and a thumb in the skin colour'];
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 12, background: STYLE.label}} />
      <T x={70} y={44} w={900} size={24} weight={800} color={STYLE.label} spacing={5}>MEDPEAK TOONS · MODEL SHEET</T>
      <T x={70} y={74} w={900} size={78} weight={900}>{who.charAt(0).toUpperCase() + who.slice(1)}</T>
      <T x={72} y={176} w={640} size={24} weight={600} color="#6f6880">{bp ? bp.role : sp!.role}</T>

      <div style={{position: 'absolute', left: 60, top: 300, width: 620, height: 520, borderRadius: 28, background: '#ffffff', border: '2px solid #ece4d6'}} />
      <Stand x={370} floor={770} size={470 / fit} ground={groundOf(who)}><C emotion="neutral" t={0.6} /></Stand>
      {chips.slice(0, 6).map((c, i) => <Chip key={c.label} x={70 + i * 104} y={850} w={100} color={c.color} label={c.label} />)}
      {rules.map((r, i) => <T key={r} x={70} y={952 + i * 24} w={640} size={18} weight={600} color="#6f6880">• {r}</T>)}

      <T x={740} y={266} size={22} weight={800} color={STYLE.label} spacing={4}>EXPRESSIONS</T>
      {EMOTIONS.map((e, i) => {
        const x = 830 + (i % 3) * 200;
        const y = 420 + Math.floor(i / 3) * 250;
        return (
          <React.Fragment key={e}>
            {sp ? (
              <div style={{position: 'absolute', left: x - 92, top: y - 96, width: 184, height: 192, overflow: 'hidden', borderRadius: 24, background: '#ffffff', border: '2px solid #ece4d6'}}>
                <Slot x={92} y={104 - (headY(sp) / 200) * 620} size={620}><C emotion={e} talk={e === 'happy' ? 0.7 : 0} t={0.6} /></Slot>
              </div>
            ) : (
              <Slot x={x} y={y} size={184}><C emotion={e} talk={e === 'happy' ? 0.7 : 0} arms={null} t={0.6} /></Slot>
            )}
            <T x={x} y={y + 100} w={190} size={19} weight={800} align="center">{e}</T>
          </React.Fragment>
        );
      })}

      <T x={1370} y={266} size={22} weight={800} color={STYLE.label} spacing={4}>POSES</T>
      {poses.map((p, i) => {
        const x = 1500 + (i % 2) * 260;
        const y = 420 + Math.floor(i / 2) * 270;
        return (
          <React.Fragment key={p.label}>
            <Stand x={x} floor={y + 104} size={220 / fit} ground={groundOf(who)}><C emotion={p.emotion} arms={p.arms} talk={p.talk ?? 0} t={0.6} look={{x: 0.4, y: 0}} act={p.act} /></Stand>
            <T x={x} y={y + 118} w={240} size={19} weight={800} align="center">{p.label}</T>
          </React.Fragment>
        );
      })}
      <T x={1370} y={860} size={22} weight={800} color={STYLE.label} spacing={4}>HANDS</T>
      {HAND_POSES.map((h, i) => <HandChip key={h} x={1420 + i * 104} y={960} pose={h} color={bp ? bp.arms?.color ?? bp.color : sp!.skin} size={104} />)}
      <T x={1850} y={50} w={900} size={16} weight={600} color="#a79fb3" align="right">volume paint: soft form, two-step shadow, bounce light, material texture · outline = darker shade of each fill, max {STYLE.maxLinePx} px · light from the top-left · main colour {main.toUpperCase()}</T>
    </AbsoluteFill>
  );
};

/** STAGE BOARD: one stage in six moments of its story (1080x1920). */
type StageCell = {label: string; state: Record<string, number>; faces: Record<string, StageFace>};
const sf = (emotion: Emotion, talk = 0, arms: [ArmSpec, ArmSpec] = [112, 68]): StageFace => ({emotion, talk, blink: 0, look: {x: 0, y: -0.4}, arms, squash: 0, lean: 0, nod: 0});
const STAGE_BOARDS: Record<string, {title: string; C: React.FC<SetProps>; cells: StageCell[]}> = {
  foodpipe: {title: 'the food pipe', C: FoodPipeStage, cells: [
    {label: '1 the pill falls in', state: {drop: 0.72}, faces: {foodpipe: sf('shocked', 0.7, POSES.panic.body), pill: sf('scared', 0.5, POSES.panic.body)}},
    {label: '2 it sticks', state: {drop: 1, stick: 1}, faces: {foodpipe: sf('angry', 0.6, POSES.point.body), pill: sf('scared', 0.6, POSES.panic.body)}},
    {label: '3 it melts', state: {drop: 1, stick: 1, melt: 0.55, sore: 0.25}, faces: {foodpipe: sf('scared', 0.5, POSES.panic.body), pill: sf('sick', 0.5, POSES.shrug.body)}},
    {label: '4 it burns', state: {drop: 1, stick: 1, melt: 0.9, sore: 0.7, pain: 1}, faces: {foodpipe: sf('sad', 0.8, POSES.panic.body), pill: sf('sad', 0.3, POSES.shrug.body)}},
    {label: '5 later: a sore', state: {drop: 1, stick: 1, melt: 1, sore: 1, pain: 0.6}, faces: {foodpipe: sf('sick', 0.4, POSES.shrug.body), pill: sf('sad')}},
    {label: '6 with water', state: {drop: 1, water: 0.44, slide: 0.32}, faces: {foodpipe: sf('happy', 0.6, POSES.cheer.body), pill: sf('happy', 0.7, POSES.cheer.body)}},
  ]},
  tooth: {title: 'the tooth', C: ToothStage, cells: [
    {label: '1 sugar lands', state: {sugar: 0.8}, faces: {tooth: sf('scared', 0.4, POSES.panic.body), bacteria: sf('happy', 0.8, POSES.cheer.body)}},
    {label: '2 the germs feast', state: {sugar: 1, feast: 0.7}, faces: {tooth: sf('scared', 0.3, POSES.panic.body), bacteria: sf('smug', 0.6, POSES.belly.body)}},
    {label: '3 they make acid', state: {sugar: 1, feast: 1, acid: 1, hole: 0.1}, faces: {tooth: sf('shocked', 0.7, POSES.panic.body), bacteria: sf('smug', 0.5, POSES.point.body)}},
    {label: '4 later: a hole', state: {feast: 1, acid: 0.8, hole: 0.75, pain: 1}, faces: {tooth: sf('sad', 0.8, POSES.panic.body), bacteria: sf('happy', 0.6, POSES.cheer.body)}},
    {label: '5 spit fights back', state: {feast: 1, acid: 1, hole: 0.2, saliva: 0.8, mend: 0.5}, faces: {tooth: sf('happy', 0.5, POSES.thumb.body), bacteria: sf('angry', 0.4, POSES.fists.body)}},
    {label: '6 brush + fluoride', state: {feast: 1, brush: 0.56, shield: 1}, faces: {tooth: sf('happy', 0.7, POSES.cheer.body), bacteria: sf('scared', 0.8, POSES.panic.body)}},
  ]},
  tummy: {title: 'the stomach', C: TummyStage, cells: [
    {label: '1 dinner drops in', state: {food: 0.5, full: 0.4}, faces: {stomach: sf('happy', 0.6, POSES.cheer.body), foodpipe: sf('neutral', 0, POSES.rest.body)}},
    {label: '2 too full', state: {food: 1, full: 1}, faces: {stomach: sf('sick', 0.4, POSES.belly.body), foodpipe: sf('scared', 0.5, POSES.panic.body)}},
    {label: '3 he lies down', state: {food: 1, full: 1, tilt: 1}, faces: {stomach: sf('sleepy', 0.2, POSES.rest.body), foodpipe: sf('shocked', 0.7, POSES.panic.body)}},
    {label: '4 the valve gives', state: {food: 1, full: 1, tilt: 1, valve: 1, leak: 0.45}, faces: {stomach: sf('scared', 0.5, POSES.panic.body), foodpipe: sf('scared', 0.8, POSES.panic.body)}},
    {label: '5 acid in the food pipe', state: {food: 1, full: 1, tilt: 1, valve: 1, leak: 1, burn: 1}, faces: {stomach: sf('sad', 0.4, POSES.shrug.body), foodpipe: sf('sad', 0.9, POSES.panic.body)}},
    {label: '6 three hours later', state: {food: 0.3, full: 0.2, tilt: 1}, faces: {stomach: sf('sleepy', 0.2, POSES.rest.body), foodpipe: sf('happy', 0.6, POSES.thumb.body)}},
  ]},
};
export const StageBoard: React.FC<{stage?: string; cell?: number}> = ({stage = 'foodpipe', cell}) => {
  const B = STAGE_BOARDS[stage];
  if (cell !== undefined) return <AbsoluteFill><B.C t={1.3 + cell} state={B.cells[cell].state} faces={B.cells[cell].faces} /></AbsoluteFill>; // one moment, full size
  return (
    <AbsoluteFill style={{background: '#1d1430'}}>
      <T x={540} y={34} w={1040} size={50} weight={900} color="#ffffff" align="center">{`Stage: ${B.title}`}</T>
      <T x={540} y={98} w={1040} size={22} weight={600} color="#b9b2d6" align="center">the organ is the stage; the script changes its state, so the story is shown</T>
      {B.cells.map((c, i) => {
        const x = 30 + (i % 3) * 346;
        const y = 170 + Math.floor(i / 3) * 860;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x, top: y, width: 328, height: 583, overflow: 'hidden', borderRadius: 18, border: '3px solid #3a2f5c'}}>
              <div style={{width: 1080, height: 1920, transform: 'scale(0.3037)', transformOrigin: 'top left', position: 'relative', overflow: 'hidden'}}>
                <B.C t={1.3 + i} state={c.state} faces={c.faces} />
              </div>
            </div>
            <T x={x + 4} y={y + 594} w={330} size={24} weight={900} color="#ffc93c">{c.label}</T>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/** CAP BOARD: the boy with three kinds of headwear, for the owner to choose from (1920x1080). */
const KID_LOOKS: {key: string; label: string; note: string; C: React.FC<CharProps>}[] = [
  {key: 'A', label: 'A  Cap facing forward', note: 'a small cap on his hair, pushed back; the fringe shows', C: makeHuman({...SPECS.kid, hair: {style: 'cap', color: '#22b8a8', under: '#3b2c25'}})},
  {key: 'B', label: 'B  Cap worn backward', note: 'strap in front, fringe and side hair in view', C: makeHuman({...SPECS.kid, hair: {style: 'capback', color: '#22b8a8', under: '#3b2c25'}})},
  {key: 'C', label: 'C  No cap', note: 'short hair, fringe swept in three locks', C: makeHuman({...SPECS.kid, hair: {style: 'messy', color: '#3b2c25'}})},
];
export const CapBoard: React.FC = () => (
  <AbsoluteFill style={{background: PAPER}}>
    <T x={60} y={30} w={1500} size={44} weight={900}>The boy: three choices for his head</T>
    {KID_LOOKS.map((k, i) => {
      const x = 60 + i * 620;
      return (
        <React.Fragment key={k.key}>
          <div style={{position: 'absolute', left: x, top: 110, width: 580, height: 840, borderRadius: 22, background: '#ffffff', border: '2px solid #e6dfd2', overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 580, height: 470, overflow: 'hidden'}}>
              <Slot x={290} y={372} size={1250}><k.C emotion="happy" t={0.6} /></Slot>
            </div>
            <div style={{position: 'absolute', left: 0, top: 470, width: 580, height: 2, background: '#efe7d8'}} />
            <Stand x={150} floor={820} size={330} ground={96}><k.C emotion="neutral" t={0.6} /></Stand>
            <Stand x={300} floor={820} size={330} ground={96}><k.C emotion="shocked" t={0.6} arms={POSES.panic.person} /></Stand>
            <Stand x={450} floor={820} size={330} ground={96}><k.C emotion="sad" t={0.6} arms={POSES.facepalm.person} /></Stand>
          </div>
          <T x={x + 6} y={962} w={580} size={32} weight={900}>{k.label}</T>
          <T x={x + 6} y={1008} w={580} size={22} weight={600} color="#8a8498">{k.note}</T>
        </React.Fragment>
      );
    })}
  </AbsoluteFill>
);

/** DOCTOR BOARD: Dr. Mira as she is now and three lighter, global looks, for the owner to choose from (1920x1080). */
const DOC_LOOKS: {key: string; label: string; note: string; C: React.FC<CharProps>}[] = [
  {key: 'now', label: 'Before', note: 'as in the three live videos', C: makeHuman({...SPECS.doctor, skin: '#c58a63', eye: '#5a3a22', hair: {style: 'curly', color: '#33221e'}})},
  {key: 'A', label: 'A  Same curls (chosen)', note: 'light skin, her curly dark hair kept', C: makeHuman(SPECS.doctor)},
  {key: 'B', label: 'B  Wavy brown hair', note: 'light skin, shoulder-length chestnut hair, green eyes', C: makeHuman({...SPECS.doctor, skin: '#f8d3b8', eye: '#4f7f55', hair: {style: 'long', color: '#8a5230'}})},
  {key: 'C', label: 'C  Tidy bun', note: 'light skin, honey-blond hair in a bun, blue eyes', C: makeHuman({...SPECS.doctor, skin: '#f8d3b8', eye: '#3f78b0', hair: {style: 'bun', color: '#c08a4a'}})},
];
export const DoctorBoard: React.FC = () => (
  <AbsoluteFill style={{background: PAPER}}>
    <T x={50} y={30} w={1700} size={44} weight={900}>Dr. Mira: a global look, three choices</T>
    {DOC_LOOKS.map((k, i) => {
      const x = 50 + i * 462;
      return (
        <React.Fragment key={k.key}>
          <div style={{position: 'absolute', left: x, top: 110, width: 436, height: 840, borderRadius: 22, background: '#ffffff', border: i ? '2px solid #e6dfd2' : '2px dashed #cfc6b4', overflow: 'hidden'}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 436, height: 440, overflow: 'hidden'}}>
              <Slot x={218} y={452} size={840}><k.C emotion="happy" t={0.6} /></Slot>
            </div>
            <div style={{position: 'absolute', left: 0, top: 440, width: 436, height: 2, background: '#efe7d8'}} />
            <Stand x={112} floor={822} size={360} ground={96}><k.C emotion="neutral" t={0.6} /></Stand>
            <Stand x={286} floor={822} size={360} ground={96}><k.C emotion="happy" t={0.6} arms={POSES.explain.person} /></Stand>
          </div>
          <T x={x + 6} y={962} w={436} size={30} weight={900}>{k.label}</T>
          <T x={x + 6} y={1006} w={440} size={19} weight={600} color="#8a8498">{k.note}</T>
        </React.Fragment>
      );
    })}
  </AbsoluteFill>
);

/** ROOMS BOARD: one video's own clinic and home, with people standing in them (1920x1080). */
export const RoomsBoard: React.FC<{title?: string; clinic?: RoomLook; home?: RoomLook; people?: [string, string]}> = ({title = 'Rooms', clinic = DEFAULT_ROOMS.clinic, home = DEFAULT_ROOMS.home, people = ['patient', 'patient']}) => {
  const Doc = ALL.doctor;
  const A = ALL[people[0]];
  const B = ALL[people[1]];
  const cell = (x: number, label: string, sub: string, kids: React.ReactNode) => (
    <>
      <div style={{position: 'absolute', left: x, top: 110, width: 506, height: 900, overflow: 'hidden', borderRadius: 22, border: '3px solid #3a2f5c'}}>
        <div style={{width: 1080, height: 1920, transform: 'scale(0.4686)', transformOrigin: 'top left', position: 'relative', overflow: 'hidden'}}>{kids}</div>
      </div>
      <T x={x + 4} y={1016} w={500} size={26} weight={900} color="#ffc93c">{label}</T>
      <T x={x + 4} y={1048} w={900} size={17} weight={600} color="#b9b2d6">{sub}</T>
    </>
  );
  const kidSize = (who: string) => (who === 'kid' ? 980 : 900);
  const inClinic = peopleBoxes({set: 'clinic', cast: [{who: 'doctor', x: 285, size: 940} as ToonActor, {who: people[0], x: 805, size: kidSize(people[0])} as ToonActor]});
  const atHome = peopleBoxes({set: 'home', cast: [{who: people[1], x: 540, size: 1040} as ToonActor]});
  const line = (l: RoomLook) => `${l.palette} · ${l.wall} wall · ${l.floor} floor · ${l.window.style} window, ${l.window.view} view · ${l.layout}${l.chart ? ` · ${l.chart} chart` : ''} · ${l.time ?? 'day'}`;
  return (
    <AbsoluteFill style={{background: '#1d1430'}}>
      <T x={40} y={30} w={1800} size={44} weight={900} color="#ffffff">{title}</T>
      {cell(40, 'Clinic', line(clinic), <><Room look={clinic} role="clinic" t={2} people={inClinic} /><Stand x={285} floor={ROOM_FLOOR} size={940} tone={roomTone(clinic)}><Doc emotion="happy" t={0.6} arms={POSES.explain.person} /></Stand><Stand x={805} floor={ROOM_FLOOR} size={people[0] === 'kid' ? 980 : 900} tone={roomTone(clinic)}><A emotion="neutral" t={0.6} /></Stand><RoomFore look={clinic} role="clinic" t={2} /></>)}
      {cell(586, 'Clinic, empty', '', <><Room look={clinic} role="clinic" t={2} people={inClinic} /><RoomFore look={clinic} role="clinic" t={2} /></>)}
      {cell(1132, `Home: ${home.kind ?? 'bedroom'}`, line(home), <><Room look={home} role="home" t={2} people={atHome} /><Stand x={540} floor={ROOM_FLOOR} size={1040} tone={roomTone(home)}><B emotion="sick" t={0.6} arms={POSES.heart.person} /></Stand><RoomFore look={home} role="home" t={2} /></>)}
    </AbsoluteFill>
  );
};

/**
 * ROOM STYLE BOARD: the same clinic or home as it is now and with a few things removed (rooms.tsx,
 * ROOM_TIDY 1 and 2), with people, a thought bubble, a tag and a caption where a video puts them (1920x1080).
 */
export const RoomStyleBoard: React.FC<{title?: string; which?: 'clinic' | 'home'; clinic?: RoomLook; home?: RoomLook; people?: [string, string]}> = ({title = 'Rooms: now, and with a few things removed', which = 'clinic', clinic = DEFAULT_ROOMS.clinic, home = DEFAULT_ROOMS.home, people = ['patient', 'patient']}) => {
  const Doc = ALL.doctor;
  const A = ALL[people[0]];
  const B = ALL[people[1]];
  const k = 0.44;
  const cell = (i: number, label: string, sub: string, kids: React.ReactNode) => {
    const x = 60 + i * 620;
    return (
      <>
        <div style={{position: 'absolute', left: x, top: 96, width: 1080 * k, height: 1920 * k, overflow: 'hidden', borderRadius: 20, border: '3px solid #3a2f5c'}}>
          <div style={{width: 1080, height: 1920, transform: `scale(${k})`, transformOrigin: 'top left', position: 'relative', overflow: 'hidden'}}>{kids}</div>
        </div>
        <T x={x + 4} y={954} w={560} size={28} weight={900} color="#ffc93c">{label}</T>
        <T x={x + 4} y={992} w={560} size={18} weight={600} color="#b9b2d6">{sub}</T>
      </>
    );
  };
  const clinicCast = (
    <>
      <Stand x={285} floor={ROOM_FLOOR} size={940} tone={roomTone(clinic)}><Doc emotion="happy" t={0.6} arms={POSES.explain.person} /></Stand>
      <Stand x={805} floor={ROOM_FLOOR} size={people[0] === 'kid' ? 980 : 900} tone={roomTone(clinic)}><A emotion="shocked" t={0.6} /></Stand>
      <Slot x={456} y={353} size={300}><Prop kind="pipe" t={0.6} bubble /></Slot>
      <Slot x={716} y={300} size={300}><Prop kind="tag" t={0.6} text="the twist" /></Slot>
      <Slot x={455} y={1190} size={190}><Prop kind="pillbottle" t={0.6} halo /></Slot>
      <Slot x={648} y={1190} size={190}><Prop kind="glass" t={0.6} halo /></Slot>
      <WordCaption word="stuck" key_ y={1470} plain />
    </>
  );
  const homeCast = (look: RoomLook) => (
    <>
      <Stand x={540} floor={ROOM_FLOOR} size={1040} tone={roomTone(look)}><B emotion="sick" t={0.6} arms={POSES.heart.person} /></Stand>
      <Slot x={540} y={300} size={300}><Prop kind="tag" t={0.6} text="2 hours later" /></Slot>
      <WordCaption word="burn" key_ y={1470} plain />
    </>
  );
  return (
    <AbsoluteFill style={{background: '#1d1430'}}>
      <T x={60} y={24} w={1800} size={40} weight={900} color="#ffffff">{title}</T>
      {which === 'clinic' ? (
        <>
          {cell(0, 'Now', 'as in the three live videos', <><Room look={clinic} role="clinic" t={2} tidy={0} />{clinicCast}<RoomFore look={clinic} role="clinic" t={2} tidy={0} /></>)}
          {cell(1, 'A: a few things removed', 'gone: the clock, the certificate, the blurred leaf in front', <><Room look={clinic} role="clinic" t={2} tidy={1} />{clinicCast}</>)}
          {cell(2, 'B: a little more removed', 'also gone: the plant, the jars, the stand at the side', <><Room look={clinic} role="clinic" t={2} tidy={2} />{clinicCast}</>)}
        </>
      ) : (
        <>
          {cell(0, `Now (${home.kind ?? 'bedroom'})`, 'as in the live video', <><Room look={home} role="home" t={2} tidy={0} />{homeCast(home)}<RoomFore look={home} role="home" t={2} tidy={0} /></>)}
          {cell(1, 'A: a few things removed', 'gone: the two pictures on the wall', <><Room look={home} role="home" t={2} tidy={1} />{homeCast(home)}</>)}
          {cell(2, 'B: a little more removed', "also gone: the lamp's big glow", <><Room look={home} role="home" t={2} tidy={2} />{homeCast(home)}</>)}
        </>
      )}
    </AbsoluteFill>
  );
};

/** POSE BOARD: one person in every arm pose, large enough to judge shoulders, elbows and hands (1920x1600). */
export const PoseBoard: React.FC<{who: string}> = ({who}) => {
  const C = ALL[who];
  const person = who in PEOPLE;
  const names = Object.keys(POSES) as PoseName[];
  const cols = 6;
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <T x={40} y={22} w={1200} size={34} weight={900}>{`Arm poses: ${who}`}</T>
      {names.map((n, i) => {
        const x = 24 + (i % cols) * 314;
        const y = 80 + Math.floor(i / cols) * 500;
        return (
          <React.Fragment key={n}>
            <div style={{position: 'absolute', left: x, top: y, width: 302, height: 470, overflow: 'hidden', borderRadius: 14, background: '#ffffff', border: '2px solid #e6dfd2'}}>
              <Stand x={151} floor={440} size={person ? 400 : 230} ground={groundOf(who)}><C emotion="happy" t={0.6} arms={person ? POSES[n].person : POSES[n].body} /></Stand>
            </div>
            <T x={x + 8} y={y + 6} w={190} size={20} weight={900} color="#8a8498">{n}</T>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/** CAMERA BOARD: the same scene through nine shot sizes and lenses (1080x1920). */
export const CameraBoard: React.FC = () => {
  const office: ToonActor[] = [{who: 'doctor', x: 310, size: 1040, emotion: 'happy', pose: 'explain'}, {who: 'patient', x: 780, size: 1000, emotion: 'sick', pose: 'belly'}];
  const throat: ToonActor[] = [{who: 'whitecell', x: 350, y: 700, size: 720, noLegs: true, emotion: 'angry', pose: 'point'}, {who: 'pill', x: 740, y: 1090, size: 600, rot: -68, noLegs: true, emotion: 'scared', pose: 'panic'}];
  const cells: {set: 'office' | 'throat'; who: string; shot: ShotName; lens: LensName; move?: MoveName}[] = [
    {set: 'office', who: 'doctor', shot: 'wide', lens: '24'},
    {set: 'office', who: 'doctor', shot: 'two', lens: '35'},
    {set: 'office', who: 'doctor', shot: 'ms', lens: '35'},
    {set: 'office', who: 'doctor', shot: 'mcu', lens: '50'},
    {set: 'office', who: 'patient', shot: 'cu', lens: '85'},
    {set: 'office', who: 'doctor', shot: 'ecu', lens: '135'},
    {set: 'office', who: 'doctor', shot: 'ots', lens: '50'},
    {set: 'throat', who: 'whitecell', shot: 'low', lens: '35'},
    {set: 'throat', who: 'pill', shot: 'cu', lens: '85', move: 'dutch'},
  ];
  return (
    <AbsoluteFill style={{background: '#1d1430'}}>
      <T x={540} y={34} w={1040} size={50} weight={900} color="#ffffff" align="center">MedPeak Toons · camera and lenses</T>
      <T x={540} y={98} w={1040} size={22} weight={600} color="#b9b2d6" align="center">one scene, nine pictures: shot size · lens · what it is for</T>
      {cells.map((c, i) => {
        const x = 30 + (i % 3) * 346;
        const y = 160 + Math.floor(i / 3) * 584;
        return (
          <React.Fragment key={i}>
            <div style={{position: 'absolute', left: x, top: y, width: 328, height: 492, overflow: 'hidden', borderRadius: 18, border: '3px solid #3a2f5c'}}>
              <div style={{width: 1080, height: 1920, transform: 'scale(0.3037)', transformOrigin: 'top left', position: 'relative', overflow: 'hidden'}}>
                <ShotStill set={c.set} cast={c.set === 'office' ? office : throat} who={c.who} shot={c.shot} lens={c.lens} move={c.move} />
              </div>
            </div>
            <T x={x + 4} y={y + 500} w={330} size={22} weight={900} color="#ffc93c">{c.shot.toUpperCase()} · {LENSES[c.lens].label}{c.move ? ` · ${c.move}` : ''}</T>
            <T x={x + 4} y={y + 530} w={324} size={15} weight={600} color="#cfc8e8">{SHOTS[c.shot].split(':')[1]?.trim() ?? SHOTS[c.shot]}</T>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/** A character drawn only up to a build step (for the blueprint page). */
const Partial: React.FC<{bp: Blueprint; grey?: boolean; face?: boolean}> = ({bp, grey = false, face = false}) => {
  const color = grey ? '#d5d8e0' : bp.color;
  const c = {p: {}, t: 0.6, color, line: lineOf(color)};
  return (
    <g>
      {bp.back?.(c)}
      {bp.body(c)}
      {face && <g transform={`translate(${bp.face.x} ${bp.face.y})`}><Face size={bp.face.size} skin={bp.face.skin ?? bp.color} /></g>}
    </g>
  );
};

/** CHARACTER BLUEPRINT: the rules every new character follows (1920x1080). */
export const BlueprintBoard: React.FC = () => {
  const bp = BLUEPRINTS.stomach;
  const Stomach = CAST.stomach;
  const steps = ['1 Real anatomy, simplified', '2 Volume paint + structure', '3 Face zone', '4 Arms + hands', '5 Pose + emotion'];
  const people: PersonName[] = ['doctor', 'patient', 'mom', 'grandpa', 'kid', 'baby'];
  const families: {label: string; colors: string[]}[] = [
    {label: 'organs: warm pinks and reds', colors: ['#ff8f9c', '#ffb3aa', '#c9584b', '#f25f70', '#ffb3c7']},
    {label: 'cells: clean and bright', colors: ['#e94b50', '#eef1ff', '#ffb24a', '#ffd8c6']},
    {label: 'germs: "wrong" colours', colors: ['#9b5cf0', '#8bd469', '#ff5c9d']},
    {label: 'medicine: white + teal', colors: ['#fffdf6', '#19b8a6']},
  ];
  const rules = [
    'Start from real anatomy; show its real parts.',
    'Organs have no legs. Only travellers do.',
    'One accessory shows the job. Never two.',
    'Eyes span 40-55% of the body width.',
    'Name the material: flesh, cell, hard, cloth.',
    'Hold a pose, then move with easing.',
  ];
  return (
    <AbsoluteFill style={{background: PAPER}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1920, height: 12, background: STYLE.label}} />
      <T x={70} y={40} size={24} weight={800} color={STYLE.label} spacing={5}>MEDPEAK TOONS</T>
      <T x={70} y={68} w={1300} size={64} weight={900}>Character blueprint</T>
      <T x={72} y={150} w={1300} size={24} weight={600} color="#6f6880">Every new character is built the same way, so it matches the cast on the first try.</T>

      <T x={70} y={214} size={22} weight={800} color={STYLE.label} spacing={4}>BUILD ORDER</T>
      {steps.map((s, i) => {
        const x = 190 + i * 262;
        return (
          <React.Fragment key={s}>
            <div style={{position: 'absolute', left: x - 118, top: 256, width: 236, height: 270, borderRadius: 22, background: '#ffffff', border: '2px solid #ece4d6'}} />
            <Slot x={x} y={384} size={200}>
              {i === 0 && <Partial bp={bp} grey />}
              {i === 1 && <Partial bp={bp} />}
              {i === 2 && (
                <>
                  <Partial bp={bp} face />
                  <rect x={bp.face.x - 42} y={bp.face.y - 36} width={84} height={72} rx={8} fill="none" stroke={STYLE.label} strokeWidth={1.6} strokeDasharray="5 4" />
                </>
              )}
              {i === 3 && <Stomach t={0.6} />}
              {i === 4 && <Stomach emotion="happy" talk={0.6} arms={[112, {a: -55, hand: 'open'}]} t={0.6} />}
            </Slot>
            <T x={x} y={536} w={250} size={18} weight={800} align="center">{s}</T>
          </React.Fragment>
        );
      })}

      <T x={1420} y={214} size={22} weight={800} color={STYLE.label} spacing={4}>LINE + LIGHT</T>
      <Slot x={1520} y={390} size={230}><Part d={circlePath(0, 0, 70)} fill="#ff8f9c" mat="flesh" shine={[-34, -38, 1.4]} /></Slot>
      {['outline: darker fill shade', `max ${STYLE.maxLinePx} px on screen`, 'soft form + crisp shadow', 'bounce light on the dark edge', 'texture by material + gloss'].map((r, i) => <T key={r} x={1660} y={296 + i * 40} w={250} size={18} weight={700} color="#6f6880">• {r}</T>)}

      <T x={70} y={600} w={900} size={22} weight={800} color={STYLE.label} spacing={4}>PEOPLE: 3.6 · 2.9 · 2.2 HEADS TALL</T>
      {[0, 1, 2, 3, 4].map((k) => <div key={k} style={{position: 'absolute', left: 70, top: 660 + k * 87.5, width: 860, borderTop: `2px dashed ${k === 0 || k === 4 ? '#d9cfbd' : '#ece4d6'}`}} />)}
      {[1, 2, 3, 4].map((k) => <T key={k} x={936} y={676 + (k - 1) * 87.5} w={60} size={15} weight={700} color="#a79fb3">head {k}</T>)}
      {people.map((n, i) => {
        const C = PEOPLE[n];
        return <Stand key={n} x={150 + i * 140} floor={1010} size={364} ground={96}><C emotion={i % 2 ? 'neutral' : 'happy'} talk={0} /></Stand>;
      })}
      {people.map((n, i) => <T key={n} x={150 + i * 140} y={1022} w={140} size={17} weight={800} align="center">{n}</T>)}

      <T x={1010} y={600} size={22} weight={800} color={STYLE.label} spacing={4}>MITTEN HANDS</T>
      {HAND_POSES.map((h, i) => <HandChip key={h} x={1060 + (i % 3) * 120} y={700 + Math.floor(i / 3) * 150} pose={h} color="#ff8f9c" size={110} />)}
      <T x={1010} y={960} w={380} size={17} weight={600} color="#6f6880">Bundled fingers + a thumb wedge, one outline, in the character's own colour.</T>

      <T x={1420} y={600} size={22} weight={800} color={STYLE.label} spacing={4}>COLOUR FAMILIES</T>
      {families.map((f, i) => (
        <React.Fragment key={f.label}>
          {f.colors.map((c, k) => <div key={c} style={{position: 'absolute', left: 1420 + k * 36, top: 642 + i * 58, width: 30, height: 30, borderRadius: 8, background: c, border: `2px solid ${lineOf(c)}`}} />)}
          <T x={1612} y={646 + i * 58} w={300} size={16} weight={700} color="#6f6880">{f.label}</T>
        </React.Fragment>
      ))}
      <T x={1420} y={880} size={22} weight={800} color={STYLE.label} spacing={4}>RULES</T>
      {rules.map((r, i) => <T key={r} x={1420} y={916 + i * 26} w={480} size={17} weight={600} color="#6f6880">{i + 1}. {r}</T>)}
    </AbsoluteFill>
  );
};

const Cap: React.FC<{f: number; words: [number, number, string, boolean?][]; y?: number}> = ({f, words, y = 1560}) => {
  const w = words.find(([a, b]) => f >= a && f < b);
  if (!w) return null;
  return <WordCaption word={w[2]} key_={!!w[3]} pop={0.7 + 0.3 * E.back(clamp01((f - w[0]) / 5))} y={y} />;
};

/** 18 s of staged shots: each one holds a pose, makes one clear gesture and speaks. */
export const SceneDemo: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const shot = Math.floor(f / 90) % 6;
  const lf = f % 90;
  const bl = (seed: number) => blinkAt(f, fps, seed);
  const zoom = 1 + 0.035 * E.inOut(lf / 90);
  const raise = (from: number, to: number) => key(lf, [[8, from], [20, to, E.back]]);
  const cap = (word: string, k = false) => <Cap f={lf} words={[[16, 86, word, k]]} />;
  const {tooth: Tooth, bacteria: Bacteria, pill: Pill, stomach: Stomach, poop: Poop, intestine: Intestine, whitecell: WhiteCell, virus: Virus, redcell: RedCell} = CAST;
  const {doctor: Doctor, patient: Patient} = PEOPLE;
  switch (shot) {
    case 0: return (<AbsoluteFill><Camera zoom={zoom} cx={540} cy={960}><MouthSet t={t} />
      <Stand x={450} floor={1300} size={700} ground={92}><Hold frame={f} ground={92}><Tooth emotion="scared" talk={speak(lf, 18, 80)} blink={bl(1)} arms={[{a: raise(120, 205), hand: 'open'}, {a: raise(60, -30), hand: 'open'}]} look={{x: 0.8, y: 0.2}} /></Hold></Stand>
      <Stand x={850} floor={1210} size={330} ground={60}><Hold frame={f} seed={2} ground={60}><Bacteria t={t} emotion="smug" blink={bl(2)} arms={[150, {a: 40, hand: 'fist'}]} look={{x: -0.8, y: 0.2}} /></Hold></Stand></Camera>
      {cap('CAVITY', true)}<Grain /></AbsoluteFill>);
    case 1: return (<AbsoluteFill><Camera zoom={zoom} cx={540} cy={960}><ThroatSet t={t} />
      <Slot x={540} y={860} size={640}><g transform={`rotate(${-72 + settle(lf, 0, 6, 0.7, 0.2)})`}><Pill emotion="scared" talk={speak(lf, 18, 80, 1)} blink={bl(3)} arms={[{a: raise(120, 200), hand: 'open'}, {a: raise(60, -20), hand: 'open'}]} look={{x: 0.2, y: 0.7}} noLegs /></g></Slot></Camera>
      {cap('STUCK', true)}<Grain /></AbsoluteFill>);
    case 2: return (<AbsoluteFill><Camera zoom={zoom} cx={540} cy={960}><StomachSet t={t} />
      <Stand x={520} floor={1440} size={880} ground={74}><Hold frame={f} ground={74}><Stomach emotion="angry" talk={speak(lf, 18, 80, 2)} blink={bl(4)} arms={[{a: 150, hand: 'fist'}, {a: raise(60, -12), hand: 'point'}]} look={{x: 0.5, y: 0.5}} /></Hold></Stand></Camera>
      {cap('ACID')}<Grain /></AbsoluteFill>);
    case 3: return (<AbsoluteFill><Camera zoom={zoom} cx={540} cy={960}><GutSet t={t} />
      <Stand x={330} floor={1330} size={600} ground={92}><Hold frame={f} ground={92}><Poop emotion="smug" talk={speak(lf, 18, 80, 3)} blink={bl(5)} arms={[{a: 150, hand: 'fist'}, {a: raise(60, 20), hand: 'open'}]} look={{x: 0.9, y: -0.2}} /></Hold></Stand>
      <Stand x={800} floor={1330} size={520} ground={76}><Hold frame={f} seed={3} ground={76}><Intestine emotion="shocked" blink={bl(6)} arms={[{a: raise(120, 210), hand: 'open'}, {a: raise(60, -30), hand: 'open'}]} look={{x: -0.9, y: 0.2}} /></Hold></Stand></Camera>
      {cap('MOVE')}<Grain /></AbsoluteFill>);
    case 4: return (<AbsoluteFill><Camera zoom={zoom} cx={540} cy={960}><BloodSet t={t} />
      <Stand x={320} floor={1350} size={660} ground={94}><Hold frame={f} ground={94}><WhiteCell t={t} emotion="angry" talk={speak(lf, 18, 80, 4)} blink={bl(7)} arms={[{a: 150, hand: 'fist'}, {a: raise(60, -18), hand: 'point'}]} look={{x: 0.9, y: -0.1}} /></Hold></Stand>
      <Stand x={800} floor={1090} size={440} ground={96}><Hold frame={f} seed={4}><Virus t={t} emotion="scared" blink={bl(8)} arms={[{a: raise(120, 210), hand: 'open'}, {a: raise(60, -30), hand: 'open'}]} look={{x: -0.9, y: 0.3}} /></Hold></Stand>
      <Stand x={830} floor={1350} size={300} ground={74}><Hold frame={f} seed={5} ground={74}><RedCell emotion="shocked" blink={bl(9)} look={{x: -0.6, y: -0.5}} /></Hold></Stand></Camera>
      {cap('ATTACK', true)}<Grain /></AbsoluteFill>);
    default: return (<AbsoluteFill><Camera zoom={zoom} cx={540} cy={960}><OfficeSet t={t} />
      <Stand x={330} floor={1500} size={800}><Hold frame={f}><Doctor emotion="happy" talk={speak(lf, 18, 80, 5)} blink={bl(10)} arms={[97, {a: raise(83, -28), hand: 'open'}]} look={{x: 0.8, y: 0}} /></Hold></Stand>
      <Stand x={760} floor={1500} size={780}><Hold frame={f} seed={6}><Patient emotion="sick" blink={bl(12)} arms={[{a: 68, len: 36, bend: -10, front: true}, {a: 112, len: 36, bend: 10, front: true}]} look={{x: -0.8, y: 0}} /></Hold></Stand></Camera>
      {cap('WATER', true)}<Grain /></AbsoluteFill>);
  }
};

/**
 * 12 s acted scene (no voice yet): a pill drops into the gut and the stomach throws it out.
 * Nothing wobbles: every character holds, then moves with anticipation, an eased move and a settle.
 */
export const ActingDemo: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const FLOOR = 1330;
  const {stomach: Stomach, pill: Pill} = CAST;

  // ---- the pill: falls in, lands with a squash, talks, panics, runs
  const pillFloor = key(f, [[20, -260], [40, FLOOR, E.in]]);
  const pillSquash = f < 40 ? -0.25 : f < 278 ? settle(f, 40, 0.55, 1.1, 0.3) : key(f, [[278, 0], [284, 0.3, E.out], [290, -0.1, E.out], [300, 0]]);
  const pillX = key(f, [[278, 760], [285, 742, E.out], [345, 1340, E.in]]);
  const running = f >= 286;
  const pillEmotion: Emotion = f < 40 ? 'scared' : f < 70 ? 'sick' : f < 168 ? 'neutral' : f < 256 ? 'smug' : f < 280 ? 'shocked' : 'scared';
  const pillArms: [ArmSpec, ArmSpec] = f < 40 ? [{a: 215, hand: 'open'}, {a: -35, hand: 'open'}]
    : running ? [{a: 150 + Math.sin(f * 0.85) * 40, hand: 'fist'}, {a: 30 - Math.sin(f * 0.85) * 40, hand: 'fist'}]
    : f >= 256 ? [{a: key(f, [[256, 112], [264, 210, E.back]]), hand: 'open'}, {a: key(f, [[256, 68], [264, -30, E.back]]), hand: 'open'}]
    : [{a: 135, hand: 'fist'}, {a: key(f, [[176, 68], [188, -25, E.back], [226, -25], [236, -62, E.back]]), hand: f >= 230 ? 'thumb' : f >= 180 ? 'open' : 'relaxed'}];

  // ---- the stomach: happy, startled take, angry close-up, jump and point
  const take = f < 200;
  const stSquash = take ? key(f, [[42, 0], [46, 0.3, E.out], [51, -0.22, E.out], [62, 0]]) : key(f, [[258, 0], [264, 0.32, E.out], [270, -0.28, E.out], [278, -0.1], [281, 0.36, E.out], [292, 0]]);
  const stJump = key(f, [[264, 0], [271, -200, E.out], [278, 0, E.in]]);
  const stX = key(f, [[44, 300], [52, 268, E.out]]);
  const stEmotion: Emotion = f < 44 ? 'happy' : f < 90 ? 'shocked' : 'angry';
  const stArms: [ArmSpec, ArmSpec] = [
    {a: key(f, [[44, 125], [52, 208, E.back], [90, 208], [91, 150]]), hand: f >= 44 && f < 90 ? 'open' : 'fist'},
    {a: key(f, [[44, 55], [52, -32, E.back], [90, -32], [91, 40], [98, -6, E.back], [255, -6], [262, 50], [272, -10, E.back]]), hand: f >= 44 && f < 90 ? 'open' : f >= 96 ? 'point' : 'relaxed'},
  ];

  const shot = f < 90 ? 0 : f < 168 ? 1 : f < 255 ? 2 : 3;
  const local = [f / 90, (f - 90) / 78, (f - 168) / 87, (f - 255) / 105][shot];
  const push = E.inOut(clamp01(local));
  const cams: [number, number, number][] = [[1.02 + push * 0.03, 540, 960], [1.75 + push * 0.06, 330, 1060], [2.2 + push * 0.08, 770, 1160], [1.05 - push * 0.03, 540, 960]];
  const [zoom, cx, cy] = cams[shot];
  const words: [number, number, string, boolean?][] = [[44, 88, 'HUH?'], [98, 120, 'WHO'], [120, 142, 'ARE'], [142, 166, 'YOU?', true], [178, 206, 'RELAX'], [208, 228, "I'M A"], [228, 252, 'PILL', true], [264, 298, 'GET'], [298, 352, 'OUT!', true]];
  const dust = f >= 40 && f < 56 ? (f - 40) / 16 : -1;
  return (
    <AbsoluteFill style={{background: '#f0a8a0'}}>
      <Camera zoom={zoom} cx={cx} cy={cy}>
        <GutSet t={t} />
        <Stand x={stX} floor={FLOOR + stJump} size={640} ground={74}>
          <Hold frame={f} ground={74}>
            <Stomach emotion={stEmotion} talk={speak(f, 98, 166) + speak(f, 264, 350, 2)} blink={blinkAt(f, fps, 3)} arms={stArms} look={{x: 0.9, y: f < 40 ? -0.7 : 0.15}} squash={stSquash} t={t} />
          </Hold>
        </Stand>
        <Stand x={pillX} floor={pillFloor} size={400} ground={96}>
          <g transform={`rotate(${key(f, [[20, -38], [40, 0, E.out]])})`}>
            <Hold frame={f} seed={2}>
              <Pill emotion={pillEmotion} talk={speak(f, 178, 252, 1)} blink={blinkAt(f, fps, 7)} arms={pillArms} look={{x: running ? 0.9 : -0.9, y: 0}} squash={pillSquash} step={running ? Math.sin(f * 0.85) : 0} flip={false} />
            </Hold>
          </g>
        </Stand>
        {dust >= 0 && (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
            {[-1, 1].map((s) => <ellipse key={s} cx={760 + s * (50 + dust * 110)} cy={FLOOR - 16 - dust * 26} rx={26 + dust * 22} ry={18 + dust * 14} fill="#fff1e8" stroke={STYLE.fleshLine} strokeWidth={3} opacity={1 - dust} />)}
          </svg>
        )}
      </Camera>
      <Cap f={f} words={words} />
      <Grain />
    </AbsoluteFill>
  );
};
