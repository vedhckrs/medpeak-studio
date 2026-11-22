/**
 * "What Happens to Your Body When You Fast" (`fasting`) in look v8: its seven shots by id (videos/fasting/toon.json) and its
 * CTA end card. Shape `clock`: Grandpa's 16-hour overnight fast; the big wall clock's red FAST ring is the clock. The owner
 * approved the plan, hook A, Grandpa and the looks on 2026-11-22.
 *
 *   A  0 h, the living room: the Stomach BURSTS on screen at the lens ("When you fast, I scream!"); Grandpa slides his plate
 *      away and points at the clock ("Sixteen hours..."); on "stomach?" the camera dives into his belly: the whole stomach
 *   B  4 h, the whole stomach growls and pounds ("Feed me!"); the Brain peeks down from the top: hunger comes in waves...
 *      and drops again on its own (the growl dies)
 *   C  12 h, the whole liver and its sugar jar: the beads drop away, then the last ones go ("my store runs dry!")
 *   D  the switch: Lardo pops up, fuel drops pop off him; the liver flips its SUGAR/FAT switch
 *   E  16 h, the living room: the clock rings, breakfast; Grandpa proud; Lardo on the side table: no faster than eating less
 *   F  the whole brain: fasting isn't for everyone; pregnant, or had an eating disorder? ask a doctor first
 *   G  the stomach again: "who was screaming at me all night?" The Brain peeks in: "Me!" (the loop)
 *
 * B and C open on the wall clock jumping (the shot's `lead`: the jump plays in silence). Acting kit (act.tsx): key poses
 * that HOLD, one big action per beat, held framings per line (hard cuts).
 */
import React from 'react';
import {Put, Scene} from './scene';
import {CharTag, type CtaPoint} from './hud';
import {Burst, easeOut, hop, keyed, shake, take} from './act';
import {FEET_Y, PEOPLE_SCALE} from './scenes-rooms';
import {castById, headAt, PersonAt, type PoseIn, type PoseName} from './people-rig';
import {Brain, Stomach} from './organs-a';
import {CLOTH, EDGE, EDGE_IN, FONT, INK, OUTLINE, Shape, shade, tint} from './kit';
import {active, blink, bodyFace, clamp01, go, lerp, pop, since, talkSmooth, type Focus, type ShotDef, type ShotNow} from './play';
import {BrainFull, LiverFull} from './sugar-organs';
import {FAST_ROOM, FastRoom, Lardo, STOMACH_FULL, StomachFull, SugarJar} from './fast-art';

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
const tagVia = (view: (s: ShotNow) => View) => {
  const T: React.FC<{s: ShotNow; label: string; x: number; y: number; r: number; t: number; dur?: number}> = ({s, label, x, y, r, t, dur}) => {
    const c = view(s);
    return <CharTag label={label} x={540 + (x - c.x) * c.z} y={960 + (y - c.y) * c.z} r={r * c.z} t={t} dur={dur} />;
  };
  return T;
};
const byLine = (by: Record<string, View>, first: View) => (s: ShotNow) => by[s.cur?.id ?? ''] ?? first;
const WIDE: View = {x: 540, y: 960, z: 1};
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

// ------------------------------------------------------------------ the clock jump (the first 0.6 s of B and C)
const LEAD = 0.6; // the shot's `lead` in toon.json: the clock jumps in silence, the first line starts after it
const CLOCK: [number, number] = [830, 330];
const ClockInsert: React.FC<{t: number; from: number; to: number}> = ({t, from, to}) => {
  const k = easeOut(clamp01((t - 0.06) / 0.4));
  const [sx, sy] = shake(t, 0.46, 10, 0.2);
  return (
    <div style={{position: 'absolute', inset: 0, background: FAST_ROOM.wall, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: `translate(${sx}px, ${sy}px) ${frameOf(2.6, CLOCK, [540, 860])}`}}>
        <Scene bg={FAST_ROOM.wall}><FastRoom hours={lerp(from, to, k)} plate="away" /></Scene>
      </div>
    </div>
  );
};

