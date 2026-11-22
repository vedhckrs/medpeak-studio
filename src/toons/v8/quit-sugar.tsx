/**
 * "What Happens If You Quit Sugar for 30 Days" (`quit-sugar`) in look v8: its seven shots by id (videos/quit-sugar/toon.json)
 * and its CTA end card. Shape `fight`: Sweetie, a sugar cube, fights for 30 days to win Dad back; each trick is answered by a
 * part of Dad's body, drawn WHOLE and filling the frame (the owner, 2026-11-22). The owner approved the looks the same day.
 *
 *   A  Day 1, the kitchen at night: Sweetie BURSTS out of a soda can at the lens ("Quit sugar? You'll be back!"); Dad tosses
 *      the can ("No sugar for a month? Watch me."); on "me." the camera dives into his belly: the liver, pale with fat
 *   B  Day 3, the whole brain: Sweetie dangles a candy on a fishing line ("hooked"); the Brain rolls its eyes and the line snaps
 *   C  Day 7, the mouth, close on the front teeth: Sweetie slides in wearing a juice box; the front tooth throws him out ("Out!")
 *   D  Day 10, the liver: a sugar cube on a plate is swapped for bread; the fat patches shrink to about half
 *   E  Day 20, the kitchen: Sweetie in a ZERO can; Dad reaches; the Brain in a thought bubble stops him
 *   F  Day 30, the kitchen: Dad on the scale, a small drop; Sweetie sulks
 *   G  the whole mouth: the tongue; its taste buds light up on "Three months"; a tiny Sweetie trudges off ("I'll be back.")
 *
 * Every body shot (B, C, D) opens on the kitchen's wall calendar: its page rips off and flies (the clock of the fight).
 * Acting kit (act.tsx): key poses that HOLD, one big action per beat, hard cuts between held framings (the `view` of a shot).
 */
import React from 'react';
import {Put, Scene} from './scene';
import {CharTag, type CtaPoint} from './hud';
import {Burst, easeOut, hop, keyed, shake, SpeedLines, take} from './act';
import {FEET_Y, PEOPLE_SCALE} from './scenes-rooms';
import {HandAt, handAt, headAt, PersonAt, type PoseIn, type PoseName} from './people-rig';
import {Brain} from './organs-a';
import {Candy} from './props';
import {CLOTH, EDGE, EDGE_IN, FONT, INK, OUTLINE, Shape, shade, tint} from './kit';
import {active, blink, bodyFace, clamp01, go, lerp, pop, since, talkSmooth, type Focus, type ShotDef, type ShotNow} from './play';
import {BurstCan, Sweetie} from './sugar-cast';
import {DAD_HOME, NIGHT, NightKitchen} from './sugar-kitchen';
import {BrainFull, LiverFull, MouthFull} from './sugar-organs';

// ------------------------------------------------------------------ helpers (as in creatine.tsx)
/** Shot-seconds of a word (or `dflt` when the line is not in this "now"). */
const at = (s: ShotNow, id: string, word: string | undefined, dflt: number) => { const u = since(s, id, word); return u <= -900 ? dflt : s.t - u; };
type Step = [number, PoseName, number?];
/** The pose at time t from a list of (start, pose, blend seconds): blended, never snapped. */
const poseAt = (t: number, steps: Step[]): PoseIn => {
  let i = -1;
  for (let j = 0; j < steps.length; j++) if (t >= steps[j][0]) i = j;
  if (i <= 0) return steps[0][1];
  const [t0, b, d = 0.35] = steps[i];
  const k = go(t, t0, d);
  return k >= 1 ? b : {a: steps[i - 1][1], b, k};
};
/** A body character's face with its eyes OPEN while it talks ('happy' is closed-eye arcs). */
const openFace = (s: ShotNow, who: string, seed: number, rest: string) => {
  const f = bodyFace(s, who, seed, rest);
  return f.mood === 'happy' && active(s, who) > 0.3 ? {...f, mood: 'open' as const} : f;
};
/** A picture scaled by k so that frame point `p` sits at screen point `to`. */
const frameOf = (k: number, p: [number, number], to: [number, number]) => `translate(${(to[0] - p[0] * k).toFixed(1)}px, ${(to[1] - p[1] * k).toFixed(1)}px) scale(${k})`;
/** A name tag through a shot's camera (frame point -> screen). */
const tagVia = (view: (s: ShotNow) => {x: number; y: number; z: number}) => {
  const T: React.FC<{s: ShotNow; label: string; x: number; y: number; r: number; t: number; dur?: number}> = ({s, label, x, y, r, t, dur}) => {
    const c = view(s);
    return <CharTag label={label} x={540 + (x - c.x) * c.z} y={960 + (y - c.y) * c.z} r={r * c.z} t={t} dur={dur} />;
  };
  return T;
};
/** The held framing of the line on now (a hard cut at each line): `by` maps line ids to framings, `first` before any line. */
const byLine = (by: Record<string, {x: number; y: number; z: number}>, first: {x: number; y: number; z: number}) => (s: ShotNow) => by[s.cur?.id ?? ''] ?? first;
const WIDE = {x: 540, y: 960, z: 1};

