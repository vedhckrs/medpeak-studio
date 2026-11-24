/**
 * "What Happens When a Bee Stings You" (`bee-sting`), engine v9 (format 6): its shots by id (videos/bee-sting/toon.json) and its
 * end card (Joey reads it all). The owner approved hook A, the look sheets and the script on 2026-11-23.
 *
 *   A   inside the skin (the stage lowered under a band of air, bee-sting-art SkinFrame), ONE framing held: the Stinger spears
 *       in and winks; Kid's "Ow!" from above, the guards jump; "swell it up": the lump rises; Mom's giant tweezers come down,
 *       the Stinger cheers, the guards shout no; Kid: "use a card": the tweezers go; the card's edge sweeps in sideways and
 *       flicks the Stinger out of the frame.
 *   C   the lump close up (STAGES.tissue), the guard crew under the red glow; after "2 DAYS LATER" the redness is smaller.
 *   D   the doctor's pale clinic: Kid (the small red lump on his hand) and the NEW doctor (doctor-new.tsx, 2026-11-24: a plain
 *       white coat, empty hands; one open-hand gesture on each answer line, then down); each looks at whoever speaks.
 *
 * Rules held (the pilot's lessons): a locked camera, one action then a hold, faces out of the caption band (1324-1434), the
 * listener looks at the speaker (measured eye points), hands hang naturally, no flash, no shake.
 */
import React from 'react';
import {Put, Scene} from './scene';
import {type CtaPoint} from './hud';
import {Burst, easeOut, hop, Marks, shake} from './act';
import {STAGES} from './anatomy';
import {MiniWorker} from './cells';
import {castById, PersonAt, type PoseIn, type PoseName} from './people-rig';
import {DoctorAt, doctorHeadAt, type DrPoseIn} from './doctor-new';
import {PaleClinicRoom} from './scenes-rooms';
import {CLOTH, EDGE, EDGE_IN, INK, OUTLINE, Shape, shade, tint, V9} from './kit';
import {active, blink, bodyFace, clamp01, go, lerp, since, speaking, talkSmooth, type Focus, type ShotDef, type ShotNow} from './play';
import {BankCard, GiantTweezers, Lump, SkinFrame, SKIN_Y, SKY, STING_AT, StingerAt, Svg} from './bee-sting-art';

const Tissue = STAGES.tissue.Stage;
const MOM = castById('mom'), KID = castById('kid');

// ------------------------------------------------------------------ helpers
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
const face = (x: number, y: number, r: number): Focus => ({x, y, r});
/** The Stinger's face in FRAME pixels (the stage is lowered by SKY; the face sits 176 above the entry point). */
const STINGER_FACE: [number, number] = [STING_AT[0], STING_AT[1] + SKY - 176];

// =================================================================== A: inside the skin
/** The guards in STAGE pixels for the closer framing (view z 1.4: frame x 154-926 is on screen): all three whole, either side of the lance. */
const GUARDS_A: [number, number, number][] = [[285, 600, 220], [735, 600, 240], [860, 590, 200]];
const timesA = (s: ShotNow) => ({
  ow: at(s, 'A2', 'ow', 2.6), swell: at(s, 'A3', 'swell', 5.5), tw: at(s, 'B1', 'tweezers', 9.0), no: at(s, 'B3', 'no', 14.0),
  card: at(s, 'B4', 'card', 16.5), side: at(s, 'B5', 'sideways', 19.5), out: at(s, 'B6', undefined, 21.5),
});
/** Pain rings: red ripples spreading out from the sting through the skin (on the hit, Kid's "Ow!", the swell). STAGE pixels. */
const PainRings: React.FC<{t: number; at: number[]}> = ({t, at: starts}) => (
  <g>
    {starts.flatMap((t0, j) => [0].map((lag, m) => {
      const u = (t - t0 - lag) / 0.9;
      if (u < 0 || u > 1) return null;
      const r = 50 + 210 * easeOut(u);
      return <ellipse key={j + '-' + m} cx={STING_AT[0]} cy={STING_AT[1] + 40} rx={r} ry={r * 0.55} fill="none" stroke="#e0404f" strokeWidth={14 * (1 - u)} opacity={(1 - u) * 0.75} />;
    }))}
  </g>
);
/** The damage the sting does, drawn ON the skin (decision 9): a torn, jagged wound at the surface and the poison seeping out
 * from the lance into the flesh as a yellow stain with drops. `tear` 0..1, `poison` 0..1. STAGE pixels. */
