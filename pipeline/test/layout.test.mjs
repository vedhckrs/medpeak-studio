// Engine v9, phase 1 (2026-11-23): the layout log reports what is drawn where, and every layout check FAILS a known-bad
// frame (blueprint 05, Part 4.13): a caption on a face, a burst on a face, text on text, a half head at the edge, a
// watermark on a head, a listener staring at the lens, a hand that jumps, a re-frame inside a shot.
import {probeShot} from '../lib/toon-layout.mjs'; // first: it prepares the JSX runtime for the probe
import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {scanLayout} from '../lib/toon-staging.mjs';
import {scanLayoutMotion} from '../lib/toon-motion.mjs';
import {scanLayoutCamera} from '../lib/toon-camera.mjs';

const require = createRequire(import.meta.url);
const near = (a, b, tol = 2) => a.every((v, i) => Math.abs(v - b[i]) <= tol);
const asArr = (b) => [b.x0, b.y0, b.x1, b.y1];
const s0 = {id: 'X', t: 0, dur: 5, lines: [], cur: null};

test('the layout log reports a known box to within 2 px (Put, a nested <g transform>, a component that reports itself)', async () => {
  const {LAYOUT_SHOT} = await import('./fixtures/layout-shot.tsx');
  const items = await probeShot(LAYOUT_SHOT, s0);
  const eyes = items.filter((i) => i.kind === 'eye').map((i) => asArr(i.box)).sort((a, b) => a[0] - b[0]);
  assert.equal(eyes.length, 2);
  assert.ok(near(eyes[0], [240, 430, 300, 490]), `left eye ${eyes[0]}`);
  assert.ok(near(eyes[1], [300, 430, 360, 490]), `right eye ${eyes[1]}`);
  assert.equal(items.find((i) => i.kind === 'eye').who, 'liver', 'the Put names the character inside it');
  const body = items.find((i) => i.kind === 'body');
  assert.ok(near(asArr(body.box), [100, 300, 500, 700]), `Put box ${asArr(body.box)}`);
  const mouth = items.find((i) => i.kind === 'mouth');
  assert.ok(near([mouth.box.x0, mouth.box.x1], [480, 520]), `mouth ${asArr(mouth.box)}`);
  const plate = items.find((i) => i.kind === 'plate');
  assert.equal(plate.src, 'report');
  assert.ok(near(asArr(plate.box), [700, 200, 900, 260]));
  // the camera: zoom 2 about (300, 500) puts the left eye's centre at 540 + (270 - 300) * 2 = 480
  const zoomed = await probeShot(LAYOUT_SHOT, s0, {x: 300, y: 500, z: 2});
  const le = zoomed.filter((i) => i.kind === 'eye').map((i) => asArr(i.box)).sort((a, b) => a[0] - b[0])[0];
  assert.ok(near(le, [420, 820, 540, 940]), `zoomed eye ${le}`);
});

test('probing changes nothing on the page (a normal render draws exactly the same markup)', async () => {
  const {LAYOUT_SHOT} = await import('./fixtures/layout-shot.tsx');
  const React = require('react');
  const {renderToStaticMarkup} = require('react-dom/server');
  const play = await import('../../src/toons/v8/play.tsx');
  const plain = renderToStaticMarkup(React.createElement(LAYOUT_SHOT.Scene, {s: s0}));
  const sink = {add: () => {}, next: (() => { let n = 0; return () => `n${n++}`; })()};
  const probed = renderToStaticMarkup(React.createElement(play.LayoutCtx.Provider, {value: sink}, React.createElement(LAYOUT_SHOT.Scene, {s: s0})));
  assert.equal(probed, plain);
});

// ------------------------------------------------------------------ known-bad frames for the checks
const item = (kind, box, extra = {}) => ({kind, box, src: 'report', ...extra});
const probe = (t, items, extra = {}) => ({t, shot: 'A', si: 0, kind: 'body', cam: {x: 540, y: 960, z: 1}, line: null, speaker: null, cast: [], items, ...extra});
const logOf = (frames, extra = {}) => ({format: 6, caption: 2, every: 1 / 30, story: 10, lines: [], shots: [{id: 'A', from: 0, to: 10, kind: 'body'}], probes: frames, ...extra});
const face = (x, y, who = 'liver') => item('face', [x - 60, y - 50, x + 60, y + 70], {who});
const run = (n, f) => Array.from({length: n}, (_, i) => f(i / 30, i));
const status = (r, id) => r.checks.find((c) => c.id === id).status;

test('a clean frame passes L1, L2, L3, L5, L6, L7', () => {
  const r = scanLayout(logOf(run(30, (t) => probe(t, [face(540, 600), item('caption', [460, 1324, 620, 1434], {text: 'HI'}), item('watermark', [760, 160, 960, 196])]))));
  for (const id of ['L1', 'L2', 'L3', 'L5', 'L6', 'L7']) assert.equal(status(r, id), 'pass', id);
});