// ------------------------------------------------------------------ the calendar: a page rips off and flies
// The wall calendar (sugar-kitchen.tsx) sits at translate(780 360) scale(1.2): its page is x 648-912, y 293-516 in the frame.
const PAGE = {x0: 648, y0: 293, x1: 912, y1: 516};
const FlyingPage: React.FC<{day: number; u: number}> = ({day, u}) => {
  if (u >= 1) return null;
  const k = easeOut(clamp01(u));
  const {x0, y0, x1, y1} = PAGE;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} viewBox="0 0 1080 1920">
      <g transform={`translate(${(k * 300).toFixed(1)} ${(k * 520).toFixed(1)}) rotate(${(k * 42).toFixed(1)} ${x0} ${y0})`} opacity={1 - clamp01((u - 0.75) / 0.25)}>
        <path d={`M ${x0} ${y0} H ${x1} V ${y1 - 8} L ${x1 - 30} ${y1} L ${x0} ${y1} Z`} {...EDGE} fill="#ffffff" />
        <text x={(x0 + x1) / 2} y={y0 + 48} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={29} fill={tint(INK, 0.35)} letterSpacing={3}>DAY</text>
        <text x={(x0 + x1) / 2} y={y1 - 34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={day >= 10 ? 144 : 156} fill={INK}>{day}</text>
        {/* the torn top edge */}
        <path d={`M ${x0} ${y0} l 22 10 l 22 -8 l 22 10 l 22 -8 l 22 10 l 22 -8 l 22 10 l 22 -8 l 22 10 l 22 -8 l 22 10 l 22 -8`} {...OUTLINE} />
      </g>
    </svg>
  );
};
/** The first half second of a body shot: close on the calendar, the old page rips off, the new day shows; then the cut. */
const RIP = 0.62;
const RipInsert: React.FC<{t: number; from: number; to: number}> = ({t, from, to}) => (
  <div style={{position: 'absolute', inset: 0, background: NIGHT.wall, overflow: 'hidden'}}>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: frameOf(2.5, [780, 400], [540, 820])}}>
      <Scene bg={NIGHT.wall}>
        <NightKitchen open={false} day={to} />
        <FlyingPage day={from} u={(t - 0.08) / 0.42} />
      </Scene>
    </div>
  </div>
);

