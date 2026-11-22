// Checks where every graphic sits in every scene of a Toon, the way the player will draw it, and
// reports what a viewer would see as a mistake of staging (owner, 2026-11-16: "this bubble comes
// [over the] doctor face"):
//   - a graphic (bubble, tag, sign, object) that covers part of a character's head,
//   - a graphic that leaves the picture or sits under the app's own buttons at the top,
//   - two graphics on screen at the same time that sit on top of each other,
//   - a graphic on the line where the caption is written,
//   - something on a room's wall (chart, clock, picture, mirror) that ends up behind a head,
//   - a small thing of a room (a monitor, a plant, a lamp, a bowl) that a person half hides, or a long
//     piece of furniture that is mostly hidden (owner, 2026-11-17, on a monitor cut by Dr. Mira's coat:
//     "this bug repeated again and again").
// Long furniture may be partly behind people (a desk, a bed): that is how a room looks. In the first three
// scripts a graphic may cover what hangs on the wall; from the second script format on ("format": 2)
// a graphic must stay on plain wall (not more than 10% of the chart or mirror under it).
// Needs the tsx loader (the player is a .tsx file):  node --import tsx pipeline/toon-staging.mjs <slug>
import {captionBox, layoutToon, propFrames, propReach, STAGE_KEYS, stateAt, TOON_FPS} from '../../src/toons/director.ts';

/** How much of a head a graphic may touch (its outline brushing the hair is fine; covering is not). */
export const LIMITS = {head: 0.04, pair: 0.3, top: 110, sides: 8, caption: 0.02, wall: 0.15, onWall: 0.1, small: 0.02, longShown: 0.4};

const boxOf = (p, spot) => { const u = p.size / 200; const [l, up, r, dn] = propReach(p).map((v) => v * u); return {x0: spot.x - l, x1: spot.x + r, y0: spot.y - up, y1: spot.y + dn}; };
const overlap = (a, b) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
const area = (b) => (b.x1 - b.x0) * (b.y1 - b.y0);
const name = (p) => `${p.bubble ? 'bubble with ' : ''}${p.kind}${p.text ? ` "${p.text}"` : ''}`;

