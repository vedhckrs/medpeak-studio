// The doctor, rigged from the stock parts cut by ai-extract.jsx, drawn by Animate (an-rig.jsfl).
//   node pipeline/animate/rig-doctor.mjs sheet   eight poses, joined into one sheet (out/animate/doctor-poses.png)
//   node pipeline/animate/rig-doctor.mjs clip    a 4 s talking test (out/animate/doctor-test.mp4)
// What happens here, in code only:
//   1 the arms are one solid shape in the artwork, so each is cut at the elbow and the wrist with a
//     round joint (ffmpeg), which lets the pieces turn without a gap;
//   2 every pose is worked out from joint angles (shoulder, elbow, wrist, head) into one matrix per piece;
//   3 Animate places the pieces on layers, one keyframe per frame, and exports transparent PNG frames.
// Windows only (Animate and Illustrator are driven through their own scripting). The stock artwork is
// licensed and stays in stock/ (git-ignored).
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const PARTS = path.join(root, 'stock', 'doctor-10005316', 'parts');
const RIG = path.join(root, 'stock', 'doctor-10005316', 'rig');
const OUT = path.join(root, 'out', 'animate');
const FRAMES = path.join(OUT, 'doctor-frames');

const W = 1080;
const H = 1920;
const FPS = 30;
const K = 4; // stage pixels per artwork unit (the PNG parts are cut at 4x, so they are drawn 1:1)
const AXIS = 461.8; // the figure's centre line, in artwork units
const FEET = 953;
const stage = (u) => [(u[0] - AXIS) * K + W / 2, (u[1] - FEET) * K + 1750];

const parts = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(PARTS, 'parts.json'), 'utf8')).map((p) => [p.name, p]));
const need = (name) => {
  if (!parts[name]) throw new Error(`part ${name} is missing: run ai-extract.jsx first`);
  return parts[name];
};
const uri = (file) => 'file:///' + file.replace(/\\/g, '/').replace(/^([A-Za-z]):/, '$1|');
const ffmpeg = (args) => {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...args], {encoding: 'utf8'});
  if (r.status !== 0) throw new Error('ffmpeg: ' + (r.stderr || r.error));
};

// ---- joints, in artwork units. "L" is the arm on the right of the picture (her left). ----
const mirror = (p) => [2 * AXIS - p[0], p[1]];
const JOINT = {
  L: {shoulder: [492.5, 677], elbow: [491.6, 728], wrist: [500.8, 777], sleeve: 'front-03', arm: 'front-22', out: -1},
  R: {shoulder: mirror([492.5, 677]), elbow: mirror([491.6, 728]), wrist: mirror([500.8, 777]), sleeve: 'front-02', arm: 'front-23', out: 1},
};
const NECK = [461.8, 651];
// the width of a piece on one line of its picture: [left, right] in pixels, where it is not see-through
const extent = (file, y) => {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `format=rgba,crop=iw:1:0:${Math.round(y)}`, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], {maxBuffer: 1 << 24});
  const b = r.stdout;
  let lo = -1;
  let hi = -1;
  for (let x = 0; x < b.length / 4; x++) if (b[x * 4 + 3] > 128) { if (lo < 0) lo = x; hi = x; }
  return [lo, hi];
};
const HANDS = {open: 'hand-24', palm: 'hand-22', point: 'hand-27', ok: 'hand-23'};
const FACES = {smile: 'face-14', calm: 'face-10', oh: 'face-08', angry: 'face-04', grin: 'face-02'};

