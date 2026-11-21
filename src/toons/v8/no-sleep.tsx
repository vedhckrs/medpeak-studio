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
import {lobe} from './scenes-body';
import {Brain} from './organs-a';
import {Melatonin} from './cells';
import {CharTag, Sunrise, Warning, type CtaPoint} from './hud';
import {DiveCtx, DIVE} from './micro3';
import {BrainGapPlace} from './sleep-places';
import {Gunk, NightCrew} from './sleep-cast';
import {BedFront, BedroomRoom, Duvet} from './sleep-rooms';
import {Scene} from './scene';
import {PEOPLE_SCALE} from './scenes-rooms';
import {castById, handAt, HandAt, headAt, PersonAt} from './people-rig';
import {FONT, INK, CLOTH, EDGE, EDGE_IN, OUTLINE, shade} from './kit';
import {active, blink, bodyFace, clamp01, EXPR_OF, feel, go, lerp, pop, since, sway, talkSmooth, type Focus, type ShotDef, type ShotNow} from './play';

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
const voiceSq = (s: ShotNow, who: string) => active(s, who) * sway(s.t, 0.9, who.length) * 0.025; // a slow small breath while speaking (2026-11-21: no squash on every syllable, it jiggled)
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

// =================================================================== A: the hook (the owner's choice A, 2026-11-21)
// 0.00  Sam's face in the dark, lit by his phone; the clock SLAMS onto 2:00 (beep) · "Just one more video..." (cold open)
// ~1.5  the camera dives through his face into his brain (a round window opens from between his eyes)
// A1    Gunk SPLATS onto the lens (flash, goo runs down the screen), then drops back to his heap · "clog": the gaps squeeze shut
// A2    he leans in; his name tag only now, after the hook
type HookA = {dive0: number; dive1: number; splat: number; clog: number};
const hookA = (s: ShotNow): HookA => {
  const splat = at(s, 'A1', undefined, 2.0);
  return {dive0: splat - 0.55, dive1: splat - 0.05, splat, clog: at(s, 'A1', 'clog', splat + 1.1)};
};
/** Sam close up for the cold open: the rig at 7x, his face placed high in the frame. */
const samCloseOpts = () => {
  const o0 = {pose: 'sitPhone' as const, view: 'three-quarter' as const, facing: 'right' as const, x: 540, y: 1560, scale: 5.6};
  const h0 = headAt(SAM, o0);
  return {...o0, x: o0.x + (590 - h0.x), y: o0.y + (700 - h0.y)};
};
const diveAt = (): [number, number] => { const h = headAt(SAM, samCloseOpts()); return [h.x + h.r * 0.12, h.y - h.r * 0.05]; };
const SamCold: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t;
  const o = samCloseOpts();
  const hand = handAt(SAM, o).R;
  const slam = t < 0.3 ? lerp(2.4, 1, Math.pow(clamp01(t / 0.22), 2)) + Math.sin(clamp01((t - 0.22) / 0.08) * Math.PI) * 0.06 : 1;
  const expr = EXPR_OF[feel(s, 'patient', 'happy')] ?? 'happy';
  return (
    <div style={{position: 'absolute', inset: 0, background: '#1d2447', overflow: 'hidden'}}>
      {/* the room behind him, dark and close: the moon window, out of focus is not drawn, only darker */}
      <div style={{position: 'absolute', inset: 0, transformOrigin: '560px 520px', transform: 'scale(1.9)', opacity: 0.55}}><BedroomRoom night /></div>
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920} viewBox="0 0 1080 1920">
        <path d={`M ${hand.palm[0]} ${hand.palm[1] - 60} L ${hand.palm[0] - 360} ${hand.palm[1] - 900} L ${hand.palm[0] - 620} ${hand.palm[1] - 300} Z`} fill="#d4e8f6" opacity={0.22 + sway(t, 0.7) * 0.03} />
      </svg>
      <PersonAt spec={SAM} {...o} expr={expr} look={[0.5, 0.5]} talk={talkSmooth(s, 'patient')} blink={blink(t, 2)} bob={sway(t, 2.6) * 0.3} />
      {/* he is IN BED: the duvet pulled up over his legs, close to the lens */}
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920} viewBox="0 0 1080 1920">
        <path d="M -40 1430 Q 200 1330 520 1390 Q 820 1440 1120 1360 L 1120 1960 L -40 1960 Z" fill="#3fa79a" stroke={INK} strokeWidth={6} />
        <path d="M -40 1510 Q 260 1440 560 1490 Q 860 1530 1120 1460" stroke="#2f8a7f" strokeWidth={14} fill="none" />
        <path d="M 240 1420 Q 280 1560 250 1700 M 700 1430 Q 740 1580 720 1720" stroke={INK} strokeWidth={4} fill="none" />
        {Array.from({length: 7}, (_, i) => <circle key={i} cx={80 + i * 150} cy={1600 + (i % 2) * 70} r={10} fill="#6cc4b8" />)}
      </svg>
      <HeldPhone h={hand} />
      {/* the clock slams in, top right: 2:00 */}
      <div style={{position: 'absolute', left: 250, top: 250, transform: `translate(-50%, -50%) scale(${slam.toFixed(3)}) rotate(4deg)`, background: CLOTH.charcoal, border: `6px solid ${INK}`, borderRadius: 26,
        padding: '14px 30px', boxShadow: `0 10px 0 ${INK}`, fontFamily: FONT, fontWeight: 900, fontSize: 120, color: '#ff6b5e', letterSpacing: 4}}>2:00</div>
    </div>
  );
};
const posA = (s: ShotNow) => {
  const t = s.t, h = hookA(s);
  const u = t - h.splat;
  // flies at the lens (0.18 s), hits it huge, then drops back to his heap with a bounce
  const fly = clamp01(u / 0.18), back = go(u, 0.35, 0.5);
  const size = u < 0 ? 120 : u < 0.18 ? lerp(160, 1500, fly * fly) : lerp(1500, 560, back);
  const clog = go(since(s, 'A1', 'clog'), 0, 0.2) * (1 - go(since(s, 'A1', 'clog'), 0.4, 0.4) * 0.6);
  const lean = go(since(s, 'A2'), 0, 0.5);
  const c = calm(s, 'gunk');
  return {
    x: 545 + sway(t, 2.4, 1) * 10 * c * back,
    y: lerp(960, 1010, back) + lerp(0, 60, lean),
    size: size * (1 + clog * 0.12) + lean * 60,
    sq: u > 0.18 && u < 0.4 ? 0.18 * Math.sin(((u - 0.18) / 0.22) * Math.PI) : voiceSq(s, 'gunk'),
    rot: sway(t, 1.3, 2) * 4 * c * back,
    on: u >= 0,
  };
};
/** Goo on the lens after the splat: lumpy splats stuck on the glass at the edges (half off the frame), each with short
 * drips that run down, then the whole lot fades (2026-11-21: round blobs with one tail read as balloons). */
