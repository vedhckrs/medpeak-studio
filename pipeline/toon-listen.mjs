#!/usr/bin/env node
/**
 * Listening step: what a finished Toon SOUNDS like, read by earshot (github.com/Leonxlnx/earshot,
 * MIT; runs on this machine's CPU, nothing is uploaded). Claude cannot hear: this is the nearest
 * thing to ears, and it reports numbers, not taste. The owner's ear still decides.
 *
 *   node pipeline/toon-listen.mjs <slug>                 the video at videos/<slug>/renders/toon.mp4
 *   node pipeline/toon-listen.mjs <slug> --file x.mp4    another render of that script
 *   node pipeline/toon-listen.mjs --library              every sound effect against its own description
 *   (or: npm run toon:listen -- <slug>)
 *
 * For a video it answers:
 *   - how loud it is (LUFS, true peak) and how much the loudness moves,
 *   - which of the script's planned sounds can really be heard, when, how loud, and what each
 *     sounds like in words,
 *   - sounds that stand out where the script planned none,
 *   - whether sounds land on the picture's cuts.
 * It writes renders/listen/report.json and renders/listen/sheet.png (a picture of the soundtrack
 * with the frames above it: open it, gaps and pile-ups show at a glance).
 *
 * One-time install (free, about 2.5 GB with its two models):
 *   brew install uv
 *   uv tool install --python 3.12 "earshot @ git+https://github.com/Leonxlnx/earshot@4ac3d2ac2b151e1c23376f9ce7f3047a17050013"
 *   HF_HUB_DISABLE_XET=1 earshot doctor --fetch
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {args, PUBLIC, readJson, ROOT, videoDir, writeJson} from './lib/util.mjs';
import {SFX_DIR} from './lib/toon-audio.mjs';
import {layoutToon, soundPlan, TOON_FPS} from '../src/toons/director.ts';

/** earshot's own Python (uv keeps each tool in its own environment). */
const PY = [process.env.EARSHOT_PYTHON, path.join(os.homedir(), '.local', 'share', 'uv', 'tools', 'earshot', 'bin', 'python')].filter(Boolean).find((p) => fs.existsSync(p));
/** A rough reading of how far a sound stands out over what is already sounding (dB). Ours, not earshot's: a guide for where to look. */
export const HEARD = {clear: 6, soft: 3};
/** A near-silent stretch this long (s) is heard as the sound cutting out. */
export const HOLE = 0.5;

const run = (job) => {
  if (!PY) { console.error('earshot is not installed on this machine. See the install lines at the top of pipeline/toon-listen.mjs.'); process.exit(2); }
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'toon-listen-'));
  const jobFile = path.join(dir, 'job.json');
  const out = path.join(dir, 'out.json');
  writeJson(jobFile, {...job, out});
  execFileSync(PY, [path.join(ROOT, 'pipeline', 'lib', 'toon_listen.py'), jobFile], {stdio: ['ignore', 'inherit', 'inherit'], env: {...process.env, EARSHOT_THREADS: process.env.EARSHOT_THREADS ?? '4'}});
  return readJson(out);
};
const s1 = (n) => (n === null || n === undefined ? '?' : Number(n).toFixed(1));
/** earshot's nearest plain descriptions of a sound, from its own summary line. */
const likeOf = (it) => ((it.describe?.summary ?? '').match(/Sounds most like: (.*?)(?: \[|\. )/)?.[1] ?? '').split(', ').slice(0, 2).join('; ').replace(/ \(z [^)]*\)/g, '');

const a = args();
if (a.library) {
  const {LIBRARY} = await import('./lib/toon-sfx-library.mjs');
  const items = LIBRARY.map(([name, , prompt]) => ({name, prompt, file: path.join(SFX_DIR, `${name}.mp3`)})).filter((x) => fs.existsSync(x.file));
  console.log(`Listening to ${items.length} sound effects (the models take about half a minute to load)...`);
  const r = run({mode: 'library', items});
  writeJson(path.join(ROOT, 'out', 'toons', 'listen-library.json'), r);
  const weak = [];
  console.log('\nLISTEN  the sound library: does each effect sound like its own description?');
  for (const it of r.items) {
    if (it.error) { console.log(`  ?     ${it.name.padEnd(20)} ${it.error}`); continue; }
    const v = it.match?.verdict ?? '?';
    const ok = /strong|plausible/.test(v);
    if (!ok) weak.push(it.name);
    console.log(`  ${ok ? 'ok   ' : 'WEAK '} ${it.name.padEnd(20)} ${String(v).padEnd(10)} z ${s1(it.match?.z).padStart(5)}   hears: ${likeOf(it)}`);
  }
  console.log(weak.length ? `\n${weak.length} effect(s) do not sound like their description: ${weak.join(', ')}. Do not use them until they are re-made or the owner has heard them.` : '\nEvery effect sounds like its description.');
  process.exit(0);
}

const slug = a._[0];
if (!slug) { console.error('Give a slug, or --library.'); process.exit(2); }

