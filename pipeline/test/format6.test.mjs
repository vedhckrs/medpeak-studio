// Engine v9 / script format 6 (plans/engine-upgrade-2026-11-23/05-blueprint.md Parts 4.8, 4.11 and 5; the owner said yes to
// every decision on 2026-11-23). These prove: the new script gate fails the old one-fact-a-line scripts where it should and passes
// a good one-story script; format 6 timing and sound; the motion kit's limits (dive, enter, the one-frame pop latch). Scripts
// already out (format 5 and older) keep their old layout and old gate; toons.test.mjs keeps proving that.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from '../lib/util.mjs';
import {loadCast} from '../lib/toon-audio.mjs';
import {LIBRARY} from '../toon-sfx.mjs';
import {BEDS} from '../toon-music.mjs';
import {checkToon, F6, MUSIC_TEMPLATE, musicPrompt6} from '../lib/toon-rules.mjs';
import {checkCut} from '../lib/retention.mjs';
import {bedAt, FORMAT6, GAP, layoutToon, SHOT_GAP, SOUND, SOUND6, stopsOf, TOON_FPS, WPS6, wps6Of} from '../../src/toons/director.ts';
import {along, DIVE_MAX_STEP, diveDur, diveZoom, easeOutSoft, enter, fill, latched, leave, reveal} from '../../src/toons/v8/act.tsx';
import {poundingV9, POUND_MAX} from '../../src/toons/v8/organ-act.tsx';

const read = (slug) => JSON.parse(fs.readFileSync(path.join(ROOT, 'videos', slug, 'toon.json'), 'utf8'));
const others = fs.readdirSync(path.join(ROOT, 'videos')).filter((d) => fs.existsSync(path.join(ROOT, 'videos', d, 'toon.json'))).map((d) => read(d)).map((t) => ({slug: t.slug, episode: t.episode, rooms: t.rooms}));
const known = {cast: Object.keys(loadCast().cast), sfx: LIBRARY.map(([n]) => n), beds: BEDS.map(([n]) => n), others, ctaSeconds: 5.5};
const good = JSON.parse(fs.readFileSync(path.join(ROOT, 'pipeline', 'test', 'fixtures', 'format6-good.json'), 'utf8'));
const as6 = (slug) => ({...read(slug), format: 6});
const failed = (t, k = known) => checkToon(t, null, k).results.filter((r) => !r.pass).map((r) => r.point);

test('format 6: a good one-story script passes every check (S1-S12, impacts, stops, hold, music family)', () => {
  const c = checkToon(good, null, known);
  assert.deepEqual(c.results.filter((r) => !r.pass).map((r) => `${r.point}: ${r.detail}`), []);
  for (const p of ['S1 Hook in the story', 'S2 One story', 'S3 Cast returns', 'S4 Answer block', 'S5 Breath', 'S8 Places', 'S9 End card', 'S10 One real intruder', 'S11 No gauges inside the body', 'S12 Time cards', 'Music stops', 'One action, then a hold', 'Music family']) {
    assert.ok(c.results.some((r) => r.point === p), `the check "${p}" ran`);
  }
});

test('format 6: the creatine script (a fact a line) FAILS One story and Cast returns; fasting FAILS Breath', () => {
  const crea = failed(as6('creatine'));
  for (const p of ['S2 One story', 'S3 Cast returns', 'S4 Answer block', 'S8 Places', 'Impacts: one flash at most']) assert.ok(crea.includes(p), `creatine should fail ${p}: ${crea.join(', ')}`);
  assert.ok(failed(as6('fasting')).includes('S5 Breath'));
});

