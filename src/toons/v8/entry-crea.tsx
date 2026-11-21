import React from 'react';
import {registerRoot, Still} from 'remotion';
import {Board} from './kit';
import {CreaCastBoard} from './crea-cast';
import {MomentBlood, MomentCharge, MomentDrain, MomentFilter, MomentMuscle} from './crea-places';
import {Crop, Mini} from './sheets-v4';
import {MomentScale, MomentShaker} from './crea-gym';

const K = 0.4; // 1080 x 1920 -> 432 x 768
const CreaPlaceBoard: React.FC = () => (
  <Board
    kicker="Creatine · new places · sheet 2"
    title="Inside the body: the blood, a muscle cell, the kidney filter"
    note="Microscopic, in depth planes. Blood: the vessel forks ahead, grains ride with the red cells. Muscle cell: striped fibres squeeze in a lift, the batteries drain red, Crea's sparks refill them, water drifts in. Kidney filter: grey-blue creatinine chips pass the filter and run down the tube."
    page="creatine · places"
  >
    <Mini x={56} y={240} k={K} label="B · THE BLOOD"><MomentBlood /></Mini>
    <Mini x={56 + 452} y={240} k={K} label="C · THE LIFT: GOING FLAT"><MomentDrain /></Mini>
    <Mini x={56 + 904} y={240} k={K} label="C · RECHARGED, WATER IN"><MomentCharge /></Mini>
    <Mini x={56 + 1356} y={240} k={K} label="D · THE KIDNEY FILTER"><MomentFilter /></Mini>
  </Board>
);
const CreaPlaceBoard2: React.FC = () => (
  <Board
    kicker="Creatine · new places · sheet 2b"
    title="Closer: the muscle cell and the filter"
    note="Crops at video size. The stripes are the real bands of a muscle fibre; they squeeze together when it contracts. The chips are creatinine, the small waste a little creatine turns into."
    page="creatine · places, close"
  >
    <Mini x={56} y={240} k={K} label="C · MUSCLE SPEAKS"><MomentMuscle /></Mini>
    <Crop x={540} y={240} w={420} h={760} fx={180} fy={700} zoom={0.75} label="RECHARGING, CLOSER"><MomentCharge /></Crop>
    <Crop x={990} y={240} w={420} h={760} fx={0} fy={300} zoom={0.75} label="THE BATTERIES DRAINED"><MomentDrain /></Crop>
    <Crop x={1440} y={240} w={420} h={760} fx={360} fy={900} zoom={0.75} label="CREATININE IN THE TUBE"><MomentFilter /></Crop>
  </Board>
);

const CreaGymBoard: React.FC = () => (
  <Board
    kicker="Creatine · new room · sheet 3"
    title="The gym, and the scale that jumps"
    note="A room of its own (no other video has a gym), kept clean: slate wall, one yellow stripe, rubber floor, a weight rack. The hero prop is an upright scale with a big dial, so the needle slamming into the red reads on a phone. The lifter is Mom in gym clothes."
    page="creatine · gym"
  >
    <Mini x={56} y={200} k={0.44} label="A · THE HOOK: THE SCALE JUMPS"><MomentScale /></Mini>
    <Mini x={56 + 495} y={200} k={0.44} label="BEFORE: MOM AND HER SHAKER"><MomentShaker /></Mini>
    <Crop x={1046} y={200} w={400} h={400} fx={330} fy={560} zoom={0.62} label="THE DIAL AND CREA"><MomentScale /></Crop>
    <Crop x={1476} y={200} w={400} h={400} fx={160} fy={480} zoom={0.62} label="MOM, SURPRISED"><MomentScale /></Crop>
    <Crop x={1046} y={645} w={400} h={400} fx={300} fy={760} zoom={0.62} label="THE SHAKER IN HER HAND"><MomentShaker /></Crop>
    <Crop x={1476} y={645} w={400} h={400} fx={250} fy={1150} zoom={0.62} label="FEET ON THE PLATFORM"><MomentScale /></Crop>
  </Board>
);

registerRoot(() => (
  <>
    <Still id="CreaCast" component={CreaCastBoard} width={1920} height={1080} />
    <Still id="CreaPlace" component={CreaPlaceBoard} width={1920} height={1080} />
    <Still id="CreaPlace2" component={CreaPlaceBoard2} width={1920} height={1080} />
    <Still id="CreaGym" component={CreaGymBoard} width={1920} height={1080} />
  </>
));
