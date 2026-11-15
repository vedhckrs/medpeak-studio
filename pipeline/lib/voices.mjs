// Narrator rotation (owner 2026-11-15): every new video gets a random voice from the 15 in
// skill/medpeak-health/voices.json, never one used by the last `avoidRecent` videos.
// One video (the long cut and its Shorts) keeps one voice so it sounds like one piece.
import fs from 'node:fs';
import path from 'node:path';
import {randomInt} from 'node:crypto';
import {ROOT, VIDEOS, readJson} from './util.mjs';

export const POOL_FILE = path.join(ROOT, 'skill', 'medpeak-health', 'voices.json');
export const voicePool = () => readJson(POOL_FILE);

/** Voices of the other videos, newest first (by video.json change time). */
export const recentVoices = (exceptSlug) => fs.readdirSync(VIDEOS)
  .filter((d) => d !== exceptSlug && fs.existsSync(path.join(VIDEOS, d, 'video.json')))
  .map((d) => {
    const file = path.join(VIDEOS, d, 'video.json');
    return {slug: d, mtime: fs.statSync(file).mtimeMs, voiceId: readJson(file).voice?.voiceId};
  })
  .filter((v) => v.voiceId)
  .sort((a, b) => b.mtime - a.mtime)
  .map((v) => v.voiceId);

/** Pick a random pool voice not used by the most recent videos. `rand(n)` is injectable for tests. */
export const pickVoice = ({pool, recent, rand = (n) => randomInt(n)}) => {
  const avoid = new Set(recent.slice(0, pool.avoidRecent ?? 7));
  const fresh = pool.voices.filter((v) => !avoid.has(v.voiceId));
  const from = fresh.length ? fresh : pool.voices;
  return from[rand(from.length)];
};
