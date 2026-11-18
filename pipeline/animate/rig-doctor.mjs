// The doctor the owner chose (Magnific stock vector #3908853, "Female doctor character model sheet
// with walk cycle animations and lip syncing"), rigged from the parts cut by ai-extract.jsx and built
// in Animate by an-rig.jsfl as a real rig: one graphic symbol per part with its origin on the joint,
// the hand, mouth and walk as symbols with several cels, and the layers parented like a skeleton.
//   node pipeline/animate/rig-doctor.mjs sheet   the poses, joined into one sheet (out/animate/doctor-poses.png)
//   node pipeline/animate/rig-doctor.mjs clip    a voiced test with gestures, blink, walk and camera
// The motion is worked out here: poses are joint angles, moves between poses ease with a small
// overshoot, the forearm and the hand arrive a little after the upper arm (follow-through), the body
// breathes and shifts its weight, the eyes blink and look, and the mouth follows the spoken words.
// Windows only (Animate and Illustrator are driven through their own scripting). The stock artwork is
// licensed and stays in stock/ (git-ignored).
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readWalk, between, stanceOf, standFrom} from './walk-rig.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const PARTS = path.join(root, 'stock', 'doctor-3908853', 'parts');
const OUT = path.join(root, 'out', 'animate');
const FRAMES = path.join(OUT, 'doctor-frames');

const W = 1080;
const H = 1920;
const FPS = 60;
const F = FPS / 30; // the timings below were first written for 30 frames a second
const K = 2; // stage pixels per artwork unit
const PX = 2; // the PNG parts are cut at 200%: two pixels per artwork unit
const AXIS = 4955; // the figure's centre line, in artwork units
const FEET = 1030;
const GROUND = 1760; // where her feet stand on the stage
const stage = (u) => [(u[0] - AXIS) * K + W / 2, (u[1] - FEET) * K + GROUND];

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
const HIP = [4955, 640]; // the upper body leans around this point
const NECK = [4955, 408];
const EYE = {L: [4969.5, 354.1], R: [4936.3, 354.1]}; // the middle of each eye
// the lip-sync heads of the sheet are drawn bigger than the figure: this brings their mouths to her size
const MOUTH_SCALE = 0.668;
const MOUTHS = {closed: 188, open: 189, wide: 184, soft: 185, teeth: 186, tongue: 187};
// the gesture hands of the sheet. "wrist" is the point of the hand's picture (in artwork units from its
// top-left corner) that sits on the wrist, "points" is the way its fingers point in the picture
// (0 = up, 90 = to the right, 180 = down, 270 = to the left), "side" the arm it is drawn for.
const HAND_SCALE = 0.62;
const HANDS = {
  point: {part: 'hand-16', wrist: [37, 110], points: 0, side: 'L'},
  palm: {part: 'hand-35', wrist: [26, 92], points: 352, side: 'L'},
  open: {part: 'hand-13', wrist: [30, 111], points: 5, side: 'L'},
  offer: {part: 'hand-34', wrist: [97, 51], points: 285, side: 'R'},
  fist: {part: 'hand-27', wrist: [75, 35], points: 270, side: 'R'},
};

