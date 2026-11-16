// MedPeak Toons player: plays a Toon script (videos/<slug>/toon.json) as a finished Short.
// A script is shots -> lines. Each line has a speaker, the words, an emotion and a pose.
// The player does the rest: staging, lip-sync from the voice timing, reactions, camera cuts
// (a new picture at least every 2.6 s), one-word captions, sound effects and the music bed.
import React, {useMemo} from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import type {CharProps} from './blueprint';
import {BLUEPRINTS, CAST, type CastName} from './characters';
import {headY, PEOPLE, SPECS} from './humans';
import {Grain} from './ink';
import {clamp01, E, guessWords, key, lipsync, settle, type SpokenWord} from './motion';
import {blendPose, POSES, type PoseName} from './poses';
import {blinkAt, type Emotion} from './rig';
import {FLOORS, OfficeDesk, SETS, WordCaption, type SetName} from './scenes';
import {Camera, Hold, Slot} from './stage';

export const TOON_FPS = 30;
const GAP = 0.14; // seconds of air between lines (fast banter)
const SHOT_GAP = 0.25;
const SEG = 78; // frames: the longest a picture may stay before the camera cuts (2.6 s)

export type ToonLine = {id: string; who: string; text: string; emotion?: Emotion; pose?: PoseName; sfx?: string; key?: string; react?: Record<string, Emotion>};
export type ToonActor = {who: string; x: number; size: number; y?: number; rot?: number; noLegs?: boolean; flip?: boolean; emotion?: Emotion; pose?: PoseName};
export type ToonShot = {id: string; set: SetName; cast: ToonActor[]; lines: ToonLine[]; desk?: boolean};
export type Toon = {slug: string; title: string; test?: boolean; music?: string; shots: ToonShot[]; sources?: {id: string; label: string; url: string; note?: string}[]};
export type ToonTimings = {lines: Record<string, {file: string; duration: number; words: SpokenWord[]}>};
export type ToonProps = {toon: Toon; timings: ToonTimings | null; sfx: string[]; music: string | null};

/** The sound that marks a line's mood when the script names none. */
const EMO_SFX: Partial<Record<Emotion, string>> = {shocked: 'boing', scared: 'wobble', angry: 'thud-soft', happy: 'ding', smug: 'slide-whistle-up', sick: 'gurgle-stomach', sad: 'sad-trombone'};

type Placed = {line: ToonLine; si: number; li: number; from: number; frames: number; words: SpokenWord[]; file?: string};
type Cut = {from: number; mode: 'wide' | 'close'; line: Placed};

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
  // camera cuts: a shot opens wide, then cuts to the speaker; long lines alternate so no picture outstays SEG
  const cuts: Cut[] = [];
  for (const l of lines) {
    let f = l.from;
    let mode: 'wide' | 'close' = l.li === 0 ? 'wide' : 'close';
    let len = l.li === 0 ? Math.min(45, Math.round(l.frames * 0.4)) : SEG;
    while (f < l.from + l.frames) {
      cuts.push({from: f, mode, line: l});
      f += len;
      mode = mode === 'wide' ? 'close' : 'wide';
      len = SEG;
    }
  }
  return {lines, shots, cuts, total: Math.max(TOON_FPS, at)};
};

const isPerson = (who: string) => who in SPECS;
const groundOf = (who: string) => (isPerson(who) ? 96 : BLUEPRINTS[who as CastName].ground.y);
/** Where an actor's slot centre and face are on screen. */
const place = (a: ToonActor, set: SetName) => {
  const floor = FLOORS[set];
  const cy = a.y ?? (floor === null ? 900 : floor - (groundOf(a.who) / 200) * a.size);
  const faceLocal = isPerson(a.who) ? headY(SPECS[a.who]) : BLUEPRINTS[a.who as CastName].face.y;
  return {cx: a.x, cy, faceY: cy + (faceLocal / 200) * a.size};
};

