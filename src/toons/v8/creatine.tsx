/**
 * "What Happens When You Take Creatine" (`creatine`) in look v8: its seven shots by id (videos/creatine/toon.json)
 * and its CTA end card. The owner approved the looks on 2026-11-21 (crea-cast, crea-place, crea-gym).
 *
 *   A  the hook: Mom steps on the gym scale, the needle SLAMS into the red as Crea (on the dial) says "Take creatine?
 *      Your scale jumps!"; the camera dives into her arm: inside the muscle, the cell already swollen with water
 *   B  the gym: Mom, on the scale: "What? I only started creatine this week!"
 *   C  the blood: Crea rides the stream with the red cells toward the fork to the muscles
 *   D  inside a muscle cell: the lift drains the batteries, Crea's spark recharges them, Muscle speaks
 *   E  the kidney filter (the twist): creatinine chips, the blood-test alarm, then "no kidney harm was found"
 *   F  the clinic: Dr. Mira, Mom (in her gym clothes)
 *   G  back inside her muscle: "That's water ... not fat!" (the answer, and the loop to the hook)
 *
 * The beats follow the script's events (toon.json `events`): a shot is a pure function of its ShotNow.
 */
import React from 'react';
import {Put, Scene} from './scene';
import {CharTag, type CtaPoint} from './hud';
import {DiveCtx, DIVE} from './micro3';
import {batteryLevel, BloodPlace, CellDoorPlace, CELLDOOR, doorAt, KidneyFilterPlace, MuscleCellPlace, MuscleSign, gapY, TUBULE} from './crea-places';
import {Battery, Crea, Fat, Grain, Muscle, Spark, roundPoly} from './crea-cast';
import {CLINIC, CreaClinic, Dumbbell, GYM, GymRoom, LIFTER, SCALE, Shaker} from './crea-gym';
import {RedCell} from './cells';
import {Syringe} from './props';
import {arc as arcPt, Burst, easeOut, hop, keyed, latched, shake, SpeedLines, Stamp, take} from './act';
import {FEET_Y, PEOPLE_SCALE} from './scenes-rooms';
import {castById, handAt, HandAt, headAt, PersonAt, type Expr, type PoseIn, type PoseName} from './people-rig';
import {Kidney} from './organs-a';
import {CLOTH, EDGE, EDGE_IN, INK, OUTLINE, Shape, shade, tint} from './kit';
import {active, blink, bodyFace, clamp01, EXPR_OF, feel, go, lerp, pop, since, sway, talkSmooth, type Focus, type ShotDef, type ShotNow} from './play';


// ------------------------------------------------------------------ helpers (as in no-sleep.tsx)
/** Shot-seconds of a word (or `dflt` when the line is not in this "now"). */
const at = (s: ShotNow, id: string, word: string | undefined, dflt: number) => { const u = since(s, id, word); return u <= -900 ? dflt : s.t - u; };
/** A dial that steps through (time, value, ease) keys. */
const dial = (t: number, start: number, keys: [number, number, number?][]) => keys.reduce((v, [t0, to, d = 0.4]) => lerp(v, to, go(t, t0, d)), start);
const diveOf = (s: ShotNow) => { const u = clamp01(s.t / Math.max(0.1, s.dur)); return u * u * (3 - 2 * u); };
const dived = (Shot: React.FC<{s: ShotNow}>): React.FC<{s: ShotNow}> => {
  const D: React.FC<{s: ShotNow}> = ({s}) => <DiveCtx.Provider value={diveOf(s)}><Shot s={s} /></DiveCtx.Provider>;
  return D;
};
/** A point in a depth plane after the dive grows it about the frame centre. */
const inPlane = (s: ShotNow, x: number, y: number, d: number): [number, number] => {
  const k = 1 + diveOf(s) * (DIVE.far + d * (DIVE.near - DIVE.far));
  return [540 + (x - 540) * k, 960 + (y - 960) * k];
};
const slowPush = (x: number, y: number, z0: number, z1: number) => (s: ShotNow) => { const u = clamp01(s.t / s.dur); return {x, y, z: lerp(z0, z1, u * u * (3 - 2 * u))}; };
/** A slow small breath while a body character speaks (no squash on every syllable: it jiggled). */
const voiceSq = (s: ShotNow, who: string) => active(s, who) * sway(s.t, 0.9, who.length) * 0.025;
const calm = (s: ShotNow, who: string) => 0.15 + 0.85 * active(s, who);
/** A name tag through a shot's camera (frame point -> screen). */
const tagVia = (view: (s: ShotNow) => {x: number; y: number; z: number}) => {
  const T: React.FC<{s: ShotNow; label: string; x: number; y: number; r: number; t: number; dur?: number}> = ({s, label, x, y, r, t, dur}) => {
    const c = view(s);
    return <CharTag label={label} x={540 + (x - c.x) * c.z} y={960 + (y - c.y) * c.z} r={r * c.z} t={t} dur={dur} />;
  };
  return T;
};
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
const breath = (s: ShotNow, who: string, seed: number, extra = 0) => Math.max(-1, Math.min(1, 0.3 * sway(s.t, 3.4, seed) + 0.2 * active(s, who) * sway(s.t, 0.9, seed + 2) + extra));
const exprOf = (s: ShotNow, who: string, rest: string): Expr => EXPR_OF[feel(s, who, rest)] ?? 'neutral';

/** A body character's face with its eyes OPEN while it talks (bug 12: 'happy' is closed-eye arcs, so Crea talked with his eyes shut). */
const openFace = (s: ShotNow, who: string, seed: number, rest: string) => {
  const f = bodyFace(s, who, seed, rest);
  return f.mood === 'happy' && active(s, who) > 0.3 ? {...f, mood: 'open' as const} : f;
};
const MOM = LIFTER;
const DOC = castById('doctor');