// ---- the closed eye: the artwork has no closed eyelid, so one is made here in her own colours: a lid in
// her skin colour with her eye-shadow on it and a lash line along the bottom ----
const pixel = (file, x, y) => {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-vf', `format=rgba,crop=1:1:${x}:${y}`, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], {maxBuffer: 1 << 20});
  return [r.stdout[0], r.stdout[1], r.stdout[2]];
};
const CLOSED = {w: 32, h: 20}; // artwork units, the eye's middle in the middle
const closedEye = () => {
  const file = path.join(PARTS, 'eye-closed.png');
  const face = need('front-245');
  const lidPart = need('front-235');
  const skin = pixel(path.join(PARTS, 'front-245.png'), Math.round(face.w * PX * 0.5), Math.round(face.h * PX * 0.42));
  const shade = pixel(path.join(PARTS, 'front-235.png'), Math.round(lidPart.w * PX * 0.5), 5);
  const lash = [62, 26, 20];
  const u = '((X-128)/8)';
  const v = '((Y-80)/8)';
  const line = `(1+3.4*(1-pow(${u}/13,2)))`; // the lash line, bowing down
  const isLash = `lt(abs(${v}-${line}),0.8)*lt(abs(${u}),13.2)`;
  const isShade = `lt(pow(${u}/11.5,2)+pow((${v}+0.2)/4.6,2),1)*lt(${v},${line})`;
  const lid = `lt(pow(${u}/14.6,2)+pow((${v}+1.8)/8.4,2),1)`;
  const ch = (i) => `if(${isLash},${lash[i]},if(${isShade},${Math.round(skin[i] * 0.45 + shade[i] * 0.55)},${skin[i]}))`;
  ffmpeg(['-f', 'lavfi', '-i', 'color=c=black@0:s=256x160,format=rgba', '-vf', `geq=r='${ch(0)}':g='${ch(1)}':b='${ch(2)}':a='255*gt(${lid}+${isLash},0)',scale=${CLOSED.w * PX}:${CLOSED.h * PX}:flags=lanczos`, '-frames:v', '1', file]);
  return file;
};

// ---- geometry ----
const rot = (v, deg) => {
  const t = (deg * Math.PI) / 180;
  return [v[0] * Math.cos(t) - v[1] * Math.sin(t), v[0] * Math.sin(t) + v[1] * Math.cos(t)];
};
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const r4 = (v) => Math.round(v * 1e4) / 1e4;
// an instance: its origin at "at" (stage pixels), turned by deg, stretched by sx, sy, showing cel
const inst = (at, deg = 0, cel = 0, sx = 1, sy = 1) => {
  const t = (deg * Math.PI) / 180;
  return [r4(Math.cos(t) * sx), r4(Math.sin(t) * sx), r4(-Math.sin(t) * sy), r4(Math.cos(t) * sy), r4(at[0]), r4(at[1]), cel];
};
// a cel: a part's picture inside its symbol, placed so that the symbol's origin is "origin" (artwork units)
const cel = (name, origin, size = 1, at = null, flip = 1) => {
  const p = need(name);
  const s = (size * K) / PX;
  const corner = at || sub([p.x, p.y], origin);
  return {uri: uri(path.join(PARTS, name + '.png')), m: [r4(s * flip), 0, 0, r4(s), r4(corner[0] * K), r4(corner[1] * K)]};
};

