/**
 * "What Happens When You Stop Drinking Alcohol" (`stop-alcohol`), engine v9 (format 6): its shots by id
 * (videos/stop-alcohol/toon.json) and its end card (Joey reads it all). The owner approved hook A and the look sheets on
 * 2026-11-24 ("Hook A", "Looks good, build").
 *
 *   A   the whole Liver (sugar-organs LiverFull, the full-organ rule) holding his mop, ONE framing for all three passes:
 *       pass 1 NIGHT (indigo): Booze splashes down on his edge and winks at us, puddles everywhere, a drop now and then;
 *              "another round": a fresh drop splats; Dad's "done with drinks": the drops stop; "back by Friday": Booze points up.
 *       pass 2 THE NEXT MORNING (sunrise): the Liver stretches, one mop swipe clears the last puddle; Booze small in the corner.
 *       pass 3 the end (sunrise): "with a doctor!": Booze hops down and rolls out of the frame; the Liver waves.
 *   B   the twist, CLOSER on the morning Liver: Booze shrinks and waves; Grandpa's "all at once": the mop drops (bonk), both
 *       hands up; "bumpy": Booze rubs his hands.
 *   D   the clinic (a cream wall): Grandpa, Dad, the NEW doctor (doctor-new.tsx); one open-hand gesture per answer line.
 *
 * Rules held: a locked camera per place, one action then a hold, faces out of the caption band (1324-1434), listeners look at
 * the speaker, hands one piece with the arm (the mop goes behind the hand), no flash, no shake.
 */
import React from 'react';
import {Scene} from './scene';
import {type CtaPoint} from './hud';
import {Burst, easeOut, hop} from './act';
import {castById, PersonAt, type PoseIn, type PoseName} from './people-rig';
import {DoctorAt, doctorHeadAt, type DrPoseIn} from './doctor-new';
import {PaleClinicRoom} from './scenes-rooms';
import {CLOTH, EDGE, EDGE_IN, OUTLINE, Shape, shade, tint, V9, type Mood, type MouthKind} from './kit';
import {Liver} from './organs-a';
import {LiverFull} from './sugar-organs';
import {active, blink, bodyFace, clamp01, go, lerp, since, speaking, talkSmooth, type Focus, type ShotDef, type ShotNow} from './play';
import {gestureAt, type ArmPose, type Gesture} from './organ-act';
import {BoozeAt, Drop, HeldMop, PLACE_MORNING, PLACE_NIGHT, SoftBack, Splash, Spill, Svg, type BoozeArms} from './stop-alcohol-art';

const DAD = castById('dad'), GRANDPA = castById('grandpa');

// ------------------------------------------------------------------ helpers
const at = (s: ShotNow, id: string, word: string | undefined, dflt: number) => { const u = since(s, id, word); return u <= -900 ? dflt : s.t - u; };
const face = (x: number, y: number, r: number): Focus => ({x, y, r});
/** A body face that opens its eyes while it talks (a 'happy' squint reads as eyes shut). */
const openFace = (s: ShotNow, who: string, seed: number, rest: string) => {
  const f = bodyFace(s, who, seed, rest);
  return f.mood === 'happy' && active(s, who) > 0.2 ? {...f, mood: 'open' as Mood} : f;
};
/** The Liver's face (LiverFull's default framing) and where Booze's face sits for each placement. */
const LIVER_FACE: [number, number] = [317, 786];
const BOOZE_NIGHT = {x: 790, y: 600, scale: 1.15};
const BOOZE_CORNER = {x: 790, y: 600, scale: 0.6}; // the morning: the same spot as the night, shrunk (the time card's framing holds)
/** B is WIDER (the liver drawn at 0.66: the eye stays 110-190 px and the size changes about 1.5x from A): more of the morning place. */
const B_AT: [number, number, number] = [540, 880, 0.66];
const LIVER_FACE_B: [number, number] = [540 - 36 * 6.2 * 0.66, 880 - 28 * 6.2 * 0.66];
const BOOZE_B = {x: 850, y: 580, scale: 0.6};
const boozeFace = (b: {x: number; y: number; scale: number}): [number, number] => [b.x, b.y - 112 * b.scale];
/** A look vector (each -1..1) from one face toward a point. */
const lookTo = (from: [number, number], to: [number, number]): [number, number] => {
  const dx = to[0] - from[0], dy = to[1] - from[1], d = Math.hypot(dx, dy) || 1;
  return [dx / d, dy / d];
};
const UP: [number, number] = [0.15, -0.95]; // toward a voice from outside the body

