import React from 'react';
import {registerRoot, Still} from 'remotion';
import {Board, Caption, Fig, Panel} from './kit';
import {Crop, Mini} from './sheets-v4';
import {Put, Scene} from './scene';
import {FEET_Y, PEOPLE_SCALE} from './scenes-rooms';
import {castById, PersonAt} from './people-rig';
import {Brain, Liver, Stomach} from './organs-a';
import {BrainFull, LiverFull} from './sugar-organs';
import {FAST_ROOM, FastRoom, Lardo, StomachFull, SugarJar} from './fast-art';

const GRANDPA = castById('grandpa');
/** A crop aimed at a CENTRE point of the frame (Crop itself takes the top-left), kept inside the frame. */
const CropAt: React.FC<{x: number; y: number; w: number; h: number; cx: number; cy: number; zoom: number; label?: string; children: React.ReactNode}> = ({cx, cy, ...p}) => {
  const vw = p.w / p.zoom, vh = p.h / p.zoom;
  const fx = Math.max(0, Math.min(1080 - vw, cx - vw / 2)), fy = Math.max(0, Math.min(1920 - vh, cy - vh / 2));
  return <Crop {...p} fx={fx} fy={fy} />;
};

// ------------------------------------------------------------------ the moments
/** A, 0 h, the hook: Grandpa pushes the plate away; his Stomach bursts on screen at the lens. */
export const MomentFastHook: React.FC = () => (
  <Scene bg={FAST_ROOM.wall}>
    <FastRoom hours={0} plate="away" />
    <PersonAt spec={GRANDPA} pose="point" view="three-quarter" facing="right" expr="happy" look={[0.6, 0.2]} x={560} y={FEET_Y - 22} scale={PEOPLE_SCALE} />
    <Put x={300} y={1500} size={640} rot={-8}><Stomach mood="angry" mouth="open" look={[0.5, -0.2]} /></Put>
  </Scene>
);
/** B, 4 h: the whole stomach growls. */
export const MomentStomach4h: React.FC = () => <StomachFull t={0.4} growl={1} mood="angry" mouth="big" look={[-0.3, 0.3]} />;
/** C, 12 h: the liver's sugar store runs dry. */
export const MomentLiver12h: React.FC = () => (
  <>
    <LiverFull t={1} fat={0} mood="scared" mouth="o" look={[0.8, 0.4]} />
    <Put x={840} y={1260} size={600}><g transform="translate(0 -6) scale(0.5)"><SugarJar store={0.04} /></g></Put>
  </>
);
/** D, 12 h, the switch: Lardo pops fuel drops; the liver is happy again. */
export const MomentSwitch: React.FC = () => (
  <>
    <LiverFull t={1} fat={0} mood="happy" mouth="big" look={[0.7, 0.5]} />
    <Put x={820} y={1330} size={420}><Lardo mood="happy" mouth="big" arms="up" drops={1} look={[-0.6, -0.3]} /></Put>
  </>
);
/** E, 16 h: breakfast. */
export const MomentFast16h: React.FC = () => (
  <Scene bg={FAST_ROOM.wall}>
    <FastRoom hours={16} plate="breakfast" lamp={false} />
    <PersonAt spec={GRANDPA} pose="thumbs" view="three-quarter" facing="right" expr="happy" look={[-0.2, 0]} x={560} y={FEET_Y - 22} scale={PEOPLE_SCALE} />
  </Scene>
);
/** G, the brain winks (best last). */
export const MomentBrainWink: React.FC = () => <BrainFull t={1} mood="wink" mouth="smile" look={[0.6, 0.3]} />;

// ------------------------------------------------------------------ the sheets
const FIG = 250;
const LardoBoard: React.FC = () => {
  const fy = 200 + 60 + FIG / 2;
  const looks: {el: React.ReactNode; name: string; note: string}[] = [
    {el: <Lardo mood="happy" mouth="smile" arms="hips" />, name: 'Lardo, full', note: 'a cosy, smug fat cell'},
    {el: <Lardo mood="wink" mouth="big" arms="up" drops={1} />, name: 'My turn!', note: '"Burning fat!" (fuel drops pop off)'},
    {el: <Lardo mood="open" mouth="flat" arms="out" look={[0.4, 0]} />, name: 'Calm, explaining', note: '"...about the same as just eating less."'},
    {el: <Lardo mood="bored" mouth="flat" arms="hips" size={0.6} />, name: 'A bit smaller', note: 'after the fast: one drop lighter'},
    {el: <Lardo mood="sad" mouth="frown" arms="down" look={[0, 0.5]} />, name: 'Sad', note: 'spare mood'},
  ];
  return (
    <Board
      kicker="Fasting · new cast · sheet 1"
      title="Lardo, the fat cell who takes over at hour twelve"
      note="A real fat cell is one big drop of fat with its nucleus squeezed to the edge, so Lardo is that: a butter-yellow cell, the glossy fat drop filling him (his face sits on it), a small purple nucleus at his side, rosy cheeks. When the sugar runs out he pops little fuel drops off his top. Same kit as the whole cast."
      page="fasting · cast"
    >
      <Panel x={56} y={200} w={1808} h={480} label="Lardo, his moods" />
      {looks.map((c, i) => {
        const x = 56 + 190 + i * 357;
        return (
          <React.Fragment key={c.name}>
            <Fig x={x} y={fy} size={FIG}>{c.el}</Fig>
            <Caption x={x} y={fy + FIG / 2 + 6} name={c.name} note={c.note} size={21} w={320} />
          </React.Fragment>
        );
      })}
      <Panel x={56} y={712} w={1808} h={330} label="With the cast in this video (they exist), all at the same size" />
      {[
        {el: <Lardo mood="happy" mouth="smile" />, name: 'Lardo', note: 'new'},
        {el: <Stomach mood="angry" mouth="open" />, name: 'Stomach', note: 'loud, always "starving"'},
        {el: <Liver mood="open" mouth="o" />, name: 'Liver', note: 'the storekeeper'},
        {el: <g transform="translate(0 -6) scale(0.5)"><SugarJar store={0.6} label={false} /></g>, name: 'The sugar store', note: 'the liver\'s jar'},
        {el: <Brain mood="wink" mouth="smile" />, name: 'Brain', note: 'knows a secret'},
      ].map((c, i) => {
        const x = 56 + 190 + i * 357;
        return (
          <React.Fragment key={c.name}>
            <Fig x={x} y={862} size={200}>{c.el}</Fig>
            <Caption x={x} y={968} name={c.name} note={c.note} size={20} w={300} />
          </React.Fragment>
        );
      })}
    </Board>
  );
};

