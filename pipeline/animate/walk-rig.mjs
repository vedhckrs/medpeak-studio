// Reads the eight drawings of a side walk cycle as a skeleton. Each drawing is built from separate
// pieces (near arm, body, three pieces per leg, far arm); the long axis of every piece is measured from
// its picture, which gives the hip, knee and ankle of each pose and the angle of each bone. With that
// the walk can be drawn at any moment between two drawings, and the foot on the ground can be held
// still while the body travels over it.
import {spawnSync} from 'node:child_process';
import path from 'node:path';

// the shape of a picture: centre, long axis and the two ends of that axis, in pixels
const shape = (file) => {
  const size = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', file], {encoding: 'utf8'}).stdout.trim().split(',').map(Number);
  const [W, h] = size;
  const r = spawnSync('ffmpeg', ['-v', 'error', '-i', file, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], {maxBuffer: 1 << 28});
  const b = r.stdout;
  if (b.length !== W * h * 4) throw new Error('cannot read ' + file);
  let n = 0, sx = 0, sy = 0, bottom = 0;
  const pts = [];
  for (let y = 0; y < h; y += 2) for (let x = 0; x < W; x += 2) if (b[(y * W + x) * 4 + 3] > 128) { n++; sx += x; sy += y; pts.push(x, y); if (y > bottom) bottom = y; }
  const cx = sx / n, cy = sy / n;
  let xx = 0, xy = 0, yy = 0;
  for (let i = 0; i < pts.length; i += 2) { const dx = pts[i] - cx, dy = pts[i + 1] - cy; xx += dx * dx; xy += dx * dy; yy += dy * dy; }
  const t = 0.5 * Math.atan2(2 * xy, xx - yy); // the long axis
  const d = [Math.cos(t), Math.sin(t)];
  let lo = 0, hi = 0;
  for (let i = 0; i < pts.length; i += 2) { const p = (pts[i] - cx) * d[0] + (pts[i + 1] - cy) * d[1]; if (p < lo) lo = p; if (p > hi) hi = p; }
  return {c: [cx, cy], d, lo, hi, bottom};
};

const deg = (v) => (Math.atan2(v[1], v[0]) * 180) / Math.PI;
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** One bone of one drawing, in sheet units: top joint, bottom joint, angle (top to bottom), length. */
const bone = (parts, dir, name, px) => {
  const p = parts[name];
  const s = shape(path.join(dir, name + '.png'));
  const at = (k) => [p.x + (s.c[0] + s.d[0] * k) / px, p.y + (s.c[1] + s.d[1] * k) / px];
  let a = at(s.lo), b = at(s.hi);
  if (a[1] > b[1]) [a, b] = [b, a]; // the top joint is the higher end
  return {name, top: a, end: b, centre: at(0), angle: deg(sub(b, a)), length: dist(a, b), bottom: p.y + s.bottom / px, corner: [p.x, p.y]};
};

/**
 * The skeleton of every drawing. ids are the sheet's group numbers of the drawings in walking order.
 * Returns [{body: [x, y], nearArm, farArm, near: {thigh, shin, shoe}, far: {...}}] in sheet units.
 */
export const readWalk = (parts, dir, ids, px) => ids.map((id) => {
  const b = (k) => bone(parts, dir, `w${id}-${k}`, px);
  const leg = (from) => {
    const three = [b(from), b(from + 1), b(from + 2)].sort((p, q) => p.centre[1] - q.centre[1]); // thigh, shin, shoe from the top down
    const [thigh, shin, shoe] = three;
    // the shin's top is the end nearer the knee
    if (dist(shin.end, thigh.end) < dist(shin.top, thigh.end)) { [shin.top, shin.end] = [shin.end, shin.top]; shin.angle = deg(sub(shin.end, shin.top)); }
    // the shoe turns around its own middle; its angle points to the toe (she walks to the left)
    let toe = sub(shoe.end, shoe.top);
    if (toe[0] > 0) toe = mul(toe, -1);
    shoe.angle = deg(toe);
    return {thigh, shin, shoe};
  };
  const body = parts[`w${id}-1`];
  return {id, body: [body.x, body.y], nearArm: b(0), near: leg(2), far: leg(5), farArm: b(8)};
});