// =================================================================== A: the hook (Day 1, the kitchen at night)
//   0.00  Dad at the open fridge; the soda can on the floor BURSTS and Sweetie flies AT the lens, waving ("Quit sugar?")
//   "back!" Sweetie points at Dad (hold); Dad's take (a jump back, hand to chest)
//   A2     close on Dad, angry: on "month?" he swipes the can into the bin (an arc); "Watch" he points at Sweetie
//   "me."  the camera dives into his belly: the liver on Day 1, pale with big fat patches, sleepy
const dadA = {view: 'three-quarter' as const, facing: 'right' as const, x: 380, y: FEET_Y - 22, scale: PEOPLE_SCALE};
const timesA = (s: ShotNow) => {
  const a2 = at(s, 'A2', undefined, 1.83);
  return {back: at(s, 'A1', 'back', 1.2), a2, month: at(s, 'A2', 'month', a2 + 0.9), watch: at(s, 'A2', 'watch', a2 + 1.3), me: at(s, 'A2', 'me', a2 + 1.6)};
};
/** Where the dive goes in: Dad's belly, in frame pixels. */
const bellyA = (): [number, number] => { const h = headAt(DAD_HOME, {...dadA, pose: 'point'}); return [h.x + h.r * 0.1, h.y + h.r * 3.3]; };
const KitchenA: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesA(s);
  const burst = clamp01(t / 0.08);
  // Sweetie: out of the can, up AT the lens (0 .. 0.38 s), a little settle, then holds
  const fly = keyed(t, 0, [[0, 1, 0.38, 'back']]);
  const sf = openFace(s, 'sweetie', 1, 'happy');
  const tk = take(t, 0.12, 0.8);
  const swipe = clamp01((t - k.month) / 0.45);
  const [cx, cy] = [lerp(640, 960, easeOut(swipe)), lerp(1640, 1560, easeOut(swipe)) - Math.sin(swipe * Math.PI) * 360];
  const pose = poseAt(t, [[-9, 'worried'], [0.14, 'worried'], [k.a2, 'rest', 0.25], [k.month - 0.1, 'offer', 0.15], [k.watch, 'point', 0.18]]);
  const o = {...dadA, pose};
  const [sx, sy] = shake(t, 0.02, 16, 0.3);
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)`}}>
      <Scene bg={NIGHT.wall}>
        <NightKitchen open day={1} />
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${tk.dy.toFixed(1)}px) rotate(${(tk.lean * 0.5).toFixed(2)}deg)`, transformOrigin: `${dadA.x}px ${dadA.y}px`}}>
          <PersonAt spec={DAD_HOME} {...o} expr={t < k.a2 ? 'surprised' : 'angry'} look={t < k.a2 ? [0.6, 0.5] : [0.8, 0.2]} talk={talkSmooth(s, 'dad')} blink={blink(t, 3)} />
        </div>
        {swipe < 1 && <Put x={cx} y={cy} size={360} rot={swipe * 540}><BurstCan burst={burst} /></Put>}
        {t < k.a2 && <Put x={lerp(640, 600, fly)} y={lerp(1600, 1080, fly)} size={lerp(240, 920, fly)} rot={lerp(-20, -6, fly)} sq={-0.1 * Math.sin(clamp01(t / 0.38) * Math.PI)}>
          <Sweetie mood={sf.mood} mouth={sf.mouth} arms={t > k.back - 0.1 ? 'point' : 'wave'} look={t > k.back - 0.1 ? [-0.8, -0.2] : [0, 0.3]} />
        </Put>}
        {t >= k.a2 && <Put x={940} y={1240} size={300} rot={8}><Sweetie mood="wink" mouth="smile" arms="hips" look={[-0.8, 0]} /></Put>}
      </Scene>
      <Burst t={t} t0={0} x={640} y={1560} r={170} />
    </div>
  );
};
const ShotA: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesA(s);
  const d0 = k.me + 0.05, d1 = d0 + 0.5;
  const e = clamp01((t - d0) / (d1 - d0)), ee = e * e * (3 - 2 * e);
  const [px, py] = bellyA();
  const cam = t < k.a2 ? {k: 1, p: [540, 960] as [number, number]} : {k: 1.55, p: [470, 900] as [number, number]};
  const [sxp, syp] = [540 + (px - cam.p[0]) * cam.k, 960 + (py - cam.p[1]) * cam.k];
  const Z = 1 + ee * ee * 9, R = ee * 2300;
  return (
    <>
      {e > 0 && <div style={{position: 'absolute', inset: 0}}><LiverFull t={t} fat={1} mood="sleepy" mouth="wavy" look={[0.2, 0.4]} /></div>}
      {e < 1 && (
        <div style={{position: 'absolute', inset: 0, transformOrigin: `${sxp}px ${syp}px`, transform: `scale(${Z.toFixed(4)})`,
          WebkitMaskImage: e > 0 ? `radial-gradient(circle at ${sxp}px ${syp}px, transparent ${(R / Z).toFixed(1)}px, black ${(R / Z + 1).toFixed(1)}px)` : undefined}}>
          <div style={{position: 'absolute', inset: 0, overflow: 'hidden', background: NIGHT.wall}}>
            <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: frameOf(cam.k, cam.p, [540, 960])}}><KitchenA s={s} /></div>
          </div>
        </div>
      )}
      {e > 0 && e < 1 && (
        <svg style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}} width={1080} height={1920} viewBox="0 0 1080 1920">
          <circle cx={sxp} cy={syp} r={R + 40} fill="none" stroke={CLOTH.navy} strokeWidth={36} />
          <circle cx={sxp} cy={syp} r={R + 10} fill="none" stroke={DAD_HOME.skin} strokeWidth={24} />
          {[R + 58, R + 22, R].map((rr, i) => <circle key={i} cx={sxp} cy={syp} r={rr} fill="none" stroke={INK} strokeWidth={5} />)}
        </svg>
      )}
    </>
  );
};
const TagA = tagVia(() => WIDE);
const ScreenA: React.FC<{s: ShotNow}> = ({s}) => {
  const k = timesA(s);
  return (
    <>
      <TagA s={s} label="SWEETIE (SUGAR)" x={620} y={1180} r={330} t={s.t - 0.45} dur={1.3} />
      <TagA s={s} label="LIVER" x={317} y={786} r={120} t={s.t - k.me - 0.6} dur={1.4} />
    </>
  );
};

