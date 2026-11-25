/**
 * "What Happens When You Rub Your Eyes" (`rub-eyes`), engine v9 (format 6): its shots by id (videos/rub-eyes/toon.json) and
 * its end card (Joey reads it all). The first video built for the opening rules O1-O5 (2026-11-25). The owner approved hook A
 * and the looks after the redraw in the reference style.
 *
 *   A   the whole eye (rub-eyes-art EyeFull), ONE framing for both passes:
 *       pass 1  red and itchy from frame 1; the Knuckles grind down on the upper lid; "Harder!": another grind; "dome": the
 *               eye pushes back up; "friends": three small germs hop off the knuckles onto the eye's front.
 *       pass 2  MONTHS LATER: the dome thin and pointed; the knuckles hover; Kid's "asking the doctor": they lift away.
 *   B   the end, WIDER (the whole scene drawn at 0.72 about the top middle: the eye about 1.4x smaller, the organ eye in
 *       its band): calm and white; a relieved stretch on "flannel"; the Knuckles give up and float out on "out".
 *   D   the clinic (a slate wall): Kid with red itchy eyes and the new doctor; one open-hand gesture on "Instead".
 */
import React from 'react';
import {Scene} from './scene';
import {type CtaPoint} from './hud';
import {easeOut, hop} from './act';
import {castById, PersonAt, type PoseIn, type PoseName} from './people-rig';
import {DoctorAt, doctorHeadAt, type DrPoseIn} from './doctor-new';
import {PaleClinicRoom} from './scenes-rooms';
import {CLOTH, EDGE, EDGE_IN, INK, OUTLINE, Shape, shade, tint, V9, type Mood} from './kit';
import {active, blink, bodyFace, clamp01, go, lerp, since, speaking, talkSmooth, type Focus, type ShotDef, type ShotNow} from './play';
import {EyeFull, EYE_FACE, GermAt, Knuckles, KnucklesAt, PRESS} from './rub-eyes-art';

const KID = castById('kid');
const at = (s: ShotNow, id: string, word: string | undefined, dflt: number) => { const u = since(s, id, word); return u <= -900 ? dflt : s.t - u; };
const face = (x: number, y: number, r: number): Focus => ({x, y, r});
const openFace = (s: ShotNow, who: string, seed: number, rest: string) => {
  const f = bodyFace(s, who, seed, rest);
  return f.mood === 'happy' && active(s, who) > 0.2 ? {...f, mood: 'open' as Mood} : f;
};
const KN_FACE = (x: number, y: number, k = 0.95): [number, number] => [x, y - 176 * k];
const UP: [number, number] = [0.15, -0.95];
const lookTo = (from: [number, number], to: [number, number]): [number, number] => { const dx = to[0] - from[0], dy = to[1] - from[1], d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; };
/** Where the germs land on the front of the eye (frame pixels), and where they start (on the knuckles). */
const GERMS: [number, number, number][] = [[935, 760, 0.5], [995, 905, 0.42], [925, 1130, 0.46]];
const GERM_FROM: [number, number] = [PRESS[0] + 120, PRESS[1] + 110];