const StingDamage: React.FC<{tear: number; poison: number; t: number}> = ({tear, poison, t}) => {
  const [x, y] = STING_AT;
  const w = 70 * tear;
  const jag = Array.from({length: 9}, (_, i) => `${(x - w + (i * 2 * w) / 8).toFixed(1)} ${(y + 18 + (i % 2 ? 26 : 6) * tear).toFixed(1)}`).join(' L ');
  return (
    <g>
      {poison > 0.01 && <>
        <ellipse cx={x} cy={y + 230} rx={40 + 170 * poison} ry={30 + 230 * poison} fill="#d9a43a" opacity={0.32} />
        <ellipse cx={x} cy={y + 230} rx={20 + 90 * poison} ry={18 + 140 * poison} fill="#c98a24" opacity={0.3} />
        {[[-60, 120], [55, 210], [-40, 320], [70, 380], [-75, 260]].map(([dx, dy], i) => {
          const k = clamp01(poison * 1.6 - i * 0.15);
          return k > 0 ? <circle key={i} cx={x + dx * k} cy={y + dy + Math.sin(t * 2 + i) * 4} r={9 + 5 * k} fill="#e0b24a" {...EDGE_IN} /> : null;
        })}
      </>}
      {tear > 0.01 && <path d={`M ${jag} L ${x + w} ${y + 4} L ${x - w} ${y + 4} Z`} fill="#8e2a35" {...EDGE_IN} />}
    </g>
  );
};
const ShotA: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, k = timesA(s), st = s.state ?? {};
  const swell0 = st.swelling ?? 0.1;
  // the Stinger: drops in from above the frame and spears in (0-0.45 s), a wobble, then rides up on the lump
  const HIT = 0.45;
  const drop = clamp01(t / HIT) ** 2; // a spear speeds up INTO the hit (no slow landing: the drop and the impact are one action)
  const wob = t > HIT && t < 1.6 ? Math.sin((t - HIT) * 14) * 7 * (1 - (t - HIT) / 1.15) : 0;
  // the damage: the skin tears at the hit, the poison seeps out until the swell, pain rings on the hit, "Ow!" and "swell"
  const tear = easeOut(clamp01((t - HIT) / 0.3));
  const poison = clamp01((t - HIT) / Math.max(1, k.swell - HIT));
  // the card: in from the left on "sideways", SLAMS into the lump (the one shake of the video), the lump squashes, the barbs
  // rip out (the wound opens wide) and the Stinger spins away; the guards jump and cheer
  const sweep = easeOut(clamp01((t - k.side) / 0.38));
  const hitAt = k.side + 0.38;
  const squash = t > hitAt && t < hitAt + 0.5 ? Math.sin(((t - hitAt) / 0.5) * Math.PI) : 0;
  const fly = clamp01((t - hitAt + 0.05) / 0.75);
  const [sx, sy] = shake(t, hitAt, 12, 0.25, true);
  const rip = easeOut(clamp01((t - hitAt) / 0.25));
  const swell = swell0 * (1 - 0.3 * squash);
  const rideUp = -74 * clamp01((swell0 - 0.1) / 0.8);
  // the tweezers come down on "tweezers", hang open over the sac, go back up after Kid's "card"
  const twIn = easeOut(clamp01((t - k.tw) / 0.6)) * (1 - easeOut(clamp01((t - k.card - 0.4) / 0.5)));
  const sf0 = bodyFace(s, 'stinger', 7, 'happy');
  const sf = sf0.mood === 'happy' ? {...sf0, mood: 'open' as const} : sf0; // eyes open while he talks
  const stingerTalks = active(s, 'stinger') > 0.2;
  const outside = speaking(s, 'kid') || speaking(s, 'mom');
  // the Stinger looks: at the lens in the hook, up at the voices from outside, at the guard leader when he talks, up at the tweezers
  const sLook: [number, number] = s.cur?.id === 'A1' || !s.cur ? [0, 0.35] : outside || twIn > 0.5 ? [0, -0.8] : speaking(s, 'guard') ? [0.75, 0.55] : [0.4, 0.4];
  const arms = fly > 0 ? 'flail' : t > 1.2 && (s.cur?.id === 'A1' || s.cur?.id === 'B2') ? 'cheer' : twIn > 0.5 ? 'rub' : 'rest';
  const mood = fly > 0 ? 'shock' : stingerTalks ? sf.mood : s.cur?.id === 'B3' ? 'wink' : 'open';
  // the guards: knocked off balance by the hit, jump on Kid's "Ow!", alarm through the tweezers, a cheering hop after the card
  const alarm = Math.max(go(t, k.ow, 0.25) * (1 - go(t, k.swell + 1.2, 0.4)), go(t, k.no - 0.1, 0.25) * (1 - go(t, hitAt + 0.2, 0.4)));
  const knock = t > HIT && t < HIT + 0.9 ? Math.sin(((t - HIT) / 0.9) * Math.PI * 3) * (1 - (t - HIT) / 0.9) : 0;
  const cheer = hop(t, hitAt + 0.15, 60, 0.3);
  const cheering = t > hitAt + 0.1;
  const gf0 = bodyFace(s, 'guard', 3, cheering ? 'happy' : 'neutral');
  const gf = gf0.mood === 'happy' ? {...gf0, mood: 'open' as const} : gf0;
  const guardTalks = active(s, 'guard') > 0.2;
  const leadLook: [number, number] = outside ? [0, -0.9] : [-0.6, -0.5];
  const cardX = lerp(-300, 420, sweep);
  return (
    <Scene bg="#000"><V9>
      <div style={{position: 'absolute', inset: 0, transform: `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px)`}}>
        <SkinFrame t={t} state={{wound: lerp(0.5, 1, Math.max(tear * 0.5, rip)), swelling: Math.max(swell, 0.25 * tear, 0.6 * go(t, k.ow, 0.3))}}
          layer={<>
            <StingDamage tear={Math.max(tear, rip)} poison={poison} t={t} />
            <PainRings t={t} at={[HIT - 0.08, k.ow, k.swell, hitAt]} />
            <Lump k={clamp01((swell - 0.12) / 0.78)} />
          </>}
          inside={<>
            {GUARDS_A.map(([x, y, sz], i) => (
              <Put key={i} x={x} y={y - alarm * 16 + cheer.dy} size={sz} rot={knock * (i === 0 ? -10 : 10)}>
                <MiniWorker job="guard" band={i === 1 ? 'GUARD' : undefined} pose={i === 1 ? 'hold' : 'rest'}
                  mood={i === 1 && guardTalks ? gf.mood : alarm > 0.5 || knock !== 0 ? 'shock' : 'open'} mouth={i === 1 && guardTalks ? gf.mouth : cheering ? 'big' : alarm > 0.5 ? 'o' : 'smile'}
                  lid={i === 1 ? gf.lid : undefined} look={i === 1 ? leadLook : i === 0 ? [0.6, -0.4] : [-0.6, -0.4]} />
              </Put>
            ))}
          </>}
          over={<>
            {fly < 1 && <StingerAt x={STING_AT[0] + fly * 560} y={lerp(-260, STING_AT[1], drop) + rideUp - Math.sin(Math.PI * Math.min(1, fly * 1.3)) * 280 - fly * 220}
              rot={wob + fly * 540} scale={1 - 0.25 * fly} mood={mood} mouth={stingerTalks ? sf.mouth : fly > 0 ? 'o' : 'smile'} lid={stingerTalks ? sf.lid : undefined} look={sLook} arms={arms}
              squeeze={twIn > 0.5 && s.cur?.id === 'B2' ? 0.25 : 0} />}
            {twIn > 0.01 && <Svg><g transform={`translate(${STING_AT[0]} ${lerp(-900, STING_AT[1] + rideUp - 134, twIn)})`}><GiantTweezers open={0.85} /></g></Svg>}
            {sweep > 0.01 && <Svg><g transform={`translate(${cardX} ${SKIN_Y - 150 + squash * 30}) rotate(${-6 + squash * 6})`}>
              {/* motion trails behind the card while it streaks in (part of the card's drawing) */}
              {sweep < 0.99 && [-50, 0, 50].map((dy, i) => <path key={i} d={`M ${-190 - i * 30} ${dy} L ${-190 - 220 * (1 - sweep) - i * 30} ${dy}`} stroke={INK} strokeWidth={8} strokeLinecap="round" opacity={0.6 * (1 - sweep)} />)}
              <BankCard />
            </g></Svg>}
          </>} />
        {/* pain lines flash either side of the wound on the hit and on Kid's "Ow!" (frame pixels) */}
        {[HIT, k.ow].map((t0, j) => t > t0 && t < t0 + 1.2 ? (
          <React.Fragment key={j}>
            <Marks kind="lines" x={STING_AT[0] - 150} y={STING_AT[1] + SKY + 70} size={110} rot={-30} col="#e0404f" />
            <Marks kind="lines" x={STING_AT[0] + 150} y={STING_AT[1] + SKY + 70} size={110} rot={30} col="#e0404f" />
          </React.Fragment>
        ) : null)}
        {/* the card's slam: one burst where its edge hits the lump (below the Stinger's face) */}
        <Burst t={t} t0={hitAt} x={STING_AT[0] - 60} y={SKIN_Y + SKY + 70} r={90} col="#fff4e0" keep />
        {/* speed lines behind the card while it streaks in (frame pixels: the stage is lowered by SKY) */}
      </div>
    </V9></Scene>
  );
};

