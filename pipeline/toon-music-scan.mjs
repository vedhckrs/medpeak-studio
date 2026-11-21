#!/usr/bin/env node
/**
 * Measures every music bed's own loudness over time and saves it next to the bed
 * (assets/toons-music/<name>.shape.json). Free; run it again whenever a bed is added or changed.
 *
 *   node pipeline/toon-music-scan.mjs          (or: npm run toon:music:scan)
 *
 * Why: a bed has rests (a bar where the band stops). When a rest falls in a pause between two
 * lines, or on a time card, the whole sound nearly stops; the first listen with earshot found
 * that in all three videos (2026-11-16). With the shape on file, the director starts the bed at
 * the place where its rests fall under voices (director.ts: bedStart), and the sound check fails
 * a video that still has a hole (toon:sound, "No hole in a pause").
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {MUSIC_DIR} from './lib/toon-audio.mjs';
import {bedRests, BED} from '../src/toons/director.ts';

const STEP = 0.1; // seconds per measurement
for (const f of fs.readdirSync(MUSIC_DIR).filter((x) => x.endsWith('.mp3')).sort()) {
  const file = path.join(MUSIC_DIR, f);
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', `aresample=48000,asetnsamples=n=${Math.round(48000 * STEP)}:p=0,astats=metadata=1:reset=1,ametadata=mode=print:key=lavfi.astats.Overall.RMS_level:file=-`, '-f', 'null', '-'], {encoding: 'utf8', maxBuffer: 1 << 26});
  const db = [...r.stdout.matchAll(/RMS_level=(-?[\d.]+|-inf)/g)].map((m) => (m[1] === '-inf' ? -90 : Math.max(-90, Number(m[1]))));
  if (!db.length) { console.error(`${f}: could not be measured (is ffmpeg installed?)`); process.exit(1); }
  const shape = {step: STEP, seconds: Number((db.length * STEP).toFixed(2)), db: db.map((v) => Number(v.toFixed(1)))};
  fs.writeFileSync(path.join(MUSIC_DIR, f.replace(/\.mp3$/, '.shape.json')), `${JSON.stringify(shape)}\n`);
  const rests = bedRests(shape);
  console.log(`${f.padEnd(14)} ${shape.seconds.toFixed(1).padStart(5)} s, usual level ${rests.usual.toFixed(1)} dB, ${rests.spans.length} rest(s) of ${BED.rest} s or more: ${rests.spans.map(([a, b]) => `${a.toFixed(1)}-${b.toFixed(1)} s`).join(', ') || 'none'}${rests.end < shape.seconds - 0.05 ? `; loops at ${rests.end.toFixed(1)} s` : ''}`);
}
