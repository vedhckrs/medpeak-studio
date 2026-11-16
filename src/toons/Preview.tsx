// Preview boards for approving the Toons look before any voice is made.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CAST, Pill, Poop, Stomach, Virus, WhiteCell, RedCell, Tooth, Bacteria, type CastName} from './characters';
import {PEOPLE, Doctor, Patient, Mom, type PersonName} from './humans';
import {blinkAt, EMOTIONS, INK} from './rig';
import {SETS, BloodSet, MouthSet, OfficeDesk, OfficeSet, StomachSet, ThroatSet, GutSet, WordCaption, type SetName} from './scenes';
import {theme} from '../brand/theme';
import {Boil, Grain} from './ink';

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
  const sway = Math.sin(t * 2.1 + seed) * 2.4;
  const breathe = 1 + Math.sin(t * 3.2 + seed) * 0.014;
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
