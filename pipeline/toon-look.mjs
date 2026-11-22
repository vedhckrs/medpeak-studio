#!/usr/bin/env node
/**
 * MedPeak Toons: the LOOK check, on the FINAL render (the owner's rule: it must pass before he sees a video).
 *
 *   npm run toon:look -- <slug>              # renders/toon-v8.mp4 (or toon.mp4, toon-draft.mp4)
 *   npm run toon:look -- <slug> --file x.mp4 [--fresh]
 *
 * Engine v9, phase 1 (2026-11-23; owner decision 17): the picture checks C1-C8 and M2 of blueprint 05, Part 5, measured on
 * the PICTURE with the caption band left out (pipeline/lib/toon_picture.py): cuts and holds, stillness ("holds still,
 * not dead"), flashes and shakes, one-frame pops, zoom jumps, line weight, colour and flat fields, time cards.
 * It reads renders/layout.json (npm run toon:staging writes it) for body / room shots when it is there.
 * For history it also prints the old whole-frame numbers (toon_look.py, the bands of 2026-11-17); they no longer decide.
 * The story only is measured: the end card is left out.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {args, ROOT, readJson, videoDir} from './lib/util.mjs';
import {findPython, pictureChecks, pictureOf} from './lib/toon-picture.mjs';
import {printChecks} from './lib/toon-geom.mjs';

/** The old reference medians and bands (2026-11-17), kept for history; the picture checks decide now. */
export const LOOK = {
  reference: {still: 0.629, small: 0.342, cutEvery: 19.6, edges: 0.089, dark: 0.03, bright: 153},
  still: [0.45, 0.8], small: [0.15, 0.55], edges: 0.075, dark: 0.025, bright: 140,
};

const a = args();
const slug = a._[0];
if (!slug) { console.error('Give a slug.'); process.exit(2); }
const dir = path.join(videoDir(slug), 'renders');
const file = a.file ? path.resolve(String(a.file)) : ['toon-v8.mp4', 'toon.mp4', 'toon-draft.mp4'].map((f) => path.join(dir, f)).find((f) => fs.existsSync(f));
if (!file || !fs.existsSync(file)) { console.error('No render to read.'); process.exit(2); }
const toon = readJson(path.join(videoDir(slug), 'toon.json'));
// the story only: the layout log knows its length; else the render minus the narrator's card (CTA_LEAD + CTA_TAIL = 1.6 s)
const layoutFile = path.join(dir, 'layout.json');
const log = fs.existsSync(layoutFile) ? readJson(layoutFile) : null;
const ctaT = readJson(path.join(videoDir(slug), 'cta-timings.json'), null);
const total = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]).toString().trim());
const story = a.whole ? null : log?.story ?? (ctaT?.seconds ? +(total - (ctaT.seconds + 1.6)).toFixed(2) : null);

const p = pictureOf(slug, {file, story, caption: toon.caption, fresh: !!a.fresh});
const checks = pictureChecks(p);
printChecks(`LOOK (the picture, caption left out)  ${slug}  (${p.seconds} s of story, ${path.basename(file)}${log ? '' : '; no layout log: body and room not told apart'})`, checks, 4);

// history: the whole-frame numbers of 2026-11-17 (they counted the caption as motion)
const py = findPython();
if (py && !a.quick) {
  const out = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'toon-look-')), 'look.json');
  execFileSync(py, ['-I', path.join(ROOT, 'pipeline', 'lib', 'toon_look.py'), out, ...(story ? [`--to=${story}`] : []), file], {stdio: ['ignore', 'ignore', 'inherit']});
  const m = Object.values(readJson(out))[0];
  console.log(`  old   whole frame, for history: ${Math.round(m.still_frames * 100)}% still (old band 45-80), ${Math.round(m.small_motion * 100)}% small movement, edges ${(m.edges * 100).toFixed(1)}%, near-black ${(m.dark * 100).toFixed(1)}%, brightness ${Math.round(m.bright)}`);
}
const ok = checks.every((c) => c.status !== 'fail');
console.log(ok ? 'ALL PASS' : 'FAILED: see skill references/toons-target.md (the numbers) and toons-look.md');
process.exit(ok ? 0 : 1);
