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
import {Camera, type Cam, CAM0, clampCam, H, LENSES, W} from './camera';
import {frameOf, GAP, layoutToon, type LensName, type MoveName, parseCam, type Placed, propFrames, type Seg, SEG, type SetName, type ShotName, stateAt, type Toon, type ToonActor, type ToonLine, type ToonShot, type ToonTimings, TOON_FPS, propReach, type ToonProp, bedAt, soundPlan} from './director';
import {PEOPLE, skeleton, SPECS, jointsOf} from './humans';
import {Grain} from './ink';
import {clamp01, E, kick, lerp, lipsync, ramp, settle, type SpokenWord} from './motion';
import {blendPose, POSES, type PoseName} from './poses';
import {Prop} from './props';
import {armOf, blinkAt, type ArmSpec, type Emotion} from './rig';
import {FLOORS, FORES, OfficeDesk, SETS, WordCaption} from './scenes';
import {STAGE_SPOTS, type StageFace, stageSpotsAt} from './stages';
import {theme} from '../brand/theme';
import {Hold, Slot} from './stage';

export {layoutToon, parseCam, TOON_FPS};
export type {Seg, Toon, ToonActor, ToonLine, ToonShot, ToonTimings};
/** `bare`: the picture only, no caption word (for a cover). */
export type ToonProps = {toon: Toon; timings: ToonTimings | null; sfx: string[]; music: string | null; bare?: boolean};

