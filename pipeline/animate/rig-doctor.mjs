// The doctor the owner chose (Magnific stock vector #3908853, "Female doctor character model sheet
// with walk cycle animations and lip syncing"), rigged from the parts cut by ai-extract.jsx and drawn
// by Animate (an-rig.jsfl).
//   node pipeline/animate/rig-doctor.mjs sheet   the poses, joined into one sheet (out/animate/doctor-poses.png)
//   node pipeline/animate/rig-doctor.mjs clip    a 4 s talking test (out/animate/doctor-test.mp4)
// The artwork already has an upper arm, a forearm and a hand for each arm, and seven lip-sync heads.
// Every pose is worked out here from joint angles (shoulder, elbow, wrist, head) into one matrix per
// piece; Animate places the pieces on layers, one keyframe per frame, and exports transparent frames.
// Windows only (Animate and Illustrator are driven through their own scripting). The stock artwork is
// licensed and stays in stock/ (git-ignored).
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const PARTS = path.join(root, 'stock', 'doctor-3908853', 'parts');
const OUT = path.join(root, 'out', 'animate');
const FRAMES = path.join(OUT, 'doctor-frames');

const W = 1080;
const H = 1920;
const FPS = 30;
const K = 2; // stage pixels per artwork unit
const PX = 2; // the PNG parts are cut at 200%: two pixels per artwork unit
const AXIS = 4955; // the figure's centre line, in artwork units
const FEET = 1030;
const stage = (u) => [(u[0] - AXIS) * K + W / 2, (u[1] - FEET) * K + 1760];

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
const L_JOINT = {shoulder: [5008, 458], elbow: [5043, 573], wrist: [5044, 664]};
const JOINT = {
  L: {...L_JOINT, out: -1, upper: [252, 250], fore: [251, 249], hand: [224, 223, 222, 221, 220]},
  R: {shoulder: mirror(L_JOINT.shoulder), elbow: mirror(L_JOINT.elbow), wrist: mirror(L_JOINT.wrist), out: 1, upper: [259], fore: [260, 258], hand: [257, 256, 255, 254, 253]},
};
const NECK = [4955, 408];
// the lip-sync heads are drawn bigger than the figure: this brings them to her size, and HEAD_AT is
// where the top-left corner of a head sits on the figure
const HEAD_SCALE = 0.66;
const HEAD_AT = [4892, 277];
const HEADS = {a: 'head-189', b: 'head-188', c: 'head-187', d: 'head-186', e: 'head-185', f: 'head-184', g: 'head-183'};

// ---- placing ----
const rot = (v, deg) => {
  const t = (deg * Math.PI) / 180;
  return [v[0] * Math.cos(t) - v[1] * Math.sin(t), v[0] * Math.sin(t) + v[1] * Math.cos(t)];
};
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
// the matrix of a bitmap whose top-left corner sits at "corner" (artwork units, measured from the
// pivot) when the pivot is at "pivot" (stage pixels) and the piece is turned by "deg"
const matrix = (pivot, deg, corner, size = 1) => {
  const t = (deg * Math.PI) / 180;
  const s = (size * K) / PX;
  const c = Math.cos(t) * s;
  const n = Math.sin(t) * s;
  const o = add(pivot, rot([corner[0] * K, corner[1] * K], deg));
  const r4 = (v) => Math.round(v * 1e4) / 1e4;
  return [r4(c), r4(n), r4(-n), r4(c), r4(o[0]), r4(o[1])];
};
const piece = (id, group, more = {}) => {
  const p = need('front-' + id);
  return {name: group + '-' + id, file: path.join(PARTS, `front-${id}.png`), group, at: [p.x, p.y], ...more};
};
// the pieces, back to front
const pieces = () => {
  const list = [piece(248, 'legs'), piece(229, 'legs'), piece(246, 'body'), piece(228, 'body')];
  for (const side of ['R', 'L']) for (const id of JOINT[side].upper) list.push(piece(id, 'upper', {side}));
  for (const id of [227, 226, 225, 219, 218, 217]) list.push(piece(id, 'body'));
  for (const [key, name] of Object.entries(HEADS)) {
    need(name);
    list.push({name: 'head-' + key, file: path.join(PARTS, name + '.png'), group: 'head', head: key});
  }
  for (const side of ['R', 'L']) {
    for (const id of JOINT[side].fore) list.push(piece(id, 'fore', {side}));
    for (const id of JOINT[side].hand) list.push(piece(id, 'hand', {side}));
  }
  return list;
};