// =================================================================== A: the hook (0 h, the living room)
//   0.00  the Stomach BURSTS on screen at the lens from the bottom left, fists up ("When you fast, I scream!")
//   "scream" it shakes both fists at Grandpa (a screen shake); Grandpa, smiling, does a small take
//   A2    (close on Grandpa) "Sixteen" he slides his plate away and points up at the clock; on "stomach?" the camera dives
//         into his belly: the whole stomach, already growling
const gpA = {view: 'three-quarter' as const, facing: 'right' as const, x: 560, y: FEET_Y - 22, scale: PEOPLE_SCALE};
const timesA = (s: ShotNow) => {
  const a2 = at(s, 'A2', undefined, 1.5);
  return {scream: at(s, 'A1', 'scream', 1.0), a2, sixteen: at(s, 'A2', 'sixteen', a2), stomach: at(s, 'A2', 'stomach', a2 + 2.6)};
};
const bellyA = (): [number, number] => { const h = headAt(GRANDPA, {...gpA, pose: 'rest'}); return [h.x + h.r * 0.1, h.y + h.r * 3.2]; };
const RoomA: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesA(s);
  const fly = keyed(t, 0, [[0, 1, 0.36, 'back']]);
  const stf = openFace(s, 'stomach', 3, 'angry');
  const slide = keyed(t, 0, [[k.sixteen, 1, 0.4, 'out']]);
  const pose = poseAt(t, [[-9, 'rest'], [k.sixteen - 0.1, 'offer', 0.2], [k.sixteen + 0.55, 'point', 0.25]]);
  const tk = take(t, k.scream + 0.05, 0.5);
  const [shx, shy] = shake(t, k.scream, 14, 0.4);
  const fists = t > k.scream && t < k.scream + 0.6 ? Math.sin((t - k.scream) * 30) * 6 : 0;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${shx}px, ${shy}px)`}}>
      <Scene bg={FAST_ROOM.wall}>
        <FastRoom hours={0} plate="full" plateX={lerp(900, 958, slide)} />
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${tk.dy.toFixed(1)}px)`}}>
          <PersonAt spec={GRANDPA} {...gpA} pose={pose} expr={t < k.a2 ? 'happy' : 'talking'} look={t > k.sixteen + 0.5 ? [0.7, -0.8] : [-0.6, 0.5]} talk={talkSmooth(s, 'grandpa')} blink={blink(t, 3)} />
        </div>
        {/* the Stomach at the lens: in from the bottom left, big, then it holds down there */}
        <Put x={lerp(160, 300, fly)} y={lerp(2100, 1480, fly) + fists} size={lerp(300, 700, fly)} rot={lerp(-30, -8, fly) + fists * 0.6}>
          <Stomach mood={t < k.a2 ? 'angry' : stf.mood} mouth={t < k.a2 && active(s, 'stomach') < 0.3 ? 'grit' : stf.mouth} look={t < k.a2 ? [0.4, -0.4] : [0.6, -0.6]} />
        </Put>
      </Scene>
      <Burst t={t} t0={0.02} x={300} y={1500} r={200} />
    </div>
  );
};
const ShotA: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesA(s);
  const d0 = k.stomach + 0.05, d1 = d0 + 0.5;
  const e = clamp01((t - d0) / (d1 - d0)), ee = e * e * (3 - 2 * e);
  const [px, py] = bellyA();
  const cam = t < k.a2 ? {k: 1, p: [540, 960] as [number, number]} : {k: 1.5, p: [600, 880] as [number, number]};
  const [sxp, syp] = [540 + (px - cam.p[0]) * cam.k, 960 + (py - cam.p[1]) * cam.k];
  const Z = 1 + ee * ee * 9, R = ee * 2300;
  return (
    <>
      {e > 0 && <div style={{position: 'absolute', inset: 0}}><StomachFull t={t} growl={1} mood="angry" mouth="big" look={[-0.3, 0.3]} /></div>}
      {e < 1 && (
        <div style={{position: 'absolute', inset: 0, transformOrigin: `${sxp}px ${syp}px`, transform: `scale(${Z.toFixed(4)})`,
          WebkitMaskImage: e > 0 ? `radial-gradient(circle at ${sxp}px ${syp}px, transparent ${(R / Z).toFixed(1)}px, black ${(R / Z + 1).toFixed(1)}px)` : undefined}}>
          <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: FAST_ROOM.wall}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: frameOf(cam.k, cam.p, [540, 960])}}><RoomA s={s} /></div>
          </div>
        </div>
      )}
      {e > 0 && e < 1 && (
        <svg style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}} width={1080} height={1920} viewBox="0 0 1080 1920">
          <circle cx={sxp} cy={syp} r={R + 40} fill="none" stroke={GRANDPA.top.color} strokeWidth={36} />
          <circle cx={sxp} cy={syp} r={R + 10} fill="none" stroke={GRANDPA.skin} strokeWidth={24} />
          {[R + 58, R + 22, R].map((rr, i) => <circle key={i} cx={sxp} cy={syp} r={rr} fill="none" stroke={INK} strokeWidth={5} />)}
        </svg>
      )}
    </>
  );
};

