// Preview boards for approving the Toons look before any voice is made.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {CAST, Doctor, Patient, Pill, Poop, Stomach, type CastName} from './characters';
import {blinkAt, EMOTIONS, INK} from './rig';
import {GutSet, OfficeSet, ThroatSet, WordCaption} from './scenes';
import {theme} from '../brand/theme';

const Slot: React.FC<{x: number; y: number; size: number; children: React.ReactNode}> = ({x, y, size, children}) => (
  <svg style={{position: 'absolute', left: x - size / 2, top: y - size / 2, overflow: 'visible'}} width={size} height={size} viewBox="-100 -100 200 200">{children}</svg>
);

/** All 10 characters, each with a different emotion, arms out. */
export const CastBoard: React.FC = () => {
  const names = Object.keys(CAST) as CastName[];
  return (
    <AbsoluteFill style={{background: '#fff5ec', fontFamily: theme.font}}>
      <div style={{textAlign: 'center', fontSize: 64, fontWeight: 900, color: INK, marginTop: 50}}>MedPeak Toons · cast</div>
      {names.map((n, i) => {
        const C = CAST[n] as React.FC<Record<string, unknown>>;
        const x = 270 + (i % 2) * 540;
        const y = 330 + Math.floor(i / 2) * 340;
        return (
          <React.Fragment key={n}>
            <Slot x={x} y={y} size={260}><C emotion={EMOTIONS[i % EMOTIONS.length]} arms={[150, 30]} t={0.5} look={{x: i % 2 ? -0.6 : 0.6, y: 0}} /></Slot>
            <div style={{position: 'absolute', left: x - 200, width: 400, top: y + 135, textAlign: 'center', fontSize: 30, fontWeight: 800, color: INK}}>{n} · {EMOTIONS[i % EMOTIONS.length]}</div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/** One character in all 9 emotions. */
export const EmotionBoard: React.FC<{who?: CastName}> = ({who = 'stomach'}) => {
  const C = CAST[who] as React.FC<Record<string, unknown>>;
  return (
    <AbsoluteFill style={{background: '#fff5ec', fontFamily: theme.font}}>
      <div style={{textAlign: 'center', fontSize: 60, fontWeight: 900, color: INK, marginTop: 60}}>{who}: 9 emotions</div>
      {EMOTIONS.map((e, i) => {
        const x = 200 + (i % 3) * 340;
        const y = 420 + Math.floor(i / 3) * 520;
        return (
          <React.Fragment key={e}>
            <Slot x={x} y={y} size={300}><C emotion={e} arms={[160, 20]} /></Slot>
            <div style={{position: 'absolute', left: x - 150, width: 300, top: y + 170, textAlign: 'center', fontSize: 36, fontWeight: 800, color: INK}}>{e}</div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

/** Three sample shots, animated, to judge motion: throat (pill stuck), gut (poop vs stomach), office. */
export const SceneDemo: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const shot = Math.floor(t / 3) % 3;
  const talk = (seed: number) => Math.max(0, Math.sin(t * 14 + seed)) * (Math.sin(t * 2.3 + seed) > -0.2 ? 1 : 0);
  const bob = Math.sin(t * 3) * 10;
  if (shot === 0) {
    return (
      <AbsoluteFill>
        <ThroatSet t={t} />
        <Slot x={540 + Math.sin(t * 6) * 6} y={760 + bob} size={560}><g transform="rotate(-14)"><Pill emotion="scared" talk={talk(0)} blink={blinkAt(f, fps, 1)} arms={[200, -20 + Math.sin(t * 9) * 25]} look={{x: 0, y: 0.6}} /></g></Slot>
        <WordCaption word="STUCK" key_ />
      </AbsoluteFill>
    );
  }
  if (shot === 1) {
    return (
      <AbsoluteFill>
        <GutSet t={t} />
        <Slot x={360} y={1000 + bob} size={500}><Poop emotion="smug" talk={talk(1)} blink={blinkAt(f, fps, 2)} arms={[140, 60]} look={{x: 0.8, y: 0}} /></Slot>
        <Slot x={780} y={760 - bob} size={420}><Stomach emotion="angry" blink={blinkAt(f, fps, 3)} arms={[200, 230]} look={{x: -0.8, y: 0.3}} /></Slot>
        <WordCaption word="MOVE" />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill>
      <OfficeSet t={t} />
      <Slot x={320} y={1060} size={760}><Doctor emotion="happy" talk={talk(2)} blink={blinkAt(f, fps, 4)} arms={[120, -40 + Math.sin(t * 4) * 15]} look={{x: 0.7, y: 0}} /></Slot>
      <Slot x={790} y={1090} size={700}><Patient emotion="sick" blink={blinkAt(f, fps, 5)} arms={[110, 70]} look={{x: -0.7, y: 0}} /></Slot>
      <WordCaption word="WATER" key_ />
    </AbsoluteFill>
  );
};