// =================================================================== A: the whole eye
const ShotA: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, pass = s.pass ?? 1, st = s.state ?? {};
  const ef = openFace(s, 'eye', 5, pass === 1 ? 'scared' : 'scared');
  const kf = openFace(s, 'knuckles', 7, 'happy');
  const eyeTalks = active(s, 'eye') > 0.2, knTalks = active(s, 'knuckles') > 0.2;
  const outside = speaking(s, 'kid');
  if (pass === 1) {
    const harder = at(s, 'A1', 'Harder', 1.9), dome = at(s, 'A2', 'dome', 3.6), friends = at(s, 'A4', 'friends', 8);
    // the knuckles come down (0-0.5 s) and grind one slow circle, then hold; another circle on "Harder!"
    const press = (t0: number) => (t > t0 && t < t0 + 0.7 ? Math.sin(((t - t0) / 0.7) * Math.PI) : 0); // one press-in, then the hold
    const g = press(0.1) + press(harder);
    const push = t > dome && t < dome + 0.9 ? Math.sin(((t - dome) / 0.9) * Math.PI) : 0; // the eye pushes back up
    const kx = PRESS[0], ky = PRESS[1] + 75 + g * 30 - push * 16;
    const squash = (st.squash ?? 0.7) * (0.85 + 0.15 * Math.abs(g)) * (1 - 0.15 * push);
    const hopG = (i: number) => clamp01((t - friends - i * 0.12) / 0.5);
    const eLook: [number, number] = outside ? UP : knTalks ? lookTo(EYE_FACE, KN_FACE(kx, ky)) : t > friends + 0.2 ? [0.95, -0.1] : [0.4, -0.6];
    const kLook: [number, number] = s.cur?.id === 'A1' || !s.cur ? [0, 0.3] : outside ? UP : lookTo(KN_FACE(kx, ky), EYE_FACE);
    return (
      <EyeFull red={st.red ?? 0.8} squash={squash} mood={eyeTalks ? ef.mood : 'pain'} mouth={eyeTalks ? ef.mouth : 'grit'} look={eLook} lid={eyeTalks ? ef.lid : 0.35}>
        {GERMS.map(([gx, gy, gs], i) => {
          const k = hopG(i);
          if (k <= 0) return null;
          const e = easeOut(k);
          return <GermAt key={i} x={lerp(GERM_FROM[0], gx, e)} y={lerp(GERM_FROM[1], gy, e) - Math.sin(k * Math.PI) * 90} s={gs} rot={(i - 1) * 12} mood={k < 1 ? 'happy' : 'wink'} look={lookTo([gx, gy], knTalks || eyeTalks ? (knTalks ? KN_FACE(kx, ky) : EYE_FACE) : [gx, gy - 100])} />;
        })}
        <KnucklesAt x={kx} y={ky} scale={0.95} rot={-8} mood={knTalks ? kf.mood : 'wink'} mouth={knTalks ? kf.mouth : 'smile'} lid={knTalks ? kf.lid : undefined} look={kLook} skin={KID.skin} />
      </EyeFull>
    );
  }
  // pass 2: MONTHS LATER, the dome thin and pointed; the knuckles hover, then lift away on Kid's line
  const away = at(s, 'B3', 'doctor', 6) + 0.8;
  const lift = easeOut(clamp01((t - away) / 0.7));
  const kx = PRESS[0] - lift * 420, ky = PRESS[1] + 75 - lift * 760;
  const eLook: [number, number] = outside ? UP : knTalks ? lookTo(EYE_FACE, KN_FACE(kx, ky)) : [0.9, 0.2];
  const kLook: [number, number] = outside ? UP : lookTo(KN_FACE(kx, ky), EYE_FACE);
  return (
    <EyeFull red={st.red ?? 0.6} squash={0.6 * (1 - lift)} cone={st.cone ?? 1} mood={eyeTalks ? ef.mood : 'shock'} mouth={eyeTalks ? ef.mouth : 'o'} look={eLook} lid={eyeTalks ? ef.lid : undefined}>
      {GERMS.map(([gx, gy, gs], i) => <GermAt key={i} x={gx} y={gy} s={gs} rot={(i - 1) * 12} mood="wink" look={lookTo([gx, gy], knTalks ? KN_FACE(kx, ky) : EYE_FACE)} />)}
      {lift < 1 && <KnucklesAt x={kx} y={ky} scale={0.95} rot={-8} mood={knTalks ? kf.mood : lift > 0 ? 'shock' : 'side'} mouth={knTalks ? kf.mouth : 'smile'} lid={knTalks ? kf.lid : undefined} look={kLook} skin={KID.skin} />}
    </EyeFull>
  );
};