// =================================================================== B: 4 h, the whole stomach
//   0.00-0.6  the clock jumps 0 -> 4 h
//   B1   "Feed" it growls and shakes; "FEED" it pounds the wall (a burst)
//   B2   (closer) "Hunger" the Brain peeks down from the top; "waves," the growl swells and eases with its hand; "meal" again
//   B3   (wide) "drops" the growl dies away; the stomach blinks, surprised
const BRAIN_PEEK: [number, number] = [830, 330];
const timesB = (s: ShotNow) => {
  const b2 = at(s, 'B2', undefined, 2.2), b3 = at(s, 'B3', undefined, 5.2);
  return {feed: at(s, 'B1', 'feed', 0.7), feed2: at(s, 'B1', 'FEED', 1.4), b2, hunger: at(s, 'B2', 'hunger', b2), waves: at(s, 'B2', 'waves', b2 + 0.7), meal: at(s, 'B2', 'meal', b2 + 1.9), b3, drops: at(s, 'B3', 'drops', b3 + 0.7)};
};
const BrainPeek: React.FC<{t: number; t0: number; mood?: string; mouth?: string; look?: [number, number]; size?: number}> = ({t, t0, mood = 'open', mouth = 'smile', look = [-0.5, 0.6], size = 340}) => {
  const k = keyed(t, 0, [[t0 - 0.2, 1, 0.4, 'back']]);
  if (k < 0.01) return null;
  return (
    <Put x={BRAIN_PEEK[0]} y={lerp(-220, BRAIN_PEEK[1], k)} size={size} rot={lerp(20, -6, k)}>
      {/* a thread from the top, like a spider coming down */}
      <path d="M 0 -60 L 0 -400" stroke={INK} strokeWidth={4} />
      <Brain mood={mood as never} mouth={mouth as never} look={look} />
    </Put>
  );
};
const ShotB: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesB(s);
  if (t < LEAD) return <ClockInsert t={t} from={0} to={4} />;
  const sf = openFace(s, 'stomach', 3, 'angry');
  const growl = keyed(t, 0, [[k.feed, 1, 0.1], [k.waves, 0.6, 0.17], [k.meal, 0.9, 0.17], [k.drops, 0, 0.5]]);
  const bf = openFace(s, 'brain', 2, 'neutral');
  const calm = t > k.drops;
  const [sx, sy] = shake(t, k.feed2, 22, 0.35);
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)`}}>
      <StomachFull t={t} growl={growl} mood={calm ? (active(s, 'stomach') > 0.3 ? sf.mood : 'open') : 'angry'} mouth={calm ? 'o' : active(s, 'stomach') > 0.3 ? sf.mouth : 'grit'} look={t > k.hunger ? [0.6, -0.7] : [-0.3, 0.3]} />
      <BrainPeek t={t} t0={k.hunger} mood={bf.mood} mouth={bf.mouth} look={[-0.6, 0.6]} />
      <Burst t={t} t0={k.feed2} x={520} y={1250} r={170} />
    </div>
  );
};
const viewB = byLine({B2: {x: 700, y: 720, z: 1.25}}, WIDE);
const TagB = tagVia(viewB);
const ScreenB: React.FC<{s: ShotNow}> = ({s}) => (
  <>
    <TagB s={s} label="STOMACH" x={716} y={860} r={190} t={s.t - LEAD - 0.15} />
    <TagB s={s} label="BRAIN" x={BRAIN_PEEK[0]} y={BRAIN_PEEK[1]} r={120} t={s.t - timesB(s).hunger - 0.25} />
  </>
);

// =================================================================== C: 12 h, the whole liver and its sugar jar
//   0.00-0.6  the clock jumps 4 -> 12 h
//   C1   "sugar" the liver taps its jar (a ding); "low..." the beads drop away to a few
//   C2   (closer) "twelve" the last beads go; "dry!" it stares at the empty jar, shocked (a burst, a jolt)
const JAR: [number, number] = [840, 1260];
const timesC = (s: ShotNow) => {
  const c2 = at(s, 'C2', undefined, 3.4);
  return {sugar: at(s, 'C1', 'sugar', 1.0), low: at(s, 'C1', 'low', 2.6), c2, twelve: at(s, 'C2', 'twelve', c2 + 0.5), dry: at(s, 'C2', 'dry', c2 + 2.0)};
};
const ShotC: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesC(s);
  if (t < LEAD) return <ClockInsert t={t} from={4} to={12} />;
  const lf = openFace(s, 'liver', 5, 'scared');
  const store = keyed(t, 1, [[k.low, 0.3, 0.5], [k.twelve, 0.04, 0.35], [k.dry, 0, 0.1]]);
  const tap = t > k.sugar && t < k.sugar + 0.4 ? Math.sin(((t - k.sugar) / 0.4) * Math.PI * 2) * 4 : 0;
  const jolt = take(t, k.dry, 0.5);
  const shocked = t > k.dry;
  return (
    <>
      <LiverFull t={t} fat={0} mood={shocked ? 'scared' : lf.mood} mouth={shocked && active(s, 'liver') < 0.3 ? 'o' : lf.mouth} look={[0.8, 0.5]} lift={jolt.dy} />
      <Put x={JAR[0]} y={JAR[1]} size={600} rot={tap}><g transform="translate(0 -6) scale(0.5)"><SugarJar store={store} /></g></Put>
      <Burst t={t} t0={k.dry} x={JAR[0]} y={JAR[1] - 60} r={150} />
    </>
  );
};
const viewC = byLine({C2: {x: 610, y: 960, z: 1.22}}, WIDE);
const TagC = tagVia(viewC);
const ScreenC: React.FC<{s: ShotNow}> = ({s}) => (
  <>
    <TagC s={s} label="LIVER" x={317} y={786} r={170} t={s.t - LEAD - 0.15} />
    <NumTag s={s} text="about 12 hours" id="C2" word="about" />
  </>
);

// =================================================================== D: the switch
//   0.00 Lardo POPS up beside the liver (a boing)
//   D1   "turn!" his arms fly up; "fat!" fuel drops pop off his top
//   D2   (closer) "switches" the liver's big switch flips from SUGAR to FAT (a burst); "fat!" the liver hops
const LARDO: [number, number] = [830, 1330];
const SWITCH: [number, number] = [210, 1290];
const timesD = (s: ShotNow) => {
  const d2 = at(s, 'D2', undefined, 1.9);
  return {turn: at(s, 'D1', 'turn', 0.5), fat1: at(s, 'D1', 'fat', 1.2), d2, sw: at(s, 'D2', 'switches', d2 + 1.2), fat2: at(s, 'D2', 'fat', d2 + 2.3)};
};
/** The liver's fuel switch: a plate with SUGAR above, FAT below, and a lever (k: 0 = sugar, 1 = fat). */
const FuelSwitch: React.FC<{k: number}> = ({k}) => {
  const a = lerp(-40, 40, k);
  return (
    <g>
      <Shape d="M -90 -120 H 90 Q 104 -120 104 -106 V 106 Q 104 120 90 120 H -90 Q -104 120 -104 106 V -106 Q -104 -120 -90 -120 Z" fill={CLOTH.offwhite} shadow={0.6} />
      <text x={0} y={-74} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={k < 0.5 ? INK : tint(INK, 0.6)}>SUGAR</text>
      <text x={0} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={32} fill={k >= 0.5 ? CLOTH.orange : tint(INK, 0.6)}>FAT</text>
      <circle cx={0} cy={10} r={26} fill={CLOTH.charcoal} {...EDGE_IN} />
      <g transform={`rotate(${a.toFixed(1)} 0 10)`}>
        <path d="M 0 10 L 0 -46" stroke={INK} strokeWidth={22} strokeLinecap="round" />
        <path d="M 0 10 L 0 -46" stroke={tint(CLOTH.grey, 0.3)} strokeWidth={14} strokeLinecap="round" />
        <circle cx={0} cy={-50} r={20} fill={CLOTH.red} {...EDGE_IN} />
      </g>
    </g>
  );
};
const ShotD: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesD(s);
  const lf = openFace(s, 'liver', 5, 'happy');
  const la = openFace(s, 'lardo', 7, 'happy');
  const up = keyed(t, 0, [[0.02, 1, 0.38, 'back']]);
  const drops = keyed(t, 0, [[k.fat1, 1, 0.33]]);
  const flip = keyed(t, 0, [[k.sw, 1, 0.12, 'snap']]);
  const hp = hop(t, k.fat2, 60, 0.32);
  const lhp = hop(t, k.turn, 50, 0.3);
  return (
    <>
      <LiverFull t={t} fat={0} mood={lf.mood} mouth={lf.mouth} look={t < k.d2 ? [0.9, 0.6] : [-0.6, 0.6]} lift={hp.dy} />
      <Put x={SWITCH[0]} y={SWITCH[1]} size={300}><g transform="scale(0.8)"><FuelSwitch k={flip} /></g></Put>
      <Put x={LARDO[0]} y={lerp(1700, LARDO[1], up) + lhp.dy} size={lerp(200, 420, up)} sq={lhp.sq}>
        <Lardo mood={la.mood} mouth={la.mouth} arms={t > k.turn - 0.05 ? 'up' : 'hips'} drops={drops} look={[-0.6, -0.3]} />
      </Put>
      <Burst t={t} t0={k.sw} x={SWITCH[0]} y={SWITCH[1]} r={130} />
    </>
  );
};
const viewD = byLine({D2: {x: 540, y: 1050, z: 1.15}}, WIDE);
const TagD = tagVia(viewD);
const ScreenD: React.FC<{s: ShotNow}> = ({s}) => <TagD s={s} label="LARDO (FAT CELL)" x={LARDO[0]} y={LARDO[1] - 30} r={110} t={s.t - 0.4} />;

// =================================================================== E: 16 h, the living room (the twist)
//   0.00  the clock RINGS at 16 h (it shakes, a burst); breakfast on the side table
//   E1    "Sixteen" Grandpa gives a big thumbs-up; "faster?" he leans in, pleased with himself
//   E2    (on Lardo) "year-long" Lardo pops up on the side table; "every" he counts on his fingers (arms out)
//   E3    (wide) "same" he shrugs with a hop; "less." Grandpa's grin drops (a jolt)
const gpE = {view: 'three-quarter' as const, facing: 'right' as const, x: 520, y: FEET_Y - 22, scale: PEOPLE_SCALE};
const LARDO_E: [number, number] = [850, 1078];
const timesE = (s: ShotNow) => {
  const e2 = at(s, 'E2', undefined, 2.6), e3 = at(s, 'E3', undefined, 5.2);
  return {sixteen: at(s, 'E1', 'sixteen', 0.1), faster: at(s, 'E1', 'faster', 1.9), e2, year: at(s, 'E2', 'year-long', e2 + 0.4), every: at(s, 'E2', 'every', e2 + 1.4), e3, same: at(s, 'E3', 'same', e3 + 0.8), less: at(s, 'E3', 'less', e3 + 1.9)};
};
const ShotE: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesE(s);
  const ring = t < 0.6 ? Math.sin(t * 60) * 6 * (1 - t / 0.6) : 0;
  const pose = poseAt(t, [[-9, 'rest'], [k.sixteen - 0.15, 'thumbsUp', 0.25], [k.faster - 0.1, 'think', 0.25], [k.less, 'worried', 0.2]]);
  const up = keyed(t, 0, [[k.year - 0.25, 1, 0.35, 'back']]);
  const la = openFace(s, 'lardo', 7, 'neutral');
  const lhp = hop(t, k.same, 46, 0.3);
  const jolt = take(t, k.less, 0.4);
  const down = t > k.less;
  return (
    <>
      <Scene bg={FAST_ROOM.wall}>
        <FastRoom hours={16} plate="breakfast" lamp={false} plateX={968} clockShake={ring} />
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${jolt.dy.toFixed(1)}px)`}}>
          <PersonAt spec={GRANDPA} {...gpE} pose={pose} expr={down ? 'worried' : active(s, 'grandpa') > 0.3 ? 'talking' : 'happy'} look={t > k.e2 ? [0.9, 0.3] : [-0.2, 0]} talk={talkSmooth(s, 'grandpa')} blink={blink(t, 3)} />
        </div>
        {up > 0.01 && (
          <Put x={LARDO_E[0]} y={lerp(1240, LARDO_E[1], up) + lhp.dy} size={300 * Math.max(0.2, up)} sq={lhp.sq}>
            <Lardo mood={t > k.same && t < k.less ? 'bored' : la.mood} mouth={la.mouth} arms={t > k.every && t < k.same ? 'out' : t > k.same ? 'down' : 'hips'} look={[-0.8, 0]} />
          </Put>
        )}
      </Scene>
      <Burst t={t} t0={0.02} x={CLOCK[0]} y={CLOCK[1]} r={200} col={CLOTH.yellow} />
    </>
  );
};
const viewE = byLine({E2: {x: 760, y: 1000, z: 1.35}}, {x: 600, y: 960, z: 1.06});
const TagE = tagVia(viewE);

