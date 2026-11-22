/**
 * Engine v9 sample sheets, part 2: the crew, the hero prop and the intruder, a pale room, the end card, the watermark,
 * the caption and the cover (decisions 7, 12, 13, 20, 25, 26, 27). Every board shows NOW beside v9 where there is a now.
 */
import React from 'react';
import {Board, Caption, CLOTH, Fig, FONT, INK, Panel, ROOM, V9} from './kit';
import {JOBS, MiniWorker, Cilia} from './cells';
import {Ashtray, Cigarette, CigaretteHero, Intruder, Phone, Burger, PillBottle} from './props';
import {STAGES, CoEgg} from './anatomy';
import {PaleClinicRoom, PaleRoomFull, PEOPLE_SCALE_TWO, FEET_Y_TWO} from './scenes-rooms';
import {Mini, Crop} from './sheets-v4';
import {V8SceneD1} from './scenes-rooms';
import {CAPTION_KEY, CoverTitle, CtaCardV4, CtaCardV9, StayLabel, TimeCard, Watermark, WatermarkV9, WordCaption, wmSpot, type HudBox} from './hud';
import {RABIES_CTA} from './rabies';
import {castById, headAt, handAt} from './people-rig';
import {Scene} from './scene';
import COLOUR from './anatomy-colour.json';

const Note: React.FC<{x: number; y: number; w: number; children: React.ReactNode}> = ({x, y, w, children}) => (
  <div style={{position: 'absolute', left: x, top: y, width: w, fontFamily: FONT, fontSize: 19, fontWeight: 600, color: '#5d4e48', lineHeight: 1.4}}>{children}</div>
);
const Chest: React.FC<{state?: Record<string, number>; children?: React.ReactNode}> = ({state = {tar: 0.8, pink: 0.1, airway: 0.5, mucus: 0.5, cilia: 0.2}, children}) => {
  const S = STAGES.chest.Stage;
  return <S t={2} state={state} faces={{lungR: {mood: 'squint', mouth: 'flat', lookAt: [880, 1000]}, lungL: {mood: 'shock', mouth: 'o', lookAt: [880, 1000]}}}>{children}</S>;
};

// ------------------------------------------------------------------ the crew (decision 13)
export const V9CrewSheet: React.FC = () => {
  const T = STAGES.tissue.Stage;
  return (
    <Board kicker="Engine v9 · decision 13 · the crew" title="Mini workers: little people in uniform" note="Two heads tall, the kit eyes, small real hands (the people rig's hand), one uniform, one hat, one prop. A worker that wears its name on a paper band gets no extra tag. The pilot's cilia become a cleaner crew with brooms.">
      <Panel x={40} y={160} w={1060} h={880} label="Five jobs, at video size" />
      <V9>
        {JOBS.map((j, i) => (
          <React.Fragment key={j}>
            <Fig x={150 + (i % 3) * 330} y={i < 3 ? 380 : 800} size={300}><MiniWorker job={j} mood={i === 2 ? 'angry' : i === 4 ? 'squint' : 'open'} look={[i % 2 ? -0.7 : 0.7, 0]} pose={j === 'guard' ? 'up' : j === 'cleaner' ? 'sweep' : 'hold'} /></Fig>
            <Caption x={150 + (i % 3) * 330} y={i < 3 ? 545 : 965} name={j} note={['stop sign', 'broom', 'hose', 'parcel', 'phone'][i]} size={20} />
          </React.Fragment>
        ))}
        <Fig x={810} y={800} size={300}><MiniWorker job="cleaner" band="CILIA" pose="rest" mood="sleepy" mouth="flat" /></Fig>
        <Caption x={810} y={965} name="cleaner with a name band" note="no tag needed" size={20} />
      </V9>
      <Panel x={1120} y={160} w={760} h={880} label="On the tissue stage: the cilia crew sweeps" />
      <Mini x={1150} y={210} k={0.42}>
        <T t={2} state={{damage: 0.3}} />
        <V9>
          {[[220, 1100, 0.7], [540, 1130, -0.7], [850, 1100, -0.7]].map(([x, y, lk], i) => (
            <svg key={i} style={{position: 'absolute', left: x - 190, top: y - 190, overflow: 'visible'}} width={380} height={380} viewBox="-100 -100 200 200">
              <MiniWorker job="cleaner" band="CILIA" pose="sweep" mood={i === 1 ? 'happy' : 'open'} look={[lk, 0.2]} />
            </svg>
          ))}
        </V9>
      </Mini>
      <div style={{position: 'absolute', left: 1630, top: 230, width: 230}}>
        <V9><Fig x={115} y={130} size={220}><Cilia /></Fig></V9>
        <Caption x={115} y={240} name="was: Cilia" note="a slab with hairs and a broom" size={18} w={230} />
        <V9><Fig x={115} y={480} size={220}><CoEgg x={0} y={0} s={1.3} face={{mood: 'angry', mouth: 'smile', look: [-0.7, 0]}} /></Fig></V9>
        <Caption x={115} y={590} name="Carbon monoxide" note="a soft egg with its name band" size={18} w={230} />
      </div>
    </Board>
  );
};

