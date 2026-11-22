/**
 * "What Happens to Your Body When You Fast" (`fasting`) in look v8: its seven shots by id (videos/fasting/toon.json) and its
 * CTA end card. Shape `clock`: Grandpa's 16-hour overnight fast.
 *
 * Second cut (2026-11-22, the owner on the first: "not interesting and not visual, confusion, hook is not good, camera jump bugs"):
 *   - the hook opens INSIDE: the whole stomach fills the frame, screaming at the lens ("When you fast sixteen hours, I scream!")
 *   - one colour per place (stomach orange, liver teal, brain purple, the room plum), quiet backgrounds, one or two characters
 *   - big physical pictures: the hunger WAVE, the liver's FUEL GAUGE falling to EMPTY with an alarm, the body's FURNACE that Lardo
 *     shovels fat into, its lever clanking from SUGAR to FAT
 *   - Grandpa acts in silent beats: he sneaks to the biscuit tin at 4 h (the clock alarm stops him), sleeps through to 12 h, dashes
 *     to breakfast at 16 h
 *   - ONE framing per place: no reframe inside a shot (pipeline/test/views.test.mjs reads the real framings)
 *   - a clock badge in the corner of every body shot says the hour
 */
import React from 'react';
import {Put, Scene} from './scene';
import {CharTag, type CtaPoint} from './hud';
import {arc, Burst, easeOut, hop, keyed, shake, take} from './act';
import {FEET_Y, PEOPLE_SCALE} from './scenes-rooms';
import {castById, PersonAt, type PoseIn, type PoseName} from './people-rig';
import {Brain} from './organs-a';
import {CLOTH, EDGE, EDGE_IN, FONT, INK, OUTLINE, Shape, shade, tint} from './kit';
import {active, blink, bodyFace, clamp01, go, lerp, pop, since, talkSmooth, type Focus, type ShotDef, type ShotNow} from './play';
import {BrainFull, LiverFull} from './sugar-organs';
import {BiscuitTin, FAST_ROOM, FastClock, FastRoom, FuelGauge, Furnace, Lardo, PLACE, Snore, StomachFull} from './fast-art';
import {gestureAt, type ArmPose} from './organ-act';

const GRANDPA = castById('grandpa');

// ------------------------------------------------------------------ helpers (as in quit-sugar.tsx)
const at = (s: ShotNow, id: string, word: string | undefined, dflt: number) => { const u = since(s, id, word); return u <= -900 ? dflt : s.t - u; };
type Step = [number, PoseName, number?];
const poseAt = (t: number, steps: Step[]): PoseIn => {
  let i = -1;
  for (let j = 0; j < steps.length; j++) if (t >= steps[j][0]) i = j;
  if (i <= 0) return steps[0][1];
  const [t0, b, d = 0.35] = steps[i];
  const k = go(t, t0, d);
  return k >= 1 ? b : {a: steps[i - 1][1], b, k};
};
const openFace = (s: ShotNow, who: string, seed: number, rest: string) => {
  const f = bodyFace(s, who, seed, rest);
  return f.mood === 'happy' && active(s, who) > 0.3 ? {...f, mood: 'open' as const} : f;
};
const frameOf = (k: number, p: [number, number], to: [number, number]) => `translate(${(to[0] - p[0] * k).toFixed(1)}px, ${(to[1] - p[1] * k).toFixed(1)}px) scale(${k})`;
type View = {x: number; y: number; z: number};
const WIDE: View = {x: 540, y: 960, z: 1};
const ROOM_VIEW: View = {x: 600, y: 960, z: 1.06};
const tagAt = (view: View) => {
  const T: React.FC<{label: string; x: number; y: number; r: number; t: number; dur?: number}> = ({label, x, y, r, t, dur}) =>
    <CharTag label={label} x={540 + (x - view.x) * view.z} y={960 + (y - view.y) * view.z} r={r * view.z} t={t} dur={dur} />;
  return T;
};
const Tag = tagAt(WIDE);
/** A yellow number tag, shown from `word` to the end of its line (text on the screen, after the camera). */
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
      padding: '10px 30px', fontFamily: 'Poppins, Inter, sans-serif', fontWeight: 900, fontSize: 68, color: INK, whiteSpace: 'nowrap', boxShadow: `0 8px 0 ${INK}`}}>{text.toUpperCase()}</div>
  );
};
/** The hour badge in the corner of a body shot: a small copy of Grandpa's wall clock (where we are in the fast). */
const HourBadge: React.FC<{hours: number}> = ({hours}) => (
  <svg style={{position: 'absolute', left: 40, top: 230, overflow: 'visible'}} width={200} height={200} viewBox="-160 -160 320 320">
    <FastClock hours={hours} />
  </svg>
);

