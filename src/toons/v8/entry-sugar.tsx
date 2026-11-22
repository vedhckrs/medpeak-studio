import React from 'react';
import {registerRoot, Still} from 'remotion';
import {Board} from './kit';
import {Crop, Mini} from './sheets-v4';
import {SugarCastBoard} from './sugar-cast';
import {MomentLiverFull, MomentLiverHalf, MomentTongueDark, MomentTongueLit, MomentTooth} from './sugar-places';
import {MomentHook, MomentScaleDay30, MomentZero} from './sugar-kitchen';

const K = 0.4; // 1080 x 1920 -> 432 x 768
const SugarPlaceBoard: React.FC = () => (
  <Board
    kicker="Quit sugar · new places · sheet 2"
    title="Inside the mouth, and inside the liver"
    note="Microscopic, in depth planes. The mouth: the tooth's enamel wall over the gum, sugar crystals stuck at the gum line, and the tongue's surface with its taste buds (the mushroom-shaped bumps; they light up yellow when sweet tastes stronger). The liver: a honeycomb of liver cells, each with round yellow fat drops; on Day 10 the drops are about half the size."
    page="quit sugar · places"
  >
    <Mini x={56} y={240} k={K} label="C · DAY 7: TOOTH, BOUNCER"><MomentTooth /></Mini>
    <Mini x={56 + 452} y={240} k={K} label="D · DAY 1: LIVER FAT"><MomentLiverFull /></Mini>
    <Mini x={56 + 904} y={240} k={K} label="D · DAY 10: NEARLY HALVED"><MomentLiverHalf /></Mini>
    <Mini x={56 + 1356} y={240} k={K} label="G · MONTH 3: SWEETER"><MomentTongueLit /></Mini>
  </Board>
);
const SugarPlaceBoard2: React.FC = () => (
  <Board
    kicker="Quit sugar · new places · sheet 2b"
    title="Closer: the gum line, the fat drops, the taste buds"
    note="Crops at video size. Day 30 the taste buds are still dark ('not yet'); in month three they light up ('forty percent sweeter')."
    page="quit sugar · places, close"
  >
    <Crop x={56} y={240} w={420} h={760} fx={200} fy={900} zoom={0.75} label="SUGAR AT THE GUM LINE"><MomentTooth /></Crop>
    <Crop x={506} y={240} w={420} h={760} fx={300} fy={60} zoom={0.75} label="FAT DROPS, DAY 1"><MomentLiverFull /></Crop>
    <Crop x={956} y={240} w={420} h={760} fx={300} fy={60} zoom={0.75} label="FAT DROPS, DAY 10"><MomentLiverHalf /></Crop>
    <Mini x={1420} y={240} k={K} label="G · DAY 30: NOT YET"><MomentTongueDark /></Mini>
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
    <Crop x={40} y={660} w={440} h={400} fx={540} fy={480} zoom={1} label="TOOTH"><MomentTooth /></Crop>
    <Crop x={510} y={660} w={440} h={400} fx={60} fy={900} zoom={1} label="JUICE"><MomentTooth /></Crop>
    <Crop x={980} y={660} w={440} h={400} fx={320} fy={880} zoom={1} label="LIVER"><MomentLiverHalf /></Crop>
    <Crop x={1450} y={660} w={430} h={400} fx={320} fy={560} zoom={1} label="TONGUE"><MomentTongueLit /></Crop>
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
