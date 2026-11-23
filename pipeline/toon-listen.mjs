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
import {roleOf, SFX_DIR} from './lib/toon-audio.mjs';
import {layoutToon, soundPlan, TOON_FPS} from '../src/toons/director.ts';

/** The video's final render: the look-v8 player's (toon-v8.mp4) when it exists, else the old engine's (toon.mp4). */
const renderOf = (slug) => ['toon-v8.mp4', 'toon.mp4'].map((f) => path.join(videoDir(slug), 'renders', f)).find((f) => fs.existsSync(f)) ?? path.join(videoDir(slug), 'renders', 'toon.mp4');

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

// ---------------------------------------------------------------- the words (speech-to-text, on this Mac)
if (a.words) {
  const {WORDS, wordsPython, wordsModelDir, diffWords, normWords} = await import('./lib/toon-words.mjs');
  const py = wordsPython();
  const model = wordsModelDir();
  if (!fs.existsSync(py) || !fs.existsSync(path.join(model, 'model.safetensors'))) {
    console.error(`The word listener is not installed. Install: uv tool install --python 3.12 "parakeet-mlx==0.7.0"; model ${WORDS.model} at ${WORDS.revision} (2.5 GB), fetched once with HF_HUB_DISABLE_XET=1.`);
    process.exit(2);
  }
  const tim = readJson(path.join(videoDir(slug), 'toon-timings.json'), null);
  if (!tim) { console.error('No voices yet for this script (toon-timings.json is missing).'); process.exit(2); }
  const dir = path.join(PUBLIC, 'toons', slug, 'voice');
  const lines = Object.entries(tim.lines).map(([id, t]) => ({id, who: t.who, text: t.text, words: t.words, file: path.join(dir, `${id}.mp3`)})).filter((x) => fs.existsSync(x.file));
  const listen = (items) => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'toon-words-'));
    const jobFile = path.join(tmp, 'job.json');
    const out = path.join(tmp, 'out.json');
    writeJson(jobFile, {model, items: items.map(({id, file}) => ({id, file})), out});
    execFileSync(py, [path.join(ROOT, 'pipeline', 'lib', 'toon_words.py'), jobFile], {stdio: ['ignore', 'inherit', 'inherit'], env: {...process.env, HF_HUB_OFFLINE: '1'}});
    return Object.fromEntries(readJson(out).items.map((it) => [it.id, it]));
  };

  if (a.selftest) {
    // A checker that passes everything measures nothing: break clips on purpose and see that each is caught.
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'toon-words-test-'));
    const cases = [];
    const long = lines.filter((l) => normWords(l.text).length >= 6 && (l.words ?? []).length >= 6).slice(0, 6);
    long.forEach((l, n) => {
      // 1. a word cut out of the middle of the line
      const k = Math.floor(l.words.length / 2);
      const w = l.words[k];
      const cut = path.join(tmp, `${l.id}-cut.mp3`);
      execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', l.file, '-filter_complex', `[0:a]atrim=0:${Math.max(0, w.start - 0.02).toFixed(3)},asetpts=N/SR/TB[a];[0:a]atrim=${(w.end + 0.02).toFixed(3)},asetpts=N/SR/TB[b];[a][b]concat=n=2:v=0:a=1[o]`, '-map', '[o]', cut]);
      cases.push({id: `${l.id}-cut`, file: cut, text: l.text, what: `"${w.w}" cut out of ${l.id}`});
      // 2. another line's sound under this line's words
      const other = long[(n + 1) % long.length];
      if (other !== l) cases.push({id: `${l.id}-swap`, file: other.file, text: l.text, what: `${other.id}'s sound checked against ${l.id}'s words`});
    });
    console.log(`Self-test: ${cases.length} clips broken on purpose (the model takes a few seconds to load)...`);
    const heard = listen(cases);
    let caught = 0;
    for (const c of cases) {
      const d = diffWords(c.text, heard[c.id]?.text ?? '');
      const ok = d.faults.length > 0;
      if (ok) caught++;
      console.log(`  ${ok ? 'caught' : 'MISSED'}  ${c.what.padEnd(46)} heard: "${heard[c.id]?.text ?? heard[c.id]?.error}"`);
    }
    console.log(caught === cases.length ? `\nEvery broken clip was caught (${caught} of ${cases.length}).` : `\n${cases.length - caught} broken clip(s) were NOT caught: the word check cannot be trusted yet.`);
    process.exit(caught === cases.length ? 0 : 1);
  }

  console.log(`Writing down ${lines.length} voiced lines of "${slug}" with ${WORDS.tool} (${WORDS.model}); the model takes a few seconds to load...`);
  const heard = listen(lines);
  const rows = [];
  const faults = [];
  const notes = [];
  let total = 0;
  let wrong = 0;
  console.log(`\nWORDS  what each line of "${slug}" says, against the script`);
  for (const l of lines) {
    const h = heard[l.id];
    if (!h || h.error) { console.log(`  ?     ${l.id.padEnd(4)} ${h?.error ?? 'no result'}`); faults.push(`${l.id}: could not be read`); continue; }
    const d = diffWords(l.text, h.text);
    const unsure = (h.words ?? []).filter((w) => w.conf < WORDS.unsure).map((w) => `${w.w} (${Math.round(w.conf * 100)}%)`);
    total += d.script.length;
    wrong += d.missing.length + d.extra.length + d.changed.length;
    rows.push({id: l.id, who: l.who, script: l.text, heard: h.text, faults: d.faults, notes: d.notes, unsure, words: h.words});
    for (const f of d.faults) faults.push(`${l.id} (${l.who}): ${f}`);
    for (const n of d.notes) notes.push(`${l.id} (${l.who}): ${n}`);
    if (unsure.length) notes.push(`${l.id} (${l.who}): the listener was unsure of ${unsure.join(', ')}`);
    console.log(`  ${d.faults.length ? 'CHECK' : d.notes.length || unsure.length ? 'note ' : 'ok   '} ${l.id.padEnd(4)} ${l.who.padEnd(9)} heard: "${h.text}"`);
  }
  writeJson(path.join(videoDir(slug), 'renders', 'listen', 'words.json'), {listener: WORDS, lines: rows, total, wrong});
  console.log(`\n  ${total} script words, ${wrong} heard differently (${total ? ((wrong / total) * 100).toFixed(1) : '0'}%)`);
  if (notes.length) console.log(`\n${notes.length} note(s) to look at by ear:\n  ${notes.join('\n  ')}`);
  console.log(faults.length ? `\n${faults.length} word(s) differ from the script:\n  ${faults.join('\n  ')}` : '\nEvery line says its script, word for word.');
  process.exit(faults.length ? 1 : 0);
}

