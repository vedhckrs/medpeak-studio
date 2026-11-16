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
import {LIMITS, scanMotion} from '../lib/toon-motion.mjs';
import {blendPose, POSES} from '../../src/toons/poses.ts';
import {checkRoom, roomsClash, roomSignature} from '../../src/toons/director.ts';
import {AUTO_SFX, changesOf, EMO_SFX, frameOf, layoutToon, longestStill, parseCam, stateAt, TOON_FPS} from '../../src/toons/director.ts';

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
const known = {cast: Object.keys(cast.cast), sfx: LIBRARY.map(([n]) => n), beds: BEDS.map(([n]) => n), others: toons.map((t) => ({slug: t.slug, episode: t.episode, rooms: t.rooms}))};
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
    if (L.steady) { // a steady script holds its pictures; what changes is what happens in them
      assert.ok(longestStill(L).seconds <= 3, `${t.slug}: ${longestStill(L).seconds.toFixed(1)} s with nothing new in the picture`);
      continue;
    }
    for (const s of L.segs) assert.ok(s.to - s.from <= 90, `${t.slug} ${s.line.line.id}: ${s.to - s.from} frames`);
    L.segs.forEach((s, i) => {
      const p = L.segs[i - 1];
      if (p && p.line === s.line && p.who === s.who) assert.notEqual(p.shot, s.shot, `${t.slug} ${s.line.line.id}: jump cut`);
    });
  }
});