export const scanStaging = async (toon, timings, opts = {}) => {
  const {headBox, headSeen, peopleBoxes, propSpot} = await import('../../src/toons/Player.tsx');
  const {roomThings, wallItems} = await import('../../src/toons/rooms.tsx');
  const {stageThings} = await import('../../src/toons/stages.tsx');
  const cap = captionBox(toon.camera === 'steady', toon.caption);
  const L = layoutToon(toon, timings);
  const out = {graphics: 0, wallItems: 0, things: 0, onHeads: [], outside: [], stacked: [], onCaption: [], hidden: [], onWall: [], halfHidden: [], leftOut: [], onStageFace: [], stagesNotMeasured: []};
  toon.shots.forEach((shot, si) => {
    if (shot.card !== undefined) return;
    const items = (shot.props ?? []).map((p) => { const [from, to] = propFrames(L, si, p); return {p, from, to, box: boxOf(p, propSpot(p, shot))}; });
    out.graphics += items.length;
    for (const it of items) {
      const at = `${(it.from / TOON_FPS).toFixed(1)} s, scene ${shot.id}`;
      // the stage's own characters move with its state, so look where they are while this graphic is up
      const when = Math.min(it.to - 1, it.from + 10);
      const heads = (shot.cast ?? []).map((a) => headBox(a, shot.set, stateAt(L, si, when))).filter(Boolean);
      for (const h of heads) {
        if (it.p.on === h.who) continue; // drawn on that character on purpose (a pain mark on a cheek)
        const part = overlap(it.box, h) / area(h);
        if (part > LIMITS.head) out.onHeads.push(`${at}: the ${name(it.p)} covers ${Math.round(part * 100)}% of ${h.who}'s head`);
      }
      const low = overlap(it.box, cap) / area(it.box);
      if (low > LIMITS.caption) out.onCaption.push(`${at}: the ${name(it.p)} sits on the caption line (it reaches down to ${Math.round(it.box.y1)} px; the caption starts at ${cap.y0})`);
      if (it.box.x0 < LIMITS.sides || it.box.x1 > 1080 - LIMITS.sides || it.box.y0 < LIMITS.top) out.outside.push(`${at}: the ${name(it.p)} reaches ${it.box.y0 < LIMITS.top ? `too high (top at ${Math.round(it.box.y0)} px; keep below ${LIMITS.top})` : 'past the side of the picture'}`);
    }
    // a graphic on top of what the stage itself draws (a calendar, a sign, a label, a crowd): the same fault as two graphics
    // on each other (owner, 2026-11-18: a tag over the stage's calendar)
    if (STAGE_KEYS[shot.set]) for (const it of items) {
      for (let f = it.from; f < it.to; f += 6) {
        const T = stageThings(shot.set, stateAt(L, si, f), f / TOON_FPS);
        const hit = (T?.things ?? []).find((th) => th.text && overlap(it.box, th) / Math.min(area(it.box), area(th)) > LIMITS.pair * 0.1);
        if (hit) { out.stacked.push(`${(f / TOON_FPS).toFixed(1)} s, scene ${shot.id}: the ${name(it.p)} covers the stage's ${hit.id}`); break; }
      }
    }
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      if (Math.min(a.to, b.to) - Math.max(a.from, b.from) < 6) continue; // not on screen together
      if (a.p.on === 'bubble' || b.p.on === 'bubble') continue; // a mark on the picture inside a bubble
      const part = overlap(a.box, b.box) / Math.min(area(a.box), area(b.box));
      if (part > LIMITS.pair) out.stacked.push(`${(Math.max(a.from, b.from) / TOON_FPS).toFixed(1)} s, scene ${shot.id}: the ${name(a.p)} and the ${name(b.p)} overlap by ${Math.round(part * 100)}%`);
    }
  });
  // a body stage: its loose contents (food, bubbles, the juice's surface) against the faces drawn on it,
  // on every sixth frame of the scene (owner, 2026-11-17, on the stomach: "too much cluttered")
  L.shots.forEach((sh, si) => {
    const set = sh.shot.set;
    if (sh.shot.card !== undefined || !STAGE_KEYS[set]) return;
    const seen = new Set();
    for (let f = sh.from; f < sh.from + sh.frames; f += 6) {
      const T = stageThings(set, stateAt(L, si, f), f / TOON_FPS);
      if (!T) { if (!out.stagesNotMeasured.includes(set)) out.stagesNotMeasured.push(set); return; }
      for (const face of T.faces) {
        if (face.y1 > cap.y + 1 && !seen.has(`cap|${face.who}`)) { seen.add(`cap|${face.who}`); out.onCaption.push(`${(f / TOON_FPS).toFixed(1)} s, scene ${sh.shot.id}: ${face.who}'s face reaches down onto the caption line`); }
        if (T.surface !== undefined && !face.dry && T.surface < face.y1 - 1 && !seen.has('surface')) { seen.add('surface'); out.onStageFace.push(`${(f / TOON_FPS).toFixed(1)} s, scene ${sh.shot.id}: the liquid's surface crosses ${face.who}'s face`); }
        for (const th of T.things) {
          if (th.only && th.only !== face.who) continue; // drawn behind the other characters: it can only crowd this face
          const key = `${th.id}|${face.who}`;
          if (!seen.has(key) && overlap(th, face) > 0) { seen.add(key); out.onStageFace.push(`${(f / TOON_FPS).toFixed(1)} s, scene ${sh.shot.id}: ${th.id} is in front of ${face.who}'s face`); }
        }
      }
    }
  });
  // what hangs on a room's wall, against the heads of everyone who stands in that room
  toon.shots.forEach((shot) => {
    const look = (shot.set === 'clinic' || shot.set === 'home') && toon.rooms?.[shot.set];
    if (!look) return;
    const heads = (shot.cast ?? []).filter((a) => !a.stage).map((a) => headSeen(a, shot.set)).filter(Boolean);
    // the room's own things against the people standing in it: `opts.asDrawn` measures them where
    // they were first drawn (no placing), to show what the room kit used to do
    const people = peopleBoxes(shot);
    const things = (opts.roomThings ?? roomThings)(look, shot.set, opts.asDrawn ? [] : people);
    for (const sm of things.smalls) {
      out.things++;
      if (sm.drop) { out.leftOut.push(`scene ${shot.id}: the ${sm.id} (no place clear of the people)`); continue; }
      for (const q of people) {
        const part = overlap(sm.box, q) / area(sm.box);
        if (part > LIMITS.small) out.halfHidden.push(`scene ${shot.id}: ${Math.round(part * 100)}% of the ${shot.set}'s ${sm.id} is behind ${q.who}`);
      }
    }
    for (const l of things.longs) {
      out.things++;
      const seen = {x0: Math.max(0, l.box.x0), y0: l.box.y0, x1: Math.min(1080, l.box.x1), y1: l.box.y1};
      const gone = Math.min(1, people.reduce((n, q) => n + overlap(seen, q), 0) / Math.max(1, area(seen)));
      if (1 - gone < LIMITS.longShown) out.halfHidden.push(`scene ${shot.id}: only ${Math.round((1 - gone) * 100)}% of the ${shot.set}'s ${l.id} can be seen behind the people (pick another arrangement)`);
    }
    const si = toon.shots.indexOf(shot);
    const graphics = (shot.props ?? []).filter((p) => !p.on).map((p) => { const [from] = propFrames(L, si, p); return {p, from, box: boxOf(p, propSpot(p, shot))}; });
    for (const w of (opts.wallItems ?? wallItems)(look, shot.set)) {
      out.wallItems++;
      const box = {x0: w.box[0], y0: w.box[1], x1: w.box[2], y1: w.box[3]};
      // the new scripts keep their pop-ups on plain wall (owner: "keep area clean where popup visual and text, no wall element disturb")
      if (toon.format === 2) for (const g of graphics) {
        const part = overlap(g.box, box) / area(box);
        if (part > LIMITS.onWall) out.onWall.push(`${(g.from / TOON_FPS).toFixed(1)} s, scene ${shot.id}: the ${name(g.p)} covers ${Math.round(part * 100)}% of the wall ${w.kind} (the plain wall is between the window and the ${w.kind})`);
      }
      for (const h of heads) {
        const part = overlap(box, h) / area(box);
        if (part > LIMITS.wall) out.hidden.push(`scene ${shot.id}: ${Math.round(part * 100)}% of the ${shot.set}'s wall ${w.kind} is behind ${h.who}'s head`);
      }
    }
  });
  out.ok = !out.onHeads.length && !out.outside.length && !out.stacked.length && !out.onCaption.length && !out.hidden.length && !out.onWall.length && !out.halfHidden.length && !out.onStageFace.length;
  return out;
};

