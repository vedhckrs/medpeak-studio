/**
 * "What Happens When You Quit Smoking" (`quit-smoking`), the engine v9 pilot (format 6): its shots by id
 * (videos/quit-smoking/toon.json) and its short end card. The owner approved hook B, the look sheets and the script on 2026-11-23.
 *
 *   B   the chest (STAGES.chest), one framing held. Pass 1 (the hook): grey and tarry, a dusty cough, the last curl of cigarette
 *       smoke drifts down the windpipe and fizzles out; the cilia crew asleep on the floor; they wake, stand and sweep.
 *       Pass 2 (after "3 DAYS LATER"): pinker, less tar, airways open; the crew sweeps a ball of mucus up the windpipe; a huge
 *       cough blows it out of the top of the frame.
 *   C   inside a blood vessel (STAGES.vesselInside), one framing held. Pass 1: the CO gang lounging on red-cell seats. Pass 2
 *       (after "8 HOURS LATER"): half the seats are free and redder; one more is shoved off; an oxygen bubble takes a free seat.
 *   E   Dr. Mira's pale clinic: Dad (a hand on his chest) asks; Mira answers, slower; Dad's loop line.
 *
 * Engine v9 rules held here: a locked camera (no `view`: the whole frame), one action then a hold, faces out of the caption
 * band (y 1324-1434), the listener looks at the speaker, no flash, no shake, the name tag never in the hook line.
 */
import React from 'react';
import {Put, Scene} from './scene';
import {CharTag, type CtaPoint} from './hud';
import {easeOut, keyed} from './act';
import {STAGES, CoEgg, RedDisc} from './anatomy';
import {MiniWorker} from './cells';
import {castById, PersonAt, type PoseIn, type PoseName} from './people-rig';
import {FEET_Y_TWO, PaleClinicRoom, PEOPLE_SCALE_TWO} from './scenes-rooms';
import {CLOTH, EDGE, EDGE_IN, INK, OUTLINE, shade, tint} from './kit';
import {active, blink, bodyFace, clamp01, go, lerp, since, speaking, talkSmooth, type Focus, type ShotDef, type ShotNow} from './play';

const Chest = STAGES.chest.Stage, Vessel = STAGES.vesselInside.Stage;
const DAD = castById('dad');
const MIRA = castById('doctor');

// ------------------------------------------------------------------ helpers
/** Seconds into the shot when that line (or that word of it) starts; `dflt` when the line is not in this shot. */
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
/** One cough: a squeeze up and back over `d` seconds from t0 (the chest stage's `cough` dial). */
const coughAt = (t: number, t0: number, amp = 1, d = 0.7) => {
  // a sharp squeeze in the first quarter, then a slower release: no held peak, so it reads (and measures) as ONE action
  const u = (t - t0) / d;
  if (u < 0 || u > 1) return 0;
  return amp * (u < 0.25 ? Math.sin((u / 0.25) * Math.PI / 2) : 1 - ((u - 0.25) / 0.75) ** 0.9);
};
/** One sweeping stroke: 0 -> 1 -> 0 over `d` seconds from t0 (then the crew holds still). */
const stroke = (t: number, t0: number, d = 1.5) => { const u = (t - t0) / d; return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u) ** 0.5; };
const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} viewBox="0 0 1080 1920">{children}</svg>
);
const face = (x: number, y: number, r: number): Focus => ({x, y, r});

// =================================================================== B: the chest
const LUNG_R_FACE: [number, number] = [290, 640], LUNG_L_FACE: [number, number] = [800, 650];
/** Where the crew stands (on the floor under the lungs, clear of both faces and the caption band) and where it sleeps. */
const CREW: [number, number, number][] = [[250, 1560, 300], [540, 1600, 340], [830, 1560, 300]];
const SLEEP: [number, number, number][] = [[210, 1560, -70], [540, 1770, 88], [870, 1560, 70]];
const CREW_LOOK: [number, number] = [540, 1500];

const timesB = (s: ShotNow) => ({
  wake: at(s, 'B1', 'wake', 1.4), years: at(s, 'B2', 'years', 4.0), brooms: at(s, 'B4', 'brooms', 7.6),
  d2up: at(s, 'D2', 'up', 4.8), d3cough: at(s, 'D3', 'coughing', 9.0),
});

