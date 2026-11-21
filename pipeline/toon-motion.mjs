#!/usr/bin/env node
/**
 * Body motion check: measures every person's joints on every frame of a Toon and lists anything
 * that would look like a jump (free, a second or two per script).
 *
 *   node --import tsx pipeline/toon-motion.mjs <slug>     (or: npm run toon:motion -- <slug>)
 *   node --import tsx pipeline/toon-motion.mjs --all
 *
 * Exit code 1 when a foot slides, a leg or an arm jumps, or a joint pops.
 */
import fs from 'node:fs';
import path from 'node:path';
import {args, readJson, VIDEOS, videoDir} from './lib/util.mjs';
import {LIMITS, scanMotion} from './lib/toon-motion.mjs';

const a = args();
const slugs = a.all ? fs.readdirSync(VIDEOS).filter((d) => fs.existsSync(path.join(VIDEOS, d, 'toon.json'))) : a._;
if (!slugs.length) { console.error('Give a slug or --all.'); process.exit(2); }
let ok = true;
for (const slug of slugs) {
  const toon = readJson(path.join(videoDir(slug), 'toon.json'));
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
console.log(ok ? '\nALL PASS' : '\nFAILED: a body jumps; fix the rig or the acting.');
process.exit(ok ? 0 : 1);