// =====================================================================================================================
// Engine v9, phase 1 (2026-11-23): the LAYOUT checks L1-L14 on the layout log of a look v8 video (blueprint 05, Part 5).
// `scanStaging` above reads the OLD engine (Player.tsx, rooms.tsx, stages.tsx) and the script: for a v8 video it measured
// nothing that is drawn (it said "ALL PASS" with one graphic found a video). These read what the real component tree drew
// (pipeline/lib/toon-layout.mjs -> videos/<slug>/renders/layout.json). Every result:
//   {id, name, status: 'pass' | 'fail' | 'n/m' (nothing reports it yet), value, limit, rows, partial}
// `partial`: the check rests on the probe's shims (estimated boxes) until the components report themselves
// (plans/engine-upgrade-2026-11-23/07-layout-log-wiring.md).
import * as G from './toon-geom.mjs';
const {centre, contains, dist, episodes, fmt, inter, insideShare, pad, radius, sameOwner} = G;

export const LAYOUT_LIMITS = {facePad: 20, faceCover: 0.05, textOnText: 0.02, wmCaption: 120, edge: [0.15, 0.85], burstFace: 1.2, bursts: 2, texts: 2, plates: 1,
  eye: [110, 190], eyeBig: 110, faceTop: 800, gazeDeg: 30, gazeShare: 0.7, hands: 30, handFrames: 3, captionHit: 0.02, minFace: 40};
const TEXT = new Set(['caption', 'tag', 'label', 'plate', 'text']);
const COVER = new Set(['fx', 'tag', 'label', 'plate', 'text', 'icon', 'bubble', 'prop']);
/** A face big enough to matter: background extras (a crowd of tiny cells) are left out of the face checks. */
const wide = (i) => i.box[2] - i.box[0] >= LAYOUT_LIMITS.minFace;
const shimmed = (items) => items.some((i) => i.src === 'shim');