// ---- 1 cut the arm pieces ----
const cut = (src, dst, keep) => {
  // keep is an ffmpeg expression in X, Y (pixels) that is above 0 where the piece stays
  ffmpeg(['-i', src, '-vf', `format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='alpha(X,Y)*gt(${keep},0)'`, dst]);
};
const buildPieces = () => {
  fs.mkdirSync(RIG, {recursive: true});
  for (const side of ['L', 'R']) {
    const j = JOINT[side];
    const sleeve = need(j.sleeve);
    const arm = need(j.arm);
    // the elbow sits in the middle of the sleeve, and its round joint is exactly as wide as the sleeve
    const ey = ((j.elbow[1] - sleeve.y) * 4).toFixed(1);
    const [lo, hi] = extent(path.join(PARTS, j.sleeve + '.png'), ey);
    const ex = ((lo + hi) / 2).toFixed(1);
    const er = ((hi - lo) / 2 + 1).toFixed(1);
    j.elbow = [sleeve.x + ex / 4, j.elbow[1]];
    const round = `lt(hypot(X-${ex},Y-${ey}),${er})`;
    cut(path.join(PARTS, j.sleeve + '.png'), path.join(RIG, `upper${side}.png`), `lt(Y,${ey})+${round}`);
    cut(path.join(PARTS, j.sleeve + '.png'), path.join(RIG, `fore${side}.png`), `gte(Y,${ey})+${round}`);
    const wy = ((j.wrist[1] - arm.y) * 4).toFixed(1);
    const [wl, wh] = extent(path.join(PARTS, j.arm + '.png'), wy);
    const wx = ((wl + wh) / 2).toFixed(1);
    j.wrist = [arm.x + wx / 4, j.wrist[1]];
    cut(path.join(PARTS, j.arm + '.png'), path.join(RIG, `hand${side}.png`), `gte(Y,${wy})+lt(hypot(X-${wx},Y-${wy}),${((wh - wl) / 2 + 1).toFixed(1)})`);
  }
};

// ---- 2 the pieces, back to front, and how each one is placed ----
const rot = (v, deg) => {
  const t = (deg * Math.PI) / 180;
  return [v[0] * Math.cos(t) - v[1] * Math.sin(t), v[0] * Math.sin(t) + v[1] * Math.cos(t)];
};
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
// the matrix of a bitmap whose top-left corner sits at "corner" (artwork units, measured from the
// pivot) when the pivot is at "pivot" (stage pixels) and the piece is turned by "deg"
const matrix = (pivot, deg, corner, flip = 1) => {
  const t = (deg * Math.PI) / 180;
  const c = Math.cos(t);
  const s = Math.sin(t);
  const o = add(pivot, rot([corner[0] * K, corner[1] * K], deg));
  const r6 = (n) => Math.round(n * 1e4) / 1e4;
  return [r6(c * flip), r6(s * flip), r6(-s), r6(c), r6(o[0]), r6(o[1])];
};
const still = (name, file, group) => ({name, file: file || path.join(PARTS, name + '.png'), group, at: [need(name).x, need(name).y]});
const pieces = () => {
  const list = [
    still('front-24', null, 'floor'),
    still('front-26', null, 'head'),
    still('front-25', null, 'body'),
    still('front-21', null, 'legs'),
    still('front-20', null, 'legs'),
    still('front-18', null, 'body'),
    still('front-19', null, 'body'),
    still('front-04', null, 'body'),
  ];
  // the faces: every one is set on the figure's own face, chin to chin
  const own = need('front-14');
  const chin = [own.x + own.w / 2, own.y + own.h];
  for (const [key, name] of Object.entries(FACES)) {
    const f = need(name);
    list.push({name: 'face-' + key, file: path.join(PARTS, name + '.png'), group: 'face', face: key, at: [chin[0] - f.w / 2, chin[1] - f.h]});
  }
  list.push(still('front-01', null, 'body'), still('front-00', null, 'body'));
  for (const side of ['R', 'L']) {
    const j = JOINT[side];
    list.push({name: 'hand' + side, file: path.join(RIG, `hand${side}.png`), group: 'hand', side, hand: 'rest', at: [need(j.arm).x, need(j.arm).y]});
    for (const [key, name] of Object.entries(HANDS)) {
      const h = need(name);
      list.push({name: `hand${side}-${key}`, file: path.join(PARTS, name + '.png'), group: 'hand', side, hand: key, anchor: [h.w / 2, h.h - 2]});
    }
    list.push({name: 'upper' + side, file: path.join(RIG, `upper${side}.png`), group: 'upper', side, at: [need(j.sleeve).x, need(j.sleeve).y]});
    list.push({name: 'fore' + side, file: path.join(RIG, `fore${side}.png`), group: 'fore', side, at: [need(j.sleeve).x, need(j.sleeve).y]});
  }
  return list;
};

