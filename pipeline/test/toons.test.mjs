import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from '../lib/util.mjs';
import {loadCast} from '../lib/toon-audio.mjs';
import {LIBRARY} from '../toon-sfx.mjs';
import {BEDS} from '../toon-music.mjs';
import {checkToon, STICKERS} from '../lib/toon-rules.mjs';
import {scanCamera} from '../lib/toon-camera.mjs';
import {LIMITS, scanMotion} from '../lib/toon-motion.mjs';
import {blendPose, POSES} from '../../src/toons/poses.ts';
import {checkRoom, roomsClash, roomSignature} from '../../src/toons/director.ts';
import {AUTO_SFX, changesOf, frameOf, layoutToon, longestStill, parseCam, SOUND, soundPlan, stateAt, TOON_FPS} from '../../src/toons/director.ts';
import {scanStaging} from '../lib/toon-staging.mjs';
import {checkSound} from '../lib/toon-sound.mjs';

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
  for (const n of AUTO_SFX) assert.ok(names.has(n), `missing effect ${n}`);
  for (const [n, d, prompt] of LIBRARY) {
    assert.ok(d >= 0.3 && d <= 2, `${n} length`);
    assert.ok(prompt.length > 12, `${n} prompt`);
  }
});

test('toon scripts only use the cast, the library and the music beds', () => {
  const sfx = new Set(LIBRARY.map(([n]) => n));
  const beds = new Set(BEDS.map(([n]) => n));
  for (const toon of toons) {
    // format 5: a video has a track of its own, named after it (made with toon-music.mjs --slug)
    if (toon.music && toon.music !== toon.slug) assert.ok(beds.has(toon.music), `${toon.slug}: unknown music bed ${toon.music}`);
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

test('the narrator end card never fails the length rule (the owner: never cut the narrator)', () => {
  const t = real[0];
  const len = (extra) => checkToon(t, null, {...known, ctaSeconds: extra}).results.find((r) => r.point === 'Length');
  assert.equal(len(0).pass, true);
  assert.equal(len(20).pass, true, 'a long end card is fine');
  assert.match(len(20).detail, /with the end card/);
});

test('a cold open is allowed only as the first line, up to 4 s (v4)', () => {
  const t = clone(real.find((x) => x.slug === 'rabies'));
  const ok = checkToon(t, null, known).results.find((r) => r.point === 'Cold open');
  assert.ok(ok && ok.pass, 'the rabies cold open passes');
  const later = clone(t);
  later.shots[0].lines[1].cold = true;
  assert.ok(checkToon(later, null, known).results.some((r) => r.point === 'Cold open' && !r.pass), 'a cold line after the first fails');
});

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
    // format 5 ("engage") has no time card: a second of dark screen right after the hook loses the viewer (owner, 2026-11-18)
    if (!(t.format >= 5)) assert.ok(t.shots.some((s) => s.card !== undefined), `${t.slug}: a time card`);
    const L = layoutToon(t, null);
    for (const sh of stages) {
      const si = t.shots.indexOf(sh);
      // the stage changes during the scene (a cold open starts on the damage, goes back and ends on it again: start and end alone would look the same)
      const start = JSON.stringify(stateAt(L, si, L.shots[si].from));
      let moved = false;
      for (let f = L.shots[si].from; f < L.shots[si].from + L.shots[si].frames; f += 5) if (JSON.stringify(stateAt(L, si, f)) !== start) { moved = true; break; }
      assert.ok(moved, `${t.slug} scene ${sh.id}: something happens on the stage`);
    }
    assert.equal(t.shots[0].set, t.shots[t.shots.length - 1].set, `${t.slug}: the last scene returns to the first stage`);
  }
});

