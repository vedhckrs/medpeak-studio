// Measures every person's joints, and every organ character's hands, on EVERY frame of a Toon, the way the player will draw them, and
// reports anything a viewer would feel as a jump of the body (owner, 2026-11-16: "legs jump"):
//   - a foot that slides while the character stands,
//   - a hip or a knee that moves faster than a calm shift of weight can,
//   - a hand or an elbow that covers more ground in one frame than a quick gesture does,
//   - a pop: one frame that moves far more than the frames before and after it.
// Needs the tsx loader (the player is a .tsx file):  node --import tsx pipeline/toon-motion.mjs <slug>
import {layoutToon, TOON_FPS} from '../../src/toons/director.ts';

/** The most a joint may move in one frame, in pixels on a 1080 x 1920 picture. */
export const LIMITS = {foot: 0.6, leg: 3, arm: 85, pop: 4};

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

export const scanMotion = async (toon, timings) => {
  const {bodiesAt} = await import('../../src/toons/Player.tsx');
  const L = layoutToon(toon, timings);
  const at = (f) => `${(f / TOON_FPS).toFixed(2)} s`;
  const out = {seconds: L.total / TOON_FPS, people: new Set(), frames: 0, slides: [], legJumps: [], armJumps: [], pops: [], worst: {foot: 0, leg: 0, arm: 0}};
  const speeds = new Map(); // "who part" -> the last three speeds, to spot a pop
  let prev = bodiesAt(L, 0);
  for (let f = 1; f < L.total; f++) {
    const cur = bodiesAt(L, f);
    if (cur.si === prev.si) {
      for (const b of cur.bodies) {
        const p = prev.bodies.find((x) => x.who === b.who);
        if (!p) continue;
        out.people.add(b.who);
        out.frames++;
        const moving = b.walking || p.walking; // an entrance moves the whole body on purpose
        const parts = [];
        b.legs.forEach((l, i) => {
          parts.push([`${i ? 'right' : 'left'} foot`, 'foot', dist(l.ankle, p.legs[i].ankle)]);
          parts.push([`${i ? 'right' : 'left'} knee`, 'leg', dist(l.knee, p.legs[i].knee)]);
          parts.push([`${i ? 'right' : 'left'} hip`, 'leg', dist(l.hip, p.legs[i].hip)]);
        });
        b.arms.forEach((a, i) => {
          if (!a || !p.arms[i]) return;
          parts.push([`${i ? 'right' : 'left'} elbow`, 'arm', dist(a.elbow, p.arms[i].elbow)]);
          parts.push([`${i ? 'right' : 'left'} hand`, 'arm', dist(a.wrist, p.arms[i].wrist)]);
        });
        for (const [name, kind, v] of parts) {
          if (!moving) out.worst[kind] = Math.max(out.worst[kind], v);
          const key = `${b.who} ${name}`;
          const h = speeds.get(key) ?? [];
          h.push({f, v});
          if (h.length > 3) h.shift();
          speeds.set(key, h);
          if (moving) continue;
          const row = `${at(f)}: ${b.who}'s ${name} moves ${v.toFixed(1)} px in one frame`;
          if (kind === 'foot' && v > LIMITS.foot) out.slides.push(row);
          if (kind === 'leg' && v > LIMITS.leg) out.legJumps.push(row);
          if (kind === 'arm' && v > LIMITS.arm) out.armJumps.push(row);
          // a pop: the middle frame of three moves several times more than both neighbours
          if (h.length === 3 && h[1].f === f - 1 && h[0].f === f - 2) {
            const [a0, a1, a2] = h.map((x) => x.v);
            const floor = kind === 'arm' ? 14 : 2;
            if (a1 > floor && a1 > LIMITS.pop * Math.max(a0, a2, 0.4)) out.pops.push(`${at(f - 1)}: ${b.who}'s ${name} pops (${a1.toFixed(1)} px, then ${a2.toFixed(1)} px)`);
          }
        }
      }
      for (const o of cur.organs ?? []) {
        const p = (prev.organs ?? []).find((x) => x.who === o.who);
        if (!p) continue;
        out.people.add(o.who);
        o.hands.forEach((h, i) => {
          if (!p.hands[i]) return;
          const v = dist(h, p.hands[i]);
          out.worst.arm = Math.max(out.worst.arm, v);
          const key = `${o.who} hand${i}`;
          const hist = speeds.get(key) ?? [];
          hist.push({f, v});
          if (hist.length > 3) hist.shift();
          speeds.set(key, hist);
          if (v > LIMITS.arm) out.armJumps.push(`${at(f)}: ${o.who}'s ${i ? 'right' : 'left'} hand moves ${v.toFixed(1)} px in one frame`);
          if (hist.length === 3 && hist[1].f === f - 1 && hist[0].f === f - 2 && hist[1].v > 14 && hist[1].v > LIMITS.pop * Math.max(hist[0].v, hist[2].v, 0.4)) out.pops.push(`${at(f - 1)}: ${o.who}'s ${i ? 'right' : 'left'} hand pops (${hist[1].v.toFixed(1)} px)`);
        });
      }
    } else speeds.clear();
    prev = cur;
  }
  out.people = [...out.people];
  out.ok = !out.slides.length && !out.legJumps.length && !out.armJumps.length && !out.pops.length;
  return out;
};

