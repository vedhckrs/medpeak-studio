/**
 * "What Happens When a Snake Bites You" (`snake-bite`) in look v8: its seven shots by id (videos/snake-bite/toon.json) and its CTA
 * end card. Shape `journey`: the venom gang (Numb, Bleed, Crush) sets off through Sam's leg; Mom shouts the myths and the gang
 * cheers; Sam does the right things (NHS); Antivenom arrives through the drip; Dr. Mira at the end. The owner approved the plan,
 * hook A, Mom and the looks on 2026-11-22.
 *
 * Made to the 2026-11-22 checklist (skill toons-known-issues.md): one framing per place (a cut only on a line with a `cam` word, to
 * another subject or by 1.5x), one colour per place, key poses that hold, tags never in the hook line, nothing in the caption band.
 */
import React from 'react';
import {Put, Scene} from './scene';
import {CharTag, type CtaPoint} from './hud';
import {arc, Burst, easeOut, hop, keyed, shake, take} from './act';
import {FEET_Y, PEOPLE_SCALE} from './scenes-rooms';
import {castById, handAt, PersonAt, type PoseIn, type PoseName} from './people-rig';
import {CLOTH, EDGE, EDGE_IN, FONT, INK, OUTLINE, Shape, shade, tint} from './kit';
import {active, blink, bodyFace, clamp01, go, lerp, pop, since, talkSmooth, type Focus, type ShotDef, type ShotNow} from './play';
import {Antivenom, Bleed, Crush, Numb, VENOM} from './snake-cast';
import {Fangs, HospitalBed, Knife, LegInside, Rope, SNAKE_PLACE, TrailScene} from './snake-places';

const SAM = castById('patient');
const MOM = castById('mom');
const MIRA = castById('doctor');

