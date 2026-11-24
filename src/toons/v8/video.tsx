/**
 * MedPeak Toons, look v8: the video player (1080 x 1920, 60 frames a second).
 * It reads the same toon.json and voice timings as the old player (director.ts lays the lines out), and
 * plays each shot with the v8 scene registered for it (a `ShotDef`, see play.tsx). The player owns the
 * camera, the caption, the voices, the sound effects and the music; a shot owns its picture and its motion.
 */
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {bedAt, captionStyle, frameOf, isV9, kindOf, layoutToon, lineSeconds, soundPlan, stateAt, TOON_FPS, WPS6, type Layout, type Toon, type ToonTimings} from '../director';
import {setImpacts, type ImpactMode} from './act';
import {FONT, INK_ZOOM_CLASS, INK_ZOOM_CSS, inkZoomVars, V9} from './kit';
import {captionShows, CTA9_AT, CTA9_SECONDS, CtaCardV4, CtaCardV9, TimeCard, Watermark, WatermarkV9, WordCaption, type CtaAt, type CtaPoint, type HudBox} from './hud';
import {clamp01, go, lerp, ScreenSpace, V8_FPS, type Focus, type LineNow, type ShotDef, type ShotNow} from './play';
import {RABIES_CTA, RABIES_SHOTS} from './rabies';
import {NO_SLEEP_CTA, NO_SLEEP_SHOTS} from './no-sleep';
import {CREATINE_CTA, CREATINE_SHOTS} from './creatine';
import {QUIT_SUGAR_CTA, QUIT_SUGAR_SHOTS} from './quit-sugar';
import {FASTING_CTA, FASTING_SHOTS} from './fasting';
import {SNAKE_BITE_CTA, SNAKE_BITE_SHOTS} from './snake-bite';
import {QUIT_SMOKING_CTA, QUIT_SMOKING_SHOTS} from './quit-smoking';
import {BEE_STING_CTA, BEE_STING_SHOTS} from './bee-sting';

export type V8VideoProps = {toon: Toon; timings: ToonTimings | null; sfx: string[]; music: string | null; bare?: boolean; /** a still (the cover): draw this frame, whatever frame is being rendered */ frameAt?: number;
  /** the impact policy (act.tsx): 'v9' for format 6; a video already out may be drawn with 'v9' for a before/after sample */ impacts?: ImpactMode};
/**
 * Engine v9 (format 6): play.tsx's ShotNow carries `pass`, `state`, `v9` and every line its `key` word, and ShotDef its
 * `punch`, `kind`, `stage`, `faces` (plans/.../08-c-to-a.md items 1-3). These names stay so format-6 shot files that
 * imported them keep working.
 */
export type ShotNow9 = ShotNow & {pass: number; state: Record<string, number>};
export type ShotDef9 = ShotDef;

/** The shots of each video, by the video's slug and the shot's id. */
export const V8_VIDEOS: Record<string, Record<string, ShotDef>> = {rabies: RABIES_SHOTS, 'no-sleep': NO_SLEEP_SHOTS, creatine: CREATINE_SHOTS, 'quit-sugar': QUIT_SUGAR_SHOTS, fasting: FASTING_SHOTS, 'snake-bite': SNAKE_BITE_SHOTS, 'quit-smoking': QUIT_SMOKING_SHOTS, 'bee-sting': BEE_STING_SHOTS};
/** The CTA end card of each video (three strong points). */
/** v4 (2026-11-20): the narrator (Joey, the same voice in every video) reads the card; `at` holds the second
 * of each beat in his clip (headline, the three points, the follow line), `voice` the clip, `seconds` its length. */
export type V8Cta = {title: string; points: CtaPoint[]; voice?: string; seconds?: number; at?: CtaAt};
export const V8_CTA: Record<string, V8Cta> = {rabies: RABIES_CTA, 'no-sleep': NO_SLEEP_CTA, creatine: CREATINE_CTA, 'quit-sugar': QUIT_SUGAR_CTA, fasting: FASTING_CTA, 'snake-bite': SNAKE_BITE_CTA, 'quit-smoking': QUIT_SMOKING_CTA, 'bee-sting': BEE_STING_CTA};
/** The narrator starts after the card has slid in; the card holds a moment after his last word. */
/** The music bed 10% lower than the director's levels (the owner, 2026-11-21: "background music 10% decrease"). */
export const MUSIC_LEVEL = 0.9;
export const CTA_LEAD = 0.4, CTA_TAIL = 1.2; // the narrator's last word is never cut; keep the sum in step with CTA_PAD in pipeline/toon-check.mjs
export const ctaSeconds = (c: V8Cta | undefined, v9 = false) => (!c ? 0 : v9 ? Math.max(CTA9_SECONDS, CTA_LEAD + (c.seconds ?? 0) + CTA_TAIL) : CTA_LEAD + (c.seconds ?? 4) + CTA_TAIL);
type CtaClip = {voice: string; seconds: number; words: {w: string; start: number}[]};
/**
 * A video's end card WITH its narrator: the card's look from the video's code, the voice and its real beats from the paid clip
 * (toon.ctaClip, put in by the render from videos/<slug>/cta-timings.json). The beats: each point lands on the first word of its
 * bold text that Joey says after the last beat; the follow line on "Follow".
 */
