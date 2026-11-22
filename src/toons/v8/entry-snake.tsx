import React from 'react';
import {registerRoot, Still} from 'remotion';
import {Board} from './kit';
import {Crop, Mini} from './sheets-v4';
import {SnakeCastBoard} from './snake-cast';
import {MomentDrip, MomentMyths, MomentPunch, MomentSnakeHook, MomentSplit} from './snake-places';

const K = 0.4; // 1080 x 1920 -> 432 x 768
const SnakePlaceBoard: React.FC = () => (
  <Board
    kicker="Snake bite · new places · sheet 2"
    title="Inside the leg, the trail, the hospital"
    note="One colour per place. Inside the leg: deep red-brown tissue, the two fang holes as a big shaft of light from above, the nerve cable on the left, the blood river on the right; the tissue swells as Crush works. The trail: warm green day, a dirt path, big leaves, the rock with only the snake's tail slipping away. The hospital: pale blue, Sam in bed, the antivenom drip in his arm."
    page="snake bite · places"
  >
    <Mini x={56} y={240} k={K} label="A · THE HOOK: THE BITE"><MomentSnakeHook /></Mini>
    <Mini x={56 + 452} y={240} k={K} label="B · THE SPLIT"><MomentSplit /></Mini>
    <Mini x={56 + 904} y={240} k={K} label="C · THE MYTHS"><MomentMyths /></Mini>
    <Mini x={56 + 1356} y={240} k={K} label="D · THE DRIP"><MomentDrip /></Mini>
  </Board>
);

// a close check of faces and hands at video size (for me, not a sheet for the owner)
const SnakeCheck: React.FC = () => (
  <Board kicker="check" title="faces and hands, close" page="check">
    <Crop x={40} y={200} w={440} h={420} fx={540} fy={1440} zoom={1} label="NUMB HOOK"><MomentSnakeHook /></Crop>
    <Crop x={510} y={200} w={440} h={420} fx={300} fy={1000} zoom={1} label="BLEED HOOK"><MomentSnakeHook /></Crop>
    <Crop x={980} y={200} w={440} h={420} fx={330} fy={700} zoom={1} label="MOM"><MomentMyths /></Crop>
    <Crop x={1450} y={200} w={430} h={420} fx={800} fy={400} zoom={1} label="BUBBLE"><MomentMyths /></Crop>
    <Crop x={40} y={660} w={440} h={400} fx={480} fy={1000} zoom={1} label="SAM IN BED"><MomentDrip /></Crop>
    <Crop x={510} y={660} w={440} h={400} fx={780} fy={800} zoom={1} label="DRIP"><MomentDrip /></Crop>
    <Crop x={980} y={660} w={440} h={400} fx={560} fy={1140} zoom={1} label="PUNCH"><MomentPunch /></Crop>
    <Mini x={1450} y={650} k={0.21} label="PUNCH"><MomentPunch /></Mini>
  </Board>
);

registerRoot(() => (
  <>
    <Still id="SnakeCast" component={SnakeCastBoard} width={1920} height={1080} />
    <Still id="SnakePlace" component={SnakePlaceBoard} width={1920} height={1080} />
    <Still id="SnakeCheck" component={SnakeCheck} width={1920} height={1080} />
  </>
));
