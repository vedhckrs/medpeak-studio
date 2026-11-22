#!/usr/bin/env node
/**
 * The engine-v9 phase 4 and 5 samples for the owner (free, local, nothing paid: existing clips only).
 *
 *   node --import tsx pipeline/tools/c-samples.mjs motion
 *        the 12 s motion test (src/toons/v8/motion9.tsx) -> out/c-samples/motion-test-12s.mp4
 *   node --import tsx pipeline/tools/c-samples.mjs impacts <slug> <from> <to>
 *        the same slice of a video drawn twice: as it went out (impacts v8) and with the v9 impact policy (no automatic
 *        shake, one flash a video, no burst or shake the script did not keep), and both side by side
 *        -> out/c-samples/impacts-<slug>-{before,after,side}.mp4
 *   node --import tsx pipeline/tools/c-samples.mjs audio <slug> [--to S]
 *        an A/B of the mix made from the video's own stems (its voice clips, its music bed, its sound effects): A = the
 *        timing and levels it went out with, B = format-6 timing (0.22 s between lines, 0.5 s after a scene, the automatic
 *        pauses) and the format-6 levels (the bed about 5 dB up in the pauses, a 3 dB dip under words). Both at -14 LUFS.
 *        C = B with the bed 3 dB lower (the fallback). -> out/c-samples/audio-<slug>-{A-old,B-new,C-new-soft}.wav
 */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {args, isMain, PUBLIC, remotion, ROOT, writeJson} from '../lib/util.mjs';
import {v8Props} from '../toon-v8-render.mjs';
import {bedAt, layoutToon, soundPlan, TOON_FPS} from '../../src/toons/director.ts';

const OUT = path.join(ROOT, 'out', 'c-samples');
const FPS = 60;
const ff = (argv) => execFileSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', ...argv], {stdio: 'inherit'});

const motion = () => {
  fs.mkdirSync(OUT, {recursive: true});
  const out = path.join(OUT, 'motion-test-12s.mp4');
  remotion(['render', path.join('src', 'toons', 'v8', 'entry-motion9.tsx'), 'Motion9', out, '--crf=18', '--log=error']);
  console.log(path.relative(ROOT, out));
};

