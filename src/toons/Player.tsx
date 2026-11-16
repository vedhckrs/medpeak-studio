// MedPeak Toons player (v6): plays a Toon script (videos/<slug>/toon.json) as a finished Short.
// A script is shots -> lines. Each line has a speaker, the words, an emotion and a pose.
// The player does the rest:
//   - the DIRECTOR picks a shot size, a lens and a camera move for every stretch of every line
//     (or follows the script's own "cam": "cu 85 push"), and never holds a picture longer than 2.6 s;
//   - the ACTORS lip-sync from the voice timing, gesture on the stressed words, nod, lean, turn,
//     shift their weight and react to each other;
//   - the SET lives behind them in layers, so camera moves show depth and lenses blur the background;
//   - captions, sound effects and the music bed are placed from the same timing.
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, random, staticFile, useCurrentFrame} from 'remotion';
import type {Act, CharProps} from './blueprint';
import {BLUEPRINTS, CAST, type CastName} from './characters';
import {Camera, type Cam, CAM0, clampCam, H, type LensName, LENSES, type MoveName, MOVES, type ShotName, SHOTS, W} from './camera';
import {PEOPLE, skeleton, SPECS} from './humans';
import {Grain} from './ink';
import {clamp01, E, guessWords, lerp, lipsync, settle, type SpokenWord} from './motion';
import {blendPose, POSES, type PoseName} from './poses';
import {armOf, blinkAt, type ArmSpec, type Emotion} from './rig';
import {FLOORS, FORES, OfficeDesk, SETS, WordCaption, type SetName} from './scenes';
import {Hold, Slot} from './stage';

export const TOON_FPS = 30;
const GAP = 0.14; // seconds of air between lines (fast banter)
const SHOT_GAP = 0.25;
const SEG = 78; // frames: the longest a picture may stay before the camera cuts (2.6 s)

export type ToonLine = {id: string; who: string; text: string; emotion?: Emotion; pose?: PoseName; sfx?: string; key?: string; react?: Record<string, Emotion>; cam?: string};
export type ToonActor = {who: string; x: number; size: number; y?: number; rot?: number; noLegs?: boolean; flip?: boolean; emotion?: Emotion; pose?: PoseName; enter?: 'walk' | 'drop' | 'pop'};
export type ToonShot = {id: string; set: SetName; cast: ToonActor[]; lines: ToonLine[]; desk?: boolean};
export type Toon = {slug: string; title: string; test?: boolean; music?: string; shots: ToonShot[]; sources?: {id: string; label: string; url: string; note?: string}[]};
export type ToonTimings = {lines: Record<string, {file: string; duration: number; words: SpokenWord[]}>};
export type ToonProps = {toon: Toon; timings: ToonTimings | null; sfx: string[]; music: string | null};

/** The sound that marks a line's mood when the script names none. */
const EMO_SFX: Partial<Record<Emotion, string>> = {shocked: 'boing', scared: 'wobble', angry: 'thud-soft', happy: 'ding', smug: 'slide-whistle-up', sick: 'gurgle-stomach', sad: 'sad-trombone'};
/** The director's default picture for each mood: shot size, lens, move. */
const EMO_CAM: Record<Emotion, [ShotName, LensName, MoveName]> = {
  neutral: ['mcu', '50', 'push'], happy: ['ms', '35', 'static'], angry: ['low', '35', 'push'], scared: ['cu', '85', 'dutch'],
  smug: ['mcu', '50', 'push'], sick: ['cu', '85', 'push'], sleepy: ['mcu', '50', 'static'], shocked: ['cu', '85', 'crash'], sad: ['cu', '85', 'push'],
};
/** When a line is long, the camera keeps changing the picture in this order. */
const RELIEF: [ShotName, LensName, MoveName][] = [['two', '35', 'truck'], ['cu', '85', 'push'], ['ms', '50', 'static'], ['ots', '50', 'push']];

type Placed = {line: ToonLine; si: number; li: number; from: number; frames: number; words: SpokenWord[]; file?: string};
export type Seg = {from: number; to: number; si: number; line: Placed; who: string; shot: ShotName; lens: LensName; move: MoveName; whip: boolean};