/**
 * What makes a voiced line worth a second take (ours, a guide). `speech`: earshot's AudioSet reading must call it speech with at
 * least this probability. `synth`: its "speech synthesizer" reading above this is a robotic-sounding take. Both limits come from a
 * control, the 15 lines of video 4, which the owner heard and published: speech 0.66 to 0.91, synthetic 0.11 to 0.59 (the pitched
 * organ voices read highest). `level`: dB from the other lines. `late`: seconds before the voice starts.
 * A line much brighter or duller than its character's others is a note, not a fault: the words and the acting change it.
 */
export const VOICE = {speech: 0.6, synth: 0.65, level: 2.5, late: 0.3, bright: 0.35};
/** Engine v9 check A4 (blueprint Part 5): speakers in one scene this many semitones apart; this share of body lines above `high` Hz. */
export const VOICE6 = {apart: 3, high: 250, highShare: [0.3, 0.55]};
if (a.voices) {
  // every voiced line on its own, then this mix against the last video the owner approved
  const dir = path.join(PUBLIC, 'toons', slug, 'voice');
  const tim = readJson(path.join(videoDir(slug), 'toon-timings.json'), null);
  if (!tim) { console.error('No voices yet for this script (toon-timings.json is missing).'); process.exit(2); }
  const items = Object.entries(tim.lines).map(([id, t]) => ({id, who: t.who, text: t.text, file: path.join(dir, `${id}.mp3`), words: t.words, duration: t.duration})).filter((x) => fs.existsSync(x.file));
  const mine = renderOf(slug);
  const against = a.against ? path.join(videoDir(String(a.against)), 'renders', 'toon.mp4') : null;
  console.log(`Listening to ${items.length} voiced lines of "${slug}"${against ? ` and comparing the mix with "${a.against}"` : ''} (the models take about half a minute to load)...`);
  const r = run({mode: 'voices', items: items.map(({id, who, file}) => ({id, who, file})), file: fs.existsSync(mine) ? mine : null, against: against && fs.existsSync(against) ? against : null});
  // each clip's median pitch (earshot reports none): pipeline/lib/toon_pitch.py, free and local; check A4 reads it
  try {
    const pf = path.join(os.tmpdir(), `toon-pitch-${slug}-${process.pid}.json`);
    execFileSync(process.platform === 'win32' ? 'python' : 'python3', [path.join(ROOT, 'pipeline', 'lib', 'toon_pitch.py'), pf, ...items.map((x) => x.file)], {stdio: 'ignore'});
    const f0 = readJson(pf, {});
    fs.rmSync(pf, {force: true});
    for (const it of r.items) { const src = items.find((x) => x.id === it.id); if (src && Number.isFinite(f0[src.file])) it.measure = {...(it.measure ?? {}), f0_hz: f0[src.file]}; }
  } catch (e) { console.log(`  (pitch not read: ${e.message})`); }
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
  // engine v9, check A4 (voices apart): speakers of one scene 3+ semitones apart (median pitch of their lines), and 30-55% of
  // the body cast's lines above 250 Hz. A fault for format 6; a note for the videos already out.
  {
    const toon6 = readJson(path.join(videoDir(slug), 'toon.json'));
    const six = (toon6.format ?? 0) >= 6;
    const f0 = {};
    for (const it of r.items) if (Number.isFinite(it.measure?.f0_hz) && it.measure.f0_hz > 50) (f0[it.who] ??= []).push(it.measure.f0_hz);
    const pitch = Object.fromEntries(Object.entries(f0).map(([w, xs]) => [w, med(xs)]));
    const st = (p, q) => Math.abs(12 * Math.log2(p / q));
    const close = [];
    for (const sh of toon6.shots ?? []) {
      const who = [...new Set((sh.lines ?? []).map((l) => l.who))].filter((w) => pitch[w]);
      for (let i = 0; i < who.length; i++) for (let j = i + 1; j < who.length; j++) {
        const d = st(pitch[who[i]], pitch[who[j]]);
        if (d < VOICE6.apart) close.push(`${sh.id}: ${who[i]} and ${who[j]} ${d.toFixed(1)} semitones apart`);
      }
    }
    const body = r.items.filter((it) => roleOf(it.who) === 'body' && Number.isFinite(it.measure?.f0_hz) && it.measure.f0_hz > 50);
    const high = body.length ? body.filter((it) => it.measure.f0_hz > VOICE6.high).length / body.length : null;
    const highOk = high === null || (high >= VOICE6.highShare[0] && high <= VOICE6.highShare[1]);
    console.log(`\n  A4 voices apart: ${Object.entries(pitch).map(([w, p]) => `${w} ${Math.round(p)} Hz`).join(', ') || 'no pitch read'}`);
    console.log(`     ${close.length ? `${close.length} pair(s) under ${VOICE6.apart} semitones: ${close.join('; ')}` : `every pair in a scene ${VOICE6.apart}+ semitones apart`}; body lines above ${VOICE6.high} Hz: ${high === null ? '-' : `${Math.round(high * 100)}%`} (${VOICE6.highShare.map((x) => Math.round(x * 100)).join("-")}%)`);
    if (six && (close.length || !highOk)) faults.push(`A4 voices apart: ${[...close, ...(highOk ? [] : [`${Math.round(high * 100)}% of body lines above ${VOICE6.high} Hz`])].join('; ')}`);
    r.voicesApart = {pitch, close, high};
  }
  if (r.ab) console.log(`\n  this mix against "${a.against}": ${r.ab.summary ?? JSON.stringify(r.ab).slice(0, 600)}`);
  if (r.ab_error) console.log(`\n  the comparison with "${a.against}" failed: ${r.ab_error}`);
  writeJson(path.join(videoDir(slug), 'renders', 'listen', 'voices.json'), r);
  console.log(faults.length ? `\n${faults.length} line(s) to look at:\n  ${faults.join('\n  ')}` : '\nEvery line is heard as speech, at one level, with no clipping and no late start.');
  process.exit(faults.length ? 1 : 0);
}
const file = a.file ? path.resolve(a.file) : renderOf(slug);
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