// ------------------------------------------------------------------ the hero prop and the intruder
export const V9PropSheet: React.FC = () => (
  <Board kicker="Engine v9 · the hero prop" title="The one real object, drawn a level up, entering the body" note="The pilot's intruder: a cigarette at hero detail (three tones, one highlight, a paper seam, the printed ring, a cork filter, ash and a flat ember). It slides in from the frame edge at about 40% of the frame height, then holds.">
    <Panel x={40} y={160} w={820} h={880} label="Now (plain prop) and v9 hero" />
    <Fig x={250} y={330} size={300}><Cigarette /></Fig>
    <Caption x={250} y={470} name="Now" note="the plain prop" size={20} />
    <Fig x={560} y={360} size={380}><CigaretteHero t={1} /></Fig>
    <Caption x={600} y={470} name="v9 hero" note="3 tones, seam, ring, cork, ember" size={20} />
    <Fig x={440} y={760} size={680}><CigaretteHero t={1} smoke={false} /></Fig>
    <Caption x={450} y={870} name="at full size" size={20} />
    <Fig x={250} y={960} size={150}><Ashtray /></Fig>
    <Caption x={420} y={950} name="ashtray" note="beside it, plain props" size={18} w={160} />
    <Fig x={570} y={980} size={110}><Phone /></Fig><Fig x={680} y={980} size={110}><Burger /></Fig><Fig x={790} y={980} size={110}><PillBottle /></Fig>
    <Panel x={880} y={160} w={1000} h={880} label="It enters: 0.1 s, 0.3 s, 0.6 s, then holds" />
    {[0.1, 0.3, 0.6, 2.0].map((t, i) => (
      <Mini key={t} x={905 + i * 242} y={250} k={0.21} label={`${t} s`}>
        <Chest /><Intruder from="right" at={[800, 1000]} t={t} t0={0} dur={0.6} height={0.42} rot={-28}><CigaretteHero t={t} /></Intruder>
      </Mini>
    ))}
    <Note x={905} y={680} w={940}>Eased out with at most 4% overshoot, one action, then a hold. It overlaps the lung (the size contrast is the point), never a face, and it can get the kit eyes like any character. In a hand it comes with the hand (handProp: 0.15 s scale-in while the hand rises 0.3 s) or is there from the first frame.</Note>
    <Mini x={1500} y={800} k={0.12}><Chest /><Intruder from="right" at={[800, 1000]} t={2} height={0.42} rot={-28} eyes={{x: 20, y: -32, r: 13, mood: 'happy', mouth: 'smile', look: [-0.8, 0]}}><CigaretteHero t={2} /></Intruder></Mini>
    <Note x={1650} y={850} w={210}>with kit eyes</Note>
  </Board>
);

