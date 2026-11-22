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
 *
 * Engine v9 (decision 22, check A3): a track that a FORMAT-6 video plays (its toon.json `music`) must also be from the one
 * music family, by ear: earshot (when it is installed, free, on this machine) reads its tempo (130-165 BPM; a half- or
 * double-time reading counts) and its genre/mood hints, and one of the top two must say funk or playful. A track that
 * fails is listed and the scan exits 1. `--family <file.mp3>` checks one file the same way (a new track before use).
 */
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {MUSIC_DIR} from './lib/toon-audio.mjs';
import {args, isMain, readJson, VIDEOS} from './lib/util.mjs';
import {F6} from './lib/toon-rules.mjs';
import {bedRests, BED} from '../src/toons/director.ts';

/** earshot's JSON for one command, or null when earshot is not installed (the family check is then "not measured"). */
const earshot = (cmd, file, extra = []) => {
  const r = spawnSync('earshot', [cmd, ...extra, '--json', file], {encoding: 'utf8', maxBuffer: 1 << 28, shell: process.platform === 'win32'});
  if (r.error || r.status !== 0) return null;
  try { return JSON.parse(r.stdout); } catch { return null; }
};
/** Check A3: is this track from the format-6 music family, by ear? {ok: true | false | null (not measured), bpm, hints, why}. */
export const musicFamily = (file) => {
  const m = earshot('measure', file, ['--music']);
  const d = earshot('describe', file, ['--top', '4']);
  if (!m || !d) return {ok: null, why: 'earshot is not installed on this machine (pipeline/toon-listen.mjs has the install lines)'};
  const raw = Number((Array.isArray(m) ? m[0] : m).tempo);
  const bpm = [raw, raw * 2, raw / 2].find((b) => b >= F6.bpm[0] && b <= F6.bpm[1]) ?? raw;
  const hints = (d.music_hints ?? []).filter((h) => /music_(genre|mood)/.test(h.category ?? '')).slice(0, 2).map((h) => h.term);
  const fam = hints.some((h) => /funk|playful/i.test(h));
  const inBand = bpm >= F6.bpm[0] && bpm <= F6.bpm[1];
  return {ok: fam && inBand, bpm: Math.round(bpm), hints, why: `${Math.round(bpm)} BPM (${F6.bpm.join('-')})${inBand ? '' : ' OUT OF THE BAND'}; earshot hears: ${hints.join(', ') || 'no genre or mood'}${fam ? '' : ' (not funk or playful)'}`};
};

const STEP = 0.1; // seconds per measurement
const main = () => {
const a = args();
if (a.family) {
  const r = musicFamily(String(a.family));
  console.log(`${r.ok === null ? 'n/m ' : r.ok ? 'PASS' : 'FAIL'}  music family (A3): ${r.why}`);
  process.exit(r.ok === false ? 1 : 0);
}
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
// engine v9 (A3): the tracks of format-6 videos must be from the one music family
const six = fs.readdirSync(VIDEOS).map((d) => readJson(path.join(VIDEOS, d, 'toon.json'), null)).filter((t) => t && (t.format ?? 0) >= 6 && t.music);
let bad = 0;
for (const t of six) {
  const file = path.join(MUSIC_DIR, `${t.music}.mp3`);
  if (!fs.existsSync(file)) { console.log(`n/m   ${t.slug}: its track ${t.music}.mp3 is not made yet`); continue; }
  const r = musicFamily(file);
  if (r.ok === false) bad++;
  console.log(`${r.ok === null ? 'n/m ' : r.ok ? 'PASS' : 'FAIL'}  ${t.slug} music family (A3): ${r.why}`);
}
if (bad) { console.error(`${bad} format-6 track(s) are not from the music family (decision 22): make a new one from MUSIC_TEMPLATE.`); process.exit(1); }
};
if (isMain(import.meta.url)) main();