// ------------------------------------------------------------------ helpers (as in fasting.tsx)
const at = (s: ShotNow, id: string, word: string | undefined, dflt: number) => { const u = since(s, id, word); return u <= -900 ? dflt : s.t - u; };
type Step = [number, PoseName, number?];
const poseAt = (t: number, steps: Step[]): PoseIn => {
  let i = -1;
  for (let j = 0; j < steps.length; j++) if (t >= steps[j][0]) i = j;
  if (i <= 0) return steps[0][1];
  const [t0, b, d = 0.3] = steps[i];
  const k = go(t, t0, d);
  return k >= 1 ? b : {a: steps[i - 1][1], b, k};
};
const openFace = (s: ShotNow, who: string, seed: number, rest: string) => {
  const f = bodyFace(s, who, seed, rest);
  return f.mood === 'happy' && active(s, who) > 0.3 ? {...f, mood: 'open' as const} : f;
};
type View = {x: number; y: number; z: number};
const WIDE: View = {x: 540, y: 960, z: 1};
const byLine = (by: Record<string, View>, first: View) => (s: ShotNow) => by[s.cur?.id ?? ''] ?? first;
/** A name tag through a shot's camera (frame point -> screen). */
const tagVia = (view: (s: ShotNow) => View) => {
  const T: React.FC<{s: ShotNow; label: string; x: number; y: number; r: number; t: number; dur?: number}> = ({s, label, x, y, r, t, dur}) => {
    const c = view(s);
    return <CharTag label={label} x={540 + (x - c.x) * c.z} y={960 + (y - c.y) * c.z} r={r * c.z} t={t} dur={dur} />;
  };
  return T;
};
/** A yellow number tag, from `word` to the end of its line (on the screen, after the camera). */
const NumTag: React.FC<{s: ShotNow; text: string; id: string; word: string; x?: number; y?: number}> = ({s, text, id, word, x = 540, y = 300}) => {
  const u = since(s, id, word);
  const line = s.lines.find((l) => l.id === id);
  if (!line || u < 0) return null;
  const left = line.from + line.voice + 0.15 - s.t;
  if (left < -0.25) return null;
  const k = pop(u, 0, 0.3);
  const o = clamp01(u / 0.12) * clamp01((left + 0.25) / 0.25);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${k.toFixed(3)})`, opacity: o, background: CLOTH.yellow, border: `5px solid ${INK}`, borderRadius: 14,
      padding: '10px 30px', fontFamily: 'Poppins, Inter, sans-serif', fontWeight: 900, fontSize: 64, color: INK, whiteSpace: 'nowrap', boxShadow: `0 8px 0 ${INK}`}}>{text.toUpperCase()}</div>
  );
};
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} viewBox="0 0 1080 1920">{children}</svg>
);

// ------------------------------------------------------------------ the trail's people
const ROCK: [number, number] = [830, 1300];
const samStand = {view: 'three-quarter' as const, facing: 'right' as const, x: 420, y: FEET_Y - 22, scale: PEOPLE_SCALE};
/** Sam sitting on the rock (the slumped sit has no chair of its own). */
const samRock = {pose: 'sitSlump' as const, view: 'three-quarter' as const, facing: 'left' as const, x: 790, y: 1620, scale: PEOPLE_SCALE};
const momStand = {view: 'three-quarter' as const, facing: 'right' as const, x: 330, y: FEET_Y - 22, scale: PEOPLE_SCALE};

// =================================================================== A: the hook (inside the leg), then the trail
//   0.00  the two fangs punch DOWN through the skin (a burst, a shake); the gang bursts out at the lens, Numb big in front
//   "bites" Numb grins at the lens; "ride!" the gang scatters (Bleed and Crush off to the sides)
//   A2  (the trail, a hard cut) "Ow!" Sam hops on one foot; "snake" he stares at the tail slipping under the rock
const timesA = (s: ShotNow) => {
  const a2 = at(s, 'A2', undefined, 1.9);
  return {bites: at(s, 'A1', 'bites', 0.5), ride: at(s, 'A1', 'ride', 1.3), a2, ow: at(s, 'A2', 'ow', a2), snake: at(s, 'A2', 'snake', a2 + 1.0)};
};
const ShotA: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesA(s);
  if (t < k.a2) {
    const fang = keyed(t, -60, [[0, 620, 0.12, 'out'], [0.45, 260, 0.35]]);
    const burst = keyed(t, 0, [[0.06, 1, 0.3, 'back']]);
    const scatter = keyed(t, 0, [[k.ride, 1, 0.35, 'out']]);
    const [sx, sy] = shake(t, 0.08, 24, 0.35);
    const nf = openFace(s, 'numb', 1, 'wink');
    return (
      <div style={{position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)`}}>
        <Scene bg={SNAKE_PLACE.leg}>
          <LegInside swell={keyed(t, 0.4, [[0.1, 0.9, 0.3]])} />
          <Svg><Fangs y={fang} /></Svg>
          <Put x={lerp(540, lerp(300, -100, scatter), burst)} y={lerp(560, 980, burst)} size={lerp(120, 400, burst)} rot={-10 - scatter * 30}><Bleed mood="angry" mouth="grit" arms="cheer" look={[0.3, 0.4]} /></Put>
          <Put x={lerp(560, lerp(790, 1180, scatter), burst)} y={lerp(560, 1000, burst)} size={lerp(120, 400, burst)} rot={8 + scatter * 30}><Crush mood="wink" mouth="big" arms="wave" look={[-0.3, 0.4]} /></Put>
          <Put x={540} y={lerp(640, 1540, burst)} size={lerp(160, 700, burst)}><Numb mood={nf.mood} mouth={nf.mouth} arms={t > k.bites - 0.1 ? 'point' : 'cheer'} look={[0, 0.5]} /></Put>
        </Scene>
        <Burst t={t} t0={0.1} x={540} y={600} r={220} />
      </div>
    );
  }
  const hp = hop(t, k.ow, 70, 0.3), hp2 = hop(t, k.ow + 0.45, 50, 0.28);
  const tail = keyed(t, 1, [[k.snake, 0, 0.6]]);
  const pose = poseAt(t, [[-9, 'worried'], [k.snake - 0.1, 'point', 0.2]]);
  return (
    <Scene bg={SNAKE_PLACE.trail}>
      <TrailScene tail={tail} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(hp.dy + hp2.dy).toFixed(1)}px)`}}>
        <PersonAt spec={SAM} {...samStand} pose={pose} expr="surprised" look={t > k.snake - 0.1 ? [0.9, 0.6] : [0.1, 0.8]} talk={talkSmooth(s, 'patient')} blink={blink(t, 3)} />
      </div>
    </Scene>
  );
};

// =================================================================== B: inside the leg, the split
//   B0  (wide) "million" a crowd of tiny drops floods in behind the gang; "busy!" high-fives
//   B1  (cut: Numb close at the nerve cable) "nerves." he grabs it, it sparks; "Breathing" the sparks go dark (dial nerve)
//   B2  (cut: Bleed close in the blood river) "blood" he dives in (a splash); "clotting!" tosses away a clot plug (dial clot)
//   B3  (wide) "wreck" Crush stamps, the flesh swells (dial swell); "here!" he flexes
const NUMB_B: [number, number] = [230, 760], BLEED_B: [number, number] = [860, 1040], CRUSH_B: [number, number] = [540, 1520];
const timesB = (s: ShotNow) => {
  const b1 = at(s, 'B1', undefined, 2.6), b2 = at(s, 'B2', undefined, 5.4), b3 = at(s, 'B3', undefined, 7.5);
  return {million: at(s, 'B0', 'million', 0.4), busy: at(s, 'B0', 'busy', 1.6), b1, nerves: at(s, 'B1', 'nerves', b1 + 0.5), breath: at(s, 'B1', 'breathing', b1 + 1.3),
    b2, blood: at(s, 'B2', 'blood', b2 + 0.6), clot: at(s, 'B2', 'clotting', b2 + 1.2), b3, wreck: at(s, 'B3', 'wreck', b3 + 0.5), here: at(s, 'B3', 'here', b3 + 1.6)};
};
const NerveSparks: React.FC<{t: number; on: number}> = ({t, on}) => (
  <g>
    {[360, 520, 680, 840, 1000, 1160].map((y, i) => {
      const lit = on > i / 6 ? 0 : 1; // they go dark one after another as `nerve` rises past 0.5
      const x = 110 + Math.sin(y / 300) * 30;
      return <path key={i} d={`M ${x - 26} ${y} L ${x - 6} ${y - 14} L ${x + 4} ${y + 8} L ${x + 26} ${y - 6}`} stroke={lit ? CLOTH.yellow : shade('#f2d98d', 0.4)} strokeWidth={lit ? 10 : 6} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={lit ? 0.6 + 0.4 * Math.abs(Math.sin(t * 6 + i)) : 0.7} />;
    })}
  </g>
);
const ShotB: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesB(s);
  const crowd = keyed(t, 0, [[k.million, 1, 0.5, 'out']]);
  const nerve = keyed(t, 0, [[k.nerves, 0.5, 0.2], [k.breath, 1, 1.0]]);
  const swell = keyed(t, 0, [[k.wreck, 1, 0.4, 'out']]);
  const dive = keyed(t, 0, [[k.blood - 0.1, 1, 0.3, 'out']]);
  const plug = clamp01((t - k.clot) / 0.6);
  const stamp = hop(t, k.wreck - 0.05, 60, 0.25);
  const nf = openFace(s, 'numb', 1, 'smug'), bf = openFace(s, 'bleed', 2, 'happy'), cf = openFace(s, 'crush', 3, 'angry');
  const [sx, sy] = shake(t, k.wreck + 0.25, 16, 0.3);
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)`}}>
      <Scene bg={SNAKE_PLACE.leg}>
        <LegInside swell={swell} light={0.55} />
        <Svg>
          <NerveSparks t={t} on={nerve > 0.5 ? (nerve - 0.5) * 2 : 0} />
          {/* the crowd: tiny drops filling in behind the gang */}
          {crowd > 0 && Array.from({length: 14}, (_, i) => {
            const x = 260 + (i % 7) * 90 + (i > 6 ? 45 : 0), y = 520 + Math.floor(i / 7) * 110 - (1 - crowd) * 700;
            const c = [VENOM.numb, VENOM.bleed, VENOM.crush][i % 3];
            return <path key={i} d={`M ${x} ${y - 30} Q ${x + 22} ${y} ${x + 18} ${y + 14} A 20 20 0 1 1 ${x - 18} ${y + 14} Q ${x - 22} ${y} ${x} ${y - 30} Z`} fill={c} {...EDGE_IN} opacity={0.9} />;
          })}
          {/* the clot plug Bleed tosses away */}
          {plug > 0 && plug < 1 && (() => { const [x, y] = arc([BLEED_B[0] - 40, BLEED_B[1] - 140], [BLEED_B[0] - 300, BLEED_B[1] - 420], 160, plug); return <circle cx={x} cy={y} r={26} fill="#8a1f24" {...EDGE_IN} />; })()}
        </Svg>
        <Put x={NUMB_B[0]} y={NUMB_B[1]} size={360} rot={-12}><Numb mood={nf.mood} mouth={nf.mouth} arms={t > k.nerves - 0.1 ? 'point' : 'wave'} look={[-0.8, 0]} /></Put>
        <Put x={BLEED_B[0]} y={BLEED_B[1] + dive * 60} size={360} rot={10 + dive * 10}><Bleed mood={bf.mood} mouth={bf.mouth} arms={t > k.clot - 0.1 ? 'wave' : 'point'} look={[-0.6, -0.2]} /></Put>
        {(s.cur?.id !== 'B1' && s.cur?.id !== 'B2') && <Put x={CRUSH_B[0]} y={CRUSH_B[1] + stamp.dy} size={420} sq={stamp.sq}><Crush mood={cf.mood} mouth={cf.mouth} arms={t > k.here - 0.1 ? 'cheer' : 'hips'} look={[0, 0.4]} /></Put>}
      </Scene>
      <Burst t={t} t0={k.nerves} x={NUMB_B[0] - 100} y={NUMB_B[1] - 40} r={110} col={CLOTH.yellow} />
      <Burst t={t} t0={k.blood + 0.15} x={BLEED_B[0]} y={BLEED_B[1] + 60} r={120} col={tint('#c8342e', 0.4)} />
      <Burst t={t} t0={k.wreck + 0.25} x={CRUSH_B[0]} y={CRUSH_B[1] + 180} r={140} />
    </div>
  );
};
const viewB = byLine({B1: {x: 300, y: 760, z: 1.6}, B2: {x: 800, y: 1000, z: 1.6}}, WIDE);
const TagB = tagVia(viewB);
const ScreenB: React.FC<{s: ShotNow}> = ({s}) => {
  const k = timesB(s);
  return (
    <>
      <NumTag s={s} text="over 5 million a year" id="B0" word="over" y={250} />
      {s.cur?.id === 'B1' && <TagB s={s} label="NUMB (NERVES)" x={NUMB_B[0]} y={NUMB_B[1] - 20} r={130} t={s.t - k.b1 - 0.1} />}
      {s.cur?.id === 'B2' && <TagB s={s} label="BLEED (BLOOD)" x={BLEED_B[0]} y={BLEED_B[1] - 20} r={130} t={s.t - k.b2 - 0.1} />}
      {s.cur?.id === 'B3' && <TagB s={s} label="CRUSH (FLESH)" x={CRUSH_B[0]} y={CRUSH_B[1] - 30} r={150} t={s.t - k.b3 - 0.1} />}
    </>
  );
};

