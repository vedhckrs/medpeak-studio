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
import {args, readJson, ROOT, videoDir, writeJson} from './lib/util.mjs';
import {SFX_DIR} from './lib/toon-audio.mjs';
import {layoutToon, soundPlan, TOON_FPS} from '../src/toons/director.ts';

/** earshot's own Python (uv keeps each tool in its own environment). */
const PY = [process.env.EARSHOT_PYTHON, path.join(os.homedir(), '.local', 'share', 'uv', 'tools', 'earshot', 'bin', 'python')].filter(Boolean).find((p) => fs.existsSync(p));
/** How near a heard sound must be to a planned one to count as that sound, in seconds. */
export const NEAR = 0.2;

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
const tagOf = (e) => e?.tag ?? e?.label ?? e?.tags?.[0]?.term ?? e?.tags?.[0] ?? '';

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
    console.log(`  ${ok ? 'ok   ' : 'WEAK '} ${it.name.padEnd(20)} ${String(v).padEnd(10)} z ${s1(it.match?.z).padStart(5)}   hears: ${(it.describe?.tags ?? []).slice(0, 2).map((t) => t.term ?? t).join('; ')}`);
  }
  console.log(weak.length ? `\n${weak.length} effect(s) do not sound like their description: ${weak.join(', ')}. Do not use them until they are re-made or the owner has heard them.` : '\nEvery effect sounds like its description.');
  process.exit(0);
}

const slug = a._[0];
if (!slug) { console.error('Give a slug, or --library.'); process.exit(2); }
const file = a.file ? path.resolve(a.file) : path.join(videoDir(slug), 'renders', 'toon.mp4');
if (!fs.existsSync(file)) { console.error(`No video at ${file}. Render it first (node pipeline/toon-render.mjs ${slug}).`); process.exit(2); }
const toon = readJson(path.join(videoDir(slug), 'toon.json'));
const stored = readJson(path.join(videoDir(slug), 'toon-timings.json'), null);
const L = layoutToon(toon, stored);
const plan = soundPlan(L).map((e) => ({t: e.at / TOON_FPS, name: e.name, why: e.why}));
const outDir = path.join(videoDir(slug), 'renders', 'listen');
fs.mkdirSync(outDir, {recursive: true});
console.log(`Listening to ${path.relative(ROOT, file)} (the models take about half a minute to load)...`);
const r = run({mode: 'film', file, sheet: path.join(outDir, 'sheet.png')});
const events = r.timeline?.events ?? [];
const timeOf = (e) => e.t ?? e.time ?? e.start ?? 0;
const heard = plan.map((p) => { const near = events.map((e) => ({e, d: timeOf(e) - p.t})).filter((x) => Math.abs(x.d) <= NEAR).sort((x, y) => Math.abs(x.d) - Math.abs(y.d))[0]; return {...p, heardAt: near ? timeOf(near.e) : null, offsetMs: near ? Math.round(near.d * 1000) : null, sounds: near ? tagOf(near.e) : null, level: near?.e.level ?? near?.e.lufs ?? near?.e.db ?? null}; });
const planned = (t) => plan.some((p) => Math.abs(p.t - t) <= NEAR);
const report = {slug, file: path.relative(ROOT, file), seconds: L.total / TOON_FPS, measure: r.measure, planned: heard, unplanned: events.filter((e) => !planned(timeOf(e))).map((e) => ({t: timeOf(e), sounds: tagOf(e), level: e.level ?? null})), sync: r.timeline?.sync ?? null, cuts: r.timeline?.cuts ?? [], summary: r.timeline?.summary ?? null, sheet: path.relative(ROOT, r.sheet ?? '')};
writeJson(path.join(outDir, 'report.json'), {...report, events});

const m = r.measure ?? {};
console.log(`\nLISTEN  ${toon.title}  (${report.seconds.toFixed(1)} s)`);
console.log(`  loudness ${s1(m.lufs)} LUFS, true peak ${s1(m.true_peak_dbtp)} dBTP${m.lra_lu !== undefined ? `, range ${s1(m.lra_lu)} LU` : ''}`);
const got = heard.filter((h) => h.heardAt !== null);
console.log(`  planned sounds that can be heard: ${got.length} of ${heard.length}`);
for (const h of heard) console.log(`     ${h.t.toFixed(1).padStart(5)} s  ${h.name.padEnd(18)} ${h.heardAt === null ? 'NOT HEARD (too quiet, or covered by a voice)' : `heard ${h.offsetMs >= 0 ? '+' : ''}${h.offsetMs} ms${h.sounds ? `, sounds like: ${h.sounds}` : ''}`}`);
console.log(`  other sound events (voices and music count here): ${report.unplanned.length}`);
if (typeof report.summary === 'string') console.log(`\n${report.summary}`);
console.log(`\n  sheet: ${report.sheet}\n  report: ${path.relative(ROOT, path.join(outDir, 'report.json'))}`);
