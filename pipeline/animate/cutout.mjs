// Cut a figure out of a plain white background without touching the white inside it (a white coat):
// only the white that is joined to the picture's edge is removed. Writes a transparent PNG and prints
// where the figure is (its box, and the middle of its head) so it can be lined up with the other views.
//   node pipeline/animate/cutout.mjs <in.png> <out.png>
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';

const [, , src, dst] = process.argv;
const [W, H] = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', src], {encoding: 'utf8'}).stdout.trim().split(',').map(Number);
const raw = spawnSync('ffmpeg', ['-v', 'error', '-i', src, '-f', 'rawvideo', '-pix_fmt', 'rgba', '-'], {maxBuffer: 1 << 28}).stdout;
const px = Buffer.from(raw);
const white = (i) => px[i * 4] > 244 && px[i * 4 + 1] > 244 && px[i * 4 + 2] > 244;
// the flood only runs through white that is wide open (white all around for R pixels), so it cannot
// slip through a hairline gap into a white collar or cuff; the edge it leaves is grown back afterwards
const R = 3;
const sat = new Int32Array((W + 1) * (H + 1));
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) sat[(y + 1) * (W + 1) + x + 1] = (white(y * W + x) ? 1 : 0) + sat[y * (W + 1) + x + 1] + sat[(y + 1) * (W + 1) + x] - sat[y * (W + 1) + x];
const open = (x, y) => {
  const a = Math.max(0, x - R), b = Math.max(0, y - R), c = Math.min(W, x + R + 1), d = Math.min(H, y + R + 1);
  return sat[d * (W + 1) + c] - sat[b * (W + 1) + c] - sat[d * (W + 1) + a] + sat[b * (W + 1) + a] === (c - a) * (d - b);
};
const deep = new Uint8Array(W * H);
const out = new Uint8Array(W * H); // 1 = background
const stack = [];
const push = (x, y) => { const i = y * W + x; if (!deep[i] && open(x, y)) { deep[i] = 1; stack.push(i); } };
for (let x = 0; x < W; x++) { push(x, 0); push(x, H - 1); }
for (let y = 0; y < H; y++) { push(0, y); push(W - 1, y); }
while (stack.length) {
  const i = stack.pop();
  const x = i % W, y = (i - x) / W;
  if (x > 0) push(x - 1, y);
  if (x < W - 1) push(x + 1, y);
  if (y > 0) push(x, y - 1);
  if (y < H - 1) push(x, y + 1);
}
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  if (!deep[y * W + x]) continue;
  for (let dy = -R - 1; dy <= R + 1; dy++) for (let dx = -R - 1; dx <= R + 1; dx++) {
    const u = x + dx, v = y + dy;
    if (u >= 0 && v >= 0 && u < W && v < H && white(v * W + u)) out[v * W + u] = 1;
  }
}
let x0 = W, y0 = H, x1 = 0, y1 = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const i = y * W + x;
  if (out[i]) { px[i * 4 + 3] = 0; continue; }
  // a soft edge: a figure pixel beside the background is half see-through
  const edge = (x > 0 && out[i - 1]) || (x < W - 1 && out[i + 1]) || (y > 0 && out[i - W]) || (y < H - 1 && out[i + W]);
  px[i * 4 + 3] = edge ? 150 : 255;
  if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
}
// the middle of the head: the middle of the figure in the top eighth of its height
let sum = 0, count = 0;
for (let y = y0; y < y0 + (y1 - y0) / 8; y++) for (let x = x0; x <= x1; x++) if (!out[y * W + x]) { sum += x; count++; }
const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-i', '-', dst], {input: px});
if (r.status !== 0) throw new Error('ffmpeg: ' + r.stderr);
const info = {width: W, height: H, box: [x0, y0, x1, y1], headX: Math.round(sum / count)};
fs.writeFileSync(dst.replace(/\.png$/, '.json'), JSON.stringify(info));
console.log(JSON.stringify(info));