// =================================================================== A: the hook (acting kit, 2026-11-21)
// The owner's review: the old hook was a calm wide gym, a small needle and a small "o". Now, in three hard cuts and a dive:
//   0.00  CLOSE on Mom's face, eyes squeezed shut, she steps onto the scale (a dip); Crea pops up at her ear: "Take creatine?"
//   "Your" the DIAL fills the screen, the needle trembles; on "jumps!" it SLAMS into the red: a shake, a burst, and Crea
//         leaps up AT the lens
//   +0.45 Mom, medium, from the front: the big TAKE (a crouch, a jump back, both hands on her cheeks); the +2 KG stamp bangs
//         on with the second "Your scale jumps..." (never during the hook line itself: the owner's rule)
//   "is"  the camera dives into her UPPER ARM: the opening shows skin, then fat, then the muscle cell, swollen with water
const momClose = {pose: 'rest' as const, view: 'three-quarter' as const, facing: 'right' as const, x: 400, y: FEET_Y - 22, scale: PEOPLE_SCALE};
const momTake = {view: 'front' as const, facing: 'right' as const, x: 380, y: FEET_Y - 22, scale: PEOPLE_SCALE};
const NEEDLE_LOW = 0.3;
const hookA = (s: ShotNow) => {
  const your = at(s, 'A1', 'your', 0.85), slam = at(s, 'A1', 'jumps', 1.3);
  const takeAt = slam + 0.45;
  const dive0 = at(s, 'A2', 'is', 3.3) - 0.12;
  return {your, slam, takeAt, dive0, dive1: dive0 + 0.5, stamp: at(s, 'A2', undefined, 2.03), stampOut: at(s, 'A2', 'is', 3.3)};
};
/** A picture of the gym scaled by k so that frame point `at` sits at screen point `to`. */
const frameOf = (k: number, at: [number, number], to: [number, number]) => `translate(${(to[0] - at[0] * k).toFixed(1)}px, ${(to[1] - at[1] * k).toFixed(1)}px) scale(${k})`;
const DIAL_K = 2.75, DIAL_TO: [number, number] = [540, 860];
const TAKE_K = 1.45, TAKE_AT: [number, number] = [540, 820], TAKE_TO: [number, number] = [700, 820]; // Mom left of centre, whole head in frame
/** Where the dive goes in: her upper arm in the take picture (screen pixels). */
const diveAtA = (): [number, number] => {
  const h = headAt(MOM, {...momTake, pose: 'cheeks'});
  const p: [number, number] = [h.x + h.r * 1.25, h.y + h.r * 2.25];
  return [TAKE_TO[0] + (p[0] - TAKE_AT[0]) * TAKE_K, TAKE_TO[1] + (p[1] - TAKE_AT[1]) * TAKE_K];
};
const GymCold: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, h = hookA(s);
  const tremble = t < h.slam ? Math.sin(t * 38) * 0.012 : 0;
  const needle = keyed(t, NEEDLE_LOW, [[h.slam - 0.02, 0.97, 0.1, 'snap']]) + tremble + (t > h.slam + 0.08 ? Math.sin((t - h.slam) * 24) * Math.exp(-(t - h.slam) * 6) * 0.05 : 0);
  const [sx, sy] = shake(t, h.slam, 22);
  const phase = t < h.your ? 'face' : t < h.takeAt ? 'dial' : 'take';
  const step = t < 0.32 ? -Math.sin((t / 0.32) * Math.PI) * 1.0 : 0; // the step onto the platform: a dip
  const tk = take(t, h.takeAt);
  const cp = pop(t, 0.18, 0.28);
  const cf = openFace(s, 'crea', 1, 'happy');
  if (phase === 'face') {
    const hd = headAt(MOM, momClose);
    return (
      <div style={{position: 'absolute', inset: 0, background: GYM.wall, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: frameOf(2.3, [hd.x, hd.y], [600, 820])}}>
          <Scene bg={GYM.wall}>
            <GymRoom needle={needle} />
            <PersonAt spec={MOM} {...momClose} expr="worried" look={[0.6, 0.6]} blink={1} bob={step} />
          </Scene>
        </div>
        {/* Crea pops up at her ear and leans in to whisper */}
        {cp > 0.01 && <Put x={850} y={760} size={380 * cp} rot={-12} sq={voiceSq(s, 'crea')}><Crea mood={cf.mood} mouth={cf.mouth} look={[-0.8, 0.2]} /></Put>}
      </div>
    );
  }
  if (phase === 'dial') {
    const leap = clamp01((t - h.slam) / 0.32);
    return (
      <div style={{position: 'absolute', inset: 0, background: GYM.wall, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: sx, top: sy, width: 1080, height: 1920, transformOrigin: '0 0', transform: frameOf(DIAL_K, [SCALE.x, SCALE.y], DIAL_TO)}}>
          <Scene bg={GYM.wall}><GymRoom needle={needle} /></Scene>
        </div>
        <Burst t={t} t0={h.slam} x={DIAL_TO[0] + Math.sin((-130 + 0.97 * 260) * Math.PI / 180) * 300} y={DIAL_TO[1] - Math.cos((-130 + 0.97 * 260) * Math.PI / 180) * 300} r={150} />
        {/* Crea leaps up from below and comes AT the lens */}
        {leap > 0 && <Put x={lerp(760, 560, leap)} y={lerp(2100, 1200, easeOut(leap))} size={lerp(300, 1150, leap * leap)} rot={lerp(-20, 6, leap)} sq={-0.1 * Math.sin(leap * Math.PI)}><Crea mood="happy" mouth="big" look={[0, 0.4]} /></Put>}
      </div>
    );
  }
  return (
    <div style={{position: 'absolute', inset: 0, background: GYM.wall, overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: frameOf(TAKE_K, TAKE_AT, TAKE_TO)}}>
        <Scene bg={GYM.wall}>
          <GymRoom needle={needle} />
          <div style={{position: 'absolute', inset: 0, transform: `translateY(${tk.dy.toFixed(1)}px) rotate(${tk.lean.toFixed(2)}deg)`, transformOrigin: `${momTake.x}px ${momTake.y}px`}}>
            <PersonAt spec={MOM} {...momTake} pose={poseAt(t, [[-9, 'worried'], [h.takeAt + 0.06, 'cheeks', 0.14]])} expr="surprised" look={[0.4, 0.1]} blink={0} />
          </div>
          <Put x={SCALE.x + 10} y={SCALE.y - SCALE.r - 110} size={250} rot={4}><Crea mood={cf.mood} mouth={cf.mouth} look={[-0.6, 0.4]} /></Put>
        </Scene>
      </div>
    </div>
  );
};
const posA = (s: ShotNow) => {
  const t = s.t, h = hookA(s);
  const lean = keyed(t, 0, [[at(s, 'A2', 'fat', 3.6) - 0.1, 1, 0.25, 'back']]);
  return {x: 540, y: 1010 - lean * 40, size: 520 + lean * 60, rot: -lean * 6, inside: t >= h.dive1};
};
/** The rings of the opening as the camera goes in: skin, then fat, then muscle (the dive through her upper arm). */
const DiveRim: React.FC<{x: number; y: number; r: number}> = ({x, y, r}) => r < 4 ? null : (
  <svg style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}} width={1080} height={1920} viewBox="0 0 1080 1920">
    <circle cx={x} cy={y} r={r + 46} fill="none" stroke={MOM.skin} strokeWidth={40} />
    <circle cx={x} cy={y} r={r + 18} fill="none" stroke="#f6d27a" strokeWidth={30} />
    <circle cx={x} cy={y} r={r + 3} fill="none" stroke="#c9505a" strokeWidth={10} />
    {[r + 66, r + 33, r].map((rr, i) => <circle key={i} cx={x} cy={y} r={rr} fill="none" stroke={INK} strokeWidth={5} />)}
  </svg>
);
const ShotA: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, h = hookA(s);
  const water = keyed(t, 0.85, [[h.dive1, 0.92, 0.3], [at(s, 'A2', 'fat', 3.65), 1, 0.35, 'back']]);
  const v = posA(s);
  const f = openFace(s, 'crea', 1, 'happy');
  const k = clamp01((t - h.dive0) / (h.dive1 - h.dive0)), e = k * k * (3 - 2 * k);
  const [px, py] = diveAtA();
  const Z = 1 + e * e * 9, R = e * 2300;
  return (
    <>
      <div style={{position: 'absolute', inset: 0}}>
        <DiveCtx.Provider value={0}><MuscleCellPlace t={t} water={water} /></DiveCtx.Provider>
        <Put x={v.x} y={v.y} size={v.size} rot={v.rot} sq={voiceSq(s, 'crea')}><Crea mood={f.mood} mouth={f.mouth} look={[0, 0.4]} /></Put>
      </div>
      {e < 1 && (
        <div style={{position: 'absolute', inset: 0, transformOrigin: `${px}px ${py}px`, transform: `scale(${Z.toFixed(4)})`,
          WebkitMaskImage: e > 0 ? `radial-gradient(circle at ${px}px ${py}px, transparent ${(R / Z).toFixed(1)}px, black ${(R / Z + 1).toFixed(1)}px)` : undefined}}>
          <GymCold s={s} />
        </div>
      )}
      {e > 0 && e < 1 && <DiveRim x={px} y={py} r={R} />}
    </>
  );
};
const viewA = () => ({x: 540, y: 960, z: 1}); // the shot frames itself (three cuts and a dive): the camera holds
const TagA = tagVia(viewA);
const ScreenA: React.FC<{s: ShotNow}> = ({s}) => {
  const v = posA(s), h = hookA(s);
  return (
    <>
      <Stamp t={s.t} t0={h.stamp} t1={h.stampOut} x={720} y={300} text="+2 KG" size={150} rot={-6} />
      <Burst t={s.t} t0={h.stamp} x={720} y={300} r={190} dur={0.28} col="#ffd23f" />
      {v.inside && <TagA s={s} label="CREA (CREATINE)" x={v.x} y={v.y} r={v.size * 0.32} t={s.t - h.dive1 - 0.5} />}
    </>
  );
};