/** Read "cu 85 push" into a shot size, a lens and a move (any order, any subset). */
export const parseCam = (s: string | undefined): {shot?: ShotName; lens?: LensName; move?: MoveName} => {
  const out: {shot?: ShotName; lens?: LensName; move?: MoveName} = {};
  for (const w of (s ?? '').toLowerCase().split(/[\s,]+/).filter(Boolean)) {
    const lens = w.replace(/mm$/, '');
    if (w in SHOTS) out.shot = w as ShotName;
    else if (lens in LENSES) out.lens = lens as LensName;
    else if (w in MOVES) out.move = w as MoveName;
  }
  return out;
};
const CLOSE: ShotName[] = ['mcu', 'cu', 'ecu', 'ots', 'low'];

export const layoutToon = (toon: Toon, timings: ToonTimings | null) => {
  const lines: Placed[] = [];
  const shots: {shot: ToonShot; from: number; frames: number}[] = [];
  let at = 0;
  toon.shots.forEach((shot, si) => {
    const from = at;
    shot.lines.forEach((line, li) => {
      const tm = timings?.lines[line.id];
      const sec = tm ? tm.duration : Math.max(1, line.text.split(/\s+/).length / 2.8 + 0.35);
      const frames = Math.round((sec + GAP) * TOON_FPS);
      lines.push({line, si, li, from: at, frames, words: tm?.words ?? guessWords(line.text, sec), file: tm?.file});
      at += frames;
    });
    at += Math.round(SHOT_GAP * TOON_FPS);
    shots.push({shot, from, frames: at - from});
  });

  // ---- the director: camera segments
  const segs: Seg[] = [];
  let speakerChanges = 0;
  lines.forEach((l, idx) => {
    const shot = toon.shots[l.si];
    const end = l.from + l.frames;
    const own = parseCam(l.line.cam);
    const [es, el, em] = EMO_CAM[l.line.emotion ?? 'neutral'];
    const main: [ShotName, LensName, MoveName] = [own.shot ?? es, own.lens ?? el, own.move ?? em];
    const prev = lines[idx - 1];
    const changed = !!prev && prev.si === l.si && prev.line.who !== l.line.who;
    if (changed) speakerChanges++;
    const plan: {len: number; who: string; cam: [ShotName, LensName, MoveName]}[] = [];
    let left = l.frames;
    if (l.li === 0 && !own.shot) {
      const open = Math.min(54, Math.round(l.frames * 0.42));
      plan.push({len: open, who: l.line.who, cam: ['wide', '24', 'truck']});
      left -= open;
    }
    const reactor = l.line.react ? Object.keys(l.line.react).find((w) => shot.cast.some((a) => a.who === w)) : undefined;
    let k = 0;
    let first = true;
    let last: ShotName | null = plan.length ? plan[plan.length - 1].cam[0] : null;
    while (left > 0) {
      let len = left <= SEG + 10 ? left : Math.min(left, SEG); // a line may run up to 2.9 s in one picture
      if (left - len > 0 && left - len < 24) len = Math.ceil(left / 2); // never leave a sliver
      if (first) {
        // a long first stretch with a reaction: cut away to the listener's face for a moment
        if (reactor && len >= 62) {
          const a = Math.round(len * 0.56);
          plan.push({len: a, who: l.line.who, cam: main}, {len: len - a, who: reactor, cam: ['cu', '85', 'static']});
        } else plan.push({len, who: l.line.who, cam: main});
        last = main[0];
      } else {
        // the next picture must differ in size from the one before (no jump cuts)
        let pick = RELIEF[(k + l.li) % RELIEF.length];
        if (pick[0] === last || (pick[0] === 'two' && shot.cast.length < 2)) { k++; pick = RELIEF[(k + l.li) % RELIEF.length]; }
        plan.push({len, who: l.line.who, cam: pick});
        last = pick[0];
        k++;
      }
      first = false;
      left -= len;
    }
    let f = l.from;
    plan.forEach((p, i) => {
      const whip = i === 0 && changed && l.li > 0 && CLOSE.includes(p.cam[0]) && (own.move === 'whip' || speakerChanges % 3 === 2);
      segs.push({from: f, to: Math.min(end, f + p.len), si: l.si, line: l, who: p.who, shot: p.cam[0], lens: p.cam[1], move: p.cam[2] === 'whip' ? 'push' : p.cam[2], whip});
      f += p.len;
    });
  });
  return {lines, shots, segs, cuts: segs, total: Math.max(TOON_FPS, at)};
};