export const ctaOf = (toon: Toon): V8Cta | undefined => {
  const c = V8_CTA[toon.slug];
  const clip = (toon as Toon & {ctaClip?: CtaClip}).ctaClip;
  if (!c || !clip) return c;
  const bare = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, '');
  const W = clip.words.map((w) => ({w: bare(w.w), t: w.start}));
  let from = 0;
  const find = (cands: string[], dflt: number) => {
    for (let i = from; i < W.length; i++) if (cands.includes(W[i].w)) { from = i + 1; return W[i].t; }
    return dflt;
  };
  const small = new Set(['a', 'an', 'the', 'no', 'of', 'to', 'in', 'is', 'and', 'than']);
  const points = c.points.map((p, i) => find(p.big.split(/\s+/).map(bare).filter((w) => w && !small.has(w)), c.at ? c.at.points[i] : 2 + i * 2.6)) as [number, number, number];
  const follow = find(['follow'], c.at ? c.at.follow : clip.seconds - 3);
  return {...c, voice: clip.voice, seconds: clip.seconds, at: {head: 0, points, follow}};
};

const K = V8_FPS / TOON_FPS; // the layout counts 30 frames a second; the video runs at 60
export const v8Frames = (toon: Toon, timings: ToonTimings | null) => Math.round((layoutToon(toon, timings).total / TOON_FPS + ctaSeconds(ctaOf(toon), isV9(toon))) * V8_FPS);

/** A shot's "now" (play.tsx) at second `sec` of the video. */
export const shotNow = (L: Layout, toon: Toon, timings: ToonTimings | null, sec: number): {s: ShotNow9; si: number} => {
  const f = sec * TOON_FPS;
  const at = [...L.shots].reverse().find((x) => f >= x.from) ?? L.shots[0];
  const si = L.shots.indexOf(at);
  const t0 = at.from / TOON_FPS;
  const mine = L.lines.filter((l) => l.si === si);
  const lines: (LineNow & {key?: string})[] = mine.map((l, i) => ({
    id: l.line.id, who: l.line.who, text: l.line.text, key: l.line.key,
    from: l.from / TOON_FPS - t0,
    to: (mine[i + 1]?.from ?? at.from + at.frames) / TOON_FPS - t0,
    voice: lineSeconds(l.line, timings, isV9(toon) ? WPS6 : undefined),
    emotion: l.line.emotion, pose: l.line.pose, react: (l.line as {react?: Record<string, string>}).react,
    words: l.words,
  }));
  const t = sec - t0;
  const past = lines.filter((l) => l.from <= t);
  const pass = L.shots.slice(0, si + 1).filter((x) => x.shot.id === at.shot.id).length;
  const v9 = isV9(toon);
  return {s: {id: at.shot.id, t, dur: at.frames / TOON_FPS, lines, cur: past.length ? past[past.length - 1] : null, pass, state: stateAt(L, si, f), ...(v9 ? {v9} : {})}, si};
};