// =================================================================== A: the whole liver (night, morning, the end)
const HIT = 0.45;
const DRIPS = [3.2, 6.4, 9.6, 12.8]; // a single drop falls now and then while it is night (a short action, then a hold)
const ShotA: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, pass = s.pass ?? 1, st = s.state ?? {};
  const night = pass === 1;
  const place = night ? PLACE_NIGHT : PLACE_MORNING;
  const lf = openFace(s, 'liver', 5, night ? 'sad' : 'happy');
  const bf = openFace(s, 'booze', 7, night ? 'happy' : 'sad');
  const liverTalks = active(s, 'liver') > 0.2, boozeTalks = active(s, 'booze') > 0.2;
  const outside = speaking(s, 'dad') || speaking(s, 'grandpa');

  if (night) {
    const jolt = at(s, 'A1', 'drinking', 1.6), mess = at(s, 'A2', 'mess', 3.6), round = at(s, 'A2c', 'round', 9.5);
    const done = at(s, 'A3', 'drinks', 12) + 0.8, friday = at(s, 'A4', 'Friday', 15);
    // Booze: drops in (a fall that speeds up into the hit), squashes on the splash, then throws his arms up
    const drop = clamp01(t / HIT) ** 2;
    const squash = t > HIT && t < HIT + 0.4 ? Math.sin(((t - HIT) / 0.4) * Math.PI) : 0;
    const by = lerp(-260, BOOZE_NIGHT.y, drop);
    const arms: BoozeArms = t > friday - 0.1 ? 'point' : t > HIT + 0.3 ? 'cheer' : 'rest';
    // the Liver: a jolt on "Liver", one slow mop stroke on "mess", looks up at Dad's voice
    const j = hop(t, jolt, 8, 0.25); // a small start (the splash just before is the big action)
    const stroke = t > mess && t < mess + 1.1 ? Math.sin(((t - mess) / 1.1) * Math.PI) * 26 : 0;
    const lookUp = t > done - 0.1 && t < friday;
    const lLook: [number, number] = lookUp || outside ? UP : boozeTalks ? lookTo(LIVER_FACE, boozeFace(BOOZE_NIGHT)) : [0.5, 0.4];
    const bLook: [number, number] = s.cur?.id === 'A1' || !s.cur ? [0, 0.3] : outside || t > friday - 0.1 ? UP : lookTo(boozeFace(BOOZE_NIGHT), LIVER_FACE);
    // the drops: one now and then until Dad's "done"; the fresh one on "another round" adds a puddle
    const drips = [...DRIPS.filter((d) => d < done - 0.6), round].filter((d) => t > d && t < d + 0.7);
    const rainOn = (st.rain ?? 1) > 0.5 && t < done;
    const extra = t > round + 0.55 ? 1 : 0;
    return (
      <Scene bg={place}><V9>
        <div style={{position: 'absolute', inset: 0}}>
          <LiverFull t={t} fat={0} place={place} back={<SoftBack c={place} />} mood={liverTalks ? lf.mood : 'sleepy'} mouth={liverTalks ? lf.mouth : 'wavy'} look={lLook}
            lift={j.dy} held={<HeldMop swing={stroke} />} />
        </div>
        <Spill k={1} n={6 + extra} />
        <Svg>
          {rainOn && drips.map((d, i) => { const u = clamp01((t - d) / 0.55); return <Drop key={i} x={d === round ? 980 : [200, 430, 640, 880][DRIPS.indexOf(d) % 4]} y={lerp(-80, d === round ? 820 : 520, u * u)} s={0.9} />; })}
          {t > HIT && t < HIT + 0.5 && <Splash x={BOOZE_NIGHT.x} y={BOOZE_NIGHT.y} />}
        </Svg>
        <BoozeAt x={BOOZE_NIGHT.x} y={by} scale={BOOZE_NIGHT.scale} squash={squash}
          mood={t < HIT ? 'shock' : boozeTalks ? bf.mood : s.cur?.id === 'A1' ? 'wink' : 'happy'} mouth={boozeTalks ? bf.mouth : 'smile'} look={bLook} arms={arms} />
      </V9></Scene>
    );
  }

  if (pass === 2) {
    // THE NEXT MORNING: a stretch as the shot opens (one action), one big mop swipe on "catching", then the hold
    const catching = at(s, 'B2', 'catching', 3.5);
    const stretch = go(t, 0.15, 0.4) * (1 - go(t, 1.5, 0.4));
    const armL: ArmPose = {a: 'rest', b: 'up', k: stretch};
    const swipe = t > catching && t < catching + 0.8 ? Math.sin(((t - catching) / 0.8) * Math.PI) * 34 : 0;
    const left = t > catching + 0.4 ? 0 : 7; // the night's puddles are still there until the big swipe
    const lLook: [number, number] = outside ? UP : [0.3, -0.2];
    return (
      <Scene bg={place}><V9>
        <div style={{position: 'absolute', inset: 0}}>
          <LiverFull t={t} fat={0} place={place} back={<SoftBack c={place} />} mood={liverTalks ? lf.mood : 'happy'} mouth={liverTalks ? lf.mouth : 'big'} look={lLook}
            armL={armL} held={<HeldMop swing={swipe} />} />
        </div>
        <Spill k={1} n={left} />
        {/* Booze opens the morning as the night left him, then shrinks (the morning's first action: no new drinks) */}
        <BoozeAt x={BOOZE_CORNER.x} y={BOOZE_CORNER.y} scale={lerp(BOOZE_NIGHT.scale, BOOZE_CORNER.scale, go(t, 0.3, 0.6))} mood={t < 0.3 ? 'happy' : 'scared'} mouth={t < 0.3 ? 'smile' : 'frown'}
          look={lookTo(boozeFace(BOOZE_CORNER), LIVER_FACE)} arms={t < 0.3 ? 'point' : 'shrink'} />
      </V9></Scene>
    );
  }

  // pass 3: the end. The Liver tells Booze; on "Fine" Booze hops down and rolls out of the frame, the Liver waves.
  const fine = at(s, 'E2', 'Fine', 2.4);
  const roll = clamp01((t - fine) / 0.9);
  const hopB = hop(t, fine, 60, 0.3);
  const wave = go(t, fine + 0.3, 0.3);
  const armL: ArmPose | Gesture = wave > 0 ? gestureAt(t, [[-9, 'rest'], [fine + 0.3, 'wave', 0.3], [fine + 1.3, 'rest', 0.35]]) : 'rest';
  const lLook: [number, number] = roll > 0.6 ? [0.9, 0.1] : lookTo(LIVER_FACE, boozeFace(BOOZE_CORNER));
  return (
    <Scene bg={place}><V9>
      <div style={{position: 'absolute', inset: 0}}>
        <LiverFull t={t} fat={0} place={place} back={<SoftBack c={place} />} mood={liverTalks ? lf.mood : 'happy'} mouth={liverTalks ? lf.mouth : 'big'} look={lLook} armL={armL} held={<HeldMop />} />
      </div>
      {roll < 1 && <BoozeAt x={BOOZE_CORNER.x + easeOut(roll) * 420} y={BOOZE_CORNER.y + hopB.dy - roll * 260} scale={BOOZE_CORNER.scale}
        mood={boozeTalks ? bf.mood : 'sad'} mouth={boozeTalks ? bf.mouth : 'frown'} look={lookTo(boozeFace(BOOZE_CORNER), LIVER_FACE)} arms={roll > 0 ? 'cheer' : 'shrink'} />}
    </V9></Scene>
  );
};

