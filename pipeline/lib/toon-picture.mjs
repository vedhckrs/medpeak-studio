// MedPeak Toons, engine v9 phase 1 (2026-11-23): runs the PICTURE checks C1-C8 (pipeline/lib/toon_picture.py) on a
// final render and turns the numbers into PASS / FAIL against the bands of blueprint 05, Part 5.
// Free and local (ffmpeg + earshot's Python with numpy and scipy). Used by toon-look.mjs and toon-score.mjs.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {ROOT, readJson, videoDir} from './util.mjs';

/** The Python with numpy and scipy: MEDPEAK_PYTHON, earshot's (macOS/Linux and Windows places), else python3 / python. */
export const findPython = () => {
  const home = os.homedir();
  const cands = [process.env.MEDPEAK_PYTHON,
    path.join(home, '.local', 'share', 'uv', 'tools', 'earshot', 'bin', 'python'),
    path.join(process.env.APPDATA ?? path.join(home, 'AppData', 'Roaming'), 'uv', 'tools', 'earshot', 'Scripts', 'python.exe'),
    path.join(home, '.local', 'share', 'uv', 'tools', 'earshot', 'Scripts', 'python.exe'),
    'python3', 'python'].filter(Boolean);
  for (const c of cands) {
    if (c.includes(path.sep) && !fs.existsSync(c)) continue;
    try { execFileSync(c, ['-c', 'import numpy, scipy'], {stdio: 'ignore'}); return c; } catch { /* next */ }
  }
  return null;
};
export const hasFfmpeg = () => { try { execFileSync('ffmpeg', ['-version'], {stdio: 'ignore'}); return true; } catch { return false; } };

/** The caption band masked out of the picture checks (screen rows): the caption is not the picture (blueprint 05, Part 4 conflicts). */
export const pictureBand = (caption) => (caption === 2 ? [1290, 1470] : [1380, 1580]);
/** The kit's FLESH colours (src/toons/v8/kit.tsx): a flat field in one of them is tissue. */
export const fleshPalette = () => {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'toons', 'v8', 'kit.tsx'), 'utf8');
  const m = src.match(/export const FLESH = \{([\s\S]*?)\n\};/);
  return m ? [...m[1].matchAll(/'(#[0-9a-fA-F]{6})'/g)].map((x) => x[1].toLowerCase()) : [];
};

/** Run toon_picture.py; returns the measured numbers (also written to `out`). */
export const measurePicture = (file, {to, caption, layoutFile, out, quick} = {}) => {
  const py = findPython();
  if (!py) throw new Error('No Python with numpy and scipy (install earshot, or set MEDPEAK_PYTHON).');
  const dest = out ?? path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'toon-picture-')), 'picture.json');
  const band = pictureBand(caption);
  const argv = ['-I', path.join(ROOT, 'pipeline', 'lib', 'toon_picture.py'), dest, file, '--band', band.join(',')];
  if (to) argv.push('--to', String(to));
  if (layoutFile && fs.existsSync(layoutFile)) argv.push('--layout', layoutFile);
  const pal = fleshPalette();
  if (pal.length) argv.push('--palette', pal.join(','));
  if (quick) argv.push('--quick');
  execFileSync(py, argv, {stdio: ['ignore', 'ignore', 'inherit'], maxBuffer: 1 << 26});
  return readJson(dest);
};

/** The picture of a video: renders/picture.json when it is newer than the render, else measured again. */
export const pictureOf = (slug, {file, story, caption, fresh} = {}) => {
  const dir = path.join(videoDir(slug), 'renders');
  const f = file ?? path.join(dir, 'toon-v8.mp4');
  const out = path.join(dir, 'picture.json');
  const layoutFile = path.join(dir, 'layout.json');
  if (!fresh && fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(f).mtimeMs && (!fs.existsSync(layoutFile) || fs.statSync(out).mtimeMs >= fs.statSync(layoutFile).mtimeMs)) {
    const p = readJson(out);
    if (p.file === f) return p;
  }
  return measurePicture(f, {to: story, caption, layoutFile, out});
};

/** The bands of blueprint 05, Part 5 (C1-C8). */
export const PICTURE_BANDS = {cutsPerMin: 6, holdMedian: 6, bodyHold: 8, reframes: 1, still: [0.78, 0.94], visible: 0.25, big: 0.05, over10: 40, heat: 0.05, longestStill: 4,
  flashes: 1, shakes: 1, pops: 0, zoomJumps: 0, line: [4, 7], warm: 0.6, other: 0.08, flat: 0.12, roomSat: 0.22, roomBright: 165, card: [0.8, 1.2], cards: 3, sameFraming: 0.7, actionGap: 0};

