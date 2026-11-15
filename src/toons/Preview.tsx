// Preview boards for approving the Toons look before any voice is made.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CAST, Pill, Poop, Stomach, Virus, WhiteCell, RedCell, Tooth, Bacteria, type CastName} from './characters';
import {PEOPLE, Doctor, Patient, Mom, type PersonName} from './humans';
import {blinkAt, EMOTIONS, INK} from './rig';
import {SETS, BloodSet, MouthSet, OfficeSet, StomachSet, ThroatSet, GutSet, WordCaption, type SetName} from './scenes';
import {theme} from '../brand/theme';

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

/** 18 s motion demo: six shots of 3 s in six sets. */
export const SceneDemo: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const shot = Math.floor(t / 3) % 6;
  const talk = (seed: number) => Math.max(0, Math.sin(t * 14 + seed)) * (Math.sin(t * 2.3 + seed) > -0.2 ? 1 : 0);
  const bob = Math.sin(t * 3) * 10;
  const local = (t % 3) / 3;
  const pop = 1 + Math.max(0, 0.25 - local * 2);
  switch (shot) {
    case 0: return (
      <AbsoluteFill><MouthSet t={t} />
        <Slot x={540} y={1120 + bob} size={480}><Tooth emotion="scared" talk={talk(0)} blink={blinkAt(f, fps, 1)} arms={[200, -30 + Math.sin(t * 9) * 25]} look={{x: 0.6, y: -0.4}} /></Slot>
        <Slot x={830} y={980 - bob} size={300}><Bacteria t={t} emotion="smug" blink={blinkAt(f, fps, 2)} arms={[160, 40]} look={{x: -0.8, y: 0.2}} /></Slot>
        <WordCaption word="CAVITY" key_ pop={pop} /></AbsoluteFill>);
    case 1: return (
      <AbsoluteFill><ThroatSet t={t} />
        <Slot x={540 + Math.sin(t * 6) * 6} y={760 + bob} size={520}><g transform="rotate(-14)"><Pill emotion="scared" talk={talk(1)} blink={blinkAt(f, fps, 3)} arms={[200, -20 + Math.sin(t * 9) * 25]} look={{x: 0, y: 0.6}} noLegs /></g></Slot>
        <WordCaption word="STUCK" key_ pop={pop} /></AbsoluteFill>);
    case 2: return (
      <AbsoluteFill><StomachSet t={t} />
        <Slot x={540} y={900 + bob} size={560}><Stomach emotion="angry" talk={talk(2)} blink={blinkAt(f, fps, 4)} arms={[200, 230]} look={{x: 0, y: 0.5}} /></Slot>
        <WordCaption word="ACID" pop={pop} /></AbsoluteFill>);
    case 3: return (
      <AbsoluteFill><GutSet t={t} />
        <Slot x={380} y={1080 + bob} size={460}><Poop emotion="smug" talk={talk(3)} blink={blinkAt(f, fps, 5)} arms={[140, 60]} look={{x: 0.8, y: 0}} /></Slot>
        <Slot x={760} y={860 - bob} size={360}><Stomach emotion="shocked" blink={blinkAt(f, fps, 6)} arms={[200, 230]} look={{x: -0.8, y: 0.3}} step={Math.sin(t * 8)} /></Slot>
        <WordCaption word="MOVE" pop={pop} /></AbsoluteFill>);
    case 4: return (
      <AbsoluteFill><BloodSet t={t} />
        <Slot x={360} y={980 + bob} size={460}><WhiteCell t={t} emotion="angry" talk={talk(4)} blink={blinkAt(f, fps, 7)} arms={[170, -40 + Math.sin(t * 10) * 20]} look={{x: 0.8, y: 0}} step={Math.sin(t * 8)} /></Slot>
        <Slot x={780} y={820 - bob} size={340}><Virus t={t} emotion="scared" blink={blinkAt(f, fps, 8)} arms={[150, 20]} look={{x: -0.8, y: 0}} /></Slot>
        <Slot x={760} y={1180} size={220}><RedCell emotion="shocked" blink={blinkAt(f, fps, 9)} arms={[200, -20]} look={{x: -0.6, y: -0.4}} /></Slot>
        <WordCaption word="ATTACK" key_ pop={pop} /></AbsoluteFill>);
    default: return (
      <AbsoluteFill><OfficeSet t={t} />
        <Slot x={300} y={1060} size={760}><Doctor emotion="happy" talk={talk(5)} blink={blinkAt(f, fps, 10)} arms={[120, -40 + Math.sin(t * 4) * 15]} look={{x: 0.7, y: 0}} /></Slot>
        <Slot x={700} y={1110} size={640}><Mom emotion="scared" blink={blinkAt(f, fps, 11)} arms={[110, 70]} look={{x: -0.7, y: 0}} /></Slot>
        <Slot x={900} y={1180} size={520}><Patient emotion="sick" blink={blinkAt(f, fps, 12)} arms={[110, 70]} look={{x: -0.7, y: 0}} /></Slot>
        <WordCaption word="WATER" key_ pop={pop} /></AbsoluteFill>);
  }
};