// ---- a pose: joint angles in degrees. shoulder > 0 lifts the arm away from the body, elbow > 0
// bends the forearm the same way (up and out), elbow < 0 folds it across the body. ----
const REST = {
  face: 'smile', head: 0, bob: 0,
  L: {shoulder: 0, elbow: 0, wrist: 0, hand: 'rest'},
  R: {shoulder: 0, elbow: 0, wrist: 0, hand: 'rest'},
};
const pose = (p) => ({...REST, ...p, L: {...REST.L, ...(p.L || {})}, R: {...REST.R, ...(p.R || {})}});
const place = (list, p) => {
  const lift = [0, p.bob]; // the body breathes: everything above the legs moves by this much
  const neck = add(stage(NECK), [0, p.bob * K]);
  const arm = {};
  for (const side of ['L', 'R']) {
    const j = JOINT[side];
    const a = p[side];
    const t1 = j.out * a.shoulder;
    const t2 = t1 + j.out * a.elbow;
    const t3 = t2 + j.out * a.wrist;
    const S = add(stage(j.shoulder), [0, p.bob * K]);
    const E = add(S, rot(sub(j.elbow, j.shoulder).map((n) => n * K), t1));
    const Wr = add(E, rot(sub(j.wrist, j.elbow).map((n) => n * K), t2));
    arm[side] = {t1, t2, t3, S, E, Wr, j, a};
  }
  return list.map((it) => {
    if (it.group === 'floor' || it.group === 'legs') return matrix(stage(it.at), 0, [0, 0]);
    if (it.group === 'body') return matrix(stage(add(it.at, lift)), 0, [0, 0]);
    if (it.group === 'head') return matrix(neck, p.head, sub(it.at, NECK));
    if (it.group === 'face') return it.face === p.face ? matrix(neck, p.head, sub(it.at, NECK)) : 0;
    const A = arm[it.side];
    if (it.group === 'upper') return matrix(A.S, A.t1, sub(it.at, A.j.shoulder));
    if (it.group === 'fore') return matrix(A.E, A.t2, sub(it.at, A.j.elbow));
    if (it.group === 'hand') {
      if (it.hand !== A.a.hand) return 0;
      if (it.hand === 'rest') return matrix(A.Wr, A.t3, sub(it.at, A.j.wrist));
      // a hand from the kit points up in its own picture: turn it to follow the forearm
      const flip = it.side === 'L' ? 1 : -1;
      return matrix(A.Wr, A.t3 + 180, [-it.anchor[0] * flip, -it.anchor[1]], flip);
    }
    return 0;
  });
};

// ---- the poses of the sheet ----
const SHEET = [
  ['rest', pose({})],
  ['explain', pose({face: 'grin', head: -3, R: {shoulder: 28, elbow: 100, wrist: -10, hand: 'open'}})],
  ['point', pose({face: 'oh', head: 3, L: {shoulder: 35, elbow: 118, hand: 'point'}})],
  ['stop', pose({face: 'angry', head: 2, L: {shoulder: 22, elbow: 138, hand: 'palm'}})],
  ['ok', pose({face: 'smile', head: -4, L: {shoulder: 30, elbow: 125, hand: 'ok'}})],
  ['welcome', pose({face: 'grin', L: {shoulder: 22, elbow: 62, wrist: 8, hand: 'open'}, R: {shoulder: 22, elbow: 62, wrist: 8, hand: 'open'}})],
  ['chest', pose({face: 'calm', head: -3, R: {shoulder: 16, elbow: -128, hand: 'rest'}})],
  ['wave', pose({face: 'grin', head: 4, L: {shoulder: 58, elbow: 92, wrist: -8, hand: 'palm'}})],
];