// ------------------------------------------------------------------ the room (the clock, Grandpa's silent beats)
const CLOCK: [number, number] = [860, 385];
const gpRoom = {view: 'three-quarter' as const, facing: 'right' as const, x: 620, y: FEET_Y - 22, scale: PEOPLE_SCALE};
const TIN: [number, number] = [900, 1170];
/** A room picture at ROOM_VIEW (a wide, steady framing of Grandpa's living room). */
const RoomPic: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: FAST_ROOM.wall}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: frameOf(ROOM_VIEW.z, [ROOM_VIEW.x, ROOM_VIEW.y], [540, 960])}}>
      <Scene bg={FAST_ROOM.wall}>{children}</Scene>
    </div>
  </div>
);
/** 4 h, silent (the first 1.6 s of B): the clock jumps 0 -> 4 h; Grandpa sneaks a hand to the biscuit tin; the ALARM rings
 *  (the clock shakes, a burst) and he snatches his hand back. */
const SNEAK = {jump: 0.5, reach: 0.55, alarm: 1.05};
const SneakBeat: React.FC<{t: number}> = ({t}) => {
  const hours = lerp(0, 4, easeOut(clamp01(t / SNEAK.jump)));
  const alarm = t > SNEAK.alarm;
  const ring = alarm ? Math.sin((t - SNEAK.alarm) * 60) * 7 : 0;
  const pose = poseAt(t, [[-9, 'rest'], [SNEAK.reach, 'offer', 0.35], [SNEAK.alarm + 0.05, 'cheeks', 0.12]]);
  const tk = take(t, SNEAK.alarm, 0.8);
  return (
    <>
      <RoomPic>
        <FastRoom hours={hours} plate="away" plateX={1000} clockShake={ring} sec={t * 60} />
        <Put x={TIN[0] - 60} y={TIN[1]} size={240}><BiscuitTin open={keyed(t, 0, [[SNEAK.reach + 0.2, 1, 0.25], [SNEAK.alarm, 0, 0.1, 'snap']])} /></Put>
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${tk.dy.toFixed(1)}px)`}}>
          <PersonAt spec={GRANDPA} {...gpRoom} pose={pose} expr={alarm ? 'surprised' : 'happy'} look={alarm ? [0.7, -0.8] : [0.8, 0.5]} blink={alarm ? 0 : blink(t, 3)} />
        </div>
      </RoomPic>
      <Burst t={t} t0={SNEAK.alarm} x={540 + (CLOCK[0] - ROOM_VIEW.x) * ROOM_VIEW.z} y={960 + (CLOCK[1] - ROOM_VIEW.y) * ROOM_VIEW.z} r={190} col={CLOTH.yellow} />
    </>
  );
};
/** 4 -> 12 h, silent (the first 1.4 s of C): Grandpa asleep in the armchair, snoring; the clock spins to 12 h. */
const SleepBeat: React.FC<{t: number}> = ({t}) => {
  const hours = lerp(4, 12, clamp01((t - 0.1) / 1.1));
  return (
    <RoomPic>
      <FastRoom hours={hours} plate="away" plateX={1000} sec={t * 600} lamp />
      <PersonAt spec={GRANDPA} pose="sitSlump" view="three-quarter" facing="right" expr="sleepy" look={[0, 0.5]} x={450} y={1520} scale={PEOPLE_SCALE} blink={1} />
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} viewBox="0 0 1080 1920"><Snore t={t} x={560} y={760} /></svg>
    </RoomPic>
  );
};

// =================================================================== A: the hook, INSIDE, then Grandpa
//   A1  (inside) the whole stomach fills the frame, screaming at the lens; it PUNCHES at the lens at 0.05 s (a burst, the screen
//       shakes); "scream" both fists up, a big squash
//   A2  (the room, a hard cut) Grandpa, grinning: "Sixteen" he slides his plate away and points up at the clock; "Scared" he
//       points down at his belly; "stomach?" he pats it
const timesA = (s: ShotNow) => {
  const a2 = at(s, 'A2', undefined, 1.7);
  return {fast: at(s, 'A1', 'fast', 0.7), scream: at(s, 'A1', 'scream', 1.1), a2, sixteen: at(s, 'A2', 'sixteen', a2), scared: at(s, 'A2', 'scared', a2 + 1.4), stomach: at(s, 'A2', 'stomach', a2 + 2.6)};
};
const ShotA: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesA(s);
  if (t < k.a2) {
    const sf = openFace(s, 'stomach', 3, 'angry');
    const punch = keyed(t, 0, [[0, 1, 0.12, 'out'], [0.2, 0, 0.3, 'back']]);
    const armR: ArmPose = gestureAt(t, [[-9, 'pound'], [0.25, 'up', 0.2], [k.scream - 0.05, 'pound', 0.1], [k.scream + 0.3, 'up', 0.2]]);
    const armL: ArmPose = gestureAt(t, [[-9, 'up'], [k.scream, 'pound', 0.1], [k.scream + 0.35, 'up', 0.2]]);
    const big = keyed(t, 0, [[k.scream, 0.08, 0.08, 'out'], [k.scream + 0.12, 0, 0.3, 'back']]);
    const [sx, sy] = shake(t, 0.02, 26, 0.35);
    const zoom = 1 + punch * 0.12;
    const rear = keyed(t, 0, [[k.fast - 0.05, -5, 0.2], [k.scream - 0.05, 4, 0.1, 'out'], [k.scream + 0.3, 0, 0.3]]);
    return (
      <>
        <div style={{position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px) scale(${zoom.toFixed(4)})`, transformOrigin: '700px 900px'}}>
          <StomachFull t={t} place={PLACE.stomach} growl={0} mood="angry" mouth={active(s, 'stomach') > 0.3 ? sf.mouth : 'big'} look={[0, 0.1]} armL={armL} armR={armR} sq={big} rot={rear} />
        </div>
        <Burst t={t} t0={0.02} x={860} y={760} r={220} />
      </>
    );
  }
  const slide = keyed(t, 0, [[k.sixteen, 1, 0.4, 'out']]);
  const pose = poseAt(t, [[-9, 'rest'], [k.sixteen - 0.1, 'offer', 0.2], [k.sixteen + 0.55, 'point', 0.25], [k.scared - 0.1, 'explainLow', 0.25]]);
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: FAST_ROOM.wall}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: frameOf(1.7, [610, 860], [540, 960])}}>
        <Scene bg={FAST_ROOM.wall}>
          <FastRoom hours={0} plate="full" plateX={lerp(900, 958, slide)} sec={Math.floor(t)} />
          <PersonAt spec={GRANDPA} {...gpRoom} pose={pose} expr={active(s, 'grandpa') > 0.3 ? 'talking' : 'happy'} look={t > k.scared - 0.1 ? [-0.7, 0.8] : t > k.sixteen + 0.5 ? [0.7, -0.8] : [-0.6, 0.5]} talk={talkSmooth(s, 'grandpa')} blink={blink(t, 3)} />
        </Scene>
      </div>
    </div>
  );
};
const ScreenA: React.FC<{s: ShotNow}> = ({s}) => (s.t < timesA(s).a2 ? <HourBadge hours={0} /> : null);