// =================================================================== C: the lump close up
const CREW_C: [number, number, number][] = [[330, 1180, 300], [540, 1215, 330], [750, 1180, 300]]; // the shot is framed closer (view z 1.3): 4 px lines, bands above the caption
const ShotC: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, st = s.state ?? {};
  const second = (s.pass ?? 1) > 1;
  const rest = second ? 0 : go(t, 0.4, 0.6); // the leader sits down as the shot opens (one action), then holds
  const stand = second ? go(t, 0.1, 0.6) : 0; // two days later: the crew stands and stretches
  const yawn = second ? 0 : (() => { const y0 = at(s, 'C1', 'rest', 2.5) + 0.4; return t > y0 && t < y0 + 1.1 ? 1 : 0; })(); // the two others yawn after "rest"
  const gf0 = bodyFace(s, 'guard', 4, second ? 'neutral' : 'happy');
  const gf = gf0.mood === 'happy' ? {...gf0, mood: 'open' as const} : gf0;
  const talks = active(s, 'guard') > 0.2;
  return (
    <Scene bg="#000"><V9>
      <Tissue t={t} state={{damage: 0, swelling: st.swelling ?? (second ? 0.35 : 1)}}>
        {CREW_C.map(([x, y, sz], i) => {
          const lead = i === 1;
          const sit = lead ? rest : 0; // the leader sits down and leans back (a rest, not a faint)
          return (
            <Put key={i} x={x} y={y + sit * 50 - stand * 10} size={sz} rot={-sit * 12}>
              <MiniWorker job="guard" prop="none" band={lead ? 'GUARD' : undefined} pose="rest"
                mood={lead && talks ? gf.mood : second ? 'open' : 'closed'} mouth={lead && talks ? gf.mouth : !lead && yawn ? 'o' : second ? 'smile' : 'flat'} lid={lead ? gf.lid : undefined}
                look={lead ? [0, -0.3] : [i === 0 ? 0.6 : -0.6, -0.2]} />
            </Put>
          );
        })}
      </Tissue>
    </V9></Scene>
  );
};