// =================================================================== B: the gym
// "What?" she spins to the dial and shakes her shaker at it; "creatine" a second shake; "week!" she STOMPS: the needle wobbles
const momB = {view: 'three-quarter' as const, facing: 'right' as const, x: 400, y: FEET_Y - 22, scale: PEOPLE_SCALE};
const timesB = (s: ShotNow) => ({what: at(s, 'B1', undefined, 0), cre: at(s, 'B1', 'creatine', 0.97), week: at(s, 'B1', 'week', 1.68)});
const ShotB: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesB(s);
  const pose = poseAt(t, [[-9, 'cheeks'], [k.what - 0.05, 'shake', 0.18]]);
  const o = {...momB, pose};
  const hand = handAt(MOM, o).L;
  const shaking = (t > k.what + 0.1 && t < k.what + 0.6) || (t > k.cre && t < k.cre + 0.45);
  const rock = shaking ? Math.sin(t * 44) * 16 : 0;
  const stomp = take(t, k.week - 0.05, 0.4);
  const needle = 0.97 + (t > k.week ? Math.sin((t - k.week) * 30) * Math.exp(-(t - k.week) * 5) * 0.04 : 0);
  const [sx, sy] = shake(t, k.week, 12, 0.3);
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)`}}>
      <Scene bg={GYM.wall}>
        <GymRoom needle={needle} />
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${stomp.dy.toFixed(1)}px)`}}>
          {/* the bottle is drawn BEHIND her: her arm and hand are one outlined form and the curled fingers close over it
              (2026-11-21, the owner: "you join hand with arm, why line come": a second hand drawn on top left a seam at the wrist) */}
          <Put x={hand.palm[0]} y={hand.palm[1] - 18} size={240} rot={rock}><Shaker /></Put>
          <PersonAt spec={MOM} {...o} expr="angry" look={[0.8, -0.1]} talk={talkSmooth(s, 'mom')} blink={blink(t, 3)} />
        </div>
      </Scene>
      <Burst t={t} t0={k.week} x={momB.x + 60} y={FEET_Y - 10} r={110} />
    </div>
  );
};
const momFocusB = (s: ShotNow): Focus => { const h = headAt(MOM, {...momB, pose: 'shake'}); void s; return {x: h.x, y: h.y, r: h.r}; };

