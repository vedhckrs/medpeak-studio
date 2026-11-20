import React from 'react';
import {registerRoot, Still} from 'remotion';
import {Board, FONT, INK} from './kit';
import {Put} from './scene';
import {Virus} from './germs';
import {Antibody, WhiteCell} from './cells';
import {BattlePlace, DOOR, DoorPlace, HighwayPlace} from './micro3';
import {CharTag, CtaCard, CtaCardV4, IconBadge, Watermark, WatermarkV3, type IconName} from './hud';
import {RABIES_CTA} from './rabies';
import {Crop, Mini} from './sheets-v4';

const K = 0.44;
const HighwayV: React.FC = () => (<><HighwayPlace t={1.2} /><Put x={540} y={1330} size={380} rot={4}><Virus mood="happy" mouth="big" look={[0, -0.8]} /></Put></>);
const BattleV: React.FC<{cop?: boolean}> = ({cop}) => (
  <>
    <BattlePlace t={1.4} />
    <Put x={730} y={560} size={230} rot={12}><Virus mood="scared" mouth="wavy" look={[-0.3, 0.4]} /></Put>
    {cop && <Put x={860} y={1000} size={380}><WhiteCell mood="angry" mouth="grit" look={[-0.4, -0.7]} /></Put>}
  </>
);

// ------------------------------------------------------------------ the CTA card
const Cta: React.FC = () => (
  <Board kicker="Rabies v4 · look sheet 3" title="The end card: logo, royal blue, one-line headline, bigger icons" page="v4 cta"
    note="Your logo top centre in a white circle with 'MedPeak Health' below; the logo's blue with lighter rings; the headline on one line; white cards with bigger icons; the follow line in a yellow pill. The narrator reads it, each part appears as he says it.">
    <Mini x={56} y={210} k={K} label="V4: FINAL FRAME"><CtaCardV4 t={6} {...RABIES_CTA} /></Mini>
    <Mini x={56 + 495} y={210} k={K} label="V4: AS IT BUILDS (1.2 s)"><CtaCardV4 t={1.2} {...RABIES_CTA} /></Mini>
    <Mini x={56 + 990} y={210} k={K} label="V3 (BEFORE)"><CtaCard t={4} {...RABIES_CTA} /></Mini>
    <Crop x={1530} y={210} w={340} h={400} fx={300} fy={140} zoom={0.75} label="LOGO, 1.7x"><CtaCardV4 t={6} {...RABIES_CTA} /></Crop>
    <Crop x={1530} y={655} w={340} h={400} fx={60} fy={660} zoom={0.75} label="CARD 1, 1.7x"><CtaCardV4 t={6} {...RABIES_CTA} /></Crop>
  </Board>
);

// ------------------------------------------------------------------ the watermark
const Wm: React.FC = () => (
  <Board kicker="Rabies v4 · look sheet 4" title="The watermark: smaller, half as strong, Inter Regular, no heavy outline" page="v4 watermark"
    note="Same three places as v3 (act 1 top right, act 2 bottom left, act 3 top middle). 26 px instead of 34, opacity 0.44 instead of 0.88, regular weight, a 1 px flat drop instead of the 6 px outline.">
    <Mini x={56} y={210} k={K} label="V3 (BEFORE)"><HighwayV /><WatermarkV3 act={0} t={2} /></Mini>
    <Mini x={56 + 495} y={210} k={K} label="V4"><HighwayV /><Watermark act={0} t={2} /></Mini>
    <Crop x={1046} y={210} w={400} h={190} fx={600} fy={120} zoom={0.9} label="V3, 2x"><HighwayV /><WatermarkV3 act={0} t={2} /></Crop>
    <Crop x={1476} y={210} w={400} h={190} fx={600} fy={120} zoom={0.9} label="V4, 2x"><HighwayV /><Watermark act={0} t={2} /></Crop>
    <Crop x={1046} y={470} w={400} h={190} fx={60} fy={1230} zoom={0.9} label="V4 ACT 2 ON A LIGHT PLACE, 2x"><BattleV /><Watermark act={1} t={2} /></Crop>
    <Crop x={1476} y={470} w={400} h={190} fx={330} fy={120} zoom={0.9} label="V4 ACT 3, 2x"><BattleV /><Watermark act={2} t={2} /></Crop>
  </Board>
);