/** The cilia crew. `up` 0 asleep on the floor, 1 standing; `sit` Sweep (the middle one) has sat up; `sweep` 0..1 sweeping. */
const Crew: React.FC<{s: ShotNow; up: number; sit: number; sweep: number; twitch: number}> = ({s, up, sit, sweep, twitch}) => {
  const t = s.t;
  const sweepFace = bodyFace(s, 'crew', 5, 'happy');
  return (
    <>
      {CREW.map(([x, y, size], i) => {
        const [sx, sy, srot] = SLEEP[i];
        const lead = i === 1;
        // Sweep sits up first (half way), then everyone stands on "Brooms"
        const u = lead ? Math.max(up, sit * 0.45) : up;
        const bob = i !== 1 ? 0 : 0;
        const tw = twitch * Math.sin(Math.PI * clamp01(twitch)) * 6;
        const swing = sweep > 0 ? Math.sin(t * 5.2 + i * 1.3) * 6 * sweep : 0;
        const asleep = u < 0.5;
        const talkingFace = lead && !asleep ? sweepFace : null;
        return (
          <Put key={i} x={lerp(sx, x, u)} y={lerp(sy, y, u) + bob} size={size} rot={lerp(srot, 0, easeOut(u)) + tw + swing}>
            <MiniWorker job="cleaner" band={lead ? 'CILIA' : undefined}
              pose={asleep ? 'rest' : 'sweep'}
              mood={asleep ? 'closed' : talkingFace ? talkingFace.mood : 'open'} mouth={asleep ? 'flat' : talkingFace ? talkingFace.mouth : 'smile'}
              lid={talkingFace?.lid} look={asleep ? [0, 0] : [0, -0.35]} />
          </Put>
        );
      })}
    </>
  );
};

/** The last curl of cigarette smoke (the intruder): drifts down the windpipe and fizzles out before the bronchi. */
const SmokeCurl: React.FC<{t: number}> = ({t}) => {
  const k = clamp01(t / 1.6);
  if (k >= 1) return null;
  const y = lerp(-120, 520, easeOut(k)), o = 0.85 * (1 - clamp01((k - 0.55) / 0.45));
  const w = Math.sin(t * 4) * 14;
  return (
    <g opacity={o.toFixed(3)}>
      <path d={`M ${540 + w} ${y - 160} C ${500 - w} ${y - 110} ${580 + w} ${y - 60} ${540} ${y}`} stroke="#b9b4b0" strokeWidth={26} strokeLinecap="round" fill="none" />
      <path d={`M ${540 + w} ${y - 160} C ${500 - w} ${y - 110} ${580 + w} ${y - 60} ${540} ${y}`} stroke="#d6d2ce" strokeWidth={12} strokeLinecap="round" fill="none" />
    </g>
  );
};

/** Pass 2: the ball of mucus the crew sweeps up the windpipe, then the cough blows out of the top of the frame. */
const MucusBall: React.FC<{t: number; up: number; out: number}> = ({t, up, out}) => {
  if (out >= 1) return null;
  const y = lerp(lerp(660, 300, easeOut(up)), -160, out * out);
  const r = 34;
  return (
    <g transform={`translate(540 ${y.toFixed(1)}) rotate(${(t * 40) % 360})`}>
      <ellipse cx={0} cy={0} rx={r} ry={r * 0.86} fill={CLOTH.yellow} {...EDGE} />
      <ellipse cx={-10} cy={-9} rx={9} ry={6} fill={tint(CLOTH.yellow, 0.5)} />
    </g>
  );
};

