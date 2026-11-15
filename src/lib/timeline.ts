import type {Scene, Timings, Video, Visual} from '../types';
import {END_SCREEN_SECONDS, FPS} from '../brand/theme';

const WPS = 2.6;
export type Placed = {scene: Scene; from: number; frames: number; chapterIndex: number};

export const sceneList = (video: Video, shortId?: string): Scene[] => {
  if (!shortId) return video.scenes;
  const short = video.shorts?.find((s) => s.id === shortId);
  if (!short) return video.scenes;
  const byId = new Map<string, Scene>();
  for (const s of video.scenes) byId.set(s.id, s);
  for (const sh of video.shorts ?? []) for (const it of sh.scenes) if (typeof it === 'object') byId.set(it.id, it);
  return short.scenes.map((it) => (typeof it === 'object' ? it : byId.get(it)!)).filter(Boolean);
};

export const sceneSeconds = (s: Scene, t: Timings | null) =>
  t?.scenes[s.id]?.duration ?? Math.max(1.5, (s.text.match(/\S+/g)?.length ?? 1) / WPS + 0.35);

export const place = (video: Video, timings: Timings | null, shortId?: string) => {
  const scenes = sceneList(video, shortId);
  let at = 0;
  const placed: Placed[] = scenes.map((scene) => {
    const frames = Math.round(sceneSeconds(scene, timings) * FPS);
    const chapterIndex = Math.max(0, video.chapters.findIndex((c) => c.id === scene.chapter));
    const p = {scene, from: at, frames, chapterIndex};
    at += frames;
    return p;
  });
  const spoken = at;
  const total = shortId ? spoken : spoken + END_SCREEN_SECONDS * FPS;
  return {placed, spoken, total};
};

export const panels = (s: Scene): Visual[] => (s.visual.panels?.length ? s.visual.panels : [s.visual]);

/** Speech intervals (in frames, whole-video time) for ducking the music. */
export const speechFrames = (placed: Placed[], t: Timings | null): [number, number][] => {
  if (!t) return placed.map((p) => [p.from, p.from + p.frames]);
  const out: [number, number][] = [];
  for (const p of placed) {
    for (const w of t.scenes[p.scene.id]?.words ?? []) {
      const a = p.from + Math.floor((w.start - 0.12) * FPS);
      const b = p.from + Math.ceil((w.end + 0.2) * FPS);
      const last = out[out.length - 1];
      if (last && a <= last[1]) last[1] = Math.max(last[1], b);
      else out.push([a, b]);
    }
  }
  return out;
};
