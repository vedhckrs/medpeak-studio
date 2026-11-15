#!/usr/bin/env node
/**
 * Render: long video (1920x1080, 60 fps), every Short (1080x1920, 60 fps), thumbnails, then
 * master the audio to -14 LUFS / -1 dBTP (YouTube's playback level). Free: all local.
 *
 *   node pipeline/render.mjs <slug>                     # long + all Shorts + thumbnails
 *   node pipeline/render.mjs <slug> --only long|soda    # one cut
 *   node pipeline/render.mjs <slug> --stills            # one still per scene panel, to look at first
 *   node pipeline/render.mjs <slug> --draft             # half size, fast, for checking timing
 *
 * Output: videos/<slug>/renders/  (long.mp4, short-<id>.mp4, thumb.jpg, cover-<id>.jpg)
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {args, loadTimings, loadVideo, PUBLIC, ROOT, videoDir, writeJson} from './lib/util.mjs';
import {makeSfx} from './make-sfx.mjs';

const FPS = 60;
const run = (cmd, argv) => execFileSync(cmd, argv, {stdio: 'inherit', cwd: ROOT});

export const buildProps = (slug, shortId) => {
  const video = loadVideo(slug);
  const timings = loadTimings(slug);
  const hasMusic = fs.existsSync(path.join(PUBLIC, 'videos', slug, 'music.mp3'));
  const media = new Set();
  const scan = (v) => { if (v && (v.type === 'clip' || v.type === 'image')) media.add(v.src); (v?.panels || []).forEach(scan); };
  const all = [...video.scenes, ...(video.shorts || []).flatMap((s) => s.scenes.filter((x) => typeof x === 'object'))];
  all.forEach((s) => scan(s.visual));
  const clips = [...media].filter((src) => fs.existsSync(path.join(PUBLIC, src)));
  const props = {video, timings, shortId, hasMusic, clips};
  const file = path.join(ROOT, 'out', `props-${slug}-${shortId || 'long'}.json`);
  writeJson(file, props);
  return {file, props};
};

/** Two-pass loudnorm to -14 LUFS integrated, -1 dBTP; video stream copied untouched. */
export const master = (input, output) => {
  const pass1 = execFileSync('ffmpeg', ['-hide_banner', '-i', input, '-af', 'loudnorm=I=-14:TP=-1:LRA=11:print_format=json', '-f', 'null', '-'], {stdio: ['ignore', 'ignore', 'pipe']}).toString();
  const m = JSON.parse(pass1.slice(pass1.lastIndexOf('{'), pass1.lastIndexOf('}') + 1));
  const af = `loudnorm=I=-14:TP=-1:LRA=11:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
  execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', input, '-c:v', 'copy', '-af', af, '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', output]);
};

const panelFrames = (slug, shortId) => {
  const {props} = buildProps(slug, shortId);
  const {video, timings} = props;
  const byId = new Map([...video.scenes, ...(video.shorts || []).flatMap((s) => s.scenes.filter((x) => typeof x === 'object'))].map((s) => [s.id, s]));
  const list = shortId ? video.shorts.find((s) => s.id === shortId).scenes.map((x) => (typeof x === 'object' ? x : byId.get(x))) : video.scenes;
  const out = [];
  let at = 0;
  for (const s of list) {
    const sec = timings?.scenes?.[s.id]?.duration ?? Math.max(1.5, s.text.split(/\s+/).length / 2.6 + 0.35);
    const frames = Math.round(sec * FPS);
    const n = Math.max(1, s.visual.panels?.length || 1);
    for (let i = 0; i < n; i++) out.push({name: `${s.id}-${i + 1}`, frame: at + Math.round((i + 0.6) * (frames / n))});
    at += frames;
  }
  return out;
};

const main = () => {
  const a = args();
  const slug = a._[0];
  const video = loadVideo(slug);
  makeSfx();
  const outDir = path.join(videoDir(slug), 'renders');
  fs.mkdirSync(outDir, {recursive: true});
  const cuts = [{id: 'long', comp: 'Long'}, ...(video.shorts || []).map((s) => ({id: s.id, comp: 'Short', shortId: s.id}))]
    .filter((c) => !a.only || a.only === c.id);

  if (a.stills) {
    for (const c of cuts) {
      const {file} = buildProps(slug, c.shortId);
      const dir = path.join(outDir, 'stills', c.id);
      fs.mkdirSync(dir, {recursive: true});
      for (const p of panelFrames(slug, c.shortId)) {
        run('npx', ['remotion', 'still', 'src/index.ts', c.comp, path.join(dir, `${p.name}.jpg`), `--frame=${p.frame}`, `--props=${file}`, '--scale=0.5', '--log=error']);
      }
      console.log(`Stills for ${c.id}: ${path.relative(ROOT, dir)}`);
    }
    return;
  }

  for (const c of cuts) {
    const {file} = buildProps(slug, c.shortId);
    const raw = path.join(ROOT, 'out', `${slug}-${c.id}-raw.mp4`);
    const final = path.join(outDir, c.id === 'long' ? 'long.mp4' : `short-${c.id}.mp4`);
    console.log(`\nRendering ${c.id} ...`);
    run('npx', ['remotion', 'render', 'src/index.ts', c.comp, raw, `--props=${file}`, ...(a.draft ? ['--scale=0.5'] : []), '--log=error']);
    master(raw, final);
    fs.rmSync(raw);
    console.log(`MILESTONE ${c.id} done: ${path.relative(ROOT, final)}`);
    const thumbComp = c.id === 'long' ? 'Thumbnail' : 'ShortCover';
    run('npx', ['remotion', 'still', 'src/index.ts', thumbComp, path.join(outDir, c.id === 'long' ? 'thumb.jpg' : `cover-${c.id}.jpg`), `--props=${file}`, '--log=error']);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) main();