// =================================================================== B: Day 3, the whole brain
//   0.00-0.62  the calendar: DAY 2 rips off, DAY 3
//   B1   Sweetie on top of the brain casts a line: a candy drops on a hook in front of the Brain's face on "hooked"; waggles on
//        "cravings!"
//   B2   (a cut, closer) "Hooked?" the Brain rolls its eyes up (holds); "little" the line SNAPS (a burst), the candy flies off, Sweetie
//        tumbles off the brain and falls out of frame
const SW_B: [number, number] = [850, 340];
const ROD_TIP: [number, number] = [560, 300];
const timesB = (s: ShotNow) => {
  const b2 = at(s, 'B2', undefined, 2.9);
  return {hooked: at(s, 'B1', 'hooked', 0.9), crav: at(s, 'B1', 'cravings', 2.0), b2, roll: at(s, 'B2', 'hooked', b2), little: at(s, 'B2', 'little', b2 + 1.6)};
};
const ShotB: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesB(s);
  if (t < RIP) return <RipInsert t={t} from={2} to={3} />;
  const bf = openFace(s, 'brain', 2, 'smug');
  const roll = t > k.roll && t < k.roll + 0.9;
  const drop = keyed(t, 0, [[k.hooked - 0.15, 1, 0.4, 'back']]);
  const waggle = t > k.crav && t < k.crav + 0.8 ? Math.sin((t - k.crav) * 22) * 26 : 0;
  const snap = clamp01((t - k.little) / 0.7);
  const candy: [number, number] = snap > 0 ? [lerp(430, -200, easeOut(snap)), lerp(860, 200, easeOut(snap)) - Math.sin(snap * Math.PI) * 200] : [430 + waggle, lerp(-120, 860, drop)];
  const fall = clamp01((t - k.little - 0.12) / 0.8);
  const sf = openFace(s, 'sweetie', 1, 'happy');
  return (
    <>
      <BrainFull t={t} mood={roll ? 'bored' : bf.mood} mouth={bf.mouth} look={roll ? [0.2, -1] : [0.25, 0.7]} />
      {/* the fishing line and rod (until it snaps) */}
      {snap <= 0 && drop > 0.01 && (
        <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} viewBox="0 0 1080 1920">
          <path d={`M ${ROD_TIP[0]} ${ROD_TIP[1]} Q ${(ROD_TIP[0] + candy[0]) / 2 + 20} ${(ROD_TIP[1] + candy[1]) / 2} ${candy[0]} ${candy[1] - 60}`} stroke={INK} strokeWidth={4} fill="none" />
        </svg>
      )}
      {fall < 1 && (
        <Put x={SW_B[0] + fall * 120} y={SW_B[1] + fall * fall * 1800} size={380} rot={fall * 320 - 8}>
          <path d="M -70 42 L -200 -30" stroke={CLOTH.brown} strokeWidth={9} strokeLinecap="round" />
          <Sweetie mood={fall > 0 ? 'scared' : sf.mood} mouth={fall > 0 ? 'o' : sf.mouth} arms="hips" look={[-0.8, 0.5]} />
        </Put>
      )}
      {drop > 0.01 && <Put x={candy[0]} y={candy[1]} size={190} rot={snap * 400 + waggle * 0.3}><Candy /></Put>}
      <Burst t={t} t0={k.little} x={430} y={800} r={130} />
    </>
  );
};
const viewB = byLine({B2: {x: 470, y: 700, z: 1.3}}, WIDE);
const TagB = tagVia(viewB);
const ScreenB: React.FC<{s: ShotNow}> = ({s}) => <TagB s={s} label="BRAIN" x={390} y={612} r={150} t={s.t - RIP - 0.2} />;