const ShotB: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesB(s), st = s.state ?? {};
  const second = (s.pass ?? 1) > 1;
  const lungsTalk = active(s, 'lungs');
  const lf0 = bodyFace(s, 'lungs', 2, second ? 'happy' : 'sick');
  // eyes open when talking or listening (a happy face closes them): closed only for the easy breath at the start of pass 2
  const lf = second && lf0.mood === 'happy' && s.t > 1.8 ? {...lf0, mood: 'open' as const} : lf0;
  const crewTalking = speaking(s, 'crew');
  // where the lungs look: at the lens in the hook line, then at the crew (they talk to it, and listen to it)
  const look = (who: [number, number]): [number, number] | undefined => (!second && s.cur?.id === 'B1' ? undefined : CREW_LOOK);
  const hookEyes = !second && (s.cur?.id ?? 'B1') === 'B1';
  if (!second) {
    const cough = coughAt(t, 0.15, 0.9, 0.8);
    const up = go(t, k.brooms - 0.05, 0.45);
    const sit = go(t, k.years - 0.05, 0.4);
    const sweep = stroke(t, k.brooms + 1.8, 1.6);
    const twitch = clamp01((t - k.wake) / 0.5);
    const state = {...st, cough, cilia: lerp(st.cilia ?? 0, 1, sweep)};
    return (
      <Scene bg="#000">
        <Chest t={t} state={state}
          faces={{
            lungR: {mood: hookEyes ? 'shock' : lf.mood, mouth: lungsTalk > 0.2 ? lf.mouth : hookEyes ? 'o' : 'flat', lid: lf.lid, ...(hookEyes ? {look: [0.1, 0.15] as [number, number]} : {lookAt: look(LUNG_R_FACE)})},
            lungL: {mood: hookEyes ? 'shock' : lf.mood, mouth: lungsTalk > 0.2 ? lf.mouth : hookEyes ? 'o' : 'flat', lid: lf.lid, ...(hookEyes ? {look: [-0.1, 0.15] as [number, number]} : {lookAt: crewTalking ? CREW_LOOK : look(LUNG_L_FACE)})},
          }}
          layer={<SmokeCurl t={t} />}>
          <Crew s={s} up={up} sit={sit} sweep={sweep} twitch={t > k.wake && t < k.wake + 0.5 ? twitch : 0} />
        </Chest>
      </Scene>
    );
  }
  // pass 2: three days later
  const breath = coughAt(t, 0.1, 0.45, 1.6);
  const big = coughAt(t, k.d3cough - 0.05, 1, 0.6);
  const up = go(t, k.d2up - 0.1, 0.9);
  const out = clamp01((t - k.d3cough) / 0.45);
  const coughed = t > k.d3cough - 0.05;
  const calm = s.cur?.id === 'D3' && !coughed ? 'open' as const : lf.mood; // D3: the eyes hold until the cough lands (one action)
  return (
    <Scene bg="#000">
      <Chest t={t} state={{...st, cough: Math.max(breath, big)}}
        faces={{
          // from the big cough on, the lungs keep the strained face (one action, then a hold: no snap back mid-line)
          lungR: {mood: coughed ? 'pain' : calm, mouth: big > 0.3 ? 'open' : lf.mouth, lid: coughed ? undefined : lf.lid, lookAt: crewTalking ? CREW_LOOK : [540, 420]},
          lungL: {mood: coughed ? 'pain' : calm, mouth: big > 0.3 ? 'open' : lf.mouth, lid: coughed ? undefined : lf.lid, lookAt: crewTalking ? CREW_LOOK : [540, 420]},
        }}
        layer={<MucusBall t={t} up={up} out={out} />}>
        <Crew s={s} up={1} sit={1} sweep={Math.max(stroke(t, 2.2, 1.4), stroke(t, k.d2up - 0.6, 1.6))} twitch={0} />
      </Chest>
    </Scene>
  );
};
/** The lungs' name tag (2.5 s, the first time they appear; never in the hook line): from the start of B3. */
const ScreenB: React.FC<{s: ShotNow}> = ({s}) => {
  if ((s.pass ?? 1) > 1) return null;
  const b3 = at(s, 'B3', undefined, -99);
  return <CharTag label="LUNGS" x={170} y={1200} r={40} t={s.t - b3} arrowTo={[200, 1150]} />;
};

// =================================================================== C: inside a blood vessel
/** The CO gang's seats (red cells), back to front; the talker is the one in front in the middle. */
const SEATS: [number, number][] = [[260, 860], [520, 1000], [780, 880], [360, 1180], [700, 1200], [900, 1080]];
const TALKER = 1;
const timesC = (s: ShotNow) => ({again: at(s, 'C2', 'again', 3.2), kicked: at(s, 'C3', 'kicked', 1.2), oxygen: at(s, 'C4', 'oxygen', 3.4)});

