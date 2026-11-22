// Small geometry for the layout checks (boxes are [x0, y0, x1, y1] in screen pixels, 1080 x 1920).
export const W = 1080, H = 1920;
export const area = (b) => Math.max(0, b[2] - b[0]) * Math.max(0, b[3] - b[1]);
export const inter = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));
export const pad = (b, p) => [b[0] - p, b[1] - p, b[2] + p, b[3] + p];
export const centre = (b) => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
export const radius = (b) => Math.min(b[2] - b[0], b[3] - b[1]) / 2;
export const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
/** How much of a box is inside the screen, 0..1. */
export const insideShare = (b) => (area(b) > 0 ? inter(b, [0, 0, W, H]) / area(b) : 1);
export const contains = (b, p) => p[0] >= b[0] && p[0] <= b[2] && p[1] >= b[1] && p[1] <= b[3];
/** The character an item belongs to: its `who`, else the figure (a Put) it is drawn in, else nobody. */
export const ownerOf = (it) => it.who ?? (it.body ? `#${it.body}` : null);
/** Two items belong to the same character (a face and its own hand or body). */
export const sameOwner = (a, b) => {
  const oa = ownerOf(a), ob = ownerOf(b);
  return !!(oa && ob && oa === ob);
};
/** Group the probe times where a fault was seen into episodes: [{from, to, n, what}] (a gap over `gap` s starts a new one). */
export const episodes = (hits, gap = 0.25) => {
  const byWhat = new Map();
  for (const h of hits) { const l = byWhat.get(h.what) ?? []; l.push(h); byWhat.set(h.what, l); }
  const out = [];
  for (const [what, list] of byWhat) {
    list.sort((a, b) => a.t - b.t);
    let cur = null;
    for (const h of list) {
      if (cur && h.t - cur.to <= gap) { cur.to = h.t; cur.n++; } else { cur = {what, from: h.t, to: h.t, n: 1, shot: h.shot}; out.push(cur); }
    }
  }
  return out.sort((a, b) => a.from - b.from);
};
export const fmt = (s) => `${s.toFixed(1)} s`;
/** Print a list of check results ({id, name, status, value, rows, partial, note}) the way every Toons check prints. */
export const printChecks = (title, checks, maxRows = 8) => {
  console.log(`\n${title}`);
  for (const c of checks) {
    const st = c.status === 'pass' ? 'PASS' : c.status === 'fail' ? 'FAIL' : 'n/m ';
    console.log(`  ${st}  ${c.id.padEnd(4)} ${c.name.padEnd(44)} ${c.episodes ?? c.value ?? ''}${c.partial ? '  (estimated boxes)' : ''}${c.note ? `  ${c.note}` : ''}`);
    for (const r of (c.rows ?? []).slice(0, maxRows)) console.log(`          ${r}`);
    if ((c.rows ?? []).length > maxRows) console.log(`          ... and ${c.rows.length - maxRows} more`);
  }
};