// =====================================================================================================================
// Engine v9, phase 1 (2026-11-23): the MOTION checks M1, M3-M5 on the layout log of a look v8 video (blueprint 05, Part 5).
// `scanMotion` above reads the OLD player (`bodiesAt` in Player.tsx); a v8 video's people and organ arms are drawn by
// the v8 tree, so these read the layout log (pipeline/lib/toon-layout.mjs) instead: heads, faces and hands of people
// AND body characters, probe by probe (30 a second by default). M2 ("one action, then a hold") is measured on the
// picture (toon_picture.py, C2 `action_gaps`). Results have the shape of scanLayout's (toon-staging.mjs).
import {centre as cOf, episodes as epOf, fmt as fmtS} from './toon-geom.mjs';

export const LAYOUT_MOTION = {cutJump: 120, minBody: 80, still: 0.6, speaker: 0.3, listener: 0.1, arm: 85, pop: 4, popFloor: 14, flip: 30, open: 1.5, openStill: 2};

export const scanLayoutMotion = (log) => {
  const X = LAYOUT_MOTION;
  const R = [];
  const res = (id, name, hits, extra = {}) => {
    const eps = epOf(hits);
    const measured = extra.measured ?? true;
    R.push({id, name, status: !measured ? 'n/m' : eps.length ? 'fail' : 'pass', value: extra.value ?? eps.length, limit: extra.limit ?? 0, partial: extra.partial ?? true,
      rows: eps.slice(0, 40).map((e) => `${fmtS(e.from)}${e.to > e.from ? `-${fmtS(e.to)}` : ''}, shot ${e.shot}: ${e.what}`), episodes: eps.length, frames: hits.length, note: extra.note});
  };
  const ps = log.probes.filter((p) => p.kind !== 'card');
  const scale = (1 / 30) / (log.every || 1 / 30); // limits are per 1/30 s
  // the things that move, matched probe to probe: a named head (people) or a hand, by owner and nearest position
  const keyOf = (i) => (i.who ? `${i.who}:${i.kind}:${i.id ?? ''}` : null);

  // M1 the face talks, the body holds: the speaker's head moves on 30% of the line's frames or fewer, a listener's on 10%
  const m1 = [];
  let m1n = 0;
  for (const line of log.lines) {
    const lp = ps.filter((p) => p.line === line.id);
    const moved = new Map(), seen = new Map();
    for (let k = 1; k < lp.length; k++) {
      const a = lp[k - 1], b = lp[k];
      if (a.si !== b.si || Math.abs(b.t - a.t - log.every) > 1e-3) continue;
      for (const h of b.items.filter((i) => i.kind === 'head' && i.who)) {
        const g = a.items.find((i) => i.kind === 'head' && i.who === h.who);
        if (!g) continue;
        const d = Math.hypot(cOf(h.box)[0] - cOf(g.box)[0], cOf(h.box)[1] - cOf(g.box)[1]) * scale;
        seen.set(h.who, (seen.get(h.who) ?? 0) + 1);
        if (d > X.still) moved.set(h.who, (moved.get(h.who) ?? 0) + 1);
      }
    }
    for (const [who, n] of seen) {
      if (n < 6) continue;
      m1n++;
      const k = (moved.get(who) ?? 0) / n;
      const lim = who === line.who ? X.speaker : X.listener;
      if (k > lim) m1.push({t: lp[0].t, shot: lp[0].shot, what: `line ${line.id}: ${who} ${who === line.who ? '(speaking)' : '(listening)'} moves on ${Math.round(k * 100)}% of the line (at most ${Math.round(lim * 100)}%)`});
    }
  }
  res('M1', 'The face talks, the body holds', m1, {measured: m1n > 0, note: m1n ? `${m1n} character-lines measured (people; body characters once they report a name)` : 'no named head on screen'});

  // M3 joint speed (hands of people AND body characters), M4 a pose that flips and flips back (one-probe pops)
  const m3 = [], m4 = [];
  const hist = new WeakMap(); // a hand of the log -> its last positions (relative to its body)
  // a hand is measured against its own body (a person's head, a figure's box): a character flying in is an action, not a joint
  const owner = (i) => i.who ?? (i.body ? `#${i.body}` : null);
  const anchorItem = (p, o) => p.items.find((i) => (i.kind === 'head' || (i.kind === 'body' && i.id === 'put')) && owner(i) === o);
  const anchor = (p, o) => { const b = anchorItem(p, o); return b ? cOf(b.box) : null; };
  const sizeChange = (a, b, o) => { const x = anchorItem(a, o), y = anchorItem(b, o); return x && y ? Math.abs((y.box[2] - y.box[0]) / Math.max(1, x.box[2] - x.box[0]) - 1) : 0; };
  for (let k = 1; k < ps.length; k++) {
    const a = ps[k - 1], b = ps[k];
    if (a.si !== b.si) continue;
    const prevHands = a.items.filter((i) => i.kind === 'hand');
    for (const h of b.items.filter((i) => i.kind === 'hand')) {
      const o = owner(h);
      if (!o) continue;
      const ab = anchor(b, o), aa = anchor(a, o);
      if (!ab || !aa) continue;
      const ai = anchorItem(b, o);
      if (ai.box[2] - ai.box[0] < X.minBody) continue; // a background extra
      // a cut inside the shot (a new picture) or a dive (everything grows): not a joint moving
      if (Math.hypot(ab[0] - aa[0], ab[1] - aa[1]) * scale > X.cutJump || Math.abs(b.cam.z / a.cam.z - 1) > 0.01 || sizeChange(a, b, o) > 0.03) continue;
      const c = [cOf(h.box)[0] - ab[0], cOf(h.box)[1] - ab[1]];
      const own = prevHands.filter((g) => owner(g) === o && (g.id ?? '') === (h.id ?? ''));
      if (!own.length) continue;
      const rel = (g) => [cOf(g.box)[0] - aa[0], cOf(g.box)[1] - aa[1]];
      const g = own.reduce((x, y) => (Math.hypot(rel(y)[0] - c[0], rel(y)[1] - c[1]) < Math.hypot(rel(x)[0] - c[0], rel(x)[1] - c[1]) ? y : x));
      const v = Math.hypot(rel(g)[0] - c[0], rel(g)[1] - c[1]) * scale;
      if (v > X.arm) m3.push({t: b.t, shot: b.shot, what: `${h.who ?? 'a body character'}'s hand moves ${Math.round(v)} px in one frame (at most ${X.arm})`});
      // M4: there and back: the hand leaves for one frame and returns (a pose flipped by a threshold). Its trail follows the match.
      const l = [...(hist.get(g) ?? [{t: a.t, p: rel(g)}]), {t: b.t, p: c}].slice(-4);
      hist.set(h, l);
      for (const span of [2]) { // out for ONE frame and back
        if (l.length <= span) continue;
        const p0 = l[l.length - 1 - span].p, p1 = l[l.length - span].p, p2 = l[l.length - 1].p;
        const out = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), back = Math.hypot(p2[0] - p0[0], p2[1] - p0[1]);
        if (out * scale > X.flip && back < 0.25 * out) { m4.push({t: l[l.length - span].t, shot: b.shot, what: `${h.who ?? 'a body character'}'s hand jumps ${Math.round(out)} px and back`}); l.splice(0, l.length - 1); break; }
      }
    }
  }
  res('M3', 'Joints move no faster than a gesture', m3);
  res('M4', 'No pose flips for a frame', m4);

  // M5 an open (spread) hand held still over 1.5 s
  const m5 = [];
  const held = new Map();
  for (const p of ps) {
    const now = new Set();
    for (const h of p.items.filter((i) => i.kind === 'hand' && i.open)) {
      const key = `${h.who ?? h.chain?.[0] ?? '?'}:${h.id ?? Math.round(cOf(h.box)[0] / 60)}:${Math.round(cOf(h.box)[1] / 60)}`;
      now.add(key);
      const st = held.get(key) ?? {from: p.t, shot: p.shot, done: false};
      held.set(key, st);
      if (!st.done && p.t - st.from > X.open) { st.done = true; m5.push({t: st.from, shot: p.shot, what: `${h.who ?? 'a body character'}'s open hand held ${X.open}+ s without a gesture`}); }
    }
    for (const k of [...held.keys()]) if (!now.has(k)) held.delete(k);
  }
  res('M5', 'No spread hand held at rest', m5, {note: 'organ arms now; the people rig reports its hand shape in phase 2'});
  return {checks: R, ok: R.every((c) => c.status !== 'fail')};
};