// =================================================================== B: 4 h, the stomach and the hunger WAVE
//   0.0-1.6  the room: the clock jumps to 4 h, Grandpa sneaks to the biscuit tin, the ALARM rings, he snatches his hand back
//   B1   "Feed" a punch (held), "FEED" the other fist (a burst, the screen shakes)
//   B2   "Hunger" the Brain drops in on its thread; "waves," a big blue wave rises across the frame, then sinks; "meal" again
//   B3   "drops" the wave sinks away; the stomach's fists fall, it blinks, surprised
const BLEAD = 1.6;
const BRAIN_PEEK: [number, number] = [820, 360];
const timesB = (s: ShotNow) => {
  const b2 = at(s, 'B2', undefined, 3.2), b3 = at(s, 'B3', undefined, 6.2);
  return {feed: at(s, 'B1', 'feed', 1.7), feed2: at(s, 'B1', 'FEED', 2.4), b2, hunger: at(s, 'B2', 'hunger', b2), waves: at(s, 'B2', 'waves', b2 + 0.7), meal: at(s, 'B2', 'meal', b2 + 1.9), b3, drops: at(s, 'B3', 'drops', b3 + 0.7)};
};
const BrainPeek: React.FC<{t: number; t0: number; mood?: string; mouth?: string; look?: [number, number]; size?: number}> = ({t, t0, mood = 'open', mouth = 'smile', look = [-0.5, 0.6], size = 400}) => {
  const k = keyed(t, 0, [[t0 - 0.2, 1, 0.4, 'back']]);
  if (k < 0.01) return null;
  const u = Math.max(0, t - t0 - 0.2);
  const sw = 12 * Math.exp(-u * 3.2) * Math.sin(u * 7);
  return (
    <Put x={BRAIN_PEEK[0] + sw * 6} y={lerp(-220, BRAIN_PEEK[1], k)} size={size} rot={lerp(20, -6, k) + sw}>
      <path d="M 0 -60 L 0 -400" stroke={INK} strokeWidth={4} />
      <Brain mood={mood as never} mouth={mouth as never} look={look} />
    </Put>
  );
};
const ShotB: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesB(s);
  if (t < BLEAD) return <SneakBeat t={t} />;
  const sf = openFace(s, 'stomach', 3, 'angry');
  const wave = keyed(t, 0, [[k.waves, 0.9, 0.5], [k.waves + 0.9, 0.3, 0.6], [k.meal, 0.85, 0.5], [k.meal + 0.9, 0.3, 0.6], [k.drops, 0, 0.8]]);
  const armR: ArmPose = gestureAt(t, [[-9, 'up'], [k.feed - 0.05, 'pound', 0.1], [k.feed + 0.35, 'up', 0.2], [k.b2 - 0.1, 'fold', 0.3], [k.drops, 'rest', 0.4]]);
  const armL: ArmPose = gestureAt(t, [[-9, 'up'], [k.feed2 - 0.05, 'pound', 0.1], [k.feed2 + 0.35, 'up', 0.2], [k.b2 - 0.1, 'hips', 0.3], [k.drops, 'rest', 0.4]]);
  const big = keyed(t, 0, [[k.feed2, 0.08, 0.08, 'out'], [k.feed2 + 0.12, 0, 0.3, 'back']]);
  const calm = t > k.drops;
  const bf = openFace(s, 'brain', 2, 'neutral');
  const [sx, sy] = shake(t, k.feed2, 22, 0.35);
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)`}}>
      <StomachFull t={t} place={PLACE.stomach} wave={wave} growl={0} mood={calm ? 'open' : 'angry'} mouth={calm && active(s, 'stomach') < 0.3 ? 'o' : active(s, 'stomach') > 0.3 ? sf.mouth : 'grit'} look={t > k.hunger ? [0.6, -0.7] : [0, 0.1]} armL={armL} armR={armR} sq={big + keyed(t, 0, [[k.drops, -0.04, 0.5]])} />
      <BrainPeek t={t} t0={k.hunger} mood={bf.mood} mouth={bf.mouth} look={[-0.6, 0.6]} />
      <Burst t={t} t0={k.feed2} x={520} y={1250} r={170} />
    </div>
  );
};
const ScreenB: React.FC<{s: ShotNow}> = ({s}) => {
  if (s.t < BLEAD) return null;
  return (
    <>
      {s.cur?.id !== 'B2' && <HourBadge hours={4} />}
      {s.cur?.id !== 'B2' && <Tag label="STOMACH" x={716} y={860} r={190} t={s.t - BLEAD - 0.15} />}
      {s.cur?.id === 'B2' ? <CharTag label="BRAIN" x={540 + (BRAIN_PEEK[0] - 760) * 1.6} y={960 + (BRAIN_PEEK[1] - 640) * 1.6} r={120 * 1.6} t={s.t - timesB(s).hunger - 0.25} /> : null}
    </>
  );
};

// =================================================================== C: 12 h, the liver and its FUEL GAUGE
//   0.0-1.4  the room: Grandpa asleep in the armchair, snoring; the clock spins to 12 h
//   C1   (the liver on teal, the gauge on the wall above it) "sugar" the liver points up at the gauge (FULL); "low..." the needle falls
//   C2   "twelve" the needle hits EMPTY; "dry!" the alarm lamp flashes red, the liver throws its hands to its face (a jolt)
const CLEAD = 1.4;
const GAUGE: [number, number] = [790, 400];
const LIVER_AT: [number, number, number] = [520, 1010, 1];
const timesC = (s: ShotNow) => {
  const c2 = at(s, 'C2', undefined, 4.2);
  return {sugar: at(s, 'C1', 'sugar', 1.8), low: at(s, 'C1', 'low', 3.4), c2, twelve: at(s, 'C2', 'twelve', c2 + 0.5), dry: at(s, 'C2', 'dry', c2 + 2.0)};
};
const ShotC: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesC(s);
  if (t < CLEAD) return <SleepBeat t={t} />;
  const lf = openFace(s, 'liver', 5, 'scared');
  const level = keyed(t, 1, [[k.low, 0.3, 0.6], [k.twelve, 0, 0.4]]);
  const shocked = t > k.dry;
  const jolt = take(t, k.dry, 0.5);
  const armR: ArmPose = shocked ? gestureAt(t, [[-9, 'wave'], [k.dry, 'cheek', 0.15]]) : gestureAt(t, [[-9, 'rest'], [k.sugar - 0.15, 'wave', 0.25]]);
  const armL: ArmPose = gestureAt(t, [[-9, 'rest'], [k.dry, 'cheek', 0.15]]);
  return (
    <>
      <LiverFull t={t} fat={0} place={PLACE.liver} at={LIVER_AT} mood={shocked ? 'scared' : lf.mood} mouth={shocked && active(s, 'liver') < 0.3 ? 'o' : lf.mouth} look={[0.7, -0.8]} lift={jolt.dy} armL={armL} armR={armR} />
      <Put x={GAUGE[0]} y={GAUGE[1]} size={560} rot={shocked ? Math.sin(t * 40) * 1.5 * clamp01(1 - (t - k.dry) / 0.6) : 0}><g transform="scale(0.5)"><FuelGauge level={level} alarm={shocked ? t - k.dry : 0} /></g></Put>
      <Burst t={t} t0={k.dry} x={GAUGE[0]} y={GAUGE[1] - 150} r={150} col={CLOTH.red} />
    </>
  );
};
const ScreenC: React.FC<{s: ShotNow}> = ({s}) => {
  if (s.t < CLEAD) return null;
  return (
    <>
      <HourBadge hours={12} />
      <Tag label="LIVER" x={LIVER_AT[0] - 36 * 6.2} y={LIVER_AT[1] - 28 * 6.2} r={170} t={s.t - CLEAD - 0.15} />
      <NumTag s={s} text="about 12 hours" id="C2" word="about" y={1180} />
    </>
  );
};

// =================================================================== D: the switch, the body's FURNACE
//   0.0  (a new framing: the liver smaller, high on the left; the furnace big, bottom right) Lardo pops up with a shovel
//   D1   "turn!" he throws his arms up; "Burning" he shovels a lump of fat into the furnace: it roars up
//   D2   "switches" the furnace lever clanks from SUGAR to FAT (a burst); "fat!" the fire blazes; the liver hops
const FURNACE: [number, number] = [520, 1270];
const LARDO: [number, number] = [170, 1390];
const timesD = (s: ShotNow) => {
  const d2 = at(s, 'D2', undefined, 1.9);
  return {turn: at(s, 'D1', 'turn', 0.5), burn: at(s, 'D1', 'burning', 1.0), d2, sw: at(s, 'D2', 'switches', d2 + 1.2), fat2: at(s, 'D2', 'fat', d2 + 2.3)};
};
const ShotD: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesD(s);
  const lf = openFace(s, 'liver', 5, 'happy');
  const la = openFace(s, 'lardo', 7, 'happy');
  const up = keyed(t, 0, [[0.02, 1, 0.38, 'back']]);
  const lever = keyed(t, 0, [[k.sw, 1, 0.12, 'snap']]);
  const fire = keyed(t, 0.15, [[k.burn + 0.45, 0.6, 0.3, 'out'], [k.fat2, 1, 0.3, 'out']]);
  const hp = hop(t, k.fat2, 50, 0.3);
  const lhp = hop(t, k.turn, 50, 0.3);
  // the shovel throw: back, then a swing toward the furnace; the lump flies in an arc and drops into the fire
  const swing = keyed(t, 0, [[k.burn - 0.1, -1, 0.15], [k.burn + 0.1, 1, 0.15, 'out'], [k.burn + 0.6, 0, 0.3]]);
  const lumpU = (t - k.burn - 0.15) / 0.45;
  const [lx, ly] = arc([LARDO[0] + 150, LARDO[1] - 170], [FURNACE[0] - 20, FURNACE[1] + 20], 260, easeOut(clamp01(lumpU)));
  return (
    <>
      <LiverFull t={t} fat={0} place={PLACE.liver} at={[420, 640, 0.62]} mood={t > k.fat2 ? 'happy' : lf.mood} mouth={t > k.fat2 && active(s, 'liver') < 0.3 ? 'big' : lf.mouth} look={[0.6, 0.8]} lift={hp.dy} armL={gestureAt(t, [[-9, 'rest'], [k.fat2 - 0.1, 'up', 0.15]])} armR={gestureAt(t, [[-9, 'rest'], [k.fat2 - 0.1, 'up', 0.15]])} />
      <Put x={FURNACE[0]} y={FURNACE[1]} size={620}><g transform="scale(0.5)"><Furnace fire={fire} lever={lever} t={t} /></g></Put>
      {lumpU > 0 && lumpU < 1 && <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} viewBox="0 0 1080 1920"><ellipse cx={lx} cy={ly} rx={34} ry={26} fill={CLOTH.yellow} {...EDGE_IN} /><circle cx={lx - 10} cy={ly - 8} r={7} fill="#ffffff" /></svg>}
      <Put x={LARDO[0]} y={lerp(1800, LARDO[1], up) + lhp.dy} size={lerp(240, 480, up)} sq={lhp.sq}>
        {/* the shovel, held in his right hand, swinging toward the furnace */}
        <g transform={`rotate(${(swing * 40).toFixed(1)} 40 10)`}>
          <path d="M 40 10 L 150 -40" stroke={INK} strokeWidth={13} strokeLinecap="round" />
          <path d="M 40 10 L 150 -40" stroke={CLOTH.brown} strokeWidth={7} strokeLinecap="round" />
          <Shape d="M 140 -70 L 190 -50 L 176 -10 L 128 -28 Z" fill={tint(CLOTH.grey, 0.2)} shadow={0.3} />
        </g>
        <Lardo mood={la.mood} mouth={la.mouth} arms={t > k.turn - 0.05 && t < k.burn - 0.1 ? 'up' : 'out'} look={[0.8, -0.2]} />
      </Put>
      <Burst t={t} t0={k.sw} x={FURNACE[0] + 330} y={FURNACE[1]} r={100} />
      <Burst t={t} t0={k.burn + 0.6} x={FURNACE[0]} y={FURNACE[1] - 40} r={150} col={CLOTH.orange} />
    </>
  );
};
const ScreenD: React.FC<{s: ShotNow}> = ({s}) => (
  <>
    <HourBadge hours={12} />
    <Tag label="LARDO (FAT CELL)" x={LARDO[0]} y={LARDO[1] - 40} r={150} t={s.t - 0.4} />
  </>
);

// =================================================================== E: 16 h, the room (the twist)
//   0.0-1.0  the clock RINGS at 16 h; Grandpa DASHES across the room to his breakfast (speed lines)
//   E1   "Sixteen" a big thumbs-up; "melts" his arm spreads proudly; "faster?" he rubs his chin
//   E2   "year-long" Lardo leaps onto the side table in an arc; "every" he counts on his fingers
//   E3   "same" Lardo shrugs with a hop; "less." Grandpa's big take, hands to his cheeks
const ELEAD = 1.0;
const LARDO_E: [number, number] = [850, 1078];
const timesE = (s: ShotNow) => {
  const e2 = at(s, 'E2', undefined, 4.6), e3 = at(s, 'E3', undefined, 7.4);
  return {sixteen: at(s, 'E1', 'sixteen', 1.1), melts: at(s, 'E1', 'melts', 2.6), faster: at(s, 'E1', 'faster', 3.0), e2, year: at(s, 'E2', 'year-long', e2 + 0.4), every: at(s, 'E2', 'every', e2 + 1.4), e3, same: at(s, 'E3', 'same', e3 + 0.8), less: at(s, 'E3', 'less', e3 + 1.9)};
};
const ShotE: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesE(s);
  const ring = t < 0.7 ? Math.sin(t * 60) * 7 * (1 - t / 0.7) : 0;
  const dash = easeOut(clamp01((t - 0.15) / 0.6));
  const x = lerp(150, 520, dash);
  const bounce = dash < 1 ? -Math.abs(Math.sin(dash * Math.PI * 4)) * 26 : 0;
  const pose = poseAt(t, [[-9, 'worried'], [0.75, 'rest', 0.2], [k.sixteen - 0.15, 'thumbsUp', 0.25], [k.melts - 0.1, 'explain', 0.25], [k.faster - 0.1, 'think', 0.25], [k.less - 0.05, 'cheeks', 0.15]]);
  const up = keyed(t, 0, [[k.year - 0.45, 1, 0.5, 'out']]);
  const la = openFace(s, 'lardo', 7, 'neutral');
  const lhp = hop(t, k.same, 46, 0.3);
  const jolt = take(t, k.less, 0.8);
  const down = t > k.less;
  return (
    <RoomPic>
      <FastRoom hours={16} plate="breakfast" lamp={false} plateX={968} clockShake={ring} sec={Math.floor(t)} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${(jolt.dy + bounce).toFixed(1)}px)`}}>
        <PersonAt spec={GRANDPA} view="three-quarter" facing="right" x={x} y={FEET_Y - 22} scale={PEOPLE_SCALE} pose={pose} expr={down ? 'worried' : active(s, 'grandpa') > 0.3 ? 'talking' : 'happy'} look={t > k.e2 ? [0.9, 0.3] : [0.6, 0]} talk={talkSmooth(s, 'grandpa')} blink={blink(t, 3)} />
      </div>
      {dash > 0 && dash < 1 && <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} viewBox="0 0 1080 1920">{[900, 1100, 1300].map((y, i) => <path key={i} d={`M ${(x - 260 - i * 30).toFixed(0)} ${y} L ${(x - 120).toFixed(0)} ${y}`} stroke={INK} strokeWidth={8} strokeLinecap="round" opacity={1 - dash} />)}</svg>}
      {up > 0.01 && (
        <Put x={lerp(1060, LARDO_E[0], up)} y={lerp(1560, LARDO_E[1], up) - Math.sin(clamp01(up) * Math.PI) * 260 + lhp.dy} size={300} rot={lerp(30, 0, clamp01(up))} sq={lhp.sq}>
          <Lardo mood={t > k.same && t < k.less ? 'bored' : la.mood} mouth={la.mouth} arms={t > k.every && t < k.same ? 'out' : t > k.same ? 'down' : 'hips'} look={[-0.8, 0]} />
        </Put>
      )}
    </RoomPic>
  );
};