// ---- the pieces, back to front. kind says how a piece is placed, origin is its joint. ----
const pieces = () => {
  const list = [];
  // a piece is one symbol; when it is made of several pictures (a sleeve over an arm, a hand and its
  // nails) each picture gets its own symbol and layer, all placed the same way
  const many = (prefix, kind, origin, ids, more = {}) => ids.forEach((id) => list.push({name: `${prefix}-${id}`, kind, origin, cels: [cel('front-' + id, origin)], ...more}));
  // the side walk, as a skeleton: every bone is a symbol with one cel per drawing, its origin on its joint
  const bones = (name, pick, joint) => list.push({name, kind: 'wbone', pick, cels: WALKS.map((P) => { const b = pick(P); return cel(b.name, joint(b)); })});
  bones('w-farArm', (P) => P.farArm, (b) => b.top);
  for (const leg of ['far', 'near']) {
    bones(`w-${leg}Shoe`, (P) => P[leg].shoe, (b) => b.centre);
    bones(`w-${leg}Shin`, (P) => P[leg].shin, (b) => b.top);
    bones(`w-${leg}Thigh`, (P) => P[leg].thigh, (b) => b.top);
  }
  list.push({name: 'w-body', kind: 'wbody', cels: [cel(`w${WALK[0]}-1`, WALKS[0].body)]});
  bones('w-nearArm', (P) => P.nearArm, (b) => b.top);
  many('leg', 'legs', HIP, [248, 229]);
  many('hairback', 'head', NECK, [247], {parent: 'body-246'});
  many('body', 'body', HIP, [246, 228]);
  for (const side of ['R', 'L']) many('upper' + side, 'upper', JOINT[side].shoulder, JOINT[side].upper, {side, parent: 'body-246'});
  many('body', 'body', HIP, [227, 226, 225, 219, 218, 217]);
  many('face', 'head', NECK, [245, 244, 243, 242], {parent: 'body-246'});
  for (const [side, white, iris, lid, brow] of [['R', 237, 236, 235, 234], ['L', 241, 240, 239, 238]]) {
    many('eye' + side, 'eye', EYE[side], [white], {side, parent: 'face-245'});
    many('iris' + side, 'iris', EYE[side], [iris], {side, parent: 'face-245'});
    many('lid' + side, 'lid', EYE[side], [lid], {side, parent: 'face-245'});
    list.push({name: 'closed' + side, kind: 'closed', origin: EYE[side], side, parent: 'face-245', cels: [{uri: uri(closedEye()), m: [K / PX, 0, 0, K / PX, (-CLOSED.w / 2) * K, (-CLOSED.h / 2) * K]}]});
    many('brow' + side, 'brow', EYE[side], [brow], {side, parent: 'face-245'});
  }
  // the mouth: one symbol, a cel for each shape, each set where the figure's own lips are
  const lips = need('front-233');
  const lipMid = [lips.x + lips.w / 2, lips.y + lips.h / 2];
  list.push({
    name: 'mouth', kind: 'mouth', origin: lipMid, parent: 'face-245',
    cels: Object.values(MOUTHS).map((id) => {
      const m = need('mouth-' + id);
      // every mouth hangs from the same upper lip line, centred
      return cel('mouth-' + id, lipMid, MOUTH_SCALE, [(-m.w / 2) * MOUTH_SCALE, (-lips.h / 2 - 1) * 1]);
    }),
  });
  many('hair', 'head', NECK, [231, 230], {parent: 'face-245'});
  for (const side of ['R', 'L']) {
    const j = JOINT[side];
    many('fore' + side, 'fore', j.elbow, j.fore, {side, parent: `upper${side}-${j.upper[j.upper.length - 1]}`});
    many('hand' + side, 'hand', j.wrist, j.hand, {side, parent: `fore${side}-${j.fore[j.fore.length - 1]}`});
    // the gesture hands: one symbol, a cel for each shape, the wrist of each on the symbol's origin
    list.push({
      name: 'gesture' + side, kind: 'gesture', origin: j.wrist, side, parent: `fore${side}-${j.fore[j.fore.length - 1]}`,
      cels: Object.values(HANDS).map((h) => {
        const flip = h.side === side ? 1 : -1;
        return cel(h.part, [0, 0], HAND_SCALE, [-h.wrist[0] * HAND_SCALE * flip, -h.wrist[1] * HAND_SCALE], flip);
      }),
    });
  }
  // the standing three-quarter view and side view of the sheet, on top: the drawn angles she turns through.
  // Each fades out over the next angle, which is already complete underneath it.
  const q = need('view-q');
  list.push({name: 'view-q', kind: 'viewQ', cels: [cel('view-q', [Q_HEAD, q.y + q.h - 3])]});
  const sb = need('sidebody');
  list.push({name: 'view-side', kind: 'viewSide', cels: [cel('view-side', [sb.x, sb.y])]});
  return list;
};
const WALK = [104, 103, 102, 101, 100, 99, 98, 97]; // the eight steps of the side walk, in order
const FEET_WALK = 1899; // the ground line of the walk row on the sheet
const WALKS = readWalk(parts, PARTS, WALK, PX); // the skeleton of each drawing
const STEP_FRAMES = 8; // frames from one drawing to the next (a full cycle of eight is a little over a second)
const WALK_STEPS = 6; // drawings she walks through before she stops
const STOP_FRAMES = 16; // frames to bring her feet together
const HEAD_MID = 83.7; // where the middle of her head is, from the left edge of the walk's body picture
const Q_HEAD = 4641; // the middle of the head of the three-quarter view, on the sheet
// the walk, frame by frame: where the body is and how every bone lies. The foot that carries her is
// held on its spot on the ground and the body is moved over it, so nothing slides.
const walkFrames = () => {
  const flatAt = WALKS[2].near; // a drawing with this shoe flat on the ground
  const flat = {angle: flatAt.shoe.angle, offset: sub(flatAt.shoe.centre, flatAt.shin.end), y: flatAt.shoe.centre[1]};
  const out = [];
  let body = [0, 0]; // the body's corner, in sheet units; x is counted from where she starts
  let drift = 0;
  const go = (A, B, frames, stance, groundB, easeOut) => {
    const groundA = A[stance].shoe.centre[1];
    const lock = body[0] + between(A, B, 0)[stance].shoeAt[0];
    for (let k = 0; k < frames; k++) {
      let u = (k + 1) / frames;
      if (easeOut) u = 1 - (1 - u) * (1 - u);
      const lim = between(A, B, u);
      const shoe = lim[stance].shoeAt;
      body = [lock - shoe[0], groundA + (groundB - groundA) * u - shoe[1]];
      drift = Math.max(drift, Math.abs(body[0] + shoe[0] - lock));
      out.push({body, lim, art: WALK.indexOf(lim.art)});
    }
  };
  for (let s = 0; s < WALK_STEPS; s++) {
    const A = WALKS[s % 8];
    const B = WALKS[(s + 1) % 8];
    const stance = stanceOf(A, B);
    go(A, B, STEP_FRAMES, stance, B[stance].shoe.centre[1], false);
  }
  const last = WALKS[WALK_STEPS % 8];
  const stance = last.near.shoe.bottom >= last.far.shoe.bottom ? 'near' : 'far';
  // she stops at the height of the sheet's standing side view, which takes over from the walk
  const side = need('view-side');
  const standBody = FEET_WALK - (side.y + side.h - 2 - need('sidebody').y); // the body's corner when she stands
  const ankleY = flat.y - flat.offset[1] - standBody;
  go(last, standFrom(last, flat, ankleY), STOP_FRAMES, stance, flat.y, true);
  // she ends with the middle of her head on the middle of the stage, where every angle of the turn keeps it
  const end = out[out.length - 1].body[0];
  for (const o of out) o.at = [W / 2 + (o.body[0] - end - HEAD_MID) * K, GROUND + (o.body[1] - FEET_WALK) * K];
  return {frames: out, drift: drift * K};
};