// =================================================================== D: the doctor's clinic
const MIRA_AT = {view: 'three-quarter' as const, facing: 'left' as const, x: 815, y: 2050, scale: 3.4}; // her whole head and bun inside the frame
// eye points (frame pixels, from the layout log; the doctor's from her own rig): where each looks when another speaks
const DOC_FACE = doctorHeadAt(MIRA_AT);
const EYES = {mom: [295, 970] as [number, number], kid: [284, 1080] as [number, number], doctor: [Math.round(DOC_FACE.x), Math.round(DOC_FACE.y)] as [number, number]};
const MOM_AT = {view: 'three-quarter' as const, facing: 'right' as const, x: 235, y: 2050, scale: 3.4};
const KID_AT = {view: 'three-quarter' as const, facing: 'right' as const, x: 300, y: 1760, scale: 3.15}; // his face clear of the caption band (1324-1434), a child's height
const KID_HAND: [number, number] = [390, 1000];
const ShotD: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t;
  const lump = at(s, 'D1', 'lump', 0.8), right = at(s, 'D3', 'right', 6), d6 = at(s, 'D6', undefined, 22);
  const who = s.cur?.who ?? 'kid';
  const target = (me: 'mom' | 'kid' | 'doctor'): [number, number] => (who === me ? (me === 'doctor' ? EYES.kid : EYES.doctor) : who === 'kid' && t > lump && t < lump + 4 && me !== 'kid' ? KID_HAND : EYES[who as keyof typeof EYES] ?? EYES.doctor);
  // he shows the lump on "lump" and lowers his hand again (an open hand held long reads as a stuck gesture: M5)
  const kidPose = poseAt(t, [[-9, 'rest'], [lump - 0.2, 'showArmUp', 0.5], [lump + 1.3, 'rest', 0.5]]);
  const lean = go(t, right - 0.2, 0.5) * (1 - go(t, right + 2.6, 0.5)) * -3;
  // the doctor's hands hang empty; ONE open-hand gesture toward Kid on each answer line ("a small swollen lump", "get help"),
  // up and down inside 1.5 s (an open hand held longer reads as a stuck gesture: M5), then the hold
  const d4 = at(s, 'D4', undefined, 12), help = at(s, 'D5', 'get', 20);
  const up = Math.max(go(t, d4 + 0.05, 0.45) * (1 - go(t, d4 + 1.15, 0.45)), go(t, help - 0.1, 0.45) * (1 - go(t, help + 1.0, 0.45)));
  const docPose: DrPoseIn = up <= 0 ? 'rest' : {a: 'rest', b: 'explain', k: up};
  return (
    <Scene bg="#f1ede4"><V9>
      <PaleClinicRoom wall="mint" items={['door', 'chart']} />
      <div style={{position: 'absolute', inset: 0, transformOrigin: `${MIRA_AT.x}px 1900px`, transform: `rotate(${lean.toFixed(2)}deg)`}}>
        <DoctorAt {...MIRA_AT} pose={docPose} expr={t > right - 0.2 && t < right + 1.6 ? 'happy' : 'neutral'} lookAt={target('doctor')} talk={talkSmooth(s, 'doctor')} blink={blink(t, 4)} />
      </div>
      <PersonAt spec={KID} {...KID_AT} pose={kidPose} expr={t > d6 ? 'happy' : 'worried'} lookAt={target('kid')} talk={talkSmooth(s, 'kid')} blink={blink(t, 2)}
        mark={[{kind: 'sore', at: 'handL'}]} />
    </V9></Scene>
  );
};

