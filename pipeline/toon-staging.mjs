#!/usr/bin/env node
/**
 * Staging check: where every bubble, tag, sign and object sits, measured against every face, the
 * caption line and the picture's edges; and what hangs on a room's wall against the heads in front.
 *
 *   node --import tsx pipeline/toon-staging.mjs <slug>     (or: npm run toon:staging -- <slug>)
 *   node --import tsx pipeline/toon-staging.mjs --all
 *
 * Look v8 videos (engine v9, 2026-11-23): the checks L1-L14 on the LAYOUT LOG, what the real component tree drew
 * (pipeline/lib/toon-layout.mjs writes videos/<slug>/renders/layout.json; `--fresh` probes again). The old engine's
 * videos keep the old check (it reads src/toons/Player.tsx, rooms.tsx, stages.tsx and the script).
 *
 * Exit code 1 when a check fails.
 */
import {isV8, layoutOf} from './lib/toon-layout.mjs'; // first: it prepares the JSX runtime for the layout probe
import fs from 'node:fs';
import path from 'node:path';
import {args, readJson, VIDEOS, videoDir} from './lib/util.mjs';
import {scanLayout, scanStaging} from './lib/toon-staging.mjs';
import {printChecks} from './lib/toon-geom.mjs';

const a = args();
const slugs = a.all ? fs.readdirSync(VIDEOS).filter((d) => fs.existsSync(path.join(VIDEOS, d, 'toon.json'))) : a._;
if (!slugs.length) { console.error('Give a slug or --all.'); process.exit(2); }
let ok = true;
for (const slug of slugs) {
  const toon = readJson(path.join(videoDir(slug), 'toon.json'));
  if (await isV8(slug)) {
    const log = await layoutOf(slug, {fresh: !!a.fresh});
    const r = scanLayout(log);
    printChecks(`STAGING (layout log)  ${toon.title}  (${log.probes.length} probes, ${log.voiced ? 'voiced' : 'estimated'} ${log.story.toFixed(1)} s)`, r.checks);
    if (r.shimmed) console.log('  note  some boxes are estimated by the probe from the components\' props until they report themselves (07-layout-log-wiring.md)');
    ok &&= r.ok;
    continue;
  }
  const stored = readJson(path.join(videoDir(slug), 'toon-timings.json'), null);
  const voiced = stored && toon.shots.every((s) => (s.lines ?? []).every((l) => stored.lines[l.id]?.text === l.text));
  const r = await scanStaging(toon, voiced ? stored : null);
  console.log(`\nSTAGING  ${toon.title}  (${r.graphics} graphics, ${r.wallItems} things on walls, ${r.things} pieces of furniture)`);
  for (const [label, rows] of [['on a head', r.onHeads], ['out of the picture', r.outside], ['on each other', r.stacked], ['on the caption line', r.onCaption], ['wall behind a head', r.hidden], ['on the wall chart', r.onWall], ['half hidden by a person', r.halfHidden], ['on a body stage\'s face', r.onStageFace]]) {
    console.log(`  ${rows.length ? 'FAIL' : 'PASS'}  ${label.padEnd(20)} ${rows.length}`);
    for (const row of rows.slice(0, 14)) console.log(`        ${row}`);
  }
  if (r.stagesNotMeasured.length) console.log(`  note  stage contents not measured  ${r.stagesNotMeasured.join(', ')} (only the stomach stage reports where its contents are)`);
  if (r.leftOut.length) console.log(`  note  left out of the room         ${r.leftOut.join('; ')}`);
  ok &&= r.ok;
}
console.log(ok ? '\nALL PASS' : '\nFAILED: move the graphic or the face (v8: see the rows above; old engine: a thought bubble takes "of": "<who>", a wall item behind a head is fixed in src/toons/rooms.tsx).');
process.exit(ok ? 0 : 1);
