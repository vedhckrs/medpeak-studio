import React from 'react';
import {registerRoot, Still} from 'remotion';
import {Board} from './kit';
import {Crop, Mini} from './sheets-v4';
import {SugarCastBoard} from './sugar-cast';
import {MomentBrainDay3} from './sugar-organs';
import {MomentLiverDay1 as MomentLiverFull, MomentLiverDay10 as MomentLiverHalf, MomentTongueDarkFull as MomentTongueDark, MomentTongueLitFull as MomentTongueLit, MomentToothFull as MomentTooth} from './sugar-organs';
import {MomentHook, MomentScaleDay30, MomentZero} from './sugar-kitchen';

const K = 0.4; // 1080 x 1920 -> 432 x 768
const SugarPlaceBoard: React.FC = () => (
  <Board
    kicker="Quit sugar · new places · sheet 2"
    title="The whole mouth, and the whole liver"
    note="Like the reference videos: the organ is the stage. The whole organ fills the frame and its face is on its own wall. The mouth: lips round the edges, the palate and uvula, the teeth on the gum, the tongue in front; on Day 7 one big front tooth has the face, sugar crystals stuck at the gum line. The liver: the whole organ under the diaphragm, the gut below; Day 1 it is pale with yellow fat patches, Day 10 the patches are about half the size and its colour comes back."
    page="quit sugar · places"
  >
    <Mini x={56} y={240} k={K} label="C · DAY 7: THE FRONT TOOTH"><MomentTooth /></Mini>
    <Mini x={56 + 452} y={240} k={K} label="D · DAY 1: LIVER FAT"><MomentLiverFull /></Mini>
    <Mini x={56 + 904} y={240} k={K} label="D · DAY 10: NEARLY HALVED"><MomentLiverHalf /></Mini>
    <Mini x={56 + 1356} y={240} k={K} label="G · MONTH 3: SWEETER"><MomentTongueLit /></Mini>
  </Board>
);
const SugarPlaceBoard2: React.FC = () => (
  <Board
    kicker="Quit sugar · new places · sheet 2b"
    title="Closer: the tooth, the fat patches, the tongue"
    note="Crops at video size. Day 30 the taste buds are still dark ('not yet'); in month three they light up ('forty percent sweeter')."
    page="quit sugar · places, close"
  >
    <Crop x={56} y={240} w={420} h={760} fx={180} fy={300} zoom={0.75} label="TOOTH AND THE SUGAR"><MomentTooth /></Crop>
    <Crop x={506} y={240} w={420} h={760} fx={300} fy={420} zoom={0.75} label="FAT PATCHES, DAY 1"><MomentLiverFull /></Crop>
    <Crop x={956} y={240} w={420} h={760} fx={300} fy={420} zoom={0.75} label="FAT PATCHES, DAY 10"><MomentLiverHalf /></Crop>
    <Mini x={1420} y={240} k={K} label="B · DAY 3: THE BRAIN"><MomentBrainDay3 /></Mini>
  </Board>
);
const SugarKitchenBoard: React.FC = () => (
  <Board
    kicker="Quit sugar · new room · sheet 3"
    title="Dad's kitchen at night, and the 30-day calendar"
    note="Not the rabies kitchen: deep blue-green walls, the moon in the window, and one warm light, the open fridge, laid on the floor as a flat pale shape. The wall calendar counts the days (NO SUGAR · DAY 1 to 30); Dad rips a page at each round. The bin and the bathroom scale wait on the right."
    page="quit sugar · kitchen"
  >
    <Mini x={56} y={200} k={0.44} label="A · DAY 1: THE HOOK"><MomentHook /></Mini>
    <Mini x={56 + 495} y={200} k={0.44} label="E · DAY 20: ZERO SUGAR?"><MomentZero /></Mini>
    <Mini x={56 + 990} y={200} k={0.44} label="F · DAY 30: THE SCALE"><MomentScaleDay30 /></Mini>
    <Crop x={1536} y={200} w={330} h={400} fx={180} fy={420} zoom={0.62} label="DAD'S FACE"><MomentHook /></Crop>
    <Crop x={1536} y={645} w={330} h={400} fx={560} fy={140} zoom={0.62} label="THE CALENDAR"><MomentZero /></Crop>
  </Board>
);

// a close check of faces and hands at video size (for me, not a sheet for the owner)
const SugarCheck: React.FC = () => (
  <Board kicker="check" title="faces and hands, close" page="check">
    <Crop x={40} y={200} w={440} h={420} fx={250} fy={1080} zoom={1} label="SWEETIE HOOK"><MomentHook /></Crop>
    <Crop x={510} y={200} w={440} h={420} fx={100} fy={380} zoom={1} label="DAD HOOK"><MomentHook /></Crop>
    <Crop x={980} y={200} w={440} h={420} fx={100} fy={380} zoom={1} label="DAD DAY 20"><MomentZero /></Crop>
    <Crop x={1450} y={200} w={430} h={420} fx={640} fy={760} zoom={1} label="ZERO"><MomentZero /></Crop>
    <Crop x={40} y={660} w={440} h={400} fx={110} fy={530} zoom={1} label="TOOTH"><MomentTooth /></Crop>
    <Crop x={510} y={660} w={440} h={400} fx={600} fy={1220} zoom={1} label="JUICE"><MomentTooth /></Crop>
    <Crop x={980} y={660} w={440} h={400} fx={100} fy={590} zoom={1} label="LIVER"><MomentLiverHalf /></Crop>
    <Crop x={1450} y={660} w={430} h={400} fx={320} fy={1130} zoom={1} label="TONGUE"><MomentTongueLit /></Crop>
  </Board>
);

registerRoot(() => (
  <>
    <Still id="SugarCast" component={SugarCastBoard} width={1920} height={1080} />
    <Still id="SugarPlace" component={SugarPlaceBoard} width={1920} height={1080} />
    <Still id="SugarPlace2" component={SugarPlaceBoard2} width={1920} height={1080} />
    <Still id="SugarCheck" component={SugarCheck} width={1920} height={1080} />
    <Still id="SugarKitchen" component={SugarKitchenBoard} width={1920} height={1080} />
  </>
));