// ------------------------------------------------------------------ where everybody is
const isPerson = (who: string) => who in SPECS;
const groundOf = (who: string) => (isPerson(who) ? 96 : BLUEPRINTS[who as CastName].ground.y);
/** An actor on screen: slot centre, face centre, face size, top and bottom (all in set pixels). */
const place = (a: ToonActor, set: SetName) => {
  const floor = FLOORS[set];
  const u = a.size / 200;
  const cy = a.y ?? (floor === null ? 900 : floor - groundOf(a.who) * u);
  const rot = ((a.rot ?? 0) * Math.PI) / 180;
  const turn = (x: number, y: number): [number, number] => [a.x + (x * Math.cos(rot) - y * Math.sin(rot)) * u, cy + (x * Math.sin(rot) + y * Math.cos(rot)) * u];
  if (isPerson(a.who)) {
    const sp = SPECS[a.who];
    const h = sp.height ?? 1;
    const k = skeleton(sp);
    const headC = 96 - (96 - k.headC) * h;
    const [fx, fy] = turn(0, headC + 2 * k.hs * h);
    const headH = 62 * k.hs * h * u;
    return {cx: a.x, cy, faceX: fx, faceY: fy, headH, faceW: 54 * k.hs * h * u, top: fy - headH * 0.62, bottom: cy + 96 * u, person: true, size: a.size};
  }
  const bp = BLUEPRINTS[a.who as CastName];
  const [fx, fy] = turn(bp.face.x * (a.flip ? -1 : 1), bp.face.y);
  return {cx: a.x, cy, faceX: fx, faceY: fy, headH: 96 * bp.face.size * u, faceW: 86 * bp.face.size * u, top: cy - 92 * u, bottom: cy + bp.ground.y * u, person: false, size: a.size};
};
type Spot = ReturnType<typeof place>;

/** The picture a shot size gives for a character (A) talking to another (B). */
const framing = (shot: ShotName, A: Spot, B: Spot | null): {zoom: number; cx: number; cy: number; rot: number} => {
  const dir = B ? Math.sign(B.faceX - A.faceX) || 1 : 1;
  const lead = (z: number) => A.faceX + (dir * 56) / z;
  const z0 = (z: number) => Math.max(1, Math.min(3.3, z));
  switch (shot) {
    case 'ews': return {zoom: 1, cx: W / 2, cy: H / 2, rot: 0};
    case 'wide': return {zoom: 1.04, cx: W / 2, cy: H / 2, rot: 0};
    case 'full': {
      const z = z0((0.78 * H) / (A.bottom - A.top));
      return {zoom: z, cx: A.cx, cy: (A.top + A.bottom) / 2 + 60 / z, rot: 0};
    }
    case 'two': {
      if (!B) return framing('ms', A, null);
      const z = z0((W * 0.9) / (Math.abs(B.faceX - A.faceX) + (A.faceW + B.faceW) * 1.25));
      return {zoom: Math.min(z, 1.8), cx: (A.faceX + B.faceX) / 2, cy: (A.faceY + B.faceY) / 2 + 250 / Math.min(z, 1.8), rot: 0};
    }
    case 'ms': {
      const z = z0(A.person ? (0.23 * H) / A.headH : (0.8 * W) / (A.size * 0.82));
      return {zoom: z, cx: lead(z), cy: A.faceY + (A.person ? 330 : 190) / z, rot: 0};
    }
    case 'cu': {
      const z = A.person ? z0((0.36 * H) / A.headH) : Math.min(2.5, z0((0.56 * W) / A.faceW));
      return {zoom: z, cx: A.faceX + (dir * 26) / z, cy: A.faceY + 170 / z, rot: 0};
    }
    case 'ecu': {
      const z = z0((A.person ? (0.36 * H) / A.headH : Math.min(2.5, (0.56 * W) / A.faceW)) * 1.45);
      return {zoom: z, cx: A.faceX, cy: A.faceY + 110 / z, rot: 0};
    }
    case 'ots': {
      const z = z0(A.person ? (0.3 * H) / A.headH : (0.94 * W) / (A.size * 0.82));
      return {zoom: z, cx: A.faceX + (dir * 200) / z, cy: A.faceY + 240 / z, rot: 0};
    }
    case 'low': {
      const z = z0(A.person ? (0.33 * H) / A.headH : (1.02 * W) / (A.size * 0.82));
      return {zoom: z, cx: lead(z), cy: A.faceY + 330 / z, rot: -dir * 2.4};
    }
    default: { // mcu
      const z = z0(A.person ? (0.3 * H) / A.headH : (0.94 * W) / (A.size * 0.82));
      return {zoom: z, cx: lead(z), cy: A.faceY + 250 / z, rot: 0};
    }
  }
};

