#!/usr/bin/env node
/**
 * The storyboard of a FINISHED v8 video (rabies v4, 2026-11-20): one frame from the middle of each spoken line,
 * the transitions between places and the end card, cut from videos/<slug>/renders/toon-v8.mp4 and laid out as
 * 16:9 sheets (1920 x 1080 JPG) in videos/<slug>/renders/storyboard/. Free, all local. Works on macOS and Windows
 * (needs ffmpeg on the PATH and Python 3 with Pillow).
 *
 *   node --import tsx pipeline/toon-v8-board.mjs <slug>
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';
import {args, isMain, readJson, ROOT, videoDir} from './lib/util.mjs';
import {layoutToon, TOON_FPS} from '../src/toons/director.ts';

export const boardFrames = (toon, timings, ctaSeconds = 0) => {
  const L = layoutToon(toon, timings);
  const frames = [];
  L.shots.forEach((s, i) => {
    if (i > 0) frames.push({at: s.from / TOON_FPS + 0.3, title: `${L.shots[i - 1].shot.id} > ${s.shot.id} · transition`, text: `${L.shots[i - 1].shot.set} to ${s.shot.set}`});
    for (const l of L.lines.filter((x) => x.si === i)) frames.push({at: (l.from + l.frames * 0.6) / TOON_FPS, title: `${s.shot.id} · ${l.line.id} · ${l.line.who}`, text: l.line.text});
  });
  const end = L.total / TOON_FPS;
  if (ctaSeconds) {
    frames.push({at: end + ctaSeconds * 0.4, title: 'End card · narrator', text: 'the points appear as the narrator says them'});
    frames.push({at: end + ctaSeconds - 0.3, title: 'End card · final', text: 'Follow MedPeak Health for more health tips that keep you safe.'});
  }
  return frames;
};

const main = () => {
  const slug = args()._[0];
  if (!slug) throw new Error('usage: node --import tsx pipeline/toon-v8-board.mjs <slug>');
  const dir = videoDir(slug);
  const video = path.join(dir, 'renders', 'toon-v8.mp4');
  if (!fs.existsSync(video)) throw new Error(`render the video first: ${path.relative(ROOT, video)}`);
  const toon = readJson(path.join(dir, 'toon.json'));
  const timings = readJson(path.join(dir, 'toon-timings.json'), null);
  const dur = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video]).toString().trim());
  const story = layoutToon(toon, timings).total / TOON_FPS;
  const frames = boardFrames(toon, timings, Math.max(0, dur - story));
  const out = path.join(dir, 'renders', 'storyboard');
  fs.mkdirSync(out, {recursive: true});
  frames.forEach((f, i) => {
    f.file = path.join(out, `f${String(i).padStart(2, '0')}.jpg`);
    execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-ss', f.at.toFixed(3), '-i', video, '-frames:v', '1', '-vf', 'scale=540:-1', f.file]);
  });
  const list = path.join(out, 'frames.json');
  fs.writeFileSync(list, JSON.stringify({title: toon.title, slug, frames}, null, 2));
  const py = process.platform === 'win32' ? 'python' : 'python3';
  const r = spawnSync(py, [path.join(ROOT, 'pipeline', 'tools', 'toon-v8-board.py'), list, out], {stdio: 'inherit'});
  if (r.status !== 0) throw new Error('the sheet layout failed (Python 3 with Pillow?)');
};

if (isMain(import.meta.url)) main();