// ------------------------------------------------------------------ where everybody is
const isPerson = (who: string) => who in SPECS;
const groundOf = (who: string) => (isPerson(who) ? 96 : BLUEPRINTS[who as CastName].ground.y);
/** An actor on screen: slot centre, face centre, face size, top and bottom (all in set pixels). */
const place = (a: ToonActor, set: SetName) => {
  const spot = a.stage ? STAGE_SPOTS[set]?.[a.who] : undefined;
  if (spot) return {cx: spot.x, cy: spot.y, faceX: spot.x, faceY: spot.y, headH: spot.headH, faceW: spot.faceW, top: spot.y - spot.headH * 0.6, bottom: spot.y + spot.headH * 0.7, person: false, size: spot.size};
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

/**
 * The picture a shot size gives for a character (A) talking to another (B). The sizes step
 * clearly (they follow NOMINAL in director.ts): people 1.3 / 1.75 / 2.35 / 3.2 times the wide shot,
 * body characters "whole body" / "face" / "eyes".
 */
const framing = (shot: ShotName, A: Spot, B: Spot | null): {zoom: number; cx: number; cy: number; rot: number} => {
  const dir = B ? Math.sign(B.faceX - A.faceX) || 1 : 1;
  const lead = (z: number) => A.faceX + (dir * 56) / z;
  const z0 = (z: number) => Math.max(1, Math.min(3.3, z));
  const head = (k: number) => z0((k * H) / A.headH); // people: the head fills this share of the frame height
  const body = z0((0.9 * W) / (A.size * 0.82)); // body characters: the whole character fills the width
  const face = z0(Math.max(body * 1.5, Math.min(3, (0.8 * W) / A.faceW))); // ...or the face does
  switch (shot) {
    case 'ews': return {zoom: 1, cx: W / 2, cy: H / 2, rot: 0};
    case 'wide': return {zoom: 1.04, cx: W / 2, cy: H / 2, rot: 0};
    case 'full': {
      const z = z0(A.person ? (0.72 * H) / (A.bottom - A.top) : body * 0.78);
      return {zoom: z, cx: A.cx, cy: (A.top + A.bottom) / 2 + 60 / z, rot: 0};
    }
    case 'two': {
      if (!B) return framing('ms', A, null);
      const z = Math.min(1.25, z0((W * 0.9) / (Math.abs(B.faceX - A.faceX) + (A.faceW + B.faceW) * 1.25)));
      return {zoom: z, cx: (A.faceX + B.faceX) / 2, cy: (A.faceY + B.faceY) / 2 + 250 / z, rot: 0};
    }
    case 'ms': {
      const z = A.person ? head(0.218) : body;
      return {zoom: z, cx: lead(z), cy: A.faceY + (A.person ? 330 : 190) / z, rot: 0};
    }
    case 'cu': {
      const z = A.person ? head(0.394) : face;
      return {zoom: z, cx: A.faceX + (dir * 26) / z, cy: A.faceY + 170 / z, rot: 0};
    }
    case 'ecu': {
      const z = A.person ? head(0.536) : z0(face * 1.3);
      return {zoom: z, cx: A.faceX, cy: A.faceY + 110 / z, rot: 0};
    }
    case 'ots': {
      const z = A.person ? head(0.293) : body;
      return {zoom: z, cx: A.faceX + (dir * 200) / z, cy: A.faceY + 240 / z, rot: 0};
    }
    case 'low': {
      const z = A.person ? head(0.293) : body;
      return {zoom: z, cx: lead(z), cy: A.faceY + 330 / z, rot: -dir * 2.4};
    }
    default: { // mcu
      const z = A.person ? head(0.293) : body;
      return {zoom: z, cx: lead(z), cy: A.faceY + 250 / z, rot: 0};
    }
  }
};

/** Everything the camera does on frame `f` of segment `s` (without the whip from the previous picture). */
const camOf = (s: Seg, shot: ToonShot, f: number, keyAt: number | null): Cam => {
  if (!shot.cast?.length) return {...CAM0, lens: s.lens}; // a time card
  const a = shot.cast.find((o) => o.who === s.who) ?? shot.cast[0];
  const other = shot.cast.find((o) => o.who !== a.who);
  const A = place(a, shot.set);
  const B = other ? place(other, shot.set) : null;
  const base = framing(s.shot, A, B);
  const dir = B ? Math.sign(B.faceX - A.faceX) || 1 : 1;
  const n = f - s.from;
  const u = clamp01(n / Math.max(1, s.to - s.from));
  const c: Cam = {...CAM0, ...base, lens: s.lens};
  const io = (v: number) => E.inOut(clamp01(v));
  switch (s.move) {
    case 'lock': break; // nothing moves: the action is inside the picture
    case 'push': c.zoom *= 1 + 0.06 * u; break;
    case 'pull': c.zoom *= 1.07 - 0.065 * u; break;
    case 'truck': c.cx += (dir * lerp(-46, 46, u)) / c.zoom; c.zoom *= 1.035 + 0.025 * u; break;
    case 'tilt': c.cy += ((1 - io(n / 40)) * 300) / c.zoom; c.zoom *= 1 + 0.03 * u; break;
    // a crash zoom is a fast move, but an eased one: it runs in over a third of a second
    case 'crash': c.zoom *= lerp(0.86, 1, io(n / 11)) * (1 + 0.03 * u); break;
    // a tilted horizon, held still (no swing, no shake)
    case 'dutch': c.rot += dir * 2.6; c.zoom *= 1.05 + 0.04 * u; break;
    // the only move that shakes, and only when the script asks for it
    case 'shake': c.sx = 12 * Math.exp(-n / 6) * Math.sin(n * 1.9); c.sy = 9 * Math.exp(-n / 6) * Math.sin(n * 2.3); c.zoom *= 1.02 + 0.03 * u; break;
    case 'rack': c.soft = Math.max(0, 7 * (1 - io(n / 10))); c.zoom *= 1 + 0.04 * u; break;
    default: c.zoom *= 1 + 0.014 * u;
  }
  // the key word gets a small, soft push: it swells over a quarter of a second and eases back
  if (keyAt !== null && keyAt >= s.from + 6 && f >= keyAt) {
    const t = f - keyAt;
    c.zoom *= 1 + 0.022 * (t < 8 ? io(t / 8) : Math.exp(-(t - 8) / 12));
  }
  return clampCam(c);
};

/** The picture on frame `f`: which segment the director is on and everything the camera does. */
export const cameraAt = (L: ReturnType<typeof layoutToon>, f: number): {cam: Cam; seg: Seg} => {
  const shotAt = [...L.shots].reverse().find((s) => f >= s.from) ?? L.shots[0];
  const si = L.shots.indexOf(shotAt);
  const shot = shotAt.shot;
  const clean = (w: string) => w.replace(/[^\p{L}\p{N}'’!?-]/gu, '');
  const keyFrame = (l: Placed) => { const kw = (l.line.key ?? clean(l.words[l.words.length - 1]?.w ?? '')).toLowerCase(); const k = l.words.find((w) => clean(w.w).toLowerCase() === kw); return k ? l.from + Math.round(k.start * TOON_FPS) : null; };
  // the picture that started last in this scene (in the pause before the next scene it simply holds)
  const seg = [...L.segs].reverse().find((s) => s.si === si && s.from <= f) ?? L.segs.find((s) => s.si === si) ?? L.segs[0];
  let cam = camOf(seg, shot, f, L.steady ? null : keyFrame(seg.line));
  const prevSeg = L.segs[L.segs.indexOf(seg) - 1];
  const wn = f - seg.from;
  if (seg.whip && prevSeg && prevSeg.si === seg.si && wn < 9) { // only when the script asks: "cam": "whip"
    const p = camOf(prevSeg, shot, prevSeg.to - 1, null);
    const u = E.inOut(wn / 9);
    cam = clampCam({...cam, zoom: lerp(p.zoom, cam.zoom, u), cx: lerp(p.cx, cam.cx, u), cy: lerp(p.cy, cam.cy, u), rot: lerp(p.rot, cam.rot, u), whip: 40 * Math.sin((Math.PI * wn) / 9)});
  }
  return {cam, seg};
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

/** Poses a character keeps after its line; every other pose is a gesture that goes back to the scene's pose. */
const HELD: PoseName[] = ['rest', 'think', 'heart', 'hips', 'crossed', 'belly', 'fists'];
/** Everything a character is doing on frame `f`: face, eyes, arms, body. */
const acting = (a: ToonActor, shot: ToonShot, lines: Placed[], f: number, cur: Placed | undefined) => {
  const person = isPerson(a.who);
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
  // a gesture is let go a moment after the line that made it; a held pose (a hand on the chin, the
  // chest, the hips) stays until the character's next line
  const base = poseOf(a.pose);
  const letGo = (l: Placed | undefined) => (l && !HELD.includes(l.line.pose ?? 'rest') ? l.from + l.frames + 8 : null);
  const beforeGone = letGo(before);
  const from = !before ? base : now && beforeGone !== null && now.from >= beforeGone + 14 ? base : poseOf(before.line.pose);
  const to = poseOf(now ? now.line.pose : a.pose);
  const gone = letGo(now);
  // a gesture takes 12 frames, starts and ends softly (the motion check measured the old 10-frame snap at 140 px in one frame)
  const into = clamp01(now ? (f - now.from) / 12 : 1);
  let posed = now ? blendPose(from, to, into * into * (3 - 2 * into)) : to;
  if (gone !== null && f > gone) { const k = clamp01((f - gone) / 14); posed = blendPose(to, base, k * k * (3 - 2 * k)); }
  const arms = posed.map((sp, i) => {
    const s = armOf(sp as ArmSpec);
    const way = s.f ?? s.a;
    const up = way < 20 || way > 160; // a raised or gesturing arm beats more than a hanging one
    const d = (i === 0 ? 1 : -1) * beat * (s.front ? 1.5 : up ? 7 : 3); // a hand resting on the body barely moves
    return s.u !== undefined && s.f !== undefined ? {...s, a: s.a + d, u: s.u + d * 0.35, f: s.f + d} : {...s, a: s.a + d};
  }) as [ArmSpec, ArmSpec];
  const talk = speaking && cur ? lipsync(cur.words, (f - cur.from) / TOON_FPS) : 0;
  // eyes: look at whoever is talking; the speaker looks at the listener and sometimes at the viewer
  const others = shot.cast.filter((o) => o.who !== a.who);
  const target = speaking || !cur ? others[0] : shot.cast.find((o) => o.who === cur.line.who);
  const me = place(a, shot.set);
  const it = target ? place(target, shot.set) : null;
  const side = it ? Math.sign(it.faceX - me.faceX) * (a.flip ? -1 : 1) : 0;
  // characters on a stage sit above and below each other, so their eyes follow the real direction
  const up = it && a.stage ? Math.max(-1, Math.min(1, (it.faceY - me.faceY) / 300)) : 0;
  // a glance at the viewer eases in and out (about once every three seconds while speaking)
  const ph = (f + seed) % 90;
  const glance = speaking ? ramp(ph, 62, 86, 6) : 0;
  const lookX = (a.stage ? side * 0.45 : side * 0.8) * (1 - glance);
  // how much this character is "the one talking" right now: eased at both ends of each of its lines
  const voice = lines.filter((l) => l.line.who === a.who).reduce((m, l) => Math.max(m, ramp(f, l.from - 3, l.from + l.frames - 2, 9)), 0);
  // body: the mood sets the stance; speech adds nods and a forward lean; listeners shift their weight
  const m0 = EMO_ACT[prevEmotion];
  const m1 = EMO_ACT[emotion];
  const mk = E.back(clamp01((f - emotionFrom) / 12));
  const mood = (k: keyof typeof m1) => lerp(m0[k], m1[k], mk);
  const take = emotion === 'shocked' || emotion === 'scared';
  const act: Act = {
    lean: side * mood('lean') * lerp(0.7, 1.25, voice) + kick(f, emotionFrom, 2, 0.8, 0.22) * (take ? -side : 0),
    tilt: side * mood('tilt') * 0.8 + (1 - voice) * hop(f, 96, seed, 18) * 2.4,
    nod: mood('nod') + beat * 0.55 + (1 - voice) * (cur ? Math.max(0, Math.sin((f + seed) / 11)) ** 6 * 0.5 : 0),
    turn: side * 0.62 * (1 - glance),
    // a slow change of the standing leg every 6 seconds or so; never a quick sidestep
    shift: person ? lerp(0.6, 0.2, voice) * hop(f, 190, seed + 3, 40) : 0,
    shrug: mood('shrug') * (0.6 + 0.4 * beat),
    // people keep their hips still when they talk (the beat goes to the head, the shoulders and the hands)
    bob: person ? 0 : -beat * (emotion === 'happy' || emotion === 'angry' ? 3.4 : 1.6),
  };
  // a "take" when the emotion changes and a nudge when starting to speak: both swell from zero
  // people do not squash and stretch like the round body characters: a little goes a long way on legs
  const squash = (kick(f, emotionFrom, take ? 0.24 : 0.11, 0.9, 0.26) + (speaking && cur ? kick(f, cur.from, 0.06, 1, 0.34) : 0)) * (person ? 0.3 : 1);
  const blink = Math.max(blinkAt(f, TOON_FPS, seed), f - emotionFrom >= 0 && f - emotionFrom < 5 ? 1 - Math.abs(f - emotionFrom - 2) / 3 : 0);
  return {emotion, emotionFrom, talk, blink, arms, act, squash, look: {x: lookX, y: (a.stage ? up * 0.7 : mood('nod') * 0.3) * (1 - glance)}};
};

/** The part of the picture a character's head takes up (hair included for people), in screen pixels. `state` = the stage's state (its own characters move with it); null = not in the picture. */
export const headBox = (a: ToonActor, set: SetName, state?: Record<string, number>) => {
  let sp = place(a, set);
  if (a.stage && state) {
    const live = stageSpotsAt(set, state)[a.who];
    if (live === null) return null;
    if (live) sp = {...sp, faceX: live.x, faceY: live.y, faceW: live.faceW, headH: live.headH};
  }
  const k = sp.person ? [0.82, 0.86, 0.62] : [0.62, 0.6, 0.6]; // half-width, up, down, in face widths / head heights
  return {who: a.who, x0: sp.faceX - sp.faceW * k[0], x1: sp.faceX + sp.faceW * k[0], y0: sp.faceY - sp.headH * k[1], y1: sp.faceY + sp.headH * k[2], cx: sp.faceX, cy: sp.faceY};
};
/**
 * Where a prop is drawn. A thought bubble with `of` sits above its owner's head, toward the middle
 * of the picture, inside the frame, with its tail toward the owner (`flip` mirrors the cloud when the
 * owner stands on the right). A mark with `on: "bubble"` rides on the bubble before it. Everything
 * else stays where the script put it.
 */
export const propSpot = (p: ToonProp, shot: ToonShot): {x: number; y: number; flip: boolean} => {
  if (p.on === 'bubble') {
    const all = shot.props ?? [];
    const host = all.slice(0, all.indexOf(p)).reverse().find((q) => q.bubble);
    if (host) { const h = propSpot(host, shot); return {x: h.x + (p.dx ?? 0), y: h.y + (p.dy ?? 0), flip: false}; }
  }
  const owner = p.of ? shot.cast.find((a) => a.who === p.of) : undefined;
  const hb = owner ? headBox(owner, shot.set) : null;
  if (!hb) return {x: p.x ?? W / 2, y: p.y ?? H / 2, flip: false};
  const u = p.size / 200;
  const [l, up, r, down] = propReach(p).map((v) => v * u);
  const right = hb.cx > W / 2; // the owner stands on the right: the cloud goes up-left of them
  const x = Math.max(l + 24, Math.min(W - r - 24, right ? hb.x0 + l * 0.2 : hb.x1 - l * 0.2));
  const y = Math.max(up + 130, hb.y0 - down - 12); // above the head, below the top edge that the app's own buttons use
  return {x, y, flip: right};
};

/** How a character comes into its scene on frame `n` of the scene: an offset, a step phase, a scale. */
const entrance = (a: ToonActor, n: number) => {
  let dx = 0;
  let dy = 0;
  let step = 0;
  let scale = 1;
  if (a.enter === 'walk' && n < 30) { const u = E.out(n / 30); dx = (a.x < W / 2 ? -1 : 1) * (1 - u) * (a.size * 0.9 + 200); step = Math.sin(n * 0.8) * (1 - u); }
  if (a.enter === 'drop' && n < 22) { dy = -(1 - E.in(clamp01(n / 14))) * 1400; }
  if (a.enter === 'pop' && n < 12) scale = E.back(clamp01(n / 12));
  return {dx, dy, step, scale};
};

/**
 * Every person on screen on frame `f`, with each joint in screen pixels (before the camera).
 * The motion check walks through a script frame by frame with this and reports anything that jumps.
 */
export const bodiesAt = (L: ReturnType<typeof layoutToon>, f: number) => {
  const shotAt = [...L.shots].reverse().find((s) => f >= s.from) ?? L.shots[0];
  const shot = shotAt.shot;
  const si = L.shots.indexOf(shotAt);
  if (shot.card !== undefined) return {si, bodies: []};
  const lines = L.lines.filter((l) => l.si === si);
  const cur = lines.find((l) => f >= l.from && f < l.from + l.frames);
  const bodies = (shot.cast ?? []).filter((a) => !a.stage && isPerson(a.who)).map((a) => {
    const sp = SPECS[a.who as keyof typeof SPECS];
    const A = acting(a, shot, lines, f, cur);
    const en = entrance(a, f - shotAt.from);
    const J = jointsOf(sp, {act: A.act, arms: A.arms, step: en.step});
    const {cx, cy} = place(a, shot.set);
    const h = sp.height ?? 1;
    const u = a.size / 200;
    const px = ([x, y]: [number, number]): [number, number] => [cx + en.dx + x * h * u * (a.flip ? -1 : 1), cy + en.dy + (96 + (y - 96) * h) * u];
    const arm = (i: 0 | 1) => (J.arms ? {shoulder: px(J.fromTorso(J.arms[i].S)), elbow: px(J.fromTorso(J.arms[i].E)), wrist: px(J.fromTorso(J.arms[i].W))} : null);
    return {who: a.who, walking: en.step !== 0 || en.dx !== 0 || en.dy !== 0, hip: px(J.hip), legs: J.legs.map((l) => ({hip: px(l.hp), knee: px(l.kn), ankle: px(l.an)})), arms: [arm(0), arm(1)]};
  });
  return {si, bodies};
};

const Actor: React.FC<{a: ToonActor; shot: ToonShot; shotFrom: number; lines: Placed[]; f: number; cur: Placed | undefined; blur: number}> = ({a, shot, shotFrom, lines, f, cur, blur}) => {
  const C = (isPerson(a.who) ? PEOPLE[a.who as keyof typeof PEOPLE] : CAST[a.who as CastName]) as React.FC<CharProps>;
  const {cx, cy} = place(a, shot.set);
  const A = acting(a, shot, lines, f, cur);
  const ground = groundOf(a.who);
  const {dx, dy, step, scale} = entrance(a, f - shotFrom);
  const land = a.enter === 'drop' ? settle(f, shotFrom + 14, 0.5, 1.1, 0.3) : 0;
  return (
    <Slot x={cx + dx} y={cy + dy} size={a.size} blur={blur}>
      <g transform={`${a.rot ? `rotate(${a.rot + kick(f, A.emotionFrom, 3, 0.8, 0.25)})` : ''} ${scale !== 1 ? `scale(${scale})` : ''}`}>
        <Hold frame={f} seed={a.x} ground={ground}>
          <C emotion={A.emotion} talk={A.talk} blink={A.blink} arms={A.arms} look={A.look} squash={A.squash + land} noLegs={a.noLegs} flip={a.flip} t={f / TOON_FPS} act={A.act} step={step} />
        </Hold>
      </g>
    </Slot>
  );
};

/** A time card: the story jumps ahead ("LATER THAT NIGHT..."). Our own look: night blue, amber words, a ticking clock. */
const TimeCard: React.FC<{text: string; n: number; frames: number}> = ({text, n, frames}) => {
  const k = E.back(clamp01(n / 8));
  const out = clamp01((frames - n) / 5);
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 42%, #2b3a78 0%, #141a3c 70%)', alignItems: 'center', justifyContent: 'center', opacity: out}}>
      <svg width={220} height={220} viewBox="-110 -110 220 220" style={{transform: `scale(${k})`, marginBottom: 40}}>
        <circle r={96} fill="#fffdf6" stroke="#ffc93c" strokeWidth={14} />
        {Array.from({length: 12}).map((_, i) => <path key={i} d="M0 -80 V-66" stroke="#55608c" strokeWidth={i % 3 === 0 ? 8 : 4} strokeLinecap="round" transform={`rotate(${i * 30})`} />)}
        <path d="M0 6 V-46" stroke="#1d2b4f" strokeWidth={11} strokeLinecap="round" transform={`rotate(${120 + n * 9})`} />
        <path d="M0 8 V-66" stroke="#1d2b4f" strokeWidth={7} strokeLinecap="round" transform={`rotate(${n * 62})`} />
        <circle r={9} fill="#ea4a55" />
      </svg>
      <div style={{fontFamily: theme.font, fontWeight: 900, fontSize: 92, lineHeight: 1.08, color: '#ffc93c', textAlign: 'center', padding: '0 70px', letterSpacing: 1, transform: `scale(${k}) rotate(-2deg)`, textShadow: '0 8px 0 rgba(0,0,0,0.35)'}}>{text.toUpperCase()}</div>
    </AbsoluteFill>
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

export const ToonPlayer: React.FC<ToonProps> = ({toon, timings, sfx, music, bare = false}) => {
  const f = useCurrentFrame();
  const L = useMemo(() => layoutToon(toon, timings), [toon, timings]);
  const shotAt = [...L.shots].reverse().find((s) => f >= s.from) ?? L.shots[0];
  const shot = shotAt.shot;
  const si = L.shots.indexOf(shotAt);
  const shotLines = L.lines.filter((l) => l.si === si);
  const cur = shotLines.find((l) => f >= l.from && f < l.from + l.frames);
  const Set = SETS[shot.set];
  const look = shot.set === 'clinic' || shot.set === 'home' ? toon.rooms?.[shot.set] : undefined; // this video's own room
  const Fore = FORES[shot.set];
  // a stage draws some characters itself (the organ's own face, the pill): hand it what they are doing
  const faces: Record<string, StageFace> = {};
  for (const a of shot.cast ?? []) {
    if (!a.stage) continue;
    const A = acting(a, shot, shotLines, f, cur);
    faces[a.who] = {emotion: A.emotion, talk: A.talk, blink: A.blink, look: A.look, arms: A.arms, squash: A.squash, lean: A.act.lean ?? 0, nod: A.act.nod ?? 0};
  }
  const state = stateAt(L, si, f);
  const flash = (shot.events ?? []).reduce((m, e) => { const n = f - frameOf(L, si, e.at, e.word, e.delay); return e.fx && n >= 0 && n < 9 ? Math.max(m, 1 - n / 9) : m; }, 0);
  const clean = (w: string) => w.replace(/[^\p{L}\p{N}'’!?-]/gu, '');
  const keyOf = (l: Placed) => (l.line.key ?? clean(l.words[l.words.length - 1]?.w ?? '')).toLowerCase();
  const keyFrame = (l: Placed) => { const k = l.words.find((w) => clean(w.w).toLowerCase() === keyOf(l)); return k ? l.from + Math.round(k.start * TOON_FPS) : null; };

  // ---- camera
  const {cam, seg} = cameraAt(L, f);
  const tight = seg.shot === 'cu' || seg.shot === 'ecu' || seg.shot === 'ots' || seg.lens === '85' || seg.lens === '135' || seg.lens === 'macro';
  const blurOf = (who: string) => (tight && who !== seg.who ? LENSES[seg.lens].bg * (seg.shot === 'ots' ? 0.9 : 0.55) : 0);

  // ---- caption: the word being spoken
  const tl = cur ? (f - cur.from) / TOON_FPS : 0;
  const wi = cur ? cur.words.findIndex((w, i) => tl >= w.start && tl < (cur.words[i + 1]?.start ?? w.end + 0.25)) : -1;
  const word = cur && wi >= 0 ? cur.words[wi] : null;
  const keyWord = cur ? keyOf(cur) : '';

  // ---- sound
  const has = (n: string | undefined): n is string => !!n && sfx.includes(n);
  const events = soundPlan(L); // a few story sounds, kept apart and well under the voice (director.ts, "a calm mix")
  const bed = (fr: number) => bedAt(L, fr);

  return (
    <AbsoluteFill style={{background: '#1d1430'}}>
      {shot.card ? <TimeCard text={shot.card} n={f - shotAt.from} frames={shotAt.frames} /> : (
        <Camera {...cam}>
          <Set t={f / TOON_FPS} state={state} faces={faces} label={shot.label} look={look} />
          {shot.cast.filter((a) => !a.stage).map((a) => <Actor key={a.who} a={a} shot={shot} shotFrom={shotAt.from} lines={shotLines} f={f} cur={cur} blur={blurOf(a.who)} />)}
          {shot.desk && <OfficeDesk />}
          {(shot.props ?? []).map((p, i) => {
            const [a, end] = propFrames(L, si, p);
            if (f < a || f >= end) return null;
            const k = Math.min(E.back(clamp01((f - a) / 9)), clamp01((end - f) / 5));
            const spot = propSpot(p, shot);
            return (
              <Slot key={i} x={spot.x} y={spot.y} size={p.size}>
                <g transform={`rotate(${(p.rot ?? 0) + kick(f, a, 4, 0.9, 0.3)}) scale(${k.toFixed(3)})`}><Prop kind={p.kind} t={f / TOON_FPS} halo={p.halo} bubble={p.bubble} no={p.no} text={p.text} flip={spot.flip} /></g>
              </Slot>
            );
          })}
          {Fore && <Fore t={f / TOON_FPS} look={look} />}
        </Camera>
      )}
      {flash > 0 && <AbsoluteFill style={{background: '#ffffff', opacity: flash * 0.3}} />}
      {word && !bare && <WordCaption word={clean(word.w)} key_={clean(word.w).toLowerCase() === keyWord} pop={0.72 + 0.28 * E.back(clamp01((tl - word.start) * TOON_FPS / 4))} y={L.steady ? 1470 : 1400} plain={L.steady} />}
      <Grain />
      {L.lines.map((l) => l.file && <Sequence key={l.line.id} from={l.from} durationInFrames={l.frames + 12}><Audio src={staticFile(l.file)} /></Sequence>)}
      {events.filter((e) => has(e.name)).map((e, i) => <Sequence key={i} from={e.at} durationInFrames={90}><Audio src={staticFile(`toons/sfx/${e.name}.mp3`)} volume={e.vol} /></Sequence>)}
      {music && <Audio src={staticFile(`toons/music/${music}.mp3`)} loop volume={bed} />}
    </AbsoluteFill>
  );
};

/**
 * The cover for a Toon's upload: the video itself with a short hook over the quiet lower part.
 * Render ONE frame of it (`remotion still ToonCover --frame=N`); `accent` = the word of the hook
 * shown in amber.
 */
export const ToonCover: React.FC<ToonProps & {text: string; accent?: string}> = ({toon, timings, text, accent}) => {
  const ring = Array.from({length: 16}, (_, i) => `${(Math.cos((i / 16) * Math.PI * 2) * 9).toFixed(1)}px ${(Math.sin((i / 16) * Math.PI * 2) * 9).toFixed(1)}px 0 #1d2b4f`).join(', ');
  const words = text.split(' ');
  return (
    <AbsoluteFill style={{background: '#1d1430'}}>
      <ToonPlayer toon={toon} timings={timings} sfx={[]} music={null} bare />
      <AbsoluteFill style={{background: 'linear-gradient(rgba(20,16,48,0) 56%, rgba(20,16,48,0.86) 84%)'}} />
      <div style={{position: 'absolute', left: 60, right: 60, top: 1300, height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontFamily: theme.font, fontWeight: 900, fontSize: text.length > 22 ? 118 : 134, lineHeight: 1.06, letterSpacing: 0.5, textShadow: `${ring}, 0 14px 0 rgba(29,43,79,0.55)`}}>
        <span>{words.map((w, i) => <span key={i} style={{color: accent && w.replace(/[^\p{L}\p{N}]/gu, '').toLowerCase() === accent.toLowerCase() ? '#ffc93c' : '#ffffff'}}>{w}{i < words.length - 1 ? ' ' : ''}</span>)}</span>
      </div>
    </AbsoluteFill>
  );
};