/** Everything the camera does on frame `f` of segment `s` (without the whip from the previous picture). */
const camOf = (s: Seg, shot: ToonShot, f: number, keyAt: number | null): Cam => {
  const a = shot.cast.find((o) => o.who === s.who) ?? shot.cast[0];
  const other = shot.cast.find((o) => o.who !== a.who);
  const A = place(a, shot.set);
  const B = other ? place(other, shot.set) : null;
  const base = framing(s.shot, A, B);
  const dir = B ? Math.sign(B.faceX - A.faceX) || 1 : 1;
  const n = f - s.from;
  const u = clamp01(n / Math.max(1, s.to - s.from));
  const c: Cam = {...CAM0, ...base, lens: s.lens};
  switch (s.move) {
    case 'push': c.zoom *= 1 + 0.065 * u; break;
    case 'pull': c.zoom *= 1.075 - 0.07 * u; break;
    case 'truck': c.cx += (dir * lerp(-52, 52, E.inOut(u))) / c.zoom; c.zoom *= 1.035 + 0.03 * u; break;
    case 'tilt': c.cy += ((1 - E.out(clamp01(n / 26))) * 330) / c.zoom; c.zoom *= 1 + 0.03 * u; break;
    case 'crash': c.zoom *= (n < 8 ? lerp(0.6, 1.07, E.out(n / 8)) : lerp(1.07, 1, E.out(clamp01((n - 8) / 7)))) * (1 + 0.03 * u); break;
    case 'dutch': c.rot += dir * (3.4 + 3.6 * Math.exp(-n / 9)); c.zoom *= 1.05 + 0.04 * u; c.sx = 12 * Math.exp(-n / 5) * Math.sin(n * 2.9); c.sy = 9 * Math.exp(-n / 5) * Math.cos(n * 3.7); break;
    case 'shake': c.sx = 18 * Math.exp(-n / 5.5) * Math.sin(n * 2.9); c.sy = 13 * Math.exp(-n / 5.5) * Math.cos(n * 3.7); c.zoom *= 1.02 + 0.03 * u; break;
    case 'rack': c.soft = Math.max(0, 7 * (1 - n / 9)); c.zoom *= 1 + 0.04 * u; break;
    default: c.zoom *= 1 + 0.014 * u;
  }
  if (s.move === 'crash') { c.sx = 8 * Math.exp(-Math.max(0, n - 7) / 4) * Math.sin(n * 2.7) * (n >= 7 ? 1 : 0); }
  if (keyAt !== null && f >= keyAt && keyAt >= s.from) c.zoom *= 1 + 0.04 * Math.exp(-(f - keyAt) / 7); // a punch-in on the key word
  return clampCam(c);
};