test('the gate catches a broken script', () => {
  const base = real[0];
  const linesOf = (t) => t.shots.flatMap((s) => s.lines ?? []);
  const doc = linesOf(base).find((l) => l.who === 'doctor' && l.src);
  let t = clone(base);
  delete linesOf(t).find((l) => l.id === doc.id).src;
  assert.ok(failed(t).includes('Doctor lines are sourced'));
  t = clone(base);
  linesOf(t)[0].text = `Hello friends, welcome! ${linesOf(t)[0].text}`;
  assert.ok(failed(t).includes('1 No intro'));
  t = clone(base);
  linesOf(t)[1].cam = 'cu 85 wobblecam';
  assert.deepEqual(failed(t), ['Script is valid']);
  t = clone(base);
  t.sources[0].url = 'https://some-health-blog.example.com/post';
  assert.ok(failed(t).includes('Sources are allowed'));
  t = clone(base);
  linesOf(t).find((l) => l.id === doc.id).text += ' Take 500 mg twice a day.';
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
    assert.ok(r.pictures >= (t.camera === 'steady' ? t.shots.length : 20), `${t.slug}: only ${r.pictures} pictures`);
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

// ---------------------------------------------------------------- steady camera, stages, events
const steady = real.find((t) => t.slug === 'pill-without-water');

test('a steady script keeps one locked picture per place and cuts only when the place changes', () => {
  assert.ok(steady, 'a steady script is in the repo');
  const L = layoutToon(steady, null);
  assert.equal(L.steady, true);
  const asked = steady.shots.flatMap((s) => s.lines ?? []).filter((l) => l.cam).length;
  assert.ok(L.segs.length <= steady.shots.length + 2 * asked, `${L.segs.length} pictures for ${steady.shots.length} shots`);
  for (const s of L.segs) assert.equal(s.move, 'lock', 'the camera does not move inside a steady picture');
  const card = steady.shots.findIndex((s) => s.card !== undefined);
  assert.ok(card >= 0, 'the steady script uses a time card');
  assert.equal(L.shots[card].frames, Math.round((steady.shots[card].seconds ?? 1.4) * TOON_FPS));
});

test('events move the stage in time, and every change in the picture is counted', () => {
  const L = layoutToon(steady, null);
  const si = steady.shots.findIndex((s) => (s.events ?? []).some((e) => e.set?.melt));
  const sh = L.shots[si];
  const melt = sh.shot.events.filter((e) => e.set?.melt !== undefined);
  const first = frameOf(L, si, melt[0].at, melt[0].word, melt[0].delay);
  assert.equal(stateAt(L, si, first - 1).melt ?? 0, 0, 'nothing melts before the first melt event');
  const end = stateAt(L, si, sh.from + sh.frames - 1);
  assert.ok(end.melt > 0.85 && end.sore > 0.85, 'by the end of the scene the pill has melted and the sore is open');
  let prev = 0;
  for (let f = sh.from; f < sh.from + sh.frames; f += 3) { const m = stateAt(L, si, f).melt ?? 0; assert.ok(m >= prev - 1e-9, 'the melt never runs backwards'); prev = m; }
  const ch = changesOf(L);
  assert.ok(ch.length >= 25, `${ch.length} changes`);
  assert.ok(ch.every((c, i) => !i || c.f >= ch[i - 1].f), 'changes are in time order');
});

test('the gate catches a broken stage script and a picture that stands still', () => {
  const stage = (t) => t.shots.find((s) => (s.events ?? []).length);
  let t = clone(steady);
  stage(t).events[0].set = {wobble: 1};
  assert.deepEqual(failed(t), ['Script is valid'], 'an unknown dial');
  t = clone(steady);
  stage(t).events.find((e) => e.word).word = 'banana';
  assert.deepEqual(failed(t), ['Script is valid'], 'an event on a word the line does not say');
  t = clone(steady);
  stage(t).events[0].sfx = 'kazoo';
  assert.deepEqual(failed(t), ['Script is valid'], 'an unknown sound');
  t = clone(steady);
  t.shots.find((s) => s.card !== undefined).card = '';
  assert.deepEqual(failed(t), ['Script is valid'], 'an empty time card');
  t = clone(steady);
  for (const s of t.shots) { s.props = []; s.events = []; }
  assert.ok(failed(t).includes('4 3-sec change'), 'nothing happening in a locked picture fails point 4');
});

// ---------------------------------------------------------------- people's arms have real joints
test('every pose gives a person a shoulder and an elbow angle, and poses blend joint by joint', () => {
  for (const [name, p] of Object.entries(POSES)) {
    for (const arm of p.person) {
      assert.equal(typeof arm, 'object', `${name}: a person's arm is jointed`);
      assert.ok(Number.isFinite(arm.u) && Number.isFinite(arm.f), `${name}: upper-arm and forearm directions`);
      assert.ok((arm.ul ?? 1) > 0.4 && (arm.ul ?? 1) <= 1, `${name}: the upper arm is never shortened below 40%`);
    }
  }
  // a hanging arm points down and slightly away from the body, mirrored left and right
  const [l, r] = POSES.rest.person;
  assert.ok(r.u > 60 && r.u < 90 && l.u > 90 && l.u < 120);
  assert.equal(l.u + r.u, 180);
  // halfway between two poses every joint is halfway too
  const mid = blendPose(POSES.rest.person, POSES.present.person, 0.5)[1];
  assert.ok(Math.abs(mid.u - (POSES.rest.person[1].u + POSES.present.person[1].u) / 2) < 1e-9);
  assert.ok(Math.abs(mid.f - (POSES.rest.person[1].f + POSES.present.person[1].f) / 2) < 1e-9);
});

test('every stage a script uses has its dials, and every steady script is a shown story', () => {
  for (const t of real) {
    assert.equal(t.camera, 'steady', `${t.slug} uses the steady camera`);
    const stages = t.shots.filter((s) => (s.cast ?? []).some((a) => a.stage));
    assert.ok(stages.length >= 2, `${t.slug}: the body stage opens and closes the story`);
    assert.ok(t.shots.some((s) => s.card !== undefined), `${t.slug}: a time card`);
    const L = layoutToon(t, null);
    for (const sh of stages) {
      const si = t.shots.indexOf(sh);
      const end = stateAt(L, si, L.shots[si].from + L.shots[si].frames - 1);
      const start = stateAt(L, si, L.shots[si].from);
      assert.notDeepEqual(end, start, `${t.slug} scene ${sh.id}: something happens on the stage`);
    }
    assert.equal(t.shots[0].set, t.shots[t.shots.length - 1].set, `${t.slug}: the last scene returns to the first stage`);
  }
});

// ---------------------------------------------------------------- bodies never jump (owner: "legs jump")
test('no foot slides, no leg or arm jumps and no pops on any real script', async () => {
  for (const t of real) {
    const r = await scanMotion(t, null);
    assert.ok(r.people.length >= 2, `${t.slug}: people were measured`);
    assert.deepEqual(r.slides, [], `${t.slug}: a foot slides`);
    assert.deepEqual(r.legJumps, [], `${t.slug}: a leg jumps`);
    assert.deepEqual(r.armJumps, [], `${t.slug}: an arm jumps`);
    assert.deepEqual(r.pops, [], `${t.slug}: a joint pops`);
    assert.ok(r.worst.leg <= LIMITS.leg && r.worst.foot <= LIMITS.foot);
  }
});

test('a knee bend is set, never solved: a small change of weight moves a knee a little', async () => {
  const {jointsOf, SPECS} = await import('../../src/toons/humans.tsx');
  for (const who of ['doctor', 'kid', 'baby']) {
    let prev = jointsOf(SPECS[who], {act: {shift: -1}});
    let worst = 0;
    for (let sh = -0.98; sh <= 1.0001; sh += 0.02) {
      const cur = jointsOf(SPECS[who], {act: {shift: sh}});
      cur.legs.forEach((l, i) => {
        worst = Math.max(worst, Math.hypot(l.kn[0] - prev.legs[i].kn[0], l.kn[1] - prev.legs[i].kn[1]));
        assert.deepEqual(l.an, prev.legs[i].an, `${who}: the feet stay planted`);
      });
      prev = cur;
    }
    assert.ok(worst < 0.2, `${who}: the knee moves at most ${worst.toFixed(2)} units for a 1% change of weight`);
  }
});

// ---------------------------------------------------------------- every video has rooms of its own
test('every real script has its own clinic and home, and no two videos share one', () => {
  const eps = new Set();
  for (const t of real) {
    assert.ok(Number.isInteger(t.episode) && !eps.has(t.episode), `${t.slug}: a unique episode number`);
    eps.add(t.episode);
    for (const role of ['clinic', 'home']) {
      assert.deepEqual(checkRoom(role, t.rooms?.[role]), [], `${t.slug}: ${role} recipe`);
      assert.ok(t.shots.some((s) => s.set === role), `${t.slug}: a scene in its ${role}`);
      for (const o of real) if (o !== t) assert.equal(roomsClash(role, t.rooms[role], o.rooms[role], Math.abs(o.episode - t.episode) <= 6), null, `${t.slug} and ${o.slug}: ${role}`);
    }
    assert.ok(!t.shots.some((s) => ['office', 'bedroom', 'bathroom'].includes(s.set)), `${t.slug}: no shared room`);
  }
});

test('the gate refuses a copied room, a shared room and a bad recipe', () => {
  const [a, b] = real;
  let t = clone(a);
  t.rooms.clinic = clone(b.rooms.clinic);
  assert.ok(failed(t).includes('Rooms are unique'), 'the same clinic as another video');
  t = clone(a);
  t.rooms.home = {...clone(t.rooms.home), palette: b.rooms.home.palette};
  assert.ok(failed(t).includes('Rooms are unique'), 'the same colour as a neighbouring video');
  t = clone(a);
  t.shots.find((s) => s.set === 'clinic').set = 'office';
  assert.ok(failed(t).includes('Own rooms'), 'the old shared office');
  t = clone(a);
  t.rooms.clinic.palette = 'beige';
  assert.deepEqual(failed(t), ['Script is valid'], 'an unknown colour scheme');
  t = clone(a);
  delete t.episode;
  assert.deepEqual(failed(t), ['Script is valid'], 'no episode number');
  // far apart in the series a colour may come back, but never the whole room
  const far = {...clone(b.rooms.clinic)};
  assert.equal(roomsClash('clinic', a.rooms.clinic, {...far, palette: a.rooms.clinic.palette}, false), null);
  assert.equal(roomsClash('clinic', a.rooms.clinic, clone(a.rooms.clinic), false), 'the same room');
  assert.notEqual(roomSignature('clinic', a.rooms.clinic), roomSignature('clinic', b.rooms.clinic));
});
