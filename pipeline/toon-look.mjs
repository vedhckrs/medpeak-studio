#!/usr/bin/env node
/**
 * MedPeak Toons: the LOOK check. Reads every frame of a render and compares it with what the 20
 * reference Shorts measured (owner, 2026-11-17: "looks flat", "no animation and motion inside body
 * view"; plans/reference-deep-study-2026-11-17.md).
 *
 *   npm run toon:look -- <slug>              # renders/toon.mp4, or the silent preview if there is none
 *   npm run toon:look -- <slug> --file x.mp4
 *
 * It fails a video that is flat (faint outlines, little line detail, dull), dead (nothing moves) or
 * restless (something moves in every frame). The cut rate is reported, not failed: a story with six
 * places in 50 seconds cuts more often than the reference, and that is a choice of the script.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {args, ROOT, readJson, videoDir} from './lib/util.mjs';

/** The reference medians (20 Shorts, 36,308 frames) and the bands a Toon must stay in. */
export const LOOK = {
  reference: {still: 0.629, small: 0.342, cutEvery: 19.6, edges: 0.089, dark: 0.03, bright: 153},
  still: [0.45, 0.8], // share of frames where nothing moves: below = restless, above = dead
  small: [0.15, 0.55], // share of frames with small movement: the body is alive
  edges: 0.075, // crisp line detail, at least
  dark: 0.025, // bold dark outlines, at least
  bright: 140, // not dull, at least
};
const PY = path.join(os.homedir(), '.local', 'share', 'uv', 'tools', 'earshot', 'bin', 'python');

const a = args();
const slug = a._[0];
if (!slug) { console.error('Give a slug.'); process.exit(2); }
const dir = path.join(videoDir(slug), 'renders');
const file = a.file ? path.resolve(String(a.file)) : [path.join(dir, 'toon.mp4'), path.join(dir, 'toon-draft.mp4')].find((f) => fs.existsSync(f));
if (!file || !fs.existsSync(file)) { console.error('No render to read.'); process.exit(2); }
const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'toon-look-')), 'look.json');
// measure the STORY only (2026-11-21): the end card is a still picture and made a restless story look calm.
// The card's length is the narrator's clip plus the player's lead and tail (CTA_LEAD + CTA_TAIL = 1.6 s, src/toons/v8/video.tsx).
const ctaT = readJson(path.join(videoDir(slug), 'cta-timings.json'), null);
const total = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());
const story = a.whole || !ctaT?.seconds ? null : +(total - (ctaT.seconds + 1.6)).toFixed(2);
execFileSync(PY, ['-I', path.join(ROOT, 'pipeline', 'lib', 'toon_look.py'), out, ...(story ? [`--to=${story}`] : []), file], {stdio: ['ignore', 'ignore', 'inherit']});
const m = Object.values(readJson(out))[0];
const R = LOOK.reference;
const rows = [
  ['Holds still, but not dead', m.still_frames >= LOOK.still[0] && m.still_frames <= LOOK.still[1], `${Math.round(m.still_frames * 100)}% of frames still (keep ${Math.round(LOOK.still[0] * 100)}-${Math.round(LOOK.still[1] * 100)}%; reference ${Math.round(R.still * 100)}%)`],
  ['The body is alive', m.small_motion >= LOOK.small[0] && m.small_motion <= LOOK.small[1], `${Math.round(m.small_motion * 100)}% of frames with small movement (keep ${Math.round(LOOK.small[0] * 100)}-${Math.round(LOOK.small[1] * 100)}%; reference ${Math.round(R.small * 100)}%)`],
  ['Line detail', m.edges >= LOOK.edges, `${(m.edges * 100).toFixed(1)}% crisp edges (at least ${(LOOK.edges * 100).toFixed(1)}%; reference ${(R.edges * 100).toFixed(1)}%)`],
  ['Bold outlines', m.dark >= LOOK.dark, `${(m.dark * 100).toFixed(1)}% near-black (at least ${(LOOK.dark * 100).toFixed(1)}%; reference ${(R.dark * 100).toFixed(1)}%)`],
  ['Bright', m.bright >= LOOK.bright, `brightness ${Math.round(m.bright)} (at least ${LOOK.bright}; reference ${R.bright})`],
];
console.log(`LOOK  ${slug}  (${m.frames} frames, ${m.seconds} s, ${path.basename(file)})`);
for (const [name, ok, detail] of rows) console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${String(name).padEnd(26)} ${detail}`);
console.log(`  note  ${'Cuts'.padEnd(26)} one every ${m.cut_every_s} s (reference ${R.cutEvery} s)`);
const ok = rows.every((r) => r[1]);
console.log(ok ? 'ALL PASS' : 'FAILED: see skill references/toons-look.md');
process.exit(ok ? 0 : 1);
