#!/usr/bin/env node
/**
 * Staging check: where every bubble, tag, sign and object sits, measured against every face, the
 * caption line and the picture's edges; and what hangs on a room's wall against the heads in front.
 *
 *   node --import tsx pipeline/toon-staging.mjs <slug>     (or: npm run toon:staging -- <slug>)
 *   node --import tsx pipeline/toon-staging.mjs --all
 *
 * Exit code 1 when a graphic covers a head, leaves the picture, sits on another graphic or on the
 * caption line, or when a wall chart, clock or picture is behind a head.
 */
import fs from 'node:fs';
import path from 'node:path';
import {args, readJson, VIDEOS, videoDir} from './lib/util.mjs';
import {scanStaging} from './lib/toon-staging.mjs';

const a = args();
const slugs = a.all ? fs.readdirSync(VIDEOS).filter((d) => fs.existsSync(path.join(VIDEOS, d, 'toon.json'))) : a._;
if (!slugs.length) { console.error('Give a slug or --all.'); process.exit(2); }
let ok = true;
for (const slug of slugs) {
  const toon = readJson(path.join(videoDir(slug), 'toon.json'));
  const stored = readJson(path.join(videoDir(slug), 'toon-timings.json'), null);
  const voiced = stored && toon.shots.every((s) => (s.lines ?? []).every((l) => stored.lines[l.id]?.text === l.text));
  const r = await scanStaging(toon, voiced ? stored : null);
  console.log(`\nSTAGING  ${toon.title}  (${r.graphics} graphics, ${r.wallItems} things on walls)`);
  for (const [label, rows] of [['on a head', r.onHeads], ['out of the picture', r.outside], ['on each other', r.stacked], ['on the caption line', r.onCaption], ['wall behind a head', r.hidden], ['on the wall chart', r.onWall]]) {
    console.log(`  ${rows.length ? 'FAIL' : 'PASS'}  ${label.padEnd(20)} ${rows.length}`);
    for (const row of rows.slice(0, 14)) console.log(`        ${row}`);
  }
  ok &&= r.ok;
}
console.log(ok ? '\nALL PASS' : '\nFAILED: move the graphic (a thought bubble takes "of": "<who>" and places itself); a wall item behind a head is fixed in src/toons/rooms.tsx (wallItems).');
process.exit(ok ? 0 : 1);