// ---- a pose: joint angles in degrees. shoulder > 0 lifts the arm away from the body, elbow > 0
// bends the forearm the same way (up and out), elbow < 0 folds it across the body. hand names a
// gesture hand ('rest' = her own relaxed hand). ----
const ARM = {shoulder: 0, elbow: 0, wrist: 0, hand: 'rest'};
const REST = {head: 0, lean: 0, sway: 0, bob: 0, mouth: 'closed', blink: 0, look: 0, brow: 0, x: 0, wk: null, side: 0, q: 0, front: true, L: ARM, R: ARM};
const pose = (p) => ({...REST, ...p, L: {...ARM, ...(p.L || {})}, R: {...ARM, ...(p.R || {})}});
const mouthCel = Object.fromEntries(Object.keys(MOUTHS).map((k, i) => [k, i]));
const handCel = Object.fromEntries(Object.keys(HANDS).map((k, i) => [k, i]));

const place = (list, p) => {
  const shift = [p.x * K, 0];
  const faded = (m, alpha) => (alpha >= 1 ? m : [...m, Math.round(alpha * 100)]);
  // the upper body: leans around the hip, sways sideways, breathes up and down
  const hip = add(add(stage(HIP), shift), [p.sway * K, p.bob * K]);
  const up = (u) => add(hip, rot(mul(sub(u, HIP), K), p.lean));
  const neck = up(NECK);
  const headTurn = p.lean + p.head;
  const onHead = (u) => add(neck, rot(mul(sub(u, NECK), K), headTurn));
  const arm = {};
  for (const side of ['L', 'R']) {
    const j = JOINT[side];
    const a = p[side];
    const t1 = p.lean + j.out * a.shoulder;
    const t2 = t1 + j.out * a.elbow;
    const t3 = t2 + j.out * a.wrist;
    const S = up(j.shoulder);
    const E = add(S, rot(mul(sub(j.elbow, j.shoulder), K), t1));
    const Wr = add(E, rot(mul(sub(j.wrist, j.elbow), K), t2));
    arm[side] = {t1, t2, t3, S, E, Wr, a, j};
  }
  const shut = p.blink > 0.9; // fully closed: the closed lid is shown in place of the eye
  const open = 1 - 0.6 * p.blink; // on the way there the whole eye narrows
  return list.map((it) => {
    // the walk skeleton, the side view and the three-quarter view
    if (it.kind === 'wbody') return p.wk ? inst(p.wk.at) : 0;
    if (it.kind === 'wbone') {
      if (!p.wk) return 0;
      const b = it.pick(p.wk.lim); // {at: from the body's corner, turn}
      return inst(add(p.wk.at, mul(b.at, K)), b.turn, p.wk.art);
    }
    if (it.kind === 'viewSide') return p.side > 0 ? faded(inst(p.sideAt), p.side) : 0;
    if (it.kind === 'viewQ') return p.q > 0 ? faded(inst(add([W / 2, GROUND], shift)), p.q) : 0;
    if (!p.front) return 0;
    const A = it.side ? arm[it.side] : null;
    switch (it.kind) {
      case 'legs': return inst(add(stage(HIP), shift));
      case 'body': return inst(hip, p.lean);
      case 'head': return inst(neck, headTurn);
      case 'eye': return shut ? 0 : inst(onHead(EYE[it.side]), headTurn, 0, 1, open);
      case 'iris': return shut ? 0 : inst(onHead(add(EYE[it.side], [p.look * 2.2, 0])), headTurn, 0, 1, open);
      case 'lid': return shut ? 0 : inst(onHead(EYE[it.side]), headTurn, 0, 1, open);
      case 'closed': return shut ? inst(onHead(EYE[it.side]), headTurn) : 0;
      case 'brow': return inst(onHead(add(EYE[it.side], [0, -p.brow * 3])), headTurn + (it.side === 'L' ? 1 : -1) * p.brow * -4);
      case 'mouth': return inst(onHead(it.origin), headTurn, mouthCel[p.mouth] ?? 0);
      case 'upper': return inst(A.S, A.t1);
      case 'fore': return inst(A.E, A.t2);
      case 'hand': return A.a.hand === 'rest' ? inst(A.Wr, A.t3) : 0;
      case 'gesture': {
        if (A.a.hand === 'rest') return 0;
        const h = HANDS[A.a.hand];
        // the forearm points from elbow to wrist; turn the hand so that its fingers carry on that way
        const d = sub(A.Wr, A.E);
        const fore = (Math.atan2(d[0], -d[1]) * 180) / Math.PI; // 0 = up, 90 = right
        const points = h.side === it.side ? h.points : 360 - h.points;
        return inst(A.Wr, fore - points + A.j.out * A.a.wrist, handCel[A.a.hand]);
      }
      default: return 0;
    }
  });
};