// =================================================================== C: the trail: Sam does the right thing first
//   0.00 he sits down on the rock, slowly; C1 "calm." one slow breath; "still." his leg goes flat and stays
//   C2  (cut: Sam close) "snake." he waves the tail away under the rock
const timesC = (s: ShotNow) => {
  const c2 = at(s, 'C2', undefined, 2.6);
  return {calm: at(s, 'C1', 'calm', 0.7), still: at(s, 'C1', 'still', 1.9), c2, snake: at(s, 'C2', 'snake', c2 + 1.0)};
};
const ShotC: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesC(s);
  const breath = keyed(t, 0, [[k.calm, 1, 0.5], [k.calm + 0.6, 0, 0.6]]);
  const pose: PoseIn = t > k.snake - 0.15 ? {a: 'sitSlump', b: 'wave', k: 0} : 'sitSlump';
  return (
    <Scene bg={SNAKE_PLACE.trail}>
      <TrailScene tail={keyed(t, 0.5, [[k.snake, 0, 0.4]])} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(-breath * 10).toFixed(1)}px)`}}>
        <PersonAt spec={SAM} {...samRock} pose={pose} expr={t > k.still ? 'neutral' : 'worried'} look={t > k.snake - 0.2 ? [-0.8, 0.6] : [-0.3, 0.2]} talk={talkSmooth(s, 'patient')} blink={blink(t, 3)} />
      </div>
    </Scene>
  );
};
const viewC = byLine({C2: {x: 760, y: 900, z: 1.6}}, WIDE);

// =================================================================== D: the myths (the twist), the trail
//   0.00 Mom runs in from the left; D1 "Cut" a knife up, "Suck" she leans in, "Tie" a rope out
//   D2  (cut: close on a bubble over the rock) "Yes!" the gang pops up in it, cheering; "love" they dance
//   D3  (back) "No," Sam's hands up: stop; "suck" the bubble POPS; "tie" Mom drops the knife and the rope
//   D4  "Rings" Mom slides a ring off his finger; "calling" phone to her ear
const BUBBLE: [number, number] = [560, 360];
const timesD = (s: ShotNow) => {
  const d2 = at(s, 'D2', undefined, 2.6), d3 = at(s, 'D3', undefined, 4.8), d4 = at(s, 'D4', undefined, 7.9);
  return {cut: at(s, 'D1', 'cut', 0.4), suck: at(s, 'D1', 'suck', 1.0), tie: at(s, 'D1', 'tie', 1.7), d2, yes: at(s, 'D2', 'yes', d2), love: at(s, 'D2', 'love', d2 + 1.5),
    d3, no: at(s, 'D3', 'no', d3), pop: at(s, 'D3', 'suck', d3 + 1.4), drop: at(s, 'D3', 'tie', d3 + 2.2), d4, rings: at(s, 'D4', 'rings', d4), calling: at(s, 'D4', 'calling', d4 + 1.2)};
};
const GangBubble: React.FC<{t: number; k: ReturnType<typeof timesD>}> = ({t, k}) => {
  const up = pop(t, k.yes - 0.1, 0.3);
  const popped = clamp01((t - k.pop) / 0.2);
  if (up < 0.01 || popped >= 1) return null;
  const dance = t > k.love ? Math.sin((t - k.love) * 12) * 6 : 0;
  const sc = up * (1 + popped * 0.3);
  return (
    <div style={{position: 'absolute', inset: 0, opacity: 1 - popped}}>
      <Svg>
        <g transform={`translate(${BUBBLE[0]} ${BUBBLE[1]}) scale(${sc.toFixed(3)})`}>
          <path d="M -230 0 Q -240 -150 -100 -170 Q -20 -240 90 -180 Q 230 -190 240 -40 Q 290 90 160 140 Q 60 210 -60 160 Q -230 170 -230 0 Z" fill="#ffffff" {...EDGE} />
        </g>
      </Svg>
      <Put x={BUBBLE[0] - 130} y={BUBBLE[1] - 10 + dance} size={190 * up} rot={-10}><Numb mood="happy" mouth="big" arms="cheer" look={[0, 0]} /></Put>
      <Put x={BUBBLE[0] + 130} y={BUBBLE[1] - 10 - dance} size={190 * up} rot={10}><Crush mood="happy" mouth="big" arms="cheer" look={[0, 0]} /></Put>
      <Put x={BUBBLE[0]} y={BUBBLE[1] + 20 + dance} size={230 * up}><Bleed mood="happy" mouth="big" arms="cheer" look={[0, 0.2]} /></Put>
    </div>
  );
};
const ShotD: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesD(s);
  const run = easeOut(clamp01(t / 0.6));
  const mx = lerp(-150, momStand.x, run);
  const bounce = run < 1 ? -Math.abs(Math.sin(run * Math.PI * 3)) * 24 : 0;
  const pose = poseAt(t, [[-9, 'worried'], [k.cut - 0.1, 'wave', 0.15], [k.suck - 0.1, 'worried', 0.2], [k.tie - 0.1, 'offer', 0.2], [k.drop, 'cheeks', 0.15], [k.rings - 0.1, 'offer', 0.25], [k.calling - 0.1, 'think', 0.25]]);
  const momO = {...momStand, x: mx, pose};
  const hand = handAt(MOM, momO);
  const palm = hand.R.palm[0] > hand.L.palm[0] ? hand.R.palm : hand.L.palm;
  const dropK = clamp01((t - k.drop) / 0.45);
  const holdKnife = t > k.cut - 0.05 && t < k.tie - 0.1, holdRope = t > k.tie && t < k.d3; // held only while she waves them (D1-D2)
  const samPose: PoseIn = t > k.no - 0.1 && t < k.d4 ? {a: 'sitSlump', b: 'cheeks', k: 0} : 'sitSlump';
  const jolt = take(t, k.no, 0.5);
  return (
    <>
      <Scene bg={SNAKE_PLACE.trail}>
        <TrailScene tail={0} />
        <PersonAt spec={SAM} {...samRock} pose={samPose} expr={t > k.no - 0.1 && t < k.d4 ? 'angry' : 'neutral'} look={[-0.8, 0.1]} talk={talkSmooth(s, 'patient')} blink={blink(t, 3)} />
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${(bounce + jolt.dy * 0.5).toFixed(1)}px)`}}>
          <PersonAt spec={MOM} {...momO} expr={t > k.d4 ? 'neutral' : 'worried'} look={[0.8, 0.3]} talk={talkSmooth(s, 'mom')} blink={blink(t, 3)} />
        </div>
        {holdKnife && <Put x={palm[0] + 20} y={palm[1] - 30} size={170} rot={-60}><Knife /></Put>}
        {holdRope && <Put x={palm[0] + 30} y={palm[1]} size={170}><Rope /></Put>}
        {dropK > 0 && dropK < 1 && (
          <>
            <Put x={mx + 120} y={lerp(1060, FEET_Y - 30, dropK * dropK)} size={170} rot={-60 + dropK * 140}><Knife /></Put>
            <Put x={mx + 170} y={lerp(1100, FEET_Y - 20, dropK * dropK)} size={170} rot={dropK * 90}><Rope /></Put>
          </>
        )}
        {dropK >= 1 && t < k.d4 && (
          <>
            <Put x={mx + 120} y={FEET_Y - 30} size={170} rot={80}><Knife /></Put>
            <Put x={mx + 170} y={FEET_Y - 20} size={170} rot={90}><Rope /></Put>
          </>
        )}
        {t > k.calling - 0.05 && <Put x={hand.R.palm[0] < hand.L.palm[0] ? hand.L.palm[0] : hand.R.palm[0]} y={palm[1] - 10} size={80}><Shape d="M -26 -46 L 26 -46 L 26 46 L -26 46 Z" fill={CLOTH.charcoal} shadow={0.3} /></Put>}
        <GangBubble t={t} k={k} />
      </Scene>
      <Burst t={t} t0={k.pop} x={BUBBLE[0]} y={BUBBLE[1]} r={200} />
      <Burst t={t} t0={k.rings + 0.15} x={palm[0]} y={palm[1]} r={60} col={CLOTH.yellow} />
    </>
  );
};
const viewD = byLine({D2: {x: 560, y: 520, z: 1.6}}, WIDE);

