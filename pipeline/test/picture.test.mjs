// Engine v9, phase 1 (2026-11-23): each picture check FAILS a tiny known-bad clip made free with ffmpeg (lavfi) and the
// clean clip passes (blueprint 05, Part 4.13): a shake, a white flash, a one-frame pop, a re-frame and back, a too-short
// time card. Needs ffmpeg and a Python with numpy + scipy (earshot's); skipped on a machine without them.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {findPython, hasFfmpeg, measurePicture} from '../lib/toon-picture.mjs';

const ready = hasFfmpeg() && !!findPython();
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'toon-picture-test-'));
// a still, busy picture (colour bars, frozen) at 540 x 960; `vf` adds the fault
const still = 'testsrc2=s=600x1020:r=60,trim=end_frame=1,loop=loop=-1:size=1,setpts=N/60/TB';
const clip = (name, vf, seconds = 5) => {
  const f = path.join(dir, `${name}.mp4`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'lavfi', '-i', still, '-t', String(seconds), '-vf', `${vf},format=yuv420p`, '-r', '60', '-c:v', 'libx264', '-crf', '12', f]);
  return f;
};
const base = 'crop=540:960:30:30';

test('picture checks: a clean, still clip has no cut, flash, shake, pop or card', {skip: !ready && 'needs ffmpeg and numpy/scipy'}, () => {
  const p = measurePicture(clip('clean', base), {caption: 2});
  assert.equal(p.C1.cuts, 0);
  assert.equal(p.C3.flashes, 0);
  assert.equal(p.C3.shakes, 0);
  assert.equal(p.C4.pops, 0);
  assert.equal(p.C8.cards, 0);
});

test('picture checks: a shake FAILS C3', {skip: !ready && 'needs ffmpeg and numpy/scipy'}, () => {
  const p = measurePicture(clip('shake', "crop=540:960:30+14*sin(t*40)*between(t\\,2\\,2.4):30"), {caption: 2, quick: true});
  assert.ok(p.C3.shakes >= 1, JSON.stringify(p.C3));
});

test('picture checks: a white flash FAILS C3', {skip: !ready && 'needs ffmpeg and numpy/scipy'}, () => {
  const p = measurePicture(clip('flash', `${base},eq=brightness=0.3:enable='between(t,2,2.25)'`), {caption: 2, quick: true});
  assert.ok(p.C3.flashes >= 1, JSON.stringify(p.C3));
});

test('picture checks: a one-frame pop FAILS C4', {skip: !ready && 'needs ffmpeg and numpy/scipy'}, () => {
  const p = measurePicture(clip('pop', `${base},drawbox=x=200:y=200:w=90:h=90:color=black:t=fill:enable='eq(n,150)'`), {caption: 2});
  assert.ok(p.C4.pops >= 1, JSON.stringify(p.C4));
});

test('picture checks: a re-frame and back inside 4 s FAILS C1', {skip: !ready && 'needs ffmpeg and numpy/scipy'}, () => {
  const p = measurePicture(clip('reframe', `${base},split[a][b];[b]crop=360:640:90:100,scale=540:960[z];[a][z]overlay=enable='between(t,2,3)'`), {caption: 2, quick: true});
  assert.ok(p.C1.reframes >= 2, JSON.stringify(p.C1.cut_kinds));
  assert.ok(p.C1.reframes_reversed >= 1);
});

test('picture checks: a time card of 0.4 s FAILS C8 (0.8-1.2 s)', {skip: !ready && 'needs ffmpeg and numpy/scipy'}, () => {
  const p = measurePicture(clip('card', `${base},drawbox=x=0:y=0:w=540:h=960:color=black:t=fill:enable='between(t,2,2.4)'`), {caption: 2, quick: true});
  assert.equal(p.C8.cards, 1, JSON.stringify(p.C8));
  assert.ok(p.C8.lengths[0] < 0.8);
  assert.ok(p.C8.same_framing[0] > 0.7, 'the same picture comes back after the card');
});