const K = 0.4; // 1080 x 1920 -> 432 x 768
const FastPlaceBoard: React.FC = () => (
  <Board
    kicker="Fasting · places · sheet 2"
    title="The whole stomach, the liver's sugar store, the switch"
    note="Your full-organ rule: each organ fills the frame with its face on its own wall. The stomach under the diaphragm with the gullet coming in, the liver's edge, the spleen and the gut round it; at hour four it growls (it shakes, ripples spread). The liver keeps sugar in a jar: by hour twelve the last bead is left. Then Lardo takes over and pops fuel drops."
    page="fasting · places"
  >
    <Mini x={56} y={240} k={K} label="B · 4 H: FEED ME!"><MomentStomach4h /></Mini>
    <Mini x={56 + 452} y={240} k={K} label="C · 12 H: THE STORE RUNS DRY"><MomentLiver12h /></Mini>
    <Mini x={56 + 904} y={240} k={K} label="D · 12 H: MY TURN!"><MomentSwitch /></Mini>
    <Mini x={56 + 1356} y={240} k={K} label="G · HUNGER STARTS IN THE BRAIN"><MomentBrainWink /></Mini>
  </Board>
);
const FastRoomBoard: React.FC = () => (
  <Board
    kicker="Fasting · new room · sheet 3"
    title="Grandpa's living room at night, and the 16-hour clock"
    note="Not Dad's kitchen: warm plum walls with a patterned stripe, a floor lamp laying one flat pale pool (no glow), a red armchair, the teal rug. The big wall clock counts the fast: its red FAST ring fills from 0 to 16 hours. At 0 h Grandpa pushes his dinner away and his Stomach bursts on screen; at 16 h it is breakfast."
    page="fasting · room"
  >
    <Mini x={56} y={200} k={0.44} label="A · 0 H: THE HOOK"><MomentFastHook /></Mini>
    <Mini x={56 + 495} y={200} k={0.44} label="E · 16 H: BREAKFAST"><MomentFast16h /></Mini>
    <CropAt x={1046} y={200} w={400} h={845} cx={600} cy={1000} zoom={0.55} label="GRANDPA, CLOSE"><MomentFastHook /></CropAt>
    <CropAt x={1476} y={200} w={390} h={400} cx={820} cy={330} zoom={0.8} label="THE CLOCK AT 16 H"><MomentFast16h /></CropAt>
    <CropAt x={1476} y={645} w={390} h={400} cx={300} cy={1500} zoom={0.55} label="THE STOMACH AT THE LENS"><MomentFastHook /></CropAt>
  </Board>
);

// a close check of faces and hands at video size (for me, not for the owner)
const FastCheck: React.FC = () => (
  <Board kicker="check" title="faces and hands, close" page="check">
    <CropAt x={40} y={200} w={440} h={420} cx={560} cy={640} zoom={1} label="GRANDPA HOOK"><MomentFastHook /></CropAt>
    <CropAt x={510} y={200} w={440} h={420} cx={300} cy={1440} zoom={0.8} label="STOMACH LENS"><MomentFastHook /></CropAt>
    <CropAt x={980} y={200} w={440} h={420} cx={560} cy={640} zoom={1} label="GRANDPA 16H"><MomentFast16h /></CropAt>
    <CropAt x={1450} y={200} w={430} h={420} cx={740} cy={860} zoom={0.8} label="STOMACH FACE"><MomentStomach4h /></CropAt>
    <CropAt x={40} y={660} w={440} h={400} cx={840} cy={1260} zoom={0.9} label="JAR"><MomentLiver12h /></CropAt>
    <CropAt x={510} y={660} w={440} h={400} cx={820} cy={1320} zoom={0.9} label="LARDO"><MomentSwitch /></CropAt>
    <CropAt x={980} y={660} w={440} h={400} cx={330} cy={800} zoom={0.9} label="LIVER FACE"><MomentLiver12h /></CropAt>
    <CropAt x={1450} y={660} w={430} h={400} cx={400} cy={660} zoom={0.9} label="BRAIN"><MomentBrainWink /></CropAt>
  </Board>
);

registerRoot(() => (
  <>
    <Still id="FastCast" component={LardoBoard} width={1920} height={1080} />
    <Still id="FastPlace" component={FastPlaceBoard} width={1920} height={1080} />
    <Still id="FastRoom" component={FastRoomBoard} width={1920} height={1080} />
    <Still id="FastCheck" component={FastCheck} width={1920} height={1080} />
  </>
));
