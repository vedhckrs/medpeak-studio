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
