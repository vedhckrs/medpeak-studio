import React from 'react';
import {registerRoot, Still} from 'remotion';
import {Board} from './kit';
import {Put} from './scene';
import {Virus} from './germs';
import {Antibody, WhiteCell} from './cells';
import {BattlePlace, BitePlace, DOOR, DoorPlace, HighwayPlace, MusclePlace} from './micro3';
import {Crop, Mini} from './sheets-v4';

// the same characters and moments as the approved v3 places (entry-micro3.tsx)
const Bite: React.FC = () => (<><BitePlace t={1.3} fang={1} drops={1} /><Put x={560} y={860} size={190} rot={-8}><Virus mood="happy" mouth="big" look={[0.3, 0.8]} /></Put></>);
const Muscle: React.FC = () => (
  <>
    <MusclePlace t={1.1} />
    <Put x={540} y={820} size={300}><Virus mood="happy" mouth="big" look={[0.6, 0.2]} /></Put>
    {[[300, 760, -20], [780, 740, 15], [680, 980, 30]].map(([x, y, r], i) => <Put key={i} x={x} y={y} size={150} rot={r}><Virus mood="wink" mouth="smile" look={[-0.4, 0]} /></Put>)}
  </>
);
const Door: React.FC = () => (<><DoorPlace t={1.6} open={2} /><Put x={DOOR.locks[2] - 10} y={DOOR.lockY - 200} size={230} rot={-6}><Virus mood="angry" mouth="grit" look={[0, 0.9]} /></Put></>);
const Highway: React.FC = () => (<><HighwayPlace t={1.2} /><Put x={540} y={1330} size={380} rot={4}><Virus mood="happy" mouth="big" look={[0, -0.8]} /></Put></>);
const Battle: React.FC = () => (
  <>
    <BattlePlace t={1.4} />
    <Put x={730} y={560} size={230} rot={12}><Virus mood="scared" mouth="wavy" look={[-0.3, 0.4]} /></Put>
    {[[560, 470], [900, 470], [600, 690], [880, 700], [730, 380]].map(([x, y], i) => <Put key={i} x={x} y={y} size={130} rot={(i - 2) * 30}><Antibody mood="angry" mouth="grit" look={[(730 - x) / 200, (560 - y) / 200]} /></Put>)}
    <Put x={860} y={1000} size={380}><WhiteCell mood="angry" mouth="grit" look={[-0.4, -0.7]} /></Put>
  </>
);

const K = 0.44; // 1080 x 1920 -> 475 x 845
const NOTE = 'All five places redrawn with more detail: more depth layers, cells with nuclei and organelles, textured fibres, flat light and shade bands, more small life. Characters stand where they stood in v3.';
const Micro1: React.FC = () => (
  <Board kicker="Rabies v4 · look sheet 1 of 2" title="The micro world, more detail: the bite, the muscle, the door" note={NOTE} page="v4 micro 1">
    <Mini x={56} y={200} k={K} label="1 · THE BITE"><Bite /></Mini>
    <Mini x={56 + 495} y={200} k={K} label="2 · THE MUSCLE"><Muscle /></Mini>
    <Mini x={56 + 990} y={200} k={K} label="3 · THE DOOR (NERVE ENDING)"><Door /></Mini>
    <Crop x={1530} y={200} w={340} h={400} fx={60} fy={250} zoom={0.85} label="SKIN LAYERS, 2x"><Bite /></Crop>
    <Crop x={1530} y={645} w={340} h={400} fx={380} fy={1020} zoom={0.85} label="NERVE ENDING, 2x"><Door /></Crop>
  </Board>
);
const Micro2: React.FC = () => (
  <Board kicker="Rabies v4 · look sheet 2 of 2" title="The micro world, more detail: the highway, the battle" note={NOTE} page="v4 micro 2">
    <Mini x={56} y={200} k={K} label="4 · THE HIGHWAY (INSIDE THE NERVE)"><Highway /></Mini>
    <Mini x={56 + 495} y={200} k={K} label="5 · THE BATTLE"><Battle /></Mini>
    <Crop x={1046} y={200} w={400} h={400} fx={20} fy={20} zoom={0.9} label="WALL CELLS, 2x"><Battle /></Crop>
    <Crop x={1476} y={200} w={400} h={400} fx={0} fy={1000} zoom={0.9} label="DEFENCE CELL FACTORY, 2x"><Battle /></Crop>
    <Crop x={1046} y={645} w={400} h={400} fx={60} fy={300} zoom={0.9} label="MUSCLE FIBRE, 2x"><Muscle /></Crop>
    <Crop x={1476} y={645} w={400} h={400} fx={600} fy={200} zoom={0.9} label="MYELIN WALL, 2x"><Highway /></Crop>
  </Board>
);

registerRoot(() => (
  <>
    <Still id="V4Micro1" component={Micro1} width={1920} height={1080} />
    <Still id="V4Micro2" component={Micro2} width={1920} height={1080} />
  </>
));