// =================================================================== F: the whole brain (the care line)
//   F1   "isn't" it wags (tilts left-right); "everyone." it shakes its head
//   F2   (wide) "Pregnant?" a hop; "disorder?" a burst; "doctor" it leans to the lens (a push in)
const timesF = (s: ShotNow) => {
  const f2 = at(s, 'F2', undefined, 1.6);
  return {isnt: at(s, 'F1', "isn't", 0.3), every: at(s, 'F1', 'everyone', 0.9), f2, preg: at(s, 'F2', 'pregnant', f2), dis: at(s, 'F2', 'disorder', f2 + 1.3), doc: at(s, 'F2', 'doctor', f2 + 2.2)};
};
const ShotF: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesF(s);
  const bf = openFace(s, 'brain', 2, 'neutral');
  const wag = t > k.isnt && t < k.isnt + 1.0 ? Math.sin((t - k.isnt) * 14) * 3 * (1 - (t - k.isnt)) : 0;
  const no = t > k.every && t < k.every + 0.6 ? Math.sin((t - k.every) * 30) * 14 * (1 - (t - k.every) / 0.6) : 0;
  const hp = hop(t, k.preg, 50, 0.3);
  const lean = keyed(t, 1, [[k.doc, 1.08, 0.3, 'back']]);
  return (
    <>
      <div style={{position: 'absolute', inset: 0, transformOrigin: '540px 900px', transform: `translate(${no.toFixed(1)}px, ${hp.dy.toFixed(1)}px) rotate(${wag.toFixed(2)}deg) scale(${lean.toFixed(4)})`}}>
        <BrainFull t={t} mood={bf.mood} mouth={bf.mouth} look={t > k.doc ? [0, 0] : [0.3, 0.2]} />
      </div>
      <Burst t={t} t0={k.dis} x={760} y={420} r={110} col={CLOTH.yellow} />
    </>
  );
};
const viewF = byLine({F2: WIDE}, {x: 420, y: 700, z: 1.25});