// the end card must carry the narrator (2026-11-22: quit-sugar and fasting went out with a music-only card and no check saw it)
const ctaT = readJson(path.join(videoDir(slug), 'cta-timings.json'), null);
const ctaLen = ctaT ? (ctaT.seconds ?? ctaT.words?.at(-1)?.end) : null;
if (ctaLen) {
  const cut = path.join(outDir, 'end-card.wav');
  const from = L.total / TOON_FPS + 0.4;
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', from.toFixed(2), '-t', ctaLen.toFixed(2), '-i', file, '-vn', cut]);
  let said = 0;
  try {
    const out = execFileSync('earshot', ['describe', cut], {stdio: ['ignore', 'pipe', 'ignore']}).toString();
    const m = out.match(/AudioSet:[^\n]*?\bSpeech ([0-9.]+)/) ?? out.match(/audioset:[^\n]*?\bSpeech ([0-9.]+)/);
    said = m ? Number(m[1]) : 0;
  } catch { said = -1; }
  const ok = said >= 0.3;
  console.log(`\n  END CARD  ${ok ? 'ok   ' : 'FAIL '} the narrator ${ok ? 'is heard' : said < 0 ? 'could not be checked' : 'is NOT heard (music only)'} (speech ${said < 0 ? '?' : Math.round(said * 100) + '%'})`);
  if (!ok) process.exitCode = 1;
}