// ------------------------------------------------------------------ the camera
// A calm camera (the script says `camera: steady`): it leans a little toward whoever speaks and creeps in;
// it never crops a shot so far that a room stops reading. Sizes are the director's shot names.
const ZOOM: Record<string, number> = {ews: 1, wide: 1, full: 1.02, two: 1.03, ms: 1.06, mcu: 1.1, cu: 1.14, ecu: 1.18, ots: 1.08, low: 1.06};
type Cam = {z: number; x: number; y: number};
const camFor = (size: string, face: Focus | null, k: number): Cam => {
  const z = (ZOOM[size] ?? 1.08) * (1 + 0.025 * k);
  if (!face) return {z, x: 540, y: 960};
  // put the face a little above the middle of the screen, as far as the frame allows
  return {z, x: lerp(540, face.x, 0.5), y: lerp(960, face.y + 250 / z, 0.5)};
};
const clampCam = (c: Cam): Cam => {
  const hw = 540 / c.z, hh = 960 / c.z;
  return {z: c.z, x: Math.min(1080 - hw, Math.max(hw, c.x)), y: Math.min(1920 - hh, Math.max(hh, c.y))};
};
/** No lean or zoom may cut a face: keep every person of the shot inside the picture (zoom out if they do not fit). */
const keepIn = (c: Cam, faces: Focus[]): Cam => {
  if (!faces.length) return clampCam(c);
  const x0 = Math.min(...faces.map((f) => f.x - f.r * 1.3)), x1 = Math.max(...faces.map((f) => f.x + f.r * 1.3));
  const top = Math.min(...faces.map((f) => f.y - f.r * 1.6));
  const z = Math.max(1, Math.min(c.z, 1080 / Math.max(1, x1 - x0)));
  const hw = 540 / z, hh = 960 / z;
  const lo = x1 - hw, hi = x0 + hw; // the camera's middle must lie between these to show both ends
  const x = lo > hi ? (x0 + x1) / 2 : Math.min(hi, Math.max(lo, c.x));
  return clampCam({z, x, y: Math.min(c.y, top + hh)});
};
const cameraAt = (L: Layout, def: ShotDef | undefined, s: ShotNow, si: number, sec: number): Cam => {
  if (def?.view) return clampCam(def.view(s));
  const f = sec * TOON_FPS;
  const segs = L.segs.filter((g) => g.si === si);
  // past the last segment (the shot's tail) keep the LAST framing, never jump back to the first one
  const found = segs.findIndex((g) => f >= g.from && f < g.to);
  const i = found >= 0 ? found : segs.length && f >= segs[segs.length - 1].from ? segs.length - 1 : 0;
  const of = (j: number): Cam => {
    const g = segs[j];
    if (!g || !def) return {z: 1, x: 540, y: 960};
    return clampCam(camFor(g.shot, def.focus(g.who, s), clamp01((f - g.from) / Math.max(1, g.to - g.from))));
  };
  const people = def ? L.shots[si].shot.cast.filter((p) => !p.stage).map((p) => def.focus(p.who, s)) : [];
  const now = keepIn(of(i), people);
  if (i === 0) return now;
  const k = go(sec, segs[i].from / TOON_FPS, 0.22); // a quick glide from the picture before, not a jump
  const was = of(i - 1);
  return keepIn({z: lerp(was.z, now.z, k), x: lerp(was.x, now.x, k), y: lerp(was.y, now.y, k)}, people);
};

/**
 * v4: rooms get one smooth, eased move per shot: the lean toward the speaker is averaged over 2.4 s (inside
 * the shot), so the camera glides instead of stepping from one speaker to the next. Body shots keep their view.
 * Used for the shot on screen AND for the shot a transition leaves, so the picture never jumps between them.
 */
const smoothCam = (L: Layout, toon: Toon, timings: ToonTimings | null, def: ShotDef | undefined, si: number, sec: number): Cam => {
  const n0 = shotNow(L, toon, timings, sec);
  if (!def || def.view) return cameraAt(L, def, n0.s, si, sec);
  // b: the shot's LAST frame (a sample past it would fall outside every camera segment and jump)
  const a = L.shots[si].from / TOON_FPS, b = (L.shots[si].from + L.shots[si].frames - 1) / TOON_FPS;
  // 2026-11-21 (the owner: "frame jiggle"): the samples sit on a FIXED time grid and each weighs by its distance from
  // `sec` (a tent 1.4 s wide). Samples that moved with `sec` made the picture step every 0.2 s whenever one crossed a
  // change of framing (a 5 Hz jitter in every room). On the grid every weight changes smoothly.
  const STEP = 0.1, HALF = 1.4;
  const g0 = Math.ceil((sec - HALF) / STEP);
  let wx = 0, x = 0, y = 0, z = 0;
  for (let k = g0; k * STEP <= sec + HALF; k++) {
    const g = k * STEP, w = HALF - Math.abs(g - sec);
    if (w <= 0) continue;
    const at = Math.min(b, Math.max(a, g));
    const n = shotNow(L, toon, timings, at);
    const c = cameraAt(L, def, n.s, si, at);
    wx += w; x += c.x * w; y += c.y * w; z += c.z * w;
  }
  return {x: x / wx, y: y / wx, z: z / wx};
};

/** The streaks of a whip pan: flat white bars with the kit's outline, fast and gone. */
const SpeedLines: React.FC<{u: number}> = ({u}) => {
  const a = Math.sin(Math.PI * u);
  if (a < 0.05) return null;
  return (
    <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920} viewBox="0 0 1080 1920" opacity={a}>
      {Array.from({length: 14}, (_, i) => {
        const y = 120 + ((i * 137) % 1700), w = 260 + ((i * 89) % 420), x = ((i * 211 + u * 3000) % 1600) - 400;
        return <rect key={i} x={x} y={y} width={w} height={10 + (i % 3) * 6} rx={8} fill="#ffffff" stroke="#2b1a17" strokeWidth={3} />;
      })}
    </svg>
  );
};

const Missing: React.FC<{id: string}> = ({id}) => (
  <AbsoluteFill style={{background: '#2b1a17', color: '#ffffff', fontFamily: FONT, fontSize: 60, fontWeight: 800, alignItems: 'center', justifyContent: 'center'}}>shot {id}: not drawn yet</AbsoluteFill>
);