// =================================================================== F: the whole brain on purple (the care line)
//   F1   "isn't" it wags a finger; F2 "Pregnant?" one hand up; "disorder?" the other; "doctor" it points and leans to the lens
const timesF = (s: ShotNow) => {
  const f2 = at(s, 'F2', undefined, 1.6);
  return {isnt: at(s, 'F1', "isn't", 0.3), every: at(s, 'F1', 'everyone', 0.9), f2, preg: at(s, 'F2', 'pregnant', f2), dis: at(s, 'F2', 'disorder', f2 + 1.3), doc: at(s, 'F2', 'doctor', f2 + 2.2)};
};
const ShotF: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesF(s);
  const bf = openFace(s, 'brain', 2, 'neutral');
  const lean = keyed(t, 1, [[k.doc, 1.08, 0.3, 'back']]);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '540px 900px', transform: `scale(${lean.toFixed(4)})`}}>
        <BrainFull t={t} place={PLACE.brain} mood={bf.mood} mouth={bf.mouth} look={t > k.doc ? [0, 0] : [0.3, 0.2]}
          armR={t > k.isnt && t < k.isnt + 0.9 ? {a: 'count', b: 'point', k: (Math.sin((t - k.isnt) * 16) + 1) / 2} : gestureAt(t, [[-9, 'rest'], [k.isnt - 0.15, 'count', 0.15], [k.every + 0.3, 'rest', 0.3], [k.dis - 0.1, 'wave', 0.2], [k.doc - 0.1, 'point', 0.2]])}
          armL={gestureAt(t, [[-9, 'rest'], [k.preg - 0.1, 'wave', 0.2]])} />
      </div>
      <Burst t={t} t0={k.dis} x={760} y={420} r={110} col={CLOTH.yellow} />
    </>
  );
};