const turn = (a, b, u) => a + ((((b - a) % 360) + 540) % 360 - 180) * u; // the short way round
const lerp = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
const dirOf = (a) => [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)];

/** The limbs between drawing A and drawing B at u (0..1), measured from the body's corner. */
export const between = (A, B, u) => {
  const art = u < 0.5 || B.stand ? A : B; // which drawing's pictures are shown (a made-up standing pose has none of its own)
  const rel = (P, p) => sub(p, P.body);
  const leg = (key) => {
    const a = A[key], b = B[key];
    const hip = lerp(rel(A, a.thigh.top), rel(B, b.thigh.top), u);
    const t1 = turn(a.thigh.angle, b.thigh.angle, u);
    const knee = add(hip, mul(dirOf(t1), a.thigh.length + (b.thigh.length - a.thigh.length) * u));
    const shinTop = add(knee, lerp(sub(a.shin.top, a.thigh.end), sub(b.shin.top, b.thigh.end), u));
    const t2 = turn(a.shin.angle, b.shin.angle, u);
    const ankle = add(shinTop, mul(dirOf(t2), a.shin.length + (b.shin.length - a.shin.length) * u));
    const shoe = add(ankle, lerp(sub(a.shoe.centre, a.shin.end), sub(b.shoe.centre, b.shin.end), u));
    const t3 = turn(a.shoe.angle, b.shoe.angle, u);
    return {
      thigh: {at: hip, turn: t1 - art[key].thigh.angle}, shin: {at: shinTop, turn: t2 - art[key].shin.angle},
      shoe: {at: shoe, turn: t3 - art[key].shoe.angle}, shoeAt: shoe,
    };
  };
  const arm = (key) => {
    const a = A[key], b = B[key];
    return {at: lerp(rel(A, a.top), rel(B, b.top), u), turn: turn(a.angle, b.angle, u) - art[key].angle};
  };
  return {art: art.id, near: leg('near'), far: leg('far'), nearArm: arm('nearArm'), farArm: arm('farArm')};
};

/** The leg that carries her between two drawings: the one whose foot goes back under the body. */
export const stanceOf = (A, B) => {
  const back = (k) => (B[k].shoe.centre[0] - B.body[0]) - (A[k].shoe.centre[0] - A.body[0]);
  return back('near') >= back('far') ? 'near' : 'far';
};

/**
 * A standing pose made from a drawing: both legs straight down, the arms hanging.
 * flat = {angle, offset} of a shoe flat on the ground; ankleY = how far below the body's corner the ankle
 * must be for her to stand at her real height (the legs are fitted to that).
 */
export const standFrom = (P, flat, ankleY) => {
  const fix = (L) => {
    const gap = sub(L.shin.top, L.thigh.end);
    const fit = (P.body[1] + ankleY - L.thigh.top[1] - gap[1]) / (L.thigh.length + L.shin.length);
    const thighEnd = add(L.thigh.top, [0, L.thigh.length * fit]);
    const shinTop = add(thighEnd, gap);
    const shinEnd = add(shinTop, [0, L.shin.length * fit]);
    return {thigh: {...L.thigh, angle: 90, end: thighEnd, length: L.thigh.length * fit}, shin: {...L.shin, angle: 90, top: shinTop, end: shinEnd, length: L.shin.length * fit}, shoe: {...L.shoe, angle: flat.angle, centre: add(shinEnd, flat.offset)}};
  };
  return {...P, stand: true, near: fix(P.near), far: fix(P.far), nearArm: {...P.nearArm, angle: 92}, farArm: {...P.farArm, angle: 88}};
};