/**
 * What makes a voiced line worth a second take (ours, a guide). `speech`: earshot's AudioSet reading must call it speech with at
 * least this probability. `synth`: its "speech synthesizer" reading above this is a robotic-sounding take. Both limits come from a
 * control, the 15 lines of video 4, which the owner heard and published: speech 0.66 to 0.91, synthetic 0.11 to 0.59 (the pitched
 * organ voices read highest). `level`: dB from the other lines. `late`: seconds before the voice starts.
 * A line much brighter or duller than its character's others is a note, not a fault: the words and the acting change it.
 */
export const VOICE = {speech: 0.6, synth: 0.65, level: 2.5, late: 0.3, bright: 0.35};
if (a.voices) {
  // every voiced line on its own, then this mix against the last video the owner approved
  const dir = path.join(PUBLIC, 'toons', slug, 'voice');
  const tim = readJson(path.join(videoDir(slug), 'toon-timings.json'), null);
  if (!tim) { console.error('No voices yet for this script (toon-timings.json is missing).'); process.exit(2); }
  const items = Object.entries(tim.lines).map(([id, t]) => ({id, who: t.who, text: t.text, file: path.join(dir, `${id}.mp3`), words: t.words, duration: t.duration})).filter((x) => fs.existsSync(x.file));
  const mine = path.join(videoDir(slug), 'renders', 'toon.mp4');
  const against = a.against ? path.join(videoDir(String(a.against)), 'renders', 'toon.mp4') : null;
  console.log(`Listening to ${items.length} voiced lines of "${slug}"${against ? ` and comparing the mix with "${a.against}"` : ''} (the models take about half a minute to load)...`);
  const r = run({mode: 'voices', items: items.map(({id, who, file}) => ({id, who, file})), file: fs.existsSync(mine) ? mine : null, against: against && fs.existsSync(against) ? against : null});
  const med = (xs) => { const s = xs.filter((x) => Number.isFinite(x)).sort((p, q) => p - q); return s.length ? s[Math.floor(s.length / 2)] : null; };
  const level = med(r.items.map((it) => it.measure?.lufs));
  const brightOf = {};
  for (const it of r.items) (brightOf[it.who] ??= []).push(it.measure?.brightness_hz);
  const faults = [];
  console.log(`\nLISTEN  every voiced line of "${slug}" on its own (the usual level is ${s1(level)} LUFS)`);
  for (const it of r.items) {
    const src = items.find((x) => x.id === it.id);
    if (it.error) { console.log(`  ?     ${it.id.padEnd(4)} ${it.error}`); faults.push(`${it.id}: could not be read`); continue; }
    const m = it.measure ?? {};
    const why = [];
    const labels = it.describe?.audioset ?? [];
    const speech = Math.max(0, ...labels.filter((l) => /speech|speaking|conversation|narration/i.test(l.label) && !/synthesizer/i.test(l.label)).map((l) => l.p));
    const synth = Math.max(0, ...labels.filter((l) => /synthesizer/i.test(l.label)).map((l) => l.p));
    const other = labels.filter((l) => !/speech|speaking|conversation|narration/i.test(l.label)).slice(0, 2).map((l) => `${l.label.toLowerCase()} ${Math.round(l.p * 100)}%`).join(', ');
    if (speech < VOICE.speech) why.push(`heard as speech only ${Math.round(speech * 100)}% (at least ${Math.round(VOICE.speech * 100)}%)`);
    if (synth > VOICE.synth) why.push(`sounds synthetic (${Math.round(synth * 100)}%)`);
    if ((m.clipped_samples ?? 0) > 0) why.push(`${m.clipped_samples} clipped samples`);
    if (level !== null && Math.abs(m.lufs - level) > VOICE.level) why.push(`${s1(m.lufs - level)} dB from the others' level`);
    if ((m.attack_at ?? 0) > VOICE.late) why.push(`starts ${s1(m.attack_at)} s late`);
    const b = med(brightOf[it.who]);
    const note = b && brightOf[it.who].length > 2 && Math.abs(m.brightness_hz - b) / b > VOICE.bright ? `  (${m.brightness_hz > b ? 'brighter' : 'duller'} than ${it.who}'s other lines)` : '';
    const tail = src?.words?.length ? m.duration - src.words[src.words.length - 1].end : 0;
    if (tail > 0.6) why.push(`${s1(tail)} s of sound after the last word`);
    if (why.length) faults.push(`${it.id} (${it.who}): ${why.join('; ')}`);
    console.log(`  ${why.length ? 'CHECK' : 'ok   '} ${it.id.padEnd(4)} ${it.who.padEnd(9)} ${s1(m.duration).padStart(4)} s  ${s1(m.lufs).padStart(6)} LUFS  peak ${s1(m.true_peak_dbtp).padStart(5)}  bright ${String(Math.round(m.brightness_hz ?? 0)).padStart(5)} Hz  speech ${String(Math.round(speech * 100)).padStart(3)}%  synthetic ${String(Math.round(synth * 100)).padStart(2)}%${other ? `  also: ${other}` : ''}${note}`);
  }
  if (r.ab) console.log(`\n  this mix against "${a.against}": ${r.ab.summary ?? JSON.stringify(r.ab).slice(0, 600)}`);
  if (r.ab_error) console.log(`\n  the comparison with "${a.against}" failed: ${r.ab_error}`);
  writeJson(path.join(videoDir(slug), 'renders', 'listen', 'voices.json'), r);
  console.log(faults.length ? `\n${faults.length} line(s) to look at:\n  ${faults.join('\n  ')}` : '\nEvery line is heard as speech, at one level, with no clipping and no late start.');
  process.exit(faults.length ? 1 : 0);
}
const file = a.file ? path.resolve(a.file) : path.join(videoDir(slug), 'renders', 'toon.mp4');
if (!fs.existsSync(file)) { console.error(`No video at ${file}. Render it first (node pipeline/toon-render.mjs ${slug}).`); process.exit(2); }
const toon = readJson(path.join(videoDir(slug), 'toon.json'));
const stored = readJson(path.join(videoDir(slug), 'toon-timings.json'), null);
const L = layoutToon(toon, stored);
const plan = soundPlan(L).map((e) => ({t: e.at / TOON_FPS, name: e.name, why: e.why}));
const outDir = path.join(videoDir(slug), 'renders', 'listen');
fs.mkdirSync(outDir, {recursive: true});
console.log(`Listening to ${path.relative(ROOT, file)} (the models take about half a minute to load)...`);
const r = run({mode: 'film', file, sheet: path.join(outDir, 'sheet.png'), cues: {events: plan.map((p) => ({t: Number(p.t.toFixed(3)), kind: 'sfx', id: p.name}))}});
const events = r.timeline?.events ?? [];
const loud = r.timeline?.loudness ?? {};
// earshot was given the planned sounds as cues: for each one, is there a new sound right there, and how far does it stand out?
const cues = r.timeline?.sync?.cues?.items ?? [];
const planned = plan.map((p, i) => {
  const c = cues[i] ?? {};
  const over = c.event_prominence_db ?? null; // dB over what is already sounding at that moment
  const found = c.status === 'OK' || c.status === 'near' || c.status === 'peak';
  return {...p, status: c.status ?? 'none', offsetMs: c.offset_ms ?? null, overDb: over, reading: !found ? 'no new sound there' : over === null ? 'a level rise only' : over >= HEARD.clear ? 'stands out' : over >= HEARD.soft ? 'soft' : 'lost under the voice or the music'};
});
const holes = (loud.silences ?? []).map((h) => ({start: h.start, seconds: h.dur, lufs: h.level_lufs}));
const sections = (r.timeline?.sections ?? []).map((x) => ({from: x.start, to: x.end, music: [x.music_genre?.[0]?.tag, x.music_mood?.[0]?.tag].filter(Boolean).join('; ')}));
const report = {slug, file: path.relative(ROOT, file), seconds: L.total / TOON_FPS, measure: r.measure, planned, holes, clipping: loud.clipping ?? null, loudest: loud.max_momentary ?? null, sections, cutsSync: r.timeline?.sync?.cuts ?? null, summary: r.timeline?.summary ?? null, sheet: path.relative(ROOT, r.sheet ?? '')};
writeJson(path.join(outDir, 'report.json'), {...report, events});