// =================================================================== B: the end, wider
const B_K = 0.72, B_AT: [number, number] = [520, 520]; // the eye drawn at 0.72 about this point (the socket stays full frame)
const bPt = (p: [number, number]): [number, number] => [B_AT[0] + (p[0] - B_AT[0]) * B_K, B_AT[1] + (p[1] - B_AT[1]) * B_K];
const ShotB: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t;
  const ef = openFace(s, 'eye', 5, 'happy'), kf = openFace(s, 'knuckles', 7, 'sad');
  const eyeTalks = active(s, 'eye') > 0.2, knTalks = active(s, 'knuckles') > 0.2;
  const flannel = at(s, 'E0', 'flannel', 1), out = at(s, 'E1', 'out', 6);
  const stretch = hop(t, flannel, 30, 0.4);
  const lift = easeOut(clamp01((t - out) / 0.8));
  const [kx, ky] = bPt([PRESS[0] + 40, PRESS[1] - 80]);
  const ky2 = ky - lift * 800;
  const faceB = bPt(EYE_FACE);
  const knFace: [number, number] = [kx, ky2 - 176 * 0.95 * B_K];
  return (
    <EyeFull red={0.15} zoom={{k: B_K, at: [B_AT[0], B_AT[1] - stretch.dy]}} mood={eyeTalks ? ef.mood : 'happy'} mouth={eyeTalks ? ef.mouth : 'big'}
      look={knTalks ? lookTo(faceB, knFace) : [0.3, -0.2]} lid={eyeTalks ? ef.lid : undefined}>
      {lift < 1 && <KnucklesAt x={kx} y={ky2} scale={0.95 * B_K} rot={-8} mood={knTalks ? kf.mood : 'sad'} mouth={knTalks ? kf.mouth : 'frown'} lid={knTalks ? kf.lid : undefined} look={lookTo(knFace, faceB)} skin={KID.skin} />}
    </EyeFull>
  );
};

// =================================================================== D: the clinic
const DOC_AT = {view: 'three-quarter' as const, facing: 'left' as const, x: 815, y: 2050, scale: 3.4};
const DOC_FACE = doctorHeadAt(DOC_AT);
const KID_AT = {view: 'three-quarter' as const, facing: 'right' as const, x: 300, y: 1760, scale: 3.15};
const EYES = {kid: [284, 1080] as [number, number], doctor: [Math.round(DOC_FACE.x), Math.round(DOC_FACE.y)] as [number, number]};
type Step = [number, PoseName, number?];
const poseAt = (t: number, steps: Step[]): PoseIn => {
  let i = -1;
  for (let j = 0; j < steps.length; j++) if (t >= steps[j][0]) i = j;
  if (i <= 0) return steps[0][1];
  const [t0, b, d = 0.3] = steps[i];
  const k = go(t, t0, d);
  return k >= 1 ? b : {a: steps[i - 1][1], b, k};
};
const ShotD: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t;
  const rub = at(s, 'D1', 'rub', 1.2), instead = at(s, 'D3', 'Instead', 8), d5 = at(s, 'D5', undefined, 16);
  const who = s.cur?.who ?? 'kid';
  const kidPose = poseAt(t, [[-9, 'rest'], [rub - 0.3, 'think', 0.35], [rub + 1.9, 'rest', 0.35]]);
  const up = go(t, instead - 0.1, 0.45) * (1 - go(t, instead + 1.0, 0.45));
  // both hold their gaze through the doctor's key line (D2): no blink between Kid's gesture and "Instead", so the clinic holds
  // fully still for 4 s+ (look C2: a Short needs one long still hold)
  const gaze = t > rub + 2.4 && t < instead - 0.2;
  const docPose: DrPoseIn = up <= 0 ? 'rest' : {a: 'rest', b: 'explain', k: up};
  return (
    <Scene bg="#f1ede4"><V9>
      <PaleClinicRoom wall="grey" items={['door', 'frame']} />
      <DoctorAt {...DOC_AT} pose={docPose} expr={t > instead - 0.2 && t < instead + 1.6 ? 'happy' : 'neutral'} lookAt={EYES.kid} talk={talkSmooth(s, 'doctor')} blink={gaze ? 0 : blink(t, 4)} />
      <PersonAt spec={KID} {...KID_AT} pose={kidPose} expr={t > d5 ? 'happy' : 'worried'} lookAt={EYES.doctor} talk={talkSmooth(s, 'kid')} blink={gaze ? 0 : blink(t, 4)} />  {/* blinks with the doctor: the clinic holds fully still between them */}
    </V9></Scene>
  );
  void who;
};