// =================================================================== C: the blood (acting kit, 2026-11-21)
// Crea SURFS in on a red cell along an arc and lands it in the middle of the stream; on "blood." a splash; on "muscles." a signpost
// with a flexed muscle pops up by the far opening, he points at it and zips into the opening, shrinking, with speed lines.
const timesC = (s: ShotNow) => ({blood: at(s, 'C1', 'blood', 1.57), c2: at(s, 'C2', undefined, 2.36), heads: at(s, 'C2', 'heads', 3.87), mus: at(s, 'C2', 'muscles', 4.43)});
const posC = (s: ShotNow) => {
  const t = s.t, k = timesC(s);
  const inK = keyed(t, 0, [[0, 1, 0.7, 'out']]);
  const [ax, ay] = arcPt([-160, 1560], [560, 1160], 260, inK);
  const zip = clamp01((t - k.mus - 0.35) / 0.55);
  const [zx, zy] = arcPt([560, 1160], [546, 760], 120, easeOut(zip));
  const surf = t < 0.7 ? Math.sin(t * 9) * 6 : 0;
  return {x: zip > 0 ? zx : ax, y: (zip > 0 ? zy : ay) + surf, size: zip > 0 ? lerp(420, 90, easeOut(zip)) : 420, rot: zip > 0 ? 0 : lerp(-24, -4, inK), zip, gone: zip >= 1};
};
const ShotC: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesC(s);
  const crea = dial(t, 0.5, [[0, 0.7, 0.6], [k.blood, 0.9, 0.6], [k.mus, 1, 0.5]]);
  // the stream's clock: it flows while Crea surfs in (to "blood." and its splash), HOLDS while he talks and points ahead,
  // and flows again when he zips off on "muscles."
  const flowT = Math.min(t, k.blood + 0.5) + Math.max(0, t - k.mus);
  const point = keyed(t, 0, [[k.c2 + 0.24, 1, 0.25, 'back'], [k.mus, 0, 0.2]]);
  const v = posC(s);
  const f = openFace(s, 'crea', 1, 'happy');
  const sign = pop(t, k.mus - 0.1, 0.35);
  const pointing = (point > 0.5 || t > k.mus) && v.zip < 0.05;
  return (
    <>
      <BloodPlace t={flowT} crea={crea} />
      {sign > 0.01 && <Put x={760} y={600} size={300 * sign} rot={6}><MuscleSign /></Put>}
      {!v.gone && (
        <Put x={v.x} y={v.y + hop(t, k.heads, 50, 0.26).dy} size={v.size} rot={v.rot - point * 8} sq={hop(t, k.heads, 50, 0.26).sq}>
          <g transform="translate(0 92) scale(0.95 0.55)"><RedCell mood="closed" mouth="smile" /></g>
          <g transform="translate(0 -18)"><Crea carry={false} mood={pointing ? 'happy' : f.mood} mouth={pointing ? 'big' : f.mouth} look={pointing ? [0.8, -0.6] : [-0.2, -0.5]} /></g>
        </Put>
      )}
      <Burst t={t} t0={k.blood + 0.05} x={v.x + 40} y={v.y + 60} r={90} col="#f3c7a8" />
      {v.zip > 0 && v.zip < 0.9 && <SpeedLines x={v.x} y={v.y} dir={[0, -1]} len={180} o={1 - v.zip} />}
    </>
  );
};
const viewC = () => ({x: 540, y: 960, z: 1}); // held: the stream moves, the camera does not

