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
import {CLINIC, CreaClinic, GYM, GymRoom, LIFTER, SCALE} from './crea-gym';
import {FEET_Y, PEOPLE_SCALE} from './scenes-rooms';
import {castById, headAt, PersonAt, type Expr, type PoseIn, type PoseName} from './people-rig';
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

const MOM = LIFTER;
const DOC = castById('doctor');

// =================================================================== A: the hook
// 0.00  she is on the scale (the platform dips: thud); Crea pops up on the dial and speaks
// "jumps!"  the needle SLAMS into the red (flash, boing), she gasps
// A2 "scale"  the camera dives into her upper arm: a round window opens on the muscle cell inside, swollen with water
const GYM_K = 1.45, GYM_O: [number, number] = [540, 820]; // the cold open is the gym, closer
const toGym = ([x, y]: [number, number]): [number, number] => [GYM_O[0] + (x - GYM_O[0]) * GYM_K, GYM_O[1] + (y - GYM_O[1]) * GYM_K];
const momA = {pose: 'rest' as const, view: 'three-quarter' as const, facing: 'right' as const, x: 400, y: FEET_Y - 22, scale: PEOPLE_SCALE};
const needleAt = (t: number, tSlam: number, from = 0.3) => {
  const k = go(t, tSlam - 0.06, 0.12);
  const u = t - tSlam - 0.06;
  const wob = u > 0 ? Math.sin(u * 22) * Math.exp(-u * 5) * 0.06 : 0;
  return lerp(from, 0.97, k) + wob;
};
const hookA = (s: ShotNow) => {
  const slam = at(s, 'A1', 'jumps', 1.2);
  const dive0 = at(s, 'A2', 'scale', 2.4) - 0.15;
  return {slam, dive0, dive1: dive0 + 0.55};
};
/** Where the dive goes in: her upper arm (frame pixels of the closer gym picture). */
const diveAtA = (): [number, number] => { const h = headAt(MOM, momA); return toGym([h.x + h.r * 0.95, h.y + h.r * 2.3]); };
const GymCold: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, h = hookA(s);
  const step = t < 0.3 ? -Math.sin((t / 0.3) * Math.PI) * 0.8 : 0;
  const shock = go(t, h.slam, 0.2);
  const pose = poseAt(t, [[-9, 'rest'], [h.slam, 'worried', 0.3]]);
  const cp = pop(t, 0.05, 0.3);
  const cf = bodyFace(s, 'crea', 1, 'happy');
  return (
    <div style={{position: 'absolute', inset: 0, background: GYM.wall, overflow: 'hidden'}}>
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${GYM_O[0]}px ${GYM_O[1]}px`, transform: `scale(${GYM_K})`}}>
        <Scene bg={GYM.wall}>
          <GymRoom needle={needleAt(t, h.slam)} />
          <PersonAt spec={MOM} {...momA} pose={pose} expr={shock > 0.5 ? 'surprised' : 'neutral'} look={shock > 0.5 ? [0.8, 0.1] : [0.6, 0.3]} blink={blink(t, 3)} bob={step + sway(t, 3, 1) * 0.3} />
          {cp > 0.01 && <Put x={SCALE.x + 10} y={SCALE.y - SCALE.r - 110 - shock * 14} size={250 * cp} rot={4 + sway(t, 1.2) * 3 * calm(s, 'crea')} sq={voiceSq(s, 'crea')}><Crea mood={cf.mood} mouth={cf.mouth} look={[-0.6, 0.4]} /></Put>}
        </Scene>
      </div>
    </div>
  );
};
const posA = (s: ShotNow) => {
  const t = s.t, h = hookA(s);
  const inside = go(t, h.dive1 - 0.1, 0.4);
  const c = calm(s, 'crea');
  return {x: 540 + sway(t, 2.4, 1) * 10 * c, y: 1010 + sway(t, 2, 3) * 8 * c, size: lerp(300, 420, inside), rot: sway(t, 1.4, 2) * 4 * c};
};
const ShotA: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, h = hookA(s);
  const water = dial(t, 0.8, [[0, 0.85, 0.2], [h.slam, 0.9, 0.3], [at(s, 'A2', undefined, 1.8), 0.95, 0.3], [at(s, 'A2', 'fat', 3.6), 1, 0.5]]);
  const v = posA(s);
  const f = bodyFace(s, 'crea', 1, 'happy');
  const k = clamp01((t - h.dive0) / (h.dive1 - h.dive0)), e = k * k * (3 - 2 * k);
  const [px, py] = diveAtA();
  const R = e * 2300, Z = 1 + e * e * 7;
  return (
    <>
      <div style={{position: 'absolute', inset: 0}}>
        <DiveCtx.Provider value={0}><MuscleCellPlace t={t} water={water} /></DiveCtx.Provider>
        <Put x={v.x} y={v.y} size={v.size} rot={v.rot} sq={voiceSq(s, 'crea')}><Crea mood={f.mood} mouth={f.mouth} look={[0, 0.3]} /></Put>
      </div>
      {e < 1 && (
        <div style={{position: 'absolute', inset: 0, transformOrigin: `${px}px ${py}px`, transform: `scale(${Z.toFixed(4)})`,
          WebkitMaskImage: e > 0 ? `radial-gradient(circle at ${px}px ${py}px, transparent ${(R / Z).toFixed(1)}px, black ${(R / Z + 1).toFixed(1)}px)` : undefined}}>
          <GymCold s={s} />
        </div>
      )}
    </>
  );
};
const viewA = slowPush(540, 990, 1.02, 1.1);
const TagA = tagVia(viewA);
const ScreenA: React.FC<{s: ShotNow}> = ({s}) => {
  const v = posA(s);
  // the name tag only after the hook, once we are inside (the owner, 2026-11-21: no text in the first seconds)
  return <TagA s={s} label="CREA (CREATINE)" x={v.x} y={v.y} r={v.size * 0.32} t={since(s, 'A2', 'fat') - 0.1} />;
};

// =================================================================== B: the gym
const momB = {view: 'three-quarter' as const, facing: 'right' as const, x: 400, y: FEET_Y - 22, scale: PEOPLE_SCALE};
const ShotB: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t;
  const pose = poseAt(t, [[-9, 'worried'], [at(s, 'B1', 'started', 0.4) - 0.15, 'shrugR', 0.35]]);
  return (
    <Scene bg={GYM.wall}>
      <GymRoom needle={0.97 + sway(t, 0.6) * 0.008} />
      <PersonAt spec={MOM} {...momB} pose={pose} expr={exprOf(s, 'mom', 'shocked')} look={[0.7, 0.2]} talk={talkSmooth(s, 'mom')} blink={blink(t, 3)} bob={breath(s, 'mom', 1)} />
    </Scene>
  );
};
const momFocusB = (s: ShotNow): Focus => { const h = headAt(MOM, {...momB, pose: 'worried'}); void s; return {x: h.x, y: h.y, r: h.r}; };

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
  B: {Scene: ShotB, focus: (_w, s) => momFocusB(s)},
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