test('format 6: each S-check fails its own known-bad change of the good script', () => {
  const clone = () => JSON.parse(JSON.stringify(good));
  const bad = (edit, point) => { const t = clone(); edit(t); assert.ok(failed(t).includes(point), `${point} should fail`); };
  bad((t) => { t.shots[0].events = []; }, 'S1 Hook in the story'); // the first word comes at 0 s: no picture first
  bad((t) => { for (const s of t.shots) for (const l of s.lines) if (!l.answer) { delete l.chat; l.src = ['fx-cilia']; } }, 'S2 One story');
  bad((t) => { t.shots[2].lines[2].who = 'dad'; t.shots[2].cast.push({who: 'dad', x: 300, size: 500}); }, 'S3 Cast returns');
  bad((t) => { for (const l of t.shots[5].lines) delete l.care; }, 'S4 Answer block');
  bad((t) => { t.shots[5].lines[2].text = 'Tar.'; t.shots[5].lines[1].text = 'Hairs.'; }, 'S4 Answer block');
  bad((t) => { t.shots[2].events[0].at = 'V3'; delete t.shots[2].events[0].word; delete t.shots[2].events[0].stop; }, 'S5 Breath'); // the beat has no picture event
  bad((t) => { t.shots[1].lines[0].text = 'Huh? He quit... so why do I still cough?'; }, 'S6 No "..." inside a line');
  bad((t) => { t.shots[1].lines[1].text = 'Twenty years, thirty cigarettes, forty coughs, boss.'; t.shots[1].lines[1].key = 'boss'; }, 'S7 Numbers said');
  bad((t) => { t.shots.splice(3, 2); t.retention.twist = {scene: 'V3', line: t.shots[2].lines[2].text}; }, 'S8 Places'); // one body place left in the middle
  bad((t) => { delete t.intruder; }, 'S10 One real intruder');
  bad((t) => { t.shots[1].props = [{kind: 'clock', x: 300, y: 300, size: 200}]; }, 'S11 No gauges inside the body');
  bad((t) => { t.shots[3].same = 'B'; }, 'S12 Time cards'); // the shot after the card is not B
  bad((t) => { t.shots[3].seconds = 2; }, 'S12 Time cards');
  bad((t) => { t.shots[1].events[1].fx = 'flash'; t.shots[2].events[1].fx = 'flash'; }, 'Impacts: one flash at most');
  bad((t) => { t.shots[2].events[0].delay = 0; }, 'Music stops'); // the stop lands on a word
  bad((t) => { t.shots[1].events.push({at: 'B2', word: 'stuck', act: 'crew: a second action too soon'}); }, 'One action, then a hold');
  bad((t) => { t.musicPrompt = 'Gentle corporate piano at 96 BPM with soft pads and a calm mood for a health video.'; }, 'Music family');
  assert.ok(failed(good, {...known, ctaSeconds: 17.8}).includes('S9 End card'));
});

test('format 6 timing: 0.22 s between lines, 0.5 s after a scene, the automatic pauses, a 1 s card; format 5 unchanged', () => {
  const L6 = layoutToon(good, null);
  const L5 = layoutToon({...good, format: 5}, null);
  const sec = (l, wps) => Math.max(0.9, l.line.text.split(/\s+/).filter(Boolean).length / wps);
  // format 5: every line lasts its estimate + 0.14 s (+ its beat); no pauses before lines
  L5.lines.forEach((l, i) => {
    assert.equal(l.frames, Math.round((sec(l, 2.94) + GAP + (l.line.beat ?? 0)) * TOON_FPS));
    if (i && l.si === L5.lines[i - 1].si) assert.equal(l.from, L5.lines[i - 1].from + L5.lines[i - 1].frames);
  });
  assert.equal(L5.shots[3].frames, Math.round(1.0 * TOON_FPS), 'the card keeps its own seconds');
  // format 6
  // the estimate before voicing: each speaker's measured pace (WPS6_BY: body, person, doctor) and the line's own tempo
  L6.lines.forEach((l) => assert.equal(l.frames, Math.round((sec(l, wps6Of(l.line.who)) / Math.max(0.85, Math.min(1.15, l.line.tempo ?? 1)) + FORMAT6.gap + (l.line.beat ?? 0)) * TOON_FPS)));
  const at = (id) => L6.lines.find((l) => l.line.id === id);
  const prevEnd = (id) => { const i = L6.lines.indexOf(at(id)); return L6.lines[i - 1].from + L6.lines[i - 1].frames; };
  assert.equal(at('D2').from - prevEnd('D2'), Math.round(FORMAT6.pause.answer * TOON_FPS), 'a pause before the answer block');
  assert.equal(at('B2').from - prevEnd('B2'), Math.round(FORMAT6.pause.shock * TOON_FPS), 'a pause after a shocked line');
  assert.equal(at('A1').from, Math.round(FORMAT6.pause.firstEvent * TOON_FPS), 'the picture acts first');
  const last = L6.lines.filter((l) => l.si === 1).pop();
  assert.equal(L6.shots[1].from + L6.shots[1].frames - (last.from + last.frames), Math.round(FORMAT6.shotGap * TOON_FPS));
  assert.equal(SHOT_GAP, 0.25);
  const card = {...good, shots: good.shots.map((s) => (s.card ? {...s, seconds: undefined} : s))};
  assert.equal(layoutToon(card, null).shots[3].frames, Math.round(FORMAT6.card * TOON_FPS), 'a format-6 card lasts 1 s by default');
});