// =================================================================== C: Day 7, the mouth (close on the front teeth)
//   0.00-0.62  the calendar: DAY 6 rips off, DAY 7
//   C1   Sweetie in his juice box SLIDES in from the right on the tongue, sipping the straw, smug
//   C2   (closer on the tooth) "Juice," the tooth glares; "Out!" a punch: a burst, the screen shakes, Sweetie flies out of the mouth
//   C3   (back out) "fewer" the sugar crystals drop off the gum line, one after another; the "12 teaspoons" tag on "twelve"
const timesC = (s: ShotNow) => {
  const c2 = at(s, 'C2', undefined, 1.8), c3 = at(s, 'C3', undefined, 4.7);
  return {c1: at(s, 'C1', undefined, 0.62), juice: at(s, 'C1', 'juice', 1.2), c2, out: at(s, 'C2', 'out', c2 + 2.2), c3, fewer: at(s, 'C3', 'fewer', c3 + 2.2)};
};
const ShotC: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesC(s);
  if (t < RIP) return <RipInsert t={t} from={6} to={7} />;
  const tf = openFace(s, 'tooth', 4, 'angry');
  const slide = keyed(t, 0, [[RIP, 1, 0.55, 'back']]);
  const fly = clamp01((t - k.out) / 0.75);
  const sip = t > k.juice && t < k.c2 ? Math.sin(t * 9) * 4 : 0;
  const bits = keyed(t, 1, [[k.fewer, 0, 0.9]]);
  const [sx, sy] = shake(t, k.out, 26, 0.35);
  const sf = openFace(s, 'sweetie', 1, 'smug');
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)`}}>
      <MouthFull t={t} view="tooth" bits={bits} tooth={{mood: t > k.c2 - 0.2 ? 'angry' : tf.mood, mouth: tf.mouth, look: fly > 0 ? [0.6, -0.6] : [0.8, 0.6]}} />
      {fly < 1 && (
        <Put x={fly > 0 ? lerp(800, 1360, easeOut(fly)) : lerp(1400, 800, slide)} y={(fly > 0 ? lerp(1260, -200, easeOut(fly)) : 1260) + sip} size={580} rot={fly > 0 ? fly * 720 : lerp(10, -4, slide)}>
          <Sweetie wear="juice" mood={fly > 0 ? 'scared' : sf.mood} mouth={fly > 0 ? 'o' : sf.mouth} arms={fly > 0 ? 'droop' : 'hips'} look={[-0.8, -0.3]} />
        </Put>
      )}
      {fly > 0 && fly < 0.7 && <SpeedLines x={lerp(800, 1360, easeOut(fly))} y={lerp(1260, -200, easeOut(fly))} dir={[1, -2.8]} len={200} o={1 - fly} />}
      <Burst t={t} t0={k.out} x={700} y={1230} r={180} />
    </div>
  );
};
const viewC = byLine({C2: {x: 380, y: 860, z: 1.28}}, WIDE);
const TagC = tagVia(viewC);
const NumTag: React.FC<{s: ShotNow; text: string; id: string; word: string; x?: number; y?: number}> = ({s, text, id, word, x = 540, y = 330}) => {
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
const ScreenC: React.FC<{s: ShotNow}> = ({s}) => (
  <>
    <TagC s={s} label="TOOTH" x={326} y={737} r={170} t={s.t - RIP - 0.3} />
    <NumTag s={s} text="12 teaspoons" id="C3" word="twelve" x={540} y={300} />
  </>
);

// =================================================================== D: Day 10, the liver
//   0.00-0.62  the calendar: DAY 9 rips off, DAY 10
//   D1   a plate pops in by the liver: a sugar cube on it; on "swapped" it POPS into a slice of bread (a burst)
//   D2   (closer on the liver's face) "halved" the fat patches shrink to about half, little puffs; "calories!" the liver hops
const timesD = (s: ShotNow) => {
  const d2 = at(s, 'D2', undefined, 3.2);
  return {d1: at(s, 'D1', undefined, 0.62), swapped: at(s, 'D1', 'swapped', 1.9), d2, halved: at(s, 'D2', 'halved', d2 + 0.9), cal: at(s, 'D2', 'calories', d2 + 2.5)};
};
const PLATE: [number, number] = [800, 1250];
const Cube: React.FC = () => (
  <g>
    <Shape d="M -40 -20 L -18 -42 L 46 -42 L 24 -20 Z" fill="#ffffff" shadow={0} />
    <Shape d="M 24 -20 L 46 -42 L 46 24 L 24 46 Z" fill="#e7dfd2" shadow={0} />
    <Shape d="M -40 -20 L 24 -20 L 24 46 L -40 46 Z" fill="#fbf8f2" shadow={0.5} />
  </g>
);
const Bread: React.FC = () => (
  <g>
    <Shape d="M -60 50 L -60 -10 C -86 -16 -84 -66 -40 -66 C -20 -86 20 -86 40 -66 C 84 -66 86 -16 60 -10 L 60 50 Z" fill="#c98a4b" shadow={1} />
    <Shape d="M -48 40 L -48 -16 C -70 -22 -66 -54 -34 -54 C -18 -70 18 -70 34 -54 C 66 -54 70 -22 48 -16 L 48 40 Z" fill="#f4dca8" shadow={0.4} line="in" />
  </g>
);
const Plate: React.FC = () => (
  <g>
    <ellipse cx={0} cy={40} rx={95} ry={26} {...EDGE} fill="#ffffff" />
    <ellipse cx={0} cy={38} rx={64} ry={15} fill="none" stroke={shade('#ffffff', 0.1)} strokeWidth={4} />
  </g>
);
const ShotD: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesD(s);
  if (t < RIP) return <RipInsert t={t} from={9} to={10} />;
  const lf = openFace(s, 'liver', 5, 'neutral');
  const fat = keyed(t, 1, [[k.halved, 0.5, 0.8]]);
  const plateIn = pop(t, RIP + 0.1, 0.35);
  const swapped = t >= k.swapped;
  const hp = hop(t, k.cal, 70, 0.32);
  const plateOut = clamp01((t - k.d2 + 0.1) / 0.3);
  return (
    <>
      <LiverFull t={t} fat={fat} mood={t > k.cal ? 'happy' : lf.mood} mouth={t > k.cal ? 'big' : lf.mouth} look={t < k.d2 ? [0.9, 0.6] : [0.2, -0.3]} lift={hp.dy} />
      {plateIn > 0.01 && plateOut < 1 && (
        <Put x={PLATE[0]} y={PLATE[1]} size={300 * plateIn * (1 - plateOut)}>
          <Plate />
          <g transform="translate(0 -8)">{swapped ? <Bread /> : <Cube />}</g>
        </Put>
      )}
      <Burst t={t} t0={k.swapped} x={PLATE[0]} y={PLATE[1] - 30} r={120} />
      {[[480, 712, 0], [620, 860, 0.12], [390, 1040, 0.24], [700, 760, 0.36]].map(([x, y, d], i) => (
        <Burst key={i} t={t} t0={k.halved + d} x={x} y={y} r={60} col={CLOTH.yellow} />
      ))}
    </>
  );
};
const viewD = byLine({D2: {x: 470, y: 860, z: 1.3}}, WIDE);
const TagD = tagVia(viewD);
const ScreenD: React.FC<{s: ShotNow}> = ({s}) => <TagD s={s} label="FAT" x={588} y={762} r={60} t={s.t - timesD(s).halved + 0.2} dur={1.6} />;

// =================================================================== E: Day 20, the kitchen (the twist)
//   0.00  the calendar page (DAY 19) flies off: DAY 20
//   E1    "Zero" Sweetie pops up behind the counter in his ZERO can, winking; "sugar!" Dad reaches for it (hold)
//   E2    (closer) the Brain pops up in a thought bubble over Dad's head; "swap" Dad FREEZES; "sweeteners." he pulls his hand back
//         and the can skids off the counter (a burst)
const dadE = {view: 'three-quarter' as const, facing: 'right' as const, x: 360, y: FEET_Y - 22, scale: PEOPLE_SCALE};
const timesE = (s: ShotNow) => {
  const e2 = at(s, 'E2', undefined, 2.5);
  return {zero: at(s, 'E1', 'zero', 1.6), sugar: at(s, 'E1', 'sugar', 2.0), e2, swap: at(s, 'E2', 'swap', e2 + 1.2), sweet: at(s, 'E2', 'sweeteners', e2 + 2.1)};
};
const ShotE: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesE(s);
  const up = pop(t, k.zero - 0.12, 0.35);
  const skid = clamp01((t - k.sweet) / 0.6);
  const pose = poseAt(t, [[-9, 'rest'], [k.sugar - 0.1, 'offer', 0.3], [k.sweet, 'rest', 0.2]]);
  const o = {...dadE, pose};
  const h = headAt(DAD_HOME, dadE);
  const bub = pop(t, k.e2 - 0.05, 0.3);
  const bf = openFace(s, 'brain', 2, 'neutral');
  const sf = openFace(s, 'sweetie', 1, 'smug');
  const freeze = t > k.swap && t < k.sweet;
  return (
    <>
      <Scene bg={NIGHT.wall}>
        <NightKitchen open={false} day={20} />
        <FlyingPage day={19} u={(t - 0.05) / 0.45} />
        {up > 0.01 && skid < 1 && (
          <Put x={830 + skid * 420} y={lerp(1200, 960, up) + skid * skid * 200} size={300} rot={skid * 200}>
            <Sweetie wear="diet" mood={skid > 0 ? 'scared' : sf.mood} mouth={skid > 0 ? 'o' : sf.mouth} arms={skid > 0 ? 'droop' : 'wave'} look={[-0.7, 0.1]} />
          </Put>
        )}
        <PersonAt spec={DAD_HOME} {...o} expr={freeze ? 'surprised' : 'neutral'} look={freeze ? [-0.2, -0.8] : [0.8, 0.1]} talk={talkSmooth(s, 'dad')} blink={freeze ? 0 : blink(t, 3)} />
        {/* the thought bubble with the Brain */}
        {bub > 0.01 && (
          <>
            <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} viewBox="0 0 1080 1920">
              <circle cx={h.x + 70} cy={h.y - h.r * 1.3} r={18 * bub} {...EDGE} fill="#ffffff" />
              <circle cx={h.x + 110} cy={h.y - h.r * 1.8} r={28 * bub} {...EDGE} fill="#ffffff" />
              <circle cx={h.x + 170} cy={h.y - h.r * 2.4 - 40} r={170 * bub} {...EDGE} fill="#ffffff" />
            </svg>
            <Put x={h.x + 170} y={h.y - h.r * 2.4 - 40} size={270 * bub}><Brain mood={bf.mood} mouth={bf.mouth} look={[-0.4, 0.4]} /></Put>
          </>
        )}
      </Scene>
      <Burst t={t} t0={k.sweet} x={900} y={980} r={120} />
    </>
  );
};
const viewE = byLine({E2: {x: 520, y: 820, z: 1.15}}, {x: 560, y: 980, z: 1.08});

// =================================================================== F: Day 30, the scale
//   0.00  the last page (DAY 29) flies off: DAY 30; Dad hops onto the scale
//   F1    (medium on Dad) "did" he wobbles, arms out, then looks down at the screen
//   F2    (wide) "trials," Sweetie, small, peeks over the counter; "kilo" the screen shows a small arrow down (a ding);
//         "less." Sweetie shrugs and slumps
const dadF = {view: 'three-quarter' as const, facing: 'right' as const, x: 470, y: FEET_Y - 22, scale: PEOPLE_SCALE};
const timesF = (s: ShotNow) => {
  const f2 = at(s, 'F2', undefined, 1.9);
  return {did: at(s, 'F1', 'did', 0.6), f2, trials: at(s, 'F2', 'trials', f2 + 0.3), kilo: at(s, 'F2', 'kilo', f2 + 1.3), less: at(s, 'F2', 'less', f2 + 3.0)};
};
const ShotF: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesF(s);
  const on = hop(t, 0.3, 60, 0.3);
  const wob = t > k.did && t < k.did + 0.9 ? Math.sin((t - k.did) * 16) * 7 * (1 - (t - k.did) / 0.9) : 0;
  const pose = poseAt(t, [[-9, 'rest'], [k.did - 0.05, 'shrugR', 0.15], [k.did + 0.9, 'worried', 0.3]]);
  const peek = keyed(t, 0, [[k.trials - 0.1, 1, 0.3, 'back']]);
  const slump = keyed(t, 0, [[k.less, 1, 0.3]]);
  const sf = openFace(s, 'sweetie', 1, 'sad');
  return (
    <>
      <Scene bg={NIGHT.wall}>
        <NightKitchen open={false} day={30} scaleAt={470} kg={t > k.kilo ? '▼' : undefined} />
        <FlyingPage day={29} u={(t - 0.02) / 0.45} />
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${on.dy.toFixed(1)}px) rotate(${wob.toFixed(2)}deg)`, transformOrigin: `${dadF.x}px ${dadF.y}px`}}>
          <PersonAt spec={DAD_HOME} {...dadF} pose={pose} expr={t > k.kilo ? 'surprised' : 'worried'} look={t > k.did + 0.5 ? [0.2, 0.95] : [0.6, 0.1]} talk={talkSmooth(s, 'dad')} blink={blink(t, 3)} />
        </div>
        {peek > 0.01 && <Put x={880} y={lerp(1200, 1010, peek) + slump * 30} size={260} rot={slump * 10}><Sweetie mood={slump > 0.5 ? 'sad' : sf.mood} mouth={slump > 0.5 ? 'frown' : sf.mouth} arms={slump > 0.5 ? 'droop' : 'hips'} look={[-0.8, 0.4]} /></Put>}
      </Scene>
    </>
  );
};
const viewF = byLine({F2: {x: 600, y: 1000, z: 1.05}}, {x: 470, y: 980, z: 1.3});