/**
 * Everything the player decides for one moment of a video, as a pure function (the player draws it; the layout probe,
 * pipeline/lib/toon-layout.mjs, reads the same camera, caption and watermark from it, so the checks measure what is drawn).
 * `mode` is the impact policy (act.tsx): format 6 keeps only the impacts its shots ask to keep.
 */
export const frameState = (L: Layout, toon: Toon, timings: ToonTimings | null, sec: number, mode: ImpactMode = isV9(toon) ? 'v9' : 'v8') => {
  const v9 = isV9(toon);
  const {s, si} = shotNow(L, toon, timings, sec);
  const def = V8_VIDEOS[toon.slug]?.[s.id];
  const cam0 = smoothCam(L, toon, timings, def, si, sec);
  const f30 = sec * TOON_FPS;
  const cur = L.lines.find((l) => l.si === si && f30 >= l.from && f30 < l.from + l.frames);
  const tl = cur ? (f30 - cur.from) / TOON_FPS : 0;
  const keyWord = cur ? (cur.line.key ?? cleanWord(cur.words[cur.words.length - 1]?.w ?? '')).toLowerCase() : '';

  // a short white flash where the script asks for one
  const shot = L.shots[si].shot;
  // v4: the flash rises over 3 frames and fades over 12, softer (no one-frame white blink)
  // v9 (decision 18): a flash is opt-in and rare: only the FIRST "fx": "flash" of the video, and never on a cut (a shot's first frame)
  const firstFlash = mode === 'v9' ? L.shots.flatMap((x, i) => (x.shot.events ?? []).filter((e) => e.fx).map((e) => ({i, f: frameOf(L, i, e.at, e.word, e.delay)}))).find((x) => x.f > L.shots[x.i].from + 1) : undefined;
  const flash = (shot.events ?? []).reduce((m, e) => {
    const fe = frameOf(L, si, e.at, e.word, e.delay);
    if (mode === 'v9' && !(firstFlash && firstFlash.i === si && firstFlash.f === fe)) return m;
    const n = f30 - fe; return e.fx && n >= 0 && n < 15 ? Math.max(m, 0.6 * Math.min(n / 3, 1) * (1 - Math.max(0, n - 3) / 12)) : m;
  }, 0);

  // the camera's punch on the line's key word, and a shake on every bite or hit (a flash event)
  const ki = cur ? cur.words.findIndex((w) => cleanWord(w.w).toLowerCase().replace(/[!?'’]/g, '') === keyWord.replace(/[!?'’]/g, '')) : -1;
  const kt = ki >= 0 && cur ? tl - cur.words[ki].start : -1;
  // v4 (the owner, 2026-11-20): no punch zoom on the key word (it looked jerky)
  const punch = 0 * kt;
  // v9 (decision 18): NO automatic shake on a flash (it moved every pixel of the frame 5-16 times a video); the videos already out keep it
  const shake = mode === 'v8' && flash > 0 && !['home', 'clinic'].includes(shot.set ?? '') ? Math.sin(sec * 40) * 9 * flash : 0; // v4: slower, smaller (no jitter) // a bite shakes; a good-news flash in a room does not
  // the serious beat (a line marked "serious"): the picture darkens and the camera creeps in
  const grave = L.lines.filter((l) => (l.line as {serious?: boolean}).serious).reduce((m, l) => {
    const a = (f30 - l.from) / TOON_FPS, b = (l.from + l.frames - f30) / TOON_FPS;
    return Math.max(m, clamp01(a / 0.5) * clamp01((b + 0.4) / 0.5));
  }, 0);
  // v9 (decision 16): a locked camera. A shot with its own `view` keeps it; any other shot is the whole frame; the one `punch`
  // of a video is a hard re-frame from its line on (no lean, no creep, no zoom on the serious beat)
  const p9 = v9 ? def?.punch : undefined;
  const punched = !!p9 && L.lines.some((l) => l.si === si && l.line.id === p9.line && f30 >= l.from);
  const lock = v9 ? (punched ? {x: p9!.x ?? 540, y: p9!.y ?? 960, z: p9!.z} : def?.view ? cam0 : {x: 540, y: 960, z: 1}) : null;
  const cam = lock ? clampCam(lock) : {x: cam0.x + shake, y: cam0.y + shake * 0.4, z: cam0.z * (1 + punch + grave * 0.06)};
  return {v9, mode, s, si, def, shot, cam0, cam, flash, grave, f30, cur, tl, keyWord, isCard: shot.card !== undefined};
};
const cleanWord = (w: string) => w.replace(/[^\p{L}\p{N}'’!?-]/gu, '');
/** The camera of the video at second `sec` (frame pixels in the middle of the screen, and the zoom): shake and punch included. */
export const cameraOf = (L: Layout, toon: Toon, timings: ToonTimings | null, sec: number, mode?: ImpactMode): Cam => frameState(L, toon, timings, sec, mode).cam;

/**
 * The caption word on the screen at this moment (or null), as the player draws it. v8: a word holds until the next one
 * (or 0.25 s past its end). v9 (format 6): `captionShows` (hud.tsx): cleared in any pause over 0.4 s and on every cut, the
 * first word after a cut 2 frames late; each word tilts -2..+2 degrees (decision 27).
 */
export const captionAt = (L: Layout, toon: Toon, st: Pick<ReturnType<typeof frameState>, 'v9' | 'si' | 'cur' | 'tl' | 'keyWord'>) => {
  const {cur, tl, v9, keyWord} = st;
  if (!cur) return null;
  const cut = (L.shots[st.si].from - cur.from) / TOON_FPS; // the shot's first frame, in seconds of this line
  const wi = cur.words.findIndex((w, i) => v9
    ? captionShows({t: tl, start: w.start, end: w.end, nextStart: cur.words[i + 1]?.start, cuts: [cut]})
    : tl >= w.start && tl < (cur.words[i + 1]?.start ?? w.end + 0.25));
  if (wi < 0) return null;
  const w = cleanWord(cur.words[wi].w);
  const cs = captionStyle(toon);
  return {id: cur.line.id + wi, word: w, t: tl - cur.words[wi].start, isKey: w.toLowerCase().replace(/[!?'’]/g, '') === keyWord.replace(/[!?'’]/g, ''), y: cs.y, scale: cs.scale, tilt: v9};
};

/** The three acts of the watermark: groups of shots by place (body / rooms / body), else thirds of the story. */
export const actsOf = (L: Layout) => {
  const isRoom = (i: number) => ['home', 'clinic'].includes(L.shots[i].shot.set ?? '');
  const actStarts = L.shots.map((_, i) => i).filter((i) => i === 0 || isRoom(i) !== isRoom(i - 1)).map((i) => L.shots[i].from / TOON_FPS);
  const ends = L.total / TOON_FPS;
  return actStarts.length === 3 ? actStarts : [0, ends / 3, (2 * ends) / 3];
};
/**
 * v9 (decision 26): the head boxes a shot holds (screen pixels), for the act-3 watermark spot: every cast member's face
 * from the shot's `faces` or `focus`, at the start, middle and end of the shot (so the mark keeps ONE spot a shot).
 */
export const shotHeads = (L: Layout, toon: Toon, timings: ToonTimings | null, si: number): HudBox[] => {
  const sh = L.shots[si];
  const def = V8_VIDEOS[toon.slug]?.[sh.shot.id];
  if (!def) return [];
  const out: HudBox[] = [];
  for (const k of [0.05, 0.5, 0.95]) {
    const sec = (sh.from + sh.frames * k) / TOON_FPS;
    const st = frameState(L, toon, timings, sec);
    const c = st.cam;
    const all: Focus[] = def.faces ? Object.values(def.faces(st.s)) : sh.shot.cast.map((p) => def.focus(p.who, st.s));
    for (const f of all) {
      const x = 540 + (f.x - c.x) * c.z, y = 960 + (f.y - c.y) * c.z, r = f.r * c.z;
      out.push({x0: x - r * 1.3, y0: y - r * 1.6, x1: x + r * 1.3, y1: y + r * 1.3});
    }
  }
  return out;
};

/**
 * What the player lays on the SCREEN after the camera: the caption word and the watermark (inside <ScreenSpace>, so the
 * layout log reads them in screen pixels). The probe renders this same component.
 */
export const PlayerScreen: React.FC<{L: Layout; toon: Toon; st: ReturnType<typeof frameState>; sec: number; bare?: boolean; heads?: HudBox[]}> = ({L, toon, st, sec, bare = false, heads}) => {
  const ends = L.total / TOON_FPS;
  const acts = actsOf(L);
  const act = sec >= ends ? 2 : acts.filter((a) => sec >= a).length - 1;
  const cta = ctaOf(toon);
  const inCta = !!cta && sec >= ends;
  const cap = !bare && !inCta ? captionAt(L, toon, st) : null;
  const light = st.def?.light ?? kindOf(st.shot) === 'room';
  return (
    <ScreenSpace>
      {cap && <WordCaption key={cap.id} word={cap.word} t={cap.t} isKey={cap.isKey} y={cap.y} scale={cap.scale} tilt={cap.tilt} />}
      {/* no watermark on the end card (the owner, 2026-11-21): the last act's mark fades out as the card comes in; v9: none on the
          cover still either (decision 26: `bare` is the cover) */}
      {st.v9
        ? <WatermarkV9 act={act} t={sec - acts[act]} out={inCta ? sec - ends : undefined} heads={act === 2 ? heads : undefined} light={!inCta && !st.isCard && light} cover={bare} />
        : <Watermark act={act} t={sec - acts[act]} out={inCta ? sec - ends : undefined} />}
    </ScreenSpace>
  );
};

export const ToonV8: React.FC<V8VideoProps> = ({toon, timings, sfx, music, bare = false, frameAt, impacts}) => {
  const v9 = isV9(toon);
  // the impact policy for every shot drawn in this frame (act.tsx): format 6 keeps only the impacts its shots ask to keep
  const mode: ImpactMode = impacts ?? (v9 ? 'v9' : 'v8');
  setImpacts(mode);
  const now = useCurrentFrame();
  const frame = frameAt ?? now;
  const sec = frame / V8_FPS;
  const L = useMemo(() => layoutToon(toon, timings), [toon, timings]);
  const st = frameState(L, toon, timings, sec, mode);
  const {s, si, def, shot, cam0, cam, flash, grave, isCard} = st;
  const heads = useMemo(() => (v9 ? shotHeads(L, toon, timings, si) : undefined), [v9, L, toon, timings, si]);

  // the transition from the shot before: a zoom-through between places, a whip pan between two rooms
  // v4: transitions follow the story: from a room into the body the camera DIVES into the Kid's scratch; from
  // the body back to a room it PULLS back out of his arm; a whip pan only from room to room; else a zoom-through.
  const TR = {whip: 0.42, zoom: 0.5, dive: 0.8, pull: 0.8};
  const into = sec - L.shots[si].from / TOON_FPS;
  // NO transitions between scenes (the owner, 2026-11-21: "I don't want transitions when the scene changes, it looks fake"):
  // every change of scene is a clean cut. The code below stays only so an old render can be reproduced; it never runs.
  const TRANSITIONS = false;
  const trans = (() => {
    if (!TRANSITIONS || si === 0 || into >= 0.8 || !def) return null;
    const pf = L.shots[si].from / TOON_FPS - 1 / V8_FPS;
    const p = shotNow(L, toon, timings, pf);
    const pdef = V8_VIDEOS[toon.slug]?.[p.s.id];
    if (!pdef) return null;
    const ps = {...p.s, t: p.s.t + into};
    const pcam = smoothCam(L, toon, timings, pdef, p.si, pf);
    const room = (id: string) => ['home', 'clinic'].includes(L.shots.find((x) => x.shot.id === id)?.shot.set ?? '');
    const toScreen = (q: [number, number], c: {x: number; y: number; z: number}): [number, number] => [540 + (q[0] - c.x) * c.z, 960 + (q[1] - c.y) * c.z];
    const kind: 'whip' | 'zoom' | 'dive' | 'pull' = room(p.s.id) && room(s.id) ? 'whip' : room(p.s.id) && pdef.portal ? 'dive' : room(s.id) && def.portal ? 'pull' : 'zoom';
    if (into >= TR[kind]) return null;
    const portal = kind === 'dive' ? toScreen(pdef.portal!(ps), pcam) : kind === 'pull' ? toScreen(def.portal!(s), cam0) : null;
    const u = clamp01(into / TR[kind]), e = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    return {pdef, ps, pcam, kind, u, e, portal};
  })();
  const view = (c: {x: number; y: number; z: number}, extra = '') => `${extra} translate(${(540 - c.x * c.z).toFixed(2)}px, ${(960 - c.y * c.z).toFixed(2)}px) scale(${c.z.toFixed(4)})`;
  const about = (q: [number, number], k: number) => `translate(${q[0].toFixed(1)}px, ${q[1].toFixed(1)}px) scale(${k.toFixed(4)}) translate(${(-q[0]).toFixed(1)}px, ${(-q[1]).toFixed(1)}px)`;
  const newT = !trans ? '' : trans.kind === 'whip' ? `translateX(${((1 - trans.e) * 1080).toFixed(1)}px)`
    : trans.kind === 'pull' ? about(trans.portal!, lerp(4.5, 1, 1 - Math.pow(1 - trans.u, 3)))
    : trans.kind === 'dive' ? about(trans.portal!, lerp(0.7, 1, trans.e))
    : `translate(540px, 960px) scale(${lerp(0.78, 1, trans.e).toFixed(4)}) translate(-540px, -960px)`;
  // the round window of the body: it opens from the scratch (dive) or closes into it (pull)
  const farCorner = !trans?.portal ? 0 : Math.max(...[[0, 0], [1080, 0], [0, 1920], [1080, 1920]].map(([x, y]) => Math.hypot(x - trans.portal![0], y - trans.portal![1])));
  const ringR = !trans || !trans.portal ? 0 : trans.kind === 'dive' ? farCorner * Math.pow(trans.u, 2.2) : farCorner * 0.92 * Math.pow(1 - trans.u, 1.6);

  const ends = L.total / TOON_FPS;
  const cta = ctaOf(toon);
  const inCta = !!cta && sec >= ends;
  // the card's beats, in seconds from the card's start (the narrator begins at CTA_LEAD); v9: the short card's own beats
  // (headline and points together, CTA9_AT), Joey says only the follow line
  // the owner (2026-11-23): "cta": {"read": "card"}: Joey reads the whole card, each point lands on his word (still a hard cut in)
  const readCard = v9 && (toon as Toon & {cta?: {read?: string}}).cta?.read === 'card';
  const ctaAt: CtaAt | undefined = v9 && !readCard ? CTA9_AT : cta?.at && {head: CTA_LEAD + cta.at.head, points: cta.at.points.map((p) => CTA_LEAD + p) as [number, number, number], follow: CTA_LEAD + cta.at.follow};

  const has = (n: string | undefined): n is string => !!n && sfx.includes(n);
  const events = soundPlan(L);
  // format 6: the answer block (calmer: SOUND6.calm)
  const ans = L.lines.filter((l) => l.line.answer);
  const calm = (L.sound as {calm?: number}).calm ?? 1;
  // extra story sounds of the player: a heartbeat under the serious beat
  const extra = L.lines.filter((l) => (l.line as {serious?: boolean}).serious).map((l) => ({at: l.from, name: 'heartbeat', vol: 0.5}));

  const picture = (
    <AbsoluteFill style={{background: '#2b1a17'}}>
      {trans && trans.kind === 'dive' && (
        // the room under the opening window: the camera rushes in at the scratch
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, overflow: 'hidden', transformOrigin: '0 0', transform: about(trans.portal!, 1 + Math.pow(trans.u, 2) * 5)}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: view(trans.pcam)}}><trans.pdef.Scene s={trans.ps} /></div>
        </div>
      )}
      {isCard ? <TimeCard text={String(shot.card)} t={s.t} /> : def ? (
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, overflow: 'hidden',
          clipPath: trans?.kind === 'dive' ? `circle(${ringR.toFixed(1)}px at ${trans.portal![0].toFixed(1)}px ${trans.portal![1].toFixed(1)}px)` : undefined}}>
          {/* v9 (blueprint 4.1): the kit's line widths divided by the zoom (kit.tsx InkZoom: class + --ink-k), so a line stays
              5-6 px on screen at any zoom; the videos already out keep their line as it was (no class) */}
          <div className={v9 ? INK_ZOOM_CLASS : undefined} style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: view(cam, newT), ...(v9 ? inkZoomVars(cam.z) : {})}}>
            {v9 && <style>{INK_ZOOM_CSS}</style>}
            <def.Scene s={s} />
          </div>
        </div>
      ) : <Missing id={s.id} />}
      {trans && trans.kind !== 'dive' && (
        <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, overflow: 'hidden',
          opacity: trans.kind === 'zoom' ? 1 - clamp01((trans.u - 0.35) / 0.5) : 1,
          clipPath: trans.kind === 'pull' ? `circle(${ringR.toFixed(1)}px at ${trans.portal![0].toFixed(1)}px ${trans.portal![1].toFixed(1)}px)` : undefined,
          transformOrigin: trans.kind === 'pull' ? '0 0' : undefined,
          transform: trans.kind === 'whip' ? `translateX(${(-trans.e * 1080).toFixed(1)}px)` : trans.kind === 'pull' ? about(trans.portal!, lerp(1, 0.8, trans.e)) : `translate(540px, 960px) scale(${(1 + trans.e * 1.6).toFixed(4)}) translate(-540px, -960px)`}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '0 0', transform: view(trans.pcam)}}><trans.pdef.Scene s={trans.ps} /></div>
        </div>
      )}
      {trans && trans.portal && ringR > 2 && ringR < farCorner * 0.98 && (
        // the window's rim: the kit's outline and a skin-coloured band, flat
        <svg style={{position: 'absolute', left: 0, top: 0, pointerEvents: 'none'}} width={1080} height={1920} viewBox="0 0 1080 1920">
          <circle cx={trans.portal[0]} cy={trans.portal[1]} r={ringR * (trans.kind === 'pull' ? lerp(1, 0.8, trans.e) : 1)} fill="none" stroke="#f0c39d" strokeWidth={14} />
          <circle cx={trans.portal[0]} cy={trans.portal[1]} r={ringR * (trans.kind === 'pull' ? lerp(1, 0.8, trans.e) : 1)} fill="none" stroke="#2b1a17" strokeWidth={4} />
        </svg>
      )}
      {trans && trans.kind === 'whip' && <SpeedLines u={trans.u} />}
      {trans && trans.kind === 'zoom' && <AbsoluteFill style={{background: '#ffffff', opacity: Math.max(0, 0.35 - Math.abs(trans.u - 0.5)) * 1.2}} />}
      {grave > 0 && <AbsoluteFill style={{background: '#1b2238', opacity: grave * 0.34}} />}
      {trans && trans.pdef.Screen && clamp01(trans.u / 0.35) < 1 && (
        // the shot before keeps its icons for a moment and fades them out (no icon may blink off)
        <div style={{position: 'absolute', inset: 0, opacity: 1 - clamp01(trans.u / 0.35)}}><trans.pdef.Screen s={{...trans.ps, t: trans.ps.t - into}} /></div>
      )}
      {!isCard && def?.Screen && <def.Screen s={s} />}
      {flash > 0 && <AbsoluteFill style={{background: '#ffffff', opacity: flash * 0.3}} />}
      {inCta && (
        // v9 (decision 25, option A): the short card (CtaCardV9, 5.5 s) comes in with a hard cut, no slide (the slide was our last transition)
        v9 ? <CtaCardV9 t={sec - ends} title={cta!.title} points={cta!.points} at={ctaAt} />
          : <div style={{position: 'absolute', inset: 0, transform: `translateY(${((1 - clamp01((sec - ends) / 0.35)) ** 3 * 1920).toFixed(1)}px)`}}>
            <CtaCardV4 t={sec - ends} title={cta!.title} points={cta!.points} at={ctaAt} />
          </div>
      )}
      {/* the caption word and the watermark, laid on the screen after the camera (one word at a time, no box: 2026-11-20) */}
      <PlayerScreen L={L} toon={toon} st={st} sec={sec} bare={bare} heads={heads} />
      {/* v9: the points come up together, so one pop; no whoosh (a hard cut) */}
      {cta && v9 && !readCard && <Sequence from={Math.round((ends + CTA9_AT.points[0]) * V8_FPS)} durationInFrames={60 * K}><Audio src={staticFile('toons/sfx/pop.mp3')} volume={0.35} /></Sequence>}
      {cta && (!v9 || readCard) && [0, 1, 2].map((i) => <Sequence key={'cta' + i} from={Math.round((ends + (ctaAt ? ctaAt.points[i] : 0.45 + i * 0.55)) * V8_FPS)} durationInFrames={60 * K}><Audio src={staticFile('toons/sfx/pop.mp3')} volume={0.35} /></Sequence>)}
      {cta && !v9 && <Sequence from={Math.round((ends + (ctaAt ? ctaAt.follow : 2.3)) * V8_FPS)} durationInFrames={90 * K}><Audio src={staticFile('toons/sfx/success-chime.mp3')} volume={0.3} /></Sequence>}
      {cta?.voice && <Sequence from={Math.round((ends + CTA_LEAD) * V8_FPS)} durationInFrames={Math.round(((cta.seconds ?? 4) + CTA_TAIL) * V8_FPS)}><Audio src={staticFile(cta.voice)} /></Sequence>}
      {cta && !v9 && <Sequence from={Math.round(ends * V8_FPS)} durationInFrames={40 * K}><Audio src={staticFile('toons/sfx/whoosh-air.mp3')} volume={0.4} /></Sequence>}
      {L.lines.map((l) => l.file && <Sequence key={l.line.id} from={Math.round(l.from * K)} durationInFrames={Math.round((l.frames + 12) * K)}><Audio src={staticFile(l.file)} volume={v9 && l.line.answer ? calm : 1} /></Sequence>)}
      {events.filter((e) => has(e.name)).map((e, i) => <Sequence key={i} from={Math.round(e.at * K)} durationInFrames={90 * K}><Audio src={staticFile(`toons/sfx/${e.name}.mp3`)} volume={e.vol} /></Sequence>)}
      {extra.filter((e) => has(e.name)).map((e, i) => <Sequence key={'x' + i} from={Math.round(e.at * K)} durationInFrames={240 * K}><Audio src={staticFile(`toons/sfx/${e.name}.mp3`)} volume={e.vol} /></Sequence>)}
      {music && <Audio src={staticFile(`toons/music/${music}.mp3`)} loop volume={(fr) => {
        // format 6: the bed eases down to the answer's calm level over 0.4 s and back up after it (no step, no click)
        const answerK = (t: number) => {
          if (!v9 || !ans.length) return 1;
          const a0 = ans[0].from, a1 = ans[ans.length - 1].from + ans[ans.length - 1].frames, r = 0.4 * TOON_FPS;
          const k = Math.min(clamp01((t - a0 + r) / r), clamp01((a1 + r - t) / r));
          return 1 - (1 - calm) * k * k * (3 - 2 * k);
        };
        // v4: the bed stays low under the narrator on the end card, then fades out with it
        const t = fr / K;
        // the master level: MUSIC_LEVEL for the videos already out, the format's own (director.ts SOUND6.music) for format 6
        const lvl = (v9 ? L.sound.music : MUSIC_LEVEL) * answerK(t);
        if (!cta || t < L.total - 24) return lvl * bedAt(L, t);
        const end = L.total + ctaSeconds(cta, v9) * TOON_FPS;
        return lvl * Math.max(Math.min(bedAt(L, L.total - 24), L.sound.bedUnderVoice * 1.2), 0) * clamp01((end - t) / 40);
      }} />}
    </AbsoluteFill>
  );
  // v9: the whole engine-v9 look (kit.tsx <V9>: oval turned eyes, rim pupils, lids, outlined arms, the soft stubble...)
  return v9 ? <V9>{picture}</V9> : picture;
};
