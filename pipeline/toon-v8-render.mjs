#!/usr/bin/env node
/**
 * Render a Toon in look v8 (code-drawn) to a 1080 x 1920, 60 fps Short. Free: all local.
 * It plays the same videos/<slug>/toon.json and toon-timings.json as the old player; the pictures come
 * from src/toons/v8/ (video.tsx and the video's shots). Works on macOS and Windows.
 *
 *   node pipeline/toon-v8-render.mjs <slug>              full render -> videos/<slug>/renders/toon-v8.mp4
 *   node pipeline/toon-v8-render.mjs <slug> --draft      half size, fast -> renders/toon-v8-draft.mp4
 *   node pipeline/toon-v8-render.mjs <slug> --stills     two stills a line -> renders/toon-v8-stills/
 *   node pipeline/toon-v8-render.mjs <slug> --at 12.4    one full-size still at that second -> renders/toon-v8-stills/at-12.40.jpg
 *   node pipeline/toon-v8-render.mjs <slug> --silent     picture only, estimated timing
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {args, isMain, PUBLIC, remotion, ROOT, readJson, syncBrand, videoDir, writeJson} from './lib/util.mjs';
import {MUSIC_DIR, SFX_DIR, syncVoices} from './lib/toon-audio.mjs';
import {bedStart, layoutToon} from '../src/toons/director.ts';
import {master} from './render.mjs';

const FPS = 60;
const copyDir = (from, to) => {
  if (!fs.existsSync(from)) return [];
  fs.mkdirSync(to, {recursive: true});
  const files = fs.readdirSync(from).filter((f) => f.endsWith('.mp3'));
  for (const f of files) fs.copyFileSync(path.join(from, f), path.join(to, f));
  return files.map((f) => f.replace(/\.mp3$/, ''));
};

/** The player's props for a video (and the audio it needs, copied into public/). */
export const v8Props = (slug, {silent = false, music: other} = {}) => {
  const toon = readJson(path.join(videoDir(slug), 'toon.json'));
  syncBrand(); // the channel logo for the CTA card
  if (!silent) syncVoices(slug); // the voice clips kept in git (assets/toons-voice) <-> where the player reads them
  const stored = silent ? null : readJson(path.join(videoDir(slug), 'toon-timings.json'), null);
  // a voice clip is only used while its words still match the script
  const text = Object.fromEntries(toon.shots.flatMap((s) => s.lines.map((l) => [l.id, l.text])));
  const fresh = stored ? Object.fromEntries(Object.entries(stored.lines).filter(([id, t]) => t.text === undefined || t.text === text[id])) : {};
  const timings = Object.keys(fresh).length ? {lines: fresh} : null;
  const sfx = silent ? [] : copyDir(SFX_DIR, path.join(PUBLIC, 'toons', 'sfx'));
  const beds = silent ? [] : copyDir(MUSIC_DIR, path.join(PUBLIC, 'toons', 'music'));
  const wanted = other ?? toon.music;
  let music = wanted && beds.includes(wanted) ? wanted : null;
  // start the bed where its rests fall under voices (director.ts: bedStart), as the old render does
  const shape = music ? readJson(path.join(MUSIC_DIR, `${music}.shape.json`), null) : null;
  if (shape) {
    const {start, end} = bedStart(layoutToon(toon, timings), shape);
    if (start > 0 || end < shape.seconds - 0.05) {
      const turned = `${music}-from-${Math.round(start * 100)}`;
      const cut = `atrim=start=${start}:end=${end.toFixed(2)},asetpts=N/SR/TB`;
      const graph = start > 0 ? `[0:a]${cut}[a];[0:a]atrim=end=${start},asetpts=N/SR/TB[b];[a][b]acrossfade=d=0.12:c1=tri:c2=tri` : `[0:a]${cut},afade=t=out:st=${(end - 0.06).toFixed(2)}:d=0.06`;
      execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', path.join(MUSIC_DIR, `${music}.mp3`), '-filter_complex', graph, '-ar', '44100', '-b:a', '160k', path.join(PUBLIC, 'toons', 'music', `${turned}.mp3`)]);
      music = turned;
    }
  }
  return {toon, timings, sfx, music};
};

const main = () => {
  const a = args();
  const slug = a._[0];
  if (!slug) throw new Error('usage: node pipeline/toon-v8-render.mjs <slug> [--draft | --stills | --at <seconds>] [--silent]');
  const props = v8Props(slug, {silent: !!a.silent, music: typeof a.music === 'string' ? a.music : undefined});
  const voiced = props.timings ? Object.keys(props.timings.lines).length : 0;
  const file = path.join(ROOT, 'out', `toon-v8-props-${slug}.json`);
  writeJson(file, props);
  const outDir = path.join(videoDir(slug), 'renders');
  fs.mkdirSync(outDir, {recursive: true});
  console.log(`Toon v8 "${slug}": ${voiced} voiced lines, ${props.sfx.length} sound effects, music: ${props.music ?? 'none'}`);
  const base = [path.join('src', 'toons', 'v8', 'entry-video.tsx'), 'ToonV8'];
  const common = [`--props=${file}`, '--log=error', '--timeout=120000'];
  const stills = path.join(outDir, 'toon-v8-stills');

  if (a.at !== undefined) {
    fs.mkdirSync(stills, {recursive: true});
    const sec = Number(a.at);
    const out = path.join(stills, `at-${sec.toFixed(2)}.jpg`);
    remotion(['still', ...base, out, `--frame=${Math.round(sec * FPS)}`, ...common]);
    console.log(path.relative(ROOT, out));
    return;
  }
  if (a.stills) {
    fs.mkdirSync(stills, {recursive: true});
    const L = layoutToon(props.toon, props.timings); // 30 frames a second
    for (const l of L.lines) {
      for (const [tag, k] of [['a', 0.25], ['b', 0.75]]) {
        remotion(['still', ...base, path.join(stills, `${l.line.id}-${tag}.jpg`), `--frame=${Math.round((l.from + l.frames * k) * 2)}`, '--scale=0.5', ...common]);
      }
      console.log(`stills ${l.line.id}`);
    }
    console.log(`Stills in ${path.relative(ROOT, stills)}`);
    return;
  }

  const raw = path.join(ROOT, 'out', `toon-v8-${slug}-raw.mp4`);
  const final = path.join(outDir, a.draft ? 'toon-v8-draft.mp4' : 'toon-v8.mp4');
  remotion(['render', ...base, raw, ...(a.draft ? ['--scale=0.5'] : ['--crf=16']), ...common]);
  if (voiced) master(raw, final);
  else fs.copyFileSync(raw, final);
  fs.rmSync(raw);
  console.log(`MILESTONE toon v8 done: ${path.relative(ROOT, final)}${voiced ? '' : ' (silent preview: no voice yet)'}`);
};

if (isMain(import.meta.url)) main();
