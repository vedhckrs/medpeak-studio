/**
 * "What Happens If You Don't Sleep" (`no-sleep`) in look v8: its five shots by id (videos/no-sleep/toon.json)
 * and its CTA end card. The owner approved the looks on 2026-11-21 (sleep-cast, sleep-place, sleep-room).
 *
 *   A  inside the brain, 2 a.m.: Gunk drops in on the piled waste, the gaps are shut ("Don't sleep? I clog your brain!")
 *   B  Sam's bedroom at 2 a.m.: one more video; Melatonin floats in, yawning
 *   C  inside the brain: the night crew shows how the gaps open and the wash runs, then it stops: he is still awake
 *   D  the bedroom at 7 a.m.: Sam slumps; the Brain pops up beside him; on "seconds" Sam nods off for a moment
 *   E  inside the brain, the next night: the gaps open, the wash runs, Gunk is washed out
 *
 * The beats follow the script's events (toon.json `events`): a shot is a pure function of its ShotNow.
 */
import React from 'react';
import {Put} from './scene';
import {Brain} from './organs-a';
import {Melatonin} from './cells';
import {Phone} from './props';
import {CharTag, Sunrise, Calendar, Warning, type CtaPoint} from './hud';
import {DiveCtx, DIVE} from './micro3';
import {BrainGapPlace} from './sleep-places';
import {Gunk, NightCrew} from './sleep-cast';
import {BedFront, BedroomRoom, Duvet} from './sleep-rooms';
import {Scene} from './scene';
import {PEOPLE_SCALE} from './scenes-rooms';
import {castById, handAt, headAt, PersonAt} from './people-rig';
import {FONT, INK, CLOTH} from './kit';
import {active, blink, bodyFace, clamp01, EXPR_OF, feel, go, lerp, pop, since, sway, talk, type Focus, type ShotDef, type ShotNow} from './play';