const ShotC: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesC(s);
  const second = (s.pass ?? 1) > 1;
  const pink = second ? 0.5 : 0;
  const tf = bodyFace(s, 'co', 3, second ? 'shocked' : 'smug');
  const talk = active(s, 'co') > 0.2;
  // pass 1: the gang drops onto the seats and leans back; pass 2: half are gone, one more is shoved off on "kicked"
  const settle = second ? 1 : easeOut(clamp01(t / 0.5));
  const kickedOff = second ? clamp01((t - k.kicked) / 0.7) : 0;
  const bubble = second ? easeOut(clamp01((t - k.oxygen) / 0.5)) : 0;
  const ash = !second ? clamp01((t - k.again) / 0.6) : 0;
  const seated = SEATS.map((p, i) => ({p, i})).filter(({i}) => !second || i % 2 === 1);
  return (
    <Scene bg="#000">
      {/* the flow keeps its phase across the time card (the same framing on both sides, check C8): 7.07 s is the first pass of C on the voiced timings */}
      <Vessel t={second ? t + 7.07 : t} state={{flow: 0.08, co: 0, pink}}
        layer={<>
          {SEATS.map(([x, y], i) => <RedDisc key={'d' + i} x={x} y={y + 70} w={230} c={second && i % 2 === 0 ? '#d8453f' : '#b8504a'} rot={(i % 3 - 1) * 8} />)}
          {seated.map(({p: [x, y], i}) => {
            const off = second && i === 5 ? kickedOff : 0; // the one shoved off on "kicked" (the far right seat)
            const yy = lerp(y - 90, y, settle) + off * off * 260 - Math.sin(Math.PI * off) * 120;
            const xx = x + off * 320;
            const me = i === TALKER;
            const f = me && talk ? {mood: tf.mood, mouth: tf.mouth, lid: tf.lid} : second ? {mood: 'shock' as const, mouth: 'o' as const} : {mood: 'wink' as const, mouth: 'smile' as const};
            return <CoEgg key={i} x={xx} y={yy} s={1.3} face={{...f, lookAt: me ? (second ? [700, 1200] : [540, 760]) : [SEATS[TALKER][0], SEATS[TALKER][1] - 20]}} />;
          })}
          {/* C2: a puff of ash flicked off a band (the intruder's grey, dull) */}
          {ash > 0 && ash < 1 && <g opacity={(1 - ash).toFixed(3)}>{[0, 1, 2].map((j) => <circle key={j} cx={SEATS[TALKER][0] + 60 + j * 26 + ash * 40} cy={SEATS[TALKER][1] - 40 - j * 18 - ash * 60} r={10 + j * 4} fill="#a8a29e" {...EDGE_IN} />)}</g>}
          {/* C4: a bright oxygen bubble drops onto a free seat */}
          {bubble > 0 && <g transform={`translate(${SEATS[4][0]} ${lerp(500, SEATS[4][1], bubble)})`}>
            <circle cx={0} cy={0} r={62} fill={tint('#dff3ff', 0.2)} {...EDGE} />
            <ellipse cx={-20} cy={-22} rx={16} ry={10} fill="#ffffff" />
          </g>}
        </>} />
    </Scene>
  );
};

// =================================================================== E: Dr. Mira's clinic
const timesE = (s: ShotNow) => ({doc: at(s, 'E1', 'doc', 0.3), good: at(s, 'E3', 'good', 4.0), support: at(s, 'E5', 'support', 12.0), crew: at(s, 'E7', 'crew', 22.0), e7: at(s, 'E7', undefined, 21.5)});
const DAD_AT = {view: 'three-quarter' as const, facing: 'right' as const, x: 280, y: FEET_Y_TWO, scale: PEOPLE_SCALE_TWO};
const MIRA_AT = {view: 'three-quarter' as const, facing: 'left' as const, x: 820, y: FEET_Y_TWO, scale: PEOPLE_SCALE_TWO};
// the centres of their EYES (measured from the layout log): each looks into the other's eyes
const DAD_HEAD: [number, number] = [341, 706], MIRA_HEAD: [number, number] = [754, 830];

const ShotE: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesE(s);
  const dadPose: PoseName = 'worried'; // a hand on his chest the whole visit (the symptom); E7 he smiles with it there
  const miraPose: PoseName = 'clipboard';
  // one action in the answer: on "good sign" Mira leans warmly toward Dad, holds, and comes back (the rig's pose blends switch
  // the hand shape half way, so a gesture from the clipboard pops; a lean of the whole body does not)
  const lean = go(t, k.good - 0.2, 0.5) * (1 - go(t, k.good + 2.6, 0.5)) * -3.5;
  const relief = go(t, k.e7 - 0.1, 0.5) * 2;
  const nod = t > k.support && t < k.support + 0.8 ? Math.sin(((t - k.support) / 0.8) * Math.PI) * 0.25 : 0;
  return (
    <Scene bg="#f1ede4">
      <PaleClinicRoom wall="sky" items={['door', 'chart']} />
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${DAD_AT.x}px 1900px`, transform: `rotate(${relief.toFixed(2)}deg)`}}>
      <PersonAt spec={DAD} {...DAD_AT} pose={dadPose} expr={t > k.e7 ? 'happy' : 'worried'} lookAt={MIRA_HEAD} talk={talkSmooth(s, 'dad')} blink={blink(t, 2)} />
      </div>
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${MIRA_AT.x}px 1900px`, transform: `rotate(${lean.toFixed(2)}deg)`}}>
      <PersonAt spec={MIRA} {...MIRA_AT} pose={miraPose} expr={t > k.good - 0.2 && t < k.good + 1.4 ? 'happy' : 'neutral'} lookAt={[DAD_HEAD[0], DAD_HEAD[1] + nod * 120]} talk={talkSmooth(s, 'doctor')} blink={blink(t, 4)} />
      </div>
    </Scene>
  );
};

