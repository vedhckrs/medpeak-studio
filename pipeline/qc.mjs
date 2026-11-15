#!/usr/bin/env node
/**
 * Quality check on the finished files. Free.
 *   node pipeline/qc.mjs <slug>
 * Checks each render: resolution + 60 fps, length (Shorts under 60 s... YouTube allows 3 min, we aim for <60 s),
 * loudness -14 LUFS (+-1) and true peak <= -1 dBTP, no black stretch over 0.5 s, no silent stretch over 2 s
 * inside the spoken part, voice present for every scene, and the script gate (check.mjs) passing.
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {args, loadTimings, loadVideo, videoDir} from './lib/util.mjs';
import {checkVideo} from './check.mjs';

const ff = (argv) => {
  try { return execFileSync('ffmpeg', ['-hide_banner', ...argv, '-f', 'null', '-'], {stdio: ['ignore', 'ignore', 'pipe']}).toString(); }
  catch (e) { return e.stderr?.toString() || ''; }
};
const probe = (file) => JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-print_format', 'json', '-show_streams', '-show_format', file]).toString());

const qcFile = (file, isShort) => {
  const out = [];
  const add = (name, pass, detail) => out.push({name, pass, detail});
  const p = probe(file);
  const v = p.streams.find((s) => s.codec_type === 'video');
  const dur = Number(p.format.duration);
  const [w, h] = isShort ? [1080, 1920] : [1920, 1080];
  const fps = eval(v.r_frame_rate); // "60/1"
  add('Size + fps', v.width === w && v.height === h && Math.round(fps) === 60, `${v.width}x${v.height} @ ${fps.toFixed(2)}`);
  add('Length', isShort ? dur <= 60 : dur >= 180, `${dur.toFixed(1)} s`);
  const ln = ff(['-i', file, '-af', 'ebur128=peak=true']);
  const I = Number((ln.match(/I:\s+(-?[\d.]+) LUFS/g) || []).pop()?.match(/-?[\d.]+/)[0]);
  const TP = Number((ln.match(/Peak:\s+(-?[\d.]+) dBFS/g) || []).pop()?.match(/-?[\d.]+/)[0]);
  add('Loudness', Math.abs(I + 14) <= 1 && TP <= -0.9, `${I} LUFS, true peak ${TP} dBTP`);
  const black = [...ff(['-i', file, '-vf', 'blackdetect=d=0.5:pix_th=0.05', '-an']).matchAll(/black_duration:([\d.]+)/g)].map((m) => Number(m[1]));
  add('No black frames', !black.length, black.length ? `${black.length} black stretch(es)` : 'none');
  const spokenEnd = isShort ? dur - 0.5 : dur - 13; // long video ends in a 12 s music-only end screen
  const silences = [...ff(['-i', file, '-af', 'silencedetect=n=-45dB:d=2', '-vn']).matchAll(/silence_start: ([\d.]+)/g)].map((m) => Number(m[1])).filter((s) => s < spokenEnd);
  add('No dead air', !silences.length, silences.length ? `silence at ${silences.map((s) => s.toFixed(1)).join(', ')} s` : 'none over 2 s');
  return out;
};

const main = () => {
  const slug = args()._[0];
  const video = loadVideo(slug);
  const dir = path.join(videoDir(slug), 'renders');
  let ok = checkVideo(slug, {quiet: true});
  console.log(`Script gate (Retention 7 + sources): ${ok ? 'PASS' : 'FAIL'}`);
  const timings = loadTimings(slug);
  const missing = video.scenes.filter((s) => !timings?.scenes?.[s.id]).map((s) => s.id);
  console.log(`Voice for every scene: ${missing.length ? `FAIL (missing ${missing.length})` : 'PASS'}`);
  ok &&= !missing.length;
  const files = [['long.mp4', false], ...(video.shorts || []).map((s) => [`short-${s.id}.mp4`, true])];
  for (const [f, isShort] of files) {
    const file = path.join(dir, f);
    if (!fs.existsSync(file)) { console.log(`\n${f}: not rendered`); ok = false; continue; }
    console.log(`\n${f}`);
    for (const r of qcFile(file, isShort)) { console.log(`  ${r.pass ? 'PASS' : 'FAIL'}  ${r.name.padEnd(16)} ${r.detail}`); ok &&= r.pass; }
  }
  console.log(ok ? '\nQC PASS' : '\nQC FAILED');
  process.exit(ok ? 0 : 1);
};

main();