const Goo: React.FC<{u: number}> = ({u}) => {
  if (u < 0.15 || u > 2.3) return null;
  const k = clamp01((u - 0.15) / 0.1), run = clamp01((u - 0.3) / 1.7), op = 1 - clamp01((u - 1.5) / 0.8);
  const splats: [number, number, number, number][] = [[-30, 330, 190, 1], [1110, 260, 210, 2], [-20, 1480, 220, 3], [1100, 1350, 180, 4], [430, -40, 170, 5], [760, 1960, 160, 6]];
  const GOO = '#a89c8f';
  return (
    <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920} viewBox="0 0 1080 1920" opacity={op}>
      {splats.map(([x, y, r, seed]) => {
        const rr = r * (0.6 + 0.4 * k);
        const drips = [-0.45, -0.05, 0.38].map((dx, j) => ({dx: dx * rr, len: rr * (0.35 + 0.25 * ((seed + j) % 3)) * (0.3 + run * 1.2), w: rr * (0.13 + 0.04 * (j % 2))}));
        return (
          <g key={seed} transform={`translate(${x} ${y})`}>
            {drips.map((d, j) => (
              <g key={j}>
                <path d={`M ${d.dx - d.w} 0 L ${d.dx - d.w} ${rr * 0.55 + d.len} A ${d.w} ${d.w} 0 0 0 ${d.dx + d.w} ${rr * 0.55 + d.len} L ${d.dx + d.w} 0 Z`} fill={GOO} stroke={INK} strokeWidth={5} />
              </g>
            ))}
            <path d={lobe(0, 0, rr, rr * 0.82, seed * 13 + 3, 11)} fill={GOO} stroke={INK} strokeWidth={5} />
            {[0, 1, 2].map((j) => <circle key={j} cx={Math.cos(seed + j * 2.1) * rr * 1.25} cy={Math.sin(seed + j * 2.1) * rr * 1.05} r={rr * (0.1 + 0.05 * j)} fill={GOO} stroke={INK} strokeWidth={4} />)}
            <path d={`M ${-rr * 0.45} ${-rr * 0.3} q ${rr * 0.2} ${-rr * 0.28} ${rr * 0.55} ${-rr * 0.26}`} stroke="#ffffff" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.9} />
          </g>
        );
      })}
    </svg>
  );
};
const ShotA: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, h = hookA(s);
  const dirt = dial(t, 0.65, [[h.splat, 0.75], [at(s, 'A1', 'sleep', h.splat + 0.6), 0.8], [h.clog, 0.9], [at(s, 'A2', 'wash', h.splat + 2.6), 1]]);
  const gap = dial(t, 0.6, [[h.clog, 0, 0.25]]); // the gaps squeeze shut on "clog"
  const squeeze = go(t, h.clog, 0.25) * (1 - go(t, h.clog + 0.5, 0.6)) * 0.28; // a dark pulse as they shut
  const v = posA(s);
  const f = bodyFace(s, 'gunk', 3, 'angry');
  // the dive: Sam grows about the point between his eyes, the brain shows through a round window that opens there
  const k = clamp01((t - h.dive0) / (h.dive1 - h.dive0)), e = k * k * (3 - 2 * k);
  const [px, py] = diveAt();
  const R = e * 2300;
  return (
    <>
      <div style={{position: 'absolute', inset: 0}}>
        <DiveCtx.Provider value={0}>
          <BrainGapPlace t={t} gap={gap} dirt={dirt} />
        </DiveCtx.Provider>
        {v.on && <Put x={v.x} y={v.y} size={v.size} rot={v.rot} sq={v.sq}><Gunk stage={1} mood={f.mood} mouth={f.mouth} look={[0, 0.5]} /></Put>}
        {squeeze > 0 && <div style={{position: 'absolute', inset: 0, background: '#141a33', opacity: squeeze}} />}
        <Goo u={t - h.splat} />
      </div>
      {e < 1 && (
        <div style={{position: 'absolute', inset: 0, transformOrigin: `${px}px ${py}px`, transform: `scale(${(1 + e * e * 7).toFixed(4)})`,
          WebkitMaskImage: e > 0 ? `radial-gradient(circle at ${px}px ${py}px, transparent ${(R / (1 + e * e * 7)).toFixed(1)}px, black ${(R / (1 + e * e * 7) + 1).toFixed(1)}px)` : undefined}}>
          <SamCold s={s} />
        </div>
      )}
    </>
  );
};
const viewA = slowPush(545, 980, 1.06, 1.12);
const TagA = tagVia(viewA);
const ScreenA: React.FC<{s: ShotNow}> = ({s}) => {
  const v = posA(s);
  // the name tag only after the hook line (the owner, 2026-11-21: too much text in the first seconds)
  return <TagA s={s} label="GUNK (BRAIN WASTE)" x={v.x} y={v.y} r={v.size * 0.34} t={since(s, 'A2') - 0.3} />;
};