/** PASS / FAIL rows of the picture checks, the shape of the layout checks ({id, name, status, value, limit, rows}). */
export const pictureChecks = (p) => {
  const B = PICTURE_BANDS;
  const R = [];
  const row = (id, name, ok, value, limit, rows = [], extra = {}) => R.push({id, name, status: ok === null ? 'n/m' : ok ? 'pass' : 'fail', value, limit, rows, ...extra});
  const {C1, C2, C3, C4, C5, C6, C7, C8} = p;
  row('C1', 'Cuts: 6 a minute or fewer, holds 6 s+', C1.cuts_per_min <= B.cutsPerMin && (C1.hold_median ?? 0) >= B.holdMedian && C1.reframes <= B.reframes && !C1.reframes_reversed && !C1.body_holds_under_8s,
    `${C1.cuts_per_min}/min, hold ${C1.hold_median} s`, `${B.cutsPerMin}/min, ${B.holdMedian} s`,
    [`cuts at ${C1.cut_times.join(', ')} s`, `${C1.body_holds_under_8s} body place(s) held under ${B.bodyHold} s; ${C1.reframes} re-frame(s) detected in the picture`]);
  row('C2', 'Holds still, not dead', C2.still >= B.still[0] && C2.still <= B.still[1] && C2.visible_seconds <= B.visible && C2.big_seconds <= B.big && C2.over10_per_min <= B.over10 && C2.heat_share <= B.heat && C2.longest_still >= B.longestStill && !C2.dead_shots.length,
    `still ${Math.round(C2.still * 100)}%`, '78-94%',
    [`still ${Math.round(C2.still * 100)}% (78-94), visible-action seconds ${Math.round(C2.visible_seconds * 100)}% (25 or less), big ${Math.round(C2.big_seconds * 100)}% (5 or less)`,
      `${C2.over10_per_min} big-change frames a minute (40 or fewer), ${Math.round(C2.heat_share * 100)}% of the picture always moving (5 or less), longest still ${C2.longest_still} s (4+)`,
      ...(C2.dead_shots.length ? [`dead shots (8 s+ with no action) at ${C2.dead_shots.join(', ')} s`] : [])]);
  row('M2', 'One action, then a hold (1.5 s apart)', C2.action_gaps_under_1_5 === undefined ? null : C2.action_gaps_under_1_5 <= B.actionGap, C2.action_gaps_under_1_5, 0,
    C2.action_gaps?.length ? [`big actions closer than 1.5 s at ${C2.action_gaps.slice(0, 20).join(', ')} s`] : []);
  row('C3', 'Flash and shake: 1 each at most', C3.flashes <= B.flashes && C3.shakes <= B.shakes && !C3.flash_on_cut, `${C3.flashes} flashes, ${C3.shakes} shakes`, '1 / 1',
    [`flashes at ${C3.flash_times.map((f) => f.t).join(', ') || '-'} s; shakes at ${C3.shake_times.join(', ') || '-'} s`]);
  row('C4', 'No one-frame pops', C4 ? C4.pops <= B.pops : null, C4?.pops, 0, C4 ? C4.pop_list.slice(0, 10).map((x) => `${x.t} s, ${Math.round(x.area * 1000) / 10}% of the picture at [${x.box.join(', ')}]`) : []);
  row('C5', 'No zoom jumps', C5 ? C5.zoom_jumps <= B.zoomJumps : null, C5?.zoom_jumps, 0, C5 ? C5.list.slice(0, 10).map((x) => `${x.t} s: x${x.zoom} in one frame`) : []);
  row('C6', 'Outline 4-7 px in every shot', C6.min === null ? null : C6.min >= B.line[0] && C6.max <= B.line[1], `${C6.min}-${C6.max} px`, '4-7 px',
    C6.shots.filter((s) => s.width && (s.width < B.line[0] || s.width > B.line[1])).map((s) => `${s.at} s: ${s.width} px`));
  row('C7', 'One warm family in the body, pale rooms', (C7.body_warm === null || (C7.body_warm >= B.warm && C7.body_other_max <= B.other && C7.flat_max <= B.flat)) && (C7.room_sat === null || (C7.room_sat <= B.roomSat && C7.room_bright >= B.roomBright)),
    `warm ${C7.body_warm === null ? '-' : Math.round(C7.body_warm * 100) + '%'}`, '60%+',
    [`body: warm ${C7.body_warm === null ? '-' : Math.round(C7.body_warm * 100)}% (60+), other family ${C7.body_other_family} ${C7.body_other_max === null ? '-' : Math.round(C7.body_other_max * 100)}% (8 or less), largest flat non-tissue field ${C7.flat_max === null ? '-' : Math.round(C7.flat_max * 100)}% ${C7.flat_colour ?? ''} (12 or less)`,
      `rooms: saturation ${C7.room_sat ?? '-'} (0.22 or less), brightness ${C7.room_bright ?? '-'} (165+)`]);
  row('C8', 'Time cards 0.8-1.2 s, same framing after', C8.cards <= B.cards && C8.lengths.every((l) => l >= B.card[0] && l <= B.card[1]) && C8.same_framing.every((c) => c === null || c >= B.sameFraming), `${C8.cards} cards`, '3 at most',
    C8.lengths.map((l, i) => `card ${i + 1}: ${l} s, framing match ${C8.same_framing[i] ?? '-'}`));
  return R;
};
