// Shared audio helpers for the Toons pipeline (ffmpeg only, free).
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {ROOT, readJson} from './util.mjs';

export const CAST_FILE = path.join(ROOT, 'skill', 'medpeak-health', 'toons-cast.json');
export const SFX_DIR = path.join(ROOT, 'assets', 'toons-sfx');
export const MUSIC_DIR = path.join(ROOT, 'assets', 'toons-music');
export const loadCast = () => readJson(CAST_FILE);

export const seconds = (file) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());
const run = (input, filters, out) => execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', input, '-af', filters, '-ar', '44100', '-b:a', '160k', out]);
const probe = (file, filters) => execFileSync('sh', ['-c', 'ffmpeg -hide_banner -i "$1" -af "$2" -f null - 2>&1 || true', 'sh', file, filters], {encoding: 'utf8'});
/** Peak and average level in dB (ffmpeg volumedetect). */
export const levels = (file, pre = 'anull') => {
  const r = probe(file, `${pre},volumedetect`);
  const num = (k) => { const m = r.match(new RegExp(`${k}_volume: (-?[\\d.]+) dB`)); return m ? Number(m[1]) : -99; };
  return {max: num('max'), mean: num('mean')};
};
export const peakOf = (file, pre = 'anull') => levels(file, pre).max;
/** How loud it sounds, in LUFS (null when the clip is too short to measure). */
export const loudness = (file, pre = 'anull') => {
  const m = [...probe(file, `${pre},ebur128`).matchAll(/I:\s+(-?[\d.]+) LUFS/g)].pop();
  const v = m ? Number(m[1]) : NaN;
  return Number.isFinite(v) && v > -50 ? v : null;
};

export const VOICE_LUFS = -17;
/**
 * Give a line its character: shift the pitch by `semitones` (formants move too, which is the
 * cartoon sound we want) without changing the speed, so the word timings stay valid. Then bring
 * every line to the same loudness (not the same peak: a shouted line and a mumbled line would
 * otherwise sit 8 dB apart) and catch the peaks with a limiter.
 */
export const voiceFx = (input, output, semitones = 0) => {
  const k = 2 ** (semitones / 12);
  const pitch = semitones ? `asetrate=44100*${k.toFixed(5)},aresample=44100,atempo=${(1 / k).toFixed(5)}` : 'aresample=44100';
  const lufs = loudness(input, pitch);
  const gain = lufs === null ? -2 - peakOf(input, pitch) : VOICE_LUFS - lufs;
  fs.mkdirSync(path.dirname(output), {recursive: true});
  run(input, `${pitch},volume=${gain.toFixed(2)}dB,alimiter=limit=0.84:level=0`, output);
};
/**
 * Tidy a generated sound effect: cut leading silence, tiny fade-out, and set its level so that a
 * click and a long trombone feel equally loud (peak at -3 dB, but never an average above -21 dB).
 */
export const sfxFx = (input, output) => {
  const pre = 'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.02';
  const lv = levels(input, pre);
  const gain = Math.min(-3 - lv.max, -21 - lv.mean);
  fs.mkdirSync(path.dirname(output), {recursive: true});
  run(input, `${pre},volume=${gain.toFixed(2)}dB,areverse,afade=t=in:d=0.04,areverse`, output);
};
/** Level a music bed to a quiet, even -20 LUFS so the mix volume means the same for every bed. */
export const bedFx = (input, output) => {
  fs.mkdirSync(path.dirname(output), {recursive: true});
  run(input, 'loudnorm=I=-20:TP=-2:LRA=9', output);
};
