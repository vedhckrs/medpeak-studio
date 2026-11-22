/**
 * Engine v9, phase 4: the 12-second MOTION TEST for the owner (05-blueprint.md Part 7, phase 4). Silent, 1080 x 1920, 60 fps.
 * It uses only the new motion kit (act.tsx: Dive, enter, fill, latched, onKey-style gesture blends) and the time card
 * (time-card.tsx) on the existing whole-stomach stage (StomachFull in fast-art.tsx), because the new chest stage (agent B,
 * anatomy.tsx) is not in this branch yet. The camera never moves inside the body: one framing, held.
 *
 *   0.0-0.8 s   the person: Dad in the night kitchen, a burger in his hand; he looks down at his belly
 *   0.8-1.7 s   the shared Dive (0.9 s, even on a log scale, no frame zooms more than 6%) into his belly
 *   1.7-2.6 s   hold: the stomach, framed once, blinking
 *   2.6-3.1 s   ONE action: the burger slides in from the top (enter, ease-out, 3% overshoot), the stomach looks up at it
 *   3.1-5.0 s   hold (the face reacts once: eyes wide, then happy)
 *   5.0-5.4 s   ONE action: the stomach raises a fist (a gesture blend, no snap), then holds
 *   7.0-8.0 s   the TIME CARD "3 HOURS LATER" (hard cut in and out, 1.0 s)
 *   8.0-12.0 s  the SAME framing, the state changed: the burger is gone, the stomach calm; at 9.4 s ONE action: the hunger wave
 *               rumbles (fill 0.3 s, then it dies away), strain lines by its face, its eyes go wide, then it holds to the end
 */
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Dive, enter, fill, keyed, latched, Marks} from './act';
import {StomachFull} from './fast-art';
import {Put, Scene} from './scene';
import {FEET_Y, PEOPLE_SCALE} from './scenes-rooms';
import {headAt, handAt, PersonAt} from './people-rig';
import {DAD_HOME, NIGHT, NightKitchen} from './sugar-kitchen';
import {Burger} from './props';
import {blink, V8_FPS} from './play';
import {TimeCard} from './time-card';
import {Watermark} from './hud';
import type {ArmPose} from './organ-act';

export const MOTION9 = {seconds: 12, dive: 0.8, burger: 2.6, fist: 5.0, card: [7.0, 8.0] as [number, number], wave: 9.4};
const dad = {view: 'three-quarter' as const, facing: 'right' as const, x: 420, y: FEET_Y - 22, scale: PEOPLE_SCALE};
const belly = (): [number, number] => { const h = headAt(DAD_HOME, {...dad, pose: 'rest'}); return [h.x + h.r * 0.1, h.y + h.r * 2.7]; };

const Kitchen: React.FC<{t: number}> = ({t}) => {
  const hand = handAt(DAD_HOME, {...dad, pose: 'offer'}).L;
  return (
    <Scene bg={NIGHT.wall}>
      <NightKitchen open day={1} />
      <Put x={hand.palm[0]} y={hand.palm[1] - 20} size={200}><Burger /></Put>
      <PersonAt spec={DAD_HOME} {...dad} pose="offer" expr={t < 0.25 ? 'happy' : 'surprised'} look={t < 0.25 ? [0.7, -0.1] : [0.2, 0.9]} blink={0} />
    </Scene>
  );
};

/** The stomach stage at time t of the test, in pass 1 (before the card) or pass 2 (after it). */
const Stomach: React.FC<{t: number; pass: 1 | 2}> = ({t, pass}) => {
  const M = MOTION9;
  if (pass === 1) {
    const b = enter(t, M.burger, 'top', 0.5, 1200);
    const sees = latched(t, (u) => (u >= M.burger + 0.15 ? 1 : 0)); // the eyes jump to the burger once, held
    const mood = t < M.burger + 0.15 ? 'open' : t < M.burger + 1.1 ? 'scared' : 'happy';
    const fist = keyed(t, 0, [[M.fist, 1, 0.35, 'out']]);
    const armR: ArmPose = fist <= 0 ? {a: 'rest'} : fist >= 1 ? {a: 'up'} : {a: 'rest', b: 'up', k: fist};
    const shut = blink(t, 2) > 0.5 && t > 1.9;
    return (
      <>
        <StomachFull t={t} mood={shut ? 'closed' : mood} mouth={t < M.burger + 1.1 && t > M.burger + 0.15 ? 'o' : 'smile'} look={sees ? [0.5, -0.8] : [-0.2, 0.3]} armR={armR} armL="rest" />
        {t >= M.burger - 0.05 && <Put x={360 + b.dx} y={1130 + b.dy} size={280} rot={-8}><Burger /></Put>}
      </>
    );
  }
  // the one action after the card: a hunger rumble rises (fill 0.3 s) and dies away, strain lines pop by the face, then a hold
  const w = fill(t, M.wave, 0.3) * (1 - fill(t, M.wave + 0.9, 0.5));
  const wide = t >= M.wave + 0.1;
  const shut = blink(t, 5) > 0.5 && !wide;
  return (
    <>
      <StomachFull t={t} growl={w} mood={shut ? 'closed' : wide ? 'scared' : 'sleepy'} mouth={wide ? 'o' : 'smile'} look={wide ? [0, 0.6] : [-0.2, 0.3]} armR="rest" armL="rest" />
      {t >= M.wave + 0.1 && t < M.wave + 1.6 && <Marks kind="lines" x={900} y={680} size={90} rot={30} />}
    </>
  );
};

export const Motion9: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / V8_FPS;
  const M = MOTION9;
  const [c0, c1] = M.card;
  return (
    <AbsoluteFill style={{background: '#000000'}}>
      {t < c0 ? (
        <Dive t={t} t0={M.dive} dur={0.9} at={belly()} zTo={10} outside={<Kitchen t={t} />} inside={<Stomach t={t} pass={1} />} skin={DAD_HOME.skin} />
      ) : t < c1 ? (
        <TimeCard text="3 HOURS LATER" t={t - c0} />
      ) : (
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}><Stomach t={t} pass={2} /></div>
      )}
      <Watermark act={0} t={t} />
    </AbsoluteFill>
  );
};
