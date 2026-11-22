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

// =====================================================================================================================
// Engine v9, phase 1 (2026-11-23): the camera of a look v8 video as the player shows it (blueprint 05, Parts 4.12 and 5).
// `scanCamera` above reads the OLD director's camera (`cameraAt` in Player.tsx) and the script's camera words; a v8 shot
// owns its framing (`view` in its ShotDef). This reads the framing the layout log recorded at every probe (the shot's real
// `view`, clamped the way the player clamps it) and counts: framings inside a shot (re-frames), zoom jumps (over 6% in one
// 60 fps frame), and the format-6 rule "one framing per body shot, one punch-in a video".
export const CAMERA_V9 = {zoomFrame: 1.06, shiftFrame: 40, reframe: 1.15, punches: 1};

export const scanLayoutCamera = (log) => {
  const C = CAMERA_V9;
  const ps = log.probes.filter((p) => p.kind !== 'card');
  const per60 = (log.every || 1 / 30) * 60; // frames of 60 fps between two probes
  const jumps = [], reframes = [], bodyMoves = new Set();
  for (let k = 1; k < ps.length; k++) {
    const a = ps[k - 1], b = ps[k];
    if (a.si !== b.si) continue;
    const z = Math.max(a.cam.z, b.cam.z) / Math.min(a.cam.z, b.cam.z);
    const zf = z ** (1 / per60);
    const shift = Math.hypot(b.cam.x - a.cam.x, b.cam.y - a.cam.y) * b.cam.z / per60;
    if (zf > C.zoomFrame || shift > C.shiftFrame) {
      const hard = z > C.reframe || shift * per60 > 200;
      (hard ? reframes : jumps).push(`${b.t.toFixed(2)} s, shot ${b.shot}: ${hard ? `a re-frame inside the shot (zoom x${z.toFixed(2)}, ${Math.round(shift * per60)} px)` : `the zoom changes ${((zf - 1) * 100).toFixed(1)}% in one frame`}`);
    }
    if (b.kind === 'body' && (Math.abs(b.cam.z - a.cam.z) > 1e-3 || Math.abs(b.cam.x - a.cam.x) > 0.5 || Math.abs(b.cam.y - a.cam.y) > 0.5)) bodyMoves.add(b.shot);
  }
  const approx = ps.some((p) => p.cam.approx);
  return {
    probes: ps.length, reframes, jumps, bodyShotsMoving: [...bodyMoves], approx,
    checks: [
      {id: 'V1', name: 'No re-frame inside a shot (one punch-in a video)', status: reframes.length > C.punches ? 'fail' : 'pass', value: reframes.length, limit: C.punches, rows: reframes.slice(0, 30), partial: approx},
      {id: 'V2', name: 'No zoom jump (6% a frame at most)', status: jumps.length ? 'fail' : 'pass', value: jumps.length, limit: 0, rows: jumps.slice(0, 30), partial: approx},
      {id: 'V3', name: 'Body shots hold one framing (format 6)', status: log.format >= 6 && bodyMoves.size ? 'fail' : log.format >= 6 ? 'pass' : 'n/m', value: bodyMoves.size, limit: 0,
        rows: [...bodyMoves].map((s) => `shot ${s}: the camera moves inside a body shot`), note: log.format >= 6 ? undefined : `format ${log.format}: the rule starts with format 6 (${bodyMoves.size} body shots move)`},
    ],
  };
};