test('format 6 sound: the bed about 5 dB up in the pauses, a 3 dB dip under words over 0.25 s, silent in a planned stop', () => {
  const db = (a, b) => 20 * Math.log10(a / b);
  assert.ok(Math.abs(db(SOUND6.bed * SOUND6.music, SOUND.bed * 0.9) - 5) < 0.3, 'pauses about 5 dB louder than the old bed');
  assert.ok(Math.abs(db(SOUND6.bed, SOUND6.bedUnderVoice) - 3) < 0.2, 'a 3 dB dip under words');
  assert.equal(SOUND6.perMinute, 14);
  const L = layoutToon(good, null);
  const [a, b] = stopsOf(L)[0];
  assert.equal(bedAt(L, (a + b) / 2), 0, 'the bed stops for a planned stop');
  assert.ok(bedAt(L, a - 3) > 0.5, 'and is back around it');
  const d2 = L.lines.find((l) => l.line.id === 'D3');
  assert.ok(Math.abs(bedAt(L, d2.from + 20) - SOUND6.bedUnderVoice) < 1e-9, 'under a word: the dipped level');
  // a format-5 video: no stops honoured, the old levels
  const L5 = layoutToon({...good, format: 5}, null);
  assert.ok(bedAt(L5, (a + b) / 2) > 0.4);
  assert.ok(bedAt(L5, L5.lines[3].from + 20) <= SOUND.bed + 1e-9);
});

test('the music template is funk, 130-165 BPM, and passes the family check', () => {
  const p = musicPrompt6({colour: 'a cheeky muted trumpet', answerAt: 36, bpm: 200});
  assert.match(p, /funk/i);
  assert.match(p, new RegExp(`${F6.bpm[1]} BPM`));
  assert.match(MUSIC_TEMPLATE, /\{colour\}/);
  assert.equal(failed({...good, musicPrompt: musicPrompt6({colour: 'a wobbly synth for the smoke', answerAt: 36})}).length, 0);
});

test('Retention 7 for format 6: the story question can be the promise; ending on a question can be the loop (the old cut is unchanged)', () => {
  const scenes = [{id: 'a', text: 'Hey, who did this?'}, {id: 'b', text: 'It was the tar, boss.'}, {id: 'c', text: 'So I keep going?'}];
  const retention = {noIntro: {scene: 'a', line: 'Hey, who did this?'}, question: {scene: 'a', line: 'Hey, who did this?'}, twist: {scene: 'b'}, bestLast: {scene: 'c'}, loop: {scene: 'c'}};
  const pt = (r, p) => r.results.find((x) => x.point === p).pass;
  const old = checkCut({scenes, retention, isShort: true, sources: [], label: 'x'});
  const neu = checkCut({scenes, retention, isShort: true, sources: [], label: 'x', toons6: true});
  assert.equal(pt(old, '2 Promise'), false);
  assert.equal(pt(old, '7 Loop'), false);
  assert.equal(pt(neu, '2 Promise'), true);
  assert.equal(pt(neu, '7 Loop'), true);
});