// ------------------------------------------------------------------ the shots
export const BEE_STING_SHOTS: Record<string, ShotDef> = {
  // one framing for the whole shot, closer (the fat layer below is not the story): the Stinger and the guards fill the picture
  A: {Scene: ShotA, view: () => ({x: 540, y: 700, z: 1.4}), focus: (who) => (who === 'guard' ? face(GUARDS_A[1][0], GUARDS_A[1][1] + SKY - 150, 40) : face(STINGER_FACE[0], STINGER_FACE[1], 40)), kind: 'body', stage: 'skinSection'},
  C: {Scene: ShotC, view: () => ({x: 540, y: 1080, z: 1.3}), focus: () => face(540, 1110, 40), kind: 'body', stage: 'tissue'},
  // the clinic framed closer (the owner: "top area taking so much space"): the empty wall cropped, the three people fill the picture
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
const CardBadge: React.FC = () => <Badge bg="#ffffff" id="bs-card"><g transform="rotate(-14) scale(0.42)"><BankCard /></g></Badge>;
const NoTweezersBadge: React.FC = () => (
  <Badge bg="#ffffff" id="bs-tw">
    <g transform="translate(0 70) scale(0.2)"><GiantTweezers open={0.6} /></g>
    <path d="M -62 -62 L 62 62" stroke={INK} strokeWidth={20} strokeLinecap="round" />
    <path d="M -62 -62 L 62 62" stroke={CLOTH.red} strokeWidth={12} strokeLinecap="round" />
  </Badge>
);
const HelpBadge: React.FC = () => (
  <Badge bg={tint(CLOTH.red, 0.75)} id="bs-help">
    <Shape d="M -18 -60 H 18 V -18 H 60 V 18 H 18 V 60 H -18 V 18 H -60 V -18 H -18 Z" fill={CLOTH.red} shadow={0.3} />
    <circle cx={0} cy={0} r={4} fill="none" {...EDGE_IN} />
  </Badge>
);
export const BEE_STING_CTA: {title: string; points: CtaPoint[]; voice?: string; seconds: number; at: {head: number; points: [number, number, number]; follow: number}} = {
  title: 'BEE STING: KNOW THIS',
  // Joey reads the whole card ("cta": {"read": "card"}); his clip's real beats come in from videos/bee-sting/cta-timings.json
  seconds: 10,
  at: {head: 0, points: [1.6, 3.4, 5.2], follow: 7.6},
  points: [
    {icon: <CardBadge />, big: 'SCRAPE IT OUT SIDEWAYS', small: 'with a card or a nail'},
    {icon: <NoTweezersBadge />, big: 'NEVER USE TWEEZERS', small: 'they squeeze poison out'},
    {icon: <HelpBadge />, big: 'SWOLLEN LIPS? GET HELP', small: 'or hard breathing: call now'},
  ],
};