// =================================================================== E: inside, the drip: Antivenom arrives
//   0.00 golden drip drops pour in from the top; E1 "drip?" Numb hides behind Bleed
//   E2 "Antivenom." Antivenom lands, shining (a burst); "best" ONE punch: the gang flies off, knocked out (dial knock)
const AV: [number, number] = [330, 1240];
const timesE = (s: ShotNow) => {
  const e2 = at(s, 'E2', undefined, 1.9);
  return {drip: at(s, 'E1', 'drip', 1.2), e2, av: at(s, 'E2', 'antivenom', e2), best: at(s, 'E2', 'best', e2 + 1.2)};
};
const ShotE: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesE(s);
  const land = keyed(t, 0, [[k.av - 0.2, 1, 0.35, 'back']]);
  const knock = keyed(t, 0, [[k.best + 0.05, 1, 0.5, 'out']]);
  const hide = keyed(t, 0, [[k.drip, 1, 0.3]]);
  const af = openFace(s, 'antivenom', 4, 'happy');
  const nf = openFace(s, 'numb', 1, 'scared');
  return (
    <>
      <Scene bg={SNAKE_PLACE.leg}>
        <LegInside swell={0.6} light={0.3} />
        <Svg>
          {/* the drip: golden drops falling from a thin line at the top */}
          <path d="M 540 -40 L 540 120" stroke={INK} strokeWidth={10} />
          <path d="M 540 -40 L 540 120" stroke="#f6fbff" strokeWidth={5} />
          {Array.from({length: 5}, (_, i) => { const u = ((t * 0.9 + i / 5) % 1); const y = 140 + u * 900; return <circle key={i} cx={540 + Math.sin(i * 2) * 20} cy={y} r={14} fill={tint(VENOM.hero, 0.1)} {...EDGE_IN} opacity={1 - u * 0.5} />; })}
        </Svg>
        {/* the gang: Bleed in front, Numb hiding behind him; on the punch they fly off, knocked out */}
        <Put x={lerp(800, 1180, knock)} y={lerp(1160, 700, knock)} size={360} rot={lerp(6, 90, knock)}><Bleed mood={knock > 0.3 ? 'dizzy' : 'scared'} mouth={knock > 0.3 ? 'wavy' : 'o'} arms="droop" knocked={knock} /></Put>
        <Put x={lerp(lerp(780, 900, hide), 1200, knock)} y={lerp(lerp(1080, 1110, hide), 1300, knock)} size={300} rot={lerp(-6, 120, knock)}><Numb mood={knock > 0.3 ? 'dizzy' : nf.mood} mouth={knock > 0.3 ? 'wavy' : nf.mouth} arms="droop" knocked={knock} look={[-0.8, -0.2]} /></Put>
        {land > 0.01 && <Put x={AV[0]} y={lerp(-200, AV[1], land)} size={480}><Antivenom mood={t > k.best - 0.1 ? 'angry' : af.mood} mouth={af.mouth} arms={t > k.best - 0.1 && t < k.best + 0.6 ? 'punch' : 'hips'} look={[0.8, 0]} /></Put>}
      </Scene>
      <Burst t={t} t0={k.av + 0.15} x={AV[0]} y={AV[1] + 200} r={160} col={tint(VENOM.hero, 0.2)} />
      <Burst t={t} t0={k.best} x={700} y={1180} r={180} />
    </>
  );
};
const TagE = tagVia(() => WIDE);
const ScreenE: React.FC<{s: ShotNow}> = ({s}) => <TagE s={s} label="ANTIVENOM" x={AV[0]} y={AV[1] - 40} r={170} t={s.t - timesE(s).av - 0.4} />;

