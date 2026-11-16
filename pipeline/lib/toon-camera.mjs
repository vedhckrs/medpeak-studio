// Measures the camera on EVERY frame of a Toon, the way the player will show it, and reports
// anything a viewer would feel as a jump:
//   - a jolt inside a shot (the picture moves more in one frame than a smooth move can),
//   - a jump cut (a cut that keeps the same character at almost the same size),
//   - a wrong picture (the camera shows a shot that is not the one planned for that moment).
// Needs the tsx loader (the player is a .tsx file):  node --import tsx pipeline/toon-camera.mjs <slug>
import {layoutToon, TOON_FPS} from '../../src/toons/director.ts';

const SMOOTH = {zoom: 1.012, shift: 14, rot: 0.45}; // the most a calm move may change in one frame
const FAST = {zoom: 1.07, shift: 420, rot: 2}; // ...and a fast move the script asked for (whip, crash, shake)

export const scanCamera = async (toon, timings) => {
  const {cameraAt} = await import('../../src/toons/Player.tsx');
  const L = layoutToon(toon, timings);
  const out = {seconds: L.total / TOON_FPS, pictures: L.segs.length, cleanCuts: 0, jumpCuts: [], jolts: [], wrong: []};
  const at = (f) => `${(f / TOON_FPS).toFixed(2)} s`;
  let prev = cameraAt(L, 0);
  for (let f = 1; f < L.total; f++) {
    const cur = cameraAt(L, f);
    const a = prev.cam;
    const b = cur.cam;
    const zoom = Math.max(a.zoom, b.zoom) / Math.min(a.zoom, b.zoom);
    const shift = Math.hypot((b.cx - a.cx) * b.zoom + (b.sx - a.sx), (b.cy - a.cy) * b.zoom + (b.sy - a.sy));
    const rot = Math.abs(b.rot - a.rot);
    const name = (s) => `${s.line.line.id} ${s.who} ${s.shot}`;
    if (cur.seg !== prev.seg) {
      const sameScene = cur.seg.si === prev.seg.si;
      if (cur.seg.from !== f) out.wrong.push(`${at(f)}: the camera shows "${name(cur.seg)}", which was not planned to start here`);
      else if (sameScene && !cur.seg.whip && cur.seg.who === prev.seg.who && zoom < 1.3 && shift < 260) out.jumpCuts.push(`${at(f)}: ${name(prev.seg)} -> ${name(cur.seg)} (size changes only x${zoom.toFixed(2)})`);
      else out.cleanCuts++;
    } else {
      const n = f - cur.seg.from;
      const asked = (cur.seg.whip && n < 10) || ((cur.seg.move === 'crash' || cur.seg.move === 'shake') && n < 14);
      const lim = asked ? FAST : SMOOTH;
      if (zoom > lim.zoom || shift > lim.shift || rot > lim.rot) out.jolts.push(`${at(f)}: inside "${name(cur.seg)}" (${cur.seg.move}) zoom x${zoom.toFixed(3)}, shift ${shift.toFixed(0)} px, tilt ${rot.toFixed(1)}`);
    }
    prev = cur;
  }
  out.ok = !out.jumpCuts.length && !out.jolts.length && !out.wrong.length;
  return out;
};