// ------------------------------------------------------------------ the shots
export const RUB_EYES_SHOTS: Record<string, ShotDef> = {
  A: {Scene: ShotA, view: () => ({x: 540, y: 960, z: 1}), focus: (who) => (who === 'knuckles' ? face(...KN_FACE(PRESS[0], PRESS[1] + 75), 60) : face(...EYE_FACE, 120)), kind: 'body'},
  B: {Scene: ShotB, view: () => ({x: 540, y: 960, z: 1}), focus: (who) => (who === 'knuckles' ? face(...bPt(KN_FACE(PRESS[0] + 40, PRESS[1] - 80)), 50) : face(...bPt(EYE_FACE), 90)), kind: 'body'},
  D: {Scene: ShotD, view: () => ({x: 545, y: 1180, z: 1.35}), focus: (who) => face(...(EYES[who as keyof typeof EYES] ?? EYES.doctor), 110), kind: 'room', light: true},
};

// ------------------------------------------------------------------ the end card's icons
const Badge: React.FC<{bg: string; children: React.ReactNode; id: string}> = ({bg, children, id}) => (
  <g>
    <circle cx={0} cy={0} r={92} {...EDGE} fill={bg} />
    <clipPath id={id}><circle cx={0} cy={0} r={90} /></clipPath>
    <g clipPath={`url(#${id})`}><circle cx={0} cy={110} r={120} fill={shade(bg, 0.12)} />{children}</g>
    <circle cx={0} cy={0} r={92} {...OUTLINE} />
  </g>
);
const NoRubBadge: React.FC = () => (
  <Badge bg="#ffffff" id="re-norub">
    <g transform="translate(0 40) scale(0.2)"><Knuckles mood="sad" mouth="frown" look={[0, 0.2]} skin={KID.skin} /></g>
    <path d="M -62 -62 L 62 62" stroke={INK} strokeWidth={20} strokeLinecap="round" />
    <path d="M -62 -62 L 62 62" stroke={CLOTH.red} strokeWidth={12} strokeLinecap="round" />
  </Badge>
);
const FlannelBadge: React.FC = () => (
  <Badge bg={tint('#6fb7e0', 0.6)} id="re-flannel">
    <Shape d="M -58 -40 L 58 -40 L 58 40 L -58 40 Z" fill="#6fb7e0" shadow={0.4} />
    {[-30, 0, 30].map((x) => <path key={x} d={`M ${x} -40 L ${x} 40`} stroke={shade('#6fb7e0', 0.2)} strokeWidth={5} />)}
    {[-24, 0, 24].map((x, i) => <path key={i} d={`M ${x} -62 q 8 -10 0 -20`} stroke="#ffffff" strokeWidth={6} strokeLinecap="round" fill="none" />)}
  </Badge>
);
const HelpBadge: React.FC = () => (
  <Badge bg={tint(CLOTH.red, 0.75)} id="re-help">
    <Shape d="M -18 -60 H 18 V -18 H 60 V 18 H 18 V 60 H -18 V 18 H -60 V -18 H -18 Z" fill={CLOTH.red} shadow={0.3} />
    <circle cx={0} cy={0} r={4} fill="none" {...EDGE_IN} />
  </Badge>
);
export const RUB_EYES_CTA: {title: string; points: CtaPoint[]; voice?: string; seconds: number; at: {head: number; points: [number, number, number]; follow: number}} = {
  title: 'ITCHY EYES: KNOW THIS',
  seconds: 10,
  at: {head: 0, points: [1.4, 3.0, 4.8], follow: 7.2},
  points: [
    {icon: <NoRubBadge />, big: "DON'T RUB THEM HARD", small: 'it can thin the front of the eye'},
    {icon: <FlannelBadge />, big: 'USE A COLD FLANNEL', small: 'and wash your hands first'},
    {icon: <HelpBadge />, big: 'EYE PAIN OR VISION CHANGES?', small: 'get help fast'},
  ],
};