// =================================================================== F: the hospital, Dr. Mira (the answer)
//   0.00 Sam in the bed with the drip; F1 (cut: Mira medium) "venom" she holds up her clipboard; "no" she shakes her head
//   F2 (cut: Mira close) "tell" a shrug; "venomous." two little snake cards with a "?" pop up beside her; "checked." a nod
const miraF = {view: 'three-quarter' as const, facing: 'left' as const, x: 760, y: FEET_Y - 22, scale: PEOPLE_SCALE};
const timesF = (s: ShotNow) => {
  const f1 = at(s, 'F1', undefined, 0.6), f2 = at(s, 'F2', undefined, 3.4);
  return {f1, venom: at(s, 'F1', 'venom', f1 + 1.6), no: at(s, 'F1', 'no', f1 + 1.3), f2, tell: at(s, 'F2', 'tell', f2 + 0.8), venomous: at(s, 'F2', 'venomous', f2 + 1.8), checked: at(s, 'F2', 'checked', f2 + 3.0)};
};
const SnakeCard: React.FC<{q?: boolean}> = ({q}) => (
  <g>
    <Shape d="M -70 -60 H 70 Q 84 -60 84 -46 V 46 Q 84 60 70 60 H -70 Q -84 60 -84 46 V -46 Q -84 -60 -70 -60 Z" fill="#ffffff" shadow={0.4} />
    {q ? <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={90} fill={CLOTH.red}>?</text>
      : <path d="M -50 20 Q -30 -20 0 10 Q 30 40 50 -10" stroke={CLOTH.green} strokeWidth={16} strokeLinecap="round" fill="none" />}
  </g>
);
const ShotF: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesF(s);
  const pose = poseAt(t, [[-9, 'rest'], [k.venom - 0.2, 'clipboard', 0.25], [k.tell - 0.1, 'shrug2', 0.2], [k.checked - 0.1, 'thumbsUp', 0.25]]);
  const shakeHead = t > k.no && t < k.no + 0.6 ? Math.sin((t - k.no) * 20) * 0.5 : 0;
  const cards = pop(t, k.venomous - 0.05, 0.3);
  return (
    <Scene bg={SNAKE_PLACE.ward}>
      <HospitalBed expr={t > k.checked ? 'happy' : 'neutral'} />
      <PersonAt spec={MIRA} {...miraF} pose={pose} expr="neutral" look={[shakeHead - 0.4, 0.1]} talk={talkSmooth(s, 'doctor')} blink={blink(t, 3)} />
      {cards > 0.01 && (
        <Svg>
          <g transform={`translate(600 600) scale(${(cards * 0.42).toFixed(3)})`}><SnakeCard /></g>
          <g transform={`translate(680 540) scale(${(cards * 0.42).toFixed(3)})`}><SnakeCard q /></g>
          <g transform={`translate(760 600) scale(${(cards * 0.42).toFixed(3)})`}><SnakeCard /></g>
        </Svg>
      )}
    </Scene>
  );
};
const viewF = byLine({F1: {x: 760, y: 900, z: 1.5}, F2: {x: 700, y: 720, z: 2.25}}, WIDE);