// =================================================================== B: the bedroom, 2 a.m.
/**
 * The phone in Sam's hand (2026-11-21, the owner: "holds the smartphone not proper"): seen from its BACK (the screen faces
 * him), its long side across his curled fingers, and his own hand drawn again OVER it, so the fingers wrap the phone.
 */
const HeldPhone: React.FC<{h: ReturnType<typeof handAt>['R']; lift?: number}> = ({h, lift = 0}) => {
  const rot = (Math.atan2(h.dir[1], h.dir[0]) * 180) / Math.PI;
  const [px, py] = [h.palm[0], h.palm[1] - lift * 20];
  return (
    <>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={`translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${(rot + 90).toFixed(1)})`}>
          <rect x={-34} y={-78} width={68} height={140} rx={14} fill={CLOTH.charcoal} stroke={INK} strokeWidth={4.5} />
          <rect x={-26} y={-70} width={24} height={30} rx={8} fill="#2a2e38" stroke={INK} strokeWidth={2.5} />
          <circle cx={-14} cy={-62} r={6} fill="#11141a" stroke="#5a6070" strokeWidth={2} />
          <circle cx={-14} cy={-47} r={6} fill="#11141a" stroke="#5a6070" strokeWidth={2} />
          <path d="M 22 -60 v 30" stroke="#5a6070" strokeWidth={4} strokeLinecap="round" />
        </g>
      </svg>
      <HandAt x={h.wrist[0]} y={h.wrist[1] - lift * 20} px={PEOPLE_SCALE * 30} kind="hold" skin={SAM.skin} rot={rot} rod={false} />
    </>
  );
};
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
        <path d={`M ${h.palm[0] - 10} ${h.palm[1] - 60} L ${h.palm[0] - 120} ${h.palm[1] - 330} L ${h.palm[0] - 230} ${h.palm[1] - 140} Z`} fill="#d4e8f6" opacity={0.26 + sway(t, 0.7) * 0.04} />
      </svg>
      <PersonAt spec={SAM} {...samB} expr={expr} look={[0.6, 0.3]} talk={talkSmooth(s, 'patient')} blink={blink(t, 2)} bob={sway(t, 3.2) * 0.4} />
      <HeldPhone h={h} lift={bob} />
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
  const dance = party * Math.abs(Math.sin((t - tParty) * 4));
  const scared = go(t, at(s, 'C4', undefined, 10), 0.3);
  // the two crew helpers rush along the cross channel while the wash runs
  const run = clamp01((t - tWash) / 2.4) * (1 - go(t, tAwake, 0.3));
  return (
    <>
      <BrainGapPlace t={t} gap={gap} wash={wash} dirt={dirt} />
      {run > 0 && [0, 1].map((i) => <Put key={i} x={lerp(-120, 1200, (run + i * 0.35) % 1)} y={i ? 1330 : 705} size={190} rot={8}><NightCrew job={i ? 'bucket' : 'brush'} mood="happy" look={[0.8, 0]} /></Put>)}
      <Put x={540 + sway(t, 2, 2) * 10 * calm(s, 'crew') - scared * 30} y={1000 + sway(t, 1.6, 3) * 8 * active(s, 'crew') + scared * 10} size={320} rot={sway(t, 1.4, 1) * 4} sq={voiceSq(s, 'crew') + scared * 0.06}>
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
      <PersonAt spec={SAM} {...samD} expr={expr} look={[0.3, 0.6]} talk={talkSmooth(s, 'patient')} blink={nod > 0.5 ? 1 : blink(t, 4)} bob={nod * 3 - jerk * 1.5 + sway(t, 4) * 0.4} />
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
      {crewIn > 0 && <Put x={lerp(1250, 800, crewIn)} y={1330 + sway(t, 1.4, 2) * 8} size={260} rot={-6}><NightCrew job="mop" mood="happy" look={[-0.7, 0]} /></Put>}
      <Put x={545 + sway(t, 0.8, 1) * 10 * go(t, tOpen, 0.3) * (1 - out)} y={lerp(1010, 1300, out)} size={lerp(460, 200, out)} rot={lerp(0, 30, out)} sq={voiceSq(s, 'gunk')}>
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

// ------------------------------------------------------------------ the end card's "IT ADDS UP" icon
/**
 * A night-sky badge (the same round badge as the sunrise beside it) with a battery running low: the green charge drains to one
 * red bar as the card comes in, a sleepy moon above it (2026-11-21, the owner: the calendar "looks cheap").
 */
const SleepBattery: React.FC<{t?: number}> = ({t = 0}) => {
  const drain = clamp01(t / 0.9);
  const charge = 1 - 0.78 * (1 - Math.pow(1 - drain, 3)); // 1 -> 0.22
  const red = charge < 0.4;
  const fill = red ? '#ef5b5b' : '#5cc98a';
  const W = 104, H = 58, x0 = -60, y0 = -6;
  return (
    <g>
      <circle cx={0} cy={0} r={92} fill="#33406f" {...EDGE} />
      <clipPath id="sb-clip"><circle cx={0} cy={0} r={90} /></clipPath>
      <g clipPath="url(#sb-clip)">
        <circle cx={0} cy={110} r={120} fill={shade('#33406f', 0.14)} />
        {[[-58, -52, 5], [52, -60, 4], [66, -18, 3], [-70, -14, 3], [20, -74, 3]].map(([x, y, r], i) => (
          <path key={i} d={`M ${x} ${y - r * 2} L ${x + r * 0.6} ${y - r * 0.6} L ${x + r * 2} ${y} L ${x + r * 0.6} ${y + r * 0.6} L ${x} ${y + r * 2} L ${x - r * 0.6} ${y + r * 0.6} L ${x - r * 2} ${y} L ${x - r * 0.6} ${y - r * 0.6} Z`} fill="#ffe08a" />
        ))}
        {/* the moon, eyes shut */}
        <path d="M 8 -70 a 26 26 0 1 0 30 34 a 20 20 0 1 1 -30 -34 Z" fill="#ffe08a" {...EDGE_IN} />
      </g>
      {/* the battery: white case, the nub, the charge */}
      <g transform="translate(0 8) rotate(-8) scale(1.22)">
        <rect x={x0 + W} y={y0 + H / 2 - 13} width={14} height={26} rx={5} fill="#ffffff" {...EDGE} />
        <rect x={x0} y={y0} width={W} height={H} rx={14} fill="#ffffff" {...EDGE} />
        <rect x={x0 + 9} y={y0 + 9} width={(W - 18) * charge} height={H - 18} rx={7} fill={fill} />
        <rect x={x0 + 9} y={y0 + 9} width={(W - 18) * charge} height={(H - 18) * 0.35} rx={5} fill="#ffffff" opacity={0.35} />
        <rect x={x0 + 9} y={y0 + 9} width={W - 18} height={H - 18} rx={7} fill="none" {...EDGE_IN} />
        {[1, 2, 3].map((k) => <path key={k} d={`M ${x0 + 9 + ((W - 18) * k) / 4} ${y0 + 12} V ${y0 + H - 12}`} stroke="#d9dde6" strokeWidth={3} strokeLinecap="round" />)}
        {red && <path d={`M ${x0 + W / 2 + 6} ${y0 + 14} L ${x0 + W / 2 - 8} ${y0 + H / 2 + 2} L ${x0 + W / 2 + 2} ${y0 + H / 2 + 2} L ${x0 + W / 2 - 6} ${y0 + H - 12}`} stroke={INK} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round" fill="none" />}
      </g>
      <circle cx={0} cy={0} r={92} {...OUTLINE} />
    </g>
  );
};

// ------------------------------------------------------------------ the CTA end card: three strong points (sources: CDC, NHLBI)
export const NO_SLEEP_CTA: {title: string; points: CtaPoint[]; voice: string; seconds: number; at: {head: number; points: [number, number, number]; follow: number}} = {
  title: 'SLEEP IS NOT OPTIONAL',
  // read by the narrator (Joey), assets/toons-voice/no-sleep/cta.mp3 at his own pace; beats from videos/no-sleep/cta-timings.json
  // ("Sleep" 0, "Adults" 1.82, "Lost" 4.89, "And" 7.77, "Follow" 12.57)
  voice: 'toons/no-sleep/voice/cta.mp3', seconds: 16.72,
  at: {head: 0, points: [1.82, 4.89, 7.77], follow: 12.57},
  points: [
    {icon: <Sunrise t={2} />, big: '7+ HOURS', small: 'every night, for adults'},
    {icon: <SleepBattery t={2} />, big: 'IT ADDS UP', small: 'lost sleep builds a debt'},
    {icon: <Warning t={2} />, big: "DON'T DRIVE SLEEPY", small: 'it is as bad as drunk'},
  ],
};