export const scanLayout = (log) => {
  const L = LAYOUT_LIMITS;
  const story = log.probes.filter((p) => p.kind !== 'card');
  const R = [];
  const res = (id, name, hits, extra = {}) => {
    const eps = episodes(hits).filter((e) => !extra.minDur || e.to - e.from >= extra.minDur - 1e-6);
    const measured = extra.measured ?? true;
    R.push({id, name, status: !measured ? 'n/m' : eps.length ? 'fail' : 'pass', value: extra.value ?? eps.length, limit: extra.limit ?? 0, partial: !!extra.partial,
      rows: eps.slice(0, 40).map((e) => `${fmt(e.from)}${e.to > e.from ? `-${fmt(e.to)}` : ''}, shot ${e.shot}: ${e.what}`), episodes: eps.length, frames: hits.length, note: extra.note});
  };
  const all = (k) => story.flatMap((p) => p.items.filter((i) => i.kind === k));
  const anyShim = story.some((p) => shimmed(p.items));
  const facesSeen = all('face').length + all('eye').length;
  const name = (i) => `${i.kind}${i.text ? ` "${i.text}"` : ''}${i.who ? ` (${i.who})` : ''}`;

  // L1 nothing on a face (the owner's own hand and body are fine)
  const l1 = [];
  for (const p of story) {
    const faces = p.items.filter((i) => i.kind === 'face' && wide(i));
    for (const f of faces) {
      const fb = pad(f.box, L.facePad);
      for (const o of p.items) {
        if (o === f || sameOwner(o, f)) continue;
        const cover = COVER.has(o.kind) || (o.kind === 'face' && wide(o)) || (o.kind === 'hand' && o.who && f.who && o.who !== f.who);
        if (!cover) continue;
        if (inter(fb, o.box) > L.faceCover * G.area(fb)) l1.push({t: p.t, shot: p.shot, what: `${name(o)} on ${f.who ?? 'a'} face`});
      }
    }
  }
  res('L1', 'Nothing on a face', l1, {partial: anyShim, measured: facesSeen > 0});

  // L2 text on text
  const l2 = [];
  for (const p of story) {
    const tx = p.items.filter((i) => TEXT.has(i.kind));
    for (let a = 0; a < tx.length; a++) for (let b = a + 1; b < tx.length; b++) {
      if (inter(tx[a].box, tx[b].box) > L.textOnText * Math.min(G.area(tx[a].box), G.area(tx[b].box))) l2.push({t: p.t, shot: p.shot, what: `${name(tx[a])} on ${name(tx[b])}`});
    }
  }
  res('L2', 'No text on text', l2, {partial: anyShim});

  // L3 a face, an eye or a mouth in the caption
  const l3 = [];
  for (const p of story) {
    const cap = p.items.find((i) => i.kind === 'caption');
    if (!cap) continue;
    for (const f of p.items.filter((i) => ((i.kind === 'eye' || i.kind === 'mouth') && i.box[2] - i.box[0] >= L.minFace / 4) || (i.kind === 'face' && wide(i)))) {
      const hit = f.kind === 'face' ? inter(f.box, cap.box) > 0.1 * G.area(f.box) : inter(f.box, cap.box) > L.captionHit * G.area(f.box);
      if (hit) l3.push({t: p.t, shot: p.shot, what: `the caption on ${f.who ? `${f.who}'s` : 'a'} ${f.kind}`});
    }
  }
  res('L3', 'Caption off every face', l3, {partial: anyShim, measured: facesSeen > 0});

  // L4 a tag's arrow ends on the wrong thing (another face, a prop) or short of its character
  const l4 = [];
  for (const p of story) {
    for (const tg of p.items.filter((i) => i.kind === 'tag' && i.tip)) {
      const wrong = p.items.find((o) => (o.kind === 'face' || o.kind === 'eye' || o.kind === 'prop' || o.kind === 'mouth') && contains(o.box, tg.tip) && !(tg.target && contains(pad([tg.target[0] - tg.target[2], tg.target[1] - tg.target[2], tg.target[0] + tg.target[2], tg.target[1] + tg.target[2]], 0), centre(o.box))));
      if (wrong) l4.push({t: p.t, shot: p.shot, what: `the ${tg.text} tag's arrow ends on ${name(wrong)}`});
      // a stage's neighbour and face-room boxes (anatomy.tsx StageReport) are not a character's body
      const onBody = p.items.some((o) => (o.kind === 'body' || o.kind === 'face') && !/^(neighbour|faceRoom):/.test(o.id ?? '') && contains(o.box, tg.tip) && (!tg.target || contains(o.box, [tg.target[0], tg.target[1]])));
      if (!onBody && tg.target && dist(tg.tip, tg.target) > tg.target[2] * 1.6) l4.push({t: p.t, shot: p.shot, what: `the ${tg.text} tag's arrow stops short of its character`});
    }
  }
  res('L4', 'Tag arrows end on their own character', l4, {partial: anyShim, measured: all('tag').length > 0, note: all('tag').length ? undefined : 'no tags on screen'});

  // L5 the watermark on a head, or close above the caption (it reads as a second caption line)
  const l5 = [];
  const band = log.caption === 2 ? [1324, 1434] : [1380, 1560];
  for (const p of story) {
    const wm = p.items.find((i) => i.kind === 'watermark');
    if (!wm) continue;
    const head = p.items.find((i) => (i.kind === 'head' || i.kind === 'face') && inter(i.box, wm.box) > 0);
    if (head) l5.push({t: p.t, shot: p.shot, what: `the watermark on ${head.who ?? 'a'} ${head.kind}`});
    const gap = Math.max(band[0] - wm.box[3], wm.box[1] - band[1]);
    if (gap < L.wmCaption) l5.push({t: p.t, shot: p.shot, what: `the watermark ${Math.round(Math.max(0, gap))} px from the caption line (keep ${L.wmCaption}+)`});
  }
  res('L5', 'Watermark clear of heads and caption', l5, {partial: anyShim});

  // L6 half a head (or a wall item) at the edge of the picture
  const l6 = [];
  for (const p of story) for (const h of p.items.filter((i) => i.kind === 'head' || i.kind === 'wallItem' || (i.kind === 'face' && !i.who && wide(i)))) {
    const k = insideShare(h.box);
    if (k > L.edge[0] && k < L.edge[1]) l6.push({t: p.t, shot: p.shot, what: `${h.who ? `${h.who}'s ` : 'a '}${h.kind === 'wallItem' ? 'wall item' : h.kind} ${Math.round(k * 100)}% inside the picture`});
  }
  res('L6', 'No half heads at the edge', l6, {partial: anyShim, minDur: 0.5}); // held half in, not passing through the edge

  // L7 bursts near faces; bursts a video
  const l7 = [];
  const bursts = new Set();
  for (const p of story) for (const b of p.items.filter((i) => i.kind === 'fx')) {
    bursts.add(`${p.shot}:${b.id ?? b.box.join(',')}`);
    for (const f of p.items.filter((i) => i.kind === 'face' && wide(i))) {
      const gap = dist(centre(b.box), centre(f.box)) - radius(b.box);
      if (gap < L.burstFace * radius(f.box)) l7.push({t: p.t, shot: p.shot, what: `a burst on ${f.who ?? 'a'} face`});
    }
  }
  if (bursts.size > L.bursts) l7.push({t: 0, shot: '-', what: `${bursts.size} bursts in the video (at most ${L.bursts})`});
  res('L7', 'Bursts off faces, 2 a video at most', l7, {partial: anyShim, value: bursts.size, limit: L.bursts});

  // L8 text elements besides the caption and the watermark; number plates a video
  const l8 = [];
  const plates = new Set();
  for (const p of story) {
    const tx = p.items.filter((i) => ['tag', 'label', 'plate', 'text'].includes(i.kind));
    for (const pl of tx.filter((i) => i.kind === 'plate')) plates.add(pl.text ?? pl.box.join(','));
    if (tx.length > L.texts) l8.push({t: p.t, shot: p.shot, what: `${tx.length} texts on screen (${tx.map((i) => i.text ?? i.kind).join(', ')})`});
  }
  if (plates.size > L.plates) l8.push({t: 0, shot: '-', what: `${plates.size} number plates in the video (${[...plates].join(', ')}; at most ${L.plates})`});
  res('L8', 'Two texts at most, one number plate', l8, {partial: anyShim, value: plates.size, limit: L.plates});

  // L9 the hero organ's eye in a body shot (screen pixels) and its face height
  const l9 = [];
  const perShot = {};
  for (const p of story.filter((q) => q.kind === 'body')) {
    const eyes = p.items.filter((i) => i.kind === 'eye');
    if (!eyes.length) continue;
    const big = eyes.reduce((a, b) => ((b.box[2] - b.box[0]) > (a.box[2] - a.box[0]) ? b : a));
    const w = big.box[2] - big.box[0];
    (perShot[p.shot] ??= []).push(w);
    if (w > L.eye[1]) l9.push({t: p.t, shot: p.shot, what: `an eye ${Math.round(w)} px wide (110-190)`});
    else if (w >= L.eyeBig && centre(big.box)[1] > L.faceTop) l9.push({t: p.t, shot: p.shot, what: `the hero face at y ${Math.round(centre(big.box)[1])} (above ${L.faceTop})`});
  }
  // the value: the biggest hero eye a body shot holds (the median over the shot, so a dive passing through does not count)
  const heroMax = Math.max(0, ...Object.values(perShot).map((ws) => ws.sort((a, b) => a - b)[ws.length >> 1]));
  res('L9', 'Organ eye 110-190 px, face above y 800', l9, {partial: anyShim, value: Math.round(heroMax), measured: all('eye').length > 0, minDur: 0.5}); // held, not a dive passing through

  // L10 gaze: the listener looks at the speaker (pupils toward them), after the hook line
  const l10 = [];
  let gazeLines = 0;
  const firstLine = log.lines[0]?.id;
  for (const line of log.lines) {
    if (line.id === firstLine) continue;
    const ps = story.filter((p) => p.line === line.id && p.speaker === line.who);
    if (!ps.length) continue;
    const off = new Map(); const seen = new Map();
    for (const p of ps) {
      const sp = p.items.find((i) => i.kind === 'face' && i.who === line.who);
      if (!sp) continue;
      for (const f of p.items.filter((i) => i.kind === 'face' && i.who && i.who !== line.who && i.dir)) {
        seen.set(f.who, (seen.get(f.who) ?? 0) + 1);
        const to = [centre(sp.box)[0] - centre(f.box)[0], centre(sp.box)[1] - centre(f.box)[1]];
        const mag = Math.hypot(f.dir[0], f.dir[1]);
        const ang = mag < 0.15 ? 180 : Math.abs(((Math.atan2(f.dir[1], f.dir[0]) - Math.atan2(to[1], to[0])) * 180) / Math.PI);
        const a = ang > 180 ? 360 - ang : ang;
        if (a > L.gazeDeg) off.set(f.who, (off.get(f.who) ?? 0) + 1);
      }
    }
    for (const [who, n] of seen) {
      gazeLines++;
      const k = (off.get(who) ?? 0) / n;
      if (k > L.gazeShare) l10.push({t: ps[0].t, shot: ps[0].shot, what: `line ${line.id}: ${who} looks away from ${line.who} (${Math.round(k * 100)}% of the line${k === 1 ? ', at the lens' : ''})`});
    }
  }
  res('L10', 'Listeners look at the speaker', l10, {partial: anyShim, measured: gazeLines > 0, value: l10.length, limit: 0, note: gazeLines ? `${gazeLines} listener-lines measured` : 'no line with two named faces yet'});

  // L11 hands of different people closer than 30 px for more than 3 frames
  const l11 = [];
  let run = new Map();
  for (const p of story) {
    const hs = p.items.filter((i) => i.kind === 'hand' && i.who);
    const now = new Set();
    for (let a = 0; a < hs.length; a++) for (let b = a + 1; b < hs.length; b++) {
      if (hs[a].who === hs[b].who) continue;
      const gap = dist(centre(hs[a].box), centre(hs[b].box)) - radius(hs[a].box) - radius(hs[b].box);
      if (gap < L.hands) { const k = [hs[a].who, hs[b].who].sort().join('+'); now.add(k); run.set(k, (run.get(k) ?? 0) + 1); if (run.get(k) === L.handFrames + 1) l11.push({t: p.t, shot: p.shot, what: `${k.replace('+', "'s and ")}'s hands touch`}); }
    }
    for (const k of [...run.keys()]) if (!now.has(k)) run.delete(k);
  }
  res('L11', "Hands never on another person's hands", l11, {partial: anyShim});

  // L12 thought bubbles: a trail to their owner, never on a wall item
  const l12 = [];
  for (const p of story) for (const b of p.items.filter((i) => i.kind === 'bubble')) {
    if (!b.tip) l12.push({t: p.t, shot: p.shot, what: 'a bubble without its trail'});
    const wall = p.items.find((i) => i.kind === 'wallItem' && inter(i.box, b.box) > 0.1 * G.area(i.box));
    if (wall) l12.push({t: p.t, shot: p.shot, what: 'a bubble on a wall item'});
  }
  res('L12', 'Bubbles keep their trail, off wall items', l12, {note: all('bubble').length ? undefined : 'no bubbles on screen'});
  res('L13', 'The cover frame is clean', [], {measured: false, note: 'measured by toon-package when it picks the cover (phase 6)'});
  res('L14', 'The symptom shows on the patient', [], {measured: false, note: 'needs the rig\'s `mark` (phase 2) and a `symptom` event'});
  return {checks: R, ok: R.every((c) => c.status !== 'fail'), shimmed: anyShim};
};