// =================================================================== B: the twist, closer on the morning liver
const ShotB: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t;
  const friend = at(s, 'B3', 'friend', 1.0), once = at(s, 'C1', 'once', 4.5), bumpy = at(s, 'C3', 'bumpy', 8);
  const lf = openFace(s, 'liver', 5, 'happy'), bf = openFace(s, 'booze', 7, 'sad');
  const liverTalks = active(s, 'liver') > 0.2, boozeTalks = active(s, 'booze') > 0.2;
  const outside = speaking(s, 'grandpa');
  const dropped = go(t, once, 0.35);
  const shocked = t > once - 0.05;
  const handsUp = go(t, once, 0.25);
  const arms: ArmPose = {a: 'rest', b: 'up', k: handsUp};
  const shrink = 1 - 0.2 * go(t, friend, 0.4);
  const bScale = BOOZE_B.scale * shrink;
  const bArms: BoozeArms = t > bumpy - 0.1 ? 'rub' : t > friend - 0.1 && t < friend + 1.4 ? 'cheer' : 'shrink';
  const bLook: [number, number] = outside ? UP : lookTo(boozeFace(BOOZE_B), LIVER_FACE_B);
  const lLook: [number, number] = outside ? UP : boozeTalks ? lookTo(LIVER_FACE_B, boozeFace(BOOZE_B)) : [0.2, -0.6];
  return (
    <Scene bg={PLACE_MORNING}><V9>
      <div style={{position: 'absolute', inset: 0}}>
        <LiverFull t={t} fat={0} place={PLACE_MORNING} back={<SoftBack c={PLACE_MORNING} />} at={B_AT} mood={liverTalks ? (shocked ? 'shock' : lf.mood) : shocked ? 'shock' : 'happy'} mouth={liverTalks ? lf.mouth : shocked ? 'o' : 'smile'}
          look={lLook} armL={arms} armR={arms} sq={-0.04 * handsUp} held={<HeldMop fall={dropped} />} />
      </div>
      <Burst t={t} t0={once + 0.35} x={900} y={1130} r={60} col="#fff4e0" />
      <BoozeAt x={BOOZE_B.x} y={BOOZE_B.y} scale={bScale} mood={boozeTalks ? bf.mood : t > bumpy - 0.1 ? 'side' : 'scared'} mouth={boozeTalks ? bf.mouth : t > bumpy - 0.1 ? 'smile' : 'frown'}
        look={bLook} arms={bArms} />
    </V9></Scene>
  );
};