// ------------------------------------------------------------------ the shots
export const QUIT_SMOKING_SHOTS: Record<string, ShotDef> = {
  B: {Scene: ShotB, Screen: ScreenB, focus: (who) => (who === 'crew' ? face(540, 1480, 60) : face(545, 645, 62)), kind: 'body', stage: 'chest',
    faces: () => ({lungs: face(LUNG_R_FACE[0], LUNG_R_FACE[1], 62), crew: face(540, 1480, 60)})},
  C: {Scene: ShotC, focus: () => face(SEATS[TALKER][0], SEATS[TALKER][1] - 18, 24), kind: 'body', stage: 'vesselInside'},
  E: {Scene: ShotE, focus: (who) => (who === 'doctor' ? face(MIRA_HEAD[0], MIRA_HEAD[1], 110) : face(DAD_HEAD[0], DAD_HEAD[1], 110)), kind: 'room', light: true},
};
void OUTLINE; void shade;

// ------------------------------------------------------------------ the end card's icons (round badges)
const Badge: React.FC<{bg: string; children: React.ReactNode; id: string}> = ({bg, children, id}) => (
  <g>
    <circle cx={0} cy={0} r={92} {...EDGE} fill={bg} />
    <clipPath id={id}><circle cx={0} cy={0} r={90} /></clipPath>
    <g clipPath={`url(#${id})`}><circle cx={0} cy={110} r={120} fill={shade(bg, 0.12)} />{children}</g>
    <circle cx={0} cy={0} r={92} {...OUTLINE} />
  </g>
);
/** "COUGHING MORE? A GOOD SIGN": a pink pair of lungs. */
const LungsBadge: React.FC = () => (
  <Badge bg="#ffffff" id="qs-lungs">
    <path d="M -8 -40 Q -60 -40 -62 10 Q -64 52 -20 50 Q -6 48 -8 20 Z" fill="#f0a3ad" {...EDGE_IN} />
    <path d="M 8 -40 Q 60 -40 62 10 Q 64 52 20 50 Q 6 48 8 20 Z" fill="#f0a3ad" {...EDGE_IN} />
    <path d="M 0 -66 L 0 -20 M 0 -20 Q -6 -6 -16 0 M 0 -20 Q 6 -6 16 0" stroke={INK} strokeWidth={8} strokeLinecap="round" fill="none" />
  </Badge>
);
/** "GET SUPPORT TO QUIT": two hands, one helping the other (a handshake circle). */
const SupportBadge: React.FC = () => (
  <Badge bg={tint(CLOTH.sky, 0.3)} id="qs-help">
    <circle cx={-18} cy={0} r={38} fill={tint(CLOTH.yellow, 0.2)} {...EDGE_IN} />
    <circle cx={22} cy={4} r={38} fill={tint(CLOTH.yellow, 0.45)} {...EDGE_IN} />
    <path d="M -20 -6 Q 0 -22 22 -6" stroke={INK} strokeWidth={7} strokeLinecap="round" fill="none" />
  </Badge>
);
/** "COUGH OVER 3 WEEKS? SEE A DOCTOR": a medical cross. */
const DoctorBadge: React.FC = () => (
  <Badge bg={tint(CLOTH.red, 0.75)} id="qs-doc">
    <path d="M -18 -60 H 18 V -18 H 60 V 18 H 18 V 60 H -18 V 18 H -60 V -18 H -18 Z" fill={CLOTH.red} {...EDGE_IN} />
  </Badge>
);
export const QUIT_SMOKING_CTA: {title: string; points: CtaPoint[]; voice?: string; seconds: number; at: {head: number; points: [number, number, number]; follow: number}} = {
  title: 'QUIT SMOKING: KNOW THIS',
  // format 6 (decision 25, option A): the short card; Joey says only the follow line (videos/quit-smoking/cta-timings.json)
  seconds: 3.5,
  at: {head: 0, points: [0, 0, 0], follow: 0},
  points: [
    {icon: <LungsBadge />, big: 'COUGHING IS CLEARING', small: 'a good sign at first'},
    {icon: <SupportBadge />, big: 'GET SUPPORT TO QUIT', small: 'it really helps'},
    {icon: <DoctorBadge />, big: 'LONG COUGH? SEE A DOCTOR', small: 'over 3 weeks, or blood'},
  ],
};