// =================================================================== G: the loop: Numb, knocked out
//   0.00 Numb lies knocked out, stars spinning; "snake" he lifts his head, dizzy; "again!" he flops back down
const timesG = (s: ShotNow) => ({snake: at(s, 'G1', 'snake', 0.6), again: at(s, 'G1', 'again', 2.4)});
const ShotG: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesG(s);
  const lift = keyed(t, 0, [[k.snake, 1, 0.3, 'back'], [k.again + 0.1, 0, 0.2, 'out']]);
  return (
    <>
      <Scene bg={SNAKE_PLACE.leg}>
        <LegInside swell={0.3} light={0.3} />
        <Put x={540} y={1180 - lift * 80} size={600} rot={lerp(70, 20, lift)}><Numb mood="dizzy" mouth={lift > 0.5 ? 'big' : 'wavy'} arms={lift > 0.5 ? 'point' : 'droop'} knocked={1 - lift * 0.4} look={[0, 0.3]} /></Put>
      </Scene>
      <Burst t={t} t0={k.again + 0.25} x={540} y={1380} r={150} />
    </>
  );
};

// ------------------------------------------------------------------ the shots
const face = (x: number, y: number, r: number): Focus => ({x, y, r});
export const SNAKE_BITE_SHOTS: Record<string, ShotDef> = {
  A: {Scene: ShotA, focus: () => face(540, 1500, 200), view: () => WIDE},
  B: {Scene: ShotB, Screen: ScreenB, focus: () => face(540, 1500, 150), view: viewB},
  C: {Scene: ShotC, focus: () => face(780, 800, 120), view: viewC},
  D: {Scene: ShotD, focus: () => face(330, 700, 120), view: viewD},
  E: {Scene: ShotE, Screen: ScreenE, focus: () => face(330, 1240, 170), view: () => WIDE},
  F: {Scene: ShotF, focus: () => face(760, 700, 120), view: viewF},
  G: {Scene: ShotG, focus: () => face(540, 1180, 200), view: () => WIDE},
};
void OUTLINE;

