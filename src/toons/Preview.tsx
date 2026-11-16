// Preview boards for approving the Toons look before any voice is made.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CAST, Pill, Poop, Stomach, Virus, WhiteCell, RedCell, Tooth, Bacteria, type CastName} from './characters';
import {PEOPLE, Doctor, Patient, Mom, type PersonName} from './humans';
import {blinkAt, EMOTIONS, INK} from './rig';
import {SETS, BloodSet, MouthSet, OfficeDesk, OfficeSet, StomachSet, ThroatSet, GutSet, WordCaption, type SetName} from './scenes';
import {theme} from '../brand/theme';
import {Boil, Grain} from './ink';
import {STYLE} from './style';

const ALL = {...CAST, ...PEOPLE} as Record<string, React.FC<Record<string, unknown>>>;

export const Slot: React.FC<{x: number; y: number; size: number; children: React.ReactNode}> = ({x, y, size, children}) => (
  <svg style={{position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible'}} width={size} height={size} viewBox="-100 -100 200 200">{children}</svg>
);

/** Every character, 4 across, each with a different emotion and pose. */
export const CastBoard: React.FC = () => {
  const names = Object.keys(ALL) as (CastName | PersonName)[];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#fff7ef, #ffe9dc)', fontFamily: theme.font}}>
      <div style={{textAlign: 'center', fontSize: 58, fontWeight: 900, color: INK, marginTop: 36}}>MedPeak Toons · cast of {names.length}</div>
      {names.map((n, i) => {
        const C = ALL[n];
        const x = 135 + (i % 4) * 270;
        const y = 250 + Math.floor(i / 4) * 280;
        return (
          <React.Fragment key={n}>
            <Slot x={x} y={y} size={210}><C emotion={EMOTIONS[i % EMOTIONS.length]} arms={[150 - (i % 3) * 20, 30 - (i % 2) * 70]} t={0.6} look={{x: i % 2 ? -0.6 : 0.6, y: 0}} /></Slot>
            <div style={{position: 'absolute', left: x - 130, width: 260, top: y + 108, textAlign: 'center', fontSize: 25, fontWeight: 800, color: INK}}>{n} · {EMOTIONS[i % EMOTIONS.length]}</div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/** One character in all 9 emotions. */
export const EmotionBoard: React.FC<{who?: CastName | PersonName}> = ({who = 'stomach'}) => {
  const C = ALL[who];
  return (
    <AbsoluteFill style={{background: 'linear-gradient(#fff7ef, #ffe9dc)', fontFamily: theme.font}}>
      <div style={{textAlign: 'center', fontSize: 60, fontWeight: 900, color: INK, marginTop: 60}}>{who}: 9 emotions</div>
      {EMOTIONS.map((e, i) => {
        const x = 200 + (i % 3) * 340;
        const y = 420 + Math.floor(i / 3) * 520;
        return (
          <React.Fragment key={e}>
            <Slot x={x} y={y} size={300}><C emotion={e} arms={[160, 20]} talk={e === 'happy' ? 0.7 : 0} /></Slot>
            <div style={{position: 'absolute', left: x - 150, width: 300, top: y + 170, textAlign: 'center', fontSize: 36, fontWeight: 800, color: INK}}>{e}</div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/** All 9 sets as a 3x3 grid (each drawn full-size then scaled to a third). */
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

/** Idle acting: a gentle sway and breathing around the feet, so nobody stands frozen. */
const Act: React.FC<{frame: number; seed: number; pivot?: number; children: React.ReactNode}> = ({frame, seed, pivot = 96, children}) => {
  const t = frame / 30;
  const sway = Math.sin(t * 2.1 + seed) * STYLE.sway;
  const breathe = 1 + Math.sin(t * 3.2 + seed) * STYLE.breathe;
  return <g transform={`translate(0 ${pivot}) rotate(${sway}) scale(${2 - breathe} ${breathe}) translate(0 ${-pivot})`}>{children}</g>;
};

/** Place a character so its feet (local y = feetY) stand on screen y `floor`, `size` px tall box, with line boil. */
const Stand: React.FC<{x: number; floor: number; size: number; feetY?: number; frame: number; children: React.ReactNode}> = ({x, floor, size, feetY = 96, frame, children}) => (
  <Slot x={x} y={floor - (feetY / 200) * size} size={size}><Boil frame={frame}><Act frame={frame} seed={x} pivot={feetY}>{children}</Act></Boil></Slot>
);

/** 18 s motion demo: six shots of 3 s, characters framed big on the floor. */
export const SceneDemo: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const shot = Math.floor(t / 3) % 6;
  const talk = (seed: number) => Math.max(0, Math.sin(t * 14 + seed)) * (Math.sin(t * 2.3 + seed) > -0.2 ? 1 : 0);
  const bob = Math.sin(t * 3) * 6;
  const local = (t % 3) / 3;
  const pop = 1 + Math.max(0, 0.25 - local * 2);
  const push = 1 + local * 0.05; // slow camera push-in on every shot
  const cam = (node: React.ReactNode) => <AbsoluteFill style={{transform: `scale(${push})`, transformOrigin: '50% 60%'}}>{node}</AbsoluteFill>;
  switch (shot) {
    case 0: return (<AbsoluteFill>{cam(<><MouthSet t={t} />
      <Stand x={470} floor={1300 + bob} size={760} frame={f}><Tooth emotion="scared" talk={talk(0)} blink={blinkAt(f, fps, 1)} arms={[200, -30 + Math.sin(t * 9) * 25]} look={{x: 0.7, y: -0.2}} /></Stand>
      <Stand x={860} floor={1180 - bob} size={360} feetY={60} frame={f}><Bacteria t={t} emotion="smug" blink={blinkAt(f, fps, 2)} arms={[160, 40]} look={{x: -0.8, y: 0.3}} /></Stand></>)}
      <WordCaption word="CAVITY" key_ pop={pop} y={1560} /><Grain opacity={0.06} /></AbsoluteFill>);
    case 1: return (<AbsoluteFill>{cam(<><ThroatSet t={t} />
      <Slot x={540 + Math.sin(t * 7) * 5} y={840 + bob} size={820}><Boil frame={f}><g transform="rotate(-16)"><Pill emotion="scared" talk={talk(1)} blink={blinkAt(f, fps, 3)} arms={[205, -25 + Math.sin(t * 9) * 25]} look={{x: 0.1, y: 0.7}} noLegs /></g></Boil></Slot></>)}
      <WordCaption word="STUCK" key_ pop={pop} y={1560} /><Grain opacity={0.06} /></AbsoluteFill>);
    case 2: return (<AbsoluteFill>{cam(<><StomachSet t={t} />
      <Stand x={540} floor={1440 + bob} size={900} frame={f}><Stomach emotion="angry" talk={talk(2)} blink={blinkAt(f, fps, 4)} arms={[200, 235]} look={{x: 0, y: 0.6}} noLegs /></Stand></>)}
      <WordCaption word="ACID" pop={pop} y={1600} /><Grain opacity={0.06} /></AbsoluteFill>);
    case 3: return (<AbsoluteFill>{cam(<><GutSet t={t} />
      <Stand x={330} floor={1330} size={640} feetY={88} frame={f}><Poop emotion="smug" talk={talk(3)} blink={blinkAt(f, fps, 5)} arms={[140, 60]} look={{x: 0.9, y: -0.2}} squash={Math.max(0, Math.sin(t * 6)) * 0.3} /></Stand>
      <Stand x={790} floor={1330} size={560} frame={f}><Stomach emotion="shocked" blink={blinkAt(f, fps, 6)} arms={[200, 235]} look={{x: -0.9, y: 0.2}} step={Math.sin(t * 8)} /></Stand></>)}
      <WordCaption word="MOVE" pop={pop} y={1560} /><Grain opacity={0.06} /></AbsoluteFill>);
    case 4: return (<AbsoluteFill>{cam(<><BloodSet t={t} />
      <Stand x={340} floor={1350 + bob} size={700} frame={f}><WhiteCell t={t} emotion="angry" talk={talk(4)} blink={blinkAt(f, fps, 7)} arms={[170, -40 + Math.sin(t * 10) * 20]} look={{x: 0.9, y: 0}} step={Math.sin(t * 8)} /></Stand>
      <Stand x={800} floor={1050 - bob} size={460} frame={f}><Virus t={t} emotion="scared" blink={blinkAt(f, fps, 8)} arms={[150, 20]} look={{x: -0.9, y: 0.2}} /></Stand>
      <Stand x={820} floor={1350} size={330} feetY={70} frame={f}><RedCell emotion="shocked" blink={blinkAt(f, fps, 9)} arms={[200, -20]} look={{x: -0.6, y: -0.4}} /></Stand></>)}
      <WordCaption word="ATTACK" key_ pop={pop} y={1580} /><Grain opacity={0.06} /></AbsoluteFill>);
    default: return (<AbsoluteFill>{cam(<><OfficeSet t={t} />
      <Slot x={310} y={1010} size={1060}><Boil frame={f}><Act frame={f} seed={1} pivot={100}><Doctor emotion="happy" talk={talk(5)} blink={blinkAt(f, fps, 10)} arms={[118, -40 + Math.sin(t * 4) * 15]} look={{x: 0.8, y: 0}} /></Act></Boil></Slot>
      <Slot x={800} y={1080} size={900}><Boil frame={f}><Act frame={f} seed={2} pivot={100}><Patient emotion="sick" blink={blinkAt(f, fps, 12)} arms={[70, 110]} look={{x: -0.8, y: 0}} /></Act></Boil></Slot>
      <OfficeDesk /></>)}
      <WordCaption word="WATER" key_ pop={pop} y={1600} /><Grain opacity={0.06} /></AbsoluteFill>);
  }
};

/**
 * 12 s acted scene (no voice yet): a pill drops into the gut, the stomach reacts.
 * Shows the acting toolkit: drop with squash on landing, reaction take, close-up cuts,
 * a jump with stretch and squash, a run-off, and one-word captions on the beat.
 */
export const ActingDemo: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const cl = (v: number, a: number, b: number) => Math.max(0, Math.min(1, (v - a) / (b - a)));
  const talk = (seed: number, on: boolean) => (on ? Math.max(0, Math.sin(t * 15 + seed)) * (Math.sin(t * 2.7 + seed) > -0.3 ? 1 : 0) : 0);
  const FLOOR = 1330;

  // --- pill: falls in (f20-40), lands with a squash, later runs off to the right (f285+)
  const fall = cl(f, 20, 40) ** 2;
  const land = f >= 40 ? Math.max(0, 1 - (f - 40) / 10) : 0;
  const run = cl(f, 285, 345);
  const pillX = 760 + run * 520;
  const pillFloor = -300 + fall * (FLOOR + 300);
  // --- stomach: take (jump back) when the pill lands, big jump at f258-285
  const take = f >= 42 ? Math.max(0, 1 - (f - 42) / 14) : 0;
  const jumpU = cl(f, 258, 272) - cl(f, 272, 285);
  const jumpSquash = f >= 285 ? Math.max(0, 1 - (f - 285) / 9) * 0.5 : -jumpU * 0.35;

  const shot = f < 90 ? 'wide' : f < 168 ? 'stomach' : f < 255 ? 'pill' : 'wide2';
  const local = shot === 'wide' ? f / 90 : shot === 'stomach' ? (f - 90) / 78 : shot === 'pill' ? (f - 168) / 87 : (f - 255) / 105;
  const cams: Record<string, [number, number, number]> = {wide: [1.03 + local * 0.04, 540, 960], stomach: [1.85 + local * 0.08, 300, 980], pill: [2.1 + local * 0.08, 770, 1150], wide2: [1.06 - local * 0.02, 540, 960]};
  const [zoom, cx, cy] = cams[shot];
  const stomachEmotion = f < 44 ? 'happy' : f < 90 ? 'shocked' : f < 255 ? 'angry' : 'angry';
  const pillEmotion = f < 168 ? 'neutral' : f < 255 ? 'smug' : f < 280 ? 'shocked' : 'scared';
  const words: [number, number, string, boolean][] = [[44, 88, 'HUH?', false], [96, 120, 'WHO', false], [120, 142, 'ARE', false], [142, 166, 'YOU?', true], [176, 210, 'RELAX', false], [212, 252, 'PILL', true], [262, 300, 'GET', false], [300, 356, 'OUT!', true]];
  const word = words.find(([a, b]) => f >= a && f < b);
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{transform: `translate(${540 - cx}px, ${960 - cy}px) scale(${zoom})`, transformOrigin: `${cx}px ${cy}px`}}>
        <GutSet t={t} />
        <Stand x={300 - take * 40} floor={FLOOR - jumpU * 240 - take * 30} size={640} frame={f}>
          <Stomach emotion={stomachEmotion} talk={talk(1, (f > 96 && f < 166) || f > 262)} blink={blinkAt(f, fps, 3)} arms={f > 258 ? [200 + Math.sin(t * 18) * 20, -30 + Math.sin(t * 18 + 1) * 20] : stomachEmotion === 'shocked' ? [215, -35] : [150, 40]} look={{x: 0.9, y: f < 44 ? -0.6 : 0.1}} squash={jumpSquash + take * 0.25} />
        </Stand>
        <Stand x={pillX} floor={pillFloor} size={430} feetY={70} frame={f}>
          <g transform={`rotate(${(1 - fall) * -50 + run * 8})`}>
            <Pill emotion={pillEmotion} talk={talk(2, f > 176 && f < 252)} blink={blinkAt(f, fps, 7)} arms={run > 0 ? [200 + Math.sin(t * 22) * 30, -20 + Math.sin(t * 22 + 2) * 30] : pillEmotion === 'smug' ? [120, 60] : [160, 20]} look={{x: run > 0 ? 0.9 : -0.9, y: 0}} squash={land * 0.9} step={run > 0 ? Math.sin(t * 24) : 0} />
          </g>
        </Stand>
        {/* landing dust puff */}
        {f >= 40 && f < 58 && [-1, 1].map((s) => (
          <div key={s} style={{position: 'absolute', left: 760 + s * (40 + (f - 40) * 7) - 30, top: FLOOR - 40 - (f - 40) * 2, width: 60, height: 44, borderRadius: 30, background: '#ffe9dc', border: `5px solid ${INK}`, opacity: 1 - (f - 40) / 18, transform: `scale(${1 + (f - 40) / 14})`}} />
        ))}
      </AbsoluteFill>
      {word && <WordCaption word={word[2]} key_={word[3]} pop={1 + Math.max(0, 0.3 - (f - word[0]) * 0.06)} y={1560} />}
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};