// ---- the poses ----
const P = {
  rest: pose({}),
  explain: pose({head: -3, lean: -1, brow: 0.4, R: {shoulder: 16, elbow: 96, hand: 'offer'}}),
  point: pose({head: 3, lean: 1, brow: 0.8, L: {shoulder: 24, elbow: 128, hand: 'point'}}),
  stop: pose({head: 0, brow: -0.8, L: {shoulder: 20, elbow: 134, hand: 'palm'}}),
  both: pose({brow: 0.5, L: {shoulder: 2, elbow: 86, hand: 'offer'}, R: {shoulder: 2, elbow: 86, hand: 'offer'}}),
  chest: pose({head: -3, brow: 0.2, R: {shoulder: 8, elbow: -118}}),
  wave: pose({head: 4, lean: 1.5, brow: 0.7, mouth: 'wide', L: {shoulder: 42, elbow: 112, hand: 'palm'}}),
  fist: pose({head: -2, brow: -0.4, R: {shoulder: 14, elbow: 122, hand: 'fist'}}),
};
const SHEET = [
  ['rest', P.rest], ['explain', {...P.explain, mouth: 'soft'}], ['point', {...P.point, mouth: 'open'}], ['stop', {...P.stop, mouth: 'teeth'}],
  ['both', {...P.both, mouth: 'wide'}], ['chest', {...P.chest, mouth: 'soft'}], ['wave', P.wave], ['blink', {...P.fist, blink: 1, mouth: 'tongue'}],
];