// ------------------------------------------------------------------ the pale room (decisions 7, 12)
const sat = (hex: string) => { const n = parseInt(hex.slice(1), 16); const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return {s: mx ? (mx - mn) / mx : 0, v: mx}; };
export const V9RoomSheet: React.FC = () => (
  <Board kicker="Engine v9 · decisions 7 and 12" title="Pale, quiet rooms and a tighter two-shot" note="Now: a saturated clinic, people at 3.2 px a unit, heads about 150 px. v9: walls from the pale ROOM palette (saturation 0.22 or less, brightness 165+), at most 5 props, and two people framed at 4.0 (heads about 300 px), cut at the knees, looking at each other.">
    <Mini x={60} y={200} k={0.42} label="Now (rabies clinic)"><V8SceneD1 /></Mini>
    <Mini x={560} y={200} k={0.42} label="v9 pale clinic, two-shot at 4.0"><PaleRoomFull /></Mini>
    <Panel x={1060} y={160} w={820} h={880} label="The ROOM palette (pale walls), measured" />
    {(Object.entries(ROOM) as [string, string][]).map(([k, c], i) => {
      const m = sat(c);
      return (
        <React.Fragment key={k}>
          <div style={{position: 'absolute', left: 1100 + (i % 3) * 260, top: 220 + Math.floor(i / 3) * 140, width: 220, height: 66, background: c, border: `3px solid ${INK}`, borderRadius: 12}} />
          <div style={{position: 'absolute', left: 1100 + (i % 3) * 260, top: 292 + Math.floor(i / 3) * 140, width: 240, fontFamily: FONT, fontSize: 15, fontWeight: 700, color: INK, lineHeight: 1.25}}>{k} {c}<br /><span style={{color: '#7a6a62'}}>sat {m.s.toFixed(2)} · bright {m.v}</span></div>
        </React.Fragment>
      );
    })}
    <Note x={1100} y={660} w={760}><b>Measured on the full frames</b> (saturation / brightness, pass 0.22 or less / 165+): v9 pale clinic {(COLOUR as Record<string, {sat: number; bright: number}>).room?.sat} / {(COLOUR as Record<string, {sat: number; bright: number}>).room?.bright}; the rabies clinic now {(COLOUR as Record<string, {sat: number; bright: number}>).old_room?.sat} / {(COLOUR as Record<string, {sat: number; bright: number}>).old_room?.bright}.</Note>
    <Note x={1100} y={800} w={760}>Walls use mint, grey, cream and sky; deepest, floor, trim and wood are the darker allowed steps (furniture, a door, the floor). Rooms stay unique per video: each video picks its own wall colour and its own 2-3 wall items from this recipe.</Note>
    <div style={{position: 'absolute', left: 560, top: 1012, width: 454, fontFamily: FONT, fontSize: 15, fontWeight: 700, color: '#7a6a62'}}>head width in the two-shot: about {Math.round(headAt(castById('dad'), {view: 'three-quarter', facing: 'left', x: 835, y: FEET_Y_TWO, scale: PEOPLE_SCALE_TWO, pose: 'worried'}).r * 2 / 1.3 * 1.05)} px</div>
  </Board>
);
void PaleClinicRoom; void handAt;

