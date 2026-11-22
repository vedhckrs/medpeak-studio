#!/usr/bin/env node
/**
 * Body motion check: measures every person's joints on every frame of a Toon and lists anything
 * that would look like a jump (free, a second or two per script).
 *
 *   node --import tsx pipeline/toon-motion.mjs <slug>     (or: npm run toon:motion -- <slug>)
 *   node --import tsx pipeline/toon-motion.mjs --all
 *
 * Look v8 videos (engine v9, 2026-11-23): the checks M1, M3-M5 on the LAYOUT LOG (heads and hands of people and body
 * characters as the real tree drew them; pipeline/lib/toon-layout.mjs). M2 is measured on the picture (npm run toon:look).
 * The old engine's videos keep the old check (src/toons/Player.tsx `bodiesAt`).
 *
 * Exit code 1 when a check fails.
 */
import {isV8, layoutOf} from './lib/toon-layout.mjs'; // first: it prepares the JSX runtime for the layout probe
import fs from 'node:fs';
import path from 'node:path';
import {args, readJson, VIDEOS, videoDir} from './lib/util.mjs';
import {LIMITS, scanLayoutMotion, scanMotion} from './lib/toon-motion.mjs';
import {printChecks} from './lib/toon-geom.mjs';

const a = args();
const slugs = a.all ? fs.readdirSync(VIDEOS).filter((d) => fs.existsSync(path.join(VIDEOS, d, 'toon.json'))) : a._;
if (!slugs.length) { console.error('Give a slug or --all.'); process.exit(2); }
let ok = true;
for (const slug of slugs) {
  const toon = readJson(path.join(videoDir(slug), 'toon.json'));
  if (await isV8(slug)) {
    const log = await layoutOf(slug, {fresh: !!a.fresh});
    const r = scanLayoutMotion(log);
    printChecks(`MOTION (layout log)  ${toon.title}  (${log.probes.length} probes)`, r.checks);
    ok &&= r.ok;
    continue;
  }
  const stored = readJson(path.join(videoDir(slug), 'toon-timings.json'), null);
  const voiced = stored && toon.shots.every((s) => (s.lines ?? []).every((l) => stored.lines[l.id]?.text === l.text));
  const r = await scanMotion(toon, voiced ? stored : null);
  console.log(`\nMOTION  ${toon.title}  (${voiced ? 'voiced' : 'estimated'} ${r.seconds.toFixed(1)} s; ${r.people.join(', ') || 'no people'})`);
  console.log(`  fastest in one frame while standing: feet ${r.worst.foot.toFixed(2)} px (limit ${LIMITS.foot}), hips and knees ${r.worst.leg.toFixed(1)} px (limit ${LIMITS.leg}), hands and elbows ${r.worst.arm.toFixed(0)} px (limit ${LIMITS.arm})`);
  for (const [label, rows] of [['foot slides', r.slides], ['leg jumps', r.legJumps], ['arm jumps', r.armJumps], ['pops', r.pops]]) {
    console.log(`  ${rows.length ? 'FAIL' : 'PASS'}  ${label.padEnd(14)} ${rows.length}`);
    for (const row of rows.slice(0, 10)) console.log(`        ${row}`);
  }
  ok &&= r.ok;
}
console.log(ok ? '\nALL PASS' : '\nFAILED: a body jumps or acts while it should hold; fix the rig or the acting.');
process.exit(ok ? 0 : 1);