// ---------------------------------------------------------------- bodies never jump (owner: "legs jump")
test('no foot slides, no leg or arm jumps and no pops on any real script', async () => {
  for (const t of real) {
    const r = await scanMotion(t, null);
    // every person in the script is measured (no-sleep, 2026-11-21, has one person: Sam)
    const cast = new Set(t.shots.flatMap((sh) => sh.cast.map((a) => a.who)).filter((w) => ['doctor', 'patient', 'mom', 'dad', 'kid', 'grandpa', 'grandma', 'baby'].includes(w)));
    assert.ok(r.people.length >= Math.min(2, cast.size), `${t.slug}: people were measured`);
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
      // from format 3 a story uses only the rooms it needs (the fight has no clinic); a room it uses is still its own
      if (t.format >= 3 && !t.shots.some((s) => s.set === role)) { assert.equal(t.rooms?.[role], undefined, `${t.slug}: no recipe for a ${role} it never shows`); continue; }
      assert.deepEqual(checkRoom(role, t.rooms?.[role]), [], `${t.slug}: ${role} recipe`);
      assert.ok(t.shots.some((s) => s.set === role), `${t.slug}: a scene in its ${role}`);
      for (const o of real) if (o !== t && o.rooms?.[role]) assert.equal(roomsClash(role, t.rooms[role], o.rooms[role], Math.abs(o.episode - t.episode) <= 6), null, `${t.slug} and ${o.slug}: ${role}`);
    }
    assert.ok(!t.shots.some((s) => ['office', 'bedroom', 'bathroom'].includes(s.set)), `${t.slug}: no shared room`);
  }
});

