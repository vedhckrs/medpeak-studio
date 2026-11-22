/**
 * Engine v9: the 12-second MOTION TEST for the owner (05-blueprint.md Part 7, phase 4), redone by the integration on agent
 * B's CHEST stage (anatomy.tsx STAGES.chest) with the whole v9 look on (<V9>: oval turned eyes with a continuous blink lid,
 * rim pupils that look at each other, outlined arms, the soft stubble; the v9 watermark). Silent, 1080 x 1920, 60 fps.
 * It uses only the shared motion kit (act.tsx: Dive, keyed, latched) and the one time card (hud.tsx TimeCard). The camera
 * never moves inside the body: one framing, held; things come INTO the held frame.
 *
 *   0.0-0.8 s   the person: Dad in the night kitchen, a cigarette in his hand; he looks down at his chest
 *   0.8-1.7 s   the shared Dive (0.9 s, even on a log scale, no frame zooms more than 6%) into his chest
 *   1.7-2.6 s   hold: both lungs in their place (windpipe, bronchi, heart, ribs, diaphragm, liver), blinking, looking at each other
 *   2.6-3.2 s   ONE action: the big cigarette (the intruder) slides in from the right and holds; both lungs look at it
 *   3.2-5.0 s   hold (the faces react once: shock, then a squint)
 *   5.0-5.6 s   ONE action: the cough (one squeeze of both lungs), then a hold
 *   7.0-8.0 s   the TIME CARD "3 DAYS LATER" (hard cut in and out, 1.0 s)
 *   8.0-12.0 s  the SAME framing, the state changed: no cigarette, less tar, pinker, airways wider; at 9.4 s ONE action: the
 *               cilia stand up and sweep the mucus out (0.5 s), the right lung raises a hand in close ("phew"), then it holds to the end
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Dive, keyed, latched} from './act';
import {STAGES, type StageFace} from './anatomy';
import {V9} from './kit';
import {Put, Scene} from './scene';
import {FEET_Y, PEOPLE_SCALE} from './scenes-rooms';
import {headAt, handAt, PersonAt} from './people-rig';
import {DAD_HOME, NIGHT, NightKitchen} from './sugar-kitchen';
import {Cigarette, CigaretteHero, Intruder} from './props';
import {blinkLid, V8_FPS} from './play';
import {TimeCard, WatermarkV9} from './hud';
import type {ArmPose} from './organ-act';

export const MOTION9 = {seconds: 12, dive: 0.8, smoke: 2.6, cough: 5.0, card: [7.0, 8.0] as [number, number], sweep: 9.4};
const dad = {view: 'three-quarter' as const, facing: 'right' as const, x: 420, y: FEET_Y - 22, scale: PEOPLE_SCALE};
/** Where the dive goes in: the middle of his chest (between the chin and the belly). */
const chest = (): [number, number] => { const h = headAt(DAD_HOME, {...dad, pose: 'offer'}); return [h.x + h.r * 0.15, h.y + h.r * 1.9]; };
const F = STAGES.chest.faces;
/** The intruder's resting place: low on the right, clear of both faces and of the caption band (1290-1470). */
const CIG_AT: [number, number] = [790, 1080];

const Kitchen: React.FC<{t: number}> = ({t}) => {
  const hand = handAt(DAD_HOME, {...dad, pose: 'offer'}).L;
  return (
    <Scene bg={NIGHT.wall}>
      <NightKitchen open day={1} calendar={false} />
      <Put x={hand.palm[0] + 14} y={hand.palm[1] - 30} size={210} rot={-20} kind="prop"><Cigarette /></Put>
      <PersonAt spec={DAD_HOME} {...dad} pose="offer" expr={t < 0.3 ? 'neutral' : 'worried'} look={t < 0.3 ? [0.7, -0.1] : [0.2, 0.9]} blink={blinkLid(t, 1)} />
    </Scene>
  );
};

/** The right lung's one gesture: a hand raised in close to its side (a relieved "phew"), kept inside the frame (an 'up' fist went out at the edge). */
const arm = (k: number): ArmPose => (k <= 0 ? {a: 'rest'} : k >= 1 ? {a: 'cheek'} : {a: 'rest', b: 'cheek', k});

/** The chest stage at time t of the test, in pass 1 (before the card) or pass 2 (after it). */
const Chest: React.FC<{t: number; pass: 1 | 2}> = ({t, pass}) => {
  const M = MOTION9;
  const S = STAGES.chest.Stage;
  if (pass === 1) {
    const sees = latched(t, (u) => (u >= M.smoke + 0.2 ? 1 : 0)); // the eyes go to the cigarette once, and stay
    const cough = keyed(t, 0, [[M.cough, 1, 0.2, 'out'], [M.cough + 0.25, 0, 0.35]]);
    const lungR: StageFace = {mood: t < M.smoke + 0.2 ? 'open' : t < M.cough ? 'shock' : 'squint', mouth: t > M.smoke + 0.2 && t < M.cough + 0.6 ? 'o' : 'flat',
      lookAt: sees ? CIG_AT : [F.lungL.x, F.lungL.y], lid: blinkLid(t, 2)};
    const lungL: StageFace = {mood: t < M.smoke + 0.2 ? 'open' : t < M.cough ? 'shock' : 'pain', mouth: t > M.smoke + 0.2 ? 'frown' : 'flat',
      lookAt: sees ? CIG_AT : [F.lungR.x, F.lungR.y], lid: blinkLid(t, 3)};
    return (
      <S t={t} state={{tar: 0.8, pink: 0.1, airway: 0.5, mucus: 0.6, cilia: 0.15, cough}} faces={{lungR, lungL}}>
        <Intruder from="right" at={CIG_AT} t={t} t0={M.smoke} dur={0.6} height={0.42} rot={-28}><CigaretteHero t={t} /></Intruder>
      </S>
    );
  }
  // the one action after the card: the cilia wake and sweep the mucus out (0.5 s), the right lung lifts an arm, then a hold
  const sweep = keyed(t, 0, [[M.sweep, 1, 0.5, 'out']]);
  const lungR: StageFace = {mood: sweep > 0.5 ? 'happy' : 'open', mouth: 'smile', lookAt: [F.lungL.x, F.lungL.y], lid: blinkLid(t, 2), armR: arm(keyed(t, 0, [[M.sweep + 0.1, 1, 0.45, 'back']]))};
  const lungL: StageFace = {mood: 'open', mouth: sweep > 0.5 ? 'smile' : 'flat', lookAt: [F.lungR.x, F.lungR.y], lid: blinkLid(t, 3)};
  return <S t={t} state={{tar: 0.45, pink: 0.55, airway: 0.8, mucus: 0.55 * (1 - sweep), cilia: 0.35 + 0.65 * sweep}} faces={{lungR, lungL}} />;
};

export const Motion9: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / V8_FPS;
  const M = MOTION9;
  const [c0, c1] = M.card;
  return (
    <V9>
      <AbsoluteFill style={{background: '#000000'}}>
        {t < c0 ? (
          <Dive t={t} t0={M.dive} dur={0.9} at={chest()} zTo={10} outside={<Kitchen t={t} />} inside={<Chest t={t} pass={1} />} skin={DAD_HOME.skin} />
        ) : t < c1 ? (
          <TimeCard text="3 days later" t={t - c0} />
        ) : (
          <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}><Chest t={t} pass={2} /></div>
        )}
        <WatermarkV9 act={0} t={t} />
      </AbsoluteFill>
    </V9>
  );
};