// =================================================================== G: the stomach again (the answer and the loop)
//   0.0  full and calm after breakfast, it pats its belly (a small burp); G1 "screaming" arms folded, eyes darting; "Me!" the
//   Brain drops in and winks; "scream," the stomach rattles; "stomach!" its jaw drops, a shrug
const timesG = (s: ShotNow) => {
  const g2 = at(s, 'G2', undefined, 2.4);
  return {scr: at(s, 'G1', 'screaming', 0.9), night: at(s, 'G1', 'night', 1.8), g2, me: at(s, 'G2', 'me', g2), scream: at(s, 'G2', 'scream', g2 + 1.6), stom: at(s, 'G2', 'stomach', g2 + 2.6)};
};
const ShotG: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesG(s);
  const sf = openFace(s, 'stomach', 3, 'angry');
  const calm = t < k.scr - 0.3;
  const jaw = t > k.stom;
  const look: [number, number] = t > k.me ? [0.6, -0.7] : t > k.scr ? [Math.sin(t * 4) * 0.8, 0.1] : [0, 0.2];
  const bm = t > k.scream && t < k.scream + 0.5 ? {mood: 'scared', mouth: 'open'} : t > k.me && t < k.me + 0.6 ? {mood: 'wink', mouth: 'smile'} : openFace(s, 'brain', 2, 'happy');
  const pat = t < k.scr - 0.3 ? {a: 'rest' as const, b: 'fold' as const, k: (Math.sin(t * 9) + 1) / 2} : null;
  const armR: ArmPose = pat ?? gestureAt(t, [[-9, 'rest'], [k.scr - 0.2, 'fold', 0.25], [k.stom - 0.05, 'shrug', 0.15]]);
  const armL: ArmPose = gestureAt(t, [[-9, 'rest'], [k.scr - 0.2, 'fold', 0.25], [k.stom - 0.05, 'shrug', 0.15]]);
  const burp = keyed(t, 0, [[0.15, 0.05, 0.1, 'out'], [0.3, 0, 0.3, 'back']]);
  const rattle = t > k.scream && t < k.scream + 0.5 ? Math.sin((t - k.scream) * 50) * 0.04 : 0;
  return (
    <>
      <StomachFull t={t} place={PLACE.stomach} growl={0} mood={jaw ? 'scared' : calm ? 'happy' : sf.mood} mouth={jaw && active(s, 'stomach') < 0.3 ? 'o' : calm ? 'smile' : sf.mouth} look={look} armL={armL} armR={armR} sq={burp + rattle} />
      <BrainPeek t={t} t0={k.me} mood={bm.mood} mouth={bm.mouth} look={[-0.6, 0.6]} />
      <Burst t={t} t0={k.me} x={BRAIN_PEEK[0] - 230} y={BRAIN_PEEK[1] + 40} r={110} col={CLOTH.yellow} />
    </>
  );
};

