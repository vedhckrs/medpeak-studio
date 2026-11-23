import React from 'react';
import {registerRoot, Still} from 'remotion';
import {Board} from './kit';
import {Mini} from './sheets-v4';
import {MomentClinic, MomentCoHalf, MomentCoSeats, MomentCrewUp, MomentEasier, MomentHook} from './quit-smoking-art';

const K = 0.4;
const SmokePlaces1: React.FC = () => (
  <Board kicker="Quit smoking · engine v9 pilot · sheet 1" title="Inside the chest: the hook, the crew wakes, three days later"
    note="The whole chest is the stage (lungs, windpipe and bronchi, heart, ribs, diaphragm), one warm flesh family, held in ONE framing the whole video. Hook B: the lungs grey and tarry, coughing, the cilia crew asleep under the tar. Then Sweep and his crew stand up. After the 3 DAYS LATER card, the same framing: pinker, less tar, the airways open, the crew sweeping the mucus up and out."
    page="quit smoking · chest">
    <Mini x={56} y={240} k={K} label="B1 · HOOK: HE QUIT?!"><MomentHook /></Mini>
    <Mini x={56 + 452} y={240} k={K} label="B2 · CREW, WAKE UP!"><MomentCrewUp /></Mini>
    <Mini x={56 + 904} y={240} k={K} label="D · 3 DAYS LATER"><MomentEasier /></Mini>
    <Mini x={56 + 1356} y={240} k={K} label="E · DR. MIRA'S ANSWER"><MomentClinic /></Mini>
  </Board>
);
const SmokePlaces2: React.FC = () => (
  <Board kicker="Quit smoking · engine v9 pilot · sheet 2" title="Inside a blood vessel: the carbon monoxide gang, then 8 hours later"
    note="The CO gang (grey eggs with a CO band) lounge on the red cells like seats. After the 8 HOURS LATER card, the same framing: half of them are gone and the cells are redder (NHS: after 8 hours carbon monoxide in the blood is halved)."
    page="quit smoking · vessel">
    <Mini x={400} y={240} k={K} label="C1 · THESE SEATS ARE OURS"><MomentCoSeats /></Mini>
    <Mini x={400 + 690} y={240} k={K} label="C3 · 8 HOURS LATER: HALF GONE"><MomentCoHalf /></Mini>
  </Board>
);
registerRoot(() => (
  <>
    <Still id="SmokePlaces1" component={SmokePlaces1} width={1920} height={1080} />
    <Still id="SmokePlaces2" component={SmokePlaces2} width={1920} height={1080} />
  </>
));
