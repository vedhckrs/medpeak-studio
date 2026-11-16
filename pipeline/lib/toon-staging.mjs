// Checks where every graphic sits in every scene of a Toon, the way the player will draw it, and
// reports what a viewer would see as a mistake of staging (owner, 2026-11-16: "this bubble comes
// [over the] doctor face"):
//   - a graphic (bubble, tag, sign, object) that covers part of a character's head,
//   - a graphic that leaves the picture or sits under the app's own buttons at the top,
//   - two graphics on screen at the same time that sit on top of each other,
//   - a graphic on the line where the caption is written,
//   - something on a room's wall (chart, clock, picture, mirror) that ends up behind a head.
// Furniture is not checked: people stand in front of a desk or a bed on purpose. In the first three
// scripts a graphic may cover what hangs on the wall; from the second script format on ("format": 2)
// a graphic must stay on plain wall (not more than 10% of the chart or mirror under it).
// Needs the tsx loader (the player is a .tsx file):  node --import tsx pipeline/toon-staging.mjs <slug>
import {captionBox, layoutToon, propFrames, propReach, stateAt, TOON_FPS} from '../../src/toons/director.ts';

/** How much of a head a graphic may touch (its outline brushing the hair is fine; covering is not). */
export const LIMITS = {head: 0.04, pair: 0.3, top: 110, sides: 8, caption: 0.02, wall: 0.15, onWall: 0.1};

const boxOf = (p, spot) => { const u = p.size / 200; const [l, up, r, dn] = propReach(p).map((v) => v * u); return {x0: spot.x - l, x1: spot.x + r, y0: spot.y - up, y1: spot.y + dn}; };
const overlap = (a, b) => Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) * Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));
const area = (b) => (b.x1 - b.x0) * (b.y1 - b.y0);
const name = (p) => `${p.bubble ? 'bubble with ' : ''}${p.kind}${p.text ? ` "${p.text}"` : ''}`;

export const scanStaging = async (toon, timings, opts = {}) => {
  const {headBox, headSeen, propSpot} = await import('../../src/toons/Player.tsx');
  const {wallItems} = await import('../../src/toons/rooms.tsx');
  const cap = captionBox(toon.camera === 'steady');
  const L = layoutToon(toon, timings);
  const out = {graphics: 0, wallItems: 0, onHeads: [], outside: [], stacked: [], onCaption: [], hidden: [], onWall: []};
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
    for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
      const a = items[i];
      const b = items[j];
      if (Math.min(a.to, b.to) - Math.max(a.from, b.from) < 6) continue; // not on screen together
      if (a.p.on === 'bubble' || b.p.on === 'bubble') continue; // a mark on the picture inside a bubble
      const part = overlap(a.box, b.box) / Math.min(area(a.box), area(b.box));
      if (part > LIMITS.pair) out.stacked.push(`${(Math.max(a.from, b.from) / TOON_FPS).toFixed(1)} s, scene ${shot.id}: the ${name(a.p)} and the ${name(b.p)} overlap by ${Math.round(part * 100)}%`);
    }
  });
  // what hangs on a room's wall, against the heads of everyone who stands in that room
  toon.shots.forEach((shot) => {
    const look = (shot.set === 'clinic' || shot.set === 'home') && toon.rooms?.[shot.set];
    if (!look) return;
    const heads = (shot.cast ?? []).filter((a) => !a.stage).map((a) => headSeen(a, shot.set)).filter(Boolean);
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
  out.ok = !out.onHeads.length && !out.outside.length && !out.stacked.length && !out.onCaption.length && !out.hidden.length && !out.onWall.length;
  return out;
};