// ------------------------------------------------------------------ the icons
const ICON_ROWS: {icon: IconName; name: string; when: string}[] = [
  {icon: 'dog', name: 'DOG (NEW)', when: 'on "stray dog"'},
  {icon: 'dogWarning', name: 'DOG + WARNING (NEW)', when: 'when the doctor says it is fatal'},
  {icon: 'stopwatch', name: 'STOPWATCH', when: 'on "15 minutes"'},
  {icon: 'calendar', name: 'CALENDAR', when: 'on "2-3 months"'},
  {icon: 'vaccine', name: 'SHIELD', when: 'only where the vaccine is named'},
];
const TIMES = [0.06, 0.16, 0.3, 1.2];
const Icons: React.FC = () => (
  <Board kicker="Rabies v4 · look sheet 5" title="Icons only when the words say it, and a smoother pop" page="v4 icons"
    note="The sunrise at 0:05 is removed. Each icon now eases in, settles once (3% over, no wobble or turn), holds still, then fades out. Shown at 0.06 s, 0.16 s, 0.30 s and 1.2 s after it appears.">
    {TIMES.map((t, j) => <div key={j} style={{position: 'absolute', left: 430 + j * 300, top: 176, width: 280, textAlign: 'center', fontFamily: FONT, fontSize: 20, fontWeight: 800, color: '#8a7a72'}}>{t.toFixed(2)} s</div>)}
    {ICON_ROWS.map((r, i) => (
      <React.Fragment key={r.icon}>
        <div style={{position: 'absolute', left: 60, top: 222 + i * 170, width: 360, fontFamily: FONT}}>
          <div style={{fontSize: 24, fontWeight: 900, color: INK}}>{r.name}</div>
          <div style={{fontSize: 19, fontWeight: 600, color: '#8a7a72', marginTop: 4}}>{r.when}</div>
        </div>
        {TIMES.map((t, j) => <div key={j} style={{position: 'absolute', left: 430 + j * 300, top: 200 + i * 170, width: 280, height: 160}}><IconBadge icon={r.icon} t={t} x={140} y={80} size={160} /></div>)}
      </React.Fragment>
    ))}
  </Board>
);

// ------------------------------------------------------------------ the name tags
const KT = 0.335;
const TagMini: React.FC<{i: number; label: string; children: React.ReactNode}> = ({i, label, children}) => (
  <Mini x={56 + i * 366} y={230} k={KT} label={label}>{children}</Mini>
);
const Tags: React.FC = () => (
  <Board kicker="Rabies v4 · look sheet 6" title="Name tags: 1 second, the first time each body character appears" page="v4 tags"
    note="A white tag above the head (to the side when there is no room), an arrow that draws itself to the head, and a flat halo: two thin white rings, no blur. No tags on people. A true glow would break the v8 'no glow' rule: say if you want one.">
    <TagMini i={0} label="RABIES VIRUS"><HighwayV /><CharTag label="RABIES VIRUS" x={540} y={1330} r={175} t={0.55} /></TagMini>
    <TagMini i={1} label="NERVE ENDING"><DoorPlace t={1.6} /><CharTag label="NERVE ENDING" x={560} y={700} r={250} t={0.55} /></TagMini>
    <TagMini i={2} label="DEFENCE CELL"><BattlePlace t={1.4} fire={false} /><CharTag label="DEFENCE CELL" x={220} y={1240} r={200} t={0.55} /></TagMini>
    <TagMini i={3} label="ANTIBODY">
      <DoorPlace t={1.6} />
      {DOOR.locks.map((x, j) => <Put key={j} x={x} y={DOOR.lockY - 90} size={150}><Antibody mood="angry" mouth="grit" look={[0, -0.6]} /></Put>)}
      <CharTag label="ANTIBODY" x={DOOR.locks[3]} y={DOOR.lockY - 90} r={70} t={0.55} />
    </TagMini>
    <TagMini i={4} label="WHITE BLOOD CELL"><BattleV cop /><CharTag label="WHITE BLOOD CELL" x={860} y={1000} r={180} t={0.55} /></TagMini>
    <div style={{position: 'absolute', left: 56, top: 900, width: 1800, fontFamily: FONT, fontSize: 20, fontWeight: 600, color: '#75645d'}}>
      Timing: in 0.15 s, the arrow draws 0.08-0.30 s, hold, out over the last 0.2 s (1.0 s in all). The tag box stays inside the safe area (x 70-1010, y 220-1360), away from the captions.
    </div>
  </Board>
);

registerRoot(() => (
  <>
    <Still id="V4HudCta" component={Cta} width={1920} height={1080} />
    <Still id="V4HudWatermark" component={Wm} width={1920} height={1080} />
    <Still id="V4HudIcons" component={Icons} width={1920} height={1080} />
    <Still id="V4HudTags" component={Tags} width={1920} height={1080} />
  </>
));