// ---- motion ----
// from one pose to the next: fast out, a small overshoot, then settle
const overshoot = (t) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  const c = 1.35;
  return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2);
};
const mix = (a, b, t) => a + (b - a) * t;
// the value of one track at a frame, from pose keys [[frame, pose], ...]; get picks the number
const track = (keys, f, get, lag = 0) => {
  const g = f - lag;
  let k = 0;
  while (k < keys.length - 2 && g >= keys[k + 1][0]) k++;
  const [f0, a] = keys[k];
  const [f1, b] = keys[k + 1];
  // a move takes at most 14 frames, then the pose holds until the next key
  const span = Math.min(14 * F, f1 - f0);
  return mix(get(a), get(b), overshoot((g - (f1 - span)) / span));
};
const heldHand = (keys, f, side) => {
  let k = 0;
  while (k < keys.length - 1 && f >= keys[k + 1][0] - 7 * F) k++; // the hand changes shape half-way through the move
  return keys[k][1][side].hand;
};
// which mouth for a letter
const VISEME = {a: 'wide', e: 'soft', i: 'soft', o: 'open', u: 'open', w: 'open', m: 'closed', b: 'closed', p: 'closed', l: 'tongue', t: 'tongue', d: 'tongue', n: 'tongue'};
const mouthAt = (words, t) => {
  for (const w of words) {
    if (t < w.start || t > w.end) continue;
    const letters = w.w.toLowerCase().replace(/[^a-z]/g, '');
    if (!letters) return 'closed';
    const c = letters[Math.min(letters.length - 1, Math.floor(((t - w.start) / (w.end - w.start)) * letters.length))];
    return VISEME[c] || 'teeth';
  }
  return 'closed';
};
// blinks at fixed, uneven moments (so every render is the same): a blink lasts a fifth of a second
const BLINKS = [3.4, 5.1, 7.9, 8.8, 11.3, 13.7, 15.7]; // seconds
const BLINK = [0, 0.5, 1, 1, 1, 0.7, 0.3, 0];
const blinkAt = (f) => {
  for (const b of BLINKS) {
    const d = (f - b * FPS) / F + 1; // where in the blink, counted in thirtieths of a second
    if (d < 0 || d >= BLINK.length - 1) continue;
    const i = Math.floor(d);
    const v = BLINK[i] + (BLINK[i + 1] - BLINK[i]) * (d - i);
    return v > 0.85 ? 1 : v;
  }
  return 0;
};