test('the caption on a face FAILS L3 (the owner: "caption on eyes")', () => {
  const r = scanLayout(logOf(run(10, (t) => probe(t, [face(540, 1360), item('eye', [500, 1330, 540, 1370]), item('caption', [460, 1324, 620, 1434], {text: 'HI'})]))));
  assert.equal(status(r, 'L3'), 'fail');
});

test('a burst on a face FAILS L1 and L7; three bursts in a video FAIL L7', () => {
  const r = scanLayout(logOf(run(8, (t) => probe(t, [face(540, 600), item('fx', [480, 520, 640, 680], {id: 'b1'})]))));
  assert.equal(status(r, 'L1'), 'fail');
  assert.equal(status(r, 'L7'), 'fail');
  const three = scanLayout(logOf([0, 1, 2].map((k) => probe(k, [item('fx', [100, 100, 200, 200], {id: `b${k}`})]))));
  assert.equal(status(three, 'L7'), 'fail');
});

test('text on text FAILS L2 (a tag under the caption)', () => {
  const r = scanLayout(logOf(run(5, (t) => probe(t, [item('tag', [400, 1300, 700, 1380], {text: 'KIDNEY'}), item('caption', [460, 1324, 620, 1434], {text: 'HI'})]))));
  assert.equal(status(r, 'L2'), 'fail');
});

test('a head held half out of the picture FAILS L6; one passing through the edge does not', () => {
  const held = scanLayout(logOf(run(30, (t) => probe(t, [item('head', [-150, 400, 150, 700], {who: 'mom'})]))));
  assert.equal(status(held, 'L6'), 'fail');
  const passing = scanLayout(logOf(run(5, (t) => probe(t, [item('head', [-150, 400, 150, 700], {who: 'mom'})]))));
  assert.equal(status(passing, 'L6'), 'pass');
});

test('the watermark on a head, or 34 px above the caption, FAILS L5', () => {
  const onHead = scanLayout(logOf(run(5, (t) => probe(t, [item('head', [700, 100, 1000, 400], {who: 'mom'}), item('watermark', [760, 160, 960, 196])]))));
  assert.equal(status(onHead, 'L5'), 'fail');
  const byCaption = scanLayout(logOf(run(5, (t) => probe(t, [item('watermark', [96, 1274, 296, 1290])]))));
  assert.equal(status(byCaption, 'L5'), 'fail');
});

test('a listener staring at the lens through a line FAILS L10; looking at the speaker passes', () => {
  const lines = [{id: 'A1', who: 'mom', from: 0, voice: 1, words: [['hi', 0, 0.5]]}, {id: 'A2', who: 'doctor', from: 1, voice: 2, words: [['so', 0, 0.5]]}];
  const frames = (dir) => run(60, (t) => probe(t, [item('face', [100, 500, 300, 700], {who: 'mom', dir}), item('face', [700, 500, 900, 700], {who: 'doctor', dir: [-0.8, 0]})], {line: t < 1 ? 'A1' : 'A2', speaker: t < 1 ? 'mom' : 'doctor'}));
  assert.equal(status(scanLayout(logOf(frames([0, 0.05]), {lines})), 'L10'), 'fail');
  assert.equal(status(scanLayout(logOf(frames([0.8, 0]), {lines})), 'L10'), 'pass');
});

test('a hand that jumps for one frame FAILS M3 and M4 (a pose switched by a threshold)', () => {
  const frames = run(10, (t, i) => probe(t, [item('head', [500, 400, 600, 500], {who: 'mom'}), item('hand', i === 5 ? [800, 900, 840, 940] : [500, 900, 540, 940], {who: 'mom', id: 'R'})]));
  const r = scanLayoutMotion(logOf(frames));
  assert.equal(r.checks.find((c) => c.id === 'M3').status, 'fail');
  assert.equal(r.checks.find((c) => c.id === 'M4').status, 'fail');
});

test('two re-frames inside a shot FAIL V1 (one punch-in a video at most); a held framing passes', () => {
  const cams = run(90, (t) => probe(t, [], {cam: t < 1 ? {x: 540, y: 960, z: 1} : t < 2 ? {x: 600, y: 800, z: 1.6} : {x: 540, y: 960, z: 1}}));
  assert.equal(scanLayoutCamera(logOf(cams)).checks.find((c) => c.id === 'V1').status, 'fail');
  const held = run(90, (t) => probe(t, []));
  const r = scanLayoutCamera(logOf(held));
  assert.equal(r.checks.find((c) => c.id === 'V1').status, 'pass');
  assert.equal(r.checks.find((c) => c.id === 'V3').status, 'pass');
});
