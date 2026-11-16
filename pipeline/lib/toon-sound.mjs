// The sound of a Toon, checked the way the camera and the bodies are: from the same plan the player
// uses (director.ts: soundPlan, bedAt, SOUND), and, when the voice files are there, by building the
// three layers (voices, effects, music) with ffmpeg and measuring how loud each one is.
// Owner, 2026-11-16: "sound design not proper, too loud and poor sound, don't match my style".
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {BED, bedAt, bedStart, layoutToon, SOUND, soundPlan, TOON_FPS} from '../../src/toons/director.ts';
import {ROOT} from './util.mjs';

/** What the mix must keep to (loudness in LU = dB as the ear hears it). */
export const RULES = {perMinute: SOUND.perMinute, minGap: SOUND.minGap, effectsUnderVoice: 9, musicUnderVoice: [7, 13], sameSoundAgain: 4};

const lufs = (args) => {
  const err = spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...args, '-f', 'null', '-'], {encoding: 'utf8', maxBuffer: 1 << 26}).stderr;
  const tail = err.slice(err.lastIndexOf('Summary'));
  const m = tail.match(/I:\s+(-?[\d.]+) LUFS/);
  const p = tail.match(/Peak:\s+(-?[\d.]+) dBFS/);
  return {I: m ? Number(m[1]) : null, peak: p ? Number(p[1]) : null};
};
/** Mix clips [{file, at (s), vol}] into one layer and measure it. */
const layer = (clips, seconds) => {
  if (!clips.length) return {I: null, peak: null};
  const ins = clips.flatMap((c) => ['-i', c.file]);
  const chains = clips.map((c, i) => `[${i}:a]aresample=48000,volume=${c.vol.toFixed(3)},adelay=${Math.round(c.at * 1000)}:all=1[a${i}]`).join(';');
  const mix = `${chains};${clips.map((_, i) => `[a${i}]`).join('')}amix=inputs=${clips.length}:normalize=0:duration=longest,apad=whole_dur=${seconds.toFixed(2)},ebur128=peak=true`;
  return lufs([...ins, '-filter_complex', mix]);
};

export const checkSound = (toon, timings, {sfxDir = path.join(ROOT, 'assets', 'toons-sfx'), musicDir = path.join(ROOT, 'assets', 'toons-music'), publicDir = path.join(ROOT, 'public')} = {}) => {
  const L = layoutToon(toon, timings);
  const seconds = L.total / TOON_FPS;
  const plan = soundPlan(L);
  const res = [];
  const add = (point, pass, detail) => res.push({point, pass: !!pass, detail});
  const perMin = (plan.length / seconds) * 60;
  add('Few sounds', perMin <= RULES.perMinute, `${plan.length} sound effects in ${seconds.toFixed(0)} s = ${perMin.toFixed(1)} a minute (at most ${RULES.perMinute})`);
  const gaps = plan.slice(1).map((e, i) => (e.at - plan[i].at) / TOON_FPS);
  add('Kept apart', !gaps.length || Math.min(...gaps) >= RULES.minGap - 0.01, gaps.length ? `the closest two start ${Math.min(...gaps).toFixed(2)} s apart (at least ${RULES.minGap})` : 'one sound or none');
  const count = {};
  for (const e of plan.filter((x) => x.rank === 2)) count[e.name] = (count[e.name] ?? 0) + 1;
  const worn = Object.entries(count).filter(([, n]) => n >= RULES.sameSoundAgain).map(([n, k]) => `${n} x${k}`);
  add('Not the same sound over and over', !worn.length, worn.length ? `used too often: ${worn.join(', ')}` : `${Object.keys(count).length} different story sounds`);
  const missing = [...new Set(plan.map((e) => e.name))].filter((n) => !fs.existsSync(path.join(sfxDir, `${n}.mp3`)));
  add('Sounds exist', !missing.length, missing.length ? `not in the library: ${missing.join(', ')}` : 'every sound is in the library');

  // ---- the bed's rests: none may fall in a pause between lines (the bed's shape is on file next to it)
  const shapeFile = toon.music ? path.join(musicDir, `${toon.music}.shape.json`) : null;
  const shape = shapeFile && fs.existsSync(shapeFile) ? JSON.parse(fs.readFileSync(shapeFile, 'utf8')) : null;
  const bed = shape ? bedStart(L, shape) : null;
  if (bed) add('No hole in a pause', !bed.holes.length, bed.holes.length ? `the music rests with no voice over it at ${bed.holes.map(([a, b]) => `${a.toFixed(1)}-${b.toFixed(1)} s`).join(', ')} (${BED.hole} s or more is heard as the sound cutting out): use another bed` : `the bed starts ${bed.start.toFixed(2)} s into its track: every rest falls under a voice`);

  // ---- measured layers (only when the voices are on this machine)
  const voices = L.lines.filter((l) => l.file && fs.existsSync(path.join(publicDir, l.file))).map((l) => ({file: path.join(publicDir, l.file), at: l.from / TOON_FPS, vol: 1}));
  const measured = voices.length === L.lines.length && !missing.length;
  let levels = null;
  if (measured) {
    const v = layer(voices, seconds);
    const e = layer(plan.map((x) => ({file: path.join(sfxDir, `${x.name}.mp3`), at: x.at / TOON_FPS, vol: x.vol})), seconds);
    const bedFile = toon.music ? path.join(musicDir, `${toon.music}.mp3`) : null;
    let bedVol = 0;
    for (let f = 0; f < L.total; f += 15) bedVol += bedAt(L, f);
    bedVol /= Math.ceil(L.total / 15);
    const b = bedFile && fs.existsSync(bedFile) ? lufs(['-stream_loop', '-1', '-t', seconds.toFixed(2), '-i', bedFile, '-af', `volume=${bedVol.toFixed(3)},ebur128=peak=true`]) : {I: null, peak: null};
    levels = {voice: v, effects: e, music: b};
    if (e.I !== null) {
      add('Effects under the voice', v.I - e.I >= RULES.effectsUnderVoice && e.peak <= v.peak - 4, `voices ${v.I.toFixed(1)} LUFS, effects ${e.I.toFixed(1)} LUFS: ${(v.I - e.I).toFixed(1)} under (at least ${RULES.effectsUnderVoice}); loudest effect peak ${e.peak.toFixed(1)} dB against the voice's ${v.peak.toFixed(1)} dB`);
    }
    if (b.I !== null) {
      const under = v.I - b.I;
      add('Music under the voice', under >= RULES.musicUnderVoice[0] && under <= RULES.musicUnderVoice[1], `music ${b.I.toFixed(1)} LUFS: ${under.toFixed(1)} under the voice (between ${RULES.musicUnderVoice[0]} and ${RULES.musicUnderVoice[1]}: heard, never in the way)`);
    }
  }
  return {ok: res.every((r) => r.pass), seconds, plan, results: res, measured, levels, bedStart: bed?.start ?? 0};
};
