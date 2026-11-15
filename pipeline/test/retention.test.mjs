import test from 'node:test';
import assert from 'node:assert/strict';
import {checkCut} from '../lib/retention.mjs';
import {toWords} from '../voice.mjs';

const scene = (id, text, extra = {}) => ({id, text, visual: {type: 'title', text: '', panels: [{}, {}, {}]}, ...extra});
const plan = {
  noIntro: {scene: 'S1', line: 'Your liver can lose fat fast'},
  promise: {scene: 'S2', line: 'three steps'},
  counting: {scene: 'S3,S4,S6', line: ''},
  change3s: {scene: 'all', line: ''},
  twist: {scene: 'S5', line: ''},
  bestLast: {scene: 'S6', line: ''},
  loop: {scene: 'S7', line: ''},
};
const good = [
  scene('S1', 'Your liver can lose fat fast.'),
  scene('S2', 'Here it is in three steps, and the last one matters most.'),
  scene('S3', 'Number one: keep the calories the same.'),
  scene('S4', 'Number two: swap sugar for starch, and nothing else changes at all, not the meals, not the portions, not the timing of food.', {visual: {type: 'title', text: '', panels: [{}, {}, {}, {}]}}),
  scene('S5', "But here's the twist: they did not eat any less food at all, the very same plates of food every single day, morning to night.", {visual: {type: 'title', text: '', panels: [{}, {}, {}, {}, {}]}}),
  scene('S6', 'Number three: the liver lost fat in under two weeks.'),
  scene('S7', 'So yes, your liver can lose fat fast.'),
];

test('a script that follows Retention 7 passes', () => {
  const r = checkCut({scenes: good, retention: plan, isShort: true, sources: [], timings: null, label: 't'});
  assert.equal(r.ok, true, JSON.stringify(r.results.filter((x) => !x.pass)));
});

test('an intro greeting fails point 1', () => {
  const bad = [scene('S1', 'Hello friends, welcome back. Your liver can lose fat fast.'), ...good.slice(1)];
  const r = checkCut({scenes: bad, retention: plan, isShort: true, sources: [], timings: null, label: 't'});
  assert.equal(r.results.find((x) => x.point === '1 No intro').pass, false);
});

test('a number without a source fails', () => {
  const bad = good.map((s) => (s.id === 'S6' ? {...s, text: 'Number three: liver fat fell by 47 percent.'} : s));
  const r = checkCut({scenes: bad, retention: plan, isShort: true, sources: [], timings: null, label: 't'});
  assert.equal(r.results.find((x) => x.point === 'Sources on numbers').pass, false);
});

test('cure claims are blocked', () => {
  const bad = good.map((s) => (s.id === 'S4' ? {...s, text: 'Number two: this will cure your liver.'} : s));
  const r = checkCut({scenes: bad, retention: plan, isShort: true, sources: [], timings: null, label: 't'});
  assert.equal(r.results.find((x) => x.point === 'No banned claims').pass, false);
});

test('ElevenLabs character alignment becomes words', () => {
  const al = {characters: [...'Hi you'], character_start_times_seconds: [0, 0.1, 0.2, 0.3, 0.4, 0.5], character_end_times_seconds: [0.1, 0.2, 0.3, 0.4, 0.5, 0.6]};
  assert.deepEqual(toWords(al).map((w) => w.w), ['Hi', 'you']);
});