const m = r.measure ?? {};
console.log(`\nLISTEN  ${toon.title}  (${report.seconds.toFixed(1)} s)`);
console.log(`  loudness ${s1(m.lufs)} LUFS, true peak ${s1(m.true_peak_dbtp)} dBTP${m.lra_lu !== undefined ? `, range ${s1(m.lra_lu)} LU` : ''}`);
const lost = planned.filter((p) => p.reading !== 'stands out' && p.reading !== 'soft');
console.log(`  planned sounds: ${planned.length - lost.length} of ${planned.length} can be made out (a rough reading: ${HEARD.clear} dB over what is already sounding = stands out, ${HEARD.soft} dB = soft)`);
for (const p of planned) console.log(`     ${p.t.toFixed(1).padStart(5)} s  ${p.name.padEnd(18)} ${p.reading.padEnd(34)} ${p.overDb === null ? '' : `${p.overDb >= 0 ? '+' : ''}${s1(p.overDb)} dB`}${p.offsetMs === null ? '' : `, ${p.offsetMs >= 0 ? '+' : ''}${p.offsetMs} ms`}`);
const long = holes.filter((h) => h.seconds >= HOLE);
console.log(`  holes (the sound nearly stops): ${holes.length ? holes.map((h) => `${h.start.toFixed(1)} s for ${h.seconds.toFixed(1)} s`).join(', ') : 'none'}${long.length ? `   <- ${long.length} long enough to hear as the sound cutting out: check the music bed there` : ''}`);
if (report.clipping?.samples) console.log(`  CLIPPING: ${report.clipping.samples} samples`);
for (const x of sections) if (x.music) console.log(`  the music from ${x.from.toFixed(0)} to ${x.to.toFixed(0)} s reads as: ${x.music} (a hint, not a fact)`);
if (typeof report.summary === 'string') console.log(`\n  earshot's own words:\n  ${report.summary}`);
console.log(`\n  sheet: ${report.sheet}\n  report: ${path.relative(ROOT, path.join(outDir, 'report.json'))}`);