const smooth = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
// how the clip opens, in frames: she walks in, stops, and turns to face us through the drawn angles
const OPEN = {sideIn: 8, sideHold: 5, toQ: 12, qHold: 6, toFront: 12};
const clipFrames = (words, tail) => {
  const walk = walkFrames();
  const n = walk.frames.length;
  const t1 = n + OPEN.sideIn; // the side view is fully there
  const t2 = t1 + OPEN.sideHold; // it starts to give way to the three-quarter view
  const t3 = t2 + OPEN.toQ;
  const t4 = t3 + OPEN.qHold; // the three-quarter view starts to give way to the front
  const walkIn = t4 + OPEN.toFront; // she faces us
  const say = walkIn + 6 * F; // and starts to speak
  const lineEnd = words[words.length - 1].end;
  const total = say + Math.round((lineEnd + tail) * FPS);
  const T = (s) => say + Math.round(s * FPS);
  const at = (word) => (words.find((w) => w.w.toLowerCase().startsWith(word)) || {start: 0}).start;
  const keys = [
    [0, P.rest], [say - 2 * F, P.rest], [T(at('your')) + 6 * F, P.explain], [T(at('washing')) - 4 * F, P.explain],
    [T(at('washing')) + 8 * F, P.point], [T(at('then')) + 2 * F, P.point], [T(at('then')) + 14 * F, P.both], [T(at('today')) - 2 * F, P.both],
    [T(at('today')) + 10 * F, P.stop], [total - 26 * F, P.stop], [total - 12 * F, P.rest], [total + 30 * F, P.rest],
  ];
  const sideAt = walk.frames[n - 1].at; // the side view stands exactly where the walk's body stopped
  const frames = [];
  const camera = [];
  for (let f = 0; f < total; f++) {
    let p;
    if (f < t2) {
      // the walk, then the drawn side view fading in over its last pose
      p = pose({front: false, wk: f < t1 ? walk.frames[Math.min(f, n - 1)] : null, side: f < n ? 0 : smooth((f - n + 1) / OPEN.sideIn), sideAt});
    } else if (f < t4) {
      // the three-quarter view is complete underneath while the side view fades off it
      p = pose({front: false, side: 1 - smooth((f - t2 + 1) / OPEN.toQ), sideAt, q: 1});
    } else {
      const sec = f / FPS;
      const arm = (side) => ({
        shoulder: track(keys, f, (q) => q[side].shoulder),
        elbow: track(keys, f, (q) => q[side].elbow, 2 * F), // the forearm follows the upper arm
        wrist: track(keys, f, (q) => q[side].wrist, 4 * F) + (track(keys, f, (q) => q[side].elbow, 2 * F) - track(keys, f, (q) => q[side].elbow, 5 * F)) * 0.25, // the hand drags behind, then settles
        hand: heldHand(keys, f, side),
      });
      const t = (f - say) / FPS;
      const talking = mouthAt(words, t);
      p = pose({
        q: f < walkIn ? 1 - smooth((f - t4 + 1) / OPEN.toFront) : 0, // the front view is complete underneath while the three-quarter view fades off it
        head: track(keys, f, (q) => q.head, F) + Math.sin(sec * 5.1) * 0.9 + (talking !== 'closed' ? Math.sin(sec * 11) * 0.7 : 0),
        lean: track(keys, f, (q) => q.lean) + Math.sin(sec * 1.3) * 0.5,
        sway: Math.sin(sec * 1.3 + 1) * 1.4,
        bob: Math.sin(sec * 2.6) * 1.1,
        brow: track(keys, f, (q) => q.brow, F),
        mouth: talking,
        blink: blinkAt(f),
        look: Math.abs(((f + 40 * F) % (170 * F)) - 85 * F) < 12 * F ? -1 : 0, // now and then she glances aside
        L: arm('L'),
        R: arm('R'),
      });
    }
    frames.push(p);
    // the camera: wide while she walks in, then a slow push-in on her, a little closer on "today"
    const push = f < walkIn ? 0 : Math.min(1, (f - walkIn) / (50 * F));
    const e = push * push * (3 - 2 * push);
    const late = Math.max(0, Math.min(1, (f - T(at('today'))) / (20 * F)));
    camera.push(1 + e * 0.22 + late * 0.1); // how far the view is pushed in
  }
  return {frames, camera, say, drift: walk.drift, walkFrames: n, faceUs: walkIn};
};

