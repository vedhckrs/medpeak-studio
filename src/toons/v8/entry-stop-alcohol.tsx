import React from 'react';
import {registerRoot, Still} from 'remotion';
import {Board} from './kit';
import {Mini} from './sheets-v4';
import {BoozeSheet, MomentBack, MomentClinic, MomentHook, MomentMorning, MomentTwist} from './stop-alcohol-art';

const K = 0.4;
const AlcoholPlaces1: React.FC = () => (
  <Board kicker="Stop drinking · engine v9 · sheet 1" title="Inside the liver: the night, the next morning, the twist"
    note="The whole Liver fills the frame (the full-organ rule) on ONE flat colour that tells the time: dusky indigo at night, a warm sunrise the next morning; the framing holds. Hook A: Booze splashes down and grins at us, amber puddles everywhere, more drops falling, the tired Liver mopping. The next morning: the puddles gone, the Liver bright, Booze shrunk in the corner (NHS: more rested, better in the mornings). Grandpa's 'all at once': the Liver drops the mop."
    page="stop drinking · liver">
    <Mini x={56} y={240} k={K} label="A1 · HOOK: DRINK NUMBER FOUR!"><MomentHook /></Mini>
    <Mini x={56 + 452} y={240} k={K} label="A4 · BACK BY FRIDAY"><MomentBack /></Mini>
    <Mini x={56 + 904} y={240} k={K} label="B · THE NEXT MORNING"><MomentMorning /></Mini>
    <Mini x={56 + 1356} y={240} k={K} label="C · NOT LIKE THAT!"><MomentTwist /></Mini>
  </Board>
);
const AlcoholPlaces2: React.FC = () => (
  <Board kicker="Stop drinking · engine v9 · sheet 2" title="Booze, the new intruder, and the clinic"
    note="Booze: a round amber drink drop with a white foam cap, bubbles inside, tiny arms; smug, then shrinking once the drinks stop. A cartoon pest, never a person; no one is shown drunk. The clinic: a cream wall (new for this video), Grandpa, Dad and the new doctor."
    page="stop drinking · booze and clinic">
    <Mini x={500} y={240} k={K} label="BOOZE · FOUR MOODS"><BoozeSheet /></Mini>
    <Mini x={500 + 452} y={240} k={K} label="D · THE CLINIC"><MomentClinic /></Mini>
  </Board>
);
registerRoot(() => (
  <>
    <Still id="AlcoholPlaces1" component={AlcoholPlaces1} width={1920} height={1080} />
    <Still id="AlcoholPlaces2" component={AlcoholPlaces2} width={1920} height={1080} />
  </>
));