// =================================================================== G: the stomach again (the answer and the loop)
//   0.00 the stomach, full and calm after breakfast (a small burp), then it frowns
//   G1   "screaming" a little growl, it looks around, suspicious; "night?" it folds its arms (holds)
//   G2   (closer) "Me!" the Brain drops in on its thread and winks (a burst); "scream," it pulls a tiny scream face and the
//        stomach rattles; "stomach!" the stomach's jaw drops
const timesG = (s: ShotNow) => {
  const g2 = at(s, 'G2', undefined, 2.4);
  return {scr: at(s, 'G1', 'screaming', 0.9), night: at(s, 'G1', 'night', 1.8), g2, me: at(s, 'G2', 'me', g2), scream: at(s, 'G2', 'scream', g2 + 1.6), stom: at(s, 'G2', 'stomach', g2 + 2.6)};
};
const ShotG: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesG(s);
  const sf = openFace(s, 'stomach', 3, 'angry');
  const growl = keyed(t, 0, [[k.scr, 0.5, 0.1], [k.me, 0, 0.13], [k.scream, 0.4, 0.1], [k.stom, 0, 0.1]]);
  const calm = t < k.scr - 0.3;
  const jaw = t > k.stom;
  const look: [number, number] = t > k.me ? [0.6, -0.7] : t > k.scr ? [Math.sin(t * 4) * 0.8, 0.1] : [0, 0.2];
  const bm = t > k.scream && t < k.scream + 0.5 ? {mood: 'scared', mouth: 'open'} : t > k.me && t < k.me + 0.6 ? {mood: 'wink', mouth: 'smile'} : openFace(s, 'brain', 2, 'happy');
  return (
    <>
      <StomachFull t={t} growl={growl} mood={jaw ? 'scared' : calm ? 'happy' : sf.mood} mouth={jaw && active(s, 'stomach') < 0.3 ? 'o' : calm ? 'smile' : sf.mouth} look={look} />
      <BrainPeek t={t} t0={k.me} mood={bm.mood} mouth={bm.mouth} look={[-0.6, 0.6]} />
      <Burst t={t} t0={k.me} x={BRAIN_PEEK[0]} y={BRAIN_PEEK[1]} r={150} col={CLOTH.yellow} />
    </>
  );
};
const viewG = byLine({G2: {x: 720, y: 720, z: 1.2}}, WIDE);

// ------------------------------------------------------------------ the shots
const face = (x: number, y: number, r: number): Focus => ({x, y, r});
export const FASTING_SHOTS: Record<string, ShotDef> = {
  A: {Scene: ShotA, focus: () => face(560, 760, 120), view: () => WIDE},
  B: {Scene: ShotB, Screen: ScreenB, focus: () => face(716, 860, 190), view: viewB},
  C: {Scene: ShotC, Screen: ScreenC, focus: () => face(317, 786, 170), view: viewC},
  D: {Scene: ShotD, Screen: ScreenD, focus: () => face(317, 786, 170), view: viewD},
  E: {Scene: ShotE, focus: () => face(520, 700, 120), view: viewE},
  F: {Scene: ShotF, focus: () => face(390, 612, 160), view: viewF},
  G: {Scene: ShotG, focus: () => face(716, 860, 190), view: viewG},
};
void TagE; void STOMACH_FULL;

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
