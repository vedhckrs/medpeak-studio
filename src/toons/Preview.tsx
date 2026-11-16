// MedPeak Toons boards and demos (v5):
//   ToonCast       every character on one page
//   ToonSheet      the model sheet for ONE character (hero, colours, expressions, poses, hands)
//   ToonBlueprint  the house rules every new character follows
//   ToonEmotions   one character in all 9 emotions
//   ToonSets       all sets
//   ToonScenes     18 s of staged shots        ToonActing   12 s acted scene with cuts
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {theme} from '../brand/theme';
import type {Blueprint, CharProps} from './blueprint';
import {BLUEPRINTS, CAST, type CastName} from './characters';
import {headY, PEOPLE, SPECS, type PersonName} from './humans';
import {circlePath, Grain, lineOf, Part, tone} from './ink';
import {clamp01, E, key, settle, speak} from './motion';
import {type ArmSpec, blinkAt, EMOTIONS, type Emotion, Face, Hand, HAND_POSES, type HandPose} from './rig';
import {BloodSet, GutSet, MouthSet, OfficeSet, SETS, StomachSet, ThroatSet, WordCaption, type SetName} from './scenes';
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
  const poses: [ArmSpec, ArmSpec][] = [[112, 68], [{a: 200, hand: 'open'}, 68], [112, {a: -30, hand: 'open'}], [{a: 150, hand: 'fist'}, {a: 30, hand: 'fist'}], [112, {a: -50, hand: 'thumb'}], [112, {a: 0, hand: 'point'}]];
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
            <Slot x={x} y={n in SPECS ? y - 6 : y} size={n in SPECS ? 232 : 196}><C emotion={e} arms={poses[i % poses.length]} t={0.6} look={{x: i % 2 ? -0.5 : 0.5, y: 0}} talk={e === 'happy' ? 0.6 : 0} /></Slot>
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
export const SetBoard: React.FC = () => (
  <AbsoluteFill style={{background: '#fff'}}>
    {(Object.keys(SETS) as SetName[]).map((n, i) => {
      const S = SETS[n];
      return (
        <div key={n} style={{position: 'absolute', left: (i % 3) * 360, top: Math.floor(i / 3) * 640, width: 1080, height: 1920, transform: 'scale(0.3333)', transformOrigin: 'top left', overflow: 'hidden', outline: '12px solid #fff'}}>
          <S t={1.2} />
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
  const fit = sp ? Math.max(0.6, (sp.height ?? 1) * (1 - (1 - (sp.legs ?? 1)) * 0.36)) : 1; // small people are drawn bigger so they fill the sheet
  const chips: {label: string; color: string}[] = bp
    ? [{label: 'body', color: bp.color}, {label: 'outline', color: lineOf(bp.color)}, {label: 'shadow', color: tone(bp.color, STYLE.shadow)}, ...(bp.accents ?? [])]
    : [{label: 'skin', color: sp!.skin}, {label: 'hair', color: sp!.hair.color}, {label: 'top', color: sp!.top.color}, ...(sp!.top.under ? [{label: 'under', color: sp!.top.under}] : []), {label: 'bottom', color: sp!.bottom.color}, {label: 'shoes', color: sp!.shoes}];
  const poses: {label: string; emotion: Emotion; arms: [ArmSpec, ArmSpec]; talk?: number}[] = [
    {label: 'wave', emotion: 'happy', arms: [112, {a: -55, hand: 'open'}], talk: 0.6},
    {label: 'point', emotion: 'angry', arms: [{a: 150, hand: 'fist'}, {a: -8, hand: 'point'}], talk: 0.5},
    {label: 'thumbs up', emotion: 'smug', arms: [112, {a: -48, hand: 'thumb'}]},
    {label: 'panic', emotion: 'scared', arms: [{a: 215, hand: 'open'}, {a: -35, hand: 'open'}], talk: 0.8},
  ];
  const rules = bp
    ? [`Family: ${bp.family}`, `Face: size ${bp.face.size} at (${bp.face.x}, ${bp.face.y})`, bp.legs ? 'Legs: yes (a traveller)' : 'Legs: none (stays in place)', bp.arms ? 'Arms: thin, in the body colour, mitten hands' : 'Arms: none', `Stands on y = ${bp.ground.y}`]
    : ['Family: person', `Height: ${sp!.height === undefined || sp!.height >= 0.9 ? '4 heads (adult)' : (sp!.legs ?? 1) > 0.6 ? '3 heads (kid)' : '2.5 heads (toddler)'}`, `Hair: ${sp!.hair.style}`, `Top: ${sp!.top.kind} · Bottom: ${sp!.bottom.kind}`, 'Hands: mitten hands in the skin colour'];
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
            <Stand x={x} floor={y + 104} size={220 / fit} ground={groundOf(who)}><C emotion={p.emotion} arms={p.arms} talk={p.talk ?? 0} t={0.6} look={{x: 0.4, y: 0}} /></Stand>
            <T x={x} y={y + 118} w={240} size={19} weight={800} align="center">{p.label}</T>
          </React.Fragment>
        );
      })}
      <T x={1370} y={860} size={22} weight={800} color={STYLE.label} spacing={4}>HANDS</T>
      {HAND_POSES.map((h, i) => <HandChip key={h} x={1420 + i * 104} y={960} pose={h} color={bp ? bp.arms?.color ?? bp.color : sp!.skin} size={104} />)}
      <T x={1850} y={50} w={900} size={16} weight={600} color="#a79fb3" align="right">outline = darker shade of each fill · max {STYLE.maxLinePx} px on screen · light from the top-left · main colour {main.toUpperCase()}</T>
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
  const steps = ['1 Real shape, simplified', '2 Paint: flat + shadow + gloss', '3 Face zone', '4 Arms + mitten hands', '5 Pose + emotion'];
  const people: PersonName[] = ['doctor', 'patient', 'mom', 'grandpa', 'kid', 'baby'];
  const families: {label: string; colors: string[]}[] = [
    {label: 'organs: warm pinks and reds', colors: ['#ff8f9c', '#ffb3aa', '#c9584b', '#f25f70', '#ffb3c7']},
    {label: 'cells: clean and bright', colors: ['#e94b50', '#eef1ff', '#ffb24a', '#ffd8c6']},
    {label: 'germs: "wrong" colours', colors: ['#9b5cf0', '#8bd469', '#ff5c9d']},
    {label: 'medicine: white + teal', colors: ['#fffdf6', '#19b8a6']},
  ];
  const rules = [
    'Start from real anatomy; keep 2-3 clear features.',
    'Organs have no legs. Only travellers do.',
    'One accessory shows the job. Never two.',
    'Eyes span 40-55% of the body width.',
    'Outline: darker shade of the fill, thin.',
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
      <Slot x={1520} y={390} size={230}><Part d={circlePath(0, 0, 70)} fill="#ff8f9c" shine={[-34, -38, 1.4]} /></Slot>
      {['outline: darker fill shade', `max ${STYLE.maxLinePx} px on screen`, 'crisp shadow, lower right', 'one gloss, upper left', 'tone-on-tone details'].map((r, i) => <T key={r} x={1660} y={296 + i * 40} w={250} size={18} weight={700} color="#6f6880">• {r}</T>)}

      <T x={70} y={600} w={900} size={22} weight={800} color={STYLE.label} spacing={4}>PEOPLE: 4 · 3 · 2.5 HEADS TALL</T>
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