const run = (mode) => {
  const list = pieces();
  let poses;
  let camera = null;
  let sound = null;
  let say = 0;
  if (mode === 'clip') {
    const line = JSON.parse(fs.readFileSync(path.join(root, 'videos', 'rabies', 'toon-timings.json'), 'utf8')).lines.D1;
    sound = path.join(root, 'public', line.file);
    const made = clipFrames(line.words, 1.4);
    console.log(`walk ${made.walkFrames} frames, the carrying foot drifts ${made.drift.toFixed(3)} px at most; she faces us at frame ${made.faceUs}; ${made.frames.length} frames in all at ${FPS} fps`);
    poses = made.frames;
    camera = made.camera;
    say = made.say;
  } else poses = SHEET.map((s) => pose(s[1]));
  fs.rmSync(FRAMES, {recursive: true, force: true});
  fs.mkdirSync(FRAMES, {recursive: true});
  const job = {
    width: W, height: H, fps: FPS, out: uri(FRAMES) + '/', name: 'f',
    fla: uri(path.join(OUT, mode === 'clip' ? 'doctor-test.fla' : 'doctor-poses.fla')),
    pieces: list.map((it) => ({name: it.name, parent: it.parent || null, cels: it.cels})),
    frames: poses.map((p) => place(list, p)),
  };
  // the camera: Animate's own camera refused the script call here ("setPosition: Argument number 1 is
  // invalid"), so the push-in is done by scaling the whole rig around a point between face and chest
  if (camera) {
    const cx = W / 2;
    const cy = 760;
    job.frames = job.frames.map((row, f) => row.map((m) => (m ? [r4(m[0] * camera[f]), r4(m[1] * camera[f]), r4(m[2] * camera[f]), r4(m[3] * camera[f]), r4(cx + (m[4] - cx) * camera[f]), r4(cy + (m[5] - cy) * camera[f]), ...m.slice(6)] : 0)));
  }
  if (sound && fs.existsSync(sound)) job.sound = uri(sound);
  fs.writeFileSync(path.join(here, 'an-rig.json'), JSON.stringify(job));
  if (process.env.RIG_DRY) return; // work the motion out, do not start Animate
  const r = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(here, 'run-an.ps1'), path.join(here, 'an-rig.jsfl'), '-TimeoutSec', '3300'], {encoding: 'utf8'});
  process.stdout.write(r.stdout || '');
  if (r.status !== 0) throw new Error('Animate did not finish the job');
  const seq = path.join(FRAMES, 'f%04d.png');
  if (mode === 'clip') {
    const mp4 = path.join(OUT, 'doctor-test.mp4');
    const audio = sound && fs.existsSync(sound) ? ['-itsoffset', String(say / FPS), '-i', sound] : [];
    ffmpeg(['-f', 'lavfi', '-i', `color=c=0xfaf6ef:s=${W}x${H}:r=${FPS}`, '-framerate', String(FPS), '-start_number', '0', '-i', seq, ...audio,
      '-filter_complex', '[0][1]overlay=shortest=1,format=yuv420p[v]', '-map', '[v]', ...(audio.length ? ['-map', '2:a', '-c:a', 'aac'] : []), '-c:v', 'libx264', '-crf', '16', mp4]);
    console.log('clip ' + mp4);
  } else {
    const png = path.join(OUT, 'doctor-poses.png');
    ffmpeg(['-f', 'lavfi', '-i', `color=c=0xfaf6ef:s=${W}x${H}`, '-start_number', '0', '-i', seq,
      '-filter_complex', `[0][1]overlay,scale=${W / 2}:${H / 2},tile=4x2`, '-frames:v', '1', png]);
    console.log('sheet ' + png);
  }
};

run(process.argv[2] === 'clip' ? 'clip' : 'sheet');
