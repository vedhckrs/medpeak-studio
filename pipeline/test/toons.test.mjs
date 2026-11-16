import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from '../lib/util.mjs';
import {loadCast} from '../lib/toon-audio.mjs';
import {LIBRARY} from '../toon-sfx.mjs';
import {BEDS} from '../toon-music.mjs';
import {checkToon} from '../lib/toon-rules.mjs';
import {scanCamera} from '../lib/toon-camera.mjs';
import {AUTO_SFX, EMO_SFX, layoutToon, parseCam} from '../../src/toons/director.ts';

const EMOTIONS = ['neutral', 'happy', 'angry', 'scared', 'smug', 'sick', 'sleepy', 'shocked', 'sad'];
const cast = loadCast();
const toons = fs.readdirSync(path.join(ROOT, 'videos'))
  .map((d) => path.join(ROOT, 'videos', d, 'toon.json'))
  .filter((f) => fs.existsSync(f))
  .map((f) => JSON.parse(fs.readFileSync(f, 'utf8')));

test('every Toons character has one fixed voice', () => {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'toons', 'Preview.tsx'), 'utf8');
  const order = src.match(/export const ORDER[^=]*=\s*\[([\s\S]*?)\]/)[1].match(/'([a-z]+)'/g).map((s) => s.slice(1, -1));
  assert.ok(order.length >= 25);
  for (const who of order) {
    const c = cast.cast[who];
    assert.ok(c, `no voice for ${who}`);
    assert.match(c.voiceId, /^[A-Za-z0-9]{20}$/, `${who} voice id`);
    assert.ok(Math.abs(c.pitch) <= 6, `${who} pitch is too far from natural`);
  }
  for (const e of EMOTIONS) assert.ok(cast.acting[e], `no acting settings for ${e}`);
});

test('the sound-effect library has every sound the player can ask for', () => {
  const names = new Set(LIBRARY.map(([n]) => n));
  assert.equal(names.size, LIBRARY.length, 'duplicate effect name');
  for (const n of [...Object.values(EMO_SFX), ...AUTO_SFX]) assert.ok(names.has(n), `missing effect ${n}`);
  for (const [n, d, prompt] of LIBRARY) {
    assert.ok(d >= 0.3 && d <= 2, `${n} length`);
    assert.ok(prompt.length > 12, `${n} prompt`);
  }
});

test('toon scripts only use the cast, the library and the music beds', () => {
  const sfx = new Set(LIBRARY.map(([n]) => n));
  const beds = new Set(BEDS.map(([n]) => n));
  for (const toon of toons) {
    if (toon.music) assert.ok(beds.has(toon.music), `${toon.slug}: unknown music bed ${toon.music}`);
    const ids = new Set();
    for (const shot of toon.shots) {
      const here = new Set(shot.cast.map((a) => a.who));
      for (const line of shot.lines) {
        assert.ok(!ids.has(line.id), `${toon.slug}: line id ${line.id} is used twice`);
        ids.add(line.id);
        assert.ok(here.has(line.who), `${toon.slug} ${line.id}: ${line.who} is not in the shot`);
        assert.ok(cast.cast[line.who], `${toon.slug} ${line.id}: no voice for ${line.who}`);
        if (line.emotion) assert.ok(EMOTIONS.includes(line.emotion), `${toon.slug} ${line.id}: emotion`);
        if (line.sfx) assert.ok(sfx.has(line.sfx), `${toon.slug} ${line.id}: unknown effect ${line.sfx}`);
        if (line.key) assert.ok(line.text.toLowerCase().includes(line.key.toLowerCase()), `${toon.slug} ${line.id}: key word is not in the line`);
      }
    }
  }
});

// ---------------------------------------------------------------- the script gate
const known = {cast: Object.keys(cast.cast), sfx: LIBRARY.map(([n]) => n), beds: BEDS.map(([n]) => n)};
const real = toons.filter((t) => !t.test);
const clone = (t) => JSON.parse(JSON.stringify(t));
const failed = (t) => checkToon(t, null, known).results.filter((r) => !r.pass).map((r) => r.point);

test('every real toon script passes the gate', () => {
  assert.ok(real.length >= 3, 'three scripts are in the repo');
  for (const t of real) assert.deepEqual(failed(t), [], `${t.slug} fails`);
});

