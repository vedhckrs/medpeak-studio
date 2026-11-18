#!/usr/bin/env node
/**
 * Render a Toon (videos/<slug>/toon.json) to a 1080x1920, 30 fps Short. Free: all local.
 *
 *   node pipeline/toon-render.mjs <slug>            # full render -> videos/<slug>/renders/toon.mp4
 *   node pipeline/toon-render.mjs <slug> --draft    # half size, fast
 *   node pipeline/toon-render.mjs <slug> --stills   # one still per line -> renders/toon-stills/
 *   node pipeline/toon-render.mjs <slug> --draft --silent   # picture only, estimated timing (script preview)
 *   node pipeline/toon-render.mjs <slug> --music doctor     # the same video over another bed (for the owner's ear)
 *
 * Works before the voice exists (silent, estimated timing). With voices it mixes voice, the
 * sound effects in assets/toons-sfx/ and the music bed, then masters to -14 LUFS.
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {args, PUBLIC, remotion, ROOT, readJson, videoDir, writeJson} from './lib/util.mjs';
import {MUSIC_DIR, SFX_DIR} from './lib/toon-audio.mjs';
import {bedStart, layoutToon} from '../src/toons/director.ts';
import {master} from './render.mjs';

const FPS = 30;
const copyDir = (from, to) => {
  if (!fs.existsSync(from)) return [];
  fs.mkdirSync(to, {recursive: true});
  const files = fs.readdirSync(from).filter((f) => f.endsWith('.mp3'));
  for (const f of files) fs.copyFileSync(path.join(from, f), path.join(to, f));
  return files.map((f) => f.replace(/\.mp3$/, ''));
};

const main = () => {
  const a = args();
  const slug = a._[0];
  const toon = readJson(path.join(videoDir(slug), 'toon.json'));
  const stored = a.silent ? null : readJson(path.join(videoDir(slug), 'toon-timings.json'), null);
  // a voice clip is only used while its words still match the script
  const text = Object.fromEntries(toon.shots.flatMap((s) => s.lines.map((l) => [l.id, l.text])));
  const fresh = stored ? Object.fromEntries(Object.entries(stored.lines).filter(([id, t]) => t.text === undefined || t.text === text[id])) : {};
  const timings = Object.keys(fresh).length ? {lines: fresh} : null;
  const sfx = a.silent ? [] : copyDir(SFX_DIR, path.join(PUBLIC, 'toons', 'sfx'));
  const beds = a.silent ? [] : copyDir(MUSIC_DIR, path.join(PUBLIC, 'toons', 'music'));
  const wanted = a.music ?? toon.music; // --music <name>: try another bed without touching the script
  let music = wanted && beds.includes(wanted) ? wanted : null;
  // start the bed where its rests fall under voices (director.ts: bedStart): the same track, turned so that it begins later
  const shape = music ? readJson(path.join(MUSIC_DIR, `${music}.shape.json`), null) : null;
  if (shape) {
    const {start, end} = bedStart(layoutToon(toon, timings), shape);
    if (start > 0 || end < shape.seconds - 0.05) {
      const turned = `${music}-from-${Math.round(start * 100)}`;
      const cut = `atrim=start=${start}:end=${end.toFixed(2)},asetpts=N/SR/TB`;
      const graph = start > 0 ? `[0:a]${cut}[a];[0:a]atrim=end=${start},asetpts=N/SR/TB[b];[a][b]acrossfade=d=0.12:c1=tri:c2=tri` : `[0:a]${cut},afade=t=out:st=${(end - 0.06).toFixed(2)}:d=0.06`;
      execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', path.join(MUSIC_DIR, `${music}.mp3`), '-filter_complex', graph, '-ar', '44100', '-b:a', '160k', path.join(PUBLIC, 'toons', 'music', `${turned}.mp3`)]);
      console.log(`Music bed "${music}": starts ${start.toFixed(2)} s into the track${end < shape.seconds - 0.05 ? `, loops at ${end.toFixed(1)} s (its faded end is left out)` : ''}, so that its rests fall under voices.`);
      music = turned;
    }
  }
  const voiced = timings ? Object.keys(timings.lines).length : 0;
  const props = path.join(ROOT, 'out', `toon-props-${slug}.json`);
  // actors made in Adobe Animate: when a shot's frames are on this machine, the player shows them
  for (const shot of toon.shots) for (const actor of shot.cast ?? []) {
    const dir = `toons/${slug}/animate/${shot.id}-${actor.who}`;
    const meta = readJson(path.join(PUBLIC, dir, 'meta.json'), null);
    if (meta) { actor.puppet = {dir, ...meta}; console.log(`  puppet  ${shot.id} ${actor.who}: ${meta.frames} frames from Animate`); }
  }
  writeJson(props, {toon, timings, sfx, music});
  const outDir = path.join(videoDir(slug), 'renders');
  fs.mkdirSync(outDir, {recursive: true});
  console.log(`Toon "${slug}": ${voiced} voiced lines, ${sfx.length} sound effects, music: ${music ?? 'none'}`);
  const base = ['src/index.ts', 'Toon'];
  const common = [`--props=${props}`, '--log=error', '--timeout=90000'];

  if (a.stills) {
    const dir = path.join(outDir, 'toon-stills');
    fs.mkdirSync(dir, {recursive: true});
    let at = 0;
    for (const shot of toon.shots) {
      for (const line of shot.lines) {
        const sec = timings?.lines?.[line.id]?.duration ?? Math.max(1, line.text.split(/\s+/).length / 2.8 + 0.35);
        const frames = Math.round((sec + 0.14) * FPS);
        for (const [tag, k] of [['a', 0.2], ['b', 0.7]]) {
          remotion(['still', ...base, path.join(dir, `${line.id}-${tag}.jpg`), `--frame=${at + Math.round(frames * k)}`, '--scale=0.4', ...common]);
        }
        at += frames;
      }
      at += Math.round(0.25 * FPS);
    }
    console.log(`Stills in ${path.relative(ROOT, dir)}`);
    return;
  }

  const raw = path.join(ROOT, 'out', `toon-${slug}-raw.mp4`);
  const final = path.join(outDir, a.draft ? 'toon-draft.mp4' : 'toon.mp4');
  remotion(['render', ...base, raw, ...(a.draft ? ['--scale=0.5'] : []), ...common]);
  if (voiced) master(raw, final);
  else fs.copyFileSync(raw, final);
  fs.rmSync(raw);
  console.log(`MILESTONE toon done: ${path.relative(ROOT, final)}${voiced ? '' : ' (silent preview: no voice yet)'}`);
};

main();