// =================================================================== D: inside a muscle cell (acting kit)
// 0.0  a quick cut to Mom pressing a dumbbell overhead ("Heavy lift!"), then inside: the fibres CRUNCH and the batteries go out
//      one after another, the big one panics and shakes as it drains red ("We're going flat!")
// D2   Crea runs in from the left, winds up on "Spark", THROWS on "coming!": the spark flies on an arc and HITS the battery on
//      "Recharged!" (burst): it fills green with a bounce and throws its arms up
// D3   Muscle drops in, filling half the frame, and does three reps on the beats (power, short, hard, bursts)
// D4   Muscle in a running headband jogs on the spot, sweats, slows and slumps on "barely"; the batteries sink to yellow
type DTimes = {lift: number; flat: number; inside: number; d2: number; spark: number; coming: number; re: number; d3: number; reps: number[]; d4: number; run: number; bar: number};
const timesD = (s: ShotNow): DTimes => {
  const d3 = at(s, 'D3', undefined, 3.4), d4 = at(s, 'D4', undefined, 6.33);
  return {
    lift: at(s, 'D1', 'lift', 0.3), flat: at(s, 'D1', 'flat', 0.92), inside: at(s, 'D1', 'lift', 0.3) + 0.3, d2: at(s, 'D2', undefined, 1.7),
    spark: at(s, 'D2', 'spark', 1.7), coming: at(s, 'D2', 'coming', 2.07), re: at(s, 'D2', 'recharged', 2.39),
    d3, reps: [at(s, 'D3', 'power', d3 + 0.57), at(s, 'D3', 'short', d3 + 1.08), at(s, 'D3', 'hard', d3 + 1.6), at(s, 'D3', 'bursts', d3 + 1.94)],
    d4, run: at(s, 'D4', 'run', d4 + 0.41), bar: at(s, 'D4', 'barely', d4 + 1.66),
  };
};
const repFlex = (t: number, reps: number[]) => reps.reduce((m, r) => Math.max(m, t >= r - 0.08 && t < r + 0.34 ? Math.sin(clamp01((t - r + 0.08) / 0.42) * Math.PI) : 0), 0);
const dialsD = (t: number, k: DTimes) => {
  const reps = repFlex(t, k.reps);
  const flex = Math.max(keyed(t, 0, [[k.inside, 1, 0.12, 'snap'], [k.re, 0.3, 0.4]]), reps);
  const drain = keyed(t, 0, [[k.inside, 0.55, 0.3], [k.flat, 1, 0.45], [k.bar, 0.7, 0.6]]);
  const charge = keyed(t, 0, [[k.re, 1, 0.5, 'back'], [k.bar, 0.35, 0.6]]);
  return {flex, drain, charge, level: batteryLevel(540, drain, charge)};
};
const BAT_Y = gapY(1, 600) - 10;
const MUS_Y = gapY(0, 540) + 20; // low enough that its name tag fits ABOVE it (below, the tag covered the battery's face)
const momPress = {view: 'three-quarter' as const, facing: 'right' as const, x: 420, y: FEET_Y - 22, scale: PEOPLE_SCALE};
const ShotD: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesD(s);
  if (t < k.inside) {
    // the cut to the gym: she presses the dumbbell up on "lift!"
    const pose = poseAt(t, [[-9, 'rest'], [k.lift - 0.25, 'press', 0.25]]);
    const o = {...momPress, pose};
    const hand = handAt(MOM, o).L;
    const hd = headAt(MOM, momPress);
    return (
      <div style={{position: 'absolute', inset: 0, background: GYM.wall, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: frameOf(1.6, [hd.x, hd.y + 200], [560, 900])}}>
          <Scene bg={GYM.wall}>
            <GymRoom needle={0.97} />
            <Put x={hand.palm[0]} y={hand.palm[1]} size={170}><Dumbbell /></Put>
            <PersonAt spec={MOM} {...o} expr="angry" look={[0.4, -0.8]} blink={0} />
          </Scene>
        </div>
      </div>
    );
  }
  const d = dialsD(t, k);
  const bf = openFace(s, 'battery', 4, 'scared');
  const cf = openFace(s, 'crea', 1, 'angry');
  const mf = openFace(s, 'muscle', 6, 'happy');
  // the battery
  const panic = d.drain > 0.3 && d.level < 0.45 && t < k.re;
  const batHop = hop(t, k.re + 0.02, 70, 0.3);
  const shk = panic ? Math.sin(t * 60) * 7 : 0;
  // Crea: runs in, winds up, throws, recovers
  const crX = keyed(t, -260, [[k.d2 - 0.35, 300, 0.35, 'out']]);
  const wind = keyed(t, 0, [[k.spark, 1, 0.3, 'ease'], [k.coming, -0.6, 0.12, 'snap'], [k.coming + 0.2, 0, 0.35, 'ease']]);
  const sparkK = clamp01((t - k.coming) / Math.max(0.15, k.re - k.coming));
  const [spx, spy] = arcPt([300 + 40, BAT_Y - 230], [560, BAT_Y - 60], 260, sparkK);
  // Muscle: drops in on D3, reps, then the jog and the slump
  const musIn = keyed(t, 0, [[k.d3 - 0.3, 1, 0.35, 'back']]);
  const jog = t > k.run && t < k.bar ? Math.abs(Math.sin((t - k.run) * Math.PI / 0.28)) * lerp(40, 12, clamp01((t - k.run) / (k.bar - k.run))) : 0;
  const slump = keyed(t, 0, [[k.bar, 1, 0.4, 'ease']]);
  const band = t > k.d4 - 0.1;
  const sweat = band ? clamp01((t - k.run) / 1.6) + (t - k.run) * 0.8 : 0;
  return (
    <>
      <MuscleCellPlace t={t} flex={d.flex} drain={d.drain} charge={d.charge} />
      {musIn > 0.01 && (
        <Put x={540} y={lerp(-200, MUS_Y, musIn) - jog + slump * 40} size={560} rot={slump * 12} sq={repFlex(t, k.reps) * 0.12 - (jog > 20 ? 0.05 : 0) + slump * 0.08}>
          <Muscle flex={band ? 0.2 : Math.max(0.3, repFlex(t, k.reps))} arm={!band && latched(t, (u) => repFlex(u, k.reps), 0.4, 0.4)} band={band} sweat={sweat} mood={slump > 0.5 ? 'sad' : mf.mood} mouth={slump > 0.5 ? 'wavy' : mf.mouth} look={[0, 0.4]} />
        </Put>
      )}
      <Put x={540 + shk} y={BAT_Y + batHop.dy} size={440} sq={batHop.sq}>
        <Battery charge={d.level} charging={t > k.re && t < k.re + 0.8} mood={t > k.re ? 'happy' : bf.mood} mouth={t > k.re && t < k.re + 1 ? 'big' : bf.mouth} look={t > k.d2 - 0.4 && t < k.re ? [-0.7, 0] : [0, -0.4]} />
      </Put>
      {t > k.d2 - 0.4 && (
        <Put x={crX - 60 * wind} y={BAT_Y + 20} size={360} rot={-18 * wind} sq={voiceSq(s, 'crea')}><Crea carry={t < k.coming} mood={cf.mood} mouth={cf.mouth} look={[0.8, -0.3]} /></Put>
      )}
      {t >= k.coming && sparkK < 1 && (
        <>
          <SpeedLines x={spx} y={spy} dir={[560 - 340, 170]} len={130} o={0.9} />
          <Put x={spx} y={spy} size={170} rot={sparkK * 260}><Spark /></Put>
        </>
      )}
      <Burst t={t} t0={k.re} x={560} y={BAT_Y - 70} r={150} col="#ffd23f" />
    </>
  );
};
const viewD = () => ({x: 540, y: 900, z: 1});
const TagD = tagVia(viewD);
const ScreenD: React.FC<{s: ShotNow}> = ({s}) => {
  const k = timesD(s);
  return (
    <>
      <TagD s={s} label="BATTERY (ATP)" x={540} y={BAT_Y} r={250} t={s.t - k.inside - 0.1} /> {/* the arrow stops above the cap (at r 150 its tip sat on the label: "ATP" read "AYP") */}
      <TagD s={s} label="MUSCLE FIBRE" x={540} y={MUS_Y - 40} r={95} t={s.t - k.d3 - 0.2} /> {/* a tight radius: the tag fits ABOVE Muscle (below, it covered the battery's face) */}
    </>
  );
};