// ---------------------------------------------------------------- the motion kit (act.tsx, organ-act.tsx)
test('the shared dive: 0.8-1 s, log-even, no frame zooms more than 6% from the one before', () => {
  for (const asked of [0.5, 0.8, 0.9, 1.0, 2]) {
    const d = diveDur(asked, 10);
    assert.ok(d >= 0.8 - 1e-9 && d <= 1 + 1e-9, `length ${d}`);
    const n = Math.round(d * 60);
    let worst = 0;
    for (let i = 1; i <= n; i++) worst = Math.max(worst, diveZoom(i / n, 1, 10, d) / diveZoom((i - 1) / n, 1, 10, d));
    assert.ok(worst <= 1 + DIVE_MAX_STEP + 1e-9, `${asked} s: a frame zooms ${(worst - 1) * 100}%`);
    assert.ok(Math.abs(diveZoom(1, 1, 10, d) - 10) < 1e-9 && Math.abs(diveZoom(0, 1, 10, d) - 1) < 1e-9);
  }
});

test('enter, leave, along, fill, reveal: one action of 0.3-0.8 s, at most 4% overshoot, then a hold', () => {
  let peak = 0;
  for (let k = 0; k <= 1; k += 0.001) peak = Math.max(peak, easeOutSoft(k));
  assert.ok(peak > 1 && peak <= 1.04, `overshoot ${peak}`);
  assert.equal(enter(0, 1, 'top').dy, -1300);
  assert.ok(Math.abs(enter(1.6, 1, 'top').dy) < 1e-9);
  assert.equal(enter(3, 1, 'left', 5).k, 1, 'an entry is never longer than 0.8 s');
  assert.equal(enter(1.1, 1, 'left', 0.05).k < 1, true, 'or shorter than 0.3 s');
  assert.equal(leave(1.5, 1, 'right').dx, 1300);
  const p = along([[0, 0], [100, 50], [200, 0]], 2, 1, 0.6);
  assert.deepEqual([Math.round(p.x), Math.round(p.y)], [200, 0]);
  assert.equal(fill(0.5, 1), 0);
  assert.equal(fill(2, 1), 1);
  assert.deepEqual(reveal(2, 1, 0.8, 'left').rect(0, 0, 100, 50), [0, 0, 100, 50]);
  assert.deepEqual(reveal(0, 1, 0.8, 'bottom').rect(0, 0, 100, 50), [0, 50, 100, 0]);
});

test('latched: a pose cannot flip for one frame (the creatine arm pop at 18.4 s), real changes still happen', () => {
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const reps = [3.97, 4.48, 5.0, 5.34]; // creatine D3: "power", "short", "hard", "bursts"
  const flex = (t) => reps.reduce((m, r) => Math.max(m, t >= r - 0.08 && t < r + 0.34 ? Math.sin(clamp01((t - r + 0.08) / 0.42) * Math.PI) : 0), 0);
  const runs = (f) => { const out = []; let st = f(3), n = 0; for (let i = 0; i <= 240; i++) { const v = f(3 + i / 60); if (v !== st) { out.push(n); st = v; n = 0; } n++; } return out; };
  assert.ok(runs((t) => Math.max(0.3, flex(t)) > 0.4).some((n) => n === 1), 'the old switch has a one-frame run');
  const neu = runs((t) => latched(t, flex, 0.4, 0.4));
  assert.ok(neu.every((n) => n >= 6), `no run under 6 frames: ${neu.join(', ')}`);
  assert.equal(neu.length, runs((t) => Math.max(0.3, flex(t)) > 0.4).length - 2, 'only the blip is gone');
});

test('format-6 gestures: a fist pumps 0.8 s at most', () => {
  assert.equal(POUND_MAX, 0.8);
  assert.equal(poundingV9(1.9, 1, 3), null);
  assert.notEqual(poundingV9(1.5, 1, 3), null);
});