// =================================================================== D: the clinic
const DOC_AT = {view: 'three-quarter' as const, facing: 'left' as const, x: 925, y: 1900, scale: 2.85};
const DOC_FACE = doctorHeadAt(DOC_AT);
const EYES = {grandpa: [230, 1040] as [number, number], dad: [560, 935] as [number, number], doctor: [Math.round(DOC_FACE.x), Math.round(DOC_FACE.y)] as [number, number]};
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
  const liver = at(s, 'D1', 'stopped', 0.8), once = at(s, 'D2', 'once', 3.5) + 0.3, recover = at(s, 'D3', 'recover', 6.5);
  const depends = at(s, 'D4', 'depends', 9), d5 = at(s, 'D5', undefined, 15), help = at(s, 'D6', 'help', 21);
  const who = s.cur?.who ?? 'dad';
  // the doctor answers Dad first (D3), then turns to Grandpa (D4-D5)
  const docTarget: [number, number] = who === 'doctor' ? (t < depends - 0.2 ? EYES.dad : EYES.grandpa) : EYES[who as keyof typeof EYES] ?? EYES.dad;
  const target = (me: 'grandpa' | 'dad'): [number, number] => (who === me ? EYES.doctor : who === 'doctor' ? EYES.doctor : EYES[who as keyof typeof EYES] ?? EYES.doctor);
  const dadPose = poseAt(t, [[-9, 'rest'], [liver - 0.1, 'worried', 0.35], [liver + 0.9, 'rest', 0.35]]);
  const gpPose = poseAt(t, [[-9, 'rest'], [once - 0.5, 'worried', 0.3], [once + 0.3, 'rest', 0.3], [help - 0.2, 'worried', 0.4], [help + 1.6, 'rest', 0.4]]);
  // the doctor: a small lean in after Grandpa's question, then ONE open-hand gesture on each later answer line, up and down in 1.5 s
  const lean = 0;
  const up = Math.max(go(t, depends - 0.1, 0.45) * (1 - go(t, depends + 1.0, 0.45)), go(t, d5 + 0.05, 0.45) * (1 - go(t, d5 + 1.1, 0.45)));
  // a small open hand (k 0.55): a full 'explain' reaches Dad's hand in a three-person shot
  const docPose: DrPoseIn = up <= 0 ? 'rest' : {a: 'rest', b: 'explain', k: up * 0.55};
  return (
    <Scene bg="#f1ede4"><V9>
      <PaleClinicRoom wall="cream" items={['door', 'plant']} />
      <PersonAt spec={GRANDPA} pose={gpPose} view="three-quarter" facing="right" expr={t > help - 0.3 ? 'happy' : 'worried'} lookAt={target('grandpa')} talk={talkSmooth(s, 'grandpa')} blink={blink(t, 3)} x={150} y={1900} scale={2.85} />
      <PersonAt spec={DAD} pose={dadPose} view="three-quarter" facing="right" expr={t > recover && t < recover + 2.5 ? 'happy' : 'neutral'} lookAt={target('dad')} talk={talkSmooth(s, 'dad')} blink={blink(t, 1)} x={455} y={1900} scale={2.85} />
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${DOC_AT.x}px 1900px`, transform: `rotate(${lean.toFixed(2)}deg)`}}>
        <DoctorAt {...DOC_AT} pose={docPose} expr={t > recover - 0.2 && t < recover + 1.6 ? 'happy' : 'neutral'} lookAt={docTarget} talk={talkSmooth(s, 'doctor')} blink={blink(t, 4)} />
      </div>
    </V9></Scene>
  );
};

// ------------------------------------------------------------------ the shots
export const STOP_ALCOHOL_SHOTS: Record<string, ShotDef> = {
  // the whole liver, one framing for all three passes (the night, the morning, the end)
  A: {Scene: ShotA, view: () => ({x: 540, y: 960, z: 1}), focus: (who) => (who === 'booze' ? face(...boozeFace(BOOZE_NIGHT), 40) : face(...LIVER_FACE, 120)), kind: 'body'},
  // the twist: closer (about 1.45x), the Liver's face and Booze
  B: {Scene: ShotB, view: () => ({x: 540, y: 960, z: 1}), focus: (who) => (who === 'booze' ? face(...boozeFace(BOOZE_B), 40) : face(...LIVER_FACE_B, 90)), kind: 'body'},
  D: {Scene: ShotD, view: () => ({x: 540, y: 1060, z: 1.06}), focus: (who) => face(...(EYES[who as keyof typeof EYES] ?? EYES.doctor), 110), kind: 'room', light: true},
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
const LiverBadge: React.FC = () => <Badge bg={tint(PLACE_MORNING, 0.4)} id="sa-liver"><g transform="translate(8 6) scale(0.82)"><Liver mood="happy" mouth="big" look={[0, 0]} /></g></Badge>;
const SlowBadge: React.FC = () => (
  <Badge bg="#ffffff" id="sa-slow">
    {/* a stop hand: no sudden stop */}
    <Shape d="M -34 60 L -34 -10 L -46 -40 Q -48 -54 -36 -54 L -26 -30 L -26 -62 Q -26 -74 -14 -74 Q -4 -74 -4 -62 L -4 -40 L -4 -70 Q -4 -82 8 -82 Q 18 -82 18 -70 L 18 -40 L 18 -62 Q 18 -74 30 -74 Q 40 -74 40 -62 L 40 20 Q 40 60 10 66 L -34 66 Z" fill={CLOTH.red} shadow={0.4} />
  </Badge>
);
const HelpBadge: React.FC = () => (
  <Badge bg={tint(CLOTH.red, 0.75)} id="sa-help">
    <Shape d="M -18 -60 H 18 V -18 H 60 V 18 H 18 V 60 H -18 V 18 H -60 V -18 H -18 Z" fill={CLOTH.red} shadow={0.3} />
    <circle cx={0} cy={0} r={4} fill="none" {...EDGE_IN} />
  </Badge>
);
export const STOP_ALCOHOL_CTA: {title: string; points: CtaPoint[]; voice?: string; seconds: number; at: {head: number; points: [number, number, number]; follow: number}} = {
  title: 'STOPPING ALCOHOL: KNOW THIS',
  // Joey reads the whole card ("cta": {"read": "card"}); his clip's real beats come in from videos/stop-alcohol/cta-timings.json
  seconds: 10,
  at: {head: 0, points: [1.6, 3.6, 6.0], follow: 8.4},
  points: [
    {icon: <LiverBadge />, big: 'YOUR LIVER CAN RECOVER', small: 'often, once you stop'},
    {icon: <SlowBadge />, big: "DRINK DAILY? DON'T STOP SUDDENLY", small: 'get medical help first'},
    {icon: <HelpBadge />, big: 'SHAKING OR CONFUSION?', small: 'get emergency help'},
  ],
};
void lerp; void PLACE_NIGHT; void ({} as MouthKind);
