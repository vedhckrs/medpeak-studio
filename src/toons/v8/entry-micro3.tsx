import React from 'react';
import {registerRoot, Still} from 'remotion';
import {Put} from './scene';
import {Virus} from './germs';
import {Antibody, WhiteCell} from './cells';
import {BattlePlace, BitePlace, DOOR, DoorPlace, HighwayPlace, MusclePlace} from './micro3';

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

registerRoot(() => (
  <>
    <Still id="M3Bite" component={Bite} width={1080} height={1920} />
    <Still id="M3Muscle" component={Muscle} width={1080} height={1920} />
    <Still id="M3Door" component={Door} width={1080} height={1920} />
    <Still id="M3Highway" component={Highway} width={1080} height={1920} />
    <Still id="M3Battle" component={Battle} width={1080} height={1920} />
  </>
));