// ---- a pose: joint angles in degrees. shoulder > 0 lifts the arm away from the body, elbow > 0
// bends the forearm the same way (up and out), elbow < 0 folds it across the body. ----
const REST = {head: 0, face: 'b', bob: 0, L: {shoulder: 0, elbow: 0, wrist: 0}, R: {shoulder: 0, elbow: 0, wrist: 0}};
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
    arm[side] = {t1, t2, t3, S, E, Wr, j};
  }
  return list.map((it) => {
    if (it.group === 'legs') return matrix(stage(it.at), 0, [0, 0]);
    if (it.group === 'body') return matrix(stage(add(it.at, lift)), 0, [0, 0]);
    if (it.group === 'head') return it.head === p.face ? matrix(neck, p.head, sub(HEAD_AT, NECK), HEAD_SCALE) : 0;
    const A = arm[it.side];
    if (it.group === 'upper') return matrix(A.S, A.t1, sub(it.at, A.j.shoulder));
    if (it.group === 'fore') return matrix(A.E, A.t2, sub(it.at, A.j.elbow));
    if (it.group === 'hand') return matrix(A.Wr, A.t3, sub(it.at, A.j.wrist));
    return 0;
  });
};

// ---- the poses of the sheet ----
const SHEET = [
  ['rest', pose({})],
  ['explain', pose({face: 'e', head: -3, R: {shoulder: 18, elbow: 95, wrist: -10}})],
  ['point', pose({face: 'a', head: 3, L: {shoulder: 25, elbow: 120}})],
  ['both', pose({face: 'd', L: {shoulder: 4, elbow: 48, wrist: 6}, R: {shoulder: 4, elbow: 48, wrist: 6}})],
  ['chest', pose({face: 'g', head: -3, R: {shoulder: 10, elbow: -120}})],
  ['wave', pose({face: 'd', head: 4, L: {shoulder: 50, elbow: 95, wrist: -8}})],
  ['faces', pose({face: 'c'})],
  ['faces2', pose({face: 'f'})],
];

// ---- the talking test: poses on a time line, eased, with a breathing body and a moving mouth ----
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const mix = (a, b, t) => a + (b - a) * t;
const between = (a, b, t) => {
  const e = ease(t);
  const side = (s) => ({shoulder: mix(a[s].shoulder, b[s].shoulder, e), elbow: mix(a[s].elbow, b[s].elbow, e), wrist: mix(a[s].wrist, b[s].wrist, e)});
  return {face: t < 0.5 ? a.face : b.face, head: mix(a.head, b.head, e), bob: 0, L: side('L'), R: side('R')};
};
const clipFrames = () => {
  const P = Object.fromEntries(SHEET);
  const keys = [[0, P.rest], [12, P.rest], [26, P.explain], [52, P.explain], [66, P.point], [92, P.point], [106, P.rest], [120, P.rest]];
  const mouth = ['b', 'c', 'e', 'a', 'f', 'd', 'c', 'b'];
  const out = [];
  for (let f = 0; f < 120; f++) {
    let k = 0;
    while (k < keys.length - 2 && f >= keys[k + 1][0]) k++;
    const [f0, a] = keys[k];
    const [f1, b] = keys[k + 1];
    const p = between(a, b, Math.min(1, Math.max(0, (f - f0) / (f1 - f0))));
    p.bob = Math.sin((f / FPS) * Math.PI * 2 * 0.45) * 1.2;
    p.head += Math.sin((f / FPS) * Math.PI * 2 * 0.8) * 1.2;
    p.face = f >= 14 && f < 104 ? mouth[Math.floor((f - 14) / 3) % mouth.length] : 'b'; // she speaks
    out.push(p);
  }
  return out;
};

const run = (mode) => {
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