const Actor: React.FC<{a: ToonActor; shot: ToonShot; lines: Placed[]; f: number; cur: Placed | undefined}> = ({a, shot, lines, f, cur}) => {
  const C = (isPerson(a.who) ? PEOPLE[a.who as keyof typeof PEOPLE] : CAST[a.who as CastName]) as React.FC<CharProps>;
  const person = isPerson(a.who);
  const {cx, cy} = place(a, shot.set);
  const past = lines.filter((l) => l.from <= f);
  // emotion: the latest line that sets it (own line, or a reaction to someone else's)
  let emotion: Emotion = a.emotion ?? 'neutral';
  let emotionFrom = -999;
  for (const l of past) {
    const e = l.line.who === a.who ? l.line.emotion : l.line.react?.[a.who];
    if (e && e !== emotion) { emotion = e; emotionFrom = l.from; }
  }
  // pose: own lines set it; it eases in with a small overshoot
  const own = past.filter((l) => l.line.who === a.who && l.line.pose);
  const poseOf = (n: PoseName | undefined) => POSES[n ?? 'rest'][person ? 'person' : 'body'];
  const now = own[own.length - 1];
  const before = own[own.length - 2];
  const from = poseOf(before ? before.line.pose : a.pose);
  const to = poseOf(now ? now.line.pose : a.pose);
  const arms = now ? blendPose(from, to, E.back(clamp01((f - now.from) / 10))) : to;
  const speaking = cur?.line.who === a.who;
  const talk = speaking && cur ? lipsync(cur.words, (f - cur.from) / TOON_FPS) : 0;
  // look at whoever is talking; the speaker looks at the nearest other actor
  const others = shot.cast.filter((o) => o.who !== a.who);
  const target = speaking || !cur ? others[0] : shot.cast.find((o) => o.who === cur.line.who);
  const lookX = target ? Math.sign(target.x - a.x) * 0.8 * (a.flip ? -1 : 1) : 0;
  // a small "take" when the emotion changes, and a nudge when starting to speak
  const squash = settle(f, emotionFrom, emotion === 'shocked' || emotion === 'scared' ? 0.3 : 0.14, 1.1, 0.3) + (speaking && cur ? settle(f, cur.from, 0.08, 1.2, 0.4) : 0);
  const ground = groundOf(a.who);
  return (
    <Slot x={cx} y={cy} size={a.size}>
      <g transform={a.rot ? `rotate(${a.rot + settle(f, emotionFrom, 5, 0.8, 0.25)})` : undefined}>
        <Hold frame={f} seed={a.x} ground={ground}>
          <C emotion={emotion} talk={talk} blink={blinkAt(f, TOON_FPS, Math.round(a.x))} arms={arms} look={{x: lookX, y: 0}} squash={squash} noLegs={a.noLegs} flip={a.flip} t={f / TOON_FPS} />
        </Hold>
      </g>
    </Slot>
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

  // ---- camera
  const cut = [...L.cuts].reverse().find((c) => f >= c.from && c.line.si === si);
  const local = cut ? clamp01((f - cut.from) / SEG) : 0;
  let zoom = 1.02 + 0.03 * local;
  let cx = 540;
  let cy = 960;
  if (cut && cut.mode === 'close') {
    const a = shot.cast.find((o) => o.who === cut.line.line.who);
    if (a) {
      const p = place(a, shot.set);
      zoom = Math.max(1.35, Math.min(2.3, isPerson(a.who) ? 1500 / a.size : 860 / a.size)) + 0.04 * local;
      cx = Math.max(540 / zoom, Math.min(1080 - 540 / zoom, p.cx));
      cy = Math.max(960 / zoom, Math.min(1920 - 960 / zoom, p.faceY + (isPerson(a.who) ? a.size * 0.1 : a.size * 0.06)));
    }
  }

  // ---- caption: the word being spoken
  const tl = cur ? (f - cur.from) / TOON_FPS : 0;
  const wi = cur ? cur.words.findIndex((w, i) => tl >= w.start && tl < (cur.words[i + 1]?.start ?? w.end + 0.25)) : -1;
  const word = cur && wi >= 0 ? cur.words[wi] : null;
  const clean = (w: string) => w.replace(/[^\p{L}\p{N}'’!?-]/gu, '');
  const keyWord = cur ? (cur.line.key ?? clean(cur.words[cur.words.length - 1]?.w ?? '')).toLowerCase() : '';

  // ---- sound
  const has = (n: string | undefined): n is string => !!n && sfx.includes(n);
  const events: {at: number; name: string; vol: number}[] = [];
  for (const s of L.shots) if (s.from > 0) events.push({at: s.from, name: 'whoosh-soft', vol: 0.45});
  for (const l of L.lines) {
    const n = l.line.sfx ?? EMO_SFX[l.line.emotion ?? 'neutral'];
    if (n) events.push({at: l.from, name: n, vol: 0.5});
    const kw = (l.line.key ?? clean(l.words[l.words.length - 1]?.w ?? '')).toLowerCase();
    const k = l.words.find((w) => clean(w.w).toLowerCase() === kw);
    if (k) events.push({at: l.from + Math.round(k.start * TOON_FPS), name: 'caption-pop', vol: 0.3});
  }
  for (const c of L.cuts) if (c.from !== c.line.from) events.push({at: c.from, name: 'swish', vol: 0.22});
  const talking = (fr: number) => L.lines.some((l) => fr >= l.from && fr < l.from + l.frames - Math.round(GAP * TOON_FPS));
  // music sits about 9 dB under the voice (the level measured on the reference Shorts) and comes up a little in the gaps;
  // the move is smoothed over half a second so it never pumps
  const duck = (fr: number) => { let n = 0; for (let i = -7; i <= 7; i++) n += talking(fr + i) ? 1 : 0; return n / 15; };
  const bed = (fr: number) => (0.6 - 0.16 * duck(fr)) * interpolate(fr, [0, 12], [0, 1], {extrapolateRight: 'clamp'}) * interpolate(fr, [L.total - 24, L.total], [1, 0], {extrapolateLeft: 'clamp'});

  return (
    <AbsoluteFill style={{background: '#f0a8a0'}}>
      <Camera zoom={zoom} cx={cx} cy={cy}>
        <Set t={f / TOON_FPS} />
        {shot.cast.map((a) => <Actor key={a.who} a={a} shot={shot} lines={shotLines} f={f} cur={cur} />)}
        {shot.desk && <OfficeDesk />}
      </Camera>
      {word && <WordCaption word={clean(word.w)} key_={clean(word.w).toLowerCase() === keyWord} pop={0.72 + 0.28 * E.back(clamp01((tl - word.start) * TOON_FPS / 4))} y={1400} />}
      <Grain />
      {L.lines.map((l) => l.file && <Sequence key={l.line.id} from={l.from} durationInFrames={l.frames + 12}><Audio src={staticFile(l.file)} /></Sequence>)}
      {events.filter((e) => has(e.name)).map((e, i) => <Sequence key={i} from={e.at} durationInFrames={90}><Audio src={staticFile(`toons/sfx/${e.name}.mp3`)} volume={e.vol} /></Sequence>)}
      {music && <Audio src={staticFile(`toons/music/${music}.mp3`)} loop volume={bed} />}
    </AbsoluteFill>
  );
};
