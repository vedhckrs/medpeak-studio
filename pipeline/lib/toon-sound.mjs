// The sound of a Toon, checked the way the camera and the bodies are: from the same plan the player
// uses (director.ts: soundPlan, bedAt, SOUND), and, when the voice files are there, by building the
// three layers (voices, effects, music) with ffmpeg and measuring how loud each one is.
// Owner, 2026-11-16: "sound design not proper, too loud and poor sound, don't match my style".
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {BED, bedAt, bedRests, bedStart, layoutToon, SOUND, soundPlan, STOP, stopsOf, TOON_FPS} from '../../src/toons/director.ts';
import {ROOT} from './util.mjs';

/** What the mix must keep to (loudness in LU = dB as the ear hears it). */
export const RULES = {perMinute: SOUND.perMinute, minGap: SOUND.minGap, effectsUnderVoice: 9, musicUnderVoice: [7, 13], sameSoundAgain: 4};
/**
 * Format 6 (engine v9, decisions 23-24; checks A1, A2): the levels come from the script's own mix (director.ts `soundOf`:
 * SOUND6, 14 effects a minute), the music in the PAUSES sits 4-8 dB under the voice (about 6), and at most 2 planned stops
 * of 0.4-0.8 s, never on a word.
 */
export const RULES6 = {...RULES, perMinute: 14, pauseUnderVoice: [4, 8]};

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
  const six = (L.format ?? 0) >= 6;
  const R = six ? {...RULES6, perMinute: L.sound.perMinute, minGap: L.sound.minGap} : RULES;
  const seconds = L.total / TOON_FPS;
  const plan = soundPlan(L);
  const res = [];
  const add = (point, pass, detail) => res.push({point, pass: !!pass, detail});
  const perMin = (plan.length / seconds) * 60;
  add('Few sounds', perMin <= R.perMinute, `${plan.length} sound effects in ${seconds.toFixed(0)} s = ${perMin.toFixed(1)} a minute (at most ${R.perMinute})`);
  const gaps = plan.slice(1).map((e, i) => (e.at - plan[i].at) / TOON_FPS);
  add('Kept apart', !gaps.length || Math.min(...gaps) >= R.minGap - 0.01, gaps.length ? `the closest two start ${Math.min(...gaps).toFixed(2)} s apart (at least ${R.minGap})` : 'one sound or none');
  const count = {};
  for (const e of plan.filter((x) => x.rank === 2)) count[e.name] = (count[e.name] ?? 0) + 1;
  const worn = Object.entries(count).filter(([, n]) => n >= R.sameSoundAgain).map(([n, k]) => `${n} x${k}`);
  add('Not the same sound over and over', !worn.length, worn.length ? `used too often: ${worn.join(', ')}` : `${Object.keys(count).length} different story sounds`);
  const missing = [...new Set(plan.map((e) => e.name))].filter((n) => !fs.existsSync(path.join(sfxDir, `${n}.mp3`)));
  add('Sounds exist', !missing.length, missing.length ? `not in the library: ${missing.join(', ')}` : 'every sound is in the library');

  // ---- format 6: the planned music stops (A2): at most 2, each 0.4-0.8 s, never while someone speaks
  if (six) {
    const st = stopsOf(L);
    // the spoken words (the real word times once voiced, the estimate before), as the script gate reads them
    const words = L.lines.flatMap((l) => l.words.map((w) => [l.from + w.start * TOON_FPS, l.from + w.end * TOON_FPS]));
    const onWord = st.filter(([a, b]) => words.some(([wa, wb]) => a < wb && b > wa));
    const lens = st.map(([a, b]) => (b - a) / TOON_FPS);
    add('Music stops (planned)', st.length <= STOP.most && !onWord.length && lens.every((x) => x >= STOP.min - 1e-6 && x <= STOP.max + 1e-6),
      st.length ? `${st.length} stop(s) (at most ${STOP.most}), ${lens.map((x) => x.toFixed(2)).join(', ')} s (${STOP.min}-${STOP.max})${onWord.length ? `; ${onWord.length} on a word: move it into a pause` : ', all in pauses'}` : 'no planned stop');
  }

  // ---- the bed's rests: none may fall in a pause between lines (the bed's shape is on file next to it)
  const shapeFile = toon.music ? path.join(musicDir, `${toon.music}.shape.json`) : null;
  const shape = shapeFile && fs.existsSync(shapeFile) ? JSON.parse(fs.readFileSync(shapeFile, 'utf8')) : null;
  const bed = shape ? bedStart(L, shape) : null;
  if (shape) {
    // the channel's sound is a voice over a CONSTANT bed: a track that stops and starts leaves holes that no placing can hide
    // (tried 2026-11-17: the rest was moved under a word, and earshot still heard 0.7 s of near-silence)
    const r = bedRests(shape);
    const stops = r.spans.filter(([a, b]) => a < r.end - 0.05 && b - a >= BED.hole - 1e-9);
    add('A steady bed', !stops.length, stops.length ? `"${toon.music}" stops for ${stops.map(([a, b]) => `${(b - a).toFixed(1)} s at ${a.toFixed(1)} s`).join(', ')}: use a bed that never goes quiet (toon:music:scan lists them)` : `"${toon.music}" never goes quiet for ${BED.hole} s inside its loop`);
  }
  if (bed) add('No hole in a pause', !bed.holes.length, bed.holes.length ? `the music rests with no voice over it at ${bed.holes.map(([a, b]) => `${a.toFixed(1)}-${b.toFixed(1)} s`).join(', ')} (${BED.gap} s or more is heard as the sound cutting out): use another bed` : `the bed starts ${bed.start.toFixed(2)} s into its track: every rest falls under a voice`);

  // ---- measured layers (only when the voices are on this machine)
  let pauseUnder = null; // format 6: the bed at its pause level, dB under the voice (the scoreboard reads it)
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
      add('Effects under the voice', v.I - e.I >= R.effectsUnderVoice && e.peak <= v.peak - 4, `voices ${v.I.toFixed(1)} LUFS, effects ${e.I.toFixed(1)} LUFS: ${(v.I - e.I).toFixed(1)} under (at least ${R.effectsUnderVoice}); loudest effect peak ${e.peak.toFixed(1)} dB against the voice's ${v.peak.toFixed(1)} dB`);
    }
    if (b.I !== null && !six) {
      const under = v.I - b.I;
      add('Music under the voice', under >= RULES.musicUnderVoice[0] && under <= RULES.musicUnderVoice[1], `music ${b.I.toFixed(1)} LUFS: ${under.toFixed(1)} under the voice (between ${RULES.musicUnderVoice[0]} and ${RULES.musicUnderVoice[1]}: heard, never in the way)`);
    }
    if (six && bedFile && fs.existsSync(bedFile)) {
      // A1: the bed at its PAUSE level (SOUND6.bed x the master `music`) against the voice: about 6 dB under, 4-8 dB
      const p = lufs(['-stream_loop', '-1', '-t', seconds.toFixed(2), '-i', bedFile, '-af', `volume=${(L.sound.bed * L.sound.music).toFixed(3)},ebur128=peak=true`]);
      if (p.I !== null) {
        const under = v.I - p.I;
        pauseUnder = under;
        add('Music in the pauses', under >= RULES6.pauseUnderVoice[0] && under <= RULES6.pauseUnderVoice[1], `music in the pauses ${p.I.toFixed(1)} LUFS: ${under.toFixed(1)} dB under the voice (${RULES6.pauseUnderVoice.join('-')}; a loud track needs a per-video trim)`);
      }
    }
  }
  return {ok: res.every((r) => r.pass), seconds, plan, results: res, measured, levels, bedStart: bed?.start ?? 0, pauseUnder};
};