const impacts = (slug, from, to) => {
  fs.mkdirSync(OUT, {recursive: true});
  const props = v8Props(slug);
  const outs = {};
  for (const [tag, mode] of [['before', 'v8'], ['after', 'v9']]) {
    const file = path.join(ROOT, 'out', `c-props-${slug}-${tag}.json`);
    writeJson(file, {...props, impacts: mode});
    const out = path.join(OUT, `impacts-${slug}-${tag}.mp4`);
    remotion(['render', path.join('src', 'toons', 'v8', 'entry-video.tsx'), 'ToonV8', out, `--props=${file}`, '--crf=18', '--log=error', '--timeout=120000', `--frames=${Math.round(from * FPS)}-${Math.round(to * FPS) - 1}`]);
    outs[tag] = out;
  }
  const side = path.join(OUT, `impacts-${slug}-side.mp4`);
  // left: as it went out; right: the v9 impact policy (the sound is the left one's)
  ff(['-i', outs.before, '-i', outs.after, '-filter_complex', '[0:v]scale=540:960,pad=550:960:0:0:white[a];[1:v]scale=540:960[b];[a][b]hstack=inputs=2[v]', '-map', '[v]', '-map', '0:a?', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', side]);
  console.log(Object.values(outs).concat(side).map((f) => path.relative(ROOT, f)).join('\n'));
};

// ---------------------------------------------------------------- the audio A/B (pure stems, no picture)
const SR = 44100;
const decode = (file) => {
  const raw = execFileSync('ffmpeg', ['-v', 'error', '-i', file, '-ac', '1', '-ar', String(SR), '-f', 'f32le', '-'], {maxBuffer: 1 << 30});
  return new Float32Array(raw.buffer, raw.byteOffset, raw.length / 4);
};
const writeWav = (file, x) => {
  const raw = path.join(OUT, 'tmp.f32');
  fs.writeFileSync(raw, Buffer.from(x.buffer));
  ff(['-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', raw, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', String(SR), file]);
  fs.rmSync(raw);
};
/** One mix: every voice clip where the layout puts it, the story sounds of the sound plan, the bed shaped by bedAt x level. */
const mix = (toon, timings, music, seconds, trim = 1) => {
  const L = layoutToon(toon, timings);
  const n = Math.round(seconds * SR);
  const y = new Float32Array(n), voice = new Float32Array(n), bedOut = new Float32Array(n);
  const add = (x, at, gain, also) => { const o = Math.round(at * SR); for (let i = 0; i < x.length && o + i < n; i++) if (o + i >= 0) { y[o + i] += x[i] * gain; if (also) also[o + i] += x[i] * gain; } };
  for (const l of L.lines) if (l.file) add(decode(path.join(PUBLIC, l.file)), l.from / TOON_FPS, 1, voice);
  for (const e of soundPlan(L)) { const f = path.join(PUBLIC, 'toons', 'sfx', `${e.name}.mp3`); if (fs.existsSync(f)) add(decode(f), e.at / TOON_FPS, e.vol); }
  if (music) {
    const bed = decode(music);
    const lvl = L.sound.music * trim;
    for (let i = 0; i < n; i++) { const v = bed[i % bed.length] * lvl * bedAt(L, (i / SR) * TOON_FPS); y[i] += v; bedOut[i] = v; }
  }
  return {y, voice, bed: bedOut, L};
};
const audio = (slug, to) => {
  fs.mkdirSync(OUT, {recursive: true});
  const props = v8Props(slug);
  const music = props.music ? path.join(PUBLIC, 'toons', 'music', `${props.music}.mp3`) : null;
  const a = mix(props.toon, props.timings, music, to);
  const b = mix({...props.toon, format: 6}, props.timings, music, to);
  // C: the format-6 timing with the bed 3 dB lower than B (about +2 dB in the pauses instead of +5): the fallback if B is too hot
  const c = mix({...props.toon, format: 6}, props.timings, music, to, 10 ** (-3 / 20));
  const fa = path.join(OUT, `audio-${slug}-A-old.wav`), fb = path.join(OUT, `audio-${slug}-B-new.wav`), fc = path.join(OUT, `audio-${slug}-C-new-soft.wav`);
  writeWav(fa, a.y);
  writeWav(fb, b.y);
  writeWav(fc, c.y);
  // the stems at their mix gains (not normalised), so the level numbers can be measured exactly
  const stem = (file, x) => { const raw = path.join(OUT, 'tmp.f32'); fs.writeFileSync(raw, Buffer.from(x.buffer)); ff(['-f', 'f32le', '-ar', String(SR), '-ac', '1', '-i', raw, '-c:a', 'pcm_f32le', file]); fs.rmSync(raw); };
  for (const [tag, m] of [['A', a], ['B', b]]) { stem(path.join(OUT, `audio-${slug}-${tag}-voice.wav`), m.voice); stem(path.join(OUT, `audio-${slug}-${tag}-music.wav`), m.bed); }
  // where the words are, for the level measure: [from, to] seconds of each line's voice in each mix
  const spans = (L) => L.lines.filter((l) => l.file).map((l) => [l.from / TOON_FPS, l.from / TOON_FPS + (props.timings.lines[l.line.id]?.duration ?? 0)]).filter(([x]) => x < to);
  writeJson(path.join(OUT, `audio-${slug}-spans.json`), {A: spans(a.L), B: spans(b.L)});
  console.log([fa, fb, fc].map((f) => path.relative(ROOT, f)).join('\n'));
};

const main = () => {
  const a = args();
  const [what, slug, from, to] = a._;
  if (what === 'motion') return motion();
  if (what === 'impacts') return impacts(slug, Number(from), Number(to));
  if (what === 'audio') return audio(slug, Number(a.to ?? 20));
  throw new Error('usage: c-samples.mjs motion | impacts <slug> <from> <to> | audio <slug> [--to S]');
};
if (isMain(import.meta.url)) main();