// ------------------------------------------------------------------ acting
const stressed = (w: SpokenWord, key: string) => { const c = w.w.toLowerCase().replace(/[^a-z']/g, ''); return c === key || c.length >= 6 || /[!?]$/.test(w.w); };
/** 0..1 pulse that jumps on each stressed word of a line and dies out in a few frames. */
const beatOf = (l: Placed | undefined, f: number, key: string) => {
  if (!l) return 0;
  let v = 0;
  for (const w of l.words) {
    const wf = l.from + Math.round(w.start * TOON_FPS);
    if (f >= wf && f < wf + 16 && stressed(w, key)) v = Math.max(v, (f - wf < 3 ? (f - wf) / 3 : Math.exp(-(f - wf - 3) / 4.5)));
  }
  return v;
};
/** A smooth step that changes value every `period` frames (weight shifts, glances). */
const hop = (f: number, period: number, seed: number, ease = 14) => {
  const i = Math.floor((f + seed * 17) / period);
  const u = clamp01(((f + seed * 17) % period) / ease);
  const v = (k: number) => random(`hop${seed}-${k}`) * 2 - 1;
  return lerp(v(i - 1), v(i), E.inOut(u));
};
const EMO_ACT: Record<Emotion, {lean: number; tilt: number; nod: number; shrug: number}> = {
  neutral: {lean: 1.5, tilt: 0, nod: 0, shrug: 0}, happy: {lean: 2.5, tilt: 4, nod: -0.2, shrug: 0}, angry: {lean: 6, tilt: -2, nod: 0.3, shrug: 0.4},
  scared: {lean: -6, tilt: 3, nod: -0.3, shrug: 1}, smug: {lean: -2, tilt: -6, nod: -0.4, shrug: 0}, sick: {lean: 2, tilt: 5, nod: 0.9, shrug: 0.2},
  sleepy: {lean: 1, tilt: 7, nod: 0.8, shrug: 0}, shocked: {lean: -5, tilt: 0, nod: -0.5, shrug: 0.9}, sad: {lean: 1, tilt: 6, nod: 1, shrug: 0.1},
};

const Actor: React.FC<{a: ToonActor; shot: ToonShot; shotFrom: number; lines: Placed[]; f: number; cur: Placed | undefined; blur: number}> = ({a, shot, shotFrom, lines, f, cur, blur}) => {
  const C = (isPerson(a.who) ? PEOPLE[a.who as keyof typeof PEOPLE] : CAST[a.who as CastName]) as React.FC<CharProps>;
  const person = isPerson(a.who);
  const {cx, cy} = place(a, shot.set);
  const seed = Math.round(a.x);
  const past = lines.filter((l) => l.from <= f);
  // emotion: the latest line that sets it (own line, or a reaction to someone else's)
  let emotion: Emotion = a.emotion ?? 'neutral';
  let emotionFrom = -999;
  let prevEmotion: Emotion = emotion;
  for (const l of past) {
    const e = l.line.who === a.who ? l.line.emotion : l.line.react?.[a.who];
    if (e && e !== emotion) { prevEmotion = emotion; emotion = e; emotionFrom = l.from; }
  }
  const speaking = cur?.line.who === a.who;
  const key = cur ? (cur.line.key ?? '').toLowerCase() : '';
  const beat = speaking ? beatOf(cur, f, key) : 0;
  // pose: own lines set it; it eases in with a small overshoot, and the arms beat on stressed words
  const own = past.filter((l) => l.line.who === a.who && l.line.pose);
  const poseOf = (n: PoseName | undefined) => POSES[n ?? 'rest'][person ? 'person' : 'body'];
  const now = own[own.length - 1];
  const before = own[own.length - 2];
  const from = poseOf(before ? before.line.pose : a.pose);
  const to = poseOf(now ? now.line.pose : a.pose);
  const posed = now ? blendPose(from, to, E.back(clamp01((f - now.from) / 10))) : to;
  const arms = posed.map((sp, i) => {
    const s = armOf(sp as ArmSpec);
    const up = s.a < 20 || s.a > 160; // a raised or gesturing arm beats more than a hanging one
    return {...s, a: s.a + (i === 0 ? 1 : -1) * beat * (up ? 7 : 3)};
  }) as [ArmSpec, ArmSpec];
  const talk = speaking && cur ? lipsync(cur.words, (f - cur.from) / TOON_FPS) : 0;
  // eyes: look at whoever is talking; the speaker looks at the listener and sometimes at the viewer
  const others = shot.cast.filter((o) => o.who !== a.who);
  const target = speaking || !cur ? others[0] : shot.cast.find((o) => o.who === cur.line.who);
  const side = target ? Math.sign(target.x - a.x) * (a.flip ? -1 : 1) : 0;
  const toViewer = speaking && (f + seed) % 84 > 60;
  const lookX = toViewer ? 0 : side * 0.8;
  // body: the mood sets the stance; speech adds nods and a forward lean; listeners shift their weight
  const m0 = EMO_ACT[prevEmotion];
  const m1 = EMO_ACT[emotion];
  const mk = E.back(clamp01((f - emotionFrom) / 12));
  const mood = (k: keyof typeof m1) => lerp(m0[k], m1[k], mk);
  const act: Act = {
    lean: side * mood('lean') * (speaking ? 1.25 : 0.7) + settle(f, emotionFrom, 3, 0.9, 0.25) * (emotion === 'shocked' || emotion === 'scared' ? -side : 0),
    tilt: side * mood('tilt') * 0.8 + (speaking ? 0 : hop(f, 96, seed, 18) * 2.4),
    nod: mood('nod') + beat * 0.55 + (!speaking && cur ? Math.max(0, Math.sin((f + seed) / 11)) ** 6 * 0.5 : 0),
    turn: (toViewer ? 0 : side * 0.62) * E.out(clamp01((f - (cur?.from ?? 0)) / 8 + 0.4)),
    shift: person ? (speaking ? 0.25 : 0.75) * hop(f, 104, seed + 3, 20) : 0,
    shrug: mood('shrug') * (0.6 + 0.4 * beat),
    bob: person ? beat * 1.3 : -beat * (emotion === 'happy' || emotion === 'angry' ? 3.4 : 1.6),
  };
  // a "take" when the emotion changes, and a nudge when starting to speak
  const squash = settle(f, emotionFrom, emotion === 'shocked' || emotion === 'scared' ? 0.3 : 0.14, 1.1, 0.3) + (speaking && cur ? settle(f, cur.from, 0.08, 1.2, 0.4) : 0);
  const ground = groundOf(a.who);
  // entrances
  const n = f - shotFrom;
  let dx = 0;
  let dy = 0;
  let step = 0;
  let scale = 1;
  if (a.enter === 'walk' && n < 30) { const u = E.out(n / 30); dx = (a.x < W / 2 ? -1 : 1) * (1 - u) * (a.size * 0.9 + 200); step = Math.sin(n * 0.8) * (1 - u); }
  if (a.enter === 'drop' && n < 22) { dy = -(1 - E.in(clamp01(n / 14))) * 1400; }
  if (a.enter === 'pop' && n < 12) scale = E.back(clamp01(n / 12));
  const land = a.enter === 'drop' ? settle(f, shotFrom + 14, 0.5, 1.1, 0.3) : 0;
  const blinkNow = Math.max(blinkAt(f, TOON_FPS, seed), f - emotionFrom >= 0 && f - emotionFrom < 5 ? 1 - Math.abs(f - emotionFrom - 2) / 3 : 0);
  return (
    <Slot x={cx + dx} y={cy + dy} size={a.size} blur={blur}>
      <g transform={`${a.rot ? `rotate(${a.rot + settle(f, emotionFrom, 5, 0.8, 0.25)})` : ''} ${scale !== 1 ? `scale(${scale})` : ''}`}>
        <Hold frame={f} seed={a.x} ground={ground}>
          <C emotion={emotion} talk={talk} blink={blinkNow} arms={arms} look={{x: lookX, y: toViewer ? 0 : mood('nod') * 0.3}} squash={squash + land} noLegs={a.noLegs} flip={a.flip} t={f / TOON_FPS} act={act} step={step} />
        </Hold>
      </g>
    </Slot>
  );
};

/** One frozen picture of a scene at a given shot size and lens (for the camera board in the skill). */
export const ShotStill: React.FC<{set: SetName; cast: ToonActor[]; who: string; shot: ShotName; lens: LensName; move?: MoveName; t?: number; talk?: number}> = ({set, cast, who, shot, lens, move = 'static', t = 1.2, talk = 0.6}) => {
  const sh: ToonShot = {id: 'still', set, cast, lines: []};
  const line: Placed = {line: {id: 'x', who, text: ''}, si: 0, li: 1, from: 0, frames: 60, words: []};
  const seg: Seg = {from: 0, to: 60, si: 0, line, who, shot, lens, move, whip: false};
  const cam = camOf(seg, sh, move === 'dutch' ? 40 : 30, null);
  const Set = SETS[set];
  const Fore = FORES[set];
  const tight = shot === 'cu' || shot === 'ecu' || shot === 'ots' || lens === '85' || lens === '135' || lens === 'macro';
  return (
    <AbsoluteFill>
      <Camera {...cam}>
        <Set t={t} />
        {cast.map((a) => {
          const C = (isPerson(a.who) ? PEOPLE[a.who as keyof typeof PEOPLE] : CAST[a.who as CastName]) as React.FC<CharProps>;
          const p = place(a, set);
          const other = cast.find((o) => o.who !== a.who);
          const side = other ? Math.sign(other.x - a.x) : 0;
          return (
            <Slot key={a.who} x={p.cx} y={p.cy} size={a.size} blur={tight && a.who !== who ? LENSES[lens].bg * (shot === 'ots' ? 0.9 : 0.55) : 0}>
              <g transform={a.rot ? `rotate(${a.rot})` : undefined}>
                <C emotion={a.emotion} arms={POSES[a.pose ?? 'rest'][isPerson(a.who) ? 'person' : 'body']} talk={a.who === who ? talk : 0} look={{x: side * 0.8, y: 0}} noLegs={a.noLegs} t={t} act={{turn: side * 0.6, lean: side * 2, shift: a.who === who ? 0.3 : -0.6}} />
              </g>
            </Slot>
          );
        })}
        {Fore && <Fore t={t} />}
      </Camera>
    </AbsoluteFill>
  );
};

export const ToonPlayer: React.FC<ToonProps> = ({toon, timings, sfx, music}) => {
  const f = useCurrentFrame();
  const L = useMemo(() => layoutToon(toon, timings), [toon, timings]);
  const shotAt = [...L.shots].reverse().find((s) => f >= s.from) ?? L.shots[0];
  const shot = shotAt.shot;
  const si = L.shots.indexOf(shotAt);
  const shotLines = L.lines.filter((l) => l.si === si);
  const cur = shotLines.find((l) => f >= l.from && f < l.from + l.frames);
  const Set = SETS[shot.set];
  const Fore = FORES[shot.set];
  const clean = (w: string) => w.replace(/[^\p{L}\p{N}'’!?-]/gu, '');
  const keyOf = (l: Placed) => (l.line.key ?? clean(l.words[l.words.length - 1]?.w ?? '')).toLowerCase();
  const keyFrame = (l: Placed) => { const k = l.words.find((w) => clean(w.w).toLowerCase() === keyOf(l)); return k ? l.from + Math.round(k.start * TOON_FPS) : null; };

  // ---- camera: the director's segment for this frame (a whip pans in from the previous picture)
  const sidx = Math.max(0, L.segs.findIndex((s) => f >= s.from && f < s.to && s.si === si));
  const seg = L.segs.find((s, i) => i === sidx && s.si === si) ?? [...L.segs].reverse().find((s) => s.si === si && s.from <= f) ?? L.segs.find((s) => s.si === si) ?? L.segs[0];
  let cam = camOf(seg, shot, f, keyFrame(seg.line));
  const prevSeg = L.segs[L.segs.indexOf(seg) - 1];
  const wn = f - seg.from;
  if (seg.whip && prevSeg && prevSeg.si === seg.si && wn < 7) {
    const p = camOf(prevSeg, shot, prevSeg.to - 1, null);
    const u = E.inOut(wn / 7);
    cam = clampCam({...cam, zoom: lerp(p.zoom, cam.zoom, u), cx: lerp(p.cx, cam.cx, u), cy: lerp(p.cy, cam.cy, u), rot: lerp(p.rot, cam.rot, u), whip: 46 * Math.sin((Math.PI * wn) / 7)});
  }
  const tight = seg.shot === 'cu' || seg.shot === 'ecu' || seg.shot === 'ots' || seg.lens === '85' || seg.lens === '135' || seg.lens === 'macro';
  const blurOf = (who: string) => (tight && who !== seg.who ? LENSES[seg.lens].bg * (seg.shot === 'ots' ? 0.9 : 0.55) : 0);

  // ---- caption: the word being spoken
  const tl = cur ? (f - cur.from) / TOON_FPS : 0;
  const wi = cur ? cur.words.findIndex((w, i) => tl >= w.start && tl < (cur.words[i + 1]?.start ?? w.end + 0.25)) : -1;
  const word = cur && wi >= 0 ? cur.words[wi] : null;
  const keyWord = cur ? keyOf(cur) : '';

  // ---- sound
  const has = (n: string | undefined): n is string => !!n && sfx.includes(n);
  const events: {at: number; name: string; vol: number}[] = [];
  for (const s of L.shots) if (s.from > 0) events.push({at: s.from, name: 'whoosh-soft', vol: 0.45});
  for (const l of L.lines) {
    const n = l.line.sfx ?? EMO_SFX[l.line.emotion ?? 'neutral'];
    if (n) events.push({at: l.from, name: n, vol: 0.5});
    const kf = keyFrame(l);
    if (kf !== null) events.push({at: kf, name: 'caption-pop', vol: 0.3});
  }
  for (const s of L.segs) {
    if (s.whip) events.push({at: s.from, name: 'whoosh-fast', vol: 0.4});
    else if (s.from !== s.line.from) events.push({at: s.from, name: 'swish', vol: 0.22});
  }
  const talking = (fr: number) => L.lines.some((l) => fr >= l.from && fr < l.from + l.frames - Math.round(GAP * TOON_FPS));
  // music sits about 9 dB under the voice (the level measured on the reference Shorts) and comes up a little in the gaps;
  // the move is smoothed over half a second so it never pumps
  const duck = (fr: number) => { let n = 0; for (let i = -7; i <= 7; i++) n += talking(fr + i) ? 1 : 0; return n / 15; };
  const bed = (fr: number) => (0.6 - 0.16 * duck(fr)) * interpolate(fr, [0, 12], [0, 1], {extrapolateRight: 'clamp'}) * interpolate(fr, [L.total - 24, L.total], [1, 0], {extrapolateLeft: 'clamp'});

  return (
    <AbsoluteFill style={{background: '#1d1430'}}>
      <Camera {...cam}>
        <Set t={f / TOON_FPS} />
        {shot.cast.map((a) => <Actor key={a.who} a={a} shot={shot} shotFrom={shotAt.from} lines={shotLines} f={f} cur={cur} blur={blurOf(a.who)} />)}
        {shot.desk && <OfficeDesk />}
        {Fore && <Fore t={f / TOON_FPS} />}
      </Camera>
      {word && <WordCaption word={clean(word.w)} key_={clean(word.w).toLowerCase() === keyWord} pop={0.72 + 0.28 * E.back(clamp01((tl - word.start) * TOON_FPS / 4))} y={1400} />}
      <Grain />
      {L.lines.map((l) => l.file && <Sequence key={l.line.id} from={l.from} durationInFrames={l.frames + 12}><Audio src={staticFile(l.file)} /></Sequence>)}
      {events.filter((e) => has(e.name)).map((e, i) => <Sequence key={i} from={e.at} durationInFrames={90}><Audio src={staticFile(`toons/sfx/${e.name}.mp3`)} volume={e.vol} /></Sequence>)}
      {music && <Audio src={staticFile(`toons/music/${music}.mp3`)} loop volume={bed} />}
    </AbsoluteFill>
  );
};