// ------------------------------------------------------------------ the end card (decision 25, option A)
export const V9EndCardSheet: React.FC = () => (
  <Board kicker="Engine v9 · decision 25 (option A)" title="The short end card: hard cut, centred, 5.5 s" note="Now: it slides up over the story and runs 13-17 s, the stack sits high with 330 px of empty blue below, an icon is clipped by its circle. v9: a hard cut (the card is whole from its first frame), the headline and all three points within 0.5 s, the stack centred between y 200 and 1500, icons in 170 px circles drawn to fit, Joey says only the follow line.">
    <Mini x={60} y={220} k={0.42} label="Now, at its end"><CtaCardV4 t={13} title={RABIES_CTA.title} points={RABIES_CTA.points} at={RABIES_CTA.at} /></Mini>
    <Mini x={540} y={220} k={0.42} label="v9 at 0.1 s (hard cut in)"><CtaCardV9 t={0.1} title={RABIES_CTA.title} points={RABIES_CTA.points} /></Mini>
    <Mini x={1020} y={220} k={0.42} label="v9 at 0.4 s"><CtaCardV9 t={0.4} title={RABIES_CTA.title} points={RABIES_CTA.points} /></Mini>
    <Mini x={1500} y={220} k={0.18} label="v9 at 5 s (full)"><CtaCardV9 t={5} title={RABIES_CTA.title} points={RABIES_CTA.points} /></Mini>
    <Note x={1500} y={600} w={380}>Length 5.5 s and 12% of the video at most. The story ends on the answer or the loop line; the card follows with a hard cut; the watermark is not on it.</Note>
  </Board>
);

// ------------------------------------------------------------------ the watermark (decision 26)
const ROOM_HEADS = (): HudBox[] => {
  const m = headAt(castById('doctor'), {pose: 'clipboard', view: 'three-quarter', facing: 'right', x: 265, y: FEET_Y_TWO, scale: PEOPLE_SCALE_TWO});
  const d = headAt(castById('dad'), {pose: 'worried', view: 'three-quarter', facing: 'left', x: 835, y: FEET_Y_TWO, scale: PEOPLE_SCALE_TWO});
  return [m, d].map((h) => ({x0: h.x - h.r, y0: h.y - h.r * 1.2, x1: h.x + h.r, y1: h.y + h.r}));
};
const CaptionMock: React.FC = () => <WordCaption word="BREATHE" t={1} isKey y={1374} scale={0.6} />;
export const V9WatermarkSheet: React.FC = () => {
  const heads = ROOM_HEADS();
  return (
    <Board kicker="Engine v9 · decision 26" title="The watermark: three acts, on light and on dark" note="Act 1 top right. Act 2 bottom left, now at y 1200 (it sat 44 px above the caption and read as a second caption line). Act 3 takes the first of top left / middle / right that is clear of every head. On light backgrounds it turns ink-coloured, same size and opacity. Never on the cover or the end card.">
      {[0, 1, 2].map((act) => (
        <React.Fragment key={act}>
          <Mini x={60 + act * 300} y={230} k={0.25} label={`Light · act ${act + 1}`}><PaleRoomFull /><CaptionMock /><WatermarkV9 act={act} t={1} heads={heads} light /></Mini>
          <Mini x={980 + act * 300} y={230} k={0.25} label={`Dark · act ${act + 1}`}><Chest /><CaptionMock /><WatermarkV9 act={act} t={1} heads={[]} /></Mini>
        </React.Fragment>
      ))}
      <Mini x={60} y={760} k={0.12} label="Now: act 2"><PaleRoomFull /><CaptionMock /><Watermark act={1} t={1} /></Mini>
      <Note x={220} y={760} w={700}>Now: act 2 (y 1330) sits right on the caption; act 3 (top middle) lands on heads in a room. v9 light act 3 here picked: {wmSpot(2, heads).align === 'center' ? 'top middle' : `top ${wmSpot(2, heads).align}`} (the heads are clear of it).</Note>
      <Crop x={1000} y={760} w={420} h={220} fx={0} fy={1130} zoom={0.8} label="act 2 vs the caption (full size)"><Chest /><CaptionMock /><WatermarkV9 act={1} t={1} /></Crop>
      <Crop x={1450} y={760} w={420} h={220} fx={540} fy={60} zoom={0.8} label="light: ink mark (full size)"><PaleRoomFull /><WatermarkV9 act={0} t={1} light /></Crop>
    </Board>
  );
};