test('the gate refuses a copied room, a shared room and a bad recipe', () => {
  // two videos with both rooms, within six episodes of each other (the colour rule only holds for neighbours)
  const both = real.filter((x) => x.rooms?.clinic && x.rooms?.home).sort((x, y) => x.episode - y.episode);
  const a = both[0], b = both.find((x) => x !== a && Math.abs(x.episode - a.episode) <= 6 && x.rooms.home.palette !== a.rooms.home.palette);
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

// ---------------------------------------------------------------- the upload package
test('every real script carries an upload package that follows the channel rules', () => {
  for (const t of real) {
    const p = t.package;
    assert.ok(p, `${t.slug}: a package block`);
    assert.ok(p.title.length <= 70, `${t.slug}: the title fits a Short (${p.title.length})`);
    assert.ok(p.title.toLowerCase().startsWith(p.phrase.toLowerCase()), `${t.slug}: the title starts with the search phrase`);
    assert.ok(!/#|[\u{1F300}-\u{1FAFF}]/u.test(p.title) && !/\b[A-Z]{4,}\b/.test(p.title), `${t.slug}: no hashtag, emoji or ALL CAPS word in the title`);
    assert.ok(p.opener.toLowerCase().slice(0, 120).includes(p.phrase.toLowerCase()), `${t.slug}: the description opens with the search phrase`);
    const tags = p.hashtags.split(/\s+/);
    assert.ok(tags.length === 3 && tags.includes('#shorts'), `${t.slug}: three hashtags, one of them #shorts`);
    assert.ok(p.tags.join(',').length <= 500 && p.question.endsWith('?') && p.cover.text.split(' ').length <= 5, `${t.slug}: tags, question, cover text`);
    const L = layoutToon(t, null);
    assert.ok(p.cover.at * TOON_FPS < L.total, `${t.slug}: the cover moment is inside the video`);
  }
});

// ---------------------------------------------------------------- no graphic on a face (owner: "this bubble comes [over the] doctor face")
test('no bubble, tag or object covers a head, leaves the picture or sits on another, on any real script', async () => {
  for (const t of real) {
    const r = await scanStaging(t, null);
    assert.ok(r.graphics >= (t.format >= 3 ? 1 : 10), `${t.slug}: graphics were measured`); // a format-3 story has few graphics on purpose
    assert.deepEqual(r.onHeads, [], `${t.slug}: a graphic on a head`);
    assert.deepEqual(r.outside, [], `${t.slug}: a graphic out of the picture`);
    assert.deepEqual(r.stacked, [], `${t.slug}: graphics on each other`);
  }
});

test('the staging check catches a bubble put on the doctor, and a thought bubble with "of" clears every head', async () => {
  const t = clone(real.find((x) => x.shots.some((s) => (s.props ?? []).some((p) => p.bubble))));
  const shot = t.shots.find((s) => (s.props ?? []).some((p) => p.bubble));
  const b = shot.props.find((p) => p.bubble);
  assert.equal(b.of, 'doctor', 'the real scripts let the bubble place itself');
  delete b.of;
  Object.assign(b, {x: 560, y: 400, size: 360}); // where the first videos had it
  const r = await scanStaging(t, null);
  assert.ok(r.onHeads.some((x) => x.includes('doctor')), 'a bubble over the doctor is reported');
});

test('no graphic sits on the caption line, and the staging check catches one that does', async () => {
  for (const t of real) assert.deepEqual((await scanStaging(t, null)).onCaption, [], `${t.slug}: a graphic on the caption line`);
  const t = clone(real.find((x) => x.shots.some((s) => (s.props ?? []).some((p) => p.kind === 'tag' && p.x))));
  const shot = t.shots.find((s) => (s.props ?? []).some((p) => p.kind === 'tag' && p.x));
  Object.assign(shot.props.find((p) => p.kind === 'tag' && p.x), {x: 540, y: 1500});
  assert.ok((await scanStaging(t, null)).onCaption.length >= 1, 'a tag typed onto the caption line is reported');
});

// ---------------------------------------------------------------- what hangs on the wall stays in view
test('in every room a recipe can make, the wall items hang above head height, inside the picture, off the window and off each other', async () => {
  const {wallItems, windowBox, WALL_BAND} = await import('../../src/toons/rooms.tsx');
  const {ROOM_LAYOUTS, ROOM_WINDOWS, ROOM_SIDES} = await import('../../src/toons/director.ts');
  const hit = (a, b) => Math.min(a[2], b[2]) - Math.max(a[0], b[0]) > 0 && Math.min(a[3], b[3]) - Math.max(a[1], b[1]) > 0;
  let rooms = 0;
  // the gym (creatine) is drawn only in look v8 (src/toons/v8/crea-gym.tsx); the old room kit hangs nothing in it
  for (const [kind, layouts] of Object.entries(ROOM_LAYOUTS).filter(([k]) => k !== 'gym')) for (const layout of layouts) for (const style of ROOM_WINDOWS) for (const side of ROOM_SIDES) {
    const look = {kind, palette: 'mint', wall: 'paint', floor: 'wood', window: {style, side, view: 'garden'}, layout, chart: 'body'};
    const role = kind === 'clinic' ? 'clinic' : 'home';
    const items = wallItems(look, role, 0); // everything a wall can carry (ROOM_TIDY 0)
    const where = `${kind}, ${layout}, ${style} window ${side}`;
    assert.ok(items.length >= 2, `${where}: something hangs on the wall`);
    // the tidy wall the owner chose keeps the chart (clinic) or the mirror (bathroom) and nothing else
    const tidy = wallItems(look, role, 1);
    assert.deepEqual(tidy.map((it) => it.kind), kind === 'clinic' ? ['chart'] : kind === 'bathroom' ? ['mirror'] : [], `${where}: the tidy wall`);
    rooms++;
    items.forEach((it, i) => {
      assert.ok(it.box[1] >= WALL_BAND.top && it.box[3] <= WALL_BAND.bottom, `${where}: the ${it.kind} hangs at ${it.box[1]} to ${Math.round(it.box[3])} px, outside the band above the heads`);
      assert.ok(it.box[0] >= 8 && it.box[2] <= 1072, `${where}: the ${it.kind} leaves the picture (${Math.round(it.box[0])} to ${Math.round(it.box[2])} px)`);
      assert.ok(!hit(it.box, windowBox(look)), `${where}: the ${it.kind} hangs on the window`);
      for (const o of items.slice(i + 1)) assert.ok(!hit(it.box, o.box), `${where}: the ${it.kind} and the ${o.kind} overlap`);
    });
  }
  assert.ok(rooms >= 100, `${rooms} rooms measured`);
});

test('nothing on a wall is behind a head on any real script, and the staging check catches the first rooms\' chart behind Dr. Mira', async () => {
  for (const t of real) { const r = await scanStaging(t, null); if (t.shots.some((sh) => sh.set === 'clinic')) assert.ok(r.wallItems >= 1, `${t.slug}: wall items were measured`); /* a bedroom-only video (no-sleep) has no clinic chart */ assert.deepEqual(r.hidden, [], `${t.slug}: a wall item behind a head`); }
  const t = real.find((x) => x.slug === 'pill-without-water');
  const first = () => [{kind: 'chart', x: 400, y: 250, s: 1, box: [250, 250, 550, 680]}]; // where the room kit first hung it
  const r = await scanStaging(t, null, {wallItems: first});
  assert.ok(r.hidden.some((x) => x.includes('chart') && x.includes('doctor')), 'the chart behind the doctor is reported');
});

test('the rooms are tidy: the owner picked "A" (a few things removed)', async () => {
  const {ROOM_TIDY} = await import('../../src/toons/rooms.tsx');
  assert.equal(ROOM_TIDY, 1, 'the wall keeps its window and the chart; no clock, certificate, pictures or blurred foreground');
});

test('people take the light of a night room, and keep their colours by day', async () => {
  const {roomTone} = await import('../../src/toons/director.ts');
  assert.equal(roomTone({time: 'day'}), null);
  assert.equal(roomTone(undefined), null);
  const night = roomTone({time: 'night'});
  assert.ok(night.every((v) => v < 1 && v >= 0.7), 'dimmed, still easy to read');
  assert.ok(night[2] > night[0], 'cooler: more of the blue is kept than of the red');
  for (const t of real) for (const s of t.shots) if (s.set === 'home' && t.rooms.home.time === 'night') assert.ok(roomTone(t.rooms.home), `${t.slug}: the night home dims its people`);
});

// ---------------------------------------------------------------- nothing half hidden behind a person (owner, 2026-11-17: "this bug repeated again and again")
test('no small thing of a room is half hidden by a person; the room moves it clear or leaves it out', async () => {
  for (const t of real) {
    const now = await scanStaging(t, null);
    assert.ok(now.things >= 2, `${t.slug}: furniture was measured`);
    assert.deepEqual(now.halfHidden, [], `${t.slug}: something half hidden behind a person`);
  }
  // drawn where the room kit first put them, the same rooms fail: the monitor behind Dr. Mira's coat, the side table behind the patient
  const fast = real.find((x) => x.slug === 'eating-too-fast');
  const before = await scanStaging(fast, null, {asDrawn: true});
  assert.ok(before.halfHidden.some((x) => x.includes('monitor') && x.includes('doctor')), `the monitor behind the doctor is reported (${JSON.stringify(before.halfHidden)})`);
  assert.ok(before.halfHidden.some((x) => x.includes('table')), 'the side table behind the patient is reported');
  const pill = real.find((x) => x.slug === 'pill-without-water');
  assert.ok((await scanStaging(pill, null, {asDrawn: true})).halfHidden.some((x) => x.includes('bowl')), 'the fruit bowl behind the patient is reported');
});

test('in every arrangement, with people in the usual places, every small thing is clear of them or left out', async () => {
  const {roomThings, CLEAR} = await import('../../src/toons/rooms.tsx');
  const {peopleBoxes} = await import('../../src/toons/Player.tsx');
  const {ROOM_LAYOUTS} = await import('../../src/toons/director.ts');
  const hit = (a, b, m) => a.x0 < b.x1 + m && a.x1 > b.x0 - m && a.y0 < b.y1 && a.y1 > b.y0;
  let placed = 0;
  for (const [kind, layouts] of Object.entries(ROOM_LAYOUTS)) for (const layout of layouts) {
    const role = kind === 'clinic' ? 'clinic' : 'home';
    const look = {kind, palette: 'mint', wall: 'paint', floor: 'wood', window: {style: 'tall', side: 'left', view: 'garden'}, layout, chart: 'body'};
    const casts = role === 'clinic'
      ? [[{who: 'doctor', x: 285, size: 940}, {who: 'patient', x: 805, size: 900}], [{who: 'doctor', x: 285, size: 940}, {who: 'kid', x: 805, size: 980}], [{who: 'patient', x: 285, size: 900}, {who: 'doctor', x: 805, size: 940}]]
      : [[{who: 'patient', x: 540, size: 1040}], [{who: 'kid', x: 540, size: 1040}], [{who: 'mom', x: 360, size: 1000}, {who: 'kid', x: 760, size: 980}]];
    for (const cast of casts) {
      const people = peopleBoxes({set: role, cast});
      for (const sm of roomThings(look, role, people).smalls) {
        if (sm.drop) continue;
        placed++;
        assert.ok(!people.some((q) => hit(sm.box, q, CLEAR.gap - 1)), `${layout}, ${cast.map((a) => a.who).join(' + ')}: the ${sm.id} at ${Math.round(sm.box.x0)}-${Math.round(sm.box.x1)} touches a person`);
        assert.ok(sm.box.x1 - sm.box.x0 > 0 && sm.box.x0 >= -(sm.box.x1 - sm.box.x0) * 0.2 && sm.box.x1 <= 1080 + (sm.box.x1 - sm.box.x0) * 0.2, `${layout}: the ${sm.id} is mostly outside the picture`);
      }
    }
  }
  assert.ok(placed >= 20, `${placed} small things placed`);
});

// ---------------------------------------------------------------- a stage face has room (owner, 2026-11-17, on the stomach: "too much cluttered")
test('on the stomach stage nothing comes into the face\'s room: the juice stays under it, food and bubbles keep out', async () => {
  const {stageThings, tummyLayout, FACE_ROOM} = await import('../../src/toons/stages.tsx');
  const hit = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  let measured = 0;
  for (const full of [0, 0.3, 0.7, 1]) for (const food of [0, 0.5, 1]) for (const tilt of [0, 0.25, 0.5, 0.75, 1]) for (const air of [0, 1]) for (const t of [0, 1.3, 2.9, 4.4]) {
    const state = {full, food, tilt, air};
    const T = stageThings('tummy', state, t);
    const face = T.faces[0];
    assert.ok(T.surface >= face.y1, `the juice's surface is under the face (${JSON.stringify(state)})`);
    for (const th of T.things) { measured++; assert.ok(!hit(th, face), `${th.id} is in the face's room (${JSON.stringify(state)}, t ${t})`); }
    // food does not float where the hands hang
    const L = tummyLayout(state, t);
    for (const b of L.bits.filter((x) => x.settled)) assert.ok(Math.abs(b.x - L.meAt[0]) >= FACE_ROOM.hands - 1, `food ${b.i + 1} floats between the hands (${JSON.stringify(state)})`);
  }
  assert.ok(measured > 400, `${measured} things measured`);
  // and on every real script that uses the stomach, frame by frame
  for (const t of real) assert.deepEqual((await scanStaging(t, null)).onStageFace, [], `${t.slug}: something on a stage face`);
});

// ---------------------------------------------------------------- the second script shape (owner, 2026-11-17: "remove 3 point, make better hook")
test('a format-2 script opens on the consequence with a short hook to the viewer, asks one question early and answers it late, and never counts', () => {
  const v2 = real.filter((x) => x.format === 2);
  assert.ok(v2.length >= 1, 'there is a script in the second format');
  const known = (t) => ({cast: Object.keys(cast.cast), sfx: LIBRARY.map(([n]) => n), beds: ['bouncy', 'sneaky', 'panic', 'doctor'], others: real.filter((o) => o !== t).map((o) => ({slug: o.slug, episode: o.episode, rooms: o.rooms}))});
  const failed = (t) => checkToon(t, null, known(t)).results.filter((r) => !r.pass).map((r) => r.point);
  for (const t of v2) {
    assert.deepEqual(failed(t), [], `${t.slug} passes`);
    assert.ok(t.hooks.length >= 3, `${t.slug}: three hook choices`);
    assert.ok(!t.shots.flatMap((s) => s.lines ?? []).some((l) => /\b(first|second|third)\b/i.test(l.text)), `${t.slug}: no counting`);
  }
  const base = v2[0];
  // an organ chatting to another organ is not a hook
  let t = clone(base); t.shots[0].lines[0].text = 'Whoa! This belly balloons so fast!'; t.retention.noIntro.line = t.shots[0].lines[0].text; t.hooks[0] = t.shots[0].lines[0].text;
  assert.ok(failed(t).includes('1 Hook: short, to the viewer, about the title'), 'a hook that does not speak to the viewer fails');
  // too long
  t = clone(base); t.shots[0].lines[0].text = 'If you eat too fast then your poor belly balloons up badly today.'; t.retention.noIntro.line = t.shots[0].lines[0].text; t.hooks[0] = t.shots[0].lines[0].text;
  assert.ok(failed(t).includes('1 Hook: short, to the viewer, about the title'), 'a long hook fails');
  // the old opening: the stage starts healthy
  t = clone(base); t.shots[0].state = {full: 0.15};
  assert.ok(failed(t).includes('1 Hook: the first frame shows the consequence'), 'opening on the setup fails');
  // the counting is back
  t = clone(base); t.shots[0].lines[3].text = 'First, air came down too!'; t.shots[0].lines[4].text = 'Second, we are full down here!';
  assert.ok(failed(t).includes('3 No counting'), 'numbered beats fail');
  // the answer given away early
  t = clone(base); t.retention.answer = {scene: t.shots[0].lines[2].id, line: ''};
  assert.ok(failed(t).includes('3 Open question'), 'an answer in the first half fails');
  // the three live scripts keep their own shape and still pass
  for (const o of real.filter((x) => x.format !== 2)) assert.deepEqual(failed(o), [], `${o.slug} (first format) still passes`);
});

// ---------------------------------------------------------------- the music never leaves a hole (found by listening, 2026-11-16)
test('a bed is laid so that its rests fall under voices, and its faded end is cut out of the loop', async () => {
  const {BED, bedHoles, bedRests, bedStart} = await import('../../src/toons/director.ts');
  const shapeOf = (name) => JSON.parse(fs.readFileSync(path.join(ROOT, 'assets', 'toons-music', `${name}.shape.json`), 'utf8'));
  // every bed in the library has its shape on file
  for (const f of fs.readdirSync(path.join(ROOT, 'assets', 'toons-music')).filter((x) => x.endsWith('.mp3'))) assert.ok(fs.existsSync(path.join(ROOT, 'assets', 'toons-music', f.replace(/\.mp3$/, '.shape.json'))), `${f}: run npm run toon:music:scan`);
  // the track the pill video uses fades out: its loop ends before the fade
  const bouncy = shapeOf('bouncy');
  assert.ok(bedRests(bouncy).end < bouncy.seconds - 0.5, 'the faded end is left out of the loop');
  // the hole earshot heard at the pill video's time card (16.3 s, 0.8 s) shows in the first bed's shape and the word times
  const pill = real.find((x) => x.slug === 'pill-without-water');
  const timings = JSON.parse(fs.readFileSync(path.join(ROOT, 'videos', pill.slug, 'toon-timings.json'), 'utf8'));
  const L = layoutToon(pill, timings);
  const before = bedHoles(L, bouncy, 0);
  assert.ok(before.some(([a, b]) => a > 15.5 && a < 17 && b - a >= BED.hole), `a hole near 16.3 s when "bouncy" starts at 0 (found: ${JSON.stringify(before)})`);
  // a track that stops and starts is not a bed for this channel; two of the four never go quiet inside their loop
  const stops = (name) => { const r = bedRests(shapeOf(name)); return r.spans.filter(([a, b]) => a < r.end - 0.05 && b - a >= BED.hole - 1e-9).length; };
  assert.ok(stops('bouncy') >= 1 && stops('sneaky') >= 1, 'the stop-start beds are found');
  assert.equal(stops('doctor') + stops('panic'), 0, 'the steady beds');
  // a video's own track (format 5) is measured once it has been made and scanned
  const bedMade = (t) => fs.existsSync(path.join(ROOT, 'assets', 'toons-music', t.music + '.shape.json'));
  for (const t of real.filter(bedMade)) assert.equal(stops(t.music), 0, `${t.slug}: its bed "${t.music}" is steady`);
  assert.deepEqual(bedStart(L, shapeOf(pill.music)).holes, [], 'no hole is left');
  // a made-up bed with one long rest and a script with no voice at all: the hole cannot be hidden, and the check must say so
  const flat = {step: 0.1, seconds: 10, db: Array.from({length: 100}, (_, i) => (i >= 40 && i < 52 ? -60 : -20))};
  const silent = {...L, lines: []};
  assert.ok(bedStart(silent, flat).holes.length >= 1, 'a rest with nothing over it stays a hole');
});

test('the sound check fails a video whose music rests in a pause', () => {
  for (const t of real.filter((x) => fs.existsSync(path.join(ROOT, 'assets', 'toons-music', x.music + '.shape.json')))) assert.ok(checkSound(t, null).results.some((x) => x.point === 'No hole in a pause' && x.pass), `${t.slug}: bed checked`);
  const t = clone(real[0]);
  t.music = 'bouncy'; // the first bed: it stops for 0.7 s and 0.9 s
  assert.ok(checkSound(t, null).results.some((x) => x.point === 'A steady bed' && !x.pass), 'a stop-start bed fails the sound check');
});

// ---------------------------------------------------------------- a calm mix (owner: "too loud and poor sound")
test('a Toon has few sound effects, kept apart, and no automatic sound on moods, key words or graphics', () => {
  for (const t of real) {
    const L = layoutToon(t, null);
    const plan = soundPlan(L);
    const story = t.shots.flatMap((s) => (s.events ?? []).filter((e) => e.sfx)).length + t.shots.flatMap((s) => s.lines ?? []).filter((l) => l.sfx).length;
    const places = t.shots.length - 1;
    assert.ok(plan.length <= story + places, `${t.slug}: ${plan.length} sounds, only the script's ${story} story sounds and the changes of place`);
    assert.ok((plan.length / (L.total / TOON_FPS)) * 60 <= SOUND.perMinute, `${t.slug}: ${plan.length} sounds`);
    plan.slice(1).forEach((e, i) => assert.ok((e.at - plan[i].at) / TOON_FPS >= SOUND.minGap - 0.01, `${t.slug}: two sounds too close at ${(e.at / TOON_FPS).toFixed(1)} s`));
    assert.ok(plan.every((e) => e.vol <= 0.25), `${t.slug}: every effect well under the voice`);
    const r = checkSound(t, null);
    assert.deepEqual(r.results.filter((x) => !x.pass).map((x) => x.point), [], `${t.slug}: sound check`);
  }
  // a script that asks for a sound on every line does not get them all: they are kept apart
  const t = clone(real[0]);
  for (const l of t.shots.flatMap((s) => s.lines ?? [])) l.sfx = 'pop';
  const crowded = checkSound(t, null);
  assert.ok(!crowded.ok, 'a sound on every line fails the check');
});

test('a piece of food in the stomach never hangs in mid-fall, whatever the food dial rests at', async () => {
  const {tummyLayout} = await import('../../src/toons/stages.tsx');
  for (let v = 0; v <= 1.0001; v += 0.02) {
    const hanging = tummyLayout({food: v, full: 0.4}, 1.7).bits.filter((b) => !b.settled).map((b) => b.i + 1);
    assert.deepEqual(hanging, [], `food ${v.toFixed(2)}: piece(s) ${hanging.join(', ')} are still falling although nothing is changing`);
  }
  // while the dial is moving a new piece is on its way; once the change is over it has landed
  const mid = tummyLayout({food: 0.25, 'food:from': 0, 'food:to': 0.5, full: 0.4}, 1.7).bits;
  assert.ok(mid.some((b) => !b.settled), 'half-way through a change a piece is falling');
  const end = tummyLayout({food: 0.5, 'food:from': 0, 'food:to': 0.5, full: 0.4}, 1.7).bits;
  assert.ok(end.length >= 2 && end.every((b) => b.settled), 'at the end of the change every piece has landed');
});

test('the tooth arena: nothing covers a face in any state, and a story shape keeps to its sticker limit', async () => {
  const {arenaThings, arenaLayout} = await import('../../src/toons/stage-arena.tsx');
  const hit = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;
  const dials = ['night', 'guards', 'sleep', 'sugar', 'snack', 'wash', 'fight', 'party', 'acid', 'chalk', 'brush', 'shield'];
  let seen = 0;
  for (let i = 0; i < 400; i++) {
    const state = Object.fromEntries(dials.map((d, j) => [d, Math.round(((i * (j + 3) * 0.137) % 1) * 20) / 20]));
    const T = arenaThings(state, i * 0.31);
    for (const f of T.faces) for (const th of T.things) { if (th.only && th.only !== f.who) continue; seen++; assert.ok(!hit(th, f), `${th.id} is in front of ${f.who}'s face at ${JSON.stringify(state)}`); }
    for (const g of arenaLayout(state, i * 0.31).guard) assert.ok(Number.isFinite(g.x) && Number.isFinite(g.y), 'a guard has a place');
  }
  assert.ok(seen > 200, 'faces and things were compared');
  const t = real.find((x) => x.format >= 3);
  assert.ok(t, 'there is a format-3 script');
  const stickers = t.shots.flatMap((s) => (s.props ?? []).filter((p) => ['tag', 'chip'].includes(p.kind))).length;
  assert.ok(stickers <= STICKERS, `${t.slug}: ${stickers} stickers`);
  const many = structuredClone(t);
  many.shots.find((s) => s.props).props.push(...Array.from({length: 6}, (_, i) => ({kind: 'tag', text: `label ${i}`, x: 540, y: 400 + i * 90, size: 300, from: many.shots.find((s) => s.props).lines[0].id})));
  const res = checkToon(many, null, known).results.find((r) => r.point === 'Few stickers');
  assert.ok(res && !res.pass, 'a script with too many stickers is refused');
});

test('the word check: the same words pass, a wrong, missing or added word is a fault, a cry or a near miss is a note', async () => {
  const {diffWords, normWords} = await import('../lib/toon-words.mjs');
  assert.deepEqual(normWords("Two minutes, then spit, don’t rinse. 15% of 3-4 hours? Nooo!"), ['two', 'minutes', 'then', 'spit', "don't", 'rinse', 'fifteen', 'percent', 'of', 'three', 'four', 'hours', 'noo']);
  const same = diffWords('It can take fifteen minutes or more to notice you\'re full.', 'It can take 15 minutes or more to notice youre full');
  assert.deepEqual([same.faults, same.notes], [[], []], 'numbers and apostrophes are not differences');
  const wrong = diffWords('Skip brushing at night, your teeth pay.', 'Skip brushing tonight your teeth play');
  assert.ok(wrong.faults.length >= 2, 'a changed word and a dropped word are faults');
  assert.equal(diffWords('Brush for two minutes.', 'Brush for minutes').faults.length, 1, 'a missing word is a fault');
  assert.equal(diffWords('Brush for two minutes.', 'Brush for two long minutes').faults.length, 1, 'an added word is a fault');
  const cry = diffWords('Ow! Why does this tooth ache?', 'Now why does this tooth ache');
  assert.deepEqual([cry.faults.length, cry.notes.length], [0, 1], 'a cry heard as a word is a note');
  const cry2 = diffWords('Ow! Why does this tooth ache?', 'Oh why does this tooth ache');
  assert.deepEqual([cry2.faults.length, cry2.notes.length], [0, 0], 'one cry written as another is the same noise');
  const near = diffWords('The germs feast.', 'The germ feasts');
  assert.deepEqual([near.faults.length, near.notes.length], [0, 2], 'a plural heard differently is a note');
  assert.ok(diffWords('Your teeth pay.', 'Your teeth play').faults.length === 1, 'one letter apart in a short word is a different word');
  // found on the control run over the four published videos (2026-11-17): none of these is a mistake in the voice
  assert.deepEqual(diffWords('Raise the head of your bed 10 to 20 centimetres.', 'raise the head of your bed ten to twenty centimeters').faults, [], 'British and American spelling are the same word');
  assert.deepEqual(diffWords('Same lunch, no balloon. Want to know how?', 'Same lunch, no balloon. Wanna know how?').faults, [], '"wanna" is "want to"');
  const fast = diffWords('Eat too fast and your belly balloons.', 'Eat too fast in your belly balloons.');
  assert.deepEqual([fast.faults.length, fast.notes.length], [0, 1], '"and" squeezed to "in" is a note');
  assert.deepEqual(diffWords('Whee! This time I got my water.', 'Wee! This time I got my water.').faults, [], 'a cry spelled another way is not a fault');
  assert.deepEqual(diffWords('Ow! Why does this tooth ache?', 'Ow. Why does this toothache?').faults, [], 'two words written as one compound are the same words');
  assert.deepEqual(diffWords('I have a toothache today.', 'I have a tooth ache today').faults, [], 'and the other way round');
});