// ------------------------------------------------------------------ the end card's icons (round badges, like the others)
const Badge: React.FC<{bg: string; children: React.ReactNode; id: string}> = ({bg, children, id}) => (
  <g>
    <circle cx={0} cy={0} r={92} {...EDGE} fill={bg} />
    <clipPath id={id}><circle cx={0} cy={0} r={90} /></clipPath>
    <g clipPath={`url(#${id})`}><circle cx={0} cy={110} r={120} fill={shade(bg, 0.12)} />{children}</g>
    <circle cx={0} cy={0} r={92} {...OUTLINE} />
  </g>
);
/** "NEVER CUT, SUCK OR TIE": a knife and a rope, crossed out. */
const NoMythBadge: React.FC = () => (
  <Badge bg="#ffffff" id="sb-myth">
    <g transform="translate(-10 -10) scale(0.7) rotate(-30)"><Knife /></g>
    <g transform="translate(20 30) scale(0.6)"><Rope /></g>
    <path d="M -62 -62 L 62 62" stroke={INK} strokeWidth={20} strokeLinecap="round" />
    <path d="M -62 -62 L 62 62" stroke={CLOTH.red} strokeWidth={12} strokeLinecap="round" />
  </Badge>
);
/** "STAY CALM, KEEP IT STILL": a calm face. */
const CalmBadge: React.FC = () => (
  <Badge bg={tint(CLOTH.sky, 0.3)} id="sb-calm">
    <circle cx={0} cy={0} r={58} fill={tint(CLOTH.yellow, 0.3)} {...EDGE_IN} />
    <path d="M -28 -8 Q -18 -2 -8 -8 M 8 -8 Q 18 -2 28 -8" {...OUTLINE} />
    <path d="M -20 20 Q 0 32 20 20" {...OUTLINE} />
  </Badge>
);
/** "GET EVERY BITE CHECKED": a hospital cross. */
const CheckBadge: React.FC = () => (
  <Badge bg={tint(CLOTH.red, 0.75)} id="sb-check">
    <path d="M -18 -60 H 18 V -18 H 60 V 18 H 18 V 60 H -18 V 18 H -60 V -18 H -18 Z" fill={CLOTH.red} {...EDGE_IN} />
  </Badge>
);
export const SNAKE_BITE_CTA: {title: string; points: CtaPoint[]; voice?: string; seconds: number; at: {head: number; points: [number, number, number]; follow: number}} = {
  title: 'SNAKE BITE: KNOW THIS',
  // read by the narrator (Joey): his clip and its real beats come in automatically from videos/snake-bite/cta-timings.json
  seconds: 12.5,
  at: {head: 0, points: [2.0, 4.6, 7.0], follow: 9.6},
  points: [
    {icon: <NoMythBadge />, big: 'NEVER CUT, SUCK OR TIE', small: 'the bite'},
    {icon: <CalmBadge />, big: 'STAY CALM, KEEP IT STILL', small: 'and call for help'},
    {icon: <CheckBadge />, big: 'GET EVERY BITE CHECKED', small: 'you cannot tell'},
  ],
};