// ------------------------------------------------------------------ the shots: ONE framing each (no reframe inside a shot)
const face = (x: number, y: number, r: number): Focus => ({x, y, r});
export const FASTING_SHOTS: Record<string, ShotDef> = {
  A: {Scene: ShotA, Screen: ScreenA, focus: () => face(716, 860, 190), view: () => WIDE},
  B: {Scene: ShotB, Screen: ScreenB, focus: () => face(716, 860, 190), view: (s) => (s.cur?.id === 'B2' ? {x: 760, y: 640, z: 1.6} : WIDE)},
  C: {Scene: ShotC, Screen: ScreenC, focus: () => face(297, 836, 170), view: () => WIDE},
  D: {Scene: ShotD, Screen: ScreenD, focus: () => face(420, 600, 120), view: () => WIDE},
  E: {Scene: ShotE, focus: () => face(560, 700, 120), view: (s) => (s.cur?.id === 'E2' ? {x: 740, y: 1000, z: 1.6} : WIDE)},
  F: {Scene: ShotF, focus: () => face(390, 612, 160), view: () => WIDE},
  G: {Scene: ShotG, focus: () => face(716, 860, 190), view: () => WIDE},
};
void EDGE; void FONT; void shade; void OUTLINE; void ELEAD;

// ------------------------------------------------------------------ the end card's icons (round badges, like the others)
const Badge: React.FC<{bg: string; children: React.ReactNode; id: string}> = ({bg, children, id}) => (
  <g>
    <circle cx={0} cy={0} r={92} {...EDGE} fill={bg} />
    <clipPath id={id}><circle cx={0} cy={0} r={90} /></clipPath>
    <g clipPath={`url(#${id})`}><circle cx={0} cy={110} r={120} fill={shade(bg, 0.12)} />{children}</g>
    <circle cx={0} cy={0} r={92} {...OUTLINE} />
  </g>
);
/** "HUNGER COMES IN WAVES": a wave that rises and falls. */
const WaveBadge: React.FC = () => (
  <Badge bg={tint(CLOTH.sky, 0.3)} id="fa-wave">
    <path d="M -80 20 C -60 -40 -40 -40 -20 20 C 0 80 20 80 40 20 C 60 -40 80 -40 100 20" stroke={INK} strokeWidth={22} strokeLinecap="round" fill="none" />
    <path d="M -80 20 C -60 -40 -40 -40 -20 20 C 0 80 20 80 40 20 C 60 -40 80 -40 100 20" stroke={CLOTH.blue} strokeWidth={13} strokeLinecap="round" fill="none" />
  </Badge>
);
/** "NO FASTER THAN EATING LESS": a bathroom scale with an equals sign. */
const ScaleBadge: React.FC = () => (
  <Badge bg={tint(CLOTH.yellow, 0.45)} id="fa-scale">
    <Shape d="M -62 -40 H 62 Q 74 -40 74 -28 V 46 Q 74 58 62 58 H -62 Q -74 58 -74 46 V -28 Q -74 -40 -62 -40 Z" fill={tint(CLOTH.grey, 0.4)} />
    <rect x={-34} y={-26} width={68} height={34} rx={6} fill="#1d2430" {...EDGE_IN} />
    <path d="M -16 -14 H 16 M -16 -2 H 16" stroke={CLOTH.yellow} strokeWidth={6} strokeLinecap="round" />
  </Badge>
);
/** "ASK A DOCTOR FIRST": a stethoscope. */
const StethBadge: React.FC = () => (
  <Badge bg="#ffffff" id="fa-steth">
    <path d="M -40 -60 L -40 -10 Q -40 30 0 30 Q 40 30 40 -10 L 40 -60" stroke={INK} strokeWidth={16} strokeLinecap="round" fill="none" />
    <path d="M -40 -60 L -40 -10 Q -40 30 0 30 Q 40 30 40 -10 L 40 -60" stroke={CLOTH.charcoal} strokeWidth={8} strokeLinecap="round" fill="none" />
    <path d="M 0 30 L 0 50 Q 0 70 30 70" stroke={INK} strokeWidth={14} strokeLinecap="round" fill="none" />
    <circle cx={44} cy={70} r={20} fill={tint(CLOTH.grey, 0.3)} {...EDGE_IN} />
  </Badge>
);

// ------------------------------------------------------------------ the CTA end card: three strong points
export const FASTING_CTA: {title: string; points: CtaPoint[]; voice?: string; seconds: number; at: {head: number; points: [number, number, number]; follow: number}} = {
  title: 'FASTING: KNOW THIS',
  // read by the narrator (Joey); the beats are ESTIMATES until his clip is made (then from videos/fasting/cta-timings.json)
  seconds: 13,
  at: {head: 0, points: [2.2, 5.0, 7.9], follow: 10.6},
  points: [
    {icon: <WaveBadge />, big: 'HUNGER COMES IN WAVES', small: 'and it passes'},
    {icon: <ScaleBadge />, big: 'NO FASTER THAN EATING LESS', small: 'in a year-long trial'},
    {icon: <StethBadge />, big: 'ASK A DOCTOR FIRST', small: 'pregnant, or had an eating disorder'},
  ],
};