// =================================================================== G: the whole mouth, the tongue (the answer and the loop)
//   G1   "same." the tongue shrugs; the taste buds stay dark
//   G2   (closer) "Three" the taste buds light up one after another; "sweeter!" it beams (sparkles)
//   G3   (close on the lower lip) a tiny Sweetie trudges in from the right, slumped: "You quit sugar? ...I'll be back."
const timesG = (s: ShotNow) => {
  const g2 = at(s, 'G2', undefined, 2.9), g3 = at(s, 'G3', undefined, 7.1);
  return {g2, three: at(s, 'G2', 'three', g2 + 1.9), sweeter: at(s, 'G2', 'sweeter', g2 + 3.4), g3};
};
const ShotG: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesG(s);
  const tf = openFace(s, 'tongue', 6, 'neutral');
  const buds = keyed(t, 0, [[k.three, 1, 1.4]]);
  const walk = clamp01((t - k.g3 + 0.3) / 2.2);
  const step = Math.abs(Math.sin(walk * Math.PI * 7)) * 10;
  const sf = openFace(s, 'sweetie', 1, 'sad');
  return (
    <>
      <MouthFull t={t} view="tongue" buds={buds} tongue={{mood: t > k.sweeter ? 'happy' : tf.mood, mouth: t > k.sweeter && active(s, 'tongue') < 0.3 ? 'big' : tf.mouth, look: [0, -0.3]}} />
      {[[300, 1130, 0], [780, 1130, 0.15], [540, 1660, 0.3], [250, 1330, 0.45]].map(([x, y, d], i) => <Burst key={i} t={t} t0={k.sweeter + d} x={x} y={y} r={70} col={CLOTH.yellow} />)}
      {t > k.g3 - 0.3 && <Put x={lerp(1060, 700, walk)} y={1800 - step} size={190} rot={-4}><Sweetie mood={sf.mood} mouth={sf.mouth} arms="droop" look={[-0.6, 0.4]} /></Put>}
    </>
  );
};
const viewG = byLine({G2: {x: 540, y: 1180, z: 1.12}, G3: {x: 760, y: 1640, z: 1.55}}, WIDE);
const TagG = tagVia(viewG);
const ScreenG: React.FC<{s: ShotNow}> = ({s}) => {
  const k = timesG(s);
  return (
    <>
      <TagG s={s} label="TONGUE" x={540} y={1260} r={260} t={s.t - 0.2} />
      <NumTag s={s} text="40% sweeter" id="G2" word="forty" x={540} y={300} />
      {s.t > k.three && <TagG s={s} label="TASTE BUDS" x={780} y={1130} r={40} t={s.t - k.three - 0.2} dur={1.6} />}
    </>
  );
};

