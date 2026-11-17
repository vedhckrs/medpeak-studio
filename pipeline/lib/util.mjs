// Shared helpers for every pipeline step.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const VIDEOS = path.join(ROOT, 'videos');
export const PUBLIC = path.join(ROOT, 'public');

/**
 * True when the module at `metaUrl` is the script node was started with. Pass `import.meta.url`.
 * Compares real file paths, so it also works on Windows (where `file://${process.argv[1]}` never
 * matches `import.meta.url`).
 */
export const isMain = (metaUrl) => {
  if (!process.argv[1]) return false;
  const real = (p) => { try { return fs.realpathSync(p); } catch { return path.resolve(p); } };
  const a = real(fileURLToPath(metaUrl));
  const b = real(process.argv[1]);
  return process.platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
};

/** Parse "--key value" and "--flag" arguments. Positional args land in `_`. */
export const args = (argv = process.argv.slice(2)) => {
  const out = {_: []};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) { out._.push(a); continue; }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) out[key] = true;
    else { out[key] = next; i++; }
  }
  return out;
};

export const videoDir = (slug) => path.join(VIDEOS, slug);
export const readJson = (p, fallback) => {
  if (!fs.existsSync(p)) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing file: ${path.relative(ROOT, p)}`);
  }
  return JSON.parse(fs.readFileSync(p, 'utf8'));
};
export const writeJson = (p, data) => {
  fs.mkdirSync(path.dirname(p), {recursive: true});
  fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
};

export const loadVideo = (slug) => {
  if (!slug) throw new Error('Give the video slug, e.g. what-sugar-does-to-your-body');
  return readJson(path.join(videoDir(slug), 'video.json'));
};
/** Word timings written by voice.mjs (null until the voice exists). */
export const loadTimings = (slug) => readJson(path.join(videoDir(slug), 'timings.json'), null);

/**
 * Load API keys without ever printing them. Order: process env, repo .env, then the
 * files listed in MEDPEAK_ENV_FILES (colon-separated), so an existing key file can be
 * shared instead of copied.
 */
export const loadEnv = () => {
  const files = [path.join(ROOT, '.env')];
  const parse = (file) => {
    if (!fs.existsSync(file)) return;
    for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  };
  parse(files[0]);
  for (const extra of (process.env.MEDPEAK_ENV_FILES || '').split(':').filter(Boolean)) parse(extra);
};

/** Every scene that is spoken: the long video's scenes plus any Short-only scenes. */
export const allScenes = (video) => {
  const seen = new Map();
  for (const s of video.scenes) seen.set(s.id, s);
  for (const short of video.shorts || []) {
    for (const item of short.scenes) if (typeof item === 'object') seen.set(item.id, item);
  }
  return [...seen.values()];
};

/** The ordered scene list for the long video or for one Short. */
export const sceneList = (video, shortId) => {
  if (!shortId) return video.scenes;
  const short = (video.shorts || []).find((s) => s.id === shortId);
  if (!short) throw new Error(`No Short with id ${shortId}`);
  const byId = new Map(allScenes(video).map((s) => [s.id, s]));
  return short.scenes.map((item) => (typeof item === 'object' ? item : byId.get(item)));
};

export const fmtTime = (sec) => {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = String(s % 60).padStart(2, '0');
  return h ? `${h}:${String(m).padStart(2, '0')}:${r}` : `${m}:${r}`;
};
