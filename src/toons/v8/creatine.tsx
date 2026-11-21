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
import {BloodPlace, KidneyFilterPlace, MuscleCellPlace, gapY} from './crea-places';
import {Battery, Crea, Muscle, Spark, roundPoly} from './crea-cast';
import {CLINIC, CreaClinic, GYM, GymRoom, LIFTER, SCALE, Shaker} from './crea-gym';
import {Burst, easeOut, keyed, shake, SpeedLines, Stamp, take} from './act';
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
  const T: React.FC<{s: ShotNow; label: string; x: number; y: number; r: number; t: number}> = ({s, label, x, y, r, t}) => {
    const c = view(s);
    return <CharTag label={label} x={540 + (x - c.x) * c.z} y={960 + (y - c.y) * c.z} r={r * c.z} t={t} />;
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
  const rot = (Math.atan2(hand.dir[1], hand.dir[0]) * 180) / Math.PI;
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(${sx}px, ${sy}px)`}}>
      <Scene bg={GYM.wall}>
        <GymRoom needle={needle} />
        <div style={{position: 'absolute', inset: 0, transform: `translateY(${stomp.dy.toFixed(1)}px)`}}>
          <PersonAt spec={MOM} {...o} expr="angry" look={[0.8, -0.1]} talk={talkSmooth(s, 'mom')} blink={blink(t, 3)} />
          {/* the bottle sits IN her fist (its lower half behind the fingers), and the gripping hand is drawn again over it: her LEFT
              hand, so mirrored (2026-11-21, the owner: "what line in hand": unmirrored, its outline crossed the rig's own hand) */}
          <Put x={hand.palm[0]} y={hand.palm[1] - 18} size={240} rot={rock}><Shaker /></Put>
          <HandAt x={hand.wrist[0]} y={hand.wrist[1]} px={PEOPLE_SCALE * 30} kind="hold" skin={MOM.skin} rot={rot} rod={false} mirror />
        </div>
      </Scene>
      <Burst t={t} t0={k.week} x={momB.x + 60} y={FEET_Y - 10} r={110} />
    </div>
  );
};
const momFocusB = (s: ShotNow): Focus => { const h = headAt(MOM, {...momB, pose: 'shake'}); void s; return {x: h.x, y: h.y, r: h.r}; };

// =================================================================== C: the blood
const posC = (s: ShotNow) => {
  const t = s.t;
  const go2 = go(t, at(s, 'C2', 'muscles', s.dur - 0.8), 0.7); // it zips off toward the right branch
  return {x: lerp(600, 690, go2) + sway(t, 2, 1) * 14, y: lerp(1120, 820, go2) + sway(t, 1.6, 2) * 12, size: lerp(420, 210, go2), rot: -6 + sway(t, 1.3) * 6};
};
const ShotC: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t;
  const crea = dial(t, 0.5, [[0, 0.7, 0.6], [at(s, 'C1', 'blood', 2.2), 0.9, 0.6], [at(s, 'C2', 'muscles', 5.4), 1, 0.5]]);
  const v = posC(s);
  const f = bodyFace(s, 'crea', 1, 'happy');
  return (
    <>
      <BloodPlace t={t} crea={crea} />
      <Put x={v.x} y={v.y} size={v.size} rot={v.rot} sq={voiceSq(s, 'crea')}><Crea mood={f.mood} mouth={f.mouth} look={[-0.2, -0.6]} /></Put>
    </>
  );
};
const viewC = slowPush(560, 1000, 1.0, 1.08);

// =================================================================== D: inside a muscle cell
type DTimes = {lift: number; flat: number; d2: number; spark: number; re: number; d3: number; pow: number; bur: number; run: number; bar: number};
const timesD = (s: ShotNow): DTimes => ({
  lift: at(s, 'D1', 'lift', 0.5), flat: at(s, 'D1', 'flat', 1.4), d2: at(s, 'D2', undefined, 1.8), spark: at(s, 'D2', 'spark', 1.8), re: at(s, 'D2', 'recharged', 2.6),
  d3: at(s, 'D3', undefined, 3.0), pow: at(s, 'D3', 'power', 3.5), bur: at(s, 'D3', 'bursts', 5.0), run: at(s, 'D4', 'run', 6.2), bar: at(s, 'D4', 'barely', 7.6),
});
const dialsD = (t: number, k: DTimes) => {
  const flex = dial(t, 0, [[k.lift, 1, 0.15], [k.re, 0.4, 0.4], [k.pow, 0.7, 0.2], [k.bur, 1, 0.15], [k.run, 0.2, 0.6]]);
  const drain = dial(t, 0, [[k.lift, 0.5, 0.2], [k.flat, 1, 0.4], [k.bar, 0.6, 0.5]]);
  const charge = dial(t, 0, [[k.re, 1, 0.6], [k.bar, 0.3, 0.6]]);
  return {flex, drain, charge, level: clamp01(1 - drain + charge * drain)};
};
const BAT_Y = gapY(1, 600) - 10;
const posD = (s: ShotNow) => {
  const t = s.t, k = timesD(s);
  const crIn = go(t, k.d2 - 0.35, 0.45);
  const musIn = pop(t, k.d3 - 0.3, 0.4);
  return {
    bat: {x: lerp(540, 660, crIn) + sway(t, 2.1, 2) * 6 * calm(s, 'battery'), y: BAT_Y + sway(t, 1.7, 1) * 6, size: 330},
    crea: {x: lerp(-220, 330, crIn), y: BAT_Y + 6 + sway(t, 1.9, 3) * 6, size: 320, on: crIn > 0},
    mus: {x: 540 + sway(t, 2.3, 4) * 8 * calm(s, 'muscle'), y: gapY(0, 540) - 20, size: 380 * musIn, on: musIn > 0.01},
  };
};
const ShotD: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesD(s);
  const d = dialsD(t, k);
  const p = posD(s);
  const bf = bodyFace(s, 'battery', 4, 'scared');
  const cf = bodyFace(s, 'crea', 1, 'angry');
  const mf = bodyFace(s, 'muscle', 6, 'happy');
  // the spark: carried in, then thrown from Crea's arms into the battery on "Recharged!"
  const fly = clamp01((t - k.re + 0.05) / 0.3);
  const carry = t < k.re - 0.05;
  const shake = d.drain > 0.6 && d.level < 0.4 ? sway(t, 0.12) * 6 : 0;
  const charging = t > k.re && t < k.re + 1;
  return (
    <>
      <MuscleCellPlace t={t} flex={d.flex} drain={d.drain} charge={d.charge} />
      {p.mus.on && <Put x={p.mus.x} y={p.mus.y} size={p.mus.size} rot={sway(t, 1.6) * 3 * calm(s, 'muscle')} sq={voiceSq(s, 'muscle')}><Muscle flex={d.flex} mood={mf.mood} mouth={mf.mouth} look={[0, 0.4]} /></Put>}
      <Put x={p.bat.x + shake} y={p.bat.y} size={p.bat.size} rot={sway(t, 1.5) * 3 * calm(s, 'battery')} sq={voiceSq(s, 'battery')}>
        <Battery charge={d.level} charging={charging} mood={bf.mood} mouth={bf.mouth} look={p.crea.on ? [-0.6, 0] : [0, -0.5]} />
      </Put>
      {p.crea.on && <Put x={p.crea.x} y={p.crea.y} size={p.crea.size} rot={sway(t, 1.4, 1) * 4 * calm(s, 'crea')} sq={voiceSq(s, 'crea')}><Crea carry={carry} mood={cf.mood} mouth={cf.mouth} look={[0.7, -0.2]} /></Put>}
      {!carry && fly < 1 && (
        <Put x={lerp(p.crea.x, p.bat.x, fly)} y={lerp(p.crea.y - 140, p.bat.y - 60, fly) - Math.sin(fly * Math.PI) * 90} size={140} rot={fly * 200}><Spark /></Put>
      )}
    </>
  );
};
const viewD = slowPush(540, 820, 1.0, 1.05);
const TagD = tagVia(viewD);
const ScreenD: React.FC<{s: ShotNow}> = ({s}) => {
  const p = posD(s);
  const [bx, by] = inPlane(s, p.bat.x, p.bat.y, 0.4);
  const [mx, my] = inPlane(s, p.mus.x, p.mus.y, 0.4);
  return (
    <>
      <TagD s={s} label="BATTERY (ATP)" x={bx} y={by} r={110} t={since(s, 'D1') - 0.2} />
      {p.mus.on && <TagD s={s} label="MUSCLE FIBRE" x={mx} y={my} r={120} t={since(s, 'D3') - 0.1} />}
    </>
  );
};

// =================================================================== E: the kidney filter (the twist)
type ETimes = {crea: number; blood: number; looks: number; no: number; e3: number};
const timesE = (s: ShotNow): ETimes => ({crea: at(s, 'E1', 'creatinine', 2.0), blood: at(s, 'E2', 'blood', 3.4), looks: at(s, 'E2', 'looks', 4.8), no: at(s, 'E3', 'no', 8.4), e3: at(s, 'E3', undefined, 6.8)});
const ShotE: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesE(s);
  const bits = dial(t, 0.2, [[0, 0.4, 0.6], [k.crea, 1, 0.8], [k.blood, 0.85, 0.2], [k.looks, 1, 0.2], [k.no, 0.6, 0.6]]);
  const kf = bodyFace(s, 'kidney', 7, 'scared');
  const cf = bodyFace(s, 'crea', 1, 'neutral');
  const fright = go(t, k.blood, 0.15) * (1 - go(t, k.e3, 0.4));
  return (
    <>
      <KidneyFilterPlace t={t} bits={bits} />
      <Put x={250 + (fright > 0.3 ? sway(t, 0.14) * 7 : 0)} y={1210 - fright * 30} size={380 * (1 + fright * 0.05)} rot={sway(t, 1.6, 2) * 3 * calm(s, 'kidney')} sq={voiceSq(s, 'kidney')}>
        <Kidney mood={kf.mood} mouth={kf.mouth} look={[0.6, -0.4]} />
      </Put>
      <Put x={800 + sway(t, 2, 1) * 8} y={980 + sway(t, 1.7, 2) * 8} size={280} rot={-6 + sway(t, 1.4) * 4 * calm(s, 'crea')} sq={voiceSq(s, 'crea')}><Crea mood={cf.mood} mouth={cf.mouth} look={[-0.6, 0.2]} /></Put>
    </>
  );
};
const viewE = slowPush(540, 960, 1.0, 1.06);
const TagE = tagVia(viewE);
/** The blood test, as a picture: a tube of blood with a red arrow going up; on "no" the arrow turns into a green tick. */
const BloodTest: React.FC<{t: number; ok: number}> = ({t, ok}) => {
  const k = pop(t, 0, 0.3);
  if (t < 0) return null;
  const up = Math.sin(t * 6) * 4 * (1 - ok);
  return (
    <svg style={{position: 'absolute', left: 780 - 150, top: 330 - 150, overflow: 'visible'}} width={300} height={300} viewBox="-100 -100 200 200">
      <g transform={`scale(${(k * 1.4).toFixed(3)})`}>
        <circle cx={0} cy={0} r={92} {...EDGE} fill="#ffffff" />
        {/* the tube */}
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
  const [kx, ky] = inPlane(s, 250, 1210, 0.4);
  const end = s.lines.find((l) => l.id === 'E3');
  const out = end ? clamp01((s.t - (end.from + end.voice)) / 0.25) : 0;
  return (
    <>
      <TagE s={s} label="KIDNEY" x={kx} y={ky} r={150} t={s.t - 0.3} />
      <div style={{opacity: 1 - out}}><BloodTest t={s.t - k.blood} ok={go(s.t, k.no, 0.3)} /></div>
    </>
  );
};

// =================================================================== F: the clinic
const DOC_X = 270, MOM_X = 800;
const clinicCast = (s: ShotNow) => {
  const t = s.t;
  const T = (id: string, w: string | undefined, d: number) => at(s, id, w, d);
  const docPose = poseAt(t, [[-9, 'youSee'], [T('F2', 'kidney', 2.9), 'oneFinger', 0.3], [T('F3', undefined, 5.6), 'rest', 0.5], [T('F5', 'no', 7.2) - 0.15, 'rest', 0.45]]);
  const momPose = poseAt(t, [[-9, 'rest'], [T('F3', undefined, 5.6) - 0.1, 'shrugR', 0.35], [T('F5', 'no', 7.2) + 0.3, 'thumbsUpR', 0.35]]);
  const doc = {spec: DOC, pose: docPose, expr: exprOf(s, 'doctor', 'neutral'), look: [0.7, 0.3] as [number, number], x: DOC_X, facing: 'right' as const, talk: talkSmooth(s, 'doctor'), blink: blink(t, 2.2), bob: breath(s, 'doctor', 2)};
  const mom = {spec: MOM, pose: momPose, expr: exprOf(s, 'mom', 'neutral'), look: [0.7, 0.3] as [number, number], x: MOM_X, facing: 'left' as const, talk: talkSmooth(s, 'mom'), blink: blink(t, 0.7), bob: breath(s, 'mom', 5)};
  return {doc, mom};
};
const ShotF: React.FC<{s: ShotNow}> = ({s}) => {
  const {doc, mom} = clinicCast(s);
  return (
    <Scene bg={CLINIC.wall}>
      <CreaClinic />
      <PersonAt {...mom} view="three-quarter" y={FEET_Y} scale={PEOPLE_SCALE} />
      <PersonAt {...doc} view="three-quarter" y={FEET_Y} scale={PEOPLE_SCALE} />
    </Scene>
  );
};
/** The yellow number tag, on the SCREEN (after the camera), on the grid, from its word to its line's end (as in no-sleep.tsx). */
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
const faceF = (who: string): Focus => {
  const o = who === 'mom' ? {view: 'three-quarter' as const, facing: 'left' as const, x: MOM_X, y: FEET_Y, scale: PEOPLE_SCALE} : {view: 'three-quarter' as const, facing: 'right' as const, x: DOC_X, y: FEET_Y, scale: PEOPLE_SCALE};
  const h = headAt(who === 'mom' ? MOM : DOC, o);
  return {x: h.x, y: h.y, r: h.r};
};

// =================================================================== G: back inside her muscle, the answer
const ShotG: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t;
  const tThats = at(s, 'G1', "that's", 1.0), tWater = at(s, 'G1', 'water', 1.4), tCre = at(s, 'G1', 'creatine', 2.6), tFat = at(s, 'G1', 'fat', 3.4);
  const water = dial(t, 0.3, [[0, 0.6, 0.6], [tThats, 0.8, 0.3], [tWater, 1, 0.8]]);
  const flex = dial(t, 0, [[tCre, 0.5, 0.3]]);
  const f = bodyFace(s, 'crea', 1, 'happy');
  const hop = Math.max(0, Math.sin(clamp01((t - tFat - 0.3) / 0.45) * Math.PI));
  return (
    <>
      <MuscleCellPlace t={t} water={water} flex={flex} />
      <Put x={540 + sway(t, 2.4, 1) * 10 * calm(s, 'crea')} y={1010 - hop * 90} size={440} rot={sway(t, 1.4, 2) * 4 * calm(s, 'crea')} sq={voiceSq(s, 'crea') + hop * 0.04}><Crea mood={hop > 0.1 ? 'happy' : f.mood} mouth={hop > 0.1 ? 'big' : f.mouth} look={[0, 0.3]} /></Put>
    </>
  );
};
const viewG = slowPush(540, 990, 1.0, 1.1);

// ------------------------------------------------------------------ the shots
export const CREATINE_SHOTS: Record<string, ShotDef> = {
  A: {Scene: dived(ShotA), Screen: ScreenA, focus: (_w, s) => { const v = posA(s); return {x: v.x, y: v.y, r: v.size * 0.32}; }, view: viewA},
  B: {Scene: ShotB, focus: (_w, s) => momFocusB(s), view: () => ({x: 520, y: 900, z: 1.5})}, // medium on Mom and the dial, held still
  C: {Scene: dived(ShotC), focus: (_w, s) => { const v = posC(s); return {x: v.x, y: v.y, r: v.size * 0.32}; }, view: viewC},
  D: {Scene: dived(ShotD), Screen: ScreenD, focus: () => ({x: 540, y: 820, r: 160}), view: viewD},
  E: {Scene: dived(ShotE), Screen: ScreenE, focus: () => ({x: 540, y: 1000, r: 180}), view: viewE},
  F: {Scene: ShotF, Screen: ScreenF, focus: (who) => faceF(who === 'mom' ? 'mom' : 'doctor')},
  G: {Scene: dived(ShotG), focus: () => ({x: 540, y: 1010, r: 150}), view: viewG},
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