// ---- the talking test: poses on a time line, eased, with a breathing body and a moving mouth ----
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mix = (a, b, t) => a + (b - a) * t;
const between = (a, b, t) => {
  const e = ease(t);
  const side = (s) => ({shoulder: mix(a[s].shoulder, b[s].shoulder, e), elbow: mix(a[s].elbow, b[s].elbow, e), wrist: mix(a[s].wrist, b[s].wrist, e), hand: t < 0.5 ? a[s].hand : b[s].hand});
  return {face: t < 0.5 ? a.face : b.face, head: mix(a.head, b.head, e), bob: 0, L: side('L'), R: side('R')};
};
const clipFrames = () => {
  const P = Object.fromEntries(SHEET);
  const keys = [[0, P.rest], [12, P.rest], [26, P.explain], [52, P.explain], [66, P.point], [92, P.point], [106, P.rest], [120, P.rest]];
  const mouth = ['calm', 'oh', 'grin', 'calm', 'smile', 'oh', 'calm', 'grin'];
  const out = [];
  for (let f = 0; f < 120; f++) {
    let k = 0;
    while (k < keys.length - 2 && f >= keys[k + 1][0]) k++;
    const [f0, a] = keys[k];
    const [f1, b] = keys[k + 1];
    const p = between(a, b, Math.min(1, Math.max(0, (f - f0) / (f1 - f0))));
    p.bob = Math.sin((f / FPS) * Math.PI * 2 * 0.45) * 0.7;
    p.head += Math.sin((f / FPS) * Math.PI * 2 * 0.8) * 1.2;
    if (f >= 14 && f < 104) p.face = mouth[Math.floor((f - 14) / 3) % mouth.length]; // she speaks
    out.push(p);
  }
  return out;
};

const run = (mode) => {
  buildPieces();
  const list = pieces();
  const poses = mode === 'clip' ? clipFrames() : SHEET.map((s) => s[1]);
  fs.rmSync(FRAMES, {recursive: true, force: true});
  fs.mkdirSync(FRAMES, {recursive: true});
  const job = {
    width: W, height: H, fps: FPS, out: uri(FRAMES) + '/', name: 'f',
    fla: uri(path.join(OUT, mode === 'clip' ? 'doctor-test.fla' : 'doctor-poses.fla')),
    pieces: list.map((it) => ({name: it.name, uri: uri(it.file)})),
    frames: poses.map((p) => place(list, p)),
  };
  fs.writeFileSync(path.join(here, 'an-rig.json'), JSON.stringify(job));
  const r = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(here, 'run-an.ps1'), path.join(here, 'an-rig.jsfl'), '-TimeoutSec', '900'], {encoding: 'utf8'});
  process.stdout.write(r.stdout || '');
  if (r.status !== 0) throw new Error('Animate did not finish the job');
  const seq = path.join(FRAMES, 'f%04d.png');
  if (mode === 'clip') {
    const mp4 = path.join(OUT, 'doctor-test.mp4');
    ffmpeg(['-f', 'lavfi', '-i', `color=c=0xfaf6ef:s=${W}x${H}:r=${FPS}`, '-framerate', String(FPS), '-start_number', '0', '-i', seq,
      '-filter_complex', '[0][1]overlay=shortest=1,format=yuv420p', '-c:v', 'libx264', '-crf', '16', mp4]);
    console.log('clip ' + mp4);
  } else {
    const png = path.join(OUT, 'doctor-poses.png');
    ffmpeg(['-f', 'lavfi', '-i', `color=c=0xfaf6ef:s=${W}x${H}`, '-start_number', '0', '-i', seq,
      '-filter_complex', `[0][1]overlay,scale=${W / 2}:${H / 2},tile=4x2`, '-frames:v', '1', png]);
    console.log('sheet ' + png);
  }
};

run(process.argv[2] === 'clip' ? 'clip' : 'sheet');