// =================================================================== E: the kidney filter (the twist, acting kit)
// E1 "A little of me breaks down": a chip POPS off Crea (burst) and rides down the tube to the kidney: CREATININE (its name tag)
// E2 "Your blood test": a syringe reaches in from outside and draws; on "Looks" the blood-test card SLAMS on, red arrow up;
//    on "trouble!" the Kidney jumps in fright and shakes
// E3 on "no" the arrow turns into a green tick; on "harm" and "found" the Kidney hops twice for joy
type ETimes = {little: number; breaks: number; crea: number; blood: number; it: number; looks: number; trouble: number; e3: number; no: number; harm: number; found: number};
const timesE = (s: ShotNow): ETimes => {
  const e2 = at(s, 'E2', undefined, 2.5), e3 = at(s, 'E3', undefined, 6.17);
  return {little: at(s, 'E1', 'little', 0.21), breaks: at(s, 'E1', 'breaks', 0.74), crea: at(s, 'E1', 'creatinine', 1.46), blood: at(s, 'E2', 'blood', e2 + 0.26), it: at(s, 'E2', 'it.', e2 + 1.46),
    looks: at(s, 'E2', 'looks', e2 + 1.94), trouble: at(s, 'E2', 'trouble', e2 + 2.83), e3, no: at(s, 'E3', 'no', e3 + 2.25), harm: at(s, 'E3', 'harm', e3 + 2.94), found: at(s, 'E3', 'found', e3 + 3.46)};
};
const KID: [number, number] = [330, 1080]; // clear of the act-2 watermark (bottom left, y 1330: it sat on the Kidney's body)
const CREA_E: [number, number] = [800, 960];
/** Where the creatinine chip is at time t: popped off Crea, then down the tube. */
const chipAt = (t: number, k: ETimes): [number, number] | null => {
  if (t < k.breaks) return null;
  const u = clamp01((t - k.breaks) / 1.8);
  if (u < 0.25) return arcPt([CREA_E[0] - 30, CREA_E[1] - 80], [TUBULE[0][0], TUBULE[0][1]], 140, u / 0.25);
  const k2 = ((u - 0.25) / 0.75) * (TUBULE.length - 2);
  const j = Math.min(TUBULE.length - 2, Math.floor(k2)), r = k2 - j;
  return [lerp(TUBULE[j][0], TUBULE[j + 1][0], r), lerp(TUBULE[j][1], TUBULE[j + 1][1], r)];
};
const ShotE: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesE(s);
  const bits = dial(t, 0.2, [[0, 0.4, 0.6], [k.crea, 1, 0.8], [k.no, 0.6, 0.6]]);
  // the filter's clock runs only during the beats: the chip's ride, and the blood test; between them the filter holds still
  const win = (a: number, b: number) => clamp01((t - a) / Math.max(0.01, b - a)) * (b - a);
  const flowT = win(0, 0.6) + win(k.breaks, k.breaks + 2.2) + win(k.blood, k.blood + 1.2);
  const kf = openFace(s, 'kidney', 7, 'scared');
  const cf = openFace(s, 'crea', 1, 'neutral');
  const fright = take(t, k.trouble, 0.9);
  const scared = t > k.trouble && t < k.no;
  const joy = hop(t, k.harm, 80, 0.3), joy2 = hop(t, k.found, 80, 0.3);
  const ch = chipAt(t, k);
  const pinch = hop(t, k.breaks - 0.05, 40, 0.22);
  // the syringe reaches in from the top right on "blood" and goes back after "it."
  const syr = keyed(t, 0, [[k.blood - 0.1, 1, 0.3, 'out'], [k.it + 0.2, 0, 0.35, 'ease']]);
  return (
    <>
      <KidneyFilterPlace t={t} bits={bits} flow={flowT} />
      <Put x={KID[0] + (scared ? Math.sin(t * 55) * 6 : 0)} y={KID[1] + fright.dy + joy.dy + joy2.dy} size={440} rot={fright.lean * 0.6} sq={joy.sq + joy2.sq}>
        <Kidney mood={scared ? 'scared' : t > k.no ? 'happy' : kf.mood} mouth={scared ? 'o' : t > k.no ? 'big' : kf.mouth} look={[0.6, -0.4]} />
      </Put>
      <Put x={CREA_E[0]} y={CREA_E[1] + pinch.dy} size={300} rot={-6} sq={pinch.sq + voiceSq(s, 'crea')}><Crea mood={cf.mood} mouth={cf.mouth} look={[-0.6, 0.3]} /></Put>
      {ch && <Put x={ch[0]} y={ch[1]} size={70} rot={t * 120}><Grain seed={7} /></Put>}
      <Burst t={t} t0={k.breaks} x={CREA_E[0] - 30} y={CREA_E[1] - 80} r={70} />
      {syr > 0.01 && <Put x={lerp(1260, 900, syr)} y={lerp(160, 430, syr)} size={420} rot={-24}><Syringe /></Put>}
    </>
  );
};
const viewE = () => ({x: 540, y: 960, z: 1});
const TagE = tagVia(viewE);
/** The blood test, as a picture: a tube of blood with a red arrow going up; on "no" the arrow turns into a green tick. It SLAMS on. */
const BloodTest: React.FC<{t: number; ok: number}> = ({t, ok}) => {
  if (t < 0) return null;
  const k = t < 0.12 ? lerp(2.4, 0.9, easeOut(t / 0.12)) : t < 0.3 ? lerp(0.9, 1, (t - 0.12) / 0.18) : 1;
  const up = Math.sin(t * 6) * 4 * (1 - ok);
  return (
    <svg style={{position: 'absolute', left: 760 - 170, top: 420 - 170, overflow: 'visible'}} width={340} height={340} viewBox="-100 -100 200 200">
      <g transform={`rotate(-6) scale(${(k * 1.55).toFixed(3)})`}>
        <circle cx={0} cy={0} r={92} {...EDGE} fill="#ffffff" />
        <g transform="rotate(-14) translate(-18 0)">
          <Shape d="M -16 -66 L 16 -66 L 16 48 Q 16 66 0 66 Q -16 66 -16 48 Z" fill="#f4f7fb" />
          <path d="M -15 -6 L 15 -6 L 15 48 Q 15 64 0 64 Q -15 64 -15 48 Z" fill={CLOTH.red} {...EDGE_IN} />
          <Shape d="M -22 -78 L 22 -78 L 22 -62 L -22 -62 Z" fill={CLOTH.purple} shadow={0} />
        </g>
        {ok < 0.5 ? (
          <g transform={`translate(44 ${-6 + up})`} opacity={1 - ok * 2}>
            <path d="M 0 -46 L 26 -12 L 10 -12 L 10 38 L -10 38 L -10 -12 L -26 -12 Z" fill="#ef5b5b" {...EDGE} />
          </g>
        ) : (
          <g transform="translate(44 0)" opacity={(ok - 0.5) * 2}>
            <circle cx={0} cy={0} r={36} {...EDGE} fill="#5cc46a" />
            <path d="M -16 0 L -4 13 L 18 -12" stroke="#ffffff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        )}
      </g>
    </svg>
  );
};
const ScreenE: React.FC<{s: ShotNow}> = ({s}) => {
  const k = timesE(s);
  const end = s.lines.find((l) => l.id === 'E3');
  const out = end ? clamp01((s.t - (end.from + end.voice)) / 0.25) : 0;
  const ch = chipAt(s.t, k);
  return (
    <>
      <TagE s={s} label="KIDNEY" x={KID[0]} y={KID[1]} r={170} t={s.t - 0.3} />
      {ch && <TagE s={s} label="CREATININE" x={ch[0]} y={ch[1]} r={50} t={s.t - k.breaks - 0.9} dur={1.4} />} {/* named as it leaves Crea, gone before it nears the caption */}
      <div style={{opacity: 1 - out}}><BloodTest t={s.t - k.looks} ok={go(s.t, k.no, 0.3)} /></div>
      <Burst t={s.t} t0={k.looks} x={760} y={420} r={190} />
    </>
  );
};

// =================================================================== F: the clinic (acting kit)
// Dr. Mira holds the lab sheet (her clipboard); Mom holds her shaker at her chest (drawn behind her hand). The camera holds.
// "hair?" Mom jumps in panic; "no hair loss" she hops for joy. No raised single finger (it could read as rude at phone size).
const DOC_X = 270, MOM_X = 800;
const momF = {view: 'three-quarter' as const, facing: 'left' as const, x: MOM_X, y: FEET_Y, scale: PEOPLE_SCALE};
const clinicCast = (s: ShotNow) => {
  const t = s.t;
  const T = (id: string, w: string | undefined, d: number) => at(s, id, w, d);
  // each change is a key pose that then HOLDS (the camera holds too): raise the sheet, nod on "blood", lower it, open the hand on
  // "Ask", rest, open the palm on "no" (the script's "act" events name these moments)
  const f2 = T('F2', undefined, 2.42);
  const docPose = poseAt(t, [[-9, 'rest'], [0, 'clipboard', 0.3], [f2, 'rest', 0.35], [T('F2', 'ask', 3.9), 'explain', 0.3], [T('F3', undefined, 5.8), 'rest', 0.45], ]); // on "no" she stays at rest and NODS (both 'youSee' and 'explain' reached across into Mom's close-up and covered her hand)
  const nodAt = (t0: number) => { const u = (t - t0) / 0.4; return u <= 0 || u >= 1 ? 0 : -Math.sin(Math.PI * u); };
  const doc = {spec: DOC, pose: docPose, expr: exprOf(s, 'doctor', 'neutral'), look: [0.7, 0.3] as [number, number], x: DOC_X, facing: 'right' as const, talk: talkSmooth(s, 'doctor'), blink: blink(t, 2.2), bob: nodAt(T('F1', 'blood', 1.63)) + nodAt(T('F5', 'no', 9.3))};
  const mom = {spec: MOM, ...momF, pose: 'holdL' as const, expr: exprOf(s, 'mom', 'neutral'), look: [0.7, 0.3] as [number, number], talk: talkSmooth(s, 'mom'), blink: blink(t, 0.7), bob: 0};
  return {doc, mom, panic: take(t, T('F3', 'hair', 6.2) - 0.05, 0.8), joy: hop(t, T('F5', 'loss', 9.8), 90, 0.32)};
};
const ShotF: React.FC<{s: ShotNow}> = ({s}) => {
  const {doc, mom, panic, joy} = clinicCast(s);
  const hand = handAt(MOM, {...momF, pose: 'holdL'}).L;
  const dy = panic.dy + joy.dy;
  return (
    <Scene bg={CLINIC.wall}>
      <CreaClinic />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${dy.toFixed(1)}px)`}}>
        <Put x={hand.palm[0]} y={hand.palm[1] - 10} size={170}><Shaker /></Put>
        <PersonAt {...mom} expr={panic.shock > 0.5 && joy.dy === 0 && s.t < at(s, 'F4', undefined, 7) ? 'surprised' : mom.expr} />
      </div>
      <PersonAt {...doc} view="three-quarter" y={FEET_Y} scale={PEOPLE_SCALE} />
    </Scene>
  );
};
const NumTag: React.FC<{s: ShotNow; text: string; id: string; word: string; x?: number; y?: number}> = ({s, text, id, word, x = 780, y = 330}) => {
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
const ScreenF: React.FC<{s: ShotNow}> = ({s}) => <NumTag s={s} text="12 weeks" id="F4" word="twelve" x={540} y={300} />;
/** The clinic's pictures: one held framing per line, a hard cut at each line (wide, Dr. Mira, Mom, wide, Mom). */
const viewF = (s: ShotNow) => {
  const id = s.cur?.id ?? 'F1';
  const wide = {x: 540, y: 1000, z: 1.12};
  const doc = {x: DOC_X + 80, y: 930, z: 1.75}, mom = {x: MOM_X - 80, y: 930, z: 1.7};
  return id === 'F2' ? doc : id === 'F3' || id === 'F5' ? mom : wide;
};
const faceF = (who: string): Focus => {
  const o = who === 'mom' ? momF : {view: 'three-quarter' as const, facing: 'right' as const, x: DOC_X, y: FEET_Y, scale: PEOPLE_SCALE};
  const h = headAt(who === 'mom' ? MOM : DOC, o);
  return {x: h.x, y: h.y, r: h.r};
};

// =================================================================== G: the answer (a NEW view: the cell close up, with a door)
// Water pours in and the cell swells like a water balloon while Crea says it; he walks to the door; a grumpy Fat blob waddles up
// and KNOCKS on "creatine."; on "Not fat!" Crea SLAMS the door: a burst, the Fat bounces off and tumbles away.
const timesG = (s: ShotNow) => ({thats: at(s, 'G1', "that's", 1.32), water: at(s, 'G1', 'water', 1.64), from: at(s, 'G1', 'from', 2.54), cre: at(s, 'G1', 'creatine', 2.73), not: at(s, 'G1', 'not', 3.39), fat: at(s, 'G1', 'fat', 3.7)});
const ShotG: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesG(s);
  const fill = keyed(t, 0.35, [[0, 0.5, 0.8], [k.thats, 0.75, 0.4], [k.water, 1, 0.6, 'back']]);
  const pour = t < k.cre ? 1 : 1 - clamp01((t - k.cre) / 0.4);
  const door = keyed(t, 0, [[k.fat - 0.05, 1, 0.1, 'snap']]);
  const [dx, dy] = doorAt(fill);
  const f = openFace(s, 'crea', 1, 'happy');
  // Crea: in the middle, then to the door on "from"; a hop after the slam
  const cx = keyed(t, 360, [[k.from - 0.2, dx - 110, 0.45, 'out']]);
  const after = hop(t, k.fat + 0.35, 70, 0.3);
  // Fat: waddles in from the right, knocks, gets bounced off by the door, tumbles away
  const fatX = keyed(t, 1300, [[k.water, dx + 130, 0.8, 'out']]);
  const waddle = t > k.water && t < k.water + 0.8 ? Math.abs(Math.sin((t - k.water) * Math.PI / 0.2)) * 18 : 0;
  const knock = t > k.cre && t < k.not ? (Math.sin((t - k.cre) * 22) > 0 ? 1 : 0) : 0;
  const bounce = clamp01((t - k.fat) / 0.6);
  return (
    <>
      <CellDoorPlace t={t} fill={fill} pour={pour} door={door} />
      <Put x={fatX + bounce * 420} y={dy + 40 - waddle - Math.sin(bounce * Math.PI) * 160 + bounce * 120} size={300} rot={bounce * 220} sq={knock * 0.05}>
        <Fat knock={knock} mood="angry" mouth={bounce > 0 ? 'o' : 'frown'} look={[-0.7, 0]} />
      </Put>
      <Put x={cx} y={CELLDOOR.c[1] + 60 + after.dy} size={330} sq={after.sq + voiceSq(s, 'crea')} rot={t > k.not && t < k.fat + 0.2 ? 10 : 0}>
        <Crea mood={t > k.not ? 'angry' : f.mood} mouth={t > k.not && t < k.fat + 0.35 ? 'big' : f.mouth} look={t > k.cre ? [0.8, 0] : [0, 0.3]} />
      </Put>
      <Burst t={t} t0={k.fat} x={dx + 20} y={dy} r={150} />
    </>
  );
};
const viewG = () => ({x: 600, y: 1010, z: 1.35}); // close on the cell, the door and Fat (at z 1 the cell filled a third of the frame)
const TagG = tagVia(viewG);
const ScreenG: React.FC<{s: ShotNow}> = ({s}) => {
  const k = timesG(s);
  const [dx, dy] = doorAt(1);
  return <TagG s={s} label="FAT" x={dx + 130} y={dy + 40} r={120} t={s.t - k.water - 0.6} />;
};

// ------------------------------------------------------------------ the shots
export const CREATINE_SHOTS: Record<string, ShotDef> = {
  A: {Scene: dived(ShotA), Screen: ScreenA, focus: (_w, s) => { const v = posA(s); return {x: v.x, y: v.y, r: v.size * 0.32}; }, view: viewA},
  B: {Scene: ShotB, focus: (_w, s) => momFocusB(s), view: () => ({x: 520, y: 900, z: 1.5})}, // medium on Mom and the dial, held still
  C: {Scene: ShotC, focus: (_w, s) => { const v = posC(s); return {x: v.x, y: v.y, r: v.size * 0.32}; }, view: viewC},
  D: {Scene: ShotD, Screen: ScreenD, focus: () => ({x: 540, y: 900, r: 160}), view: viewD},
  E: {Scene: ShotE, Screen: ScreenE, focus: () => ({x: 540, y: 1000, r: 180}), view: viewE},
  F: {Scene: ShotF, Screen: ScreenF, focus: (who) => faceF(who === 'mom' ? 'mom' : 'doctor'), view: viewF}, // hard cuts between HELD pictures, one per line: the room camera's slow slides kept the picture moving
  G: {Scene: ShotG, Screen: ScreenG, focus: () => ({x: 540, y: 1000, r: 150}), view: viewG},
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
/** "IT'S WATER, NOT FAT": a big water drop with a small tick. */
const WaterBadge: React.FC<{t?: number}> = ({t = 0}) => {
  const b = Math.sin(clamp01(t / 0.5) * Math.PI) * 6;
  return (
    <Badge bg={tint(CLOTH.sky, 0.25)} id="cr-water">
      <path d={`M 0 ${-70 - b} C 22 ${-40 - b} 48 -10 48 18 C 48 46 26 64 0 64 C -26 64 -48 46 -48 18 C -48 -10 -22 ${-40 - b} 0 ${-70 - b} Z`} fill="#bfe3f2" {...EDGE} />
      <path d="M -24 10 q 2 -22 18 -36" stroke="#ffffff" strokeWidth={9} strokeLinecap="round" fill="none" />
    </Badge>
  );
};
/** "TELL YOUR DOCTOR": the blood tube. */
const TubeBadge: React.FC<{t?: number}> = () => (
  <Badge bg="#ffffff" id="cr-tube">
    <g transform="rotate(-18)">
      <Shape d="M -20 -70 L 20 -70 L 20 44 Q 20 66 0 66 Q -20 66 -20 44 Z" fill="#f4f7fb" />
      <path d="M -19 -8 L 19 -8 L 19 44 Q 19 64 0 64 Q -19 64 -19 44 Z" fill={CLOTH.red} {...EDGE_IN} />
      <Shape d="M -27 -84 L 27 -84 L 27 -64 L -27 -64 Z" fill={CLOTH.purple} shadow={0} />
    </g>
  </Badge>
);
/** "KIDNEYS? ASK FIRST": the kidney from the video. */
const KidneyBadge: React.FC<{t?: number}> = () => (
  <Badge bg={tint(CLOTH.yellow, 0.55)} id="cr-kid">
    <g transform="translate(6 6) scale(0.78)"><Kidney mood="open" mouth="smile" look={[0, 0]} /></g>
  </Badge>
);
void roundPoly; void INK;

// ------------------------------------------------------------------ the CTA end card: three strong points (source: Antonio 2021)
export const CREATINE_CTA: {title: string; points: CtaPoint[]; voice?: string; seconds: number; at: {head: number; points: [number, number, number]; follow: number}} = {
  title: 'CREATINE: KNOW THIS',
  // read by the narrator (Joey), assets/toons-voice/creatine/cta.mp3 at his own pace; beats from videos/creatine/cta-timings.json
  // ("Creatine:" 0, "The" 2.53, "Taking" 6.44, "Kidney" 9.95, "Follow" 12.59)
  voice: 'toons/creatine/voice/cta.mp3', seconds: 16.11,
  at: {head: 0, points: [2.53, 6.44, 9.95], follow: 12.59},
  points: [
    {icon: <WaterBadge t={2} />, big: "IT'S WATER, NOT FAT", small: 'the first jump on the scale'},
    {icon: <TubeBadge t={2} />, big: 'TELL YOUR DOCTOR', small: 'before a blood test'},
    {icon: <KidneyBadge t={2} />, big: 'KIDNEYS? ASK FIRST', small: 'if you have kidney problems'},
  ],
};