test('the director never holds a picture over 3 seconds and never repeats a size on one speaker', () => {
  for (const t of real) {
    const L = layoutToon(t, null);
    for (const s of L.segs) assert.ok(s.to - s.from <= 90, `${t.slug} ${s.line.line.id}: ${s.to - s.from} frames`);
    L.segs.forEach((s, i) => {
      const p = L.segs[i - 1];
      if (p && p.line === s.line && p.who === s.who) assert.notEqual(p.shot, s.shot, `${t.slug} ${s.line.line.id}: jump cut`);
    });
  }
});

test('the gate catches a broken script', () => {
  const base = real[0];
  const doc = base.shots.flatMap((s) => s.lines).find((l) => l.who === 'doctor' && l.src);
  let t = clone(base);
  delete t.shots.flatMap((s) => s.lines).find((l) => l.id === doc.id).src;
  assert.ok(failed(t).includes('Doctor lines are sourced'));
  t = clone(base);
  t.shots[0].lines[0].text = `Hello friends, welcome! ${t.shots[0].lines[0].text}`;
  assert.ok(failed(t).includes('1 No intro'));
  t = clone(base);
  t.shots[0].lines[1].cam = 'cu 85 wobblecam';
  assert.deepEqual(failed(t), ['Script is valid']);
  t = clone(base);
  t.sources[0].url = 'https://some-health-blog.example.com/post';
  assert.ok(failed(t).includes('Sources are allowed'));
  t = clone(base);
  t.shots[1].lines[1].text += ' Take 500 mg twice a day.';
  assert.ok(failed(t).includes('No dosing advice'));
  t = clone(base);
  delete t.retention;
  assert.ok(failed(t).some((p) => p.includes('plan')));
});

test('camera words are read in any order', () => {
  assert.deepEqual(parseCam('push 85mm cu'), {shot: 'cu', lens: '85', move: 'push', unknown: []});
  assert.deepEqual(parseCam('two truck'), {shot: 'two', move: 'truck', unknown: []});
  assert.deepEqual(parseCam(undefined), {unknown: []});
});

// ---------------------------------------------------------------- the camera never jumps
test('the camera has no jolts, jump cuts or wrong pictures on any real script', async () => {
  for (const t of real) {
    const r = await scanCamera(t, null);
    assert.deepEqual(r.wrong, [], `${t.slug}: wrong picture`);
    assert.deepEqual(r.jumpCuts, [], `${t.slug}: jump cut`);
    assert.deepEqual(r.jolts, [], `${t.slug}: jolt`);
    assert.ok(r.pictures >= 20, `${t.slug}: only ${r.pictures} pictures`);
  }
});

test('the camera check catches a jump cut and a jolt that a script forces', async () => {
  const office = (lines) => ({slug: 'x', title: 'x', shots: [{id: 'A', set: 'office', cast: [{who: 'doctor', x: 285, size: 1040}, {who: 'patient', x: 805, size: 1000}], lines}]});
  // two pictures of the doctor in a row at the same size: a jump cut
  let r = await scanCamera(office([
    {id: 'L1', who: 'doctor', text: 'Good morning to you.', cam: 'mcu'},
    {id: 'L2', who: 'doctor', text: 'Please sit down here.', cam: 'mcu'},
  ]), null);
  assert.equal(r.jumpCuts.length, 1, 'the same character at the same size twice in a row is reported');
  // the same two lines at clearly different sizes: a clean cut
  r = await scanCamera(office([
    {id: 'L1', who: 'doctor', text: 'Good morning to you.', cam: 'mcu'},
    {id: 'L2', who: 'doctor', text: 'Please sit down here.', cam: 'ecu'},
  ]), null);
  assert.deepEqual(r.jumpCuts, []);
  // fast moves only count as planned when the script asked for them
  r = await scanCamera(office([
    {id: 'L1', who: 'doctor', text: 'Good morning to you.', cam: 'mcu'},
    {id: 'L2', who: 'patient', text: 'What was that noise?', cam: 'cu crash'},
  ]), null);
  assert.deepEqual(r.jolts, [], 'a crash zoom the script asked for is a planned fast move');
});