// ------------------------------------------------------------------ the shots
const face = (x: number, y: number, r: number): Focus => ({x, y, r});
export const QUIT_SUGAR_SHOTS: Record<string, ShotDef> = {
  A: {Scene: ShotA, Screen: ScreenA, focus: () => face(540, 960, 200), view: () => WIDE},
  B: {Scene: ShotB, Screen: ScreenB, focus: () => face(390, 612, 160), view: viewB},
  C: {Scene: ShotC, Screen: ScreenC, focus: () => face(326, 737, 170), view: viewC},
  D: {Scene: ShotD, Screen: ScreenD, focus: () => face(317, 786, 170), view: viewD},
  E: {Scene: ShotE, focus: () => face(360, 700, 120), view: viewE},
  F: {Scene: ShotF, focus: () => face(470, 700, 120), view: viewF},
  G: {Scene: ShotG, Screen: ScreenG, focus: () => face(540, 1240, 200), view: viewG},
};

// ------------------------------------------------------------------ the end card's icons (round badges, like the others)
const Badge: React.FC<{bg: string; children: React.ReactNode; id: string}> = ({bg, children, id}) => (
  <g>
    <circle cx={0} cy={0} r={92} {...EDGE} fill={bg} />
    <clipPath id={id}><circle cx={0} cy={0} r={90} /></clipPath>
    <g clipPath={`url(#${id})`}><circle cx={0} cy={110} r={120} fill={shade(bg, 0.12)} />{children}</g>
    <circle cx={0} cy={0} r={92} {...OUTLINE} />
  </g>
);
/** "JUICE COUNTS AS SUGAR": a juice box. */
const JuiceBadge: React.FC = () => (
  <Badge bg={tint(CLOTH.yellow, 0.45)} id="qs-juice">
    <g transform="translate(-6 8)">
      <Shape d="M -36 -40 L 30 -40 L 30 60 L -36 60 Z" fill={CLOTH.orange} />
      <rect x={-28} y={-6} width={50} height={40} rx={6} fill={tint(CLOTH.yellow, 0.2)} />
      <circle cx={-3} cy={14} r={12} fill={CLOTH.orange} {...EDGE_IN} />
      <path d="M 18 -40 L 18 -78 L 36 -92" stroke={INK} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M 18 -40 L 18 -78 L 36 -92" stroke={CLOTH.pink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </g>
  </Badge>
);
/** "NO SWEETENER SWAP": a ZERO can, crossed out. */
const ZeroBadge: React.FC = () => (
  <Badge bg="#ffffff" id="qs-zero">
    <g transform="translate(0 4)">
      <Shape d="M -30 -56 L 30 -56 L 36 -44 L 36 54 Q 36 62 28 64 L -28 64 Q -36 62 -36 54 L -36 -44 Z" fill={tint(CLOTH.grey, 0.35)} />
      <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={INK}>ZERO</text>
    </g>
    <path d="M -62 -62 L 62 62" stroke={INK} strokeWidth={20} strokeLinecap="round" />
    <path d="M -62 -62 L 62 62" stroke={CLOTH.red} strokeWidth={12} strokeLinecap="round" />
  </Badge>
);
/** "UNDER 12 TEASPOONS": a teaspoon with a little heap of sugar. */
const SpoonBadge: React.FC = () => (
  <Badge bg={tint(CLOTH.sky, 0.3)} id="qs-spoon">
    <g transform="rotate(-35)">
      <Shape d="M -8 6 L 8 6 L 10 84 Q 0 92 -10 84 Z" fill={tint(CLOTH.grey, 0.4)} shadow={0.5} />
      <Shape d="M 0 -64 C 34 -64 40 -20 30 0 C 20 18 -20 18 -30 0 C -40 -20 -34 -64 0 -64 Z" fill={tint(CLOTH.grey, 0.4)} />
      <Shape d="M -22 -24 C -10 -50 10 -50 22 -24 C 10 -16 -10 -16 -22 -24 Z" fill="#ffffff" shadow={0} line="in" />
    </g>
  </Badge>
);

// ------------------------------------------------------------------ the CTA end card: three strong points (source: WHO)
export const QUIT_SUGAR_CTA: {title: string; points: CtaPoint[]; voice?: string; seconds: number; at: {head: number; points: [number, number, number]; follow: number}} = {
  title: 'QUIT SUGAR: KNOW THIS',
  // read by the narrator (Joey); the beats are ESTIMATES until his clip is made (then from videos/quit-sugar/cta-timings.json)
  seconds: 12.5,
  at: {head: 0, points: [2.3, 5.0, 7.9], follow: 10.4},
  points: [
    {icon: <JuiceBadge />, big: 'JUICE COUNTS AS SUGAR', small: 'honey and syrup too'},
    {icon: <ZeroBadge />, big: 'NO SWEETENER SWAP', small: "the WHO's advice"},
    {icon: <SpoonBadge />, big: 'UNDER 12 TEASPOONS', small: 'a day, on about 2,000 calories'},
  ],
};
void HandAt; void handAt; void take; void FEET_Y;
