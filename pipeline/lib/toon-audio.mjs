// Shared audio helpers for the Toons pipeline (ffmpeg only, free).
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync, spawnSync} from 'node:child_process';
import {ROOT, readJson} from './util.mjs';

export const CAST_FILE = path.join(ROOT, 'skill', 'medpeak-health', 'toons-cast.json');
export const SFX_DIR = path.join(ROOT, 'assets', 'toons-sfx');
export const MUSIC_DIR = path.join(ROOT, 'assets', 'toons-music');
export const loadCast = () => readJson(CAST_FILE);
/** The people of the cast (everyone else but the doctor and the narrator is a body character: an organ, a cell, a chemical). */
export const PEOPLE = ['patient', 'mom', 'kid', 'grandpa', 'baby', 'dad'];
/** A character's role for its speaking speed (decision 5): body / people / doctor / narrator. */
export const roleOf = (who) => (who === 'doctor' ? 'doctor' : who === 'narrator' ? 'narrator' : PEOPLE.includes(who) ? 'people' : 'body');
/**
 * The ElevenLabs speed of a line. Format 6 (decision 5: "the same voices, only the pace changes"): the character's own speed
 * moved into its role's band from toons-cast.json `roleSpeed` (body 1.12-1.2, people 1.05-1.1, the doctor 0.92-0.95); a
 * line's own `speed` still wins. The videos already out keep the character's own speed.
 */
export const speedOf = (cast, who, {format = 0, line} = {}) => {
  const own = cast.cast[who]?.speed ?? 1;
  if (line !== undefined && line !== null) return Math.max(0.7, Math.min(1.2, line));
  if (format < 6) return own;
  const band = cast.roleSpeed?.[roleOf(who)];
  return band ? Math.max(band[0], Math.min(band[1], own)) : own;
};

/**
 * A Toon's voice clips are paid for once, so they are kept in git in assets/toons-voice/<slug>/ (owner,
 * 2026-11-20), next to the sound effects and music beds. The players read them from public/toons/<slug>/voice/
 * (never in git). This keeps the two folders the same: a clip made on this machine is saved into assets,
 * and a clip that came with the repo is put where the player looks. Returns how many files it copied.
 */
export const VOICE_DIR = path.join(ROOT, 'assets', 'toons-voice');
export const syncVoices = (slug) => {
  const kept = path.join(VOICE_DIR, slug);
  const live = path.join(ROOT, 'public', 'toons', slug, 'voice');
  const mp3s = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.mp3')) : []);
  let n = 0;
  const copy = (from, to, f) => { fs.mkdirSync(to, {recursive: true}); fs.copyFileSync(path.join(from, f), path.join(to, f)); n++; };
  // the NEWER copy wins (a clip made again here, or a clip changed in git, e.g. sped up): never the stale one
  const differ = (f) => fs.statSync(path.join(kept, f)).size !== fs.statSync(path.join(live, f)).size;
  const newer = (a, b, f) => fs.statSync(path.join(a, f)).mtimeMs > fs.statSync(path.join(b, f)).mtimeMs;
  for (const f of mp3s(live)) {
    if (!fs.existsSync(path.join(kept, f))) copy(live, kept, f);
    else if (differ(f) && newer(live, kept, f)) copy(live, kept, f);
  }
  for (const f of mp3s(kept)) if (!fs.existsSync(path.join(live, f)) || (differ(f) && newer(kept, live, f))) copy(kept, live, f);
  return n;
};

export const seconds = (file) => Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());
const run = (input, filters, out) => execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-i', input, '-af', filters, '-ar', '44100', '-b:a', '160k', out]);
// ffmpeg prints its measurements on stderr. No shell here: `sh` does not exist on Windows.
const probe = (file, filters) => { const r = spawnSync('ffmpeg', ['-hide_banner', '-i', file, '-af', filters, '-f', 'null', '-'], {encoding: 'utf8', maxBuffer: 1 << 26}); return `${r.stdout ?? ''}${r.stderr ?? ''}`; };
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
 * otherwise sit 8 dB apart) and catch the peaks with a limiter. The caller scales the word timings by `tempo`.
 */
export const voiceFx = (input, output, semitones = 0, tempo = 1, cut = null) => {
  const k = 2 ** (semitones / 12);
  const pitch = semitones ? `asetrate=44100*${k.toFixed(5)},aresample=44100,atempo=${(1 / k).toFixed(5)}` : 'aresample=44100';
  const lufs = loudness(input, pitch);
  const gain = lufs === null ? -2 - peakOf(input, pitch) : VOICE_LUFS - lufs;
  fs.mkdirSync(path.dirname(output), {recursive: true});
  // `tempo` (0.85 to 1.15; 0.85-0.9 for the doctor's calmer answer, format 6): a line said a touch faster or slower without changing its pitch (a hook that must land inside 2.5 s)
  const pace = tempo && tempo !== 1 ? `,atempo=${Math.max(0.85, Math.min(1.15, tempo)).toFixed(4)}` : '';
  // `cut` (seconds of the finished clip to keep): a stray sound after the last word is trimmed off with a short fade
  const end = cut ? `,atrim=0:${Number(cut).toFixed(3)},afade=t=out:st=${Math.max(0, cut - 0.05).toFixed(3)}:d=0.05` : '';
  run(input, `${pitch}${pace}${end},volume=${gain.toFixed(2)}dB,alimiter=limit=0.84:level=0`, output);
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