// ------------------------------------------------------------------ helpers
/** Shot-seconds of a word (or `dflt` when the line is not in this "now"). */
const at = (s: ShotNow, id: string, word: string | undefined, dflt: number) => { const u = since(s, id, word); return u <= -900 ? dflt : s.t - u; };
/** A dial that steps through (time, value) keys, each change eased over `d` seconds. */
const dial = (t: number, start: number, keys: [number, number, number?][]) => keys.reduce((v, [t0, to, d = 0.4]) => lerp(v, to, go(t, t0, d)), start);
const diveOf = (s: ShotNow) => { const u = clamp01(s.t / Math.max(0.1, s.dur)); return u * u * (3 - 2 * u); };
const dived = (Shot: React.FC<{s: ShotNow}>): React.FC<{s: ShotNow}> => {
  const D: React.FC<{s: ShotNow}> = ({s}) => <DiveCtx.Provider value={diveOf(s)}><Shot s={s} /></DiveCtx.Provider>;
  return D;
};
/** A point in a depth plane after the dive grows it about the frame centre. */
const inPlane = (s: ShotNow, x: number, y: number, d: number): [number, number, number] => {
  const k = 1 + diveOf(s) * (DIVE.far + d * (DIVE.near - DIVE.far));
  return [540 + (x - 540) * k, 960 + (y - 960) * k, k];
};
const slowPush = (x: number, y: number, z0: number, z1: number) => (s: ShotNow) => { const u = clamp01(s.t / s.dur); return {x, y, z: lerp(z0, z1, u * u * (3 - 2 * u))}; };
/** A body character's squash with its own voice. */
const voiceSq = (s: ShotNow, who: string) => { const k = talk(s, who); return k > 0 ? (k - 0.35) * 0.1 : 0; };
/** How much a character moves: a breath at rest, full while it speaks (the owner: "moves when it acts or speaks"). */
const calm = (s: ShotNow, who: string) => 0.15 + 0.85 * active(s, who);
/** The yellow number tag, on the SCREEN (after the camera), on the grid (x 300 / 540 / 780), from its word to its line's end. */
const NumTag: React.FC<{s: ShotNow; text: string; id: string; word: string; x?: number; y?: number}> = ({s, text, id, word, x = 780, y = 330}) => {
  const u = since(s, id, word);
  const line = s.lines.find((l) => l.id === id);
  if (!line || u < 0) return null;
  const left = line.from + line.voice + 0.15 - s.t; // it leaves with its line
  if (left < -0.25) return null;
  const k = pop(u, 0, 0.3);
  const o = clamp01(u / 0.12) * clamp01((left + 0.25) / 0.25);
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${k.toFixed(3)})`, opacity: o, background: CLOTH.yellow, border: `5px solid ${INK}`, borderRadius: 14,
      padding: '10px 30px', fontFamily: FONT, fontWeight: 900, fontSize: 68, color: INK, whiteSpace: 'nowrap', boxShadow: `0 8px 0 ${INK}`}}>{text.toUpperCase()}</div>
  );
};
/** A name tag through a shot's camera (frame point -> screen). */
const tagVia = (view: (s: ShotNow) => {x: number; y: number; z: number}) => {
  const T: React.FC<{s: ShotNow; label: string; x: number; y: number; r: number; t: number}> = ({s, label, x, y, r, t}) => {
    const c = view(s);
    return <CharTag label={label} x={540 + (x - c.x) * c.z} y={960 + (y - c.y) * c.z} r={r * c.z} t={t} />;
  };
  return T;
};

// =================================================================== A: the hook, inside the brain
// 0.0 Gunk drops in from above onto the piled waste (squash) · "sleep?" the waste rises · "clog" a squelch and a flash,
// Gunk swells · A2 he leans in, "wash" a drip, the gaps twitch
const posA = (s: ShotNow) => {
  const t = s.t;
  const fall = clamp01(t / 0.32);
  const land = t >= 0.32 ? Math.sin(clamp01((t - 0.32) / 0.3) * Math.PI) * (1 - clamp01((t - 0.32) / 0.3)) : 0;
  const clog = go(since(s, 'A1', 'clog'), 0, 0.25) * (1 - go(since(s, 'A1', 'clog'), 0.5, 0.4) * 0.6);
  const lean = go(since(s, 'A2'), 0, 0.5);
  const c = calm(s, 'gunk');
  return {
    x: 545 + sway(t, 2.4, 1) * 10 * c,
    y: lerp(-300, 1010, fall * fall) + lerp(0, 60, lean),
    size: 520 * (1 + clog * 0.12) + lean * 60,
    sq: land * 0.22 + voiceSq(s, 'gunk'),
    rot: sway(t, 1.3, 2) * 4 * c,
  };
};
const ShotA: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t;
  const dirt = dial(t, 0.6, [[0, 0.7, 0.1], [at(s, 'A1', "don't", 0.4), 0.75], [at(s, 'A1', 'sleep', 0.7), 0.8], [at(s, 'A1', 'clog', 1.2), 0.9], [at(s, 'A1', 'brain', 1.6), 0.95], [at(s, 'A2', 'wash', 2.6), 1]]);
  const gap = 0.05 * go(since(s, 'A2', 'now'), 0, 0.4) * (0.5 + 0.5 * sway(t, 0.5));
  const v = posA(s);
  const f = bodyFace(s, 'gunk', 3, 'angry');
  return (
    <>
      <BrainGapPlace t={t} gap={gap} dirt={dirt} />
      <Put x={v.x} y={v.y} size={v.size} rot={v.rot} sq={v.sq}><Gunk stage={1} mood={f.mood} mouth={f.mouth} look={[0, 0.5]} /></Put>
    </>
  );
};
const viewA = slowPush(545, 1000, 1.1, 1.18);
const TagA = tagVia(viewA);
const ScreenA: React.FC<{s: ShotNow}> = ({s}) => {
  const v = posA(s);
  return <TagA s={s} label="GUNK (BRAIN WASTE)" x={v.x} y={v.y} r={v.size * 0.34} t={s.t - 0.6} />;
};

// =================================================================== B: the bedroom, 2 a.m.
const SAM = castById('patient');
const samB = {pose: 'sitPhone' as const, view: 'three-quarter' as const, facing: 'right' as const, x: 300, y: 1560, scale: PEOPLE_SCALE};
const melB = (s: ShotNow) => {
  const u = since(s, 'B2');
  const come = u <= -900 ? 0 : go(u, -0.6, 0.7); // she floats in just before her line
  const c = calm(s, 'melatonin');
  return {x: lerp(1260, 760, come), y: 640 + sway(s.t, 2.6, 3) * 18 * (0.4 + c), rot: -6 + sway(s.t, 1.8, 1) * 5 * c, come};
};
const ShotB: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t;
  const h = handAt(SAM, samB).R;
  const expr = EXPR_OF[feel(s, 'patient', 'happy')] ?? 'happy';
  const m = melB(s);
  const mf = bodyFace(s, 'melatonin', 5, 'sleepy');
  // B3 "Watch me": a little shrug of the phone hand (the phone bobs)
  const bob = go(since(s, 'B3', 'watch'), 0, 0.2) * (1 - go(since(s, 'B3', 'watch'), 0.3, 0.3));
  return (
    <Scene bg="#34406f">
      <BedroomRoom night />
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920} viewBox="0 0 1080 1920">
        <path d={`M ${h.palm[0] + 30} ${h.palm[1] - 70} L ${h.palm[0] - 150} ${h.palm[1] - 330} L ${h.palm[0] - 230} ${h.palm[1] - 120} Z`} fill="#d4e8f6" opacity={0.26 + sway(t, 0.7) * 0.04} />
      </svg>
      <PersonAt spec={SAM} {...samB} expr={expr} look={[0.6, 0.3]} talk={talk(s, 'patient')} blink={blink(t, 2)} bob={sway(t, 3.2) * 0.4} />
      <Put x={h.palm[0] + 10} y={h.palm[1] - 40 - bob * 30} size={120} rot={-24 + bob * 10}><Phone /></Put>
      <BedFront night />
      <Duvet night />
      {m.come > 0 && <Put x={m.x} y={m.y} size={300} rot={m.rot} sq={voiceSq(s, 'melatonin')}><Melatonin mood={mf.mood} mouth={mf.mouth} look={[-0.6, 0.4]} /></Put>}
    </Scene>
  );
};
const ScreenB: React.FC<{s: ShotNow}> = ({s}) => {
  const m = melB(s);
  return (
    <>
      <NumTag s={s} text="2 a.m." id="B2" word="two" x={780} y={330} />
      {m.come > 0.95 && <CharTag label="MELATONIN" x={m.x} y={m.y} r={110} t={since(s, 'B2') + 0.1} />}
    </>
  );
};
const samFocus = (o: Parameters<typeof headAt>[1]): Focus => { const h = headAt(SAM, o); return {x: h.x, y: h.y, r: h.r}; };

// =================================================================== C: the brain, the crew shows the wash, then it stops
const ShotC: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t;
  const tGaps = at(s, 'C1', 'gaps', 1.2), tWash = at(s, 'C1', 'wash', 2.8), tSixty = at(s, 'C2', 'sixty', 5.4);
  const tAwake = at(s, 'C3', 'awake', 7.6), tParty = at(s, 'C3', 'party', 9.4), tNight = at(s, 'C4', 'night', 10.6), tMore = at(s, 'C4', 'more', 12.4);
  const gap = dial(t, 0, [[0, 0.3, 0.8], [tGaps, 0.8, 1.0], [tSixty, 1, 0.6], [tAwake, 0, 0.35]]);
  const wash = dial(t, 0, [[tWash, 1, 0.8], [tAwake, 0, 0.35]]);
  const dirt = dial(t, 0.5, [[tWash, 0.2, 1.0], [tParty, 0.8, 0.6], [tNight, 0.9, 0.6], [tMore, 1, 0.4]]);
  const cf = bodyFace(s, 'crew', 7, 'happy');
  const gf = bodyFace(s, 'gunk', 3, 'happy');
  const party = go(t, tParty, 0.2);
  const dance = party * Math.abs(Math.sin((t - tParty) * 7));
  const scared = go(t, at(s, 'C4', undefined, 10), 0.3);
  // the two crew helpers rush along the cross channel while the wash runs
  const run = clamp01((t - tWash) / 2.4) * (1 - go(t, tAwake, 0.3));
  return (
    <>
      <BrainGapPlace t={t} gap={gap} wash={wash} dirt={dirt} />
      {run > 0 && [0, 1].map((i) => <Put key={i} x={lerp(-120, 1200, (run + i * 0.35) % 1)} y={i ? 1330 : 705} size={190} rot={8}><NightCrew job={i ? 'bucket' : 'brush'} mood="happy" look={[0.8, 0]} /></Put>)}
      <Put x={540 + sway(t, 2, 2) * 10 * calm(s, 'crew') - scared * 30} y={1000 + Math.abs(Math.sin(t * 5)) * -14 * active(s, 'crew') + scared * 10} size={320} rot={sway(t, 1.4, 1) * 4} sq={voiceSq(s, 'crew') + scared * 0.06}>
        <NightCrew job="mop" mood={scared > 0.5 ? 'scared' : cf.mood} mouth={cf.mouth} look={scared > 0.5 ? [0.6, 0] : [0, 0.3]} />
      </Put>
      <Put x={820 + sway(t, 2.2, 4) * 8} y={1170 - dance * 60} size={lerp(300, 360, go(t, tParty, 0.5))} rot={sway(t, 0.35, 2) * 10 * party} sq={voiceSq(s, 'gunk') + dance * 0.08}>
        <Gunk stage={party > 0.5 ? 2 : 1} mood={gf.mood} mouth={gf.mouth} look={[-0.6, -0.2]} />
      </Put>
    </>
  );
};
const viewC = slowPush(540, 1050, 1.0, 1.08);
const TagC = tagVia(viewC);
const ScreenC: React.FC<{s: ShotNow}> = ({s}) => {
  const [x, y, k] = inPlane(s, 540, 1000, 0.45);
  return (
    <>
      <TagC s={s} label="NIGHT CREW (BRAIN FLUID)" x={x} y={y} r={110 * k} t={s.t - 0.5} />
      <NumTag s={s} text="60% wider" id="C2" word="sixty" x={540} y={330} />
    </>
  );
};

// =================================================================== D: the bedroom, 7 a.m.
const samD = {pose: 'sitSlump' as const, view: 'three-quarter' as const, facing: 'right' as const, x: 420, y: 1660, scale: PEOPLE_SCALE};
const brainD = (s: ShotNow) => {
  const u = since(s, 'D2');
  const come = u <= -900 ? 0 : go(u, -0.5, 0.5);
  return {x: 800, y: lerp(420, 560, pop(u, -0.5, 0.5)) + sway(s.t, 2.2, 2) * 10, come};
};
const ShotD: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t;
  // microsleep on "seconds": his head drops, eyes shut, then he jerks awake
  const ms = since(s, 'D3', 'seconds');
  const nod = ms <= -900 ? 0 : go(ms, 0, 0.35) * (1 - go(ms, 1.3, 0.15));
  const jerk = ms > 1.3 && ms < 1.7 ? Math.sin(((ms - 1.3) / 0.4) * Math.PI) : 0;
  const expr = nod > 0.5 ? 'sleepy' : jerk > 0.2 ? 'surprised' : (EXPR_OF[feel(s, 'patient', 'sleepy')] ?? 'sleepy');
  const b = brainD(s);
  const bf = bodyFace(s, 'brain', 9, 'scared');
  return (
    <Scene bg="#fbe9b0">
      <BedroomRoom night={false} />
      <Duvet night={false} thrown />
      <PersonAt spec={SAM} {...samD} expr={expr} look={[0.3, 0.6]} talk={talk(s, 'patient')} blink={nod > 0.5 ? 1 : blink(t, 4)} bob={nod * 3 - jerk * 1.5 + sway(t, 4) * 0.4} />
      {b.come > 0 && (
        <div style={{position: 'absolute', inset: 0, opacity: b.come}}>
          <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920} viewBox="0 0 1080 1920">
            {/* a thought bubble from Sam's head: three small puffs, then the cloud */}
            {[[640, 760, 16], [690, 710, 22], [740, 650, 30]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#ffffff" stroke={INK} strokeWidth={4} />)}
            <ellipse cx={b.x} cy={b.y} rx={200} ry={170} fill="#ffffff" stroke={INK} strokeWidth={5} />
          </svg>
          <Put x={b.x} y={b.y + 10} size={270} rot={sway(t, 1.5, 1) * 4 * calm(s, 'brain')} sq={voiceSq(s, 'brain')}><Brain mood={bf.mood} mouth={bf.mouth} look={[-0.6, 0.4]} /></Put>
        </div>
      )}
    </Scene>
  );
};
const ScreenD: React.FC<{s: ShotNow}> = ({s}) => {
  const b = brainD(s);
  return (
    <>
      <NumTag s={s} text="17 hours" id="D2" word="seventeen" x={300} y={330} />
      {b.come > 0.95 && <CharTag label="BRAIN" x={b.x} y={b.y} r={120} t={since(s, 'D2') - 0.3} />}
    </>
  );
};

// =================================================================== E: the next night, the wash
const ShotE: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t;
  const tDown = at(s, 'E1', 'down', 1.2), tSeven = at(s, 'E1', 'seven', 1.8), tOpen = at(s, 'E2', 'opening', 3.0), tCrew = at(s, 'E2', 'crew', 4.4);
  const tSleep = at(s, 'E3', 'sleep', 5.6), tWash = at(s, 'E3', 'wash', 6.4), tClog = at(s, 'E3', 'clog', 7.4);
  const gap = dial(t, 0, [[0, 0.2, 0.6], [tDown, 0.5, 0.6], [tSeven, 0.8, 0.6], [tOpen, 1, 0.5], [tClog, 0.9, 0.5]]);
  const wash = dial(t, 0, [[tOpen, 1, 0.6]]);
  const dirt = dial(t, 1, [[tCrew, 0.5, 0.8], [tSleep, 0.2, 0.8], [tWash, 0, 0.8]]);
  const gf = bodyFace(s, 'gunk', 3, 'scared');
  const mf = bodyFace(s, 'melatonin', 5, 'happy');
  // Gunk is carried off by the wash: down the channel on "wash", smaller and smaller
  const out = go(t, tWash, Math.max(1.2, s.dur - tWash - 0.2));
  const stage = (dirt > 0.6 ? 2 : dirt > 0.15 ? 1 : 0) as 0 | 1 | 2;
  const crewIn = go(t, tOpen, 0.6);
  return (
    <>
      <BrainGapPlace t={t} gap={gap} wash={wash} dirt={dirt} />
      <Put x={300 + sway(t, 2.6, 1) * 12} y={700 + sway(t, 3, 2) * 14} size={260} rot={-6 + sway(t, 1.8) * 5 * calm(s, 'melatonin')} sq={voiceSq(s, 'melatonin')}><Melatonin mood={mf.mood} mouth={mf.mouth} look={[0.6, 0.5]} /></Put>
      {crewIn > 0 && <Put x={lerp(1250, 800, crewIn)} y={1330 + Math.abs(Math.sin(t * 6)) * -12} size={260} rot={-6}><NightCrew job="mop" mood="happy" look={[-0.7, 0]} /></Put>}
      <Put x={545 + Math.sin(t * 9) * 8 * go(t, tOpen, 0.3) * (1 - out)} y={lerp(1010, 1300, out)} size={lerp(460, 200, out)} rot={lerp(0, 30, out)} sq={voiceSq(s, 'gunk')}>
        <Gunk stage={stage} mood={gf.mood} mouth={gf.mouth} look={[0, -0.4]} />
      </Put>
    </>
  );
};
const viewE = slowPush(540, 1000, 1.02, 1.12);
const ScreenE: React.FC<{s: ShotNow}> = ({s}) => <NumTag s={s} text="7+ hours" id="E1" word="seven" x={780} y={330} />;

// ------------------------------------------------------------------ the shots
export const NO_SLEEP_SHOTS: Record<string, ShotDef> = {
  A: {Scene: dived(ShotA), Screen: ScreenA, focus: (_w, s) => { const v = posA(s); return {x: v.x, y: v.y, r: v.size * 0.34}; }, view: viewA},
  B: {Scene: ShotB, Screen: ScreenB, focus: (who, s) => (who === 'melatonin' ? {x: melB(s).x, y: melB(s).y, r: 110} : samFocus(samB))},
  C: {Scene: dived(ShotC), Screen: ScreenC, focus: () => ({x: 540, y: 1000, r: 160}), view: viewC},
  D: {Scene: ShotD, Screen: ScreenD, focus: (who, s) => (who === 'brain' ? {x: brainD(s).x, y: brainD(s).y, r: 130} : samFocus(samD))},
  E: {Scene: dived(ShotE), Screen: ScreenE, focus: () => ({x: 545, y: 1000, r: 180}), view: viewE},
};

// ------------------------------------------------------------------ the CTA end card: three strong points (sources: CDC, NHLBI)
export const NO_SLEEP_CTA: {title: string; points: CtaPoint[]} = {
  title: 'SLEEP IS NOT OPTIONAL',
  points: [
    {icon: <Sunrise t={2} />, big: '7+ HOURS', small: 'every night, for adults'},
    {icon: <Calendar t={2} pages={3} />, big: 'IT ADDS UP', small: 'lost sleep builds a debt'},
    {icon: <Warning t={2} />, big: "DON'T DRIVE SLEEPY", small: 'it is as bad as drunk'},
  ],
};