// ------------------------------------------------------------------ the caption (decision 27)
const WORDS: [string, boolean][] = [['YOUR', false], ['LUNGS', true], ['CLEAN', false], ['THEMSELVES', true]];
export const V9CaptionSheet: React.FC = () => (
  <Board kicker="Engine v9 · decision 27" title="The caption: same place and size, with or without a tilt" note="The caption stays where you put it (y 1374, 40% smaller). The only change offered: each word tilted by -2 to +2 degrees, the same word always the same tilt. Faces are kept out of the caption band by the staging (a check fails any frame with a face in it). Also: a place label that stays for the shot, and the black time card.">
    <Panel x={40} y={160} w={900} h={880} label="Now: straight" />
    <Panel x={980} y={160} w={900} h={880} label="v9 option: a small seeded tilt" />
    {WORDS.map(([w, key], i) => (
      <React.Fragment key={w}>
        <Crop x={80} y={220 + i * 200} w={820} h={160} fx={130} fy={1290} zoom={1}><Chest /><WordCaption word={w} t={1} isKey={key} y={1374} scale={0.6} /></Crop>
        <Crop x={1020} y={220 + i * 200} w={820} h={160} fx={130} fy={1290} zoom={1}><Chest /><WordCaption word={w} t={1} isKey={key} y={1374} scale={0.6} tilt /></Crop>
      </React.Fragment>
    ))}
    <div style={{position: 'absolute', left: 80, top: 1012, fontFamily: FONT, fontSize: 15, fontWeight: 700, color: CAPTION_KEY === '#ffd23f' ? '#7a6a62' : INK}}>Crops at full size: the caption band y 1290-1450 of the frame.</div>
  </Board>
);

// ------------------------------------------------------------------ the cover and the time card
export const V9CoverSheet: React.FC = () => {
  const lungs: HudBox[] = Object.values(STAGES.chest.faces).map((f) => ({x0: f.x - f.r * 2.4, y0: f.y - f.r * 2, x1: f.x + f.r * 2.4, y1: f.y + f.r * 2.4}));
  const heads = ROOM_HEADS();
  const hands = (['doctor', 'dad'] as const).flatMap((id, i) => {
    const h = handAt(castById(id), {pose: i ? 'worried' : 'clipboard', view: 'three-quarter', facing: i ? 'left' : 'right', x: i ? 835 : 265, y: FEET_Y_TWO, scale: PEOPLE_SCALE_TWO});
    return [h.R, h.L].map((p) => ({x0: p.palm[0] - 90, y0: p.palm[1] - 90, x1: p.palm[0] + 90, y1: p.palm[1] + 90}));
  });
  return (
    <Board kicker="Engine v9 · covers and time cards" title="Two cover options, and the time card" note="The cover has no watermark (the channel name is already beside it in the feed). The title goes in the largest free spot clear of every face, hand and prop; nothing is cut at the edge; eyes are open. The time card is a hard cut to black with one short line, 0.8-1.2 s; the same framing comes back after it.">
      <Mini x={80} y={210} k={0.42} label="Cover A: the organ"><Chest /><CoverTitle lines={['QUIT SMOKING?', 'WATCH THIS']} key9="SMOKING?" avoid={lungs} /></Mini>
      <Mini x={600} y={210} k={0.42} label="Cover B: the patient and Dr. Mira"><PaleRoomFull /><CoverTitle lines={['WHY DO I', 'COUGH MORE?']} key9="COUGH" avoid={[...heads, ...hands]} /></Mini>
      <Mini x={1120} y={210} k={0.21} label="Time card"><TimeCard text="3 days later" /></Mini>
      <Mini x={1360} y={210} k={0.21} label="Place label (stays)"><Chest /><StayLabel text="Lungs" x={300} y={1200} rot={-4} /><StayLabel text="Trachea" x={700} y={180} rot={6} size={28} /></Mini>
      <Note x={1120} y={660} w={740}>A time card never shows a number on the picture beyond its own words; at most 3 a video. A stay label has no arrow and lasts the whole shot; character name tags keep their 2.5 s and arrow, which now lands on the character's body centre.</Note>
    </Board>
  );
};
void Scene; void CLOTH;
